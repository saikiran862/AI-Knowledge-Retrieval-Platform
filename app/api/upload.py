"""
Document Upload API Endpoint
Accepts PDF, DOCX, TXT, CSV multipart uploads, validates security, and initiates ingestion.
"""

import logging
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.ingestion.pipeline import ingestion_pipeline

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload", tags=["Ingestion"])


@router.post("")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload and index a document (PDF, DOCX, TXT, CSV).
    Extracts text, normalizes content, chunks document, generates embeddings,
    and indexes into FAISS vector store.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing from upload."
        )

    # Sanitize filename (prevent path traversal attacks)
    clean_filename = Path(file.filename).name

    try:
        content = await file.read()
        result = ingestion_pipeline.process_document(
            file_bytes=content,
            filename=clean_filename,
            db=db
        )
        return {
            "status": "success",
            "message": result["message"],
            "data": result
        }
    except ValueError as val_err:
        logger.warning(f"Validation error for {clean_filename}: {val_err}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as e:
        logger.error(f"Ingestion failure on {clean_filename}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing '{clean_filename}': {str(e)}"
        )
