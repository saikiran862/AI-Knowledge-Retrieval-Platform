"""
Unit Tests for Retrieval Subsystem and Multi-Agent Resolution
Supports both pytest and standard unittest runner.
"""

import unittest
import tempfile
from pathlib import Path
from app.models.schemas import ChunkModel, QueryRequest
from app.retrieval.vector_store import FaissVectorStore
from app.ingestion.embedder import embedding_service
from app.orchestration.orchestrator import MultiAgentOrchestrator


class TestRetrieval(unittest.TestCase):
    def test_vector_store_add_and_search(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            store = FaissVectorStore(store_dir=Path(tmp_dir), dimension=embedding_service.dimension)

            chunks = [
                ChunkModel(
                    chunk_id="C001",
                    document_id="DOC01",
                    chunk_index=1,
                    text="All students must maintain at least 75% attendance.",
                    source_file="attendance.txt",
                    page_number=1
                ),
                ChunkModel(
                    chunk_id="C002",
                    document_id="DOC02",
                    chunk_index=1,
                    text="Full-time employees receive 12 days casual leave annually.",
                    source_file="leave.txt",
                    page_number=1
                ),
            ]

            embeddings = embedding_service.embed_texts([c.text for c in chunks])
            store.add_chunks(chunks, embeddings)

            query = "What is the minimum attendance?"
            q_vec = embedding_service.embed_query(query)
            results = store.search(q_vec, top_k=2)

            self.assertEqual(len(results), 2)
            top_meta, top_score, rank = results[0]
            self.assertEqual(top_meta["chunk_id"], "C001")
            self.assertEqual(rank, 1)
            self.assertGreater(top_score, 0.25)

    def test_orchestrator_ambiguity_detection(self):
        orchestrator = MultiAgentOrchestrator()
        req = QueryRequest(query_text="What is the policy?", session_id="test_session")
        resp = orchestrator.resolve_query(req)

        self.assertTrue(resp.needs_clarification)
        self.assertGreater(len(resp.clarification_options), 0)


if __name__ == "__main__":
    unittest.main()
