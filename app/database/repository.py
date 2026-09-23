"""
Repository pattern layer for SQLite CRUD operations
"""

import json
from typing import List, Optional, Dict, Any

try:
    from sqlalchemy.orm import Session
except ImportError:
    Session = Any  # type: ignore
from .models import DocumentEntity, ChunkEntity, QueryEntity, ConversationTurnEntity
from app.models.schemas import DocumentCreate, ChunkModel


class DocumentRepository:
    @staticmethod
    def create_document(db: Session, doc: DocumentCreate) -> DocumentEntity:
        entity = DocumentEntity(
            document_id=doc.document_id,
            file_name=doc.file_name,
            file_type=doc.file_type,
            total_chunks=doc.total_chunks,
            status=doc.status,
            file_size_bytes=doc.file_size_bytes
        )
        db.add(entity)
        db.commit()
        db.refresh(entity)
        return entity

    @staticmethod
    def list_documents(db: Session) -> List[DocumentEntity]:
        return db.query(DocumentEntity).order_by(DocumentEntity.upload_date.desc()).all()

    @staticmethod
    def get_document(db: Session, document_id: str) -> Optional[DocumentEntity]:
        return db.query(DocumentEntity).filter(DocumentEntity.document_id == document_id).first()

    @staticmethod
    def delete_document(db: Session, document_id: str) -> bool:
        doc = db.query(DocumentEntity).filter(DocumentEntity.document_id == document_id).first()
        if doc:
            db.delete(doc)
            db.commit()
            return True
        return False

    @staticmethod
    def update_chunk_count(db: Session, document_id: str, count: int):
        doc = db.query(DocumentEntity).filter(DocumentEntity.document_id == document_id).first()
        if doc:
            doc.total_chunks = count
            db.commit()


class ChunkRepository:
    @staticmethod
    def save_chunks(db: Session, chunks: List[ChunkModel]):
        entities = [
            ChunkEntity(
                chunk_id=c.chunk_id,
                document_id=c.document_id,
                chunk_index=c.chunk_index,
                text=c.text,
                source_file=c.source_file,
                page_number=c.page_number,
                metadata_json=json.dumps(c.metadata),
                embedding_model=c.embedding_model
            )
            for c in chunks
        ]
        db.bulk_save_objects(entities)
        db.commit()

    @staticmethod
    def get_chunks_by_document(db: Session, document_id: str) -> List[ChunkEntity]:
        return db.query(ChunkEntity).filter(ChunkEntity.document_id == document_id).order_by(ChunkEntity.chunk_index).all()

    @staticmethod
    def get_total_chunk_count(db: Session) -> int:
        return db.query(ChunkEntity).count()


class ConversationRepository:
    @staticmethod
    def save_turn(
        db: Session,
        session_id: str,
        query_id: str,
        user_query: str,
        assistant_response: str,
        citations: List[Dict[str, Any]]
    ) -> ConversationTurnEntity:
        # Record query
        q = QueryEntity(query_id=query_id, session_id=session_id, query_text=user_query)
        db.add(q)

        # Record conversation turn
        turn = ConversationTurnEntity(
            session_id=session_id,
            query_id=query_id,
            user_query=user_query,
            assistant_response=assistant_response,
            citations_json=json.dumps(citations)
        )
        db.add(turn)
        db.commit()
        db.refresh(turn)
        return turn

    @staticmethod
    def get_recent_turns(db: Session, session_id: str, limit: int = 5) -> List[ConversationTurnEntity]:
        return (
            db.query(ConversationTurnEntity)
            .filter(ConversationTurnEntity.session_id == session_id)
            .order_by(ConversationTurnEntity.timestamp.desc())
            .limit(limit)
            .all()
        )
