"""
Configurable Document Chunking Subsystem
Implements sliding-window token/word chunking with boundary awareness and overlap.
"""

import math
import logging
from typing import List, Dict, Any, Optional
from app.config.settings import settings
from app.models.schemas import ChunkModel

logger = logging.getLogger(__name__)


class DocumentChunker:
    """
    Modular chunker supporting configurable token/word window sizing and overlap.
    """

    def __init__(
        self,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
        embedding_model: Optional[str] = None
    ):
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP
        self.embedding_model = embedding_model or settings.EMBEDDING_MODEL

        if self.chunk_overlap >= self.chunk_size:
            logger.warning("Chunk overlap cannot exceed chunk size. Defaulting overlap to chunk_size // 4")
            self.chunk_overlap = self.chunk_size // 4

    def chunk_document_pages(
        self,
        pages_data: List[Dict[str, Any]],
        document_id: str,
        source_file: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[ChunkModel]:
        """
        Splits extracted document pages into structured, indexed chunks.
        Preserves page number where chunk originated.
        """
        chunks: List[ChunkModel] = []
        global_chunk_index = 1
        meta = metadata or {}

        for page_info in pages_data:
            page_num = page_info.get("page", 1)
            raw_text = page_info.get("text", "").strip()

            if not raw_text:
                continue

            # Words approximation for tokens (1 token ≈ 0.75 words, so 500 tokens ≈ 375 words)
            target_words = int(self.chunk_size * 0.75)
            overlap_words = int(self.chunk_overlap * 0.75)
            step_size = max(1, target_words - overlap_words)

            words = raw_text.split()
            if len(words) <= target_words:
                chunk_id = f"{document_id}_CHUNK_{global_chunk_index:03d}"
                chunks.append(
                    ChunkModel(
                        chunk_id=chunk_id,
                        document_id=document_id,
                        chunk_index=global_chunk_index,
                        text=raw_text,
                        source_file=source_file,
                        page_number=page_num,
                        metadata=meta,
                        embedding_model=self.embedding_model
                    )
                )
                global_chunk_index += 1
            else:
                for start_idx in range(0, len(words), step_size):
                    end_idx = min(len(words), start_idx + target_words)
                    chunk_text = " ".join(words[start_idx:end_idx]).strip()

                    if chunk_text:
                        chunk_id = f"{document_id}_CHUNK_{global_chunk_index:03d}"
                        chunks.append(
                            ChunkModel(
                                chunk_id=chunk_id,
                                document_id=document_id,
                                chunk_index=global_chunk_index,
                                text=chunk_text,
                                source_file=source_file,
                                page_number=page_num,
                                metadata=meta,
                                embedding_model=self.embedding_model
                            )
                        )
                        global_chunk_index += 1

                    if end_idx >= len(words):
                        break

        logger.info(f"Generated {len(chunks)} chunks for {source_file} (doc_id: {document_id})")
        return chunks
