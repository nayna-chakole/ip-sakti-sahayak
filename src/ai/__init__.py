"""
IP-SAKTI Sahayak AI Package (Top-level namespace delegating to src.ai.rag)
"""

from .rag import (
    STATUTORY_CORPUS,
    retriever,
    StatutoryRetriever,
    reranker,
    StatutoryReranker,
    query_processor,
    QueryProcessor,
    context_builder,
    ContextBuilder,
    synthesizer,
    StatutorySynthesizer,
    citation_validator,
    CitationValidator,
    rrf_fuser,
    ReciprocalRankFusion,
    rag_evaluator,
    RAGEvaluator,
    advanced_rag_engine,
    AdvancedRAGEngine,
    rag_pipeline,
    AyushRAGPipeline
)

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
