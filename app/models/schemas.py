"""
Pydantic Data Models and Schemas for API Requests and Responses
Includes standard library fallback if pydantic is not installed.
"""

from typing import List, Optional, Dict, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    def Field(*args, **kwargs):
        if "default" in kwargs:
            return kwargs["default"]
        if "default_factory" in kwargs:
            try:
                return kwargs["default_factory"]()
            except Exception:
                return None
        if len(args) > 0 and args[0] is not ...:
            return args[0]
        return None

    class BaseModel:
        def __init__(self, **kwargs):
            # initialize class attribute defaults
            for cls in reversed(self.__class__.__mro__):
                for k, v in cls.__dict__.items():
                    if not k.startswith("_") and not callable(v):
                        setattr(self, k, v)
            for k, v in kwargs.items():
                setattr(self, k, v)

        def dict(self):
            return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

        def model_dump(self):
            return self.dict()


# ---------------- Document Models ----------------

class DocumentBase(BaseModel):
    document_id: str = Field(default="", description="Unique document ID, e.g. DOC001")
    file_name: str = Field(default="", description="Original filename")
    file_type: str = Field(default="", description="File extension: pdf, docx, txt, csv")
    total_chunks: int = Field(default=0, description="Total chunks extracted")


class DocumentCreate(DocumentBase):
    file_size_bytes: int = 0
    status: str = "processed"


class DocumentResponse(DocumentBase):
    upload_date: str = ""
    status: str = "processed"
    file_size_bytes: int = 0


# ---------------- Chunk Models ----------------

class ChunkModel(BaseModel):
    chunk_id: str = Field(default="", description="Unique chunk identifier, e.g. DOC001_CHUNK_001")
    document_id: str = Field(default="", description="Parent document identifier")
    chunk_index: int = Field(default=0, description="Sequence index within document")
    text: str = Field(default="", description="Extracted chunk text content")
    source_file: str = Field(default="", description="Source filename")
    page_number: Optional[int] = Field(default=None, description="Page number if applicable")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Custom metadata attributes")
    embedding_model: str = Field(default="all-MiniLM-L6-v2", description="Embedding model used")


# ---------------- Query & Retrieval Models ----------------

class QueryRequest(BaseModel):
    query_text: str = Field(default="", description="Natural language question from user")
    session_id: Optional[str] = Field(default="default_session", description="Conversation session ID")
    top_k: int = Field(default=3, description="Number of chunks to retrieve")
    threshold: Optional[float] = Field(default=None, description="Optional custom similarity cutoff")


class RetrievalResult(BaseModel):
    query_id: str = ""
    chunk_id: str = ""
    document_id: str = ""
    source_file: str = ""
    page_number: Optional[int] = None
    score: float = Field(default=0.0, description="Cosine similarity score (0.0 to 1.0)")
    rank: int = Field(default=1, description="Rank position")
    text_snippet: str = Field(default="", description="Content of chunk")


class Citation(BaseModel):
    document_name: str = ""
    page_number: Optional[int] = None
    chunk_id: str = ""
    similarity_score: float = 0.0
    excerpt: Optional[str] = None


class AgentTraceStep(BaseModel):
    agent_name: str = ""
    action: str = ""
    output_summary: str = ""
    details: Dict[str, Any] = Field(default_factory=dict)


class QueryResponse(BaseModel):
    query_id: str = ""
    session_id: str = ""
    query_text: str = ""
    answer: str = ""
    sources: List[Citation] = Field(default_factory=list)
    confidence: str = Field(default="Medium confidence", description="High confidence | Medium confidence | Low confidence")
    raw_confidence_score: float = Field(default=0.0, description="Max similarity score among retrieved chunks")
    needs_clarification: bool = False
    clarification_options: List[str] = Field(default_factory=list)
    agent_trace: List[AgentTraceStep] = Field(default_factory=list)


# ---------------- Vector Store Status ----------------

class VectorStoreStatus(BaseModel):
    total_chunks: int = 0
    total_documents: int = 0
    embedding_model: str = ""
    embedding_dimension: int = 384
    index_type: str = "FAISS_IndexFlatIP"
    index_file_exists: bool = False
    status: str = "ready"
