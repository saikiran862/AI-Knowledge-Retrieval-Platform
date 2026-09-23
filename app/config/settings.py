"""
Application Configuration and Settings Module
Manages all environment variables and default parameters for RAG pipeline.
Includes standard library fallback if pydantic_settings is not yet installed.
"""

import os
from pathlib import Path

try:
    from pydantic_settings import BaseSettings
    from pydantic import Field

    class Settings(BaseSettings):
        # Base Paths
        BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
        DATA_DIR: Path = BASE_DIR / "data"
        VECTOR_STORE_PATH: Path = BASE_DIR / "vector_store"
        DATABASE_PATH: Path = BASE_DIR / "metadata.db"
        RESULTS_DIR: Path = BASE_DIR / "results"

        # API & App Info
        APP_NAME: str = "AI-Based Knowledge Retrieval Platform"
        APP_VERSION: str = "1.0.0"
        DEBUG: bool = False

        # LLM Settings
        GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key")
        LLM_MODEL: str = Field(default="gemini-2.5-flash", description="Model name for response generation")
        LLM_TEMPERATURE: float = 0.2
        LLM_MAX_OUTPUT_TOKENS: int = 1024

        # Embedding Settings
        EMBEDDING_MODEL: str = Field(
            default="sentence-transformers/all-MiniLM-L6-v2",
            description="Sentence Transformer model for dense embeddings"
        )
        EMBEDDING_DIMENSION: int = 384

        # Document Chunking Configuration
        CHUNK_SIZE: int = Field(default=500, description="Target chunk size in tokens/words")
        CHUNK_OVERLAP: int = Field(default=50, description="Chunk overlap in tokens/words")

        # Retrieval Configuration
        TOP_K: int = Field(default=3, description="Default Top-K retrieved chunks")
        SIMILARITY_THRESHOLD: float = Field(
            default=0.40,
            description="Minimum cosine similarity cutoff to accept chunk as relevant"
        )

        # Ingestion Constraints
        ALLOWED_EXTENSIONS: set = {".pdf", ".docx", ".txt", ".csv"}
        MAX_UPLOAD_SIZE_BYTES: int = 25 * 1024 * 1024  # 25MB

        class Config:
            env_file = ".env"
            env_file_encoding = "utf-8"
            extra = "ignore"

except ImportError:
    class Settings:
        BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
        DATA_DIR: Path = BASE_DIR / "data"
        VECTOR_STORE_PATH: Path = BASE_DIR / "vector_store"
        DATABASE_PATH: Path = BASE_DIR / "metadata.db"
        RESULTS_DIR: Path = BASE_DIR / "results"

        APP_NAME: str = "AI-Based Knowledge Retrieval Platform"
        APP_VERSION: str = "1.0.0"
        DEBUG: bool = False

        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
        LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-2.5-flash")
        LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.2"))
        LLM_MAX_OUTPUT_TOKENS: int = int(os.getenv("LLM_MAX_OUTPUT_TOKENS", "1024"))

        EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION", "384"))

        CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))
        CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "50"))

        TOP_K: int = int(os.getenv("TOP_K", "3"))
        SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.40"))

        ALLOWED_EXTENSIONS: set = {".pdf", ".docx", ".txt", ".csv"}
        MAX_UPLOAD_SIZE_BYTES: int = 25 * 1024 * 1024


# Global settings singleton instance
settings = Settings()

# Ensure runtime directories exist
settings.VECTOR_STORE_PATH.mkdir(parents=True, exist_ok=True)
settings.RESULTS_DIR.mkdir(parents=True, exist_ok=True)
