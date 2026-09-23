"""
Query & Retrieval API Endpoints
Handles natural-language queries via Multi-Agent Orchestrator,
top-K semantic retrieval preview, and vector store diagnostics.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.repository import ConversationRepository
from app.models.schemas import QueryRequest, QueryResponse, RetrievalResult, VectorStoreStatus
from app.orchestration.orchestrator import orchestrator
from app.retrieval.search import retrieval_service
from app.retrieval.vector_store import vector_store
from app.retrieval.evaluation import run_evaluation

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Query & Retrieval"])


@router.post("/query", response_model=QueryResponse)
def submit_query(request: QueryRequest, db: Session = Depends(get_db)):
    """
    Submits a natural-language query to the 5-agent orchestrator.
    Resolves intent, retrieves grounded context, synthesizes answer, and returns citations.
    """
    try:
        response = orchestrator.resolve_query(request, db=db)
        return response
    except Exception as e:
        logger.error(f"Error during query resolution: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query resolution failed: {str(e)}"
        )


@router.get("/retrieve", response_model=List[RetrievalResult])
def retrieve_top_k(
    q: str = Query(..., min_length=1, description="Search query"),
    top_k: int = Query(default=3, ge=1, le=10, description="Top-K count"),
    threshold: Optional[float] = Query(default=0.0, ge=0.0, le=1.0, description="Minimum score cutoff")
):
    """
    Direct semantic retrieval endpoint returning top-K chunks with similarity scores.
    """
    return retrieval_service.retrieve(
        query_text=q,
        query_id="API_RETRIEVAL",
        top_k=top_k,
        threshold=threshold
    )


@router.get("/vector-store/status", response_model=VectorStoreStatus)
def get_vector_store_status():
    """
    Returns diagnostics on current FAISS vector store and total indexed chunks.
    """
    return vector_store.get_status()


@router.post("/evaluate")
def trigger_evaluation():
    """
    Triggers the benchmark retrieval accuracy evaluation across the 10 benchmark queries.
    Returns Top-1, Top-3, Top-5 accuracy percentages and generates results/retrieval_results.csv.
    """
    try:
        summary = run_evaluation()
        return {
            "status": "success",
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Evaluation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {str(e)}"
        )


@router.get("/conversation/{session_id}")
def get_conversation_history(session_id: str, db: Session = Depends(get_db)):
    """
    Retrieves conversational turns for a given session.
    """
    turns = ConversationRepository.get_recent_turns(db, session_id=session_id, limit=10)
    return [
        {
            "id": t.id,
            "query_id": t.query_id,
            "user_query": t.user_query,
            "assistant_response": t.assistant_response,
            "timestamp": t.timestamp.isoformat() if t.timestamp else ""
        }
        for t in turns
    ]
