# Milestone 1.1: Research & Technical Understanding

**Project Title:** Development of AI-Based Knowledge Retrieval Platform with Query Resolution System  
**Internship Program:** Infosys Springboard Internship – Batch 3  
**Domain:** Artificial Intelligence / Retrieval-Augmented Generation (RAG) / Multi-Agent Systems  

---

## 1. Executive Summary

This document establishes the technical foundation for the **AI-Based Knowledge Retrieval Platform with Query Resolution System**. The primary objective is to ingest heterogeneous enterprise documents (PDF, DOCX, TXT, CSV), extract and normalize their text, segment them into semantically coherent overlapping chunks, generate dense vector embeddings, index them in a high-performance vector store (FAISS), and resolve user queries through a modular multi-agent orchestration pipeline.

---

## 2. Fundamentals of Retrieval-Augmented Generation (RAG)

### 2.1 The Need for RAG
Large Language Models (LLMs) suffer from three critical shortcomings in enterprise environments:
1. **Knowledge Cutoffs:** LLMs possess static parametric knowledge locked at the point of pretraining.
2. **Hallucination:** When faced with queries outside their weights, LLMs generate plausible-sounding but factually false claims.
3. **Lack of Enterprise Privacy & Lineage:** Proprietary knowledge (internal policies, employee handbooks, syllabi) cannot be fine-tuned into public weights safely, and standard LLMs cannot cite exact page numbers or paragraphs.

**Retrieval-Augmented Generation (RAG)** decouples knowledge storage from reasoning capability. The LLM acts as an inference and synthesis engine over external facts dynamically fetched at query time.

```
+------------------+         +------------------+         +-------------------+
|  Knowledge Base  | ------> | Dense Retrieval  | ------> | Grounded LLM      |
|  Documents       |         | (Top-K Chunks)   |         | Response + Source |
+------------------+         +------------------+         +-------------------+
```

---

## 3. End-to-End Retrieval Pipeline

The ingestion and retrieval lifecycle is divided into two distinct workflows:

### 3.1 Ingestion Pipeline (Offline / Background)
1. **Document Upload & Format Validation:** Verification of file headers, MIME types, and file size limits.
2. **Format-Specific Text Extraction:** 
   - PDF: Extracted using PyMuPDF (`fitz`), preserving page numbers and layout flow.
   - DOCX: Extracted via `python-docx`, parsing paragraphs and tabular cells.
   - TXT: Direct UTF-8 stream decoding with encoding fallback (e.g., latin-1).
   - CSV: Parsed row-by-row with `pandas`, converting rows into key-value narrative representations.
3. **Text Cleaning & Normalization:** Stripping control characters, normalizing unicode whitespace, deduplicating linebreaks, and retaining punctuation vital for sentence boundary detection.
4. **Document Chunking:** Fixed-size sliding-window token chunking with configured overlap (default: ~500 tokens with 50-100 token overlap).
5. **Embedding Generation:** Encoding chunk strings into dense 384-dimensional floating-point vectors via `sentence-transformers/all-MiniLM-L6-v2`.
6. **Vector Store Indexing:** Indexing vectors using FAISS (IndexFlatIP / IndexFlatL2) for sub-millisecond similarity queries.
7. **Metadata Persistence:** Persisting chunk text, source filename, page number, and document UUIDs in SQLite and JSON mappings.

### 3.2 Query Resolution Pipeline (Online / Real-Time)
1. **Query Ingestion:** User inputs query through keyboard or Web Speech API microphone.
2. **Query Understanding Agent:** Parses user intent, extracts subject keywords, and detects ambiguity.
3. **Clarification Agent:** If ambiguous or underspecified, halts retrieval and prompts user with disambiguation choices.
4. **Query Embedding:** Encodes the normalized query using the identical model (`all-MiniLM-L6-v2`).
5. **Vector Search:** Performs cosine similarity / inner product search across the FAISS index to retrieve Top-K candidates ($K \in \{1, 3, 5\}$).
6. **Low-Relevance Threshold Filter:** Discards results whose similarity score falls below `SIMILARITY_THRESHOLD` (e.g., 0.40).
7. **Response Generation Agent:** Constructs a grounded context prompt enforcing strict factual boundaries, synthesizes the answer, and generates precise source citations.
8. **Conversation Memory Agent:** Stores the turn in session memory to resolve subsequent anaphoric references.

---

## 4. Document Processing & Ingestion Analysis

### 4.1 Text Extraction Strategies
* **PDF (`PyMuPDF / fitz`):** Selected over `PyPDF2` and `pdfminer` due to its C-accelerated parsing speed (up to 10x faster), robust handling of corrupted streams, and native support for page-by-page text extraction.
* **DOCX (`python-docx`):** Traverses the document's XML document body, extracting paragraph blocks and table cell matrices into structured strings.
* **CSV (`pandas`):** Treats tabular records by transforming rows into descriptive sentences: `"[Column1]: Value1, [Column2]: Value2..."` ensuring semantic vectors capture table relations effectively.
* **TXT:** Direct stream reading with encoding detection (`utf-8`, `utf-16`, `cp1252`).

### 4.2 Cleaning & Normalization
Unprocessed text introduces noise that distorts dense vector representations:
* Multiple consecutive spaces or erratic linebreaks (`\r\n` vs `\n`) are collapsed.
* Non-printable unicode glyphs are removed.
* Hyphenated line-break split words (e.g., `atten- \n dance`) are re-joined.

---

## 5. Chunking Strategies and Overlap Dynamics

### 5.1 Why Chunking is Critical
Embedding models have finite context windows (e.g., 256–512 tokens). Feeding an entire 50-page document into an embedding model either causes truncation or dilutes semantic density into an uninformative mean vector. Chunking ensures that each vector represents a focused semantic topic.

### 5.2 Chunk Size vs. Overlap Trade-offs
* **Chunk Size (~500 tokens):** Balances specificity with contextual completeness. Too small (<100 tokens) causes fragmented thoughts; too large (>1000 tokens) loses granular precision.
* **Chunk Overlap (50–100 tokens / 10–20%):** Prevents boundary clipping where key information spans across the cut point between two chunks.

---

## 6. Embedding Models & Semantic Similarity

### 6.1 Model Selection: `all-MiniLM-L6-v2`
* **Architecture:** 6-layer MiniLM distilled from BERT.
* **Embedding Dimension:** 384 dimensions.
* **Inference Speed:** Highly optimized for CPU-based inference (~14,000 sentences/sec on GPU, hundreds per second on standard laptop CPU).
* **Performance:** Consistently competitive on the MTEB (Massive Text Embedding Benchmark) for retrieval tasks while requiring minimal memory footprint (~120 MB).

### 6.2 Semantic Similarity Metric
Normalized embeddings enable **Cosine Similarity** to be computed via simple dot product:
$$\text{Cosine Similarity}(u, v) = \frac{u \cdot v}{\|u\|_2 \|v\|_2} = \cos(\theta)$$
Values range from -1.0 to 1.0 (in practice, 0.0 to 1.0 for normalized dense text embeddings).

---

## 7. Vector Database: FAISS

### 7.1 FAISS (Facebook AI Similarity Search)
FAISS is an open-source library developed by Meta AI optimized for dense vector similarity search:
* **IndexFlatIP:** Computes exact Inner Product (dot product). When vectors are L2-normalized, Inner Product is equivalent to Cosine Similarity.
* **Zero Overhead for Milestone 1:** Runs in-memory with disk serialization (`faiss.write_index` / `faiss.read_index`), avoiding external database server management.
* **Separate Metadata Mapping:** FAISS stores only numerical identifiers ($0, 1, 2, \dots, N-1$). We pair the FAISS index with an external SQLite database and JSON mapping dictionary to map internal index IDs to rich chunk metadata (`document_id`, `chunk_id`, `page_number`, `source_file`, `text`).

---

## 8. Multi-Agent Query Resolution Architecture

Rather than executing a monolithic script, Milestone 1 employs a 5-agent cooperative architecture coordinated by an Orchestrator:

1. **Query Understanding Agent:** Categorizes intent (e.g., factual, procedural, comparative, out-of-scope), normalizes phrasing, and detects ambiguity.
2. **Retrieval Agent:** Interfaces with the embedding model and FAISS vector index, applies threshold gating, and ranks candidate chunks.
3. **Response Generation Agent:** Prompts the LLM with grounded context and enforces hallucination-prevention guardrails.
4. **Clarification Agent:** Intercepts ambiguous prompts and suggests structured clarification choices.
5. **Conversation Memory Agent:** Maintains sliding-window dialogue turns to resolve conversational pronouns.

---

## 9. Web Speech API Integration

To provide an accessible multimodal experience, the browser's native **Web Speech API** is integrated without external paid cloud speech APIs:
* **Speech-to-Text (STT):** `webkitSpeechRecognition` / `SpeechRecognition` captures continuous spoken queries and writes them into the query input field.
* **Text-to-Speech (TTS):** `window.speechSynthesis` and `SpeechSynthesisUtterance` read the generated answer aloud, complete with play, pause, and cancel controls.
* **Graceful Degradation:** The UI tests for browser API availability (`'speechSynthesis' in window`) and provides informative warnings on unsupported platforms.

---

## 10. Technology Justification Matrix

| Component | Selected Technology | Alternative Evaluated | Selection Justification |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | FastAPI (Python) | Flask, Django | Asynchronous native ASGI support, auto-generated OpenAPI/Swagger, Pydantic type validation. |
| **PDF Extraction** | PyMuPDF (fitz) | PyPDF2, pdfminer.six | 10x faster parsing, robust font handling, native page-level bounding. |
| **Embedding Model** | all-MiniLM-L6-v2 | OpenAI text-embedding-3-small | Open source, runs locally on CPU without API latency or billing dependency. |
| **Vector Index** | FAISS | Pinecone, ChromaDB, Milvus | Sub-millisecond exact search, zero cloud dependencies, native disk persistence. |
| **Metadata DB** | SQLite | PostgreSQL, MongoDB | Single-file zero-config setup, ACID compliant, native Python driver. |
| **LLM Provider** | Gemini 2.5 / Provider Abstraction | Hardcoded OpenAI | Pluggable interface (`LLMProvider`) supporting Google Gemini, OpenAI, and local mock/testing fallbacks. |
| **Speech** | Browser Web Speech API | Whisper API, ElevenLabs | Client-side native, zero latency, no API keys or costs required. |

---

## 11. Limitations & Milestone 2 Roadmap

1. **Exact Search Scalability:** `IndexFlatIP` performs exhaustive search ($O(N)$). Milestone 2 will introduce Hierarchical Navigable Small World (`IndexHNSW`) or inverted file (`IndexIVFFlat`) indexes for datasets exceeding 1,000,000 chunks.
2. **Dense-Only Retrieval:** Milestone 1 relies purely on dense semantic vectors. Milestone 2 will incorporate **Hybrid Search** (Dense + Sparse BM25) and Cross-Encoder Re-Ranking.
3. **Advanced Memory:** Session memory is currently memory/SQLite-backed; future milestones will add GraphRAG or persistent vector memory per user.
