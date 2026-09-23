# System Architecture Specification

**Project Title:** Development of AI-Based Knowledge Retrieval Platform with Query Resolution System  
**Internship Program:** Infosys Springboard Internship – Batch 3  
**Document Code:** M1.2-SYS-ARCH  

---

## 1. High-Level Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER (UI)                                         |
|  - Modern Dashboard: Drag-and-Drop Ingestion (PDF, DOCX, TXT, CSV)                                |
|  - Conversational Query Console & Multi-Agent Step Timeline                                        |
|  - Grounded Answer & Source Citations Display                                                      |
|  - Web Speech API: Voice-to-Text [Mic] & Text-to-Speech [Speaker]                                  |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  | HTTP / REST (JSON)
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                      API LAYER (FastAPI)                                           |
|  /api/health       /api/upload      /api/documents      /api/query      /api/vector-store          |
+----------------------------------------------------------------------------------------------------+
          |                                                             |
          v                                                             v
+-----------------------------------------+   +------------------------------------------------------+
|       DOCUMENT INGESTION SUBSYSTEM      |   |            MULTI-AGENT ORCHESTRATION ENGINE          |
|                                         |   |                                                      |
|  1. File Validation (MIME & Size)       |   |                     [User Query]                     |
|  2. Loaders (PyMuPDF, docx, txt, pandas)|   |                          |                           |
|  3. Text Cleaning & Normalization       |   |              1. Query Understanding Agent            |
|  4. Sliding-Window Chunker              |   |                     (Intent, Ambiguity)              |
|  5. Embedding Generator (all-MiniLM)    |   |                    /                    \            |
|  6. FAISS Vector Indexing               |   |            [Ambiguous?]             [Clear]          |
|  7. SQLite Metadata Persistence         |   |                 /                         \          |
+-----------------------------------------+   |      2. Clarification Agent       3. Retrieval Agent |
                      |                       |                 |                 (FAISS Top-K Search|
                      v                       |                 |                   + Score Gating)  |
+-----------------------------------------+   |                 |                          |         |
|             STORAGE LAYER               |   |                 v                          v         |
|  - FAISS Vector Index (index.faiss)     |   |         (Return Disambiguation)   4. Response Gen    |
|  - Metadata DB (SQLite / JSON)          |   |                                        Agent         |
|    * Documents, Chunks, Queries, Turns  |   |                                     (LLM Provider)   |
+-----------------------------------------+   |                                            |         |
                                              |                                            v         |
                                              |                                   5. Conversation    |
                                              |                                      Memory Agent    |
                                              |                                            |         |
                                              |                                            v         |
                                              |                                  [Final Answer with  |
                                              |                                   Verified Citations]|
                                              +------------------------------------------------------+
```

---

## 2. Ingestion Pipeline Breakdown

### 2.1 File Validation
Each file uploaded to `/api/upload` is checked for:
- Whitelisted file extension (`.pdf`, `.docx`, `.txt`, `.csv`).
- Maximum upload size (default: 25 MB).
- Non-empty byte payload.
- Safe filename sanitization (eliminating path traversal tokens like `../`).

### 2.2 Text Extraction
- **PDF:** PyMuPDF (`fitz.open(stream=...)`) iterates over pages, extracting raw text and tracking 1-based page numbers.
- **DOCX:** `docx.Document(...)` iterates paragraphs and tables.
- **TXT:** Direct stream decoding.
- **CSV:** `pandas.read_csv(...)` transforms rows into key-value narrative representations.

### 2.3 Chunking Engine
Chunks are formed using word/token sliding windows:
- `chunk_size`: 500 tokens (approx. 350-400 words)
- `chunk_overlap`: 50 tokens (approx. 35-50 words)
Each chunk is assigned a deterministic ID: `<DOC_ID>_CHUNK_<INDEX>` and preserves `document_id`, `source_file`, `page_number`, and `text`.

### 2.4 Vector Store & Embedding
- Embeddings are generated with `all-MiniLM-L6-v2` yielding 384-dimensional vectors.
- Vectors are L2-normalized so that inner product equals cosine similarity.
- Stored in a FAISS `IndexFlatIP`.
- The index is serialized to `vector_store/index.faiss` and paired with `vector_store/metadata.json`.

---

## 3. The Five Modular Agents & Orchestrator

### 3.1 Agent 1: Query Understanding Agent
- **Role:** Analyzes the raw query text alongside recent conversational context.
- **Outputs:**
  - `intent`: Factual, Procedural, Comparative, Clarification, or Out-of-Scope.
  - `topic`: Extracted domain subject (e.g., "leave", "attendance", "revaluation").
  - `normalized_query`: De-noised query string with pronouns resolved if contextual history exists.
  - `needs_clarification`: Boolean flag set to `True` if query is underspecified.

### 3.2 Agent 2: Clarification Agent
- **Role:** Invoked when `needs_clarification == True`.
- **Outputs:** Polite clarification message asking the user to specify which policy or process they are referring to, providing numbered or bulleted options.

### 3.3 Agent 3: Retrieval Agent
- **Role:** Encodes `normalized_query` into a dense vector, invokes FAISS similarity search for Top-K chunks ($K \in \{1, 3, 5\}$).
- **Threshold Gating:** Evaluates retrieved chunks against `SIMILARITY_THRESHOLD` (0.40). Chunks failing this threshold are filtered out. If all fail, flags low relevance.

### 3.4 Agent 4: Response Generation Agent
- **Role:** Gathers valid retrieved chunks, builds a strict grounded prompt, calls the configured `LLMProvider` (Google Gemini 2.5 Flash), extracts the factual answer, and formats source citations with document name, page number, and similarity score.
- **Safety / Anti-Hallucination:** Strictly instructs the model: "If the provided context does not contain sufficient facts to answer the question, state that the information is not available in the knowledge base. Do not make up facts."

### 3.5 Agent 5: Conversation Memory Agent
- **Role:** Records each interaction (`query_id`, `session_id`, `user_query`, `assistant_answer`, `citations`, `timestamp`). Provides recent turns to the Query Understanding Agent for anaphoric resolution (e.g., "What about casual leave?" followed by "How many days for that?").

---

## 4. Multi-Agent Orchestrator Flowchart

```text
       [ User Query ]
             |
             v
   Query Understanding Agent
             |
    Needs Clarification?
          /     \
      [YES]     [NO]
        |         |
 Clarification    Retrieval Agent (FAISS)
     Agent        |
        |         v
        |    Score > Threshold?
        |       /        \
        |    [NO]        [YES]
        |     |            |
        |   Low Relevance  Response Generation Agent
        |     Notice       (Context + Gemini LLM)
        |     |            |
        \     |            /
         v    v           v
       Conversation Memory Agent
             |
             v
      [ JSON Response to Client ]
```
