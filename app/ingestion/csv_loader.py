"""
CSV Document Loader using pandas with standard library csv fallback.
Transforms tabular rows into narrative sentences for optimal dense semantic embedding.
"""

import io
import csv
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def extract_text_from_csv(file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    """
    Parses CSV and converts each row into a readable narrative format.
    Example: "[benefit_name]: Group Medical Insurance | [category]: Health | [coverage]: INR 700000"
    """
    rows_text = []

    try:
        import pandas as pd
        df = pd.read_csv(io.BytesIO(file_bytes))
        columns = df.columns.tolist()

        for idx, row in df.iterrows():
            row_items = []
            for col in columns:
                val = str(row[col]).strip()
                if val and val.lower() != "nan":
                    row_items.append(f"[{col}]: {val}")
            if row_items:
                rows_text.append(" | ".join(row_items))

        logger.info(f"Pandas parsed {len(rows_text)} structured rows from CSV: {filename}")
        return [{"page": 1, "text": "\n".join(rows_text)}]
    except ImportError:
        logger.warning("pandas not installed, falling back to standard library csv module.")
    except Exception as e:
        logger.warning(f"Pandas parsing failed ({e}), falling back to stdlib csv.")

    # Fallback to standard library csv
    try:
        content_str = file_bytes.decode("utf-8", errors="replace")
        reader = csv.reader(io.StringIO(content_str))
        headers = []
        for i, row in enumerate(reader):
            if i == 0:
                headers = row
            else:
                row_items = []
                for h_idx, val in enumerate(row):
                    h_name = headers[h_idx] if h_idx < len(headers) else f"col_{h_idx}"
                    if val.strip():
                        row_items.append(f"[{h_name}]: {val.strip()}")
                if row_items:
                    rows_text.append(" | ".join(row_items))

        return [{"page": 1, "text": "\n".join(rows_text)}]
    except Exception as csv_err:
        logger.error(f"Failed to parse CSV with standard library: {csv_err}")
        return [{"page": 1, "text": ""}]
