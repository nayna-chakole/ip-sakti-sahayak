"""
IP-SAKTI Sahayak / JurifyLaw: Advanced RAG Engine
End-to-end statutory retrieval augmented generation pipeline strictly following:
User Query
→ language/query detection
→ query_processor.py
→ advanced_rag.py
→ retriever.py
→ Qdrant retrieval (collection: ayush_legal_corpus)
→ reranker.py
→ fusion.py
→ context_builder.py
→ synthesizer.py
→ citation_validator.py
→ final grounded answer
"""

from typing import Dict, Any, List, Optional
from .corpus import STATUTORY_CORPUS
from .query_processor import query_processor
from .retriever import retriever
from .reranker import reranker
from .context_builder import context_builder
from .synthesizer import synthesizer
from .citation_validator import citation_validator
from .fusion import rrf_fuser
from .evaluator import rag_evaluator

class AdvancedRAGEngine:
    def __init__(self):
        self.corpus = STATUTORY_CORPUS
        self.query_processor = query_processor
        self.retriever = retriever
        self.reranker = reranker
        self.context_builder = context_builder
        self.synthesizer = synthesizer
        self.citation_validator = citation_validator
        self.fuser = rrf_fuser
        self.evaluator = rag_evaluator

    def query(
        self,
        user_query: str,
        jurisdiction: str = "India",
        classification_category: Optional[Any] = None,
        language: str = "en",
        limit: int = 4
    ) -> Dict[str, Any]:
        """
        Executes the exact audited runtime flow:
        User Query
        → language/query detection
        → query_processor.py
        → advanced_rag.py
        → retriever.py
        → Qdrant retrieval
        → reranker.py
        → fusion.py
        → context_builder.py
        → synthesizer.py
        → citation_validator.py
        → final grounded answer
        """
        # Step 1: Language & Query Preprocessing
        processed_query = self.query_processor.process(
            query=user_query,
            context_jurisdiction=jurisdiction,
            explicit_language=language
        )

        detected_lang = processed_query.get("language", language or "en")
        effective_jurisdiction = processed_query.get("jurisdiction", jurisdiction)

        # Handle empty, incomplete, or out-of-domain query refusal
        if not user_query or len(user_query.strip()) < 3 or (not processed_query.get("is_domain_relevant") and not classification_category):
            refusal_result = self.synthesizer.synthesize(
                query=user_query,
                retrieved_evidence=[],
                jurisdiction=effective_jurisdiction,
                classification_context=classification_category,
                language=detected_lang
            )
            return refusal_result

        # Step 2: Multi-Path Retrieval via retriever.py (including Qdrant retrieval on collection: ayush_legal_corpus)
        path1_results = self.retriever.retrieve(
            query=user_query,
            jurisdiction=effective_jurisdiction,
            limit=8
        )

        expanded_query_str = " ".join(processed_query.get("anchor_keywords", []))
        path2_results = self.retriever.retrieve(
            query=expanded_query_str,
            jurisdiction=effective_jurisdiction,
            limit=8
        ) if expanded_query_str else []

        # Step 3: Re-ranking via reranker.py
        reranked_path1 = self.reranker.rerank(
            retrieved_items=path1_results,
            processed_query=processed_query,
            target_jurisdiction=effective_jurisdiction,
            top_k=8
        )

        reranked_path2 = self.reranker.rerank(
            retrieved_items=path2_results,
            processed_query=processed_query,
            target_jurisdiction=effective_jurisdiction,
            top_k=8
        ) if path2_results else []

        # Step 4: Result Fusion via fusion.py (Reciprocal Rank Fusion)
        candidate_lists = [reranked_path1]
        if reranked_path2:
            candidate_lists.append(reranked_path2)

        fused_evidence = self.fuser.fuse(candidate_lists, top_n=limit)

        # Step 5: Hierarchical Context Construction via context_builder.py
        context = self.context_builder.build_context(
            evidence=fused_evidence,
            processed_query=processed_query,
            classification_context=classification_category
        )

        # Step 6: Grounded Synthesis via synthesizer.py (strictly in target language)
        raw_synthesis = self.synthesizer.synthesize(
            query=user_query,
            retrieved_evidence=fused_evidence,
            jurisdiction=effective_jurisdiction,
            classification_context=classification_category,
            language=detected_lang
        )

        # Step 7: Citation Validation via citation_validator.py
        validated_citations, validation_report = self.citation_validator.validate_citations(
            raw_synthesis.get("citations", [])
        )

        # Step 8: Self-Evaluation & Grading via evaluator.py
        evaluation = self.evaluator.evaluate(
            query=user_query,
            answer=raw_synthesis.get("answer", ""),
            citations=validated_citations,
            out_of_scope=raw_synthesis.get("outOfScope", False)
        )

        # Compile final grounded answer envelope
        return {
            "answer": raw_synthesis.get("answer", ""),
            "citations": validated_citations,
            "confidence": raw_synthesis.get("confidence", "High"),
            "outOfScope": raw_synthesis.get("outOfScope", False),
            "abstained": raw_synthesis.get("outOfScope", False),
            "explanationDetails": {
                "jurisdictionUsed": effective_jurisdiction,
                "languageDetected": detected_lang,
                "intentDetected": processed_query.get("intent"),
                "detectedSections": processed_query.get("detected_sections", []),
                "detectedBotanicals": processed_query.get("detected_botanicals", []),
                "sourcesRetrieved": [ev["document"] for ev in fused_evidence],
                "relevantLegalSections": [ev["section"] for ev in fused_evidence],
                "retrievalRelevance": f"Matched {len(fused_evidence)} authoritative statutory sections with score {fused_evidence[0].get('score', 0) if fused_evidence else 0}",
                "citationValidation": validation_report,
                "qualityEvaluation": evaluation,
                "authoritiesInvolved": context.get("authorities_involved", [])
            }
        }

advanced_rag_engine = AdvancedRAGEngine()
