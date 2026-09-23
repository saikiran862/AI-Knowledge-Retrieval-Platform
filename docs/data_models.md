# Data Models & Schemas Specification

**Project Title:** Development of AI-Based Knowledge Retrieval Platform with Query Resolution System  
**Internship Program:** Infosys Springboard Internship – Batch 3  
**Document Code:** M1.3-DATA-MODELS  

---

## 1. Pydantic Core Schemas

### 1.1 Document Model
Represents an uploaded knowledge base file.
```python
class DocumentModel(BaseModel):
    document_id: str = Field(description="Unique document identifier, e.g. DOC001")
    file_name: str = Field(description="Original uploaded filename, e.g. employee_handbook.pdf")
    file_type: str = Field(description="Normalized file extension: pdf, docx, txt, csv")
    upload_date: str = Field(description="ISO-8601 upload timestamp")
    total_chunks: int = Field(default=0, description="Total chunks extracted from file")
    status: str = Field(default="processed", description="Status: pending, processed, failed")
    file_size_bytes: int = Field(default=0, description="Size in bytes")
```

### 1.2 Chunk Model
Represents an individual text chunk derived from a document.
```python
class ChunkModel(BaseModel):
    chunk_id: str = Field(description="Unique chunk identifier, e.g. DOC001_CHUNK_001")
    document_id: str = Field(description="Foreign key pointing to DocumentModel.document_id")
    chunk_index: int = Field(description="Zero-based or 1-based order index within document")
    text: str = Field(description="Extracted and normalized chunk text content")
    source_file: str = Field(description="Filename of the origin document")
    page_number: Optional[int] = Field(default=None, description="1-based page number where available")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Custom metadata tags")
    embedding_model: str = Field(default="all-MiniLM-L6-v2", description="Embedding model identifier")
```

### 1.3 Query Request & Retrieval Result Model
```python
class QueryRequest(BaseModel):
    query_text: str = Field(..., min_length=1, description="Natural language question from user")
    session_id: Optional[str] = Field(default="default_session", description="Conversation session ID")
    top_k: int = Field(default=3, ge=1, le=10, description="Number of chunks to retrieve")
    threshold: Optional[float] = Field(default=0.40, ge=0.0, le=1.0, description="Similarity cutoff")

class RetrievalResultItem(BaseModel):
    query_id: str
    chunk_id: str
    document_id: str
    source_file: str
    page_number: Optional[int] = None
    score: float = Field(description="Cosine similarity score between 0.0 and 1.0")
    rank: int = Field(description="1-based ranking index among retrieved chunks")
    text_snippet: str = Field(description="Preview or full text of the chunk")
```

### 1.4 Response Model
```python
class Citation(BaseModel):
    document_name: str
    page_number: Optional[int] = None
    chunk_id: str
    similarity_score: float

class QueryResponse(BaseModel):
    query_id: str
    session_id: str
    query_text: str
    answer: str
    sources: List[Citation] = Field(default_factory=list)
    confidence: str = Field(description="High confidence, Medium confidence, or Low confidence")
    raw_confidence_score: float = Field(description="Max cosine similarity score of supporting context")
    needs_clarification: bool = False
    clarification_options: List[str] = Field(default_factory=list)
    agent_trace: Dict[str, Any] = Field(default_factory=dict, description="Audit trace of the 5 agents")
```

---

## 2. Database Schema (SQLite / SQLAlchemy)

The metadata storage maintains four relational tables:

```sql
-- 1. Documents Table
CREATE TABLE documents (
    document_id VARCHAR(64) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(16) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_chunks INTEGER DEFAULT 0,
    status VARCHAR(32) DEFAULT 'processed',
    file_size_bytes INTEGER DEFAULT 0
);

-- 2. Chunks Table
CREATE TABLE chunks (
    chunk_id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    text TEXT NOT NULL,
    source_file VARCHAR(255) NOT NULL,
    page_number INTEGER,
    metadata_json TEXT,
    embedding_model VARCHAR(64)
);

-- 3. Queries Table
CREATE TABLE queries (
    query_id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    query_text TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Conversation History Table
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(64) NOT NULL,
    query_id VARCHAR(64) NOT NULL REFERENCES queries(query_id),
    user_query TEXT NOT NULL,
    assistant_response TEXT NOT NULL,
    citations_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
