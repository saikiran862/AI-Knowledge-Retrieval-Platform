"""
FAISS Vector Store and Metadata Management Subsystem
Handles dense vector indexing, local persistence (index.faiss, metadata.json),
and Top-K cosine similarity retrieval with fallback.
"""

import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional

try:
    import numpy as np
    HAVE_NUMPY = True
except ImportError:
    HAVE_NUMPY = False
    np = None

from app.config.settings import settings
from app.models.schemas import ChunkModel, VectorStoreStatus

logger = logging.getLogger(__name__)


class FaissVectorStore:
    """
    Persistent FAISS vector store with separate JSON metadata mapping.
    """

    def __init__(self, store_dir: Optional[Path] = None, dimension: Optional[int] = None):
        self.store_dir = store_dir or settings.VECTOR_STORE_PATH
        self.dimension = dimension or settings.EMBEDDING_DIMENSION
        self.index_path = self.store_dir / "index.faiss"
        self.metadata_path = self.store_dir / "metadata.json"

        self.store_dir.mkdir(parents=True, exist_ok=True)
        self.index = None
        self.metadata: List[Dict[str, Any]] = []
        self._fallback_vectors: Any = None
        self._faiss_available = False

        self._init_or_load()

    def _init_or_load(self):
        """Loads existing index and metadata from disk, or initializes empty index."""
        try:
            import faiss
            self._faiss_available = True
            if self.index_path.exists():
                logger.info(f"Loading existing FAISS index from {self.index_path}")
                self.index = faiss.read_index(str(self.index_path))
            else:
                logger.info(f"Creating new FAISS IndexFlatIP with dimension {self.dimension}")
                self.index = faiss.IndexFlatIP(self.dimension)
        except ImportError:
            logger.warning("FAISS C++ package not available. Using vectorized numpy IndexFlatIP fallback.")
            self._faiss_available = False

        # Load metadata.json
        if self.metadata_path.exists():
            try:
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info(f"Loaded {len(self.metadata)} chunk metadata records.")
            except Exception as e:
                logger.error(f"Failed to read metadata.json: {e}")
                self.metadata = []
        else:
            self.metadata = []

    def add_chunks(self, chunks: List[ChunkModel], embeddings: Any):
        """
        Adds vectors to the FAISS index and stores chunk metadata.
        Persists to disk immediately.
        """
        if len(chunks) == 0:
            return

        if len(chunks) != len(embeddings):
            raise ValueError(f"Mismatch: {len(chunks)} chunks vs {len(embeddings)} embeddings")

        # Add to FAISS index or fallback
        if self._faiss_available and self.index is not None and HAVE_NUMPY:
            import faiss
            # Ensure float32 format
            vectors = np.ascontiguousarray(embeddings, dtype=np.float32)
            self.index.add(vectors)
            faiss.write_index(self.index, str(self.index_path))
        else:
            if HAVE_NUMPY:
                if self._fallback_vectors is None or len(self._fallback_vectors) == 0:
                    self._fallback_vectors = np.ascontiguousarray(embeddings, dtype=np.float32)
                else:
                    self._fallback_vectors = np.vstack([self._fallback_vectors, embeddings])
            else:
                if self._fallback_vectors is None:
                    self._fallback_vectors = []
                self._fallback_vectors.extend(list(embeddings))

        # Append metadata
        for chunk in chunks:
            self.metadata.append({
                "chunk_id": chunk.chunk_id,
                "document_id": chunk.document_id,
                "chunk_index": chunk.chunk_index,
                "source_file": chunk.source_file,
                "page_number": chunk.page_number,
                "text": chunk.text,
                "metadata": chunk.metadata,
                "embedding_model": chunk.embedding_model
            })

        # Save metadata to disk
        self._save_metadata()
        logger.info(f"Vector store updated: now contains {len(self.metadata)} total chunks.")

    def search(self, query_vector: Any, top_k: int = 3) -> List[Tuple[Dict[str, Any], float, int]]:
        """
        Performs similarity search.
        Returns list of (metadata_dict, similarity_score, rank) tuples.
        """
        if len(self.metadata) == 0:
            return []

        top_k = min(top_k, len(self.metadata))

        if self._faiss_available and self.index is not None and self.index.ntotal > 0 and HAVE_NUMPY:
            q_arr = np.ascontiguousarray(np.array(query_vector).reshape(1, -1), dtype=np.float32)
            scores, indices = self.index.search(q_arr, top_k)
            results = []
            for rank, (score, idx) in enumerate(zip(scores[0], indices[0]), start=1):
                if 0 <= idx < len(self.metadata):
                    meta = self.metadata[idx]
                    results.append((meta, float(score), rank))
            return results

        # Fallback numpy or pure python cosine similarity
        if self._fallback_vectors is not None and len(self._fallback_vectors) > 0:
            if HAVE_NUMPY and isinstance(self._fallback_vectors, np.ndarray):
                q_arr = np.ascontiguousarray(np.array(query_vector).reshape(1, -1), dtype=np.float32)
                scores = np.dot(self._fallback_vectors, q_arr.T).flatten()
                top_indices = np.argsort(-scores)[:top_k]
                results = []
                for rank, idx in enumerate(top_indices, start=1):
                    meta = self.metadata[idx]
                    results.append((meta, float(scores[idx]), rank))
                return results
            else:
                scores = [
                    sum(a * b for a, b in zip(vec, query_vector))
                    for vec in self._fallback_vectors
                ]
                top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]
                results = []
                for rank, idx in enumerate(top_indices, start=1):
                    meta = self.metadata[idx]
                    results.append((meta, float(scores[idx]), rank))
                return results

        return []

    def delete_document_chunks(self, document_id: str):
        """
        Removes all chunks associated with a document and re-indexes.
        """
        remaining_meta = []
        remaining_indices = []

        for idx, meta in enumerate(self.metadata):
            if meta.get("document_id") != document_id:
                remaining_meta.append(meta)
                remaining_indices.append(idx)

        self.metadata = remaining_meta
        self._save_metadata()

        # Re-build index
        self._rebuild_index()
        logger.info(f"Deleted chunks for doc {document_id}. Remaining chunks: {len(self.metadata)}")

    def _rebuild_index(self):
        """Re-initializes the index if items are deleted."""
        from app.ingestion.embedder import embedding_service

        if self._faiss_available:
            import faiss
            self.index = faiss.IndexFlatIP(self.dimension)
            if self.metadata:
                texts = [m["text"] for m in self.metadata]
                vecs = embedding_service.embed_texts(texts)
                self.index.add(np.ascontiguousarray(vecs, dtype=np.float32))
                faiss.write_index(self.index, str(self.index_path))
        else:
            if self.metadata:
                texts = [m["text"] for m in self.metadata]
                self._fallback_vectors = embedding_service.embed_texts(texts)
            else:
                self._fallback_vectors = None

    def _save_metadata(self):
        with open(self.metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2)

    def get_status(self) -> VectorStoreStatus:
        """Returns diagnostic status of vector database."""
        docs = set(m.get("document_id") for m in self.metadata if "document_id" in m)
        return VectorStoreStatus(
            total_chunks=len(self.metadata),
            total_documents=len(docs),
            embedding_model=settings.EMBEDDING_MODEL,
            embedding_dimension=self.dimension,
            index_type="IndexFlatIP (Inner Product / Cosine Similarity)",
            index_file_exists=self.index_path.exists(),
            status="active" if len(self.metadata) > 0 else "empty"
        )


# Global singleton instance
vector_store = FaissVectorStore()
