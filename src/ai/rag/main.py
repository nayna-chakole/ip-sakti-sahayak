"""
IP-SAKTI Sahayak / JurifyLaw: Python CLI & AI Dispatcher
Dispatches RAG inquiries, product classifications, and ABS evaluations.
"""

import sys
import json
import re
from datetime import datetime, timezone
from typing import Dict, Any

from .pipeline import rag_pipeline
from .corpus import STATUTORY_CORPUS
from .evaluator import rag_evaluator
from ..ip_analysis import analyze_product_ip
from ..regulatory_compliance import analyze_compliance
from ..case_dossier import (
    build_case_dossier,
    export_dossier_text,
    submit_human_facilitator_review
)

def classify_product(data: Dict[str, Any], jurisdiction: str = "India", language: str = "en") -> Dict[str, Any]:
    """Pure Python Deterministic Product & IP Classifier with Multilingual Support."""
    name = data.get("productName", "Ayurvedic Formulation")
    ingredients = str(data.get("ingredients", "")).lower()
    intended_use = str(data.get("intendedUse", "")).lower()
    follows_classical = str(data.get("followsClassicalText", "no")).lower()
    dosage_form = str(data.get("dosageForm", "")).lower()
    claims = str(data.get("claimsMade", "")).lower()
    lang = (language or "en").lower()

    factors = []
    ip_implications = []
    regulatory_framework = []

    is_international = str(jurisdiction).strip().lower() == "international"

    # Category 7: Safe Abstention on Incomplete or Ambiguous Information
    clean_ing = ingredients.strip()
    clean_use = intended_use.strip()
    is_incomplete = (
        len(clean_ing) < 3 or
        len(clean_use) < 4 or
        any(w in clean_ing for w in ["unknown", "unspecified", "tbd", "secret", "undefined", "none"]) or
        any(w in clean_use for w in ["unknown", "unspecified", "tbd", "test", "demo", "asdf"])
    )

    if is_incomplete:
        category = "Uncertain / Needs Human Review"
        if lang == "hi":
            localized_cat = "अनिश्चित / मानव सुविधा प्रदाता समीक्षा आवश्यक (Uncertain / Needs Human Review)"
        elif lang == "mr":
            localized_cat = "अनिश्चित / तज्ज्ञ मानवी पडताळणी आवश्यक (Uncertain / Needs Human Review)"
        else:
            localized_cat = category
        confidence = "NEEDS HUMAN REVIEW"
        if is_international:
            factors.append("Insufficient formulation information for definitive international statutory determination.")
            factors.append("Missing required details: Botanical ingredient names with plant parts used, precise therapeutic indications, and export product classification.")
            factors.append("Safe abstention applied: System does not guess statutory conclusions without complete, verified formulation data.")
            ip_implications.append("IP pathways cannot be determined safely without verified ingredients and evidence of novelty or prior art.")
            regulatory_framework.append("Submit formulation details to regulatory facilitator for manual international statutory review.")
        else:
            factors.append("Insufficient information — Human Review / Additional Information Required.")
            factors.append("Missing required details: Botanical ingredient names with plant parts used, precise therapeutic indications, and whether formulation adheres to a Schedule 1 Samhita.")
            factors.append("Safe abstention applied: System does not guess statutory conclusions without complete, verified formulation data.")
            ip_implications.append("IP pathways cannot be determined safely without verified ingredients and evidence of synergy or prior art.")
            regulatory_framework.append("Submit formulation details to Ayush facilitator for manual statutory review.")
        patent_potential = "Undetermined — Requires Facilitator Verification"
        abs_required = True

    # Category 6: New / Non-Classical Drug (Modern synthetic API or chemical entity)
    elif any(w in ingredients for w in ["synthetic", "chemical entity", "allopathic", "paracetamol", "sildenafil", "steroid", "isolated modern compound"]) or "synthetic molecule" in claims or "new chemical" in claims:
        category = "New / Non-Classical Drug"
        if lang == "hi":
            localized_cat = "नई / गैर-शास्त्रीय औषधि (New / Non-Classical Drug — CDSCO)" if not is_international else "नई / गैर-शास्त्रीय औषधि (New / Non-Classical Drug — US FDA / EMA)"
        elif lang == "mr":
            localized_cat = "नवीन / अशास्त्रीय औषध (New / Non-Classical Drug — CDSCO)" if not is_international else "नवीन / अशास्त्रीय औषध (New / Non-Classical Drug — US FDA / EMA)"
        else:
            localized_cat = category
        confidence = "HIGH CONFIDENCE"
        if is_international:
            factors.append("Formulation contains non-classical, synthetic, or modern chemical active pharmaceutical ingredients.")
            factors.append("Excluded from herbal frameworks; regulated under international pharmaceutical drug regulatory authorities (US FDA CDER / EMA).")
            factors.append("High-risk complex regulatory scenario: mandatory human facilitator & pharmaceutical regulatory counsel review.")
            ip_implications.append("Subject to standard chemical patent requirements under Patent Cooperation Treaty (PCT) and national patent laws.")
            regulatory_framework.append("US FDA New Drug Application (NDA) 21 CFR Part 314")
            regulatory_framework.append("EMA Centralised Marketing Authorisation Procedure / Clinical trials Phase I-IV mandatory")
            patent_potential = "Standard Chemical / Pharmaceutical Patent (PCT Filing)"
        else:
            factors.append("Formulation contains non-classical, synthetic, or modern chemical active pharmaceutical ingredients.")
            factors.append("Excluded from Ayush licensing; falls strictly under CDSCO (DCGI) New Drugs and Clinical Trials Rules, 2019.")
            factors.append("High-risk complex regulatory scenario: mandatory human facilitator & CDSCO counsel review.")
            ip_implications.append("Subject to standard chemical patent requirements under Section 2(1)(j) & Section 3(d) of Patents Act 1970.")
            regulatory_framework.append("CDSCO (DCGI) New Drug Approval Form 44")
            regulatory_framework.append("Schedule Y / Clinical Trials Rules Phase I-IV trials mandatory")
            patent_potential = "Standard Chemical / Pharma Patent (Section 3(d) evaluation required)"
        abs_required = "biological" in ingredients or "plant" in ingredients

    # Category 5: Cosmetic (Topical beautification / hygiene)
    elif any(w in dosage_form for w in ["cosmetic", "face wash", "body wash", "lotion", "serum", "lip balm", "sunscreen", "shampoo"]) or any(w in intended_use for w in ["cosmetic", "beautification", "skin radiance", "skin brightening", "complexion", "moisturizer", "glow"]) and "curative" not in intended_use:
        category = "Herbal Cosmetic (Export / International Regime)" if is_international else "Cosmetic"
        if lang == "hi":
            localized_cat = "हर्बल प्रसाधन सामग्री / कॉस्मेटिक (अंतर्राष्ट्रीय विनियामक व्यवस्था)" if is_international else "सौंदर्य प्रसाधन / कॉस्मेटिक (Cosmetic — Drugs & Cosmetics Rules)"
        elif lang == "mr":
            localized_cat = "हर्बल सौंदर्य प्रसाधन / कॉस्मेटिक (आंतरराष्ट्रीय नियामक चौकट)" if is_international else "सौंदर्य प्रसाधन / कॉस्मेटिक (Cosmetic — Drugs & Cosmetics Rules)"
        else:
            localized_cat = category
        confidence = "HIGH CONFIDENCE"
        if is_international:
            factors.append("Formulation intended solely for topical cleansing, beautifying, promoting attractiveness, or altering appearance in international target markets.")
            factors.append("Regulated under target market cosmetic frameworks: US FDA MoCRA 2022 and EU Regulation (EC) No 1223/2009.")
            factors.append("Statutory restriction: Zero therapeutic, medicinal, or curative disease claims permitted on cosmetic export labeling.")
            ip_implications.append("Trademark registration for coined brand name via WIPO Madrid System (Class 3).")
            ip_implications.append("Container and packaging trade dress protection via WIPO Hague System for Industrial Designs.")
            regulatory_framework.append("US FDA: Modernization of Cosmetics Regulation Act (MoCRA) 2022 facility registration and product listing")
            regulatory_framework.append("EU: Regulation (EC) No 1223/2009 Cosmetic Product Safety Report (CPSR) and CPNP notification")
            patent_potential = "Novel cosmetic delivery vehicle or topical carrier formulation via PCT filing system (national phase grants)"
        else:
            factors.append("Formulation intended solely for cleansing, beautifying, promoting attractiveness, or altering appearance (Section 3(aaa) Drugs and Cosmetics Act 1940).")
            factors.append("Regulated under Part XIII (Rules 138-150) of Drugs & Cosmetics Rules, 1945 for Cosmetics.")
            factors.append("Statutory restriction: No therapeutic, medicinal, or disease curative claims permitted on cosmetic labeling.")
            ip_implications.append("Trademark registration for coined brand name and trade dress protection for unique packaging containers (Designs Act 2000).")
            regulatory_framework.append("State Licensing Authority Cosmetic Manufacturing License (Form 32)")
            regulatory_framework.append("Schedule S & IS 4707 Bureau of Indian Standards (BIS) compliance")
            patent_potential = "Novel cosmetic delivery vehicle or synergistic topical formulation (Section 3(e))"
        abs_required = True

    # Category 4: Ayurveda Aahar (Dietary / Food Wellness)
    elif "dietary" in intended_use or "aahar" in intended_use or "tea" in dosage_form or "infusion" in dosage_form or "food" in intended_use:
        category = "Dietary Herbal Supplement (Export / International Regime)" if is_international else "Ayurveda Aahar (Dietary Wellness / Herbal Supplement)"
        if lang == "hi":
            localized_cat = "आहार हर्बल सप्लीमेंट (अंतर्राष्ट्रीय विनियामक व्यवस्था)" if is_international else "आयुर्वेद आहार (Ayurveda Aahar / आहार पूरक)"
        elif lang == "mr":
            localized_cat = "आहार हर्बल सप्लिमेंट (आंतरराष्ट्रीय नियामक चौकट)" if is_international else "आयुर्वेद आहार (Ayurveda Aahar / अन्न पूरक)"
        else:
            localized_cat = category
        confidence = "HIGH CONFIDENCE"
        if is_international:
            factors.append("Formulation intended for dietary sustenance, general wellness, or nutritional lifestyle support in international markets.")
            factors.append("Governed internationally under US FDA DSHEA 1994 (Dietary Supplements) and EU Directive 2002/46/EC (Food Supplements).")
            factors.append("Statutory requirement: Must carry mandatory target-market dietary disclaimers; no therapeutic cure claims permitted.")
            ip_implications.append("International trademark registration under WIPO Madrid System (Class 5 / Class 30) for brand assets.")
            ip_implications.append("Formulation non-patentable as conventional dietary recipe under international patent examination standards.")
            regulatory_framework.append("US FDA: Dietary Supplement Health and Education Act (DSHEA 1994) & 21 CFR Part 111 cGMP compliance")
            regulatory_framework.append("EU: Directive 2002/46/EC Food Supplements notification with competent national food authorities")
            regulatory_framework.append("Mandatory packaging disclaimer: 'FOR DIETARY / SUPPLEMENT USE ONLY - NOT INTENDED TO TREAT, CURE, OR PREVENT ANY DISEASE'")
            patent_potential = "Ineligible under international patent examination standards as conventional dietary recipe"
        else:
            factors.append("Formulation intended for dietary sustenance or general lifestyle wellness rather than curative therapy.")
            factors.append("Governed under Food Safety and Standards (Ayurveda Aahar) Regulations, 2022.")
            ip_implications.append("Trademark brand name and distinctive packaging trade dress are the primary IP assets.")
            ip_implications.append("Formulations cannot be patented as therapeutic medicines.")
            regulatory_framework.append("FSSAI Central / State Licensing Authority Food License")
            regulatory_framework.append("Mandatory Ayurveda Aahar Logo & statutory warning: 'FOR DIETARY USE ONLY - NOT FOR MEDICINAL USE'")
            patent_potential = "Ineligible under Section 3(p) as traditional recipe / dietary preparation"
        abs_required = True

    # Category 1: Classical Ayurvedic Medicine
    elif follows_classical in ["yes", "yes_fully", "classical"] or any(t in name.lower() for t in ["churna", "taila", "avaleha", "asava", "arishta", "vati", "bhasma", "samhita"]):
        category = "Classical Herbal Formulation (Export / International Regime)" if is_international else "Classical Ayurvedic Medicine"
        if lang == "hi":
            localized_cat = "शास्त्रीय हर्बल फॉर्मूलेशन (अंतर्राष्ट्रीय विनियामक व्यवस्था)" if is_international else "शास्त्रीय आयुर्वेदिक औषधि (Classical Ayurvedic Medicine)"
        elif lang == "mr":
            localized_cat = "शास्त्रीय हर्बल फॉर्म्युलेशन (आंतरराष्ट्रीय नियामक चौकट)" if is_international else "शास्त्रीय आयुर्वेदिक औषध (Classical Ayurvedic Medicine)"
        else:
            localized_cat = category
        confidence = "HIGH CONFIDENCE"
        if is_international:
            factors.append("Formulation strictly follows authoritative classical texts; evaluated under international herbal and dietary supplement frameworks.")
            factors.append("Traditional knowledge documented in TKDL is accessible to International Searching Authorities under PCT Chapter 21, defeating novelty.")
            factors.append("Export statutory pathway: Marketed primarily as Dietary Supplement (US FDA DSHEA) or Traditional Herbal Medicine (EU THMPD Directive 2004/24/EC).")
            ip_implications.append("Product patent ineligible across international patent offices due to documented TKDL prior art (PCT Chapter 21).")
            ip_implications.append("IP strategy relies on international trademark protection via WIPO Madrid System and proprietary delivery vehicles.")
            regulatory_framework.append("US Market: US FDA Dietary Supplement (DSHEA 1994) with 21 CFR Part 111 cGMP compliance & facility registration")
            regulatory_framework.append("EU Market: Simplified registration under Directive 2004/24/EC (THMPD) with 30 years use evidence (15 years in EU), or Food Supplement route")
            regulatory_framework.append("Cross-Border ABS: Provider-country ABS under Nagoya Protocol where applicable; NBA Section 3 / Section 6 clearance applies if utilizing Indian biological resources")
            patent_potential = "Low / Ineligible against documented TKDL prior art under PCT Chapter 21 examination"
        else:
            factors.append("Ingredients and preparation methods strictly follow First Schedule Authoritative Samhitas.")
            factors.append("Section 3(p) of Patents Act 1970 applies as an absolute bar against patenting traditional prior art.")
            ip_implications.append("Patenting barred under Section 3(p) due to documented TKDL prior art.")
            ip_implications.append("IP strategy focuses on trademark brand identity, unique delivery format, and trade secrets in processing.")
            regulatory_framework.append("State Ayush Licensing Authority (Form 24D/25D License)")
            regulatory_framework.append("Schedule T Good Manufacturing Practices (GMP) Mandatory")
            regulatory_framework.append("Ayurvedic Pharmacopoeia of India (API) standard compliance")
            patent_potential = "Low / Barred under Section 3(p)"
        abs_required = True

    # Category 3: Phytopharmaceutical Drug / Standardized Extract
    elif "extract" in dosage_form or "fraction" in dosage_form or "purified" in dosage_form or "phytopharmaceutical" in intended_use or "standardized" in ingredients:
        category = "Standardized Botanical Extract / Phytopharmaceutical (International)" if is_international else "Phytopharmaceutical Drug / Standardized Botanical Extract"
        if lang == "hi":
            localized_cat = "मानकीकृत वानस्पतिक अर्क / फाइटोफार्मास्युटिकल (अंतर्राष्ट्रीय)" if is_international else "फाइटोफार्मास्युटिकल ड्रग / मानकीकृत वानस्पतिक अर्क (Phytopharmaceutical Drug)"
        elif lang == "mr":
            localized_cat = "प्रमाणित वनस्पती अर्क / फायटोफार्मास्युटिकल (आंतरराष्ट्रीय)" if is_international else "फायटोफार्मास्युटिकल औषध / प्रमाणित वनौषधी अर्क (Phytopharmaceutical Drug)"
        else:
            localized_cat = category
        confidence = "HIGH CONFIDENCE"
        if is_international:
            factors.append("Contains purified and standardized botanical fraction with defined biomarker quantification and chromatographic fingerprints.")
            factors.append("Eligible for evaluation under US FDA Botanical Drug Development Guidance and EMA Herbal Medicinal Products monographs.")
            factors.append("High international evidentiary standard: Systematic clinical trial safety and therapeutic efficacy data required.")
            ip_implications.append("International patent application via Patent Cooperation Treaty (PCT) filing system possible for novel standardized extraction processes or defined biomarker fractions; national phase examination determines patent grant.")
            ip_implications.append("Mandatory disclosure of biological resource origin; NBA Section 6 Form III clearance applies if utilizing Indian biological resources.")
            regulatory_framework.append("US FDA: Botanical Drug Development Guidance (Investigational New Drug - IND application with Phase I-III trials)")
            regulatory_framework.append("European Medicines Agency (EMA): Herbal Medicinal Product monograph or Well-established use dossier")
            regulatory_framework.append("Nagoya Protocol: Internationally Recognized Certificate of Compliance (IRCC) for genetic resource access where applicable")
            patent_potential = "High for standardized extraction processes and defined biomarker fractions via PCT filing system (national phase grants)"
        else:
            factors.append("Contains purified and standardized fraction with defined biomarker quantification.")
            factors.append("Regulated under Schedule Y / New Drugs and Clinical Trials Rules for Phytopharmaceuticals.")
            ip_implications.append("Patentable as a novel extraction process or novel synergistic formulation under Section 3(e).")
            ip_implications.append("Must file Form III with National Biodiversity Authority (NBA) prior to patent grant.")
            regulatory_framework.append("Central Drugs Standard Control Organisation (CDSCO) Phytopharmaceutical New Drug Approval")
            regulatory_framework.append("Phase I/II/III clinical trials with fingerprint chromatograms")
            patent_potential = "High for extraction process and specific synergistic composition"
        abs_required = True

    # Category 2: Patent / Proprietary Ayurvedic Medicine
    else:
        category = "Proprietary Herbal Product (Export / International Regime)" if is_international else "Patent / Proprietary Ayurvedic Medicine"
        if lang == "hi":
            localized_cat = "प्रोपराइटरी हर्बल उत्पाद (अंतर्राष्ट्रीय विनियामक व्यवस्था)" if is_international else "आयुर्वेदिक प्रोप्रायटरी औषधि (Patent / Proprietary Ayurvedic Medicine)"
        elif lang == "mr":
            localized_cat = "प्रोपायटरी हर्बल उत्पादन (आंतरराष्ट्रीय नियामक चौकट)" if is_international else "आयुर्वेदिक प्रोप्रायटरी औषध (Patent / Proprietary Ayurvedic Medicine)"
        else:
            localized_cat = category
        confidence = "HIGH CONFIDENCE"
        if is_international:
            factors.append("Proprietary herbal formulation combining botanical ingredients in novel proportions or delivery formats for international markets.")
            factors.append("Evaluated under international target-market regulatory frameworks: US FDA DSHEA / Botanical Drug Guidance and EU THMPD.")
            factors.append("Individual botanical ingredients scrutinized against TKDL prior art by International Searching Authorities under PCT Chapter 21.")
            ip_implications.append("International patent application via Patent Cooperation Treaty (PCT) filing system possible if synergistic therapeutic activity is scientifically proven; patent grant is determined in national phase examination.")
            ip_implications.append("Applicant must overcome traditional knowledge prior art citations by demonstrating non-obvious synergistic efficacy.")
            ip_implications.append("International brand asset protection secured via WIPO Madrid System (Class 5).")
            regulatory_framework.append("US Market: US FDA Dietary Supplement (DSHEA 1994) with 21 CFR Part 111 cGMP compliance, or Botanical Drug IND pathway")
            regulatory_framework.append("EU Market: Stand-alone herbal medicinal product dossier or national food supplement notification")
            regulatory_framework.append("Cross-Border ABS: Nagoya Protocol compliance where applicable; Indian BDA Section 3 Form I and Section 6 Form III clearance apply only if utilizing Indian biological resources")
            patent_potential = "Medium via PCT international filing system (grant subject to national phase examination, non-obvious synergy, and overcoming TKDL prior art)"
        else:
            factors.append("Formulation uses ingredients cited in Ayurvedic texts, but dosage form or combination proportions are proprietary.")
            factors.append("Governed under Section 3(h) of Drugs and Cosmetics Act 1940.")
            ip_implications.append("Must establish synergism: experimental proof that combination has greater than additive effect (Section 3(e)).")
            ip_implications.append("Patentable for novel therapeutic combination or targeted delivery system.")
            regulatory_framework.append("Ayush State Licensing Authority Proprietary Medicine License")
            regulatory_framework.append("Rule 158B safety and efficacy pilot data")
            regulatory_framework.append("Schedule T GMP compliance")
            patent_potential = "Medium to High (conditional on proving synergy under Section 3(e))"
        abs_required = True

    return {
        "category": category,
        "localizedCategory": localized_cat,
        "language": lang,
        "confidence": confidence,
        "classificationFactors": factors,
        "ipImplications": ip_implications,
        "regulatoryFramework": regulatory_framework,
        "patentPotential": patent_potential,
        "absRequired": abs_required,
        "jurisdictionApplied": jurisdiction,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

def assess_abs(data: Dict[str, Any]) -> Dict[str, Any]:
    """Biological Diversity Act (BDA) & International ABS Assessment."""
    jurisdiction = data.get("jurisdiction") or data.get("targetMarket") or "India"
    is_international = str(jurisdiction).strip().lower() == "international"

    resource_origin = str(
        data.get("resourceOrigin") or data.get("sourceOfIngredients") or data.get("countryOfOrigin") or data.get("origin") or ""
    ).strip()
    has_indian_resource = any(kw in resource_origin.lower() for kw in ["india", "indian", "domestic", "bharat"])
    has_foreign_resource = any(kw in resource_origin.lower() for kw in [
        "outside india", "non-indian", "foreign", "imported", "us", "usa", "united states",
        "europe", "germany", "japan", "sri lanka", "non-domestic", "global", "overseas"
    ])

    is_foreign_entity = Boolean_val(data.get("isForeignParticipant", False))
    is_patent = Boolean_val(data.get("isPatentFiling", True))
    is_commercial = Boolean_val(data.get("isCommercialUtilization", True))

    mandates = []
    findings = []

    if is_international:
        # International Target Jurisdiction: Nagoya Protocol is conditional, not universally mandatory
        mandates.append("Nagoya Protocol on ABS: Compliance is conditional on provider country ratification and domestic ABS access measures (e.g., US is not a party to the Nagoya Protocol).")
        findings.append("Access and Benefit Sharing obligations in international trade depend on provider country accession to the Nagoya Protocol and national access laws.")

        # Show Indian ABS requirements ONLY if product/resource origin makes it relevant
        if has_indian_resource:
            mandates.append("Section 3 NBA Clearance (Form I): Mandatory prior approval from National Biodiversity Authority if accessing biological resources occurring in India for foreign commercial utilization.")
            findings.append("Accessing Indian biological material triggers Section 3 NBA prior approval for foreign entities or export commercialization.")
            if is_patent:
                mandates.append("Section 6 NBA Approval (Form III): Mandatory NBA approval prior to grant of patent based on research/invention conducted on Indian biological resources.")
                findings.append("Applies strictly when patent applications derive from biological resources obtained from India.")
            controlling_auth = "CBD Nagoya Protocol Secretariat / Provider Country NFP & National Biodiversity Authority (NBA, India - for Indian resources)"
            governing_act = "Nagoya Protocol on ABS & Biological Diversity Act 2002 (Provider-Country Access for Indian Resources)"
            abs_required = True
        else:
            findings.append("Indian Biological Diversity Act (Section 3 / Form I and Section 6 / Form III) does not apply to non-Indian genetic resources; compliance follows the source country's domestic ABS regime.")
            controlling_auth = "CBD Nagoya Protocol Secretariat / Provider Country National Focal Point (ABSCH)"
            governing_act = "Nagoya Protocol on Access and Benefit Sharing & Provider Country ABS Laws"
            abs_required = False
    else:
        # India Domestic Jurisdiction (EXACTLY UNCHANGED)
        if is_foreign_entity:
            mandates.append("Section 3 NBA Clearance: Mandatory prior approval from National Biodiversity Authority (Form I) for foreign individuals or foreign-equity entities.")
            findings.append("Non-Indian participation in share capital or foreign incorporation triggers Section 3 NBA prior approval.")
        else:
            if is_commercial:
                mandates.append("Section 7 SBB Prior Intimation: Mandatory prior intimation to the State Biodiversity Board before commercial utilization.")
                findings.append("Indian corporate entities commercializing biological resources must intimate the concerned SBB and pay 0.1%-0.5% benefit sharing.")

        if is_patent:
            mandates.append("Section 6 Form III Clearance: Mandatory approval from NBA prior to grant of patent inside or outside India.")
            findings.append("Patent examiner cannot grant patent until NBA Form III certificate is submitted to the Patent Office.")

        controlling_auth = "National Biodiversity Authority (NBA, Chennai) & State Biodiversity Boards (SBB)"
        governing_act = "Biological Diversity Act 2002 (as amended 2023)"
        abs_required = True

    return {
        "absRequired": abs_required,
        "statutoryMandates": mandates,
        "legalFindings": findings,
        "controllingAuthority": controlling_auth,
        "governingAct": governing_act
    }

def extract_attributes(text: str) -> Dict[str, Any]:
    """Extract formulation attributes using pattern matching."""
    text_lower = text.lower()

    classical_texts = [
        "charaka samhita", "sushruta samhita", "ashtanga hridaya",
        "sarngadhara samhita", "bhavaprakasha", "bhasheja ratnavali", "afi", "api"
    ]
    detected_classical = [ct for ct in classical_texts if ct in text_lower]

    known_herbs = [
        "ashwagandha", "withania somnifera", "triphala", "haritaki", "bibhitaki", "amalaki",
        "brahmi", "tulsi", "guduchi", "turmeric", "curcuma longa", "curcumin", "neem", "shatavari",
        "shilajit", "guggulu", "licorice", "ginger", "black pepper"
    ]
    found = [h.title() for h in known_herbs if h in text_lower]

    return {
        "productName": text.splitlines()[0][:50] if text else "Ayurvedic Formulation",
        "ingredients": ", ".join(found) if found else text[:100],
        "followsClassicalText": detected_classical[0].title() if detected_classical else "Proprietary",
        "isClassical": len(detected_classical) > 0,
        "targetMarket": "International" if ("international" in text_lower or "export" in text_lower) else "India",
        "dosageForm": "Extract / Compound" if "extract" in text_lower else "Churna / Powder",
        "intendedUse": text[:200]
    }

def Boolean_val(val: Any) -> bool:
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        return val.lower() in ["true", "1", "yes"]
    return bool(val)

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 -m src.ai.rag.main [chat|query|classify|abs|extract|knowledge] [JSON_DATA]")
        return

    cmd = sys.argv[1]
    data = {}

    if len(sys.argv) > 2:
        try:
            data = json.loads(sys.argv[2])
        except Exception as e:
            sys.stderr.write(f"Failed to parse argv JSON: {e}\n")
            data = {}
    elif not sys.stdin.isatty():
        import select
        if select.select([sys.stdin], [], [], 0.0)[0]:
            try:
                raw = sys.stdin.read()
                data = json.loads(raw) if raw.strip() else {}
            except Exception:
                data = {}

    if cmd in ["chat", "query"]:
        query = data.get("query", "")
        jurisdiction = data.get("jurisdiction", "India")
        category = data.get("classificationDetails", data.get("classificationCategory", ""))
        language = data.get("language", "en")
        result = rag_pipeline.ask(
            query=query,
            jurisdiction=jurisdiction,
            classification_category=category,
            language=language
        )
        print(json.dumps(result))

    elif cmd == "classify":
        input_data = data.get("input", data)
        jurisdiction = data.get("jurisdiction") or input_data.get("targetMarket") or input_data.get("jurisdiction") or "India"
        language = data.get("language", "en")
        result = classify_product(input_data, jurisdiction=jurisdiction, language=language)
        print(json.dumps(result))

    elif cmd in ["ip_analyze", "ip"]:
        context = data.get("productContext", data.get("product_context", data))
        jurisdiction = data.get("jurisdiction") or context.get("targetMarket") or context.get("jurisdiction") or "India"
        language = data.get("language", "en")
        result = analyze_product_ip(product_context=context, jurisdiction=jurisdiction, language=language)
        print(json.dumps(result))

    elif cmd in ["compliance", "compliance_analyze", "abs_regulatory"]:
        context = data.get("productContext", data.get("product_context", data))
        jurisdiction = data.get("jurisdiction") or context.get("targetMarket") or context.get("jurisdiction") or "India"
        language = data.get("language", "en")
        result = analyze_compliance(product_context=context, jurisdiction=jurisdiction, language=language)
        print(json.dumps(result))

    elif cmd in ["dossier", "dossier_create"]:
        result = build_case_dossier(data)
        print(json.dumps(result))

    elif cmd in ["dossier_export"]:
        dossier = data.get("dossier", data)
        text_export = export_dossier_text(dossier)
        print(json.dumps({"dossierText": text_export, "caseId": dossier.get("caseId")}))

    elif cmd in ["facilitator_review", "review"]:
        dossier = data.get("dossier", data)
        notes = data.get("notes", "")
        urgency = data.get("urgency", "Standard")
        ticket = submit_human_facilitator_review(dossier, review_notes=notes, urgency=urgency)
        print(json.dumps(ticket))

    elif cmd == "abs":
        result = assess_abs(data)
        print(json.dumps(result))

    elif cmd == "extract":
        text = data.get("text", "")
        res = extract_attributes(text)
        print(json.dumps({"answers": res}))

    elif cmd == "knowledge":
        print(json.dumps({"documents": STATUTORY_CORPUS}))

    elif cmd in ["evaluate", "benchmark"]:
        report = rag_evaluator.run_benchmark_suite()
        print(json.dumps(report))

    else:
        print(json.dumps({"error": f"Unknown command {cmd}"}))

if __name__ == "__main__":
    main()
