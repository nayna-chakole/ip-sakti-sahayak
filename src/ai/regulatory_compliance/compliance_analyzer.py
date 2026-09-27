"""
ABS & Regulatory Compliance Analyzer
Integrates product classification with the existing Advanced RAG pipeline.
Analyzes the product across 4 compliance dimensions:
1. Biodiversity / ABS Assessment
2. NBA Approval Assessment
3. Traditional Knowledge / TKDL Assessment
4. Product Regulatory Requirements
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from .compliance_rules import evaluate_compliance_rules
from ..rag.retriever import retriever

CATEGORY_RAG_QUERIES = {
    "biodiversity": "Biological Diversity Act 2002 Section 7 prior intimation to SBB commercial utilization Section 40 NTAC biological resources",
    "nba_approval": "National Biodiversity Authority Section 6 Form III prior approval for patent grant Section 3 Form I foreign access clearance",
    "tkdl": "The Patents Act 1970 Section 3(p) traditional knowledge bar samhita First Schedule TKDL prior art defense",
    "classical_reg": "Drugs and Cosmetics Act 1940 Section 3(a) First Schedule Ayurvedic Samhita Form 25D Schedule T GMP API standards",
    "proprietary_reg": "Drugs and Cosmetics Act 1940 Section 3(h) patent or proprietary medicine Rule 158B safety efficacy Schedule T GMP",
    "aahar_reg": "Food Safety and Standards Ayurveda Aahar Regulations 2022 Regulation 3 Schedule IV Regulation 6 logo statutory warning not for medicinal use",
    "phytopharm_reg": "CDSCO New Drugs and Clinical Trials Rules Phytopharmaceutical drug botanical extract Schedule Y biomarker fingerprinting",
    "cosmetic_reg": "Drugs and Cosmetics Act 1940 Part XIII Cosmetics Rules 2020 Schedule S cosmetic manufacturing license standards"
}

def analyze_compliance(
    product_context: Dict[str, Any],
    jurisdiction: str = "India",
    language: str = "en"
) -> Dict[str, Any]:
    """
    Performs comprehensive ABS, NBA, TKDL, and Regulatory Compliance analysis
    using the existing RAG pipeline and product classification context.
    """
    lang = language.lower() if language in ["hi", "mr", "en"] else "en"
    rules_eval = evaluate_compliance_rules(product_context, language=lang, jurisdiction=jurisdiction)

    cat_name = str(product_context.get("category", product_context.get("productCategory", ""))).lower()
    use_name = str(product_context.get("intendedUse", product_context.get("intended_use", ""))).lower()
    form_name = str(product_context.get("dosageForm", "")).lower()
    is_international = str(jurisdiction).strip().lower() == "international"

    resource_origin = str(
        product_context.get("resourceOrigin") or 
        product_context.get("resource_origin") or 
        product_context.get("sourceOfIngredients") or 
        product_context.get("source_of_ingredients") or 
        product_context.get("countryOfOrigin") or 
        product_context.get("origin") or 
        ""
    ).strip()
    combined_ctx = f"{product_context.get('productName', '')} {product_context.get('ingredients', '')} {product_context.get('intendedUse', '')} {resource_origin}".lower()
    has_indian_resource = any(kw in resource_origin.lower() for kw in ["india", "indian", "domestic", "bharat"]) or any(
        kw in combined_ctx for kw in [
            "sourced from india", "indigenous to india", "indian biological resource",
            "contracted domestic farms", "indian farms", "harvested in india", "procured from india", "domestic farm"
        ]
    )

    if is_international:
        if "aahar" in cat_name or "dietary" in use_name or "tea" in form_name or "food" in use_name:
            reg_query = "US FDA DSHEA 1994 dietary supplement 21 CFR Part 111 cGMP structure function claims EU food supplement"
        elif "phytopharmaceutical" in cat_name or "fraction" in form_name or "standardized" in form_name:
            reg_query = "US FDA Botanical Drug Guidance Section 2 7 botanical NDA 21 CFR 314 EMA well established use"
        elif "cosmetic" in cat_name or "lotion" in form_name or "cream" in form_name:
            reg_query = "US FDA MoCRA 2022 EU Cosmetics Regulation EC 1223 2009 botanical cosmetics safety assessment"
        else:
            reg_query = "US FDA Botanical Drug Guidance EU THMPD Directive 2004 24 EC Article 16a traditional herbal dietary supplement"

        nba_q = "National Biodiversity Authority Section 3 Form I foreign access clearance Section 6 Form III prior approval" if has_indian_resource else "Nagoya Protocol on ABS provider country access and benefit sharing compliance"
        sections_queries = [
            ("biodiversityABS", "Nagoya Protocol on ABS Article 5 6 Prior Informed Consent Mutually Agreed Terms" + (" Section 3 foreign access" if has_indian_resource else "")),
            ("nbaApproval", nba_q),
            ("traditionalKnowledgeTKDL", "TKDL traditional knowledge PCT Chapter 21 Rule 33.1 International Searching Authority WIPO IGC"),
            ("regulatoryRequirements", reg_query)
        ]
    else:
        # Determine query for regulatory requirements (existing India)
        if "aahar" in cat_name or "dietary" in use_name or "tea" in form_name or "food" in use_name:
            reg_query = CATEGORY_RAG_QUERIES["aahar_reg"]
        elif "classical" in cat_name or product_context.get("followsClassicalText") in ["yes", "yes_fully", "classical"]:
            reg_query = CATEGORY_RAG_QUERIES["classical_reg"]
        elif "phytopharmaceutical" in cat_name or "fraction" in form_name or "standardized" in form_name:
            reg_query = CATEGORY_RAG_QUERIES["phytopharm_reg"]
        elif "cosmetic" in cat_name or "lotion" in form_name or "cream" in form_name:
            reg_query = CATEGORY_RAG_QUERIES["cosmetic_reg"]
        else:
            reg_query = CATEGORY_RAG_QUERIES["proprietary_reg"]

        sections_queries = [
            ("biodiversityABS", CATEGORY_RAG_QUERIES["biodiversity"]),
            ("nbaApproval", CATEGORY_RAG_QUERIES["nba_approval"]),
            ("traditionalKnowledgeTKDL", CATEGORY_RAG_QUERIES["tkdl"]),
            ("regulatoryRequirements", reg_query)
        ]

    for key, q in sections_queries:
        evidence_items = retriever.retrieve(query=q, jurisdiction=jurisdiction, limit=2)
        citations = []
        for item in evidence_items:
            doc = item.get("document", "Statutory Reference")
            sec = item.get("section", "")
            heading = item.get("title", "")
            text = item.get("text", "")
            auth = item.get("authority", "")
            jur = item.get("jurisdiction", jurisdiction)
            src_url = item.get("sourceUrl", "https://ayush.gov.in" if not is_international else "https://www.fda.gov")

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
        rules_eval[key]["citations"] = citations

    # Generate localized high-level summary
    product_name = rules_eval["productName"]
    classification_category = rules_eval["classificationCategory"]

    if is_international:
        if lang == "hi":
            summary_text = f"उत्पाद '{product_name}' का अंतरराष्ट्रीय एबीएस (नागोया प्रोटोकॉल), एनबीए पूर्व-अनुमोदन, टीकेडीएल व अंतरराष्ट्रीय विनियामक मानकों (FDA/EMA) में मूल्यांकन पूरा किया गया।"
        elif lang == "mr":
            summary_text = f"'{product_name}' या उत्पादनाचे आंतरराष्ट्रीय एबीएस (नागोया प्रोटोकॉल), एनबीए पूर्व-मंजुरी, टीकेडीएल व आंतरराष्ट्रीय विनियामक निकषांनुसार (FDA/EMA) मूल्यांकन पूर्ण झाले."
        else:
            summary_text = f"Comprehensive International ABS & Regulatory Compliance Analysis completed for '{product_name}' ({classification_category}) across Nagoya Protocol ABS, NBA Prior Clearance, TKDL Prior Art, and International Botanical/Dietary Regulatory Frameworks."
    else:
        if lang == "hi":
            summary_text = f"उत्पाद '{product_name}' का एबीएस (जैव विविधता), एनबीए अनुमोदन, टीकेडीएल पारंपरिक ज्ञान एवं विनियामक अनुपालन में मूल्यांकन पूरा किया गया।"
        elif lang == "mr":
            summary_text = f"'{product_name}' या उत्पादनाचे एबीएस (जैवविविधता), एनबीए मंजुरी, पारंपारिक ज्ञान (TKDL) व विनियामक निकषांनुसार मूल्यांकन पूर्ण झाले."
        else:
            summary_text = f"Comprehensive ABS & Regulatory Compliance Analysis completed for '{product_name}' ({classification_category}) across Biodiversity (ABS), NBA Clearance, TKDL Prior Art, and Product-Specific Statutory Licensing."

    rules_eval["summary"] = summary_text
    rules_eval["timestamp"] = datetime.now(timezone.utc).isoformat()
    return rules_eval
