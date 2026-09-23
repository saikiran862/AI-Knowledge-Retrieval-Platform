"""
LLM Provider Abstraction Interface
Defines uniform contract for all language model providers (Gemini, OpenAI, Local).
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.models.schemas import RetrievalResult


class LLMProvider(ABC):
    """
    Abstract interface for Retrieval-Augmented Generation generation backends.
    """

    @abstractmethod
    def generate_grounded_response(
        self,
        query: str,
        retrieved_chunks: List[RetrievalResult],
        conversation_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates a factually grounded answer strictly referencing retrieved chunks.
        Returns dict containing:
        {
            "answer": str,
            "used_sources": List[str],
            "raw_output": str
        }
        """
        pass
