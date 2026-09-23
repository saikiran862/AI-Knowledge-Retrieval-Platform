"""
Multi-Agent Orchestrator
Coordinates the 5 specialized agents according to the RAG query resolution lifecycle.
"""

import uuid
import logging
from typing import Dict, Any, List, Optional

try:
    from sqlalchemy.orm import Session
except ImportError:
    Session = Any  # type: ignore

from app.config.settings import settings
from app.models.schemas import QueryRequest, QueryResponse, AgentTraceStep
from app.agents.query_understanding import QueryUnderstandingAgent
from app.agents.clarification import ClarificationAgent
from app.agents.retrieval_agent import RetrievalAgent
from app.agents.response_generation import ResponseGenerationAgent
from app.agents.conversation_memory import memory_agent
from app.database.repository import ConversationRepository

logger = logging.getLogger(__name__)


class MultiAgentOrchestrator:
    """
    Central coordinator directing Query Understanding, Clarification,
    Dense Retrieval, Grounded Generation, and Conversation Memory.
    """

    def __init__(self):
        self.query_agent = QueryUnderstandingAgent()
        self.clarification_agent = ClarificationAgent()
        self.retrieval_agent = RetrievalAgent()
        self.response_agent = ResponseGenerationAgent()
        self.memory_agent = memory_agent

    def resolve_query(self, request: QueryRequest, db: Optional[Session] = None) -> QueryResponse:
        query_id = f"Q_{uuid.uuid4().hex[:8].upper()}"
        session_id = request.session_id or "default_session"
        top_k = request.top_k or settings.TOP_K
        threshold = request.threshold if request.threshold is not None else settings.SIMILARITY_THRESHOLD

        trace: List[AgentTraceStep] = []
        state: Dict[str, Any] = {
            "query_id": query_id,
            "session_id": session_id,
            "query_text": request.query_text,
            "top_k": top_k,
            "threshold": threshold,
        }

        # Step 1: Conversation Memory (Fetch recent history)
        mem_output = self.memory_agent.process(state)
        state.update(mem_output)
        trace.append(
            AgentTraceStep(
                agent_name=self.memory_agent.name,
                action="Fetch Conversation Context",
                output_summary=f"Retrieved {len(mem_output.get('conversation_history', []))} prior turns.",
                details={"turns_count": len(mem_output.get("conversation_history", []))}
            )
        )

        # Step 2: Query Understanding Agent
        qu_output = self.query_agent.process(state)
        state.update(qu_output)
        trace.append(
            AgentTraceStep(
                agent_name=self.query_agent.name,
                action="Analyze Query Intent & Ambiguity",
                output_summary=f"Intent: {qu_output['intent']} | Topic: {qu_output['topic']} | Ambiguous: {qu_output['needs_clarification']}",
                details=qu_output
            )
        )

        # Step 3: Ambiguity Branching
        if qu_output["needs_clarification"]:
            clar_output = self.clarification_agent.process(state)
            trace.append(
                AgentTraceStep(
                    agent_name=self.clarification_agent.name,
                    action="Formulate Clarification Request",
                    output_summary="Generated disambiguation options for user.",
                    details=clar_output
                )
            )

            # Record turn in memory
            self.memory_agent.add_turn(
                session_id=session_id,
                user_query=request.query_text,
                assistant_response=clar_output["clarification_message"],
                citations=[]
            )

            return QueryResponse(
                query_id=query_id,
                session_id=session_id,
                query_text=request.query_text,
                answer=clar_output["clarification_message"],
                sources=[],
                confidence="Low confidence",
                raw_confidence_score=0.0,
                needs_clarification=True,
                clarification_options=clar_output["clarification_options"],
                agent_trace=trace
            )

        # Step 4: Retrieval Agent (FAISS search)
        ret_output = self.retrieval_agent.process(state)
        state.update(ret_output)
        trace.append(
            AgentTraceStep(
                agent_name=self.retrieval_agent.name,
                action="Semantic Vector Search",
                output_summary=f"Retrieved {ret_output['retrieved_count']} chunks with max score {ret_output['max_similarity_score']:.4f}",
                details={
                    "chunks_count": ret_output["retrieved_count"],
                    "max_score": ret_output["max_similarity_score"],
                    "top_sources": [c.source_file for c in ret_output.get("retrieved_chunks", [])]
                }
            )
        )

        # Step 5: Response Generation Agent (LLM + Citations)
        resp_output = self.response_agent.process(state)
        state.update(resp_output)
        trace.append(
            AgentTraceStep(
                agent_name=self.response_agent.name,
                action="Generate Grounded Answer & Citations",
                output_summary=f"Generated answer with {len(resp_output['citations'])} source citations.",
                details={
                    "confidence": resp_output["confidence"],
                    "citations_count": len(resp_output["citations"])
                }
            )
        )

        # Step 6: Update Conversation Memory
        self.memory_agent.add_turn(
            session_id=session_id,
            user_query=request.query_text,
            assistant_response=resp_output["answer"],
            citations=[c.dict() for c in resp_output["citations"]]
        )

        # Persist to SQLite if DB session is available
        if db:
            try:
                ConversationRepository.save_turn(
                    db=db,
                    session_id=session_id,
                    query_id=query_id,
                    user_query=request.query_text,
                    assistant_response=resp_output["answer"],
                    citations=[c.dict() for c in resp_output["citations"]]
                )
            except Exception as e:
                logger.error(f"Error logging turn to database: {e}")

        return QueryResponse(
            query_id=query_id,
            session_id=session_id,
            query_text=request.query_text,
            answer=resp_output["answer"],
            sources=resp_output["citations"],
            confidence=resp_output["confidence"],
            raw_confidence_score=resp_output["raw_confidence_score"],
            needs_clarification=False,
            clarification_options=[],
            agent_trace=trace
        )


# Global orchestrator singleton instance
orchestrator = MultiAgentOrchestrator()
