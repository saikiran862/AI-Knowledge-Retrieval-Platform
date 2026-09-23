"""
PDF Document Loader using PyMuPDF (fitz) with graceful fallback
Extracts text page by page to maintain accurate page numbers for citations.
"""

import io
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    """
    Extracts text page by page from PDF bytes.
    Returns a list of dicts: [{"page": 1, "text": "..."}]
    """
    pages_data = []

    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text") or ""
            pages_data.append({
                "page": page_num + 1,
                "text": text
            })
        doc.close()
        logger.info(f"Extracted {len(pages_data)} pages from PDF: {filename} using PyMuPDF")
        return pages_data
    except ImportError:
        logger.warning("PyMuPDF (fitz) not installed. Falling back to basic text extraction.")
    except Exception as e:
        logger.error(f"Error parsing PDF with PyMuPDF: {e}")

    # Pure Python basic fallback for environments without C-extensions
    # Attempt to extract readable ASCII/UTF-8 streams from PDF
    try:
        raw_content = file_bytes.decode("latin-1", errors="ignore")
        text_parts = []
        # Find stream ... endstream blocks or BT ... ET blocks
        import re
        matches = re.findall(r"\((.*?)\)\s*T[jJ]", raw_content)
        if matches:
            text = " ".join(matches)
        else:
            text = re.sub(r"[^\x20-\x7E\n\r\t]", " ", raw_content)
        pages_data.append({"page": 1, "text": text})
    except Exception as fallback_err:
        logger.error(f"Fallback PDF extraction failed: {fallback_err}")
        pages_data.append({"page": 1, "text": ""})

    return pages_data
