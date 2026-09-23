"""
Unit Tests for Embeddings Subsystem
Supports both pytest and standard unittest runner.
"""

import unittest
from app.ingestion.embedder import embedding_service


class TestEmbeddings(unittest.TestCase):
    def test_embedding_dimension(self):
        texts = ["Minimum attendance is 75 percent.", "Leave entitlement is 24 days."]
        embeddings = embedding_service.embed_texts(texts)

        self.assertEqual(len(embeddings), 2)
        self.assertEqual(len(embeddings[0]), embedding_service.dimension)

    def test_embedding_normalization(self):
        import math
        query = "What is the attendance policy?"
        vec = embedding_service.embed_query(query)

        norm = math.sqrt(sum(x * x for x in vec))
        self.assertAlmostEqual(norm, 1.0, places=3)

    def test_semantic_similarity_relative_order(self):
        query = "attendance requirement for students"
        text_relevant = "Students must maintain 75% minimum classroom attendance."
        text_irrelevant = "The cafeteria serves fresh fruit smoothies on Wednesday mornings."

        q_vec = embedding_service.embed_query(query)
        rel_vec = embedding_service.embed_query(text_relevant)
        irrel_vec = embedding_service.embed_query(text_irrelevant)

        sim_relevant = sum(a * b for a, b in zip(q_vec, rel_vec))
        sim_irrelevant = sum(a * b for a, b in zip(q_vec, irrel_vec))

        self.assertGreater(sim_relevant, sim_irrelevant)


if __name__ == "__main__":
    unittest.main()
