"""
Agent 1: Query Understanding Agent
Understands user query, classifies intent, extracts domain topic,
detects ambiguity, and normalizes query text.
"""

import re
import logging
from typing import Dict, Any, List
from .base_agent import BaseAgent

logger = logging.getLogger(__name__)

AMBIGUOUS_PATTERNS = [
    r"^(what\s+is|what\s+are|tell\s+me\s+about|explain)?\s*(the|a)?\s*policy\??$",
    r"^(what\s+is|what\s+are|tell\s+me\s+about|explain)?\s*(the|a)?\s*(rules|guidelines)\??$",
    r"^policy\??$",
    r"^rules\??$",
    r"^guidelines\??$",
    r"^how to apply\??$",
    r"^what are the benefits\??$"
]


class QueryUnderstandingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="QueryUnderstandingAgent",
            description="Analyzes user intent, extracts domain topic, detects ambiguity, and normalizes text."
        )

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        raw_query = context.get("query_text", "").strip()
        session_history: List[Dict[str, Any]] = context.get("conversation_history", [])

        # Step 1: Clean and Normalize text
        normalized = re.sub(r"\s+", " ", raw_query).strip()

        # Step 2: Contextual reference resolution (anaphora resolution)
        # If user asks e.g. "How many days for that?" or "What about earned leave?"
        resolved_query = normalized
        if session_history and len(session_history) > 0:
            last_turn = session_history[-1]
            last_query = last_turn.get("user_query", "")
            # Check for pronouns or short follow-ups
            if re.search(r"\b(it|this|that|these|those|there)\b", normalized, re.IGNORECASE) or len(normalized.split()) <= 3:
                resolved_query = f"{normalized} (in context of previous question: '{last_query}')"
                logger.info(f"Resolved conversational reference: '{normalized}' -> '{resolved_query}'")

        # Step 3: Intent Classification
        q_lower = normalized.lower()
        intent = "general_inquiry"
        if any(w in q_lower for w in ["how to", "how can", "procedure", "steps", "apply for"]):
            intent = "procedural_inquiry"
        elif any(w in q_lower for w in ["difference", "compare", "versus", "vs", "between"]):
            intent = "comparative_analysis"
        elif any(w in q_lower for w in ["what is", "who is", "where is", "when is", "minimum", "maximum"]):
            intent = "factual_information"
        elif any(w in q_lower for w in ["stock price", "weather", "cricket", "president", "bitcoin"]):
            intent = "out_of_scope"

        # Step 4: Topic / Domain Extraction
        topic = "general"
        if any(w in q_lower for w in ["leave", "cl", "el", "vacation", "sick leave"]):
            topic = "leave_policy"
        elif any(w in q_lower for w in ["attendance", "condonation", "od", "class"]):
            topic = "student_attendance"
        elif any(w in q_lower for w in ["exam", "malpractice", "passing marks", "hall ticket"]):
            topic = "examination_rules"
        elif any(w in q_lower for w in ["revaluation", "retotaling", "answer script"]):
            topic = "exam_revaluation"
        elif any(w in q_lower for w in ["wfh", "work from home", "remote", "broadband", "vpn"]):
            topic = "remote_work"
        elif any(w in q_lower for w in ["insurance", "benefit", "stipend", "medical", "gym"]):
            topic = "employee_benefits"
        elif any(w in q_lower for w in ["career", "placement", "counseling", "library", "wellness"]):
            topic = "student_services"

        # Step 5: Ambiguity Detection
        # Check against ambiguous patterns or single generic words
        needs_clarification = False
        for pat in AMBIGUOUS_PATTERNS:
            if re.match(pat, q_lower):
                needs_clarification = True
                break

        if len(normalized.split()) == 1 and normalized.lower() in ["policy", "rules", "leave", "exam", "benefits"]:
            needs_clarification = True

        logger.info(f"Query Understanding: Intent='{intent}', Topic='{topic}', NeedsClarification={needs_clarification}")

        return {
            "intent": intent,
            "topic": topic,
            "normalized_query": normalized,
            "resolved_query": resolved_query,
            "needs_clarification": needs_clarification
        }
