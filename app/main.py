"""
FastAPI Application Entry Point
AI-Based Knowledge Retrieval Platform with Query Resolution System
"""

import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.settings import settings
from app.database.database import init_db, SessionLocal
from app.database.repository import DocumentRepository
from app.ingestion.pipeline import ingestion_pipeline
from app.api.health import router as health_router
from app.api.upload import router as upload_router
from app.api.documents import router as documents_router
from app.api.query import router as query_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("rag_platform")


def seed_sample_knowledge_base():
    """
    Auto-seeds the Education and HR sample documents if the database is brand new.
    Allows immediate testing and evaluation out of the box.
    """
    db = SessionLocal()
    try:
        existing_docs = DocumentRepository.list_documents(db)
        if len(existing_docs) == 0:
            logger.info("Empty knowledge base detected. Auto-indexing initial demo domain documents...")

            sample_files = [
                settings.DATA_DIR / "education" / "attendance_policy.txt",
                settings.DATA_DIR / "education" / "examination_rules.txt",
                settings.DATA_DIR / "education" / "revaluation_process.txt",
                settings.DATA_DIR / "education" / "student_services.txt",
                settings.DATA_DIR / "hr" / "employee_handbook.txt",
                settings.DATA_DIR / "hr" / "leave_policy.txt",
                settings.DATA_DIR / "hr" / "work_from_home_policy.txt",
                settings.DATA_DIR / "hr" / "employee_benefits.csv",
            ]

            for file_path in sample_files:
                if file_path.exists():
                    try:
                        with open(file_path, "rb") as f:
                            content = f.read()
                        ingestion_pipeline.process_document(
                            file_bytes=content,
                            filename=file_path.name,
                            db=db
                        )
                        logger.info(f"Auto-indexed sample: {file_path.name}")
                    except Exception as e:
                        logger.warning(f"Could not auto-seed {file_path.name}: {e}")

            logger.info("Auto-indexing of sample documents complete.")
    except Exception as e:
        logger.error(f"Error during auto-seeding: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle
    logger.info(f"Initializing {settings.APP_NAME} v{settings.APP_VERSION}")
    init_db()
    seed_sample_knowledge_base()
    yield
    # Shutdown lifecycle
    logger.info("Shutting down application...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Modular multi-agent RAG retrieval platform with FAISS, Sentence Transformers, and Gemini integration.",
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(query_router, prefix="/api")

# Mount static frontend directory if present
frontend_dir = settings.BASE_DIR / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
