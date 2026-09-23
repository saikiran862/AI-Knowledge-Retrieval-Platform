"""
Semantic Search & Retrieval Subsystem
Provides Top-K semantic retrieval with threshold filtering and ranking.
"""

import logging
from typing import List, Optional
from app.config.settings import settings
from app.models.schemas import RetrievalResult
from app.ingestion.embedder import embedding_service
from app.retrieval.vector_store import vector_store

logger = logging.getLogger(__name__)


class RetrievalService:
    """
    Retrieval service executing query embedding, FAISS similarity search,
    and threshold gating.
    """

    def __init__(self, default_top_k: int = 3, threshold: float = 0.40):
        self.default_top_k = default_top_k
        self.threshold = threshold

    def retrieve(
        self,
        query_text: str,
        query_id: str = "Q001",
        top_k: Optional[int] = None,
        threshold: Optional[float] = None
    ) -> List[RetrievalResult]:
        """
        Embeds user query and queries vector store.
        Filters candidates below similarity threshold.
        """
        k = top_k or self.default_top_k
        cutoff = threshold if threshold is not None else self.threshold

        logger.info(f"Executing retrieval for query: '{query_text}' with Top-K={k}, Threshold={cutoff}")

        # Step 1: Query Embedding
        query_vector = embedding_service.embed_query(query_text)

        # Step 2: Vector Search
        search_hits = vector_store.search(query_vector, top_k=k)

        # Step 3: Format and Filter
        results: List[RetrievalResult] = []
        for meta, score, rank in search_hits:
            if score >= cutoff:
                results.append(
                    RetrievalResult(
                        query_id=query_id,
                        chunk_id=meta.get("chunk_id", f"CHUNK_{rank}"),
                        document_id=meta.get("document_id", "UNKNOWN_DOC"),
                        source_file=meta.get("source_file", "unknown"),
                        page_number=meta.get("page_number"),
                        score=round(score, 4),
                        rank=rank,
                        text_snippet=meta.get("text", "")
                    )
                )
            else:
                logger.info(f"Filtered out chunk {meta.get('chunk_id')} with score {score:.4f} below cutoff {cutoff}")

        logger.info(f"Retrieved {len(results)} qualifying chunks (after threshold filtering).")
        return results


# Global retrieval service instance
retrieval_service = RetrievalService()
