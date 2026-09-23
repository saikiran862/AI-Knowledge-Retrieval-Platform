"""
Documents Management API Endpoints
Provides listing, inspection, and deletion of indexed documents.
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.repository import DocumentRepository, ChunkRepository
from app.models.schemas import DocumentResponse
from app.retrieval.vector_store import vector_store

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    """
    Returns list of all documents in the knowledge base.
    """
    docs = DocumentRepository.list_documents(db)
    return [
        DocumentResponse(
            document_id=d.document_id,
            file_name=d.file_name,
            file_type=d.file_type,
            total_chunks=d.total_chunks,
            upload_date=d.upload_date.isoformat() if d.upload_date else "",
            status=d.status,
            file_size_bytes=d.file_size_bytes
        )
        for d in docs
    ]


@router.delete("/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    """
    Deletes a document from SQLite and cleans its chunks from FAISS vector index.
    """
    doc = DocumentRepository.get_document(db, document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found."
        )

    # 1. Delete from FAISS vector index
    vector_store.delete_document_chunks(document_id)

    # 2. Delete from SQLite DB
    success = DocumentRepository.delete_document(db, document_id)

    return {
        "status": "success",
        "message": f"Document '{doc.file_name}' ({document_id}) and associated chunks deleted successfully."
    }


@router.get("/{document_id}/chunks")
def get_document_chunks(document_id: str, db: Session = Depends(get_db)):
    """
    Retrieves all chunk fragments for a given document.
    """
    chunks = ChunkRepository.get_chunks_by_document(db, document_id)
    return [
        {
            "chunk_id": c.chunk_id,
            "chunk_index": c.chunk_index,
            "page_number": c.page_number,
            "text": c.text,
            "embedding_model": c.embedding_model
        }
        for c in chunks
    ]
