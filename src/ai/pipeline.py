"""
Top-level pipeline forwarding to src.ai.rag.pipeline
"""
from .rag.pipeline import rag_pipeline, AyushRAGPipeline

__all__ = ["rag_pipeline", "AyushRAGPipeline"]
