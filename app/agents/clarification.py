"""
Agent 4: Clarification Agent
Detects underspecified or ambiguous queries and crafts targeted disambiguation options.
"""

import logging
from typing import Dict, Any, List
from .base_agent import BaseAgent

logger = logging.getLogger(__name__)

AVAILABLE_POLICIES = [
    "Student Attendance Policy (Education)",
    "Examination & Malpractice Rules (Education)",
    "Revaluation & Retotaling Process (Education)",
    "Leave & Absence Management Policy (HR)",
    "Hybrid Work-From-Home & Broadband Reimbursement Policy (HR)",
    "Employee Benefits & Medical Insurance (HR)"
]


class ClarificationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="ClarificationAgent",
            description="Generates interactive clarification prompts and options for ambiguous questions."
        )

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        query_text = context.get("normalized_query", "")
        topic = context.get("topic", "general")

        options: List[str] = []
        if "leave" in query_text.lower():
            options = [
                "Casual Leave (CL) rules & quota",
                "Earned Leave (EL) accrual & encashment",
                "Sick Leave & Medical certificate requirements",
                "Maternity & Paternity leave duration"
            ]
        elif "policy" in query_text.lower() or topic == "general":
            options = AVAILABLE_POLICIES
        elif "exam" in query_text.lower():
            options = [
                "Examination hall conduct & prohibited items",
                "Penalties for academic malpractice",
                "Passing marks criteria (internal vs written)",
                "Answer script revaluation process & fees"
            ]
        else:
            options = AVAILABLE_POLICIES[:4]

        clarification_message = (
            f"Your question '{query_text}' is broad or could refer to multiple policies. "
            f"Could you please specify which topic or document you would like to know about?\n\n"
            f"Suggested topics:\n" + "\n".join([f"• {opt}" for opt in options])
        )

        return {
            "clarification_message": clarification_message,
            "clarification_options": options
        }
