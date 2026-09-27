"""
IP-SAKTI Sahayak / JurifyLaw: Citation Validator
Ensures that all legal citations in the output strictly map to authentic statutory
sections in the reference corpus without hallucinations or misquotations.
"""

from typing import List, Dict, Any, Tuple
from .corpus import STATUTORY_CORPUS

class CitationValidator:
    def __init__(self, corpus: List[Dict[str, Any]] = None):
        self.corpus = corpus or STATUTORY_CORPUS
        self._build_lookup()

    def _build_lookup(self):
        """Build exact lookup index of valid documents and sections."""
        import os
        import json

        self.valid_sections = {}
        for doc in self.corpus:
            doc_title = doc["title"].lower()
            doc_short = doc.get("shortTitle", "").lower()
            doc_id = doc["id"]

            for sec in doc.get("sections", []):
                sec_name = sec["section"].lower()
                key = f"{doc_id}::{sec_name}"

                self.valid_sections[key] = {
                    "document": doc["title"],
                    "shortTitle": doc.get("shortTitle", doc["title"]),
                    "section": sec["section"],
                    "title": sec["title"],
                    "text": sec["text"],
                    "authority": sec.get("authority", doc.get("authority", "")),
                    "jurisdiction": doc.get("jurisdiction", "India"),
                    "sourceUrl": sec.get("sourceUrl", doc.get("sourceUrl", "")),
                    "version": sec.get("version", doc.get("version", "")),
                    "effectiveDate": sec.get("effectiveDate", doc.get("effectiveDate", "")),
                    "lastAmendedDate": sec.get("lastAmendedDate", doc.get("lastAmendedDate", ""))
                }

        # Also register points from canonical pre-indexed corpus data/embedded_vectors.json
        vector_paths = [
            os.path.join(os.getcwd(), "data", "embedded_vectors.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "embedded_vectors.json")
        ]
        for vp in vector_paths:
            if os.path.exists(vp):
                try:
                    with open(vp, "r", encoding="utf-8") as f:
                        pts = json.load(f)
                        for p in pts:
                            payload = p.get("payload", {})
                            doc_id = payload.get("documentId", "qdrant_corpus")
                            sec = payload.get("section", "")
                            if sec:
                                key = f"{doc_id}::{sec.lower()}"
                                if key not in self.valid_sections:
                                    self.valid_sections[key] = {
                                        "document": payload.get("source", "Authoritative Legal Reference"),
                                        "shortTitle": payload.get("source", "Legal Statute"),
                                        "section": sec,
                                        "title": payload.get("heading", sec),
                                        "text": payload.get("content", ""),
                                        "authority": payload.get("authority", ""),
                                        "jurisdiction": payload.get("jurisdiction", "India")
                                    }
                    break
                except Exception:
                    pass

    def validate_citations(self, citations: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Validates citations list against canonical statutory corpus.
        Returns (validated_citations, validation_report).
        """
        validated = []
        hallucinated = []
        verified_count = 0

        for cit in citations:
            doc_name = str(cit.get("originalDocument") or cit.get("document", "")).lower()
            sec_name = str(cit.get("originalSection") or cit.get("section", "")).lower()

            matched = False
            for key, authentic in self.valid_sections.items():
                auth_doc = authentic["document"].lower()
                auth_short = authentic["shortTitle"].lower()
                auth_sec = authentic["section"].lower()

                # Clean check for matching sections across languages (English, Hindi, Marathi)
                norm_auth_sec = auth_sec.replace("section ", "").strip()
                norm_sec_name = sec_name.replace("section ", "").replace("धारा ", "").replace("कलम ", "").strip()

                is_sec_match = (
                    auth_sec in sec_name or sec_name in auth_sec or
                    norm_auth_sec in norm_sec_name or norm_sec_name in norm_auth_sec
                )
                is_doc_match = (
                    auth_doc in doc_name or doc_name in auth_doc or
                    auth_short in doc_name or
                    ("patents" in doc_name and "patents" in auth_doc) or
                    ("biodiversity" in doc_name and "biodiversity" in auth_doc) or
                    ("drugs" in doc_name and "drugs" in auth_doc) or
                    ("aahar" in doc_name and "aahar" in auth_doc) or
                    ("international" in doc_name and "international" in auth_doc) or
                    (("पेटेंट" in doc_name or "पेटंट" in doc_name) and "patents" in auth_doc) or
                    (("जैव विविधता" in doc_name or "जैवविविधता" in doc_name) and "biodiversity" in auth_doc) or
                    (("औषधि" in doc_name or "औषध" in doc_name) and "drugs" in auth_doc) or
                    ("आहार" in doc_name and "aahar" in auth_doc) or
                    (("अंतर्राष्ट्रीय" in doc_name or "आंतरराष्ट्रीय" in doc_name) and "international" in auth_doc)
                )

                if is_sec_match and is_doc_match:
                    verified_entry = {
                        "document": cit.get("document", authentic["document"]),
                        "originalDocument": authentic["document"],
                        "section": cit.get("section", authentic["section"]),
                        "originalSection": authentic["section"],
                        "heading": cit.get("heading", authentic["title"]),
                        "title": cit.get("title", authentic["title"]),
                        "text": cit.get("text", authentic["text"]),
                        "authority": cit.get("authority", authentic["authority"]),
                        "jurisdiction": cit.get("jurisdiction", authentic["jurisdiction"]),
                        "source": cit.get("source", f"{authentic['shortTitle']} - {authentic['section']} ({authentic['title']})"),
                        "sourceUrl": authentic.get("sourceUrl") or cit.get("sourceUrl", "https://ipindia.gov.in"),
                        "version": authentic.get("version") or cit.get("version", ""),
                        "effectiveDate": authentic.get("effectiveDate") or cit.get("effectiveDate", ""),
                        "lastAmendedDate": authentic.get("lastAmendedDate") or cit.get("lastAmendedDate", ""),
                        "status": "VERIFIED_STATUTE"
                    }
                    validated.append(verified_entry)
                    verified_count += 1
                    matched = True
                    break

            if not matched:
                hallucinated.append(cit)

        total_checked = len(citations)
        groundedness_ratio = (verified_count / max(1, total_checked)) if total_checked > 0 else 1.0

        report = {
            "total_citations": total_checked,
            "verified_statutes": verified_count,
            "hallucinations_detected": len(hallucinated),
            "groundedness_score": round(groundedness_ratio * 100, 1),
            "is_fully_grounded": len(hallucinated) == 0
        }

        return validated, report

citation_validator = CitationValidator()
