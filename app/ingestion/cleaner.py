"""
Text Cleaning and Normalization Subsystem
Cleans extracted raw text to maximize semantic embedding fidelity.
"""

import re
import unicodedata
import logging

logger = logging.getLogger(__name__)


def clean_and_normalize_text(text: str) -> str:
    """
    Applies multi-stage normalization:
    1. Unicode NFKC normalization
    2. Re-joining line-break hyphenated words
    3. Standardizing whitespace and linebreaks
    4. Stripping non-printable ASCII/Unicode control codes
    """
    if not text:
        return ""

    # 1. Unicode normalization (converts ligatures, compatibility characters)
    text = unicodedata.normalize("NFKC", text)

    # 2. Fix hyphenated word breaks at end of lines (e.g. 'attend-\nance' -> 'attendance')
    text = re.sub(r"(\b[a-zA-Z]+)-\s*\n\s*([a-zA-Z]+\b)", r"\1\2", text)

    # 3. Replace non-standard whitespace (non-breaking space, em-space, etc.) with standard space
    text = re.sub(r"[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000]", " ", text)

    # 4. Remove unprintable ASCII control characters (keep \n, \t, \r)
    text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)

    # 5. Normalize newline runs (collapse 3+ newlines to double newline)
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    # 6. Normalize multiple consecutive horizontal spaces to a single space
    text = re.sub(r"[ \t]{2,}", " ", text)

    return text.strip()
