"""
Unit Tests for Document Chunking Subsystem
Supports both pytest and standard unittest runner.
"""

import unittest
from app.ingestion.chunker import DocumentChunker


class TestDocumentChunker(unittest.TestCase):
    def test_chunker_basic_splitting(self):
        chunker = DocumentChunker(chunk_size=100, chunk_overlap=20)
        words = [f"word{i}" for i in range(200)]
        text = " ".join(words)

        pages = [{"page": 1, "text": text}]
        chunks = chunker.chunk_document_pages(
            pages_data=pages,
            document_id="TEST_DOC",
            source_file="test.txt"
        )

        self.assertGreater(len(chunks), 1)
        self.assertEqual(chunks[0].document_id, "TEST_DOC")
        self.assertEqual(chunks[0].chunk_index, 1)
        self.assertEqual(chunks[0].source_file, "test.txt")
        self.assertEqual(chunks[0].page_number, 1)
        self.assertIn("word0", chunks[0].text)

    def test_chunker_small_text_no_split(self):
        chunker = DocumentChunker(chunk_size=500, chunk_overlap=50)
        text = "This is a short policy statement consisting of few words."
        pages = [{"page": 1, "text": text}]

        chunks = chunker.chunk_document_pages(
            pages_data=pages,
            document_id="SHORT_DOC",
            source_file="short.txt"
        )

        self.assertEqual(len(chunks), 1)
        self.assertEqual(chunks[0].text, text)
        self.assertEqual(chunks[0].chunk_id, "SHORT_DOC_CHUNK_001")

    def test_chunker_preserves_page_numbers(self):
        chunker = DocumentChunker(chunk_size=500, chunk_overlap=50)
        pages = [
            {"page": 1, "text": "Page one content about attendance requirement."},
            {"page": 2, "text": "Page two content about condonation process."}
        ]

        chunks = chunker.chunk_document_pages(
            pages_data=pages,
            document_id="MULTI_PAGE_DOC",
            source_file="handbook.pdf"
        )

        self.assertEqual(len(chunks), 2)
        self.assertEqual(chunks[0].page_number, 1)
        self.assertEqual(chunks[1].page_number, 2)


if __name__ == "__main__":
    unittest.main()
