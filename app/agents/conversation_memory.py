"""
Agent 5: Conversation Memory Agent
Maintains dialogue history across session turns, resolves anaphoric references,
and persists conversations to SQLite/session storage.
"""

import logging
from typing import Dict, Any, List
from .base_agent import BaseAgent

logger = logging.getLogger(__name__)


class ConversationMemoryAgent(BaseAgent):
    """
    Session-based conversation memory maintaining recent user turns.
    Modular design allows replacement with Redis or Cloud DB in future milestones.
    """

    def __init__(self):
        super().__init__(
            name="ConversationMemoryAgent",
            description="Manages conversational context buffer and session history."
        )
        # In-memory buffer keyed by session_id
        self._session_cache: Dict[str, List[Dict[str, Any]]] = {}

    def get_session_history(self, session_id: str, max_turns: int = 5) -> List[Dict[str, Any]]:
        return self._session_cache.get(session_id, [])[-max_turns:]

    def add_turn(
        self,
        session_id: str,
        user_query: str,
        assistant_response: str,
        citations: List[Any]
    ):
        if session_id not in self._session_cache:
            self._session_cache[session_id] = []

        self._session_cache[session_id].append({
            "user_query": user_query,
            "assistant_response": assistant_response,
            "citations": citations
        })

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        session_id = context.get("session_id", "default_session")
        history = self.get_session_history(session_id, max_turns=3)

        # Build readable history string for LLM injection
        history_lines = []
        for turn in history:
            history_lines.append(f"User: {turn['user_query']}")
            history_lines.append(f"Assistant: {turn['assistant_response'][:200]}...")

        formatted_history = "\n".join(history_lines) if history_lines else ""

        return {
            "conversation_history": history,
            "conversation_summary": formatted_history
        }


# Global memory agent instance
memory_agent = ConversationMemoryAgent()
