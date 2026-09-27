"""
Case Dossier Exporter
Formats the generated Case Dossier into structured JSON and printable text/markdown representation.
"""

from typing import Dict, Any

def export_dossier_text(dossier: Dict[str, Any]) -> str:
    """
    Renders an authoritative plain-text printable dossier representation.
    """
    case_id = dossier.get("caseId", "CASE-UNKNOWN")
    product_name = dossier.get("productInformation", {}).get("productName", "Ayurvedic Formulation")
    timestamp = dossier.get("timestamp", "")
    jurisdiction = dossier.get("jurisdiction", "India")
    language = dossier.get("language", "en")
    applicant = dossier.get("applicant", {})

    prod_info = dossier.get("productInformation", {})
    classification = dossier.get("classification", {})
    ip_data = dossier.get("ipProtectionAnalysis", {})
    ip_cats = ip_data.get("ipCategories", [])
    compliance = dossier.get("absRegulatoryCompliance", {})
    evidence = dossier.get("ragEvidence", [])
    uncertainties = dossier.get("uncertaintyFlags", [])

    lines = []
    lines.append("=" * 80)
    lines.append("AIIA - INTELLECTUAL PROPERTY FACILITATION CELL")
    lines.append("IP-SAKTI SAHAYAK - OFFICIAL STATUTORY CASE DOSSIER")
    lines.append("National Ayush Intellectual Property & Regulatory Decision Support Framework")
    lines.append("=" * 80)
    lines.append(f"Case ID           : {case_id}")
    lines.append(f"Date & Time (UTC) : {timestamp}")
    lines.append(f"Product / Formula : {product_name}")
    lines.append(f"Jurisdiction      : {jurisdiction}")
    lines.append(f"Language Mode     : {language.upper()}")
    lines.append(f"Review Status     : {dossier.get('humanReviewStatus', 'Analysis Completed')}")
    lines.append(f"Applicant Name    : {applicant.get('name', 'N/A')} ({applicant.get('role', 'N/A')})")
    lines.append(f"Official Email    : {applicant.get('email', 'N/A')}")
    lines.append("-" * 80)

    # 1. PRODUCT INFORMATION
    lines.append("\n[1. PRODUCT & FORMULATION SPECIFICATIONS]")
    lines.append(f"• Ingredients       : {prod_info.get('ingredients', 'N/A')}")
    lines.append(f"• Intended Use      : {prod_info.get('intendedUse', 'N/A')}")
    lines.append(f"• Dosage Form       : {prod_info.get('dosageForm', 'N/A')}")
    lines.append(f"• Classical Basis   : {prod_info.get('followsClassicalText', 'N/A')}")
    lines.append(f"• Target Market     : {prod_info.get('targetMarket', 'N/A')}")
    lines.append(f"• Ingredient Source : {prod_info.get('sourceOfIngredients', 'N/A')}")

    # 2. STATUTORY CLASSIFICATION
    lines.append("\n[2. STATUTORY CLASSIFICATION RESULT]")
    lines.append(f"• Category Assigned  : {classification.get('category', 'N/A')}")
    lines.append(f"• Confidence Score   : {classification.get('confidence', 'N/A')}")
    lines.append(f"• Governing Statute  : {classification.get('statutoryBasis', 'N/A')}")
    pathways = classification.get('regulatoryPathway', [])
    if pathways:
        lines.append(f"• Regulatory Pathway : {', '.join(pathways) if isinstance(pathways, list) else str(pathways)}")
    lines.append("• Statutory Reasoning:")
    for r in classification.get("reasoning", []):
        lines.append(f"    - {r}")

    # 3. IP PROTECTION ANALYSIS (7 PATHWAYS)
    lines.append("\n[3. INTELLECTUAL PROPERTY PROTECTION ANALYSIS (7 STATUTORY PATHWAYS)]")
    if ip_cats:
        for cat in ip_cats:
            cat_letter = cat.get('letterCode') or ''
            letter_prefix = f"[{cat_letter}] " if cat_letter else ""
            lines.append(f"  {letter_prefix}{cat.get('category')} — Status: {cat.get('status', 'Not available')}")
            lines.append(f"    Explanation      : {cat.get('explanation') or cat.get('reason', 'N/A')}")
            provisions = cat.get('legalProvisions') or cat.get('provisions') or []
            lines.append(f"    Legal Provisions : {', '.join(provisions) if provisions else 'None specified'}")
            lines.append(f"    Evidence         : {cat.get('evidence', 'Not available')}")
            citations = cat.get('citations') or []
            if citations:
                citation_strs = [f"{c.get('document', '')} {c.get('section', '')}".strip() for c in citations if c]
                lines.append(f"    Citations        : {'; '.join(citation_strs)}")
            else:
                lines.append("    Citations        : None directly cited")
    else:
        lines.append("  No IP categories recorded.")

    # 4. ABS & REGULATORY COMPLIANCE (4 PILLARS)
    lines.append("\n[4. ABS & REGULATORY COMPLIANCE (4 STATUTORY PILLARS)]")
    bio = compliance.get("biodiversityABS", {})
    lines.append(f"  A. Biodiversity / ABS Assessment: {bio.get('status', 'N/A')}")
    lines.append(f"     Explanation : {bio.get('explanation') or bio.get('reasoning', 'N/A')}")
    lines.append(f"     Resources   : {', '.join(bio.get('relevantBiologicalResources', [])) or 'None specified'}")
    bio_prov = bio.get('legalProvisions') or bio.get('provisions') or []
    lines.append(f"     Provisions  : {', '.join(bio_prov) if bio_prov else 'Biological Diversity Act, 2002'}")

    nba = compliance.get("nbaApproval", {})
    lines.append(f"  B. NBA Approval Assessment: {nba.get('status', 'N/A')}")
    lines.append(f"     Form Type   : {nba.get('formType', 'N/A')}")
    lines.append(f"     Explanation : {nba.get('explanation') or nba.get('reasoning', 'N/A')}")
    lines.append(f"     Authority   : {nba.get('controllingAuthority', 'National Biodiversity Authority')}")

    tkdl = compliance.get("traditionalKnowledgeTKDL", {})
    lines.append(f"  C. Traditional Knowledge / TKDL: {tkdl.get('status', 'N/A')}")
    lines.append(f"     Involvement : {tkdl.get('traditionalKnowledgeInvolvement', 'N/A')}")
    lines.append(f"     Explanation : {tkdl.get('explanation') or tkdl.get('reasoning', 'N/A')}")
    lines.append(f"     IP Impact   : {tkdl.get('effectOnIpProtection', 'N/A')}")

    reg = compliance.get("regulatoryRequirements", {})
    lines.append(f"  D. Product Regulatory Requirements: {reg.get('status', 'N/A')}")
    lines.append(f"     Pathway     : {reg.get('applicablePathway', 'N/A')}")
    lines.append(f"     Authority   : {reg.get('controllingAuthority', 'N/A')}")
    lines.append(f"     Explanation : {reg.get('explanation') or reg.get('reasoning', 'N/A')}")
    for req in reg.get("specificRequirements", []):
        lines.append(f"       * {req}")

    # 5. RAG EVIDENCE & CITATIONS
    lines.append(f"\n[5. AUTHORITATIVE RAG EVIDENCE & CITATIONS ({len(evidence)})]")
    if evidence:
        for idx, ev in enumerate(evidence, 1):
            doc = ev.get('document') or ev.get('actRegulation', 'Statutory Reference')
            sec = ev.get('section') or ev.get('sectionRule', '')
            lines.append(f"  {idx}. {doc} — {sec}")
            if ev.get("authority"):
                lines.append(f"     Authority       : {ev.get('authority')}")
            snippet = ev.get("relevantEvidenceSnippet") or ev.get("textSnippet")
            if snippet:
                lines.append(f"     Evidence Snippet: \"{snippet}\"")
            if ev.get("sourceUrl"):
                lines.append(f"     Source URL      : {ev.get('sourceUrl')}")
    else:
        lines.append("  No statutory citations recorded.")

    # 6. UNCERTAINTIES & HUMAN REVIEW FLAGS
    lines.append(f"\n[6. UNCERTAINTIES & HUMAN REVIEW FLAGS ({len(uncertainties)})]")
    if uncertainties:
        for idx, u in enumerate(uncertainties, 1):
            lines.append(f"  {idx}. [{u.get('dimension')}] (Severity: {u.get('severity')})")
            lines.append(f"     Issue        : {u.get('message')}")
            lines.append(f"     Missing Info : {u.get('missingItem')}")
    else:
        lines.append("  No statutory ambiguity flagged. Formulation verified under codified rules.")

    lines.append("\n" + "-" * 80)
    lines.append("LEGAL DISCLAIMER:")
    lines.append(dossier.get("disclaimer", "Information and decision support only."))
    lines.append("=" * 80)

    return "\n".join(lines)
