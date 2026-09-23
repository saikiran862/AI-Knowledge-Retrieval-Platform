"""
Document Ingestion Pipeline
Executes the exact 8-step pipeline from file upload to vector index & metadata readiness.
"""

import uuid
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

try:
    from sqlalchemy.orm import Session
except ImportError:
    Session = Any  # type: ignore

from app.config.settings import settings
from app.models.schemas import DocumentCreate, ChunkModel
from app.database.repository import DocumentRepository, ChunkRepository
from app.ingestion.pdf_loader import extract_text_from_pdf
from app.ingestion.docx_loader import extract_text_from_docx
from app.ingestion.txt_loader import extract_text_from_txt
from app.ingestion.csv_loader import extract_text_from_csv
from app.ingestion.cleaner import clean_and_normalize_text
from app.ingestion.chunker import DocumentChunker
from app.ingestion.embedder import embedding_service
from app.retrieval.vector_store import vector_store

logger = logging.getLogger(__name__)


class IngestionPipeline:
    """
    Coordinates end-to-end ingestion lifecycle for uploaded files.
    """

    def __init__(self):
        self.chunker = DocumentChunker()

    def validate_file(self, filename: str, file_bytes: bytes) -> str:
        """
        Step 1 & 2: Validates file extension, non-empty content, and max size.
        Returns normalized file extension.
        """
        if not file_bytes or len(file_bytes) == 0:
            raise ValueError(f"Uploaded file '{filename}' is empty.")

        if len(file_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise ValueError(f"File size exceeds maximum allowed threshold ({settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB).")

        ext = Path(filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file format '{ext}'. Supported formats: PDF, DOCX, TXT, CSV.")

        return ext

    def extract_text(self, file_bytes: bytes, filename: str, ext: str) -> List[Dict[str, Any]]:
        """
        Step 3: Extracts page-indexed text based on file format.
        """
        if ext == ".pdf":
            return extract_text_from_pdf(file_bytes, filename)
        elif ext == ".docx":
            return extract_text_from_docx(file_bytes, filename)
        elif ext == ".txt":
            return extract_text_from_txt(file_bytes, filename)
        elif ext == ".csv":
            return extract_text_from_csv(file_bytes, filename)
        else:
            raise ValueError(f"No extractor available for extension {ext}")

    def clean_extracted_pages(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Step 4 & 5: Cleans and normalizes text for each page.
        """
        cleaned_pages = []
        for p in pages:
            cleaned_text = clean_and_normalize_text(p.get("text", ""))
            if cleaned_text:
                cleaned_pages.append({
                    "page": p.get("page", 1),
                    "text": cleaned_text
                })
        return cleaned_pages

    def process_document(
        self,
        file_bytes: bytes,
        filename: str,
        db: Session,
        document_id: str = None
    ) -> Dict[str, Any]:
        """
        Executes complete ingestion pipeline:
        1. Validation
        2. Extraction
        3. Cleaning & Normalization
        4. Chunking
        5. Embedding Generation
        6. Vector Store Indexing
        7. Metadata DB Storage
        """
        logger.info(f"Initiating ingestion for file: {filename}")

        # Step 1: Validation
        ext = self.validate_file(filename, file_bytes)

        if not document_id:
            document_id = f"DOC_{uuid.uuid4().hex[:8].upper()}"

        # Step 2: Text Extraction
        raw_pages = self.extract_text(file_bytes, filename, ext)
        if not raw_pages or not any(p.get("text", "").strip() for p in raw_pages):
            raise ValueError(f"Could not extract readable text from '{filename}'. The file may be empty or corrupted.")

        # Step 3: Text Cleaning & Normalization
        cleaned_pages = self.clean_extracted_pages(raw_pages)
        if not cleaned_pages:
            raise ValueError(f"Text content in '{filename}' was empty after normalization.")

        # Step 4: Chunking
        chunks = self.chunker.chunk_document_pages(
            pages_data=cleaned_pages,
            document_id=document_id,
            source_file=filename,
            metadata={"file_type": ext.replace(".", "")}
        )

        if not chunks:
            raise ValueError(f"No valid chunks could be created from '{filename}'.")

        # Step 5: Embedding Generation
        chunk_texts = [c.text for c in chunks]
        embeddings = embedding_service.embed_texts(chunk_texts)

        # Step 6: Vector Store Indexing
        vector_store.add_chunks(chunks, embeddings)

        # Step 7: SQLite Metadata Storage
        doc_record = DocumentCreate(
            document_id=document_id,
            file_name=filename,
            file_type=ext.replace(".", ""),
            total_chunks=len(chunks),
            file_size_bytes=len(file_bytes),
            status="processed"
        )
        DocumentRepository.create_document(db, doc_record)
        ChunkRepository.save_chunks(db, chunks)

        logger.info(f"Ingestion successful for {filename}: {len(chunks)} chunks indexed.")

        return {
            "document_id": document_id,
            "file_name": filename,
            "file_type": ext.replace(".", ""),
            "chunks_created": len(chunks),
            "embeddings_generated": len(embeddings),
            "message": f"Successfully processed {filename}. {len(chunks)} chunks indexed."
        }


# Global pipeline instance
ingestion_pipeline = IngestionPipeline()
