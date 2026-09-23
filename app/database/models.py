"""
SQLAlchemy ORM Database Models for Documents, Chunks, Queries, and Conversations
"""

from datetime import datetime

try:
    from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
    from sqlalchemy.orm import relationship
    HAVE_SQLALCHEMY = True
except ImportError:
    HAVE_SQLALCHEMY = False
    def Column(*args, **kwargs): return None
    def String(*args, **kwargs): return None
    def Integer(*args, **kwargs): return None
    def DateTime(*args, **kwargs): return None
    def Text(*args, **kwargs): return None
    def ForeignKey(*args, **kwargs): return None
    def relationship(*args, **kwargs): return None

from .database import Base


class DocumentEntity(Base):
    __tablename__ = "documents"

    document_id = Column(String(64), primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(16), nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    total_chunks = Column(Integer, default=0)
    status = Column(String(32), default="processed")
    file_size_bytes = Column(Integer, default=0)

    # Relationship to child chunks
    chunks = relationship("ChunkEntity", back_populates="document", cascade="all, delete-orphan")


class ChunkEntity(Base):
    __tablename__ = "chunks"

    chunk_id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), ForeignKey("documents.document_id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    source_file = Column(String(255), nullable=False)
    page_number = Column(Integer, nullable=True)
    metadata_json = Column(Text, default="{}")
    embedding_model = Column(String(64), default="all-MiniLM-L6-v2")

    document = relationship("DocumentEntity", back_populates="chunks")


class QueryEntity(Base):
    __tablename__ = "queries"

    query_id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), nullable=False, index=True)
    query_text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class ConversationTurnEntity(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(64), nullable=False, index=True)
    query_id = Column(String(64), nullable=False)
    user_query = Column(Text, nullable=False)
    assistant_response = Column(Text, nullable=False)
    citations_json = Column(Text, default="[]")
    timestamp = Column(DateTime, default=datetime.utcnow)
