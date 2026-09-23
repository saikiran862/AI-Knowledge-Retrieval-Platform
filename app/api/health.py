"""
Health Check and System Diagnostics Endpoint
"""

from fastapi import APIRouter
from app.config.settings import settings
from app.retrieval.vector_store import vector_store

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def get_health():
    status = vector_store.get_status()
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "vector_store": {
            "total_chunks": status.total_chunks,
            "total_documents": status.total_documents,
            "status": status.status
        },
        "llm_model": settings.LLM_MODEL,
        "embedding_model": settings.EMBEDDING_MODEL
    }
