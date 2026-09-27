"""
IP-SAKTI Sahayak / JurifyLaw: Statutory Re-Ranker
Applies multi-factor legal scoring, intent alignment, jurisdiction calibration,
and diversity penalties to provide optimal statutory evidence ordering.
"""

import re
from typing import List, Dict, Any

class StatutoryReranker:
    def __init__(self):
        pass

    def rerank(
        self,
        retrieved_items: List[Dict[str, Any]],
        processed_query: Dict[str, Any],
        target_jurisdiction: str = "India",
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """Re-ranks retrieved statutory provisions using multi-dimensional legal relevance factors."""
        if not retrieved_items:
            return []

        intent = processed_query.get("intent", "GENERAL_AYUSH_IP")
        detected_sections = processed_query.get("detected_sections", [])
        expanded_terms = processed_query.get("expanded_terms", [])
        query_text = processed_query.get("normalized_query", "")

        reranked = []
        seen_acts = {}

        for item in retrieved_items:
            item_jur = item.get("jurisdiction", "India").lower()
            if target_jurisdiction and target_jurisdiction.lower() != "both":
                if target_jurisdiction.lower() == "international" and "international" not in item_jur:
                    continue
                elif target_jurisdiction.lower() == "india" and "india" not in item_jur:
                    continue

            base_score = float(item.get("score", 1.0))
            sec_lower = item.get("section", "").lower()
            doc_id = item.get("document_id", item.get("document", ""))
            clean_sec = re.sub(r'[\s\(\)]', '', sec_lower)

            boosts = {}

            # 1. Exact Section Match Boost
            section_match_score = 0.0
            for ds in detected_sections:
                clean_ds = re.sub(r'[\s\(\)]', '', ds.lower())
                if clean_ds in clean_sec or clean_sec in clean_ds:
                    section_match_score = 12.0
                    break
            boosts["section_match"] = section_match_score

            # 2. Intent Alignment Boost
            intent_boost = 0.0
            if target_jurisdiction.lower() == "international":
                if "international" in doc_id or "pct" in sec_lower or "trips" in sec_lower or "nagoya" in sec_lower or "fda" in sec_lower or "thmpd" in sec_lower or "wipo" in doc_id.lower():
                    intent_boost = 6.0
                elif "biological_diversity" in doc_id and "section 3" in sec_lower:
                    intent_boost = 4.0
            else:
                if intent == "PATENTABILITY_TRADITIONAL_KNOWLEDGE_BAR" and ("patents_act" in doc_id or "3(p)" in sec_lower):
                    intent_boost = 6.0
                elif intent == "PATENTABILITY_SYNERGY_ADMIXTURE" and ("patents_act" in doc_id or "3(e)" in sec_lower):
                    intent_boost = 6.0
                elif intent == "ABS_BIODIVERSITY_COMPLIANCE" and ("biological_diversity" in doc_id or "section 3" in sec_lower or "section 6" in sec_lower or "section 7" in sec_lower):
                    intent_boost = 6.5
                elif intent == "DRUG_REGULATORY_LICENSING" and ("drugs_and_cosmetics" in doc_id or "schedule t" in sec_lower or "158b" in sec_lower or "3(a)" in sec_lower or "3(h)" in sec_lower):
                    intent_boost = 6.0
                elif intent == "AYURVEDA_AAHAR_FOOD_SUPPLEMENT" and ("ayurveda_aahar" in doc_id or "regulation" in sec_lower):
                    intent_boost = 7.0
                elif intent == "EXPORT_INTERNATIONAL_REGIME" and ("international" in doc_id or "fda" in sec_lower or "thmpd" in sec_lower):
                    intent_boost = 6.0
            boosts["intent_affinity"] = intent_boost

            # 3. Term Overlap with Expanded Synonyms
            term_score = 0.0
            searchable = f"{item.get('title', '')} {item.get('text', '')} {' '.join(item.get('keywords', []))}".lower()
            for term in expanded_terms:
                if term in searchable:
                    term_score += 1.5
            boosts["term_expansion"] = min(6.0, term_score)

            # 4. Jurisdiction Calibration
            jur_boost = 0.0
            item_jur = item.get("jurisdiction", "India")
            if target_jurisdiction.lower() in item_jur.lower() or "international" in item_jur.lower():
                jur_boost = 2.0
            boosts["jurisdiction"] = jur_boost

            # 5. Diversity Penalty
            act_count = seen_acts.get(doc_id, 0)
            diversity_multiplier = 1.0 / (1.0 + 0.35 * act_count)

            final_score = (base_score + sum(boosts.values())) * diversity_multiplier
            seen_acts[doc_id] = act_count + 1

            re_item = dict(item)
            re_item["score"] = round(final_score, 3)
            re_item["rerank_breakdown"] = boosts
            reranked.append(re_item)

        reranked.sort(key=lambda x: x["score"], reverse=True)
        return reranked[:top_k]

# Singleton instance
reranker = StatutoryReranker()
