"""
Agent 2: Retrieval Agent
Encodes the normalized query, searches the FAISS vector index, applies threshold gating,
ranks results, and returns top candidates with similarity scores and metadata.
"""

import logging
from typing import Dict, Any, List
from .base_agent import BaseAgent
from app.config.settings import settings
from app.models.schemas import RetrievalResult
from app.retrieval.search import retrieval_service

logger = logging.getLogger(__name__)


class RetrievalAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="RetrievalAgent",
            description="Performs dense semantic vector search via FAISS and filters candidate chunks."
        )

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        query = context.get("resolved_query") or context.get("normalized_query") or context.get("query_text", "")
        query_id = context.get("query_id", "Q001")
        top_k = context.get("top_k", settings.TOP_K)
        threshold = context.get("threshold", settings.SIMILARITY_THRESHOLD)

        logger.info(f"RetrievalAgent querying for '{query}' with Top-K={top_k}, Threshold={threshold}")

        results: List[RetrievalResult] = retrieval_service.retrieve(
            query_text=query,
            query_id=query_id,
            top_k=top_k,
            threshold=threshold
        )

        max_score = max([r.score for r in results]) if results else 0.0
        has_sufficient_context = len(results) > 0 and max_score >= threshold

        return {
            "retrieved_chunks": results,
            "retrieved_count": len(results),
            "max_similarity_score": max_score,
            "has_sufficient_context": has_sufficient_context
        }
