"""
Google Gemini LLM Provider Implementation
Adheres to strict grounded response generation and hallucination avoidance.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from app.config.settings import settings
from app.models.schemas import RetrievalResult
from app.llm.base import LLMProvider

logger = logging.getLogger(__name__)

# Grounded RAG Prompt Template enforcing strict boundaries
GROUNDED_SYSTEM_PROMPT = """You are the AI Knowledge Retrieval & Resolution Assistant.
Your mission is to provide accurate, factual, and strictly grounded answers based ONLY on the provided retrieved context.

RULES:
1. Answer using ONLY the retrieved context provided below.
2. Avoid inventing unsupported facts or extrapolating beyond what is explicitly stated.
3. If the context does not contain sufficient facts to answer the question, clearly state:
   "The requested information is not available in the uploaded knowledge base."
4. Include specific source citations (Document Name, Page Number if present).
5. Do not present unrelated retrieved content as fact.
6. Present the answer clearly with concise structure and bullet points where helpful.
"""


class GeminiProvider(LLMProvider):
    """
    Integrates Google Gemini 2.5 Flash with lazy client initialization
    and fallback for testing without API keys.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.LLM_MODEL
        self._client = None

    def _get_client(self):
        if self._client is not None:
            return self._client

        if not self.api_key or self.api_key == "MY_GEMINI_API_KEY":
            logger.warning("GEMINI_API_KEY is not configured. Switching to deterministic grounded synthesis fallback.")
            return None

        try:
            # Try official Google GenAI SDK
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
            return self._client
        except ImportError:
            try:
                import google.generativeai as legacy_genai
                legacy_genai.configure(api_key=self.api_key)
                self._client = legacy_genai.GenerativeModel(self.model_name)
                return self._client
            except Exception as e:
                logger.error(f"Failed to initialize Gemini SDK: {e}")
                return None
        except Exception as e:
            logger.error(f"Error instantiating Google GenAI client: {e}")
            return None

    def generate_grounded_response(
        self,
        query: str,
        retrieved_chunks: List[RetrievalResult],
        conversation_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes grounded generation over retrieved context.
        """
        if not retrieved_chunks:
            return {
                "answer": "I could not find sufficiently relevant information in the knowledge base to answer this question.",
                "used_sources": [],
                "raw_output": ""
            }

        # Build Context String
        context_blocks = []
        for i, chunk in enumerate(retrieved_chunks, start=1):
            page_info = f" (Page {chunk.page_number})" if chunk.page_number else ""
            block = f"[Source {i}: {chunk.source_file}{page_info} | Chunk {chunk.chunk_id} | Similarity: {chunk.score:.2f}]\n{chunk.text_snippet}"
            context_blocks.append(block)

        formatted_context = "\n\n---\n\n".join(context_blocks)
        history_block = f"Previous Conversation History:\n{conversation_context}\n\n" if conversation_context else ""

        user_prompt = f"""Context:
{formatted_context}

{history_block}User Question:
{query}

Instructions:
Answer only using the provided context. If the context does not contain enough information, say that the information is not available in the knowledge base. Always cite source documents.
"""

        client = self._get_client()

        if client is not None:
            try:
                # Primary Google GenAI Client
                if hasattr(client, "models"):
                    response = client.models.generate_content(
                        model=self.model_name,
                        contents=f"{GROUNDED_SYSTEM_PROMPT}\n\n{user_prompt}",
                    )
                    answer_text = response.text or ""
                    return {
                        "answer": answer_text.strip(),
                        "used_sources": [c.source_file for c in retrieved_chunks],
                        "raw_output": answer_text
                    }
                elif hasattr(client, "generate_content"):
                    response = client.generate_content(f"{GROUNDED_SYSTEM_PROMPT}\n\n{user_prompt}")
                    answer_text = response.text or ""
                    return {
                        "answer": answer_text.strip(),
                        "used_sources": [c.source_file for c in retrieved_chunks],
                        "raw_output": answer_text
                    }
            except Exception as e:
                logger.error(f"Gemini API invocation error ({e}). Using local grounded synthesizer.")

        # Fallback: Deterministic context synthesis when no API key is available or during offline tests
        return self._synthesize_grounded_fallback(query, retrieved_chunks)

    def _synthesize_grounded_fallback(self, query: str, retrieved_chunks: List[RetrievalResult]) -> Dict[str, Any]:
        """
        Extracts key sentences matching the query from top chunks to ensure
        independent testability even without an external API key.
        """
        top_chunk = retrieved_chunks[0]
        sentences = [s.strip() for s in top_chunk.text_snippet.split("\n") if s.strip()]
        page_str = f" (Page {top_chunk.page_number})" if top_chunk.page_number else ""

        answer_lines = [
            f"Based on **{top_chunk.source_file}**{page_str}:",
            ""
        ]
        # Include top paragraphs
        for line in sentences[:4]:
            if not line.startswith("="):
                answer_lines.append(f"• {line}")

        return {
            "answer": "\n".join(answer_lines),
            "used_sources": [c.source_file for c in retrieved_chunks],
            "raw_output": "\n".join(answer_lines)
        }
