"""
Unit Tests for Document Ingestion & Text Cleaners
Supports both pytest and standard unittest runner.
"""

import unittest
from app.ingestion.cleaner import clean_and_normalize_text
from app.ingestion.txt_loader import extract_text_from_txt
from app.ingestion.csv_loader import extract_text_from_csv


class TestIngestion(unittest.TestCase):
    def test_clean_and_normalize_text(self):
        dirty_text = "Attend- \n ance   rate   is    high.\n\n\n\nMust be 75%."
        cleaned = clean_and_normalize_text(dirty_text)
        self.assertIn("attendance rate is high.", cleaned.lower())
        self.assertNotIn("\n\n\n\n", cleaned)
        self.assertIn("Must be 75%.", cleaned)

    def test_txt_loader(self):
        sample_bytes = "Employee policy on leave entitlement: 12 days CL.".encode("utf-8")
        result = extract_text_from_txt(sample_bytes, "leave.txt")
        self.assertEqual(len(result), 1)
        self.assertIn("12 days CL", result[0]["text"])
        self.assertEqual(result[0]["page"], 1)

    def test_csv_loader(self):
        csv_bytes = "benefit,coverage\nMedical,700000\nLife,300000\n".encode("utf-8")
        result = extract_text_from_csv(csv_bytes, "benefits.csv")
        self.assertEqual(len(result), 1)
        self.assertIn("benefit", result[0]["text"].lower())
        self.assertIn("700000", result[0]["text"])


if __name__ == "__main__":
    unittest.main()
