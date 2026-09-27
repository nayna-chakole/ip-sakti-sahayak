"""
IP Protection Analyzer
Integrates product classification with the existing Advanced RAG pipeline.
Analyzes the product across 7 IP categories:
1. Patent
2. Trademark
3. Geographical Indication (GI)
4. Copyright
5. Industrial Design
6. Plant Variety Protection
7. Traditional Knowledge / Prior Art
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from .ip_models import (
    ALL_IP_CATEGORIES,
    CATEGORY_PATENT,
    CATEGORY_TRADEMARK,
    CATEGORY_GI,
    CATEGORY_COPYRIGHT,
    CATEGORY_DESIGN,
    CATEGORY_PLANT_VARIETY,
    CATEGORY_TK_PRIOR_ART,
    OFFICIAL_SOURCE_LINKS,
    IP_STATUS_NEEDS_HUMAN_REVIEW
)
from .ip_rules import evaluate_product_ip_rules
from ..rag.retriever import retriever

CATEGORY_RAG_QUERIES = {
    CATEGORY_PATENT: "The Patents Act 1970 patentability section 3(p) traditional knowledge bar section 3(e) synergistic efficacy section 3(d)",
    CATEGORY_TRADEMARK: "Trade Marks Act 1999 section 9(1)(b) descriptive indications brand name nice classification class 5 ayush marks",
    CATEGORY_GI: "Geographical Indications of Goods Act 1999 section 2(e) definition section 9 prohibition generic indications",
    CATEGORY_COPYRIGHT: "The Copyright Act 1957 section 13(1) original literary and artistic works packaging artwork labels fair dealing",
    CATEGORY_DESIGN: "The Designs Act 2000 section 2(d) novel shape configuration containers bottles dispensers packaging",
    CATEGORY_PLANT_VARIETY: "Protection of Plant Varieties and Farmers Rights Act 2001 section 15 criteria registration medicinal plants",
    CATEGORY_TK_PRIOR_ART: "TKDL traditional knowledge digital library prior art search Section 6 biological diversity act NBA approval WIPO treaty"
}

INTERNATIONAL_CATEGORY_RAG_QUERIES = {
    CATEGORY_PATENT: "Patent Cooperation Treaty PCT Chapter 21 Article 33 prior art novelty botanical patentability",
    CATEGORY_TRADEMARK: "WIPO Madrid System trademark international botanical product classification Class 5",
    CATEGORY_GI: "WIPO Lisbon Agreement geographical indications appellations of origin botanical origin",
    CATEGORY_COPYRIGHT: "WIPO Berne Convention copyright original literary artistic packaging label",
    CATEGORY_DESIGN: "WIPO Hague System industrial designs bottle packaging container shape configuration",
    CATEGORY_PLANT_VARIETY: "UPOV Convention plant variety protection medicinal plants breeder rights",
    CATEGORY_TK_PRIOR_ART: "TKDL traditional knowledge WIPO IGC treaty genetic resources PCT Rule 33.1 prior art search Nagoya Protocol"
}

def analyze_product_ip(
    product_context: Dict[str, Any],
    jurisdiction: str = "India",
    language: str = "en"
) -> Dict[str, Any]:
    """
    Performs comprehensive IP Protection Analysis across the 7 IP categories
    using the existing RAG pipeline and product classification context.
    """
    lang = language.lower() if language in ["hi", "mr", "en"] else "en"
    product_name = product_context.get("productName", product_context.get("product_name", "Ayurvedic Formulation"))
    category_name = product_context.get("category", product_context.get("productCategory", "General Ayurvedic Product"))
    is_international = str(jurisdiction).strip().lower() == "international"

    # Step 1: Evaluate product-specific rules based on classification context
    rules_evaluation = evaluate_product_ip_rules(product_context, language=lang, jurisdiction=jurisdiction)

    analyzed_categories = []

    # Step 2: Query the existing RAG system for authentic statutory evidence per category
    for cat in ALL_IP_CATEGORIES:
        rule_data = rules_evaluation.get(cat, {})
        status = rule_data.get("status", IP_STATUS_NEEDS_HUMAN_REVIEW)
        reason = rule_data.get("reason", "Statutory assessment required.")
        provisions = rule_data.get("provisions", [])

        if is_international:
            rag_query = INTERNATIONAL_CATEGORY_RAG_QUERIES.get(cat, f"{cat} international intellectual property WIPO PCT treaties")
        else:
            rag_query = CATEGORY_RAG_QUERIES.get(cat, f"{cat} intellectual property ayush legal provisions")

        # Query existing RAG retriever (Qdrant ayush_legal_corpus + canonical corpus)
        evidence_items = retriever.retrieve(query=rag_query, jurisdiction=jurisdiction, limit=2)

        citations = []
        evidence_snippets = []

        if evidence_items:
            for item in evidence_items:
                doc = item.get("document", "Statutory Reference")
                sec = item.get("section", "")
                heading = item.get("title", "")
                text = item.get("text", "")
                auth = item.get("authority", "")
                jur = item.get("jurisdiction", jurisdiction)
                src_url = item.get("sourceUrl", "https://www.wipo.int/pct/en/" if is_international else "https://ipindia.gov.in")

                citations.append({
                    "document": doc,
                    "section": sec,
                    "heading": heading,
                    "text": text,
                    "textSnippet": (text[:220] + "...") if len(text) > 220 else text,
                    "authority": auth,
                    "jurisdiction": jur,
                    "source": f"{doc} - {sec} ({heading})" if sec else doc,
                    "sourceUrl": src_url,
                    "status": "VERIFIED_STATUTE"
                })

                if text:
                    snippet = f"{sec} ({doc}): \"{text[:180]}...\"" if len(text) > 180 else f"{sec} ({doc}): \"{text}\""
                    evidence_snippets.append(snippet)

        # Build grounded evidence narrative
        if evidence_snippets:
            evidence_str = " | ".join(evidence_snippets)
        else:
            if lang == "hi":
                evidence_str = "अपर्याप्त आधिकारिक साक्ष्य मिले। मानव/कानूनी समीक्षा की सिफारिश की जाती है।"
            elif lang == "mr":
                evidence_str = "पुरेसे अधिकृत पुरावे आढळले नाहीत. मानवी/कायदेशीर पुनरावलोकनाची शिफारस केली जाते."
            else:
                evidence_str = "Insufficient authoritative evidence found. Human/legal review is recommended."

        official_links = OFFICIAL_SOURCE_LINKS.get(cat, [])
        if is_international:
            # Prioritize international links
            intl_links = [l for l in official_links if "wipo" in l.get("url", "") or "pct" in l.get("url", "") or "cbd" in l.get("url", "") or "csir" in l.get("url", "")]
            if intl_links:
                official_links = intl_links

        analyzed_categories.append({
            "category": cat,
            "status": status,
            "reason": reason,
            "provisions": provisions,
            "evidence": evidence_str,
            "citations": citations,
            "sources": [c["source"] for c in citations],
            "officialLinks": official_links
        })

    # Localized header/summary
    if is_international:
        if lang == "hi":
            summary_text = f"उत्पाद '{product_name}' ({category_name}) का 7 अंतरराष्ट्रीय बौद्धिक संपदा श्रेणियों (PCT, WIPO, TKDL) में विश्लेषण पूरा किया गया।"
        elif lang == "mr":
            summary_text = f"'{product_name}' ({category_name}) या उत्पादनाचे 7 आंतरराष्ट्रीय बौद्धिक संपदा प्रकारांमध्ये (PCT, WIPO, TKDL) विश्लेषण पूर्ण झाले."
        else:
            summary_text = f"Comprehensive International IP Protection Analysis completed for '{product_name}' ({category_name}) across 7 statutory intellectual property categories (PCT, WIPO, TKDL)."
    else:
        if lang == "hi":
            summary_text = f"उत्पाद '{product_name}' का वर्गीकरण '{category_name}' के आधार पर 7 प्रमुख बौद्धिक संपदा श्रेणियों में विश्लेषण पूरा किया गया।"
        elif lang == "mr":
            summary_text = f"'{product_name}' या उत्पादनाचे वर्गीकरण '{category_name}' नुसार ७ प्रमुख बौद्धिक संपदा प्रकारांमध्ये विश्लेषण पूर्ण झाले."
        else:
            summary_text = f"Comprehensive IP Protection Analysis completed for '{product_name}' ({category_name}) across 7 statutory intellectual property categories."

    return {
        "productName": product_name,
        "classificationCategory": category_name,
        "jurisdiction": jurisdiction,
        "language": lang,
        "summary": summary_text,
        "ipCategories": analyzed_categories,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
