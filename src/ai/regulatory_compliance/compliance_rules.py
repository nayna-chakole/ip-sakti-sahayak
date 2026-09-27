"""
Deterministic Regulatory & ABS Compliance Rules Engine
Evaluates:
1. Biodiversity / ABS Assessment
2. NBA Approval Assessment
3. Traditional Knowledge / TKDL Assessment
4. Product Regulatory Requirements
Supports English, Hindi, and Marathi outputs.
"""

from typing import Dict, Any, List, Tuple
from .compliance_models import (
    STATUS_APPLICABLE,
    STATUS_POTENTIALLY_APPLICABLE,
    STATUS_NOT_INDICATED,
    STATUS_NEEDS_HUMAN_REVIEW,
    OFFICIAL_AUTHORITIES
)

def evaluate_compliance_rules(
    product_context: Dict[str, Any],
    language: str = "en",
    jurisdiction: Any = None
) -> Dict[str, Any]:
    """
    Evaluates product attributes against statutory biodiversity, TKDL, and regulatory provisions.
    """
    lang = language.lower() if language in ["hi", "mr", "en"] else "en"

    name = str(product_context.get("productName", product_context.get("product_name", "Ayurvedic Product"))).strip()
    category = str(product_context.get("category", product_context.get("productCategory", product_context.get("productClassification", product_context.get("regulatoryCategory", ""))))).strip()
    ingredients = str(product_context.get("ingredients", "")).strip()
    intended_use = str(product_context.get("intendedUse", product_context.get("intended_use", product_context.get("productDescription", "")))).strip()
    dosage_form = str(product_context.get("dosageForm", product_context.get("dosage_form", product_context.get("formulation", "")))).strip()
    classical_basis = str(product_context.get("followsClassicalText", product_context.get("classical_text_basis", product_context.get("classicalTextName", "")))).strip()
    jur_val = str(jurisdiction or product_context.get("jurisdiction", product_context.get("targetMarket", "India"))).strip()
    uncertainty = str(product_context.get("uncertaintyStatus", product_context.get("uncertainty_status", ""))).lower()
    confidence = str(product_context.get("confidence", "High")).capitalize()

    ing_lower = ingredients.lower()
    name_lower = name.lower()
    cat_lower = category.lower()
    use_lower = intended_use.lower()
    form_lower = dosage_form.lower()
    class_lower = classical_basis.lower()

    # Determine product classification type
    is_classical = "classical" in cat_lower or class_lower in ["yes", "yes_fully", "classical"] or any(t in name_lower for t in ["churna", "taila", "avaleha", "asava", "arishta", "vati", "bhasma", "samhita"])
    is_aahar = "aahar" in cat_lower or "dietary" in use_lower or "food" in use_lower or "supplement" in use_lower or "tea" in form_lower or "infusion" in form_lower
    is_phytopharm = "phytopharmaceutical" in cat_lower or "fraction" in form_lower or "purified" in form_lower or "standardized" in ing_lower
    is_cosmetic = "cosmetic" in cat_lower or "skin" in use_lower or "hair" in use_lower or "lotion" in form_lower or "cream" in form_lower or "face" in use_lower
    is_proprietary = "proprietary" in cat_lower or "patent" in cat_lower or (not is_classical and not is_aahar and not is_phytopharm and not is_cosmetic and (bool(ingredients) or "ayurvedic" in cat_lower))

    is_uncertain = "uncertain" in uncertainty or confidence == "Low" or "flagged" in uncertainty or "uncertain" in cat_lower or (not category and not (is_classical or is_aahar or is_phytopharm or is_cosmetic or is_proprietary))
    is_international = jur_val.lower() == "international"
    is_foreign_trade = is_international or "export" in jur_val.lower() or "both" in jur_val.lower()

    # Identify biological resources from ingredients / name
    common_herbs = [
        "amla", "phyllanthus emblica", "ashwagandha", "withania somnifera", "pippali", "piper longum",
        "tulsi", "ocimum sanctum", "guduchi", "tinospora cordifolia", "turmeric", "curcuma longa",
        "haritaki", "terminalia chebula", "bibhitaki", "terminalia bellirica", "shatavari", "asparagus racemosus",
        "brahmi", "bacopa monnieri", "neem", "azadirachta indica", "guggulu", "commiphora mukul",
        "yashtimadhu", "glycyrrhiza glabra", "ginger", "zingiber officinale", "dalchini", "cinnamomum verum",
        "honey", "ghee", "botanical extract", "botanical extracts", "herbal extract"
    ]
    detected_resources = []
    for herb in common_herbs:
        if herb in ing_lower or herb in name_lower:
            detected_resources.append(herb.title())
    if not detected_resources and ingredients:
        detected_resources = [item.strip() for item in ingredients.split(",") if item.strip()][:4]
    if not detected_resources:
        detected_resources = ["Indian Botanical / Biological Resources"]

    # =========================================================================
    # INTERNATIONAL REGIME EVALUATION
    # =========================================================================
    if is_international:
        # Separate TARGET JURISDICTION from RESOURCE ORIGIN
        resource_origin = str(
            product_context.get("resourceOrigin") or 
            product_context.get("resource_origin") or 
            product_context.get("sourceOfIngredients") or 
            product_context.get("source_of_ingredients") or 
            product_context.get("countryOfOrigin") or 
            product_context.get("origin") or 
            ""
        ).strip()

        dest_market_raw = str(
            product_context.get("destinationMarket") or 
            product_context.get("destination_market") or 
            product_context.get("targetMarket") or 
            product_context.get("target_market") or 
            jur_val
        ).strip().lower()

        combined_context = f"{name} {ingredients} {intended_use} {resource_origin}".lower()
        has_indian_resource = any(kw in resource_origin.lower() for kw in ["india", "indian", "domestic", "bharat"]) or any(
            kw in combined_context for kw in [
                "sourced from india", "indigenous to india", "indian biological resource",
                "contracted domestic farms", "indian farms", "harvested in india", "procured from india", "domestic farm"
            ]
        )
        has_foreign_resource = any(kw in resource_origin.lower() for kw in [
            "outside india", "non-indian", "foreign", "imported", "us", "usa", "united states",
            "europe", "germany", "japan", "sri lanka", "non-domestic", "global", "overseas"
        ])

        is_us_target = any(t in dest_market_raw for t in ["us", "usa", "united states", "america"]) or "fda" in combined_context
        is_eu_target = any(t in dest_market_raw for t in ["eu", "europe", "european"]) or any(t in combined_context for t in ["ema", "thmpd"])
        is_exclusive_us = is_us_target and not is_eu_target
        is_exclusive_eu = is_eu_target and not is_us_target

        bio_list_str = ", ".join(detected_resources[:3])

        # 1. BIODIVERSITY / ABS (International)
        # Note: Nagoya Protocol is conditional on provider-country accession and domestic ABS laws; not universally mandatory for every international product.
        if is_uncertain:
            abs_status = STATUS_NEEDS_HUMAN_REVIEW
            if lang == "hi":
                abs_reason = f"उत्पाद '{name}' के जैविक संसाधनों की उत्पत्ति व स्रोत अस्पष्ट हैं। नागोया प्रोटोकॉल एवं स्रोत देश के एबीएस (ABS) नियमों के तहत देयता निर्धारण हेतु जैविक सामग्री के उद्गम का सत्यापन आवश्यक है।"
                abs_missing = "जैविक घटकों का सटीक भौगोलिक स्त्रोत (देशीय बनाम विदेशी) और कॉर्पोरेट भागीदारी संरचना।"
            elif lang == "mr":
                abs_reason = f"'{name}' या उत्पादनातील जैविक घटकांचा मूळ स्रोत अस्पष्ट आहे. नागोया प्रोटोकॉल आणि स्त्रोत देशाच्या ABS नियमांनुसार दायित्व निश्चित करण्यासाठी अधिकृत पडताळणी आवश्यक आहे."
                abs_missing = "जैविक घटकांचा अचूक भौगोलिक स्रोत आणि कंपनीच्या सहभागाचे तपशील."
            else:
                abs_reason = f"Biological source origin for '{name}' is unspecified. Verification of ingredient sourcing is required to evaluate whether provider-country Access and Benefit Sharing (ABS) mandates or Nagoya Protocol terms apply."
                abs_missing = "Geographical source origin of botanical ingredients and corporate access structure."
            abs_provisions = [
                "Nagoya Protocol on Access and Benefit Sharing — Article 5 & Article 6 (PIC & MAT where applicable)",
                "Nagoya Protocol on ABS — Article 17 (Internationally Recognized Certificate of Compliance - IRCC)"
            ]
        elif has_indian_resource:
            abs_status = STATUS_APPLICABLE
            if lang == "hi":
                abs_reason = f"उत्पाद '{name}' अंतरराष्ट्रीय बाजार हेतु लक्षित है किंतु इसके जैविक संसाधन ({bio_list_str}) भारत से प्राप्त हैं। अतः भारतीय जैविक विविधता अधिनियम 2002 की धारा 3 (फॉर्म I) के तहत NBA की पूर्व अनुमति आवश्यक है। अंतरराष्ट्रीय स्तर पर नागोया प्रोटोकॉल के अनुरूप PIC और MAT शर्तें लागू होंगी।"
                abs_missing = ""
            elif lang == "mr":
                abs_reason = f"'{name}' हे उत्पादन आंतरराष्ट्रीय बाजारपेठेसाठी असले तरी यातील जैविक घटक ({bio_list_str}) भारतातून मिळवलेले आहेत. त्यामुळे भारताच्या जैविक विविधता कायदा २००२ च्या कलम ३ (फॉर्म I) नुसार NBA ची पूर्व मंजुरी आवश्यक आहे. आंतरराष्ट्रीय स्तरावर नागोया प्रोटोकॉलनुसार PIC आणि MAT अटी लागू होतात."
                abs_missing = ""
            else:
                abs_reason = f"Product '{name}' commercializes biological resources ({bio_list_str}) originating in India in cross-border trade. Sourcing Indian biological material triggers Section 3 of the Biological Diversity Act 2002, requiring prior approval from the National Biodiversity Authority (Form I). Internationally, provider-country Access and Benefit Sharing terms apply under the Nagoya Protocol."
                abs_missing = ""
            abs_provisions = [
                "Nagoya Protocol on Access and Benefit Sharing — Article 5 & Article 6 (PIC & MAT for genetic resources)",
                "Biological Diversity Act, 2002 — Section 3 (Mandatory NBA approval for non-Indian entities or foreign utilization of Indian resources)",
                "Nagoya Protocol on ABS — Article 17 (Internationally Recognized Certificate of Compliance - IRCC)"
            ]
        elif has_foreign_resource:
            abs_status = STATUS_POTENTIALLY_APPLICABLE
            if lang == "hi":
                abs_reason = f"उत्पाद '{name}' के जैविक संसाधन भारत से बाहर के हैं। भारतीय जैविक विविधता अधिनियम (धारा 3/7) इस पर लागू नहीं होता। अंतरराष्ट्रीय एबीएस देयता इस पर निर्भर करती है कि स्रोत देश नागोया प्रोटोकॉल का सदस्य है या नहीं। नागोया प्रोटोकॉल सभी अंतरराष्ट्रीय उत्पादों पर सार्वभौमिक रूप से अनिवार्य नहीं है (उदाहरणार्थ, अमेरिका इसका पक्षकार नहीं है)।"
                abs_missing = ""
            elif lang == "mr":
                abs_reason = f"'{name}' मधील जैविक घटक भारताबाहेरील आहेत. त्यामुळे भारतीय जैविक विविधता कायदा (कलम ३/७) लागू होत नाही. आंतरराष्ट्रीय ABS दायित्व स्त्रोत देशाच्या नागोया प्रोटोकॉल सहभागावर अवलंबून असते. नागोया प्रोटोकॉल सर्वच आंतरराष्ट्रीय उत्पादनांसाठी सार्वत्रिकपणे बंधनकारक नाही (उदा. अमेरिका याचा सदस्य नाही)."
                abs_missing = ""
            else:
                abs_reason = f"Biological resources for '{name}' are sourced outside India; therefore, Indian Biological Diversity Act provisions (Section 3/7) do NOT apply. International ABS obligations depend on whether the provider country is a Contracting Party to the Nagoya Protocol with domestic access measures. The Nagoya Protocol is not universally mandatory for every international product or destination market (e.g., the United States is not a party to the CBD or Nagoya Protocol)."
                abs_missing = ""
            abs_provisions = [
                "Nagoya Protocol on Access and Benefit Sharing — Article 5 & Article 6 (Conditional on provider country accession)",
                "CBD Access and Benefit-Sharing Clearing-House (ABSCH) Guidelines"
            ]
        else:
            abs_status = STATUS_POTENTIALLY_APPLICABLE
            if lang == "hi":
                abs_reason = f"उत्पाद '{name}' हेतु एबीएस (ABS) देयता सशर्त है: नागोया प्रोटोकॉल सार्वभौमिक रूप से सभी अंतरराष्ट्रीय उत्पादों पर अनिवार्य नहीं है (जैसे अमेरिका इसका सदस्य नहीं है), बल्कि केवल तभी लागू होता है जब आनुवंशिक संसाधन नागोया प्रोटोकॉल के सदस्य देश से लिए जाएं। भारतीय BDA धारा 3 केवल तभी लागू होगी जब सामग्री भारत से प्राप्त की गई हो।"
                abs_missing = ""
            elif lang == "mr":
                abs_reason = f"'{name}' साठी ABS ची आवश्यकता सशर्त आहे: नागोया प्रोटोकॉल सर्व आंतरराष्ट्रीय उत्पादनांसाठी आपोआप बंधनकारक नाही (उदा. अमेरिका याचा सदस्य नाही); तो केवळ स्त्रोत देश नागोया प्रोटोकॉलचा सदस्य असल्यास लागू होतो. भारतीय BDA कलम ३ केवळ जैविक घटक भारतातून मिळवले असल्यास लागू होते."
                abs_missing = ""
            else:
                abs_reason = f"Access and Benefit Sharing (ABS) for '{name}' is conditional: the Nagoya Protocol is not universally mandatory for every international product or destination market (e.g., the United States is not a party to the CBD or Nagoya Protocol). Obligations apply only where genetic resources are accessed from a Nagoya Protocol Contracting Party with domestic access legislation. Indian BDA Section 3 requirements apply strictly if biological material is sourced from India."
                abs_missing = ""
            abs_provisions = [
                "Nagoya Protocol on Access and Benefit Sharing — Article 5 & Article 6 (Conditional on provider-country accession and domestic legislation)",
                "Biological Diversity Act, 2002 — Section 3 (Applicable strictly if utilizing Indian biological resources)"
            ]
        abs_nba_relevant = has_indian_resource
        abs_auth = OFFICIAL_AUTHORITIES.get("cbd_nagoya", {}).get("name", "Convention on Biological Diversity (CBD) Secretariat / Nagoya ABS Clearing-House")
        abs_url = OFFICIAL_AUTHORITIES.get("cbd_nagoya", {}).get("url", "https://absch.cbd.int")

        # 2. NBA APPROVAL (International)
        # Note: NBA Form I and Form III are India-specific statutory requirements, NOT universal international mandates.
        if is_uncertain:
            nba_status = STATUS_NEEDS_HUMAN_REVIEW
            nba_form = "Needs Sourcing Verification"
            if lang == "hi":
                nba_reason = f"उत्पाद '{name}' के जैविक संसाधनों के स्रोत की पुष्टि आवश्यक है ताकि यह निर्धारित हो सके कि भारतीय BDA धारा 3 (फॉर्म I) या धारा 6 (फॉर्म III) लागू होती है या नहीं।"
            elif lang == "mr":
                nba_reason = f"'{name}' च्या जैविक घटकांच्या स्त्रोताची पडताळणी आवश्यक आहे जेणेकरून भारतीय BDA कलम ३ (फॉर्म I) किंवा कलम ६ (फॉर्म III) लागू होते की नाही हे निश्चित करता येईल."
            else:
                nba_reason = f"Verification of raw material sourcing is required for '{name}'. NBA approval under Section 3 (Form I) and Section 6 (Form III) applies strictly if biological resources are accessed from India."
            nba_provisions = ["Biological Diversity Act, 2002 — Territorial Scope (Indian Biological Resources)"]
        elif has_indian_resource:
            nba_status = STATUS_APPLICABLE
            nba_form = "Form I (Section 3 Foreign Access) & Form III (Section 6 Prior to Foreign Patent Grant)"
            if lang == "hi":
                nba_reason = f"चूंकि उत्पाद '{name}' के जैविक संसाधन भारत से प्राप्त हैं, राष्ट्रीय जैव विविधता प्राधिकरण (NBA) से धारा 3 (फॉर्म I) की पूर्व अनुमति विदेशी संस्थाओं अथवा विदेशी वाणिज्यिक उपयोग हेतु अनिवार्य है। विदेश में पेटेंट अनुदान से पूर्व धारा 6 (फॉर्म III) अनिवार्य है।"
            elif lang == "mr":
                nba_reason = f"'{name}' मधील जैविक घटक भारतातून प्राप्त केलेले असल्याने, परदेशी संस्था किंवा आंतरराष्ट्रीय वापरासाठी NBA कडून कलम ३ (फॉर्म I) पूर्व मंजुरी आवश्यक आहे. तसेच परदेशी पेटंट मिळण्यापूर्वी कलम ६ (फॉर्म III) मंजुरी घेणे बंधनकारक आहे."
            else:
                nba_reason = f"Because biological resources for '{name}' are sourced from India, access by foreign entities or for foreign commercial utilization requires mandatory Form I prior approval from the National Biodiversity Authority (NBA, Chennai) under Section 3. Additionally, filing foreign patent applications based on Indian biological resources requires Form III approval under Section 6 prior to patent grant."
            nba_provisions = [
                "Biological Diversity Act, 2002 — Section 3 (Access permissions for foreign entities and commercial utilization of Indian resources)",
                "Biological Diversity Act, 2002 — Section 6 (Mandatory NBA prior approval before grant of intellectual property rights based on Indian resources)",
                "Biological Diversity Rules, 2004 — Form I and Form III application procedures"
            ]
        elif has_foreign_resource:
            nba_status = STATUS_NOT_INDICATED
            nba_form = "Not Applicable (Non-Indian Biological Resources)"
            if lang == "hi":
                nba_reason = f"उत्पाद '{name}' पर NBA अनुमोदन लागू नहीं है। भारतीय जैविक विविधता अधिनियम (धारा 3 व धारा 6) केवल भारत में मिलने वाले जैविक संसाधनों पर लागू होता है, विदेशी संसाधनों पर नहीं।"
            elif lang == "mr":
                nba_reason = f"'{name}' साठी NBA मंजुरी लागू नाही. भारतीय जैविक विविधता कायदा (कलम ३ व ६) केवळ भारतातील जैविक घटकांवर लागू होतो, परदेशी घटकांवर नाही."
            else:
                nba_reason = f"NBA approval is not applicable for '{name}'. Indian Biological Diversity Act provisions (Section 3 Form I and Section 6 Form III) are territorial statutory mandates restricted to biological resources occurring in India; they do not apply to foreign genetic material."
            nba_provisions = ["Biological Diversity Act, 2002 — Territorial Scope (Indian Biological Resources Only)"]
        else:
            nba_status = STATUS_POTENTIALLY_APPLICABLE
            nba_form = "Conditional on Indian Sourcing (Form I / Form III)"
            if lang == "hi":
                nba_reason = f"NBA अनुमोदन (फॉर्म I / फॉर्म III) एक भारत-विशिष्ट विधिक आवश्यकता है, सार्वभौमिक अंतरराष्ट्रीय नियम नहीं। यह केवल तभी लागू होता है यदि '{name}' में भारत से प्राप्त जैविक संसाधनों का उपयोग किया गया हो। यदि सामग्री भारत से बाहर की है, तो NBA अनुमोदन की आवश्यकता नहीं है।"
            elif lang == "mr":
                nba_reason = f"NBA मंजुरी (फॉर्म I / फॉर्म III) ही भारत-विशिष्ट गरज आहे, सार्वत्रिक आंतरराष्ट्रीय नियम नव्हे. '{name}' मध्ये भारतातील जैविक घटकांचा वापर केला गेला असल्यास ही अट लागू होते. इतर देशांतील घटकांसाठी NBA मंजुरीची आवश्यकता नसते."
            else:
                nba_reason = f"NBA clearance under Section 3 (Form I) and Section 6 (Form III) is an India-specific legal requirement, NOT a universal international mandate. It applies strictly IF '{name}' utilizes biological materials accessed or sourced from India. For resources sourced outside India, NBA approval is not required; compliance follows the source country's domestic ABS regime."
            nba_provisions = [
                "Biological Diversity Act, 2002 — Section 3 & Section 6 (Conditional on utilization of Indian biological resources)"
            ]
        nba_auth = OFFICIAL_AUTHORITIES["nba"]["name"]
        nba_url = OFFICIAL_AUTHORITIES["nba"]["url"]

        # 3. TRADITIONAL KNOWLEDGE / TKDL (International)
        # Note: PCT is an international patent filing system, not a universal patent grant/approval.
        if is_uncertain:
            tk_status = STATUS_NEEDS_HUMAN_REVIEW
            tk_involvement = "Needs International Prior Art Verification"
            if lang == "hi":
                tk_reason = f"अंतरराष्ट्रीय खोज प्राधिकरण (ISA) डेटाबेस व टीकेडीएल (TKDL) में उत्पाद '{name}' की पूर्व-कला (Prior Art) स्थिति का मानवीय सत्यापन आवश्यक है।"
                tk_effect = "पीसीटी नियम 33.1 के तहत औपचारिक पूर्व-कला खोज अंतरराष्ट्रीय फाइलिंग प्रणाली में आवश्यक है।"
            elif lang == "mr":
                tk_reason = f"आंतरराष्ट्रीय शोध प्राधिकरण (ISA) आणि TKDL मध्ये '{name}' च्या पूर्व-कला स्थितीची पडताळणी आवश्यक आहे."
                tk_effect = "PCT नियम 33.1 नुसार आंतरराष्ट्रीय फाइलिंग प्रक्रियेत औपचारिक पूर्व-कला शोध आवश्यक आहे."
            else:
                tk_reason = f"Prior art status of '{name}' in Traditional Knowledge Digital Library (TKDL) and classical texts requires verification against International Searching Authority (ISA) databases during international search under the PCT filing system."
                tk_effect = "Formal textual prior art search required under PCT Rule 33.1."
            tk_provisions = [
                "Patent Cooperation Treaty (PCT) — Rule 33.1 (Prior art for international search filing system)",
                "WIPO Intergovernmental Committee (IGC) on Genetic Resources and Traditional Knowledge"
            ]
        else:
            tk_status = STATUS_APPLICABLE
            tk_involvement = "TKDL Prior Art Defense in International Patent Searches"
            if lang == "hi":
                tk_reason = f"सीएसआईआर की ट्रेडिशनल नॉलेज डिजिटल लाइब्रेरी (TKDL) पेटेंट सहयोग संधि (PCT) फाइलिंग प्रणाली (अध्याय 21 व नियम 33.1) के तहत प्रमुख अंतरराष्ट्रीय पेटेंट कार्यालयों (USPTO, EPO, JPO) द्वारा पूर्व-कला खोज हेतु उपयोग की जाती है। चूंकि PCT एक अंतरराष्ट्रीय फाइलिंग प्रणाली है (प्रत्यक्ष पेटेंट अनुदान नहीं), राष्ट्रीय पेटेंट कार्यालयों के परीक्षक '{name}' के शास्त्रीय योगों पर नवीनता खारिज करने हेतु TKDL साक्ष्य का उपयोग करते हैं।"
                tk_effect = "आयुर्वेदिक धरोहर के विदेशी अनुचित पेटेंट को रोकता है। PCT फाइलिंग प्रणाली के तहत अंतरराष्ट्रीय बौद्धिक संपदा रणनीति को तकनीकी सहक्रियाशीलता (Synergy), नवीन वितरण प्रणाली अथवा WIPO मैड्रिड प्रणाली ट्रेडमार्क पर आधारित होना चाहिए।"
            elif lang == "mr":
                tk_reason = f"CSIR ची Traditional Knowledge Digital Library (TKDL) पेटंट सहकार्य करार (PCT) फाइलिंग प्रणाली अंतर्गत (चॅप्टर 21 व नियम 33.1) प्रमुख आंतरराष्ट्रीय पेटंट कार्यालयांकडून पूर्व-कला तपासणीसाठी वापरली जाते. PCT ही आंतरराष्ट्रीय अर्ज प्रणाली आहे (थेट पेटेंट अनुदान नव्हे); राष्ट्रीय पेटंट कार्यालयातील परीक्षक '{name}' मधील पारंपारिक सूत्रांवर पेटंट फेटाळण्यासाठी TKDL चा पुरावा वापरतात."
                tk_effect = "पारंपारिक ज्ञानाचे परदेशी अयोग्य पेटेंट रोखते. PCT फाइलिंग प्रणाली अंतर्गत आंतरराष्ट्रीय IP रणनीती तांत्रिक सिनर्जी (Synergy) किंवा WIPO माद्रिद प्रणाली ट्रेडमार्कवर आधारलेली असावी."
            else:
                tk_reason = f"CSIR's Traditional Knowledge Digital Library (TKDL) is accessible to major International Searching Authorities (USPTO, EPO, JPO, UK IPO) under the Patent Cooperation Treaty (PCT) filing system (Chapter 21 and PCT Rule 33.1). While the PCT provides a unified international patent filing procedure rather than granting patents directly, examiners in designated national patent offices query TKDL prior art to reject novelty and inventive step claims on classical Ayurvedic compositions of '{name}'."
                tk_effect = "Prevents foreign misappropriation of Ayurvedic heritage. International IP strategy under the PCT filing system must rely on technical synergy (CI < 1.0), novel delivery devices, or trademark protection under the WIPO Madrid System."
            tk_provisions = [
                "Patent Cooperation Treaty (PCT) — Rule 33.1 (Prior art for international search filing system)",
                "Patent Cooperation Treaty (PCT) — Chapter 21 (International Searching Authorities access to TKDL)",
                "WIPO Intergovernmental Committee (IGC) on Intellectual Property and Genetic Resources"
            ]
        tk_auth = OFFICIAL_AUTHORITIES["tkdl"]["name"]
        tk_url = OFFICIAL_AUTHORITIES["tkdl"]["url"]

        # 4. PRODUCT REGULATORY REQUIREMENTS (International)
        # Conditional on the selected destination market (US vs EU vs General International)
        if is_uncertain:
            reg_status = STATUS_NEEDS_HUMAN_REVIEW
            reg_cat_name = "International Botanical Health Product (Further Verification Required)"
            reg_pathway = "Further Verification Required (US DSHEA / EU THMPD Frameworks)"
            reg_auth = OFFICIAL_AUTHORITIES.get("fda", {}).get("name", "US FDA") + " / " + OFFICIAL_AUTHORITIES.get("ema", {}).get("name", "EMA")
            reg_url = OFFICIAL_AUTHORITIES.get("fda", {}).get("url", "https://www.fda.gov")
            if lang == "hi":
                reg_reason = f"उत्पाद '{name}' के लिए गंतव्य बाजार (US vs EU) व विनियामक मार्ग निर्धारित करने हेतु अधिक विवरण अपेक्षित है। निर्णय-समर्थन स्थिति: आगे सत्यापन आवश्यक (Further Verification Required)।"
                reg_reqs = [
                    "गंतव्य बाजार (अमेरिका बनाम यूरोपीय संघ) और उपचारात्मक दावों का स्पष्टीकरण",
                    "30 वर्षीय पारंपरिक उपयोग के प्रमाण का मूल्यांकन (EU में THMPD के तहत 15 वर्ष सहित)",
                    "USP / Ph. Eur. मानकों के अनुरूप भारी धातु व संदूषक परीक्षण"
                ]
            elif lang == "mr":
                reg_reason = f"'{name}' साठी अंतिम बाजारपेठ (US किंवा EU) व विनियामक मार्ग ठरवण्यासाठी अधिक माहिती आवश्यक आहे. निर्णय-समर्थन स्थिती: पुढील पडताळणी आवश्यक (Further Verification Required)."
                reg_reqs = [
                    "लक्षित बाजारपेठ (अमेरिका विरुद्ध युरोपियन युनियन) आणि उपचारात्मक दाव्यांचे स्पष्टीकरण",
                    "३० वर्षांच्या पारंपारिक वापराच्या पुराव्याचे मूल्यांकन (EU मध्ये १५ वर्षांसह)",
                    "USP / Ph. Eur. मानकांनुसार जड धातू व कीटकनाशक चाचणी"
                ]
            else:
                reg_reason = f"Insufficient formulation details to determine international regulatory pathway for '{name}' in selected destination market. Decision-support status: Further Verification Required."
                reg_reqs = [
                    "Clarification of destination export market (US vs EU) and therapeutic vs wellness claims",
                    "Assessment of 30-year traditional use evidence (including 15 years in EU under THMPD)",
                    "Testing for heavy metals, pesticides, and microbial contaminants under USP/Ph. Eur. limits"
                ]
            reg_provisions = [
                "US Dietary Supplement Health and Education Act (DSHEA), 1994 — Section 3 & Section 4 (21 U.S.C. 321)",
                "EU Directive 2004/24/EC (THMPD) — Article 16a (Traditional Herbal Medicinal Products)",
                "WHO Guidelines on Good Agricultural and Collection Practices (GACP)"
            ]
        elif is_aahar:
            reg_status = STATUS_APPLICABLE
            if is_exclusive_us:
                reg_cat_name = "US Dietary Supplement (Herbal Wellness / DSHEA)"
                reg_pathway = "US FDA Dietary Supplement (DSHEA 1994) & 21 CFR Part 111 cGMP"
                reg_auth = OFFICIAL_AUTHORITIES.get("fda", {}).get("name", "US FDA")
                reg_url = OFFICIAL_AUTHORITIES.get("fda", {}).get("url", "https://www.fda.gov")
                if lang == "hi":
                    reg_reason = f"लक्षित अमेरिकी बाजार हेतु उत्पाद '{name}' को DSHEA 1994 के तहत डायटरी सप्लीमेंट के रूप में विनियमित किया जाता है।"
                    reg_reqs = [
                        "अमेरिकी एफडीए (US FDA) में खाद्य सुविधा पंजीकरण एवं यूएस एजेंट नामांकन",
                        "21 CFR भाग 111 cGMP गुणवत्ता मानकों का पूर्ण अनुपालन",
                        "बाजार में बिक्री के 30 दिनों के भीतर FDA को संरचना/कार्य (Structure/Function) दावों की अधिसूचना",
                        "अनिवार्य FDA अस्वीकरण: 'इन कथनों का FDA द्वारा मूल्यांकन नहीं किया गया है। यह किसी रोग के निदान या उपचार हेतु नहीं है।'"
                    ]
                elif lang == "mr":
                    reg_reason = f"अमेरिकन बाजारपेठेसाठी '{name}' हे उत्पादन DSHEA 1994 अंतर्गत Dietary Supplement म्हणून येते."
                    reg_reqs = [
                        "US FDA कडे अन्न सुविधा नोंदणी व US एजंटची नेमणूक",
                        "21 CFR Part 111 cGMP मानकांचे काटेकोर पालन",
                        "उत्पादन बाजारात आणल्यापासून ३० दिवसांत FDA कडे स्ट्रक्चर/फंक्शन दाव्यांची नोंद",
                        "अनिवार्य FDA चेतावणी: 'या विधानांचे FDA कडून मूल्यांकन झालेले नाही. हा कोणत्याही रोगावर उपचार नाही.'"
                    ]
                else:
                    reg_reason = f"For the United States destination market, '{name}' is regulated as a Dietary Supplement under DSHEA 1994."
                    reg_reqs = [
                        "US FDA Food Facility Registration and foreign facility US Agent designation",
                        "Strict compliance with 21 CFR Part 111 current Good Manufacturing Practices (cGMP)",
                        "Structure/Function claim notification submitted to FDA within 30 days of initial marketing",
                        "Mandatory FDA disclaimer: 'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.'"
                    ]
                reg_provisions = [
                    "US Dietary Supplement Health and Education Act (DSHEA), 1994 — Section 3 & Section 4 (21 U.S.C. 321 & 343)",
                    "US FDA 21 CFR Part 111 — Current Good Manufacturing Practice for Dietary Supplements"
                ]
            elif is_exclusive_eu:
                reg_cat_name = "EU Food Supplement (Directive 2002/46/EC)"
                reg_pathway = "EU Directive 2002/46/EC Food Supplements Member State Notification"
                reg_auth = "European Commission (DG SANTE) / EU Member State Food Safety Authorities"
                reg_url = "https://ec.europa.eu/food/safety_en"
                if lang == "hi":
                    reg_reason = f"यूरोपीय संघ के लक्षित बाजार हेतु उत्पाद '{name}' फ़ूड सप्लीमेंट्स निर्देश 2002/46/EC के अंतर्गत विनियमित है।"
                    reg_reqs = [
                        "लक्षित यूरोपीय सदस्य देशों में निर्देश 2002/46/EC के तहत अनिवार्य राष्ट्रीय अधिसूचनाएं",
                        "यूरोपीय खाद्य सुरक्षा प्राधिकरण (EFSA) के अधिकतम सुरक्षित स्तरों का अनुपालन",
                        "सदस्य देशों की आधिकारिक भाषाओं में लेबलिंग व पोषण संबंधी अनिवार्य घोषणाएं",
                        "उपचारात्मक अथवा रोग-निवारक दावों का पूर्ण परिहार"
                    ]
                elif lang == "mr":
                    reg_reason = f"युरोपियन युनियन बाजारपेठेसाठी '{name}' हे उत्पादन Food Supplements Directive 2002/46/EC अंतर्गत येते."
                    reg_reqs = [
                        "EU सदस्य देशांमध्ये Directive 2002/46/EC नुसार राष्ट्रीय पूर्वसूचना",
                        "EFSA सुरक्षितता मानकांचे काटेकोर पालन",
                        "संबंधित देशाच्या अधिकृत भाषेत लेबलिंग व पोषणात्मक माहिती",
                        "कोणत्याही रोगावरील उपचारात्मक दाव्यांवर बंदी"
                    ]
                else:
                    reg_reason = f"For the European Union destination market, '{name}' is governed under the Food Supplements Directive 2002/46/EC."
                    reg_reqs = [
                        "Compliance with EU Directive 2002/46/EC national notification requirements in target member states",
                        "Compliance with European Food Safety Authority (EFSA) safety levels and positive lists",
                        "Finished product packaging in the official national language(s) of destination member states",
                        "Strict prohibition against medicinal or disease-treatment claims"
                    ]
                reg_provisions = [
                    "EU Directive 2002/46/EC — Approximation of laws relating to food supplements",
                    "Regulation (EC) No 178/2002 — General Food Law Regulation"
                ]
            else:
                reg_cat_name = "International Dietary / Food Supplement (Target-Market Dependent)"
                reg_pathway = "Conditional on Destination Market: US FDA DSHEA 1994 (for US) / EU Directive 2002/46/EC (for EU)"
                reg_auth = OFFICIAL_AUTHORITIES.get("fda", {}).get("name", "US FDA") + " / " + OFFICIAL_AUTHORITIES.get("ema", {}).get("name", "EMA")
                reg_url = OFFICIAL_AUTHORITIES.get("fda", {}).get("url", "https://www.fda.gov")
                if lang == "hi":
                    reg_reason = f"उत्पाद '{name}' पोषण व आहारिक कल्याण हेतु है। विनियामक व्यवस्था गंतव्य बाजार पर निर्भर करती है: अमेरिका में DSHEA 1994 (डायटरी सप्लीमेंट) तथा यूरोपीय संघ में फ़ूड सप्लीमेंट्स निर्देश 2002/46/EC लागू होता है।"
                    reg_reqs = [
                        "अमेरिकी बाजार हेतु: US FDA खाद्य सुविधा पंजीकरण, US एजेंट, 21 CFR भाग 111 cGMP व संरचना/कार्य दावा अधिसूचना",
                        "यूरोपीय बाजार हेतु: निर्देश 2002/46/EC के तहत सदस्य राज्यों में राष्ट्रीय खाद्य सप्लीमेंट अधिसूचनाएं",
                        "अनिवार्य वैधानिक अस्वीकरण एवं उपचारात्मक रोग दावों का पूर्ण परिहार"
                    ]
                elif lang == "mr":
                    reg_reason = f"'{name}' हे उत्पादन पोषण व वेलनेससाठी आहे. विनियामक व्यवस्था लक्षित देशावर अवलंबून आहे: अमेरिकेत DSHEA 1994 (Dietary Supplement) आणि EU मध्ये Directive 2002/46/EC (Food Supplement)."
                    reg_reqs = [
                        "US साठी: FDA अन्न सुविधा नोंदणी, US एजंट नेमणूक, 21 CFR Part 111 cGMP व स्ट्रक्चर/फंक्शन सूचना",
                        "EU साठी: सदस्य देशांमध्ये Directive 2002/46/EC नुसार राष्ट्रीय नोंदणी",
                        "अनिवार्य वैधानिक चेतावणी आणि उपचारात्मक दाव्यांवर पूर्ण बंदी"
                    ]
                else:
                    reg_reason = f"'{name}' is positioned for nutritional/dietary wellness. The regulatory framework is conditional on the target export market: in the United States, it is governed under DSHEA 1994 as a Dietary Supplement; in the European Union, it is regulated under Directive 2002/46/EC as a Food Supplement."
                    reg_reqs = [
                        "For US export: US FDA Food Facility Registration, foreign US Agent, 21 CFR Part 111 cGMP, and 30-day structure/function claim notification",
                        "For EU export: Compliance with EU Directive 2002/46/EC national notification requirements in target member states",
                        "Mandatory dietary disclaimers and strict avoidance of disease-treatment claims"
                    ]
                reg_provisions = [
                    "US Dietary Supplement Health and Education Act (DSHEA), 1994 — Section 3 & Section 4 (21 U.S.C. 321 & 343)",
                    "US FDA 21 CFR Part 111 — Current Good Manufacturing Practice for Dietary Supplements",
                    "EU Directive 2002/46/EC — Approximation of laws relating to food supplements"
                ]
        elif is_phytopharm:
            reg_status = STATUS_APPLICABLE
            if is_exclusive_us:
                reg_cat_name = "US Botanical Drug (Standardized Extract / Botanical IND)"
                reg_pathway = "US FDA Botanical Drug Development Guidance (Botanical IND / NDA)"
                reg_auth = OFFICIAL_AUTHORITIES.get("fda", {}).get("name", "US FDA")
                reg_url = OFFICIAL_AUTHORITIES.get("fda", {}).get("url", "https://www.fda.gov")
                if lang == "hi":
                    reg_reason = f"अमेरिकी बाजार में उपचारात्मक दावों हेतु मानकीकृत अर्क '{name}' FDA बॉटनिकल ड्रग डेवलपमेंट गाइडेंस (Botanical IND/NDA) के तहत विनियमित है।"
                    reg_reqs = [
                        "क्लिनिकल परीक्षण से पूर्व अमेरिकी FDA CDER के साथ Botanical IND आवेदन",
                        "ICH मानकों के अनुरूप चरण I-III सुरक्षा व प्रभावकारिता परीक्षण",
                        "मल्टी-मार्कर रासायनिक फिंगरप्रिंटिंग (HPLC, LC-MS) बैच एकरूपता",
                        "21 CFR भाग 210/211 फार्मास्युटिकल cGMP मानकों का पालन"
                    ]
                elif lang == "mr":
                    reg_reason = f"अमेरिकन बाजारपेठेत उपचारात्मक दाव्यांसाठी प्रमाणित अर्क '{name}' US FDA Botanical Drug Guidance (Botanical IND/NDA) अंतर्गत येतो."
                    reg_reqs = [
                        "क्लिनिकल चाचणीपूर्वी FDA कडे Botanical IND अर्ज दाखल करणे",
                        "ICH मानकांनुसार टप्पा I-III सुरक्षितता व परिणामकारकता चाचण्या",
                        "रासायनिक फिंगरप्रिंटिंग (HPLC, LC-MS) विश्लेषण",
                        "21 CFR Part 210/211 फार्मास्युटिकल cGMP मानकांचे पालन"
                    ]
                else:
                    reg_reason = f"For the United States destination market, therapeutic claims for standardized extract '{name}' require approval under the US FDA Botanical Drug Guidance (Botanical IND/NDA)."
                    reg_reqs = [
                        "Botanical Investigational New Drug (IND) filing with FDA CDER prior to clinical investigation",
                        "Systematic Phase I, II, and III clinical safety and efficacy studies in accordance with ICH guidelines",
                        "Multi-marker chemical fingerprinting (HPLC, LC-MS) characterizing raw botanical and finished extract batches",
                        "Compliance with 21 CFR Part 210/211 pharmaceutical cGMP"
                    ]
                reg_provisions = [
                    "US FDA Botanical Drug Development Guidance for Industry (2016) — Section 2, 4 & 7 (21 CFR 314)",
                    "21 CFR Part 312 & 314 — Investigational New Drug and New Drug Applications"
                ]
            elif is_exclusive_eu:
                reg_cat_name = "EU Herbal Medicinal Product (EMA Well-Established Use)"
                reg_pathway = "EMA Well-Established Use / Herbal Medicinal Product Monograph (Directive 2001/83/EC)"
                reg_auth = OFFICIAL_AUTHORITIES.get("ema", {}).get("name", "EMA")
                reg_url = OFFICIAL_AUTHORITIES.get("ema", {}).get("url", "https://www.ema.europa.eu")
                if lang == "hi":
                    reg_reason = f"यूरोपीय संघ में मानकीकृत वानस्पतिक अर्क '{name}' यूरोपीय मेडिसिन एजेंसी (EMA) वेल-एस्टैब्लिश्ड यूज़ अथवा हर्बल मेडिसिनल प्रोडक्ट निर्देश के तहत विनियमित है।"
                    reg_reqs = [
                        "यूरोपीय संघ में 10 वर्ष के सुस्थापित औषधीय उपयोग का दस्तावेजी वैज्ञानिक प्रमाण",
                        "यूरोपीय फार्माकोपिया (Ph. Eur.) मानकों के अनुरूप मोनोग्राफ विनिर्देश",
                        "यूरोपीय संघ के अधिकृत प्राधिकारी से मार्केटिंग ऑथराइजेशन (MA)",
                        "EU GMP (Volume 4) मानकों का पूर्ण अनुपालन"
                    ]
                elif lang == "mr":
                    reg_reason = f"युरोपियन युनियनमध्ये '{name}' हे उत्पादन EMA Well-Established Use किंवा Herbal Medicinal Product मार्गदर्शक तत्त्वांतर्गत येते."
                    reg_reqs = [
                        "EU मध्ये १० वर्षांच्या सुस्थापित उपचारात्मक वापराचा पुरावा",
                        "European Pharmacopoeia (Ph. Eur.) मानकांनुसार विनिर्देश",
                        "EU अधिकृत प्राधिकरणाकडून Marketing Authorisation (MA) मिळवणे",
                        "EU GMP मानकांचे पूर्ण पालन"
                    ]
                else:
                    reg_reason = f"For the European Union destination market, '{name}' is regulated under the European Medicines Agency (EMA) Well-Established Medicinal Use or Herbal Medicinal Product framework (Directive 2001/83/EC Article 10a)."
                    reg_reqs = [
                        "Documented scientific evidence of well-established medicinal use within the EU for at least 10 years",
                        "Specification testing in accordance with European Pharmacopoeia (Ph. Eur.) botanical monographs",
                        "Marketing Authorisation (MA) dossier submitted to national competent authorities or EMA",
                        "Full compliance with EU GMP (EudraLex Volume 4)"
                    ]
                reg_provisions = [
                    "EU Directive 2001/83/EC — Article 10a (Well-established medicinal use)",
                    "EMA Guidelines on Quality of Herbal Medicinal Products"
                ]
            else:
                reg_cat_name = "International Botanical Drug / Standardized Phytopharmaceutical"
                reg_pathway = "Conditional on Destination Market: US FDA Botanical IND/NDA (for US) or EMA Well-Established Use (for EU)"
                reg_auth = OFFICIAL_AUTHORITIES.get("fda", {}).get("name", "US FDA") + " / " + OFFICIAL_AUTHORITIES.get("ema", {}).get("name", "EMA")
                reg_url = OFFICIAL_AUTHORITIES.get("fda", {}).get("url", "https://www.fda.gov")
                if lang == "hi":
                    reg_reason = f"उत्पाद '{name}' मानकीकृत वानस्पतिक अंश युक्त है। उपचारात्मक दावों हेतु विनियामक मार्ग गंतव्य देश पर निर्भर करता है: अमेरिका में FDA Botanical IND/NDA तथा यूरोपीय संघ में EMA वेल-एस्टैब्लिश्ड यूज़ (निर्देश 2001/83/EC) लागू होता है।"
                    reg_reqs = [
                        "अमेरिकी बाजार हेतु: FDA बॉटनिकल ड्रग डेवलपमेंट गाइडेंस के तहत Botanical IND/NDA और 21 CFR 210/211 cGMP",
                        "यूरोपीय संघ हेतु: EMA वेल-एस्टैब्लिश्ड यूज़ अथवा हर्बल मेडिसिनल प्रोडक्ट मोनोग्राफ का अनुपालन",
                        "मल्टी-मार्कर रासायनिक फिंगरप्रिंटिंग (HPLC, LC-MS) एवं सुरक्षा परीक्षण"
                    ]
                elif lang == "mr":
                    reg_reason = f"'{name}' हे प्रमाणित वनस्पती अर्क असलेले उत्पादन आहे. उपचारात्मक दाव्यांसाठी विनियामक चौकट लक्षित देशावर अवलंबून आहे: अमेरिकेत FDA Botanical IND/NDA आणि युरोपियन युनियनमध्ये EMA Well-Established Use."
                    reg_reqs = [
                        "US साठी: FDA Botanical Drug Guidance अंतर्गत Botanical IND/NDA व 21 CFR 210/211 cGMP",
                        "EU साठी: EMA Well-Established Use किंवा Herbal Medicinal Product मार्गदर्शक तत्त्वे",
                        "रासायनिक फिंगरप्रिंटिंग (HPLC, LC-MS) आणि सुरक्षितता चाचण्या"
                    ]
                else:
                    reg_reason = f"'{name}' contains a standardized botanical extract or fraction. For therapeutic claims, the regulatory pathway is conditional on the target destination market: in the US, via the US FDA Botanical Drug Guidance (Botanical IND/NDA); in the EU, via European Medicines Agency (EMA) Well-Established Use authorization."
                    reg_reqs = [
                        "For US market: Botanical Investigational New Drug (IND) and Botanical NDA submission under FDA Botanical Drug Guidance",
                        "For EU market: Marketing Authorisation based on EMA Well-Established Use dossier or herbal monograph",
                        "Multi-marker chemical fingerprinting (HPLC, LC-MS) characterizing raw botanical and finished extract batches"
                    ]
                reg_provisions = [
                    "US FDA Botanical Drug Development Guidance for Industry (2016) — Section 2, 4 & 7 (21 CFR 314)",
                    "EU Directive 2001/83/EC — Article 10a (Well-established medicinal use)",
                    "WHO Guidelines on Good Agricultural and Collection Practices (GACP)"
                ]
        elif is_cosmetic:
            reg_status = STATUS_APPLICABLE
            if is_exclusive_us:
                reg_cat_name = "US Herbal Cosmetic (MoCRA 2022)"
                reg_pathway = "US FDA Modernization of Cosmetics Regulation Act (MoCRA 2022)"
                reg_auth = OFFICIAL_AUTHORITIES.get("fda", {}).get("name", "US FDA")
                reg_url = OFFICIAL_AUTHORITIES.get("fda", {}).get("url", "https://www.fda.gov")
                if lang == "hi":
                    reg_reason = f"अमेरिकी बाजार हेतु कॉस्मेटिक उत्पाद '{name}' Modernization of Cosmetics Regulation Act (MoCRA 2022) द्वारा विनियमित है।"
                    reg_reqs = [
                        "अमेरिकी MoCRA के तहत विनिर्माण सुविधा पंजीकरण व कॉस्मेटिक उत्पाद लिस्टिंग",
                        "प्रतिकूल घटना रिकॉर्ड-कीपिंग एवं अनिवार्य गंभीर प्रतिकूल घटना रिपोर्टिंग",
                        "सुरक्षा पर्याप्तता दस्तावेज एवं उपचारात्मक दावों का पूर्ण परिहार"
                    ]
                elif lang == "mr":
                    reg_reason = f"अमेरिकन बाजारपेठेसाठी सौंदर्य प्रसाधन '{name}' हे MoCRA 2022 अंतर्गत येते."
                    reg_reqs = [
                        "US MoCRA नुसार उत्पादन केंद्र नोंदणी व कॉस्मेटिक उत्पादन लिस्टिंग",
                        "गंभीर दुष्परिणाम अहवाल प्रणाली व सुरक्षितता पुरावे",
                        "औषधी किंवा उपचारात्मक दाव्यांवर पूर्ण बंदी"
                    ]
                else:
                    reg_reason = f"For the United States destination market, '{name}' is governed under the Modernization of Cosmetics Regulation Act (MoCRA 2022)."
                    reg_reqs = [
                        "US MoCRA cosmetic manufacturing facility registration and product listing with FDA",
                        "Maintenance of safety substantiation records and adverse event reporting system",
                        "Strict avoidance of therapeutic or disease-treatment claims"
                    ]
                reg_provisions = [
                    "US Modernization of Cosmetics Regulation Act (MoCRA), 2022 — Facility Registration & Product Listing",
                    "Federal Food, Drug, and Cosmetic Act (FD&C Act) — Chapter VI (Cosmetics)"
                ]
            elif is_exclusive_eu:
                reg_cat_name = "EU Herbal Cosmetic (Regulation (EC) No 1223/2009)"
                reg_pathway = "EU Cosmetics Regulation (EC) No 1223/2009 & CPNP Notification"
                reg_auth = "European Commission (DG SANTE) / EU National Competent Authorities"
                reg_url = "https://ec.europa.eu/growth/sectors/cosmetics_en"
                if lang == "hi":
                    reg_reason = f"यूरोपीय संघ हेतु कॉस्मेटिक उत्पाद '{name}' नियम (EC) No 1223/2009 द्वारा विनियमित है।"
                    reg_reqs = [
                        "यूरोपीय संघ में बाजार प्रवेश से पूर्व CPNP पोर्टल पर अनिवार्य अधिसूचना",
                        "यूरोपीय सुरक्षा मूल्यांकनकर्ता द्वारा कॉस्मेटिक उत्पाद सुरक्षा रिपोर्ट (CPSR)",
                        "यूरोपीय संघ में स्थापित अधिकृत रेस्पॉन्सिबल पर्सन (EU Responsible Person) का नामांकन",
                        "ISO 22716 कॉस्मेटिक जीएमपी का अनुपालन"
                    ]
                elif lang == "mr":
                    reg_reason = f"EU बाजारपेठेसाठी '{name}' हे प्रसाधन Regulation (EC) No 1223/2009 अंतर्गत येते."
                    reg_reqs = [
                        "EU मध्ये बाजारपेठेत आणण्यापूर्वी CPNP पोर्टलवर इलेक्ट्रॉनिक नोंदणी",
                        "पात्र सुरक्षा तज्ज्ञाकडून Cosmetic Product Safety Report (CPSR) तयार करणे",
                        "EU मध्ये कायदेशीररित्या स्थापित Responsible Person (RP) ची नियुक्ती",
                        "ISO 22716 कॉस्मेटिक GMP मानकांचे पालन"
                    ]
                else:
                    reg_reason = f"For the European Union destination market, '{name}' is regulated under Regulation (EC) No 1223/2009 on Cosmetic Products."
                    reg_reqs = [
                        "EU Cosmetic Product Notification Portal (CPNP) notification prior to market entry",
                        "Compilation of Cosmetic Product Safety Report (CPSR) by a qualified European safety assessor",
                        "Designation of an EU Responsible Person (RP) legally established within the EU",
                        "Compliance with ISO 22716 Cosmetics Good Manufacturing Practices"
                    ]
                reg_provisions = [
                    "EU Cosmetics Regulation (EC) No 1223/2009 — Article 11 (PIF) & Article 13 (CPNP)",
                    "ISO 22716:2007 — Cosmetics Good Manufacturing Practices (GMP)"
                ]
            else:
                reg_cat_name = "International Herbal / Ayurvedic Cosmetic"
                reg_pathway = "Conditional on Destination Market: US FDA MoCRA 2022 (for US) / EU Regulation (EC) No 1223/2009 (for EU)"
                reg_auth = OFFICIAL_AUTHORITIES.get("fda", {}).get("name", "US FDA") + " / European Commission (DG SANTE)"
                reg_url = OFFICIAL_AUTHORITIES.get("fda", {}).get("url", "https://www.fda.gov")
                if lang == "hi":
                    reg_reason = f"उत्पाद '{name}' त्वचा अथवा बालों की देखभाल हेतु कॉस्मेटिक है। विनियामक व्यवस्था गंतव्य बाजार पर निर्भर करती है: अमेरिका में MoCRA 2022 तथा यूरोपीय संघ में प्रसाधन नियम (EC) No 1223/2009 लागू होता है।"
                    reg_reqs = [
                        "अमेरिकी बाजार हेतु: MoCRA 2022 के तहत सुविधा पंजीकरण व कॉस्मेटिक उत्पाद लिस्टिंग",
                        "यूरोपीय संघ हेतु: CPNP पोर्टल अधिसूचना, CPSR सुरक्षा रिपोर्ट व EU Responsible Person",
                        "ISO 22716 जीएमपी अनुपालन एवं उपचारात्मक दावों का पूर्ण परिहार"
                    ]
                elif lang == "mr":
                    reg_reason = f"'{name}' हे त्वचा व केसांच्या काळजीसाठी सौंदर्य प्रसाधन आहे. विनियामक चौकट गंतव्य बाजारपेठेवर अवलंबून आहे: अमेरिकेत MoCRA 2022 आणि EU मध्ये Regulation (EC) No 1223/2009."
                    reg_reqs = [
                        "US साठी: MoCRA 2022 नुसार उत्पादन केंद्र नोंदणी व कॉस्मेटिक उत्पादन लिस्टिंग",
                        "EU साठी: CPNP नोंदणी, CPSR सुरक्षितता अहवाल व EU Responsible Person नेमणूक",
                        "ISO 22716 मानकांचे पालन आणि रोगावरील दाव्यांवर बंदी"
                    ]
                else:
                    reg_reason = f"'{name}' is an Ayurvedic/herbal cosmetic formulation for topical care. The regulatory framework is conditional on the target destination market: in the US, governed under MoCRA 2022; in the EU, regulated under Regulation (EC) No 1223/2009."
                    reg_reqs = [
                        "For US export: US MoCRA cosmetic manufacturing facility registration and product listing with FDA",
                        "For EU export: EU CPNP notification, Cosmetic Product Safety Report (CPSR), and designation of an EU Responsible Person",
                        "Compliance with ISO 22716 Cosmetics GMP and strict avoidance of disease-treatment claims"
                    ]
                reg_provisions = [
                    "US Modernization of Cosmetics Regulation Act (MoCRA), 2022 — Facility Registration & Product Listing",
                    "EU Cosmetics Regulation (EC) No 1223/2009 — Article 11 (PIF) & Article 13 (CPNP)",
                    "ISO 22716:2007 — Cosmetics Good Manufacturing Practices (GMP)"
                ]
        else:
            reg_status = STATUS_APPLICABLE
            if is_exclusive_us:
                reg_cat_name = "US Botanical / Dietary Herbal Product (DSHEA / Botanical Drug)"
                reg_pathway = "US FDA Dietary Supplement (DSHEA 1994) or Botanical IND (FDA Guidance)"
                reg_auth = OFFICIAL_AUTHORITIES.get("fda", {}).get("name", "US FDA")
                reg_url = OFFICIAL_AUTHORITIES.get("fda", {}).get("url", "https://www.fda.gov")
                if lang == "hi":
                    reg_reason = f"लक्षित अमेरिकी बाजार हेतु उत्पाद '{name}' सामान्यतः DSHEA 1994 के तहत डायटरी सप्लीमेंट (संरचना/कार्य दावों के साथ) अथवा उपचारात्मक दावों हेतु बॉटनिकल ड्रग मार्ग के तहत प्रस्तुत किया जाता है।"
                    reg_reqs = [
                        "अमेरिकी डायटरी सप्लीमेंट हेतु: US FDA खाद्य सुविधा पंजीकरण तथा 21 CFR भाग 111 cGMP का पालन",
                        "अमेरिकी उपचारात्मक दावों हेतु: FDA बॉटनिकल ड्रग डेवलपमेंट गाइडेंस के तहत Botanical IND / NDA आवेदन",
                        "USP मानकों के अनुसार भारी धातु, कीटनाशक व संदूषक परीक्षण"
                    ]
                elif lang == "mr":
                    reg_reason = f"अमेरिकन बाजारपेठेसाठी '{name}' हे सहसा DSHEA 1994 अंतर्गत Dietary Supplement किंवा उपचारात्मक दाव्यांसाठी Botanical Drug मार्गाने नेले जाते."
                    reg_reqs = [
                        "US Dietary Supplement साठी: FDA अन्न सुविधा नोंदणी व 21 CFR Part 111 cGMP चे पालन",
                        "अमेरिकेत उपचारात्मक दाव्यांसाठी: FDA Botanical Drug Guidance अंतर्गत Botanical IND / NDA अर्ज",
                        "USP मानकांनुसार जड धातू व कीटकनाशक चाचणी"
                    ]
                else:
                    reg_reason = f"For the United States destination market, sponsors typically market '{name}' under the DSHEA 1994 Dietary Supplement framework (with structure/function claims) or pursue the Botanical Drug Development pathway (21 CFR 314) for therapeutic claims."
                    reg_reqs = [
                        "For US Dietary Supplement: US FDA Food Facility Registration and 21 CFR Part 111 cGMP compliance",
                        "For US Therapeutic Claims: Botanical Investigational New Drug (IND) and Botanical NDA submission under FDA Botanical Drug Guidance",
                        "Batch testing for heavy metals and pesticides meeting USP limits"
                    ]
                reg_provisions = [
                    "US Dietary Supplement Health and Education Act (DSHEA), 1994 — Section 3 & Section 4 (21 U.S.C. 321)",
                    "US FDA Botanical Drug Development Guidance for Industry (2016) — Section 2 & Section 7 (21 CFR 314)"
                ]
            elif is_exclusive_eu:
                reg_cat_name = "EU Herbal Medicinal / Food Supplement Product (Directive 2004/24/EC)"
                reg_pathway = "EU Directive 2004/24/EC (THMPD) or Directive 2002/46/EC Food Supplement"
                reg_auth = OFFICIAL_AUTHORITIES.get("ema", {}).get("name", "EMA")
                reg_url = OFFICIAL_AUTHORITIES.get("ema", {}).get("url", "https://www.ema.europa.eu")
                if lang == "hi":
                    reg_reason = f"यूरोपीय संघ के लक्षित बाजार हेतु उत्पाद '{name}' THMPD निर्देश 2004/24/EC (30 वर्ष का पारंपरिक उपयोग, जिसमें 15 वर्ष ईयू में हो) अथवा फ़ूड सप्लीमेंट (निर्देश 2002/46/EC) के रूप में पंजीकृत किया जाता है।"
                    reg_reqs = [
                        "यूरोपीय संघ औषधीय पंजीकरण हेतु: 30 वर्ष के पारंपरिक उपयोग का प्रमाण (THMPD के तहत EU में 15 वर्ष सहित)",
                        "यूरोपीय फ़ूड सप्लीमेंट हेतु: सदस्य राज्यों में निर्देश 2002/46/EC के तहत राष्ट्रीय अधिसूचनाएं",
                        "Ph. Eur. मानकों के अनुरूप रासायनिक फिंगरप्रिंटिंग व शुद्धता परीक्षण"
                    ]
                elif lang == "mr":
                    reg_reason = f"युरोपियन युनियन बाजारपेठेसाठी '{name}' हे THMPD (Directive 2004/24/EC - ३० वर्षांचा वापर पुरावा) किंवा Food Supplement म्हणून नोंदणीकृत करावे लागते."
                    reg_reqs = [
                        "EU औषधीसाठी: ३० वर्षांचा पारंपारिक वापराचा पुरावा (EU मध्ये १५ वर्षांसह - Directive 2004/24/EC)",
                        "EU Food Supplement साठी: सदस्य देशांमध्ये Directive 2002/46/EC नुसार राष्ट्रीय नोंदणी",
                        "Ph. Eur. मानकांनुसार रासायनिक फिंगरप्रिंटिंग व चाचणी"
                    ]
                else:
                    reg_reason = f"For the European Union destination market, '{name}' must qualify under the Traditional Herbal Medicinal Products Directive (THMPD 2004/24/EC) requiring 30 years documented use (including 15 years within the EU), or be marketed as a Food Supplement under Directive 2002/46/EC."
                    reg_reqs = [
                        "For EU Medicinal: Demonstration of 30 years traditional use (including 15 years within EU under Directive 2004/24/EC)",
                        "For EU Food Supplement: Compliance with national food supplement notification in target EU member states",
                        "Testing meeting European Pharmacopoeia (Ph. Eur.) botanical monograph standards"
                    ]
                reg_provisions = [
                    "EU Directive 2004/24/EC (THMPD) — Article 16a to 16d (Traditional Herbal Medicinal Products)",
                    "EU Directive 2002/46/EC — Approximation of laws relating to food supplements"
                ]
            else:
                reg_cat_name = "International Botanical / Herbal Product (Classical or Proprietary Ayurvedic Formulation)"
                reg_pathway = "Conditional on Destination Market: US FDA DSHEA / Botanical Drug (for US) & EU THMPD (Directive 2004/24/EC, for EU)"
                reg_auth = OFFICIAL_AUTHORITIES.get("fda", {}).get("name", "US FDA") + " / " + OFFICIAL_AUTHORITIES.get("ema", {}).get("name", "EMA")
                reg_url = OFFICIAL_AUTHORITIES.get("fda", {}).get("url", "https://www.fda.gov")
                if lang == "hi":
                    reg_reason = f"उत्पाद '{name}' अंतरराष्ट्रीय बाजार हेतु लक्षित आयुर्वेदिक योग है। विनियामक मार्ग गंतव्य बाजार पर निर्भर करता है: अमेरिका निर्यात हेतु DSHEA 1994 (डायटरी सप्लीमेंट) अथवा बॉटनिकल ड्रग IND; यूरोपीय संघ हेतु THMPD निर्देश 2004/24/EC (30 वर्ष का पारंपरिक उपयोग प्रमाण) अथवा फ़ूड सप्लीमेंट मार्ग लागू होता है।"
                    reg_reqs = [
                        "व्यापारिक वर्गीकरण का निर्धारण: डायटरी सप्लीमेंट (US DSHEA / EU फ़ूड सप्लीमेंट) बनाम बॉटनिकल उपचारात्मक औषधि (FDA / THMPD)",
                        "अमेरिकी डायटरी सप्लीमेंट हेतु: US FDA खाद्य सुविधा पंजीकरण तथा 21 CFR भाग 111 cGMP का पालन",
                        "अमेरिकी उपचारात्मक दावों हेतु: FDA बॉटनिकल ड्रग डेवलपमेंट गाइडेंस के तहत Botanical IND / NDA आवेदन",
                        "यूरोपीय संघ हेतु: 30 वर्ष के पारंपरिक उपयोग का प्रमाण (THMPD के तहत EU में 15 वर्ष सहित)",
                        "HPLC रासायनिक फिंगरप्रिंटिंग तथा USP / Ph. Eur. मानकों के अनुसार भारी धातु व कीटनाशक परीक्षण"
                    ]
                elif lang == "mr":
                    reg_reason = f"'{name}' हे आंतरराष्ट्रीय बाजारपेठेसाठी आयुर्वेदिक उत्पादन आहे. विनियामक मार्ग गंतव्य बाजारपेठेवर अवलंबून आहे: अमेरिकेत DSHEA 1994 अंतर्गत Dietary Supplement किंवा उपचारात्मक दाव्यांसाठी Botanical Drug मार्ग; EU मध्ये THMPD (Directive 2004/24/EC - ३० वर्षांचा वापर पुरावा) किंवा Food Supplement मार्ग."
                    reg_reqs = [
                        "व्यावसायिक वर्गीकरण ठरवणे: Dietary Supplement (US DSHEA / EU Food Supplement) विरुद्ध Botanical औषध (FDA / THMPD)",
                        "US Dietary Supplement साठी: FDA अन्न सुविधा नोंदणी व 21 CFR Part 111 cGMP चे पालन",
                        "अमेरिकेत उपचारात्मक दाव्यांसाठी: FDA Botanical Drug Guidance अंतर्गत Botanical IND / NDA अर्ज",
                        "EU औषधीसाठी: ३० वर्षांचा पारंपारिक वापराचा पुरावा (EU मध्ये १५ वर्षांसह - Directive 2004/24/EC)",
                        "HPLC रासायनिक फिंगरप्रिंटिंग व USP / Ph. Eur. मानकांनुसार जड धातू व कीटकनाशक चाचणी"
                    ]
                else:
                    reg_reason = f"'{name}' is an Ayurvedic formulation targeted for international markets. The applicable pathway is conditional on the destination market: for export to the US, sponsors market under DSHEA 1994 (Dietary Supplement) or pursue Botanical Drug IND (21 CFR 314); in the EU, sponsors qualify under Directive 2004/24/EC (THMPD, requiring 30 years use evidence with 15 years in EU) or market as a Food Supplement."
                    reg_reqs = [
                        "Commercial classification determination: Dietary Supplement (US DSHEA / EU Food Supplement) vs Botanical Therapeutic Drug (US FDA / EU THMPD)",
                        "For US Dietary Supplement: US FDA Food Facility Registration and 21 CFR Part 111 cGMP compliance",
                        "For US Therapeutic Claims: Botanical Investigational New Drug (IND) and Botanical NDA submission under FDA Botanical Drug Guidance",
                        "For EU Medicinal: Demonstration of 30 years traditional use (including 15 years within EU under Directive 2004/24/EC)",
                        "Validated batch-to-batch chemical fingerprinting (HPLC) and heavy metal/pesticide testing meeting USP/Ph. Eur. limits"
                    ]
                reg_provisions = [
                    "US FDA Botanical Drug Development Guidance for Industry (2016) — Section 2 & Section 7 (21 CFR 314)",
                    "US Dietary Supplement Health and Education Act (DSHEA), 1994 — Section 3 & Section 4 (21 U.S.C. 321)",
                    "EU Directive 2004/24/EC (THMPD) — Article 16a to 16d (Traditional Herbal Medicinal Products)"
                ]


        return {
            "productName": name,
            "classificationCategory": category,
            "jurisdiction": "International",
            "language": lang,
            "biodiversityABS": {
                "title": "Biodiversity / ABS Assessment" if lang == "en" else "जैव विविधता / एबीएस मूल्यांकन" if lang == "hi" else "जैवविविधता / एबीएस मूल्यांकन",
                "status": abs_status,
                "biologicalResourceIndicated": True if not is_uncertain else False,
                "relevantBiologicalResources": detected_resources,
                "isNbaApprovalRelevant": abs_nba_relevant,
                "reasoning": abs_reason,
                "missingInformation": abs_missing if is_uncertain else "",
                "provisions": abs_provisions,
                "officialAuthority": abs_auth,
                "officialSourceUrl": abs_url
            },
            "nbaApproval": {
                "title": "NBA Approval Assessment" if lang == "en" else "एनबीए (NBA) अनुमोदन मूल्यांकन" if lang == "hi" else "एनबीए (NBA) मंजुरी मूल्यांकन",
                "status": nba_status,
                "formType": nba_form,
                "reasoning": nba_reason,
                "provisions": nba_provisions,
                "officialAuthority": nba_auth,
                "officialSourceUrl": nba_url
            },
            "traditionalKnowledgeTKDL": {
                "title": "Traditional Knowledge / TKDL Assessment" if lang == "en" else "पारंपरिक ज्ञान / टीकेडीएल (TKDL) मूल्यांकन" if lang == "hi" else "पारंपारिक ज्ञान / टीकेडीएल (TKDL) मूल्यांकन",
                "status": tk_status,
                "traditionalKnowledgeInvolvement": tk_involvement,
                "reasoning": tk_reason,
                "effectOnIpProtection": tk_effect,
                "provisions": tk_provisions,
                "officialAuthority": tk_auth,
                "officialSourceUrl": tk_url
            },
            "regulatoryRequirements": {
                "title": "Product Regulatory Requirements" if lang == "en" else "उत्पाद विनियामक आवश्यकताएं" if lang == "hi" else "उत्पादन विनियामक आवश्यकता",
                "status": reg_status,
                "regulatoryCategory": reg_cat_name,
                "applicablePathway": reg_pathway,
                "reasoning": reg_reason,
                "specificRequirements": reg_reqs,
                "provisions": reg_provisions,
                "controllingAuthority": reg_auth,
                "officialSourceUrl": reg_url
            }
        }

    # =========================================================================
    # INDIA DOMESTIC REGIME EVALUATION (UNTOUCHED)
    # =========================================================================

    # =========================================================================
    # 1. BIODIVERSITY / ABS ASSESSMENT
    # =========================================================================
    if is_uncertain:
        abs_status = STATUS_NEEDS_HUMAN_REVIEW
        if lang == "hi":
            abs_reason = f"उत्पाद '{name}' के जैविक संसाधनों की उत्पत्ति और वर्गीकरण अनिश्चित है। जैविक विविधता अधिनियम के तहत एबीएस देयता तय करने से पहले सामग्री व स्त्रोत का सत्यापन आवश्यक है।"
            abs_missing = "जैविक संसाधन का सटीक स्त्रोत (खेती किया गया / जंगली संग्रह) और विनिर्माण इकाई का स्वामित्व विवरण।"
        elif lang == "mr":
            abs_reason = f"'{name}' या उत्पादनातील जैविक संसाधनांचा स्रोत आणि वर्गीकरण अनिश्चित आहे. जैविक विविधता कायद्यांतर्गत एबीएस दायित्व ठरवण्यासाठी मानवी पडताळणी आवश्यक आहे."
            abs_missing = "जैविक घटकांचा अचूक स्रोत (लागवड / जंगलातील संकलन) आणि कंपनीच्या मालकीचे तपशील."
        else:
            abs_reason = f"Classification or biological source origin for '{name}' is ambiguous. Statutory verification of ingredient sourcing is required to conclusively confirm Access and Benefit Sharing (ABS) mandates."
            abs_missing = "Exact biological sourcing (cultivated vs. wild collected) and Indian vs. foreign entity equity structure."
        abs_provisions = [
            "Biological Diversity Act, 2002 — Section 3 (Access permissions)",
            "Biological Diversity Act, 2002 — Section 7 (Prior intimation to SBB)"
        ]
        abs_nba_relevant = True
    else:
        abs_status = STATUS_APPLICABLE
        bio_list_str = ", ".join(detected_resources[:3])
        if lang == "hi":
            abs_reason = f"उत्पाद '{name}' में भारतीय जैविक संसाधन ({bio_list_str}) का वाणिज्यिक उपयोग शामिल है। जैविक विविधता अधिनियम 2002 (संशोधित 2023) की धारा 7 के तहत राज्य जैव विविधता बोर्ड (SBB) को पूर्व सूचना व 0.1%-0.5% लाभ-साझाकरण (ABS) देयता लागू है।"
            abs_missing = ""
        elif lang == "mr":
            abs_reason = f"'{name}' या उत्पादनामध्ये भारतीय जैविक संसाधनांचा ({bio_list_str}) व्यावसायिक वापर समाविष्ट आहे. जैविक विविधता कायदा 2002 (सुधारित 2023) च्या कलम 7 नुसार संबंधित राज्य जैवविविधता मंडळाला (SBB) पूर्व सूचना देणे आवश्यक आहे."
            abs_missing = ""
        else:
            abs_reason = f"Product '{name}' commercializes Indian biological resources ({bio_list_str}). Under Section 7 of the Biological Diversity Act 2002 (as amended 2023), Indian commercial manufacturers must submit prior intimation to the State Biodiversity Board (SBB) and comply with 0.1% to 0.5% benefit sharing norms."
            abs_missing = ""
        abs_provisions = [
            "Biological Diversity Act, 2002 — Section 7 (Prior Intimation to SBB for Commercial Utilization)",
            "Biological Diversity Act, 2002 — Section 40 & NTAC Notification (Commodity Trade Exemptions)",
            "Biological Diversity (Amendment) Act, 2023 — Exemption provisions for codified Ayush practitioners"
        ]
        abs_nba_relevant = is_foreign_trade or is_phytopharm or is_proprietary

    # =========================================================================
    # 2. NBA APPROVAL ASSESSMENT
    # =========================================================================
    if is_uncertain:
        nba_status = STATUS_NEEDS_HUMAN_REVIEW
        nba_form = "Needs Human Review / Verification"
        if lang == "hi":
            nba_reason = f"उत्पाद '{name}' के स्वामित्व व बौद्धिक संपदा दाखिल करने की स्थिति अनिश्चित है। एनबीए फॉर्म I अथवा फॉर्म III की अनिवार्यता की पुष्टि हेतु समीक्षा अपेक्षित है।"
        elif lang == "mr":
            nba_reason = f"'{name}' या उत्पादनाच्या बौद्धिक संपदा फाइलिंगची स्थिती अनिश्चित आहे. एनबीए फॉर्म I किंवा फॉर्म III ची आवश्यकता ठरवण्यासाठी पुनरावलोकन आवश्यक आहे."
        else:
            nba_reason = f"Entity ownership and patent filing intent for '{name}' are unverified. Formal review is needed to determine whether NBA Form I (foreign participation) or Form III (IP application) is mandatory."
        nba_provisions = ["Biological Diversity Act, 2002 — Section 6 & Section 3"]
    elif is_foreign_trade:
        nba_status = STATUS_APPLICABLE
        nba_form = "Form I (Section 3 Foreign Access) & Form III (Section 6 IPR Grant)"
        if lang == "hi":
            nba_reason = f"चूंकि उत्पाद '{name}' का लक्ष्य अंतरराष्ट्रीय बाज़ार अथवा विदेशी सहभागिता है, राष्ट्रीय जैव विविधता प्राधिकरण (NBA) से धारा 3 (फॉर्म I) तथा पेटेंट अनुदान पूर्व धारा 6 (फॉर्म III) की वैधानिक अनुमति अनिवार्य है।"
        elif lang == "mr":
            nba_reason = f"'{name}' या उत्पादनासाठी आंतरराष्ट्रीय बाजारपेठ किंवा विदेशी सहभाग असल्याने राष्ट्रीय जैवविविधता प्राधिकरणाकडून (NBA) कलम 3 (फॉर्म I) आणि पेटंट मंजुरीपूर्वी कलम 6 (फॉर्म III) परवानगी अनिवार्य आहे."
        else:
            nba_reason = f"Because '{name}' involves international export or entity participation, mandatory prior approval from the National Biodiversity Authority (NBA, Chennai) is required under Section 3 (Form I), and Form III prior to patent grant under Section 6."
        nba_provisions = [
            "Biological Diversity Act, 2002 — Section 3 (Access by non-Indian or foreign equity entities)",
            "Biological Diversity Act, 2002 — Section 6 (Mandatory prior approval for Intellectual Property Rights)",
            "Biological Diversity Rules, 2004 — Form I and Form III application procedures"
        ]
    elif is_proprietary or is_phytopharm:
        nba_status = STATUS_POTENTIALLY_APPLICABLE
        nba_form = "Form III (Section 6 Prior Approval for Patent Filing/Grant)"
        if lang == "hi":
            nba_reason = f"यदि उत्पाद '{name}' (प्रोपायटरी/फाइटॉफार्मास्युटिकल) पर पेटेंट का आवेदन किया जाता है, तो पेटेंट कार्यालय से पेटेंट मिलने से पूर्व NBA धारा 6 (फॉर्म III) प्रमाणपत्र अनिवार्य होगा।"
        elif lang == "mr":
            nba_reason = f"जर '{name}' (प्रोपायटरी/फायटोफार्मास्युटिकल) साठी पेटंट अर्ज दाखल केला गेला, तर पेटंट मंजूर होण्यापूर्वी NBA कलम 6 (फॉर्म III) मंजुरी अनिवार्य असेल."
        else:
            nba_reason = f"If patent protection is pursued for '{name}' (proprietary/phytopharmaceutical formulation), the applicant must obtain Section 6 Form III approval from NBA prior to patent grant."
        nba_provisions = [
            "Biological Diversity Act, 2002 — Section 6 (Prior approval for IPR based on Indian biological resources)",
            "The Patents Act, 1970 — Section 10(4)(d)(ii) (Mandatory disclosure of biological resource origin)"
        ]
    else:
        # Classical or food
        nba_status = STATUS_NOT_INDICATED
        nba_form = "Section 7 SBB Intimation Only (NBA Form III Not Indicated for Classical / Food)"
        if lang == "hi":
            nba_reason = f"शास्त्रीय योग अथवा आहार उत्पाद '{name}' पर पेटेंट का दावा नहीं किया जाता, अतः एनबीए फॉर्म III आवश्यक नहीं है। केवल एसबीबी (SBB) पूर्व सूचना लागू रहेगी।"
        elif lang == "mr":
            nba_reason = f"शास्त्रीय औषध किंवा आहार उत्पादन '{name}' साठी पेटंट दावा केला जात नसल्याने NBA फॉर्म III आवश्यक नाही. केवळ SBB पूर्व सूचना लागू राहील."
        else:
            nba_reason = f"NBA Form III approval is not indicated for '{name}' as classical samhita formulas and dietary foods do not seek formulation patents. State Biodiversity Board intimation under Section 7 remains applicable."
        nba_provisions = [
            "Biological Diversity Act, 2002 — Section 7 (Prior intimation to SBB)",
            "Biological Diversity Act, 2002 — Section 40 (NTAC exemptions for designated commodities)"
        ]

    # =========================================================================
    # 3. TRADITIONAL KNOWLEDGE / TKDL ASSESSMENT
    # =========================================================================
    if is_uncertain:
        tk_status = STATUS_NEEDS_HUMAN_REVIEW
        tk_involvement = "Needs Samhita Textual Verification"
        if lang == "hi":
            tk_reason = f"उत्पाद '{name}' का शास्त्रीय ग्रंथों में उल्लेख या पूर्व-कला (Prior Art) की स्थिति अस्पष्ट है। टीकेडीएल (TKDL) डेटाबेस मिलान हेतु मानवीय समीक्षा आवश्यक है।"
            tk_effect = "धारा 3(p) के तहत पेटेंट योग्यता की पुष्टि हेतु प्रथम अनुसूची संहिताओं में जांच आवश्यक है।"
        elif lang == "mr":
            tk_reason = f"'{name}' या उत्पादनाचा शास्त्रीय ग्रंथांमधील संदर्भ किंवा पूर्व-कला स्थिती अस्पष्ट आहे. TKDL पडताळणी आवश्यक आहे."
            tk_effect = "कलम 3(p) अंतर्गत पेटंट पात्रतेची पडताळणी करण्यासाठी संहितेमधील नोंदी तपासणे गरजेचे आहे."
        else:
            tk_reason = f"Textual basis for '{name}' in authoritative Samhitas or prior art status is uncertain. Formal TKDL search is required."
            tk_effect = "Cannot conclusively determine whether Section 3(p) absolute non-patentability bar applies without Samhita text mapping."
        tk_provisions = [
            "The Patents Act, 1970 — Section 3(p) (Traditional knowledge non-patentability)",
            "Drugs and Cosmetics Act, 1940 — First Schedule (Authoritative Ayurvedic Samhitas)"
        ]
    elif is_classical:
        tk_status = STATUS_APPLICABLE
        tk_involvement = "Direct Classical Samhita Formulation (First Schedule)"
        if lang == "hi":
            tk_reason = f"उत्पाद '{name}' पूर्णतः प्रथम अनुसूची संहिताओं (चरक, सुश्रुत, अष्टांग हृदय, आदि) में उल्लिखित पारंपरिक ज्ञान है। सीएसआईआर-टीकेडीएल (TKDL) में इसका पूर्व-कला साक्ष्य पहले से सुरक्षित है।"
            tk_effect = "पेटेंट अधिनियम 1970 की धारा 3(p) के तहत उत्पाद पेटेंट पूर्णतः वर्जित है। बौद्धिक संपदा संरक्षण ट्रेडमार्क (ब्रांड नाम) व विशिष्ट पैकेजिंग डिज़ाईन तक सीमित रहेगा।"
        elif lang == "mr":
            tk_reason = f"'{name}' हे उत्पादन संपूर्णपणे पहिल्या अनुसूचीतील संहितेमध्ये (चरक, सुश्रुत, अष्टांग हृदय इ.) नमूद पारंपारिक ज्ञान आहे. CSIR-TKDL मध्ये याचे पूर्व-कला पुरावे नोंदवलेले आहेत."
            tk_effect = "पेटंट कायदा 1970 च्या कलम 3(p) अंतर्गत पेटंट मिळणे पूर्णपणे वर्जित आहे. IP संरक्षण ट्रेडमार्क व डिझाइनपुरते मर्यादित राहील."
        else:
            tk_reason = f"'{name}' is codified classical traditional knowledge documented in First Schedule Authoritative Samhitas. Prior art references are documented in CSIR's Traditional Knowledge Digital Library (TKDL)."
            tk_effect = "Absolute statutory bar under Section 3(p) of The Patents Act 1970 prevents product patenting. IP strategy must focus on trademark brand protection (Class 5) and proprietary delivery systems."
        tk_provisions = [
            "The Patents Act, 1970 — Section 3(p) (Traditional Knowledge Bar)",
            "The Patents Act, 1970 — Section 25(1)(k) & Section 64(1)(p) (Pre/Post-grant opposition & revocation on TK grounds)",
            "Drugs and Cosmetics Act, 1940 — First Schedule (Codified texts)"
        ]
    elif is_aahar:
        tk_status = STATUS_APPLICABLE
        tk_involvement = "Dietary Ayurvedic Tradition (Schedule A Texts)"
        if lang == "hi":
            tk_reason = f"उत्पाद '{name}' आयुर्वेदिक आहार नियमों के तहत पारंपरिक स्वास्थ्य आहार परंपरा पर आधारित है। सामग्री पूर्व-कला के रूप में दर्ज है।"
            tk_effect = "दवा के रूप में पेटेंट वर्जित है; ट्रेडमार्क, लोगो और ट्रेड ड्रेस मुख्य सुरक्षा मार्ग हैं।"
        elif lang == "mr":
            tk_reason = f"'{name}' हे उत्पादन आयुर्वेदिक आहार परंपरा व संहितेतील आहारावर आधारित आहे."
            tk_effect = "औषध म्हणून पेटंट घेता येत नाही; ट्रेडमार्क व पॅकेजिंग डिझाइन हे मुख्य मार्ग आहेत."
        else:
            tk_reason = f"'{name}' is grounded in Ayurvedic dietary wellness traditions cited in Schedule A texts under Ayurveda Aahar regulations."
            tk_effect = "Prior art prevents therapeutic drug patents. IP protection rests on distinctive brand trademark and commercial trade dress."
        tk_provisions = [
            "The Patents Act, 1970 — Section 3(p)",
            "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 — Regulation 3"
        ]
    elif is_phytopharm:
        tk_status = STATUS_POTENTIALLY_APPLICABLE
        tk_involvement = "Standardized Fraction from Documented Botanical"
        if lang == "hi":
            tk_reason = f"यद्यपि मूल वनस्पति पारम्परिक ज्ञान का हिस्सा है, उत्पाद '{name}' मानकीकृत अंश (standardized fraction) है जो नई निष्कर्षण विधि का प्रतिनिधित्व करता है।"
            tk_effect = "धारा 3(p) की आपत्ति का उत्तर देने हेतु वैज्ञानिक प्रमाण व बायोमार्कर फिंगरप्रिंट आवश्यक हैं। निष्कर्षण विधि पर पेटेंट संभव है।"
        elif lang == "mr":
            tk_reason = f"मूळ वनस्पती पारंपारिक असली तरी '{name}' हे प्रमाणित अंश (standardized fraction) आहे."
            tk_effect = "कलम 3(p) आक्षेपावर मात करण्यासाठी रासायनिक फिंगरप्रिंट व सिनर्जी डेटा सादर करावा लागेल."
        else:
            tk_reason = f"While the parent botanical in '{name}' is traditional knowledge, the formulation utilizes an isolated and standardized phytochemical fraction."
            tk_effect = "Subject to Section 3(p) examination. Novel extraction processes or standardized synergistic fractions can overcome 3(p) if novel biomarker composition is proven."
        tk_provisions = [
            "The Patents Act, 1970 — Section 3(p) and Section 3(d)",
            "CDSCO New Drugs and Clinical Trials Rules, 2019 — Phytopharmaceutical Standards"
        ]
    else:
        # Proprietary / Cosmetic
        tk_status = STATUS_POTENTIALLY_APPLICABLE
        tk_involvement = "Classical Ingredients in Proprietary Combination"
        if lang == "hi":
            tk_reason = f"उत्पाद '{name}' में शास्त्रीय जड़ी-बूटियों का नया अनुपात या मिश्रण उपयोग किया गया है। प्रत्येक जड़ी-बूटी का ज्ञान टीकेडीएल में उपलब्ध है।"
            tk_effect = "पेटेंट प्राप्त करने के लिए धारा 3(e) के तहत औषधीय सहक्रियाशीलता (Synergy, CI < 1.0) का प्रयोगात्मक प्रमाण आवश्यक है, अन्यथा 3(p) व 3(e) के तहत अस्वीकार कर दिया जाएगा।"
        elif lang == "mr":
            tk_reason = f"'{name}' मध्ये पारंपारिक घटकांचे नवीन मिश्रण वापरले आहे. घटक वनस्पतींची पूर्व-कला TKDL मध्ये उपलब्ध आहे."
            tk_effect = "पेटंटसाठी कलम 3(e) अंतर्गत घटकांमधील सिनर्जी (Therapeutic Synergism) सिद्ध करणे बंधनकारक आहे."
        else:
            tk_reason = f"'{name}' uses classical ingredients in an innovative combination or delivery vehicle. Individual herbs are documented in TKDL."
            tk_effect = "To overcome Section 3(p) prior art and Section 3(e) mere admixture objections, applicant must demonstrate verified synergistic efficacy (Combination Index < 1.0)."
        tk_provisions = [
            "The Patents Act, 1970 — Section 3(p) & Section 3(e)",
            "The Patents Act, 1970 — Section 10(4)(d)(ii)"
        ]

    # =========================================================================
    # 4. PRODUCT REGULATORY REQUIREMENTS (PRODUCT-SPECIFIC PATHWAY)
    # =========================================================================
    if is_uncertain:
        reg_status = STATUS_NEEDS_HUMAN_REVIEW
        reg_cat_name = category or "Ambiguous Regulatory Formulation"
        reg_pathway = "Human Review & Classification Confirmation Required"
        reg_auth = OFFICIAL_AUTHORITIES["ayush_sla"]["name"]
        reg_url = OFFICIAL_AUTHORITIES["ayush_sla"]["url"]
        if lang == "hi":
            reg_reason = f"उत्पाद '{name}' का विनियामक मार्ग (औषधि vs आहार vs प्रसाधन सामग्री) निर्धारित करने हेतु पर्याप्त जानकारी उपलब्ध नहीं है।"
            reg_reqs = [
                "उपचारात्मक दावा बनाम आहारिक पोषण उद्देश्य का स्पष्टीकरण",
                "सामग्री का शास्त्रीय संदर्भ या प्रोपायटरी निर्माण का विवरण",
                "सक्रिय अंश की शुद्धता व मात्रा का रासायनिक प्रमाण"
            ]
        elif lang == "mr":
            reg_reason = f"'{name}' या उत्पादनाचा विनियामक मार्ग (औषध विरुद्ध आहार विरुद्ध सौंदर्य प्रसाधन) निश्चित करण्यासाठी अधिक माहिती आवश्यक आहे."
            reg_reqs = [
                "औषधी उपचार विरुद्ध आहारातील पूरक उद्देशाचे स्पष्टीकरण",
                "शास्त्रीय ग्रंथातील संदर्भ किंवा प्रोपायटरी पद्धतीचे विवरण",
                "घटकांचे प्रमाण व रासायनिक फिंगरप्रिंट"
            ]
        else:
            reg_reason = f"Insufficient formulation details to determine regulatory pathway (Drug vs. Food/Aahar vs. Cosmetic vs. Phytopharmaceutical) for '{name}'."
            reg_reqs = [
                "Clarification of curative/therapeutic claims versus general dietary sustenance",
                "Confirmation of whether recipe strictly follows First Schedule Samhitas",
                "Specification of biomarker standardization and extraction methodology"
            ]
        reg_provisions = [
            "Drugs and Cosmetics Act, 1940 — Section 3(a) & 3(h)",
            "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022"
        ]
    elif is_aahar:
        reg_status = STATUS_APPLICABLE
        reg_cat_name = "Ayurveda Aahar (Dietary Wellness / Food Supplement)"
        reg_pathway = "FSSAI Ayurveda Aahar Licensing & Food Safety Regulations"
        reg_auth = OFFICIAL_AUTHORITIES["fssai"]["name"]
        reg_url = OFFICIAL_AUTHORITIES["fssai"]["url"]
        if lang == "hi":
            reg_reason = f"उत्पाद '{name}' स्वास्थ्य आहार/सप्लीमेंट के अंतर्गत आता है। यह आयुष औषधि नहीं बल्कि FSSAI आयुर्वेद आहार विनियम 2022 के तहत विनियमित है।"
            reg_reqs = [
                "FSSAI केंद्रीय / राज्य खाद्य व्यवसाय संचालक (FBO) लाइसेंस",
                "पैकेजिंग पर अनिवार्य हरा 'आयुर्वेद आहार' लोगो प्रदर्शित करना",
                "अनिवार्य वैधानिक चेतावनी: 'केवल आहारिक उपयोग के लिए - औषधीय उपयोग के लिए नहीं'",
                "बीमारी के इलाज/रोकथाम के चिकित्सीय दावों पर पूर्ण प्रतिबंध",
                "FSSAI अनुसूची IV गुणवत्ता व पैकेजिंग मानकों का अनुपालन"
            ]
        elif lang == "mr":
            reg_reason = f"'{name}' हे उत्पादन पूरक आहार/वेलनेस प्रकारात मोडते. हे FSSAI आयुर्वेद आहार नियमन 2022 अंतर्गत येते."
            reg_reqs = [
                "FSSAI कडून खाद्य परवाना (FBO License)",
                "पॅकेटवर अधिकृत हिरवा 'आयुर्वेद आहार' लोगो लावणे अनिवार्य",
                "वैधानिक सूचना: 'केवळ आहारासाठी - औषध म्हणून वापरू नये'",
                "रोग बरे करण्याचे औषधी दावे करण्यावर पूर्ण बंदी",
                "FSSAI गुणवत्ता आणि लेबलिंग नियमांचे पालन"
            ]
        else:
            reg_reason = f"'{name}' is categorized as Ayurveda Aahar for dietary nourishment and wellness, regulated by FSSAI rather than as a prescription drug."
            reg_reqs = [
                "FSSAI Central / State Food Business Operator (FBO) License under Ayurveda Aahar category",
                "Mandatory display of the official green Ayurveda Aahar Logo on the principal display panel",
                "Mandatory statutory advisory: 'FOR DIETARY USE ONLY - NOT FOR MEDICINAL USE'",
                "Strict prohibition against making curative disease treatment or therapeutic claims",
                "Compliance with Schedule IV microbiological, heavy metal, and pesticide limits"
            ]
        reg_provisions = [
            "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 — Regulation 3 & Schedule IV",
            "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 — Regulation 6 (Logo & Statutory Advisory)"
        ]
    elif is_classical:
        reg_status = STATUS_APPLICABLE
        reg_cat_name = "Classical Ayurvedic Medicine (Shastriya formulation)"
        reg_pathway = "State Ayush Licensing Authority Classical Manufacturing License"
        reg_auth = OFFICIAL_AUTHORITIES["ayush_sla"]["name"]
        reg_url = OFFICIAL_AUTHORITIES["ayush_sla"]["url"]
        if lang == "hi":
            reg_reason = f"उत्पाद '{name}' प्रथम अनुसूची संहिताओं पर आधारित शास्त्रीय औषधि है। औषधि एवं प्रसाधन सामग्री अधिनियम 1940 की धारा 3(a) के तहत विनियमित है।"
            reg_reqs = [
                "राज्य आयुष अनुज्ञापन प्राधिकरण (SLA) से फॉर्म 25D / 24D विनिर्माण लाइसेंस",
                "कारखाने हेतु शेड्यूल्ड टी (Schedule T) जीएमपी (GMP) प्रमाणन अनिवार्य",
                "आयुर्वेदिक फार्माकोपिया ऑफ इंडिया (API) मानकों के अनुरूप कच्ची सामग्री का परीक्षण",
                "क्लीनिकल ट्रायल की आवश्यकता नहीं; प्रथम अनुसूची संहिताओं का संदर्भ पर्याप्त है",
                "भारी धातुओं (लीड, मर्करी, आर्सेनिक, कैडमियम) की मानक सीमा जांच"
            ]
        elif lang == "mr":
            reg_reason = f"'{name}' हे पहिल्या अनुसूचीतील संहितेवर आधारित शास्त्रीय औषध आहे. औषध आणि सौंदर्य प्रसाधने कायदा 1940 च्या कलम 3(a) नुसार परवाना आवश्यक आहे."
            reg_reqs = [
                "राज्य आयुष परवाना प्राधिकरणाकडून फॉर्म 25D मॅन्युफॅक्चरिंग परवाना",
                "Schedule T नुसार गुड मॅन्युफॅक्चरिंग प्रॅक्टिसेस (GMP) प्रमाणपत्र अनिवार्य",
                "आयुर्वेदिक फार्माकोपिया ऑफ इंडिया (API) मानकांनुसार कच्च्या मालाची तपासणी",
                "क्लिनिकल चाचणीची गरज नाही; संहितेतील मूळ संदर्भ पुरावा ग्राह्य धरला जातो",
                "जड धातू व कीटकनाशक मर्यादा चाचणी प्रमाणपत्र"
            ]
        else:
            reg_reason = f"'{name}' is a Classical Ayurvedic Drug manufactured strictly in accordance with authoritative books listed in the First Schedule, regulated under Section 3(a) of the Drugs & Cosmetics Act 1940."
            reg_reqs = [
                "State Ayush Licensing Authority (SLA) Manufacturing License (Form 25D / Form 24D)",
                "Mandatory Schedule T Good Manufacturing Practices (GMP) certification for premises",
                "Compliance with Ayurvedic Pharmacopoeia of India (API) monographs for raw materials",
                "No clinical trial data required: statutory citation of First Schedule Samhita satisfies safety/efficacy",
                "Mandatory Certificate of Analysis (CoA) for heavy metals, microbial count, and aflatoxins"
            ]
        reg_provisions = [
            "Drugs and Cosmetics Act, 1940 — Section 3(a) (Definition of Ayurvedic Drug)",
            "Drugs and Cosmetics Rules, 1945 — Schedule T (Good Manufacturing Practices)",
            "Drugs and Cosmetics Act, 1940 — First Schedule (Authoritative Texts)"
        ]
    elif is_phytopharm:
        reg_status = STATUS_APPLICABLE
        reg_cat_name = "Phytopharmaceutical Drug / Standardized Botanical Extract"
        reg_pathway = "CDSCO Phytopharmaceutical New Drug Regulatory Clearance"
        reg_auth = OFFICIAL_AUTHORITIES["cdsco"]["name"]
        reg_url = OFFICIAL_AUTHORITIES["cdsco"]["url"]
        if lang == "hi":
            reg_reason = f"उत्पाद '{name}' मानकीकृत अंश पर आधारित फाइटॉफार्मास्युटिकल औषधि है। यह CDSCO के नवीन औषधि नियम 2019 के अंतर्गत विनियमित है।"
            reg_reqs = [
                "केंद्रीय औषधि मानक नियंत्रण संगठन (CDSCO) से फाइटॉफार्मास्युटिकल नवीन औषधि अनुमोदन",
                "चरण I, II और III नैदानिक परीक्षण (Clinical Trials) डेटा प्रस्तुत करना",
                "एचपीएलसी / एचपीटीएलसी (HPLC/HPTLC) बायोमार्कर फिंगरप्रिंट प्रोफाइलिंग",
                "कच्चे माल का बॉटनिकल व टैक्सोनॉमिक प्रमाणीकरण (Herbarium voucher)",
                "अंतरराष्ट्रीय गुणवत्ता मानकों के अनुसार स्थिरता (Stability) अध्ययन"
            ]
        elif lang == "mr":
            reg_reason = f"'{name}' हे वनस्पती घटकांचे शुद्ध अंश असलेले फायटोफार्मास्युटिकल औषध आहे. हे CDSCO नियमांनुसार नवीन औषध मानले जाते."
            reg_reqs = [
                "CDSCO कडून Phytopharmaceutical New Drug मंजुरी",
                "फेज I, II आणि III क्लिनिकल चाचण्यांचा अहवाल देणे बंधनकारक",
                "बायोमार्कर क्रोमॅटोग्राफिक फिंगरप्रिंट (HPLC/HPTLC) विश्लेषण",
                "वनस्पतीचे अधिकृत प्रमाणीकरण व हरबेरियम पुरावा",
                "नियम 122E व शेड्युल Y नुसार स्थिरता अभ्यास डेटा"
            ]
        else:
            reg_reason = f"'{name}' is a Phytopharmaceutical Drug containing a standardized fraction with defined biomarkers, governed under the New Drugs and Clinical Trials Rules 2019 by CDSCO."
            reg_reqs = [
                "Central Drugs Standard Control Organisation (CDSCO) New Phytopharmaceutical Drug Approval",
                "Submission of systematic Phase I, II, and III clinical safety and therapeutic trial data",
                "Validated HPLC / HPTLC chromatographic fingerprint profiles identifying at least 4 chemical markers",
                "Taxonomic authentication of source plant material deposited in a recognized national herbarium",
                "Comprehensive accelerated and real-time stability studies across multiple production batches"
            ]
        reg_provisions = [
            "New Drugs and Clinical Trials Rules, 2019 — Chapter V (Phytopharmaceutical Drugs)",
            "Drugs and Cosmetics Rules, 1945 — Schedule Y (Clinical evaluation guidelines)"
        ]
    elif is_cosmetic:
        reg_status = STATUS_APPLICABLE
        reg_cat_name = "Ayurvedic / Herbal Cosmetic"
        reg_pathway = "Ayush / State Licensing Cosmetic Manufacturing Framework"
        reg_auth = OFFICIAL_AUTHORITIES["ayush_sla"]["name"]
        reg_url = OFFICIAL_AUTHORITIES["ayush_sla"]["url"]
        if lang == "hi":
            reg_reason = f"उत्पाद '{name}' त्वचा अथवा बालों की देखभाल हेतु प्रसाधन सामग्री (Cosmetic) है। प्रसाधन नियम 2020 व आयुष प्रसाधन मानकों द्वारा शासित है।"
            reg_reqs = [
                "राज्य आयुष अनुज्ञापन प्राधिकरण से आयुर्वेदिक कॉस्मेटिक विनिर्माण लाइसेंस (फॉर्म 32/32A)",
                "BIS / अनुसूची S गुणवत्ता व सुरक्षा मानकों का अनुपालन",
                "त्वचा जलन (Draize eye/skin irritation) सुरक्षा परीक्षण",
                "चिकित्सीय रोग निवारण दावों की मनाही; केवल सौंदर्यवर्धन व पोषण के दावे अनुमत"
            ]
        elif lang == "mr":
            reg_reason = f"'{name}' हे त्वचा किंवा केसांच्या सौंदर्यासाठी वापरले जाणारे आयुर्वेदिक कॉस्मेटिक उत्पादन आहे."
            reg_reqs = [
                "राज्य परवाना प्राधिकरणाकडून आयुर्वेदिक कॉस्मेटिक उत्पादन परवाना",
                "शेड्युल S आणि BIS मानकांचे पालन",
                "त्वचा सुरक्षा आणि ॲलर्जी चाचणी अहवाल",
                "औषधी बरे करण्याचे दावे न करता केवळ सौंदर्य संरक्षणाचे दावे करण्यास परवानगी"
            ]
        else:
            reg_reason = f"'{name}' is an Ayurvedic Cosmetic intended for topical cleansing, beautification, or skin/hair enhancement under the Cosmetics Rules 2020."
            reg_reqs = [
                "State Ayush / Drug Licensing Authority Cosmetic Manufacturing License (Form 32)",
                "Compliance with Schedule S standards and Bureau of Indian Standards (BIS) specifications",
                "Mandatory skin sensitization, heavy metal testing, and ocular irritation safety documentation",
                "Prohibition of curative therapeutic claims; only cosmetic structure/appearance claims permitted"
            ]
        reg_provisions = [
            "Drugs and Cosmetics Act, 1940 — Section 3(aaa) & Part XIII (Cosmetics)",
            "Cosmetics Rules, 2020 — Standards and Manufacturing Conditions"
        ]
    else:
        # Proprietary Ayurvedic Medicine
        reg_status = STATUS_APPLICABLE
        reg_cat_name = "Ayurvedic Patent or Proprietary Medicine"
        reg_pathway = "State Ayush Licensing Authority Proprietary Drug License (Rule 158B)"
        reg_auth = OFFICIAL_AUTHORITIES["ayush_sla"]["name"]
        reg_url = OFFICIAL_AUTHORITIES["ayush_sla"]["url"]
        if lang == "hi":
            reg_reason = f"उत्पाद '{name}' एक प्रोपायटरी आयुर्वेदिक दवा है (धारा 3(h))। सामग्री शास्त्रीय है किंतु अनुपात या प्रारूप प्रोपायटरी है, अतः नियम 158B के प्रमाण आवश्यक हैं।"
            reg_reqs = [
                "राज्य आयुष अनुज्ञापन प्राधिकरण (SLA) से प्रोपायटरी विनिर्माण लाइसेंस (फॉर्म 25D)",
                "नियम 158B के तहत सुरक्षा प्रमाण एवं प्रकाशित वैज्ञानिक साक्ष्य या पायलट अध्ययन",
                "शेड्यूल टी (Schedule T) जीएमपी (GMP) गुणवत्ता मानकों का अनुपालन",
                "सक्रिय घटकों का मानकीकरण व स्थिरता परीक्षण डेटा",
                "अंतिम उत्पाद का भारी धातु, माइक्रोबियल एवं कीटनाशक परीक्षण प्रमाण-पत्र (CoA)"
            ]
        elif lang == "mr":
            reg_reason = f"'{name}' हे प्रोपायटरी आयुर्वेदिक औषध आहे (कलम 3(h)). घटक संहितेतील असले तरी त्यांचे प्रमाण व डोस नवीन असल्याने नियम 158B चे पालन आवश्यक आहे."
            reg_reqs = [
                "राज्य आयुष परवाना प्राधिकरणाकडून प्रोपायटरी उत्पादन परवाना (फॉर्म 25D)",
                "नियम 158B अंतर्गत सुरक्षा व परिणामकारकतेचे वैज्ञानिक पुरावे किंवा पायलट क्लिनिकल अभ्यास",
                "Schedule T GMP गुणवत्ता मार्गदर्शक तत्त्वांचे पालन",
                "बॅच-टू-बॅच स्थिरता चाचणी व प्रमाणन",
                "जड धातू, कीटकनाशक व सूक्ष्मजीव तपासणी अहवाल (CoA)"
            ]
        else:
            reg_reason = f"'{name}' is an Ayurvedic Proprietary Medicine under Section 3(h) of Drugs and Cosmetics Act 1940. Ingredients are cited in authoritative texts, but the combination or dosage format is proprietary."
            reg_reqs = [
                "State Ayush Licensing Authority (SLA) Proprietary Medicine License (Form 25D)",
                "Evidence of Safety and Efficacy under Rule 158B (pilot clinical data or published literature)",
                "Mandatory Schedule T Good Manufacturing Practices (GMP) compliance for premises",
                "Product stability data and chemical marker standardization across production batches",
                "Batch Certificate of Analysis (CoA) verifying permissible limits for heavy metals, microbes, and aflatoxins"
            ]
        reg_provisions = [
            "Drugs and Cosmetics Act, 1940 — Section 3(h) (Definition of Patent or Proprietary Medicine)",
            "Drugs and Cosmetics Rules, 1945 — Rule 158B (Safety and Efficacy Requirements)",
            "Drugs and Cosmetics Rules, 1945 — Schedule T (Good Manufacturing Practices for Ayush)"
        ]

    return {
        "productName": name,
        "classificationCategory": category,
        "jurisdiction": jurisdiction,
        "language": lang,
        "biodiversityABS": {
            "title": "Biodiversity / ABS Assessment" if lang == "en" else "जैव विविधता / एबीएस मूल्यांकन" if lang == "hi" else "जैवविविधता / एबीएस मूल्यांकन",
            "status": abs_status,
            "biologicalResourceIndicated": True if not is_uncertain else False,
            "relevantBiologicalResources": detected_resources,
            "isNbaApprovalRelevant": abs_nba_relevant,
            "reasoning": abs_reason,
            "missingInformation": abs_missing if is_uncertain else "",
            "provisions": abs_provisions,
            "officialAuthority": OFFICIAL_AUTHORITIES["nba"]["name"],
            "officialSourceUrl": OFFICIAL_AUTHORITIES["nba"]["url"]
        },
        "nbaApproval": {
            "title": "NBA Approval Assessment" if lang == "en" else "एनबीए (NBA) अनुमोदन मूल्यांकन" if lang == "hi" else "एनबीए (NBA) मंजुरी मूल्यांकन",
            "status": nba_status,
            "formType": nba_form,
            "reasoning": nba_reason,
            "provisions": nba_provisions,
            "officialAuthority": OFFICIAL_AUTHORITIES["nba"]["name"],
            "officialSourceUrl": OFFICIAL_AUTHORITIES["nba"]["url"]
        },
        "traditionalKnowledgeTKDL": {
            "title": "Traditional Knowledge / TKDL Assessment" if lang == "en" else "पारंपरिक ज्ञान / टीकेडीएल (TKDL) मूल्यांकन" if lang == "hi" else "पारंपारिक ज्ञान / टीकेडीएल (TKDL) मूल्यांकन",
            "status": tk_status,
            "traditionalKnowledgeInvolvement": tk_involvement,
            "reasoning": tk_reason,
            "effectOnIpProtection": tk_effect,
            "provisions": tk_provisions,
            "officialAuthority": OFFICIAL_AUTHORITIES["tkdl"]["name"],
            "officialSourceUrl": OFFICIAL_AUTHORITIES["tkdl"]["url"]
        },
        "regulatoryRequirements": {
            "title": "Product Regulatory Requirements" if lang == "en" else "उत्पाद विनियामक आवश्यकताएं" if lang == "hi" else "उत्पादन विनियामक आवश्यकता",
            "status": reg_status,
            "regulatoryCategory": reg_cat_name,
            "applicablePathway": reg_pathway,
            "reasoning": reg_reason,
            "specificRequirements": reg_reqs,
            "provisions": reg_provisions,
            "controllingAuthority": reg_auth,
            "officialSourceUrl": reg_url
        }
    }
