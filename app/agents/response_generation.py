"""
Agent 3: Response Generation Agent
Synthesizes factually grounded answers using the configured LLMProvider,
generates structured citations, computes confidence heuristics, and prevents hallucination.
"""

import logging
from typing import Dict, Any, List
from .base_agent import BaseAgent
from app.models.schemas import RetrievalResult, Citation
from app.llm.base import LLMProvider
from app.llm.gemini_provider import GeminiProvider

logger = logging.getLogger(__name__)


class ResponseGenerationAgent(BaseAgent):
    def __init__(self, llm_provider: LLMProvider = None):
        super().__init__(
            name="ResponseGenerationAgent",
            description="Synthesizes factual answers and generates formal source citations."
        )
        self.llm_provider = llm_provider or GeminiProvider()

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        query = context.get("normalized_query") or context.get("query_text", "")
        retrieved_chunks: List[RetrievalResult] = context.get("retrieved_chunks", [])
        has_sufficient_context = context.get("has_sufficient_context", False)
        max_score = context.get("max_similarity_score", 0.0)

        # Low Relevance Safeguard
        if not has_sufficient_context or not retrieved_chunks:
            return {
                "answer": (
                    "I could not find sufficiently relevant information in the uploaded knowledge base "
                    "to answer this question. Please upload relevant documents or refine your question."
                ),
                "citations": [],
                "confidence": "Low confidence",
                "raw_confidence_score": max_score
            }

        # Step 1: Format Citations from Metadata
        citations: List[Citation] = []
        for chunk in retrieved_chunks:
            citations.append(
                Citation(
                    document_name=chunk.source_file,
                    page_number=chunk.page_number,
                    chunk_id=chunk.chunk_id,
                    similarity_score=chunk.score,
                    excerpt=chunk.text_snippet[:120] + "..." if len(chunk.text_snippet) > 120 else chunk.text_snippet
                )
            )

        # Step 2: Determine Confidence Heuristic (Retrieval-based indicator)
        # Note: Documented as heuristic, not calibrated statistical probability
        if max_score >= 0.75:
            confidence = "High confidence"
        elif max_score >= 0.50:
            confidence = "Medium confidence"
        else:
            confidence = "Low confidence"

        # Step 3: Invoke LLM Provider with grounded context
        conv_context = context.get("conversation_summary", "")
        gen_result = self.llm_provider.generate_grounded_response(
            query=query,
            retrieved_chunks=retrieved_chunks,
            conversation_context=conv_context
        )

        answer_text = gen_result.get("answer", "")

        return {
            "answer": answer_text,
            "citations": citations,
            "confidence": confidence,
            "raw_confidence_score": round(max_score, 4)
        }
