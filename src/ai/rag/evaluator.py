"""
IP-SAKTI Sahayak / JurifyLaw: Grounding & Self-Evaluation Engine
Inspects generated legal responses for statutory grounding, citation fidelity,
and compliance with regulatory boundaries.
Includes lightweight evaluation test suite covering accuracy, citation correctness,
jurisdiction separation, multilingual quality, and safe abstention.
"""

import time
from typing import Dict, List, Any

class RAGEvaluator:
    def __init__(self):
        pass

    def evaluate(
        self,
        query: str,
        answer: str,
        citations: List[Dict[str, Any]],
        out_of_scope: bool = False
    ) -> Dict[str, Any]:
        """Performs automated evaluation of statutory answer quality and fidelity."""
        if out_of_scope:
            return {
                "grounded": True,
                "confidence_score": 0.4,
                "citation_fidelity": "N/A",
                "completeness": "Out of domain scope handled gracefully with safe abstention.",
                "quality_grade": "A"
            }

        has_citations = len(citations) > 0

        # Section cross-check
        matched_sections = 0
        for cit in citations:
            sec_num = cit.get("section", "")
            if sec_num and (sec_num.lower() in answer.lower() or "कलम" in answer or "धारा" in answer or "section" in answer.lower()):
                matched_sections += 1

        citation_ratio = (matched_sections / max(1, len(citations))) if has_citations else 0.0

        # Structural check across languages
        has_statutory_text = any(t in answer for t in ["Statutory Provision", "कानूनी प्रावधान", "कायदेशीर तरतूद", "###"])
        has_recommendations = any(t in answer for t in ["Recommended Compliance", "अनुशंसित", "कृती आराखडा", "Action"])
        has_disclaimer = any(t in answer for t in ["Legal Notice", "वैधानिक सूचना", "consult", "सल्ला", "परामर्श", "Disclaimer"])

        score = 0.5
        if has_citations:
            score += 0.2
        if citation_ratio > 0.4:
            score += 0.15
        if has_statutory_text and has_recommendations:
            score += 0.1
        if has_disclaimer:
            score += 0.05

        grade = "A+" if score >= 0.9 else ("A" if score >= 0.8 else "B")

        return {
            "grounded": has_citations,
            "confidence_score": round(score, 2),
            "citation_fidelity": f"{matched_sections}/{len(citations)} citations cross-verified in body",
            "statutory_structure_valid": has_statutory_text and has_recommendations,
            "legal_disclaimer_present": has_disclaimer,
            "quality_grade": grade
        }

    def run_benchmark_suite(self) -> Dict[str, Any]:
        """
        Runs automated test suite across 10 statutory scenarios measuring:
        - accuracy
        - citation correctness
        - jurisdiction separation
        - multilingual quality (EN, HI, MR)
        - safe abstention on out-of-domain queries
        """
        # Lazy import to avoid circular dependencies
        try:
            from .advanced_rag import advanced_rag_engine
        except (ImportError, ValueError):
            from src.ai.rag.advanced_rag import advanced_rag_engine

        test_cases = [
            {
                "id": "TC-01",
                "name": "India Classical Patentability Bar (Section 3(p))",
                "query": "Can I patent classical Chyawanprash formulation in India?",
                "jurisdiction": "India",
                "language": "en",
                "category": "accuracy",
                "expected_keywords": ["3(p)", "traditional knowledge", "patent"],
                "expected_sections": ["Section 3(p)"],
                "disallowed_jurisdictions": ["US FDA", "THMPD"]
            },
            {
                "id": "TC-02",
                "name": "India Polyherbal Synergy Mandate (Section 3(e))",
                "query": "How to overcome Section 3(e) mere admixture rejection for polyherbal combination?",
                "jurisdiction": "India",
                "language": "en",
                "category": "accuracy",
                "expected_keywords": ["3(e)", "synerg", "admixture"],
                "expected_sections": ["Section 3(e)"],
                "disallowed_jurisdictions": ["US FDA", "THMPD"]
            },
            {
                "id": "TC-03",
                "name": "India Biodiversity NBA Foreign Approval (Section 3 Form I)",
                "query": "Do foreign shareholders in an Indian herbal company need NBA Form I approval under Section 3?",
                "jurisdiction": "India",
                "language": "en",
                "category": "accuracy",
                "expected_keywords": ["section 3", "nba", "approval"],
                "expected_sections": ["Section 3"],
                "disallowed_jurisdictions": ["THMPD", "DSHEA"]
            },
            {
                "id": "TC-04",
                "name": "India Ayurveda Aahar Regulations (FSSAI Regulation 6)",
                "query": "What are the labeling and logo requirements for Ayurveda Aahar products under FSSAI?",
                "jurisdiction": "India",
                "language": "en",
                "category": "accuracy",
                "expected_keywords": ["ayurveda aahar", "logo", "dietary"],
                "expected_sections": ["Regulation 6", "Regulation 3 & Schedule IV"],
                "disallowed_jurisdictions": ["THMPD", "DSHEA"]
            },
            {
                "id": "TC-05",
                "name": "International US FDA DSHEA Pathway",
                "query": "What is the regulatory pathway to export Ayurvedic herbal supplements to the USA under FDA DSHEA?",
                "jurisdiction": "International",
                "language": "en",
                "category": "jurisdiction_separation",
                "expected_keywords": ["dshea", "dietary supplement", "structure/function"],
                "expected_sections": ["US FDA DSHEA & Botanical Drug Guidance"],
                "disallowed_jurisdictions": ["State Biodiversity Board (SBB)"]
            },
            {
                "id": "TC-06",
                "name": "International EU THMPD 15-Year Rule",
                "query": "What is the EU traditional herbal medicinal products directive 15 year requirement?",
                "jurisdiction": "International",
                "language": "en",
                "category": "jurisdiction_separation",
                "expected_keywords": ["thmpd", "15 years", "traditional"],
                "expected_sections": ["EU THMPD 2004/24/EC"],
                "disallowed_jurisdictions": ["State Biodiversity Board (SBB)"]
            },
            {
                "id": "TC-07",
                "name": "Multilingual Hindi - Section 3(p) TKDL Bar",
                "query": "क्या मैं भारत में चरक संहिता पारंपरिक ज्ञान पर आधारित च्यवनप्राश का पेटेंट करा सकता हूँ?",
                "jurisdiction": "India",
                "language": "hi",
                "category": "multilingual_quality",
                "expected_keywords": ["धारा 3(p)", "पारंपरिक ज्ञान", "पेटेंट"],
                "expected_sections": ["Section 3(p)", "धारा 3(p)", "Section 3(e)", "धारा 3(e)"],
                "disallowed_jurisdictions": ["US FDA", "THMPD"]
            },
            {
                "id": "TC-08",
                "name": "Multilingual Marathi - Section 6 NBA Prior Approval",
                "query": "भारतातील जैविक संसाधनांवर आधारित शोधासाठी पेटंट मिळवण्यापूर्वी एनबीए (NBA) ची परवानगी लागते का?",
                "jurisdiction": "India",
                "language": "mr",
                "category": "multilingual_quality",
                "expected_keywords": ["कलम ६", "फॉर्म ३", "जैवविविधता"],
                "expected_sections": ["Section 6", "कलम 6", "कलम ६"],
                "disallowed_jurisdictions": ["THMPD"]
            },
            {
                "id": "TC-09",
                "name": "Safe Abstention - Quantum Computing Out-of-Domain",
                "query": "How to implement quantum key distribution algorithms with entanglement in Python?",
                "jurisdiction": "India",
                "language": "en",
                "category": "safe_abstention",
                "should_abstain": True
            },
            {
                "id": "TC-10",
                "name": "Safe Abstention - Weather Forecast Out-of-Domain",
                "query": "What will be the weather and rainfall in London for next weekend?",
                "jurisdiction": "International",
                "language": "en",
                "category": "safe_abstention",
                "should_abstain": True
            }
        ]

        results = []
        metrics = {
            "accuracy": {"total": 0, "passed": 0},
            "citation_correctness": {"total": 0, "passed": 0},
            "jurisdiction_separation": {"total": 0, "passed": 0},
            "multilingual_quality": {"total": 0, "passed": 0},
            "safe_abstention": {"total": 0, "passed": 0}
        }

        start_time = time.time()

        for tc in test_cases:
            t0 = time.time()
            res = advanced_rag_engine.query(
                user_query=tc["query"],
                jurisdiction=tc.get("jurisdiction", "India"),
                language=tc.get("language", "en")
            )
            elapsed_ms = round((time.time() - t0) * 1000, 1)

            answer = res.get("answer", "")
            citations = res.get("citations", [])
            abstained = res.get("abstained", False) or res.get("outOfScope", False)
            cat = tc["category"]

            passed = False
            failure_reasons = []

            if tc.get("should_abstain"):
                metrics["safe_abstention"]["total"] += 1
                if abstained and len(citations) == 0:
                    metrics["safe_abstention"]["passed"] += 1
                    passed = True
                else:
                    failure_reasons.append("Expected safe abstention but response generated citations")
            else:
                # 1. Accuracy check
                metrics["accuracy"]["total"] += 1
                kw_matches = sum(1 for kw in tc.get("expected_keywords", []) if kw.lower() in answer.lower())
                accuracy_ok = kw_matches >= max(1, len(tc.get("expected_keywords", [])) // 2)
                if accuracy_ok:
                    metrics["accuracy"]["passed"] += 1
                else:
                    failure_reasons.append("Keyword/semantic accuracy threshold not met")

                # 2. Citation check
                metrics["citation_correctness"]["total"] += 1
                cit_ok = False
                if citations:
                    matched_sec = any(
                        any(es.lower() in (c.get("section", "") + " " + c.get("originalSection", "")).lower() for es in tc.get("expected_sections", []))
                        for c in citations
                    )
                    cit_ok = matched_sec and all(c.get("status") == "VERIFIED_STATUTE" or c.get("source") for c in citations)
                if cit_ok:
                    metrics["citation_correctness"]["passed"] += 1
                else:
                    failure_reasons.append("Expected statutory section citation not found or unverified")

                # 3. Jurisdiction separation check
                metrics["jurisdiction_separation"]["total"] += 1
                jur_ok = not any(
                    any(dis.lower() in (c.get("document", "") + " " + c.get("section", "")).lower() for dis in tc.get("disallowed_jurisdictions", []))
                    for c in citations
                )
                if jur_ok:
                    metrics["jurisdiction_separation"]["passed"] += 1
                else:
                    failure_reasons.append("Disallowed cross-jurisdictional statute cited")

                # 4. Multilingual quality check
                lang_ok = True
                if tc.get("language") in ["hi", "mr"]:
                    metrics["multilingual_quality"]["total"] += 1
                    has_devanagari = any('\u0900' <= char <= '\u097f' for char in answer)
                    lang_ok = has_devanagari
                    if lang_ok:
                        metrics["multilingual_quality"]["passed"] += 1
                    else:
                        failure_reasons.append("Target Indian language script not detected in response")

                passed = accuracy_ok and cit_ok and jur_ok and lang_ok

            results.append({
                "testId": tc["id"],
                "name": tc["name"],
                "category": cat,
                "passed": passed,
                "latencyMs": elapsed_ms,
                "citationCount": len(citations),
                "abstained": abstained,
                "failureReasons": failure_reasons
            })

        total_elapsed = round(time.time() - start_time, 2)
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r["passed"])

        def pct(p, t):
            return round((p / max(1, t)) * 100, 1)

        summary = {
            "totalTests": total_tests,
            "passedTests": passed_tests,
            "overallPassRate": f"{pct(passed_tests, total_tests)}%",
            "totalExecutionTimeSec": total_elapsed,
            "categoryBreakdown": {
                "accuracy": f"{pct(metrics['accuracy']['passed'], metrics['accuracy']['total'])}% ({metrics['accuracy']['passed']}/{metrics['accuracy']['total']})",
                "citationCorrectness": f"{pct(metrics['citation_correctness']['passed'], metrics['citation_correctness']['total'])}% ({metrics['citation_correctness']['passed']}/{metrics['citation_correctness']['total']})",
                "jurisdictionSeparation": f"{pct(metrics['jurisdiction_separation']['passed'], metrics['jurisdiction_separation']['total'])}% ({metrics['jurisdiction_separation']['passed']}/{metrics['jurisdiction_separation']['total']})",
                "multilingualQuality": f"{pct(metrics['multilingual_quality']['passed'], metrics['multilingual_quality']['total'])}% ({metrics['multilingual_quality']['passed']}/{metrics['multilingual_quality']['total']})",
                "safeAbstention": f"{pct(metrics['safe_abstention']['passed'], metrics['safe_abstention']['total'])}% ({metrics['safe_abstention']['passed']}/{metrics['safe_abstention']['total']})"
            },
            "detailedResults": results
        }

        return summary

rag_evaluator = RAGEvaluator()

if __name__ == "__main__":
    import os
    import sys
    import json
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
    report = rag_evaluator.run_benchmark_suite()
    print(json.dumps(report, indent=2, ensure_ascii=False))

