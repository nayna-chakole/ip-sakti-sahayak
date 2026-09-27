"""
IP-SAKTI Sahayak / JurifyLaw: Reciprocal Rank Fusion (RRF)
Combines multiple retrieval rankings (sparse lexical, semantic vector, intent-based)
into a unified calibrated relevance score without requiring heavy training weights.
"""

from typing import List, Dict, Any

class ReciprocalRankFusion:
    def __init__(self, k: int = 60):
        self.k = k

    def fuse(self, ranked_lists: List[List[Dict[str, Any]]], top_n: int = 6) -> List[Dict[str, Any]]:
        """
        Fuses multiple ranked candidate lists into a single consolidated ranking.
        score(d) = sum(1 / (k + rank_i(d)))
        """
        rrf_scores: Dict[str, float] = {}
        item_map: Dict[str, Dict[str, Any]] = {}

        for r_list in ranked_lists:
            for rank, item in enumerate(r_list, 1):
                key = f"{item.get('document', '')}::{item.get('section', '')}"
                if key not in item_map:
                    item_map[key] = item

                current = rrf_scores.get(key, 0.0)
                rrf_scores[key] = current + (1.0 / (self.k + rank))

        sorted_keys = sorted(rrf_scores.keys(), key=lambda k: rrf_scores[k], reverse=True)

        results = []
        for key in sorted_keys[:top_n]:
            item = dict(item_map[key])
            item["rrf_score"] = round(rrf_scores[key] * 100, 3)
            item["score"] = round(rrf_scores[key] * 100, 2)
            results.append(item)

        return results

rrf_fuser = ReciprocalRankFusion()
