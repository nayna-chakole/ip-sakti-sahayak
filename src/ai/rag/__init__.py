"""
IP-SAKTI Sahayak / JurifyLaw: Advanced RAG Package
Exposes all components of the audited legal RAG pipeline.
"""

from .corpus import STATUTORY_CORPUS
from .retriever import retriever, StatutoryRetriever
from .reranker import reranker, StatutoryReranker
from .query_processor import query_processor, QueryProcessor
from .context_builder import context_builder, ContextBuilder
from .synthesizer import synthesizer, StatutorySynthesizer
from .citation_validator import citation_validator, CitationValidator
from .fusion import rrf_fuser, ReciprocalRankFusion
from .evaluator import rag_evaluator, RAGEvaluator
from .advanced_rag import advanced_rag_engine, AdvancedRAGEngine
from .pipeline import rag_pipeline, AyushRAGPipeline

__all__ = [
    "STATUTORY_CORPUS",
    "retriever",
    "StatutoryRetriever",
    "reranker",
    "StatutoryReranker",
    "query_processor",
    "QueryProcessor",
    "context_builder",
    "ContextBuilder",
    "synthesizer",
    "StatutorySynthesizer",
    "citation_validator",
    "CitationValidator",
    "rrf_fuser",
    "ReciprocalRankFusion",
    "rag_evaluator",
    "RAGEvaluator",
    "advanced_rag_engine",
    "AdvancedRAGEngine",
    "rag_pipeline",
    "AyushRAGPipeline"
]
