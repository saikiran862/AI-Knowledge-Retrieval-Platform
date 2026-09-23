"""
TXT Document Loader
Handles multiple character encodings (UTF-8, Latin-1, CP1252, UTF-16).
"""

import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def extract_text_from_txt(file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    """
    Decodes raw bytes into clean text trying multiple common encodings.
    """
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252", "utf-16"]
    decoded_text = ""

    for enc in encodings:
        try:
            decoded_text = file_bytes.decode(enc)
            logger.info(f"Successfully decoded {filename} with encoding: {enc}")
            break
        except (UnicodeDecodeError, LookupError):
            continue

    if not decoded_text:
        # Ultimate fallback with character replacement
        decoded_text = file_bytes.decode("utf-8", errors="replace")

    return [{"page": 1, "text": decoded_text}]
