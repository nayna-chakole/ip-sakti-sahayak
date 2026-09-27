"""
IP-SAKTI Sahayak / JurifyLaw: Python Statutory Advanced RAG Pipeline
Orchestrates query processing, hybrid Qdrant/statutory retrieval, re-ranking,
context building, multilingual statutory synthesis, and citation validation.
"""

from typing import Dict, Any, Optional
from .advanced_rag import advanced_rag_engine, AdvancedRAGEngine
from .corpus import STATUTORY_CORPUS

class AyushRAGPipeline:
    def __init__(self):
        self.engine = advanced_rag_engine

    def ask(
        self,
        query: str,
        jurisdiction: str = "India",
        classification_category: Optional[Any] = None,
        language: str = "en",
        limit: int = 4
    ) -> Dict[str, Any]:
        """Execute complete Advanced RAG pipeline strictly without external LLM dependencies."""
        return self.engine.query(
            user_query=query,
            jurisdiction=jurisdiction,
            classification_category=classification_category,
            language=language,
            limit=limit
        )

    def get_knowledge_base(self) -> Dict[str, Any]:
        """Return all indexed statutory documents."""
        return {"documents": STATUTORY_CORPUS}

rag_pipeline = AyushRAGPipeline()
