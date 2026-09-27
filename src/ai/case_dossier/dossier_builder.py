"""
Case Dossier Builder
Aggregates the current formulation analysis into a structured statutory Case Dossier
strictly using existing results without generating duplicate conclusions or ungrounded claims.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
import re

from .dossier_models import (
    STATUS_ANALYSIS_COMPLETED,
    STATUS_DOSSIER_GENERATED,
    STATUS_REVIEW_REQUESTED,
    STATUS_SUBMITTED,
    STATUS_UNDER_REVIEW,
    STATUS_REVIEWED_CLOSED
)

def build_case_dossier(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Builds a comprehensive Case Dossier from existing product, classification,
    IP, compliance, and RAG data.
    """
    language = data.get("language", "en").lower()
    if language not in ["hi", "mr", "en"]:
        language = "en"

    # 1. Case Information
    incoming_id = data.get("caseId") or data.get("historyId") or data.get("id")
    if not incoming_id:
        rand_suffix = uuid.uuid4().hex[:6].upper()
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        case_id = f"CASE-{date_str}-{rand_suffix}"
    else:
        case_id = str(incoming_id)
        if not case_id.startswith("CASE-"):
            case_id = f"CASE-{case_id}"

    timestamp = data.get("timestamp") or datetime.now(timezone.utc).isoformat()
    jurisdiction = data.get("jurisdiction") or "India"

    applicant = data.get("applicant") or data.get("user") or {
        "id": "usr_guest",
        "name": "Ayush Applicant / Practitioner",
        "role": "Practitioner / Manufacturer",
        "email": "applicant@ip-sakti.gov.in"
    }

    # 2. Product Information
    product_context = data.get("productContext") or data.get("productSummary") or data.get("input") or {}
    product_name = (
        product_context.get("productName")
        or product_context.get("product_name")
        or data.get("productName")
        or "Ayurvedic Formulation"
    )
    ingredients = (
        product_context.get("ingredients")
        or data.get("ingredients")
        or "Not specified"
    )
    if isinstance(ingredients, list):
        ingredients = ", ".join(ingredients)

    intended_use = (
        product_context.get("intendedUse")
        or product_context.get("intended_use")
        or product_context.get("productDescription")
        or data.get("intendedUse")
        or "Not specified"
    )
    dosage_form = (
        product_context.get("dosageForm")
        or product_context.get("dosage_form")
        or product_context.get("formulation")
        or "Not specified"
    )
    follows_classical = (
        product_context.get("followsClassicalText")
        or product_context.get("classical_text_basis")
        or "Unspecified"
    )
    target_market = (
        product_context.get("targetMarket")
        or product_context.get("jurisdiction")
        or jurisdiction
    )

    product_info = {
        "productName": product_name,
        "ingredients": ingredients,
        "intendedUse": intended_use,
        "dosageForm": dosage_form,
        "followsClassicalText": follows_classical,
        "targetMarket": target_market,
        "sourceOfIngredients": product_context.get("sourceOfIngredients", "Indian domestic cultivators / suppliers"),
        "claimsMade": product_context.get("claimsMade", "Ayurvedic health & wellness formulation")
    }

    # 3. Product Classification
    classification_data = data.get("classification") or data.get("classificationResult") or {}
    classification_category = (
        classification_data.get("category")
        or data.get("category")
        or "Ayurvedic Medicine"
    )
    confidence = classification_data.get("confidence") or data.get("confidence") or "High"
    statutory_basis = classification_data.get("statutoryBasis") or "Drugs and Cosmetics Act, 1940"
    regulatory_pathway = (
        classification_data.get("regulatoryPathway")
        or classification_data.get("regulatoryFramework")
        or []
    )
    if isinstance(regulatory_pathway, str):
        regulatory_pathway = [regulatory_pathway]
    reasoning = classification_data.get("reasoning") or classification_data.get("classificationFactors") or []
    if isinstance(reasoning, str):
        reasoning = [reasoning]

    classification_info = {
        "category": classification_category,
        "confidence": confidence,
        "statutoryBasis": statutory_basis,
        "regulatoryPathway": regulatory_pathway,
        "reasoning": reasoning,
        "isUnambiguous": confidence == "High",
        "citations": classification_data.get("citations") or []
    }

    # 4. IP Protection Analysis (7 categories)
    # A. Patent, B. Trademark, C. Geographical Indication, D. Copyright,
    # E. Industrial Design, F. Plant Variety Protection, G. Traditional Knowledge / Prior Art
    STANDARD_IP_CATEGORIES = [
        ("Patent", "A"),
        ("Trademark", "B"),
        ("Geographical Indication (GI)", "C"),
        ("Copyright", "D"),
        ("Industrial Design", "E"),
        ("Plant Variety Protection", "F"),
        ("Traditional Knowledge / Prior Art", "G")
    ]

    ip_data = data.get("ipProtectionAnalysis") or data.get("ipData") or {}
    existing_ip_cats = ip_data.get("ipCategories") or []
    existing_ip_map = {c.get("category", "").lower(): c for c in existing_ip_cats if c.get("category")}

    normalized_ip_categories = []
    for cat_name, cat_letter in STANDARD_IP_CATEGORIES:
        found_item = existing_ip_map.get(cat_name.lower())
        if not found_item:
            # Check partial match
            for k, v in existing_ip_map.items():
                if cat_name.lower() in k or k in cat_name.lower():
                    found_item = v
                    break

        if found_item:
            normalized_ip_categories.append({
                "category": cat_name,
                "letterCode": cat_letter,
                "status": found_item.get("status", "Not Indicated"),
                "explanation": found_item.get("explanation") or found_item.get("reason", "Existing assessment recorded."),
                "reason": found_item.get("reason") or found_item.get("explanation", "Existing assessment recorded."),
                "legalProvisions": found_item.get("legalProvisions") or found_item.get("provisions", []),
                "provisions": found_item.get("provisions") or found_item.get("legalProvisions", []),
                "evidence": found_item.get("evidence", "Statutory rules and textual precedents applied."),
                "citations": found_item.get("citations", []),
                "sources": found_item.get("sources", []),
                "officialLinks": found_item.get("officialLinks", [])
            })
        else:
            normalized_ip_categories.append({
                "category": cat_name,
                "letterCode": cat_letter,
                "status": "Not available",
                "explanation": "Not evaluated in current session.",
                "reason": "Not evaluated in current session.",
                "legalProvisions": [],
                "provisions": [],
                "evidence": "Not available",
                "citations": [],
                "sources": [],
                "officialLinks": []
            })

    normalized_ip_data = {
        "productName": product_name,
        "classificationCategory": classification_category,
        "jurisdiction": jurisdiction,
        "language": language,
        "summary": ip_data.get("summary", ""),
        "ipCategories": normalized_ip_categories,
        "timestamp": ip_data.get("timestamp") or timestamp
    }

    # 5. ABS & Regulatory Compliance (4 pillars)
    compliance_data = data.get("complianceAnalysis") or data.get("complianceData") or {}
    bio_abs = compliance_data.get("biodiversityABS") or {}
    nba_approval = compliance_data.get("nbaApproval") or {}
    tkdl_section = compliance_data.get("traditionalKnowledgeTKDL") or {}
    reg_reqs = compliance_data.get("regulatoryRequirements") or {}

    compliance_info = {
        "summary": compliance_data.get("summary", ""),
        "biodiversityABS": {
            "title": bio_abs.get("title", "Biodiversity / ABS Assessment"),
            "status": bio_abs.get("status", "Not available"),
            "relevantBiologicalResources": bio_abs.get("relevantBiologicalResources", []),
            "reasoning": bio_abs.get("reasoning") or bio_abs.get("explanation", "Not available"),
            "explanation": bio_abs.get("explanation") or bio_abs.get("reasoning", "Not available"),
            "provisions": bio_abs.get("provisions", []),
            "legalProvisions": bio_abs.get("provisions", []),
            "citations": bio_abs.get("citations", []),
            "missingInformation": bio_abs.get("missingInformation")
        },
        "nbaApproval": {
            "title": nba_approval.get("title", "NBA Approval Assessment"),
            "status": nba_approval.get("status", "Not available"),
            "formType": nba_approval.get("formType", "Not available"),
            "reasoning": nba_approval.get("reasoning") or nba_approval.get("explanation", "Not available"),
            "explanation": nba_approval.get("explanation") or nba_approval.get("reasoning", "Not available"),
            "provisions": nba_approval.get("provisions", []),
            "legalProvisions": nba_approval.get("provisions", []),
            "citations": nba_approval.get("citations", []),
            "controllingAuthority": nba_approval.get("controllingAuthority", "National Biodiversity Authority (NBA)")
        },
        "traditionalKnowledgeTKDL": {
            "title": tkdl_section.get("title", "Traditional Knowledge / TKDL Assessment"),
            "status": tkdl_section.get("status", "Not available"),
            "traditionalKnowledgeInvolvement": tkdl_section.get("traditionalKnowledgeInvolvement", "Not available"),
            "effectOnIpProtection": tkdl_section.get("effectOnIpProtection", "Not available"),
            "patentsActSection3p": tkdl_section.get("patentsActSection3p", "Not available"),
            "reasoning": tkdl_section.get("reasoning") or tkdl_section.get("explanation", "Not available"),
            "explanation": tkdl_section.get("explanation") or tkdl_section.get("reasoning", "Not available"),
            "provisions": tkdl_section.get("provisions", []),
            "legalProvisions": tkdl_section.get("provisions", []),
            "citations": tkdl_section.get("citations", [])
        },
        "regulatoryRequirements": {
            "title": reg_reqs.get("title", "Product Regulatory Requirements"),
            "status": reg_reqs.get("status", "Not available"),
            "applicablePathway": reg_reqs.get("applicablePathway", "Not available"),
            "controllingAuthority": reg_reqs.get("controllingAuthority", "Not available"),
            "specificRequirements": reg_reqs.get("specificRequirements", []),
            "reasoning": reg_reqs.get("reasoning") or reg_reqs.get("explanation", "Not available"),
            "explanation": reg_reqs.get("explanation") or reg_reqs.get("reasoning", "Not available"),
            "provisions": reg_reqs.get("provisions", []),
            "legalProvisions": reg_reqs.get("provisions", []),
            "citations": reg_reqs.get("citations", [])
        }
    }

    # 6. Aggregate RAG Evidence & Citations
    all_citations = []
    seen_citation_keys = set()

    def add_citations(items):
        if not items:
            return
        for c in items:
            doc = c.get("document") or c.get("source") or "Statutory Reference"
            sec = c.get("section") or ""
            key = f"{doc}::{sec}"
            if key not in seen_citation_keys:
                seen_citation_keys.add(key)
                snippet = c.get("textSnippet") or c.get("text") or ""
                all_citations.append({
                    "document": doc,
                    "actRegulation": doc,
                    "section": sec,
                    "sectionRule": sec,
                    "heading": c.get("heading") or "",
                    "authority": c.get("authority") or "",
                    "jurisdiction": c.get("jurisdiction") or jurisdiction,
                    "textSnippet": snippet,
                    "relevantEvidenceSnippet": snippet,
                    "sourceUrl": c.get("sourceUrl") or "https://ayush.gov.in"
                })

    add_citations(data.get("citations"))
    add_citations(classification_data.get("citations"))
    if normalized_ip_categories:
        for cat in normalized_ip_categories:
            add_citations(cat.get("citations"))
    add_citations(bio_abs.get("citations"))
    add_citations(nba_approval.get("citations"))
    add_citations(tkdl_section.get("citations"))
    add_citations(reg_reqs.get("citations"))

    # 7. Uncertainty / Human Review Flags Collection
    # Collects: uncertainty status, missing information, Needs Human Review flags,
    # potentially applicable provisions, unresolved issues
    uncertainty_flags = []

    # 7.1 Uncertainty Status & Confidence
    if confidence in ["Low", "Uncertain"] or "uncertain" in str(product_context.get("uncertaintyStatus", "")).lower():
        uncertainty_flags.append({
            "dimension": "Classification Confidence",
            "type": "Uncertainty Status",
            "severity": "High",
            "message": "Formulation classification is flagged with ambiguity or low statutory confidence.",
            "missingItem": "Clarification of therapeutic disease treatment claims versus general dietary supplement intent."
        })

    # 7.2 Missing information from classification or product inputs
    missing_items = (
        classification_data.get("missingInformation")
        or data.get("missingInformation")
        or []
    )
    if isinstance(missing_items, str):
        missing_items = [missing_items]
    for mi in missing_items:
        if mi and isinstance(mi, str):
            uncertainty_flags.append({
                "dimension": "Formulation Attributes",
                "type": "Missing Information",
                "severity": "Medium",
                "message": f"Missing information identified: {mi}",
                "missingItem": mi
            })

    # 7.3 Collect flags from IP categories (Needs Human Review & Potentially Relevant)
    for cat in normalized_ip_categories:
        cat_status = cat.get("status")
        if cat_status == "Needs Human Review":
            uncertainty_flags.append({
                "dimension": f"IP Category [{cat.get('letterCode')}]: {cat.get('category')}",
                "type": "Needs Human Review",
                "severity": "Medium",
                "message": cat.get("reason", "Statutory IP review required."),
                "missingItem": "Technical verification of formulation novelty or classical textual citation."
            })
        elif cat_status == "Potentially Relevant":
            uncertainty_flags.append({
                "dimension": f"IP Category [{cat.get('letterCode')}]: {cat.get('category')}",
                "type": "Potentially Applicable Provision",
                "severity": "Low",
                "message": f"Potentially applicable: {', '.join(cat.get('legalProvisions', [])) or cat.get('reason', '')}",
                "missingItem": "Verification of qualifying conditions under statute."
            })

    # 7.4 Collect flags from compliance pillars
    if bio_abs.get("status") == "Needs Human Review" or bio_abs.get("missingInformation"):
        uncertainty_flags.append({
            "dimension": "Biodiversity / ABS (Pillar A)",
            "type": "Needs Human Review",
            "severity": "Medium",
            "message": bio_abs.get("reasoning", "Biological resource origin verification required."),
            "missingItem": bio_abs.get("missingInformation", "Exact biological collection source (cultivated vs. wild collected).")
        })
    elif bio_abs.get("status") == "Potentially Applicable":
        uncertainty_flags.append({
            "dimension": "Biodiversity / ABS (Pillar A)",
            "type": "Potentially Applicable Provision",
            "severity": "Low",
            "message": "Potential State Biodiversity Board (SBB) prior intimation requirement under Section 7 of BDA 2002.",
            "missingItem": "Confirmation of Indian commercial procurement vs direct extraction."
        })

    if nba_approval.get("status") == "Needs Human Review":
        uncertainty_flags.append({
            "dimension": "NBA Approval (Pillar B)",
            "type": "Needs Human Review",
            "severity": "Medium",
            "message": nba_approval.get("reasoning", "NBA filing form applicability requires verification."),
            "missingItem": "Foreign shareholding status and patent filing intent."
        })
    elif nba_approval.get("status") == "Potentially Applicable":
        uncertainty_flags.append({
            "dimension": "NBA Approval (Pillar B)",
            "type": "Potentially Applicable Provision",
            "severity": "Low",
            "message": "Potential Form III clearance requirement prior to patent grant (Section 6 BDA 2002).",
            "missingItem": "NBA application status."
        })

    if tkdl_section.get("status") == "Needs Human Review":
        uncertainty_flags.append({
            "dimension": "Traditional Knowledge / TKDL (Pillar C)",
            "type": "Needs Human Review",
            "severity": "Medium",
            "message": tkdl_section.get("reasoning", "Samhita textual matching required."),
            "missingItem": "First Schedule Samhita text reference or AFI formulation monograph."
        })

    if reg_reqs.get("status") == "Needs Human Review":
        uncertainty_flags.append({
            "dimension": "Product Regulatory Requirements (Pillar D)",
            "type": "Needs Human Review",
            "severity": "High",
            "message": reg_reqs.get("reasoning", "Regulatory licensing pathway is unresolved."),
            "missingItem": "Manufacturing license classification (Drug vs. Aahar vs. Cosmetic)."
        })
    elif reg_reqs.get("status") == "Potentially Applicable":
        uncertainty_flags.append({
            "dimension": "Product Regulatory Requirements (Pillar D)",
            "type": "Potentially Applicable Provision",
            "severity": "Low",
            "message": f"Statutory licensing under {reg_reqs.get('applicablePathway', 'regulatory rules')} potentially applicable.",
            "missingItem": "Jurisdictional licensing verification."
        })

    # 7.5 Unresolved issues / Questions for user
    questions = classification_data.get("questionsForUser") or data.get("questionsForUser") or []
    for q in questions:
        if q and isinstance(q, str):
            uncertainty_flags.append({
                "dimension": "Regulatory Inquiry",
                "type": "Unresolved Issue",
                "severity": "Medium",
                "message": f"Unresolved inquiry: {q}",
                "missingItem": q
            })

    # Localized dossier titles & headers
    if language == "hi":
        dossier_title = f"वैधानिक केस डोजियर — {product_name}"
        status_label = "प्रारंभिक विधिक निर्णय समर्थन डोजियर" if not uncertainty_flags else "मानवीय समीक्षा अनुशंसित"
    elif language == "mr":
        dossier_title = f"वैधानिक केस डॉझियर — {product_name}"
        status_label = "प्राथमिक कायदेशीर निर्णय सहाय्य डॉझियर" if not uncertainty_flags else "मानवी पुनरावलोकन आवश्यक"
    else:
        dossier_title = f"Statutory Case Dossier — {product_name}"
        status_label = "Preliminary Statutory Decision Support Dossier" if not uncertainty_flags else "Human Review Recommended"

    return {
        "caseId": case_id,
        "title": dossier_title,
        "statusLabel": status_label,
        "timestamp": timestamp,
        "language": language,
        "jurisdiction": jurisdiction,
        "applicant": applicant,
        "productInformation": product_info,
        "classification": classification_info,
        "ipProtectionAnalysis": normalized_ip_data,
        "absRegulatoryCompliance": compliance_info,
        "ragEvidence": all_citations,
        "uncertaintyFlags": uncertainty_flags,
        "humanReviewStatus": data.get("humanReviewStatus") or STATUS_DOSSIER_GENERATED,
        "disclaimer": (
            "This AI-generated assessment is for legal and regulatory research and decision-support purposes only. "
            "It does not constitute legal advice, statutory clearance, regulatory approval, or a final determination. "
            "Verify applicable requirements with the relevant authority or qualified legal/regulatory professional."
        )
    }
