"""
Product-Specific IP Rules Engine
Evaluates statutory rules across the 7 IP categories based on the product classification context and facts.
Supports multilingual output in English, Hindi, and Marathi.
"""

from typing import Dict, Any, List, Tuple
from .ip_models import (
    CATEGORY_PATENT,
    CATEGORY_TRADEMARK,
    CATEGORY_GI,
    CATEGORY_COPYRIGHT,
    CATEGORY_DESIGN,
    CATEGORY_PLANT_VARIETY,
    CATEGORY_TK_PRIOR_ART,
    IP_STATUS_RELEVANT,
    IP_STATUS_POTENTIALLY_RELEVANT,
    IP_STATUS_NOT_INDICATED,
    IP_STATUS_NEEDS_HUMAN_REVIEW
)

def evaluate_product_ip_rules(
    product_context: Dict[str, Any],
    language: str = "en",
    jurisdiction: Any = None
) -> Dict[str, Dict[str, Any]]:
    """
    Evaluates each of the 7 IP categories against actual product facts and retrieved statutory evidence.
    
    Status standards:
    1. Potentially Relevant Provision: Only when product facts and retrieved sources provide reasonable basis.
    2. Human Review Recommended: Use only when there is genuine uncertainty, missing information, conflicting evidence, or a fact requiring professional/legal verification.
    3. No Relevant Provision Identified in Retrieved Sources: Use when retrieved evidence does not establish relevance.
    """
    lang = language.lower() if language in ["hi", "mr", "en"] else "en"

    name = str(product_context.get("productName", product_context.get("product_name", "Ayurvedic Formulation"))).strip()
    category = str(product_context.get("category", product_context.get("productCategory", product_context.get("productClassification", product_context.get("regulatoryCategory", product_context.get("regulatory_category", "")))))).strip()
    ingredients = str(product_context.get("ingredients", "")).lower()
    intended_use = str(product_context.get("intendedUse", product_context.get("intended_use", product_context.get("productDescription", "")))).lower()
    dosage_form = str(product_context.get("dosageForm", product_context.get("dosage_form", product_context.get("formulation", product_context.get("formulationBasis", ""))))).lower()
    claims = str(product_context.get("claimsMade", product_context.get("claims_made", product_context.get("claims", "")))).lower()
    description = str(product_context.get("productDescription", product_context.get("description", ""))).lower()
    packaging = str(product_context.get("packaging", product_context.get("packagingDetails", product_context.get("container", "")))).lower()
    indications = str(product_context.get("indications", product_context.get("therapeuticIndications", ""))).lower()
    classical_basis = str(product_context.get("followsClassicalText", product_context.get("classical_text_basis", product_context.get("classicalTextName", "")))).lower()
    jur_val = str(jurisdiction or product_context.get("jurisdiction", product_context.get("targetMarket", "India"))).strip()
    uncertainty = str(product_context.get("uncertaintyStatus", product_context.get("uncertainty_status", product_context.get("uncertainty", "")))).lower()
    confidence = str(product_context.get("confidence", "High")).capitalize()

    is_international = jur_val.lower() == "international"
    all_context = f"{name} {category} {ingredients} {intended_use} {dosage_form} {claims} {description} {packaging} {indications}".lower()

    # Classification indicators
    is_classical = (
        "classical" in category.lower() or 
        "traditional" in dosage_form or 
        classical_basis in ["yes", "yes_fully", "classical"] or 
        any(t in name.lower() for t in ["churna", "taila", "avaleha", "asava", "arishta", "vati", "bhasma", "samhita", "kwatha", "ghrita", "guggulu"])
    )
    is_phytopharm = (
        "phytopharmaceutical" in category.lower() or 
        "standardized" in category.lower() or 
        "extract" in dosage_form or 
        "fraction" in dosage_form or 
        "phytopharm" in all_context or
        "purified biomarker" in all_context or
        "isolated fraction" in all_context
    )
    is_aahar = "aahar" in category.lower() or "dietary" in category.lower() or "food" in category.lower() or "supplement" in category.lower() or "tea" in dosage_form
    is_cosmetic = "cosmetic" in category.lower() or "cosmetic" in intended_use or "cream" in dosage_form or "lotion" in dosage_form or "skin" in intended_use or "hair" in intended_use or "face" in intended_use
    is_proprietary = "proprietary" in category.lower() or "proprietary" in dosage_form or "patent" in category.lower()

    # Genuine uncertainty / missing info flag
    is_uncertain = "uncertain" in uncertainty or confidence == "Low" or "flagged" in uncertainty or "ambiguous" in uncertainty

    # -------------------------------------------------------------------------
    # PRODUCT-SPECIFIC FACTUAL EVIDENCE CHECKS
    # -------------------------------------------------------------------------
    # Trademark: Evidence that a distinctive commercial brand/name/mark is involved
    generic_pharmacopoeial_terms = [
        "churna", "taila", "ghrita", "bhasma", "asava", "arishta", "vati", "kwatha", 
        "avaleha", "guggulu", "lehyam", "kashayam", "ayurvedic formulation", 
        "classical formulation", "herbal formulation", "herbal extract", "herbal tea",
        "plant extract", "unspecified", "generic formulation", "tablet", "powder", "syrup",
        "formulation", "ayurvedic medicine", "classical ayurvedic preparation"
    ]
    name_clean = name.strip().lower()
    is_purely_generic_name = (
        not name_clean or
        name_clean in generic_pharmacopoeial_terms or
        any(name_clean == f"classical {term}" or name_clean == f"pure {term}" or name_clean == f"{term} formulation" for term in generic_pharmacopoeial_terms)
    )
    has_brand_mark_involved = not is_purely_generic_name and len(name_clean) >= 2

    # Geographical Indication (GI): Evidence of geographical-origin / terroir connection
    gi_origin_keywords = [
        "kashmiri", "kerala", "navara", "nilambur", "mysore", "darjeeling", 
        "malabar", "nagpur", "guntur", "assam", "kangra", "bikaneri", "madurai", 
        "coorg", "terroir", "geographical indication", "gi tag", "appellation of origin", 
        "protected geographical origin", "origin-certified"
    ]
    has_gi_evidence = any(kw in all_context for kw in gi_origin_keywords)

    # Copyright: Evidence of an original creative work (not merely factual ingredients/formulation)
    copyright_keywords = [
        "original artistic", "artistic work", "creative packaging design", "bespoke artwork",
        "original packaging illustration", "proprietary clinical monograph", "original literary work",
        "creative literature", "proprietary training manual", "original brochure artwork",
        "copyrighted label artwork", "original graphic design", "bespoke visual illustration",
        "creative illustration"
    ]
    has_copyright_evidence = any(kw in all_context for kw in copyright_keywords)

    # Industrial Design: Evidence of a protectable visual/aesthetic design
    design_keywords = [
        "novel shape", "ornamental shape", "aesthetic design", "bespoke bottle", 
        "unique container shape", "novel applicator shape", "custom dispenser shape", 
        "ergonomic container configuration", "novel packaging geometry", "3d packaging shape", 
        "custom blister shape", "distinctive bottle geometry", "ornamental bottle", "bottle shape",
        "aesthetic packaging design", "industrial design registration", "ornamental packaging", "container design"
    ]
    has_design_evidence = any(kw in all_context for kw in design_keywords)

    # Plant Variety Protection (PVP / PPV&FR / UPOV): Evidence involving a protected/new plant variety
    pvp_keywords = [
        "new plant variety", "novel cultivar", "plant breeder", "breeder right", 
        "dus criteria", "distinct uniform stable", "propagating material", 
        "new botanical variety", "bred cultivar", "registered plant variety", 
        "candidate plant variety", "newly bred variety"
    ]
    has_pvp_evidence = any(kw in all_context for kw in pvp_keywords)

    # Traditional Knowledge / Prior Art: Evidence of traditional knowledge or relevant prior art
    tk_indicators = [
        "ayurved", "sallaki", "boswellia", "nirgundi", "vitex", "gandhapura", "gaultheria",
        "ashwagandha", "withania", "tulsi", "ocimum", "neem", "azadirachta", "curcuma",
        "haridra", "turmeric", "triphala", "amla", "emblica", "haritaki", "terminalia",
        "bibhitaki", "guggulu", "commiphora", "shatavari", "asparagus", "brahmi", "bacopa",
        "mandukaparni", "centella", "chyawanprash", "samhita", "charaka", "sushruta",
        "ashtanga", "tkdl", "traditional knowledge", "classical text", "first schedule",
        "herbal", "botanical", "plant extract", "medicinal plant", "sandhivata", "amavata",
        "traditional medicine", "ethnobotanical"
    ]
    has_tk_evidence = is_classical or any(kw in all_context for kw in tk_indicators) or (len(ingredients) > 5 and not any(chem in all_context for chem in ["synthetic active pharmaceutical", "purely chemical"]))

    # Patent: Evidence of novelty / inventive technical subject matter
    novelty_keywords = [
        "novel extraction process", "purified biomarker", "standardized phytopharmaceutical extract",
        "isolated bioactive fraction", "novel fractionation", "synergistic efficacy proven", 
        "combination index < 1", "combination index less than", "experimental synergism", 
        "statistically significant synergy", "liposomal carrier", "nanoparticle", "nano-emulsion", 
        "targeted delivery system", "micellar carrier", "transdermal carrier technology", 
        "novel drug delivery", "modified release formulation", "novel delivery vehicle",
        "patentable carrier"
    ]
    has_patent_evidence = is_phytopharm or any(kw in all_context for kw in novelty_keywords)

    results = {}

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
        combined_ctx = f"{name} {ingredients} {intended_use} {resource_origin}".lower()
        has_indian_resource = any(kw in resource_origin.lower() for kw in ["india", "indian", "domestic", "bharat"]) or any(
            kw in combined_ctx for kw in [
                "sourced from india", "indigenous to india", "indian biological resource",
                "contracted domestic farms", "indian farms", "harvested in india", "procured from india", "domestic farm"
            ]
        )

        # 1. PATENT (International)
        # Note: The PCT is an international patent filing system, NOT a universal patent grant/approval.
        if is_uncertain:
            p_status = IP_STATUS_NEEDS_HUMAN_REVIEW
            if lang == "hi":
                p_reason = f"उत्पाद '{name}' का वर्गीकरण अनिश्चित है। पेटेंट सहयोग संधि (PCT) अंतरराष्ट्रीय फाइलिंग प्रणाली के तहत नवीन तकनीकी विशेषताओं के विशेषज्ञ सत्यापन के बिना पेटेंट पात्रता का अंतिम मूल्यांकन नहीं किया जा सकता।"
            elif lang == "mr":
                p_reason = f"'{name}' या उत्पादनाचे वर्गीकरण अनिश्चित आहे. PCT आंतरराष्ट्रीय फाइलिंग प्रणाली अंतर्गत तांत्रिक वैशिष्ट्यांच्या तज्ज्ञ पडताळणीशिवाय पेटंट पात्रता निश्चित करता येत नाही."
            else:
                p_reason = f"Classification for '{name}' is ambiguous or flagged with uncertainty. International patentability under the PCT filing system cannot be conclusively assessed without expert verification of novel technical characteristics."
            p_provisions = ["Patent Cooperation Treaty (PCT) — International Patent Filing System (Rule 33 Prior Art Verification)", "WIPO Traditional Knowledge Database Guidelines"]

        elif has_patent_evidence:
            p_status = IP_STATUS_RELEVANT if is_phytopharm else IP_STATUS_POTENTIALLY_RELEVANT
            if lang == "hi":
                p_reason = f"उत्पाद '{name}' में नवीन तकनीकी अथवा मानकीकृत निष्कर्षण विशेषताएं संकेतित हैं। पेटेंट सहयोग संधि (PCT) फाइलिंग प्रणाली (Form PCT/RO/101) के माध्यम से अंतर्राष्ट्रीय आवेदन किया जा सकता है (अंतिम पेटेंट अनुदान राष्ट्रीय चरण में निर्धारित होता है)" + (" तथा भारतीय संसाधनों हेतु NBA फॉर्म III अनिवार्य है।" if has_indian_resource else "।")
            elif lang == "mr":
                p_reason = f"'{name}' मध्ये नाविन्यपूर्ण तांत्रिक किंवा प्रमाणित अर्क वैशिष्ट्ये दर्शविली आहेत. PCT फाइलिंग प्रणालीद्वारे आंतरराष्ट्रीय पेटंट अर्ज केला जाऊ शकतो (अंतिम मंजुरी राष्ट्रीय टप्प्यात ठरते)" + (" व भारतीय घटकांसाठी NBA फॉर्म III अनिवार्य आहे." if has_indian_resource else ".")
            else:
                p_reason = f"Potentially relevant for '{name}'. Product facts indicate technical novelty, standardized biomarker fraction, or inventive delivery carrier. Applications can be filed internationally via the Patent Cooperation Treaty (PCT) filing system, while final patent grant is decided in national phase examinations by designated patent offices" + ("; NBA Section 6 Form III clearance is required prior to patent grant since biological resources are sourced from India." if has_indian_resource else "; provider-country ABS terms apply where applicable.")
            p_provisions = [
                "Patent Cooperation Treaty (PCT) — International Patent Filing System (Form PCT/RO/101)",
                "Paris Convention for the Protection of Industrial Property (Priority Rights)"
            ]
            if has_indian_resource:
                p_provisions.append("Biological Diversity Act, 2002 — Section 6 (Form III Prior Approval for Foreign Patents based on Indian Resources)")

        elif is_classical:
            p_status = IP_STATUS_NOT_INDICATED
            if lang == "hi":
                p_reason = f"शास्त्रीय योग '{name}' पर अंतर्राष्ट्रीय क्षेत्राधिकार में उत्पाद पेटेंट संकेतित नहीं है। टीकेडीएल (TKDL) में दर्ज सार्वजनिक ज्ञान पीसीटी अध्याय 21 के तहत अंतर्राष्ट्रीय खोज प्राधिकरणों के लिए पूर्व-कला (Prior Art) के रूप में सुलभ है, जिससे नवीनता समाप्त हो जाती है।"
            elif lang == "mr":
                p_reason = f"शास्त्रीय योग '{name}' साठी आंतरराष्ट्रीय स्तरावर पेटंट सूचित नाही. TKDL मधील पारंपारिक ज्ञान हे PCT प्रकरण २१ अंतर्गत पूर्व-कला पुरावा म्हणून तपासले जाते, ज्यामुळे राष्ट्रीय टप्प्यात नाविन्यता फेटाळली जाते."
            else:
                p_reason = f"Product patent is not indicated for classical formulation '{name}' in international jurisdictions. Traditional knowledge documented in public domain databases (TKDL) serves as prior art accessible to International Searching Authorities under PCT Chapter 21, defeating novelty and inventive step during national phase examinations."
            p_provisions = [
                "Patent Cooperation Treaty (PCT) — Chapter 21 (TKDL Prior Art Search Guidelines)",
                "WIPO Traditional Knowledge & Prior Art Framework"
            ]

        else:
            # Proprietary / general herbal product without documented novelty or inventive technical subject matter
            p_status = IP_STATUS_NOT_INDICATED
            if lang == "hi":
                p_reason = f"उत्पाद '{name}' हेतु पुनर्प्राप्त स्रोतों में कोई प्रासंगिक पेटेंट प्रावधान नहीं मिला। उत्पाद तथ्यों में नवीन तकनीकी विषय अथवा अप्रत्याशित चिकित्सीय सिनर्जी का प्रायोगिक साक्ष्य नहीं है। ज्ञात हर्बल घटकों के संयोजन पीसीटी अनुच्छेद 33 के तहत पूर्व-कला (TKDL) के समक्ष आविष्कारशील कदम (inventive step) स्थापित नहीं करते।"
            elif lang == "mr":
                p_reason = f"'{name}' साठी पुनर्प्राप्त स्त्रोतांमध्ये संबंधित पेटंट तरतूद आढळली नाही. उत्पादनाच्या माहितीमध्ये नाविन्यपूर्ण तंत्रज्ञान किंवा उपचारात्मक सिनर्जीचा प्रायोगिक पुरावा नाही. ज्ञात घटकांचे मिश्रण PCT कलम 33 अंतर्गत TKDL पूर्व-कलेसमोर नाविन्यता सिद्ध करू शकत नाही."
            else:
                p_reason = f"No relevant provision identified in retrieved sources for '{name}'. Product facts lack evidence of novelty or inventive technical subject matter. Under PCT Article 33 and international patent examination standards, combinations of known traditional herbs lack inventive step against TKDL prior art without experimental proof of non-obvious synergistic efficacy or novel delivery technology."
            p_provisions = [
                "Patent Cooperation Treaty (PCT) — Article 33 (Novelty and Inventive Step Standards)",
                "WIPO Traditional Knowledge Search Guidelines & TKDL Prior Art Citations"
            ]
        results[CATEGORY_PATENT] = {"status": p_status, "reason": p_reason, "provisions": p_provisions}

        # 2. TRADEMARK (International)
        if has_brand_mark_involved:
            tm_status = IP_STATUS_RELEVANT
            if lang == "hi":
                tm_reason = f"उत्पाद '{name}' में व्यावसायिक ब्रांड नाम शामिल है। नाइस वर्गीकरण वर्ग 5 (फार्मास्युटिकल/सप्लीमेंट्स) अथवा वर्ग 3 (कॉस्मेटिक्स) के तहत WIPO मैड्रिड प्रणाली द्वारा अंतर्राष्ट्रीय ट्रेडमार्क पंजीकरण प्रासंगिक है।"
            elif lang == "mr":
                tm_reason = f"'{name}' मध्ये व्यावसायिक ब्रँड नाव समाविष्ट आहे. नाइस वर्गवारी वर्ग ५ (फार्मास्युटिकल/सप्लिमेंट्स) किंवा वर्ग ३ (सौंदर्य प्रसाधने) अंतर्गत WIPO माद्रिद प्रणालीद्वारे आंतरराष्ट्रीय ब्रँड संरक्षण सुसंगत आहे."
            else:
                tm_reason = f"Potentially relevant for '{name}'. Product facts involve a commercial brand name/mark. International brand protection across export markets should be secured via the WIPO Madrid System under Nice Classification Class 5 (herbal pharmaceuticals/supplements) or Class 3 (cosmetics)."
            tm_provisions = [
                "WIPO Madrid System for the International Registration of Marks",
                "Nice Classification (Class 5 Pharmaceuticals / Supplements, Class 3 Cosmetics)",
                "Paris Convention for the Protection of Industrial Property (Priority Rights)"
            ]
        elif is_uncertain:
            tm_status = IP_STATUS_NEEDS_HUMAN_REVIEW
            if lang == "hi":
                tm_reason = f"उत्पाद नाम '{name}' के विशिष्ट बनाम वर्णनात्मक होने की पुष्टि हेतु मानवीय समीक्षा अनुशंसित है।"
            elif lang == "mr":
                tm_reason = f"उत्पादनाचे नाव '{name}' विशिष्ट आहे की केवळ वर्णनात्मक याची पडताळणी करण्यासाठी मानवी पुनरावलोकन अनुशंसित आहे."
            else:
                tm_reason = f"Human review recommended for '{name}' to verify whether the brand name is sufficiently distinctive or descriptive under international trademark standards."
            tm_provisions = ["WIPO Madrid System — Absolute Grounds for Refusal Guidelines"]
        else:
            tm_status = IP_STATUS_NOT_INDICATED
            if lang == "hi":
                tm_reason = f"उत्पाद नाम '{name}' एक सामान्य वर्णनात्मक शब्द है। अंतर्राष्ट्रीय ट्रेडमार्क नियमों के तहत वर्णनात्मक या सामान्य योग नामों पर अनन्य ट्रेडमार्क अधिकार प्राप्त नहीं किया जा सकता।"
            elif lang == "mr":
                tm_reason = f"उत्पादनाचे नाव '{name}' हे सामान्य वर्णनात्मक नाव आहे. आंतरराष्ट्रीय ट्रेडमार्क नियमांनुसार केवळ वर्णनात्मक नावांवर ट्रेडमार्क नोंदणी करता येत नाही."
            else:
                tm_reason = f"No relevant provision identified in retrieved sources for '{name}'. The designation is a generic descriptive term. Purely descriptive or generic names cannot be registered as trademarks under international trademark principles."
            tm_provisions = ["Paris Convention Article 6quinquies (Exceptions to Trademark Protection: Descriptive Marks)"]
        results[CATEGORY_TRADEMARK] = {"status": tm_status, "reason": tm_reason, "provisions": tm_provisions}

        # 3. GEOGRAPHICAL INDICATION (GI) (International)
        if has_gi_evidence:
            gi_status = IP_STATUS_POTENTIALLY_RELEVANT
            if lang == "hi":
                gi_reason = f"उत्पाद '{name}' में भौगोलिक क्षेत्र से जुड़े विशेष वानस्पतिक घटक संकेतित हैं। WIPO लिस्बन प्रणाली (जिनेवा एक्ट) के माध्यम से अंतर्राष्ट्रीय जीआई सुरक्षा प्रासंगिक है।"
            elif lang == "mr":
                gi_reason = f"'{name}' मध्ये विशिष्ट भौगोलिक क्षेत्रातील घटकांचा संदर्भ आहे. WIPO लिस्बन प्रणालीद्वारे आंतरराष्ट्रीय स्तरावर GI संरक्षण सुसंगत ठरू शकते."
            else:
                gi_reason = f"Potentially relevant for '{name}'. The formulation ingredients include regional botanical cultivars that may correspond to registered Geographical Indications. International protection can be pursued via the WIPO Lisbon System (Geneva Act)."
            gi_provisions = [
                "WIPO Lisbon Agreement for the Protection of Appellations of Origin (Geneva Act)",
                "TRIPS Agreement — Articles 22-24 (International Geographical Indications Protection)"
            ]
        elif is_uncertain and any(kw in resource_origin.lower() for kw in ["region", "valley", "hills", "mountain"]):
            gi_status = IP_STATUS_NEEDS_HUMAN_REVIEW
            if lang == "hi":
                gi_reason = f"कच्चे माल के विशिष्ट भौगोलिक उद्गम का विवरण अस्पष्ट है। जीआई मूल्यांकन हेतु स्रोत की मानवीय समीक्षा आवश्यक है।"
            elif lang == "mr":
                gi_reason = f"कच्च्या मालाच्या भौगोलिक उगमाची माहिती अस्पष्ट आहे. GI मूल्यांकनासाठी मानवी पडताळणी आवश्यक आहे."
            else:
                gi_reason = f"Needs human review for '{name}'. Specific agro-climatic terroir and geographical origin of raw botanicals require factual verification."
            gi_provisions = ["WIPO Lisbon System — Terroir Origin Verification Standards"]
        else:
            gi_status = IP_STATUS_NOT_INDICATED
            if lang == "hi":
                gi_reason = f"उत्पाद '{name}' हेतु पुनर्प्राप्त स्रोतों में कोई प्रासंगिक जीआई प्रावधान नहीं मिला। उत्पाद तथ्यों में किसी विशिष्ट भौगोलिक उद्गम अथवा क्षेत्र-विशेष की ख्याति का कोई संबंध नहीं है।"
            elif lang == "mr":
                gi_reason = f"'{name}' साठी पुनर्प्राप्त स्त्रोतांमध्ये संबंधित GI तरतूद आढळली नाही. उत्पादनाच्या माहितीत कोणत्याही विशिष्ट भौगोलिक उगमाचा किंवा क्षेत्राचा संबंध नाही."
            else:
                gi_reason = f"No relevant provision identified in retrieved sources for '{name}'. Product facts establish no geographical-origin, regional cultivar, or terroir connection. General formulations without territorial links do not qualify for GI protection under the WIPO Lisbon System."
            gi_provisions = ["WIPO Lisbon Agreement on Appellations of Origin and Geographical Indications"]
        results[CATEGORY_GI] = {"status": gi_status, "reason": gi_reason, "provisions": gi_provisions}

        # 4. COPYRIGHT (International)
        if has_copyright_evidence:
            cr_status = IP_STATUS_POTENTIALLY_RELEVANT
            if lang == "hi":
                cr_reason = f"उत्पाद '{name}' के मूल रचनात्मक कलात्मक कार्य (पैकेजिंग आर्टवर्क, मूल साहित्यिक विवरणिका) बर्न कन्वेंशन (Berne Convention) के तहत अंतरराष्ट्रीय स्तर पर संरक्षित हैं।"
            elif lang == "mr":
                cr_reason = f"'{name}' चे मूळ कलात्मक पॅकेजिंग आर्टवर्क आणि मूळ मजकूर बर्न कन्व्हेन्शन (Berne Convention) अंतर्गत आंतरराष्ट्रीय स्तरावर संरक्षित आहे."
            else:
                cr_reason = f"Potentially relevant for '{name}'. Product facts document original creative artwork, bespoke packaging illustrations, or proprietary literary monographs protected under the Berne Convention for the Protection of Literary and Artistic Works."
            cr_provisions = [
                "Berne Convention for the Protection of Literary and Artistic Works (Article 2)",
                "Universal Copyright Convention (UCC)"
            ]
        elif is_uncertain and ("brochure" in all_context or "monograph" in all_context or "artwork" in all_context):
            cr_status = IP_STATUS_NEEDS_HUMAN_REVIEW
            if lang == "hi":
                cr_reason = f"प्रचार सामग्री अथवा विवरणिका में मूल रचनात्मक अभिव्यक्ति बनाम तथ्यात्मक सामग्री की पुष्टि हेतु मानवीय समीक्षा अनुशंसित है।"
            elif lang == "mr":
                cr_reason = f"माहितीपत्रकातील मूळ कलात्मक अभिव्यक्ती तपासण्यासाठी मानवी पुनरावलोकन अनुशंसित आहे."
            else:
                cr_reason = f"Human review recommended for '{name}' to verify whether submitted literature or artwork constitutes protectable original creative expression."
            cr_provisions = ["Berne Convention — Standards of Originality"]
        else:
            cr_status = IP_STATUS_NOT_INDICATED
            if lang == "hi":
                cr_reason = f"उत्पाद '{name}' हेतु पुनर्प्राप्त स्रोतों में कोई प्रासंगिक कॉपीराइट प्रावधान नहीं मिला। उत्पाद तथ्यों में केवल तथ्यात्मक घटक सूची व मानक उपचारात्मक उपयोग शामिल हैं, जो सार्वजनिक डोमेन में हैं और कॉपीराइट योग्य मूल रचनात्मक कार्य नहीं हैं।"
            elif lang == "mr":
                cr_reason = f"'{name}' साठी पुनर्प्राप्त स्त्रोतांमध्ये संबंधित कॉपीराइट तरतूद आढळली नाही. उत्पादनात केवळ घटकांची तथ्यात्मक यादी आणि मानक वापर आहे, जे कॉपीराइटसाठी पात्र मूळ सर्जनशील कार्य नाही."
            else:
                cr_reason = f"No relevant provision identified in retrieved sources for '{name}'. Product facts comprise factual ingredient listings and standard therapeutic uses. Factual formulations and public knowledge are outside copyright protection under the Berne Convention, which requires original creative work."
            cr_provisions = ["Berne Convention for the Protection of Literary and Artistic Works (Article 2 - Non-protection of purely factual information)"]
        results[CATEGORY_COPYRIGHT] = {"status": cr_status, "reason": cr_reason, "provisions": cr_provisions}

        # 5. INDUSTRIAL DESIGN (International)
        if has_design_evidence:
            des_status = IP_STATUS_POTENTIALLY_RELEVANT
            if lang == "hi":
                des_reason = f"उत्पाद '{name}' के विशिष्ट पैकेजिंग आकार, बोतल डिजाइन और कंटेनर की सौंदर्यपरक बनावट को WIPO हेग प्रणाली (Hague System) के माध्यम से अंतर्राष्ट्रीय स्तर पर पंजीकृत किया जा सकता है।"
            elif lang == "mr":
                des_reason = f"'{name}' च्या अनोख्या बाटली, डबा किंवा पॅकेजिंग आकाराचे WIPO हेग प्रणालीद्वारे (Hague System) आंतरराष्ट्रीय डिझाइन नोंदणी करून संरक्षण करता येते."
            else:
                des_reason = f"Potentially relevant for '{name}'. Product facts document a novel, non-functional commercial container shape, dispenser packaging, or bottle aesthetics protectable via the WIPO Hague System for International Registration of Industrial Designs."
            des_provisions = [
                "WIPO Hague Agreement Concerning the International Registration of Industrial Designs",
                "Locarno Classification for Industrial Designs (Class 9: Packages and Containers)"
            ]
        elif is_uncertain and ("container" in all_context or "bottle" in all_context or "dispenser" in all_context):
            des_status = IP_STATUS_NEEDS_HUMAN_REVIEW
            if lang == "hi":
                des_reason = f"पैकेजिंग की सौंदर्यपरक नवीनता बनाम कार्यात्मक उपयोगिता की पुष्टि हेतु मानवीय समीक्षा अनुशंसित है।"
            elif lang == "mr":
                des_reason = f"पॅकेजिंगच्या सौंदर्यात्मक नाविन्यतेची पडताळणी करण्यासाठी मानवी पुनरावलोकन अनुशंसित आहे."
            else:
                des_reason = f"Human review recommended for '{name}' to evaluate whether packaging features possess protectable aesthetic novelty or are purely functional."
            des_provisions = ["WIPO Hague Agreement — Novelty & Functionality Standards"]
        else:
            des_status = IP_STATUS_NOT_INDICATED
            if lang == "hi":
                des_reason = f"उत्पाद '{name}' हेतु पुनर्प्राप्त स्रोतों में कोई प्रासंगिक औद्योगिक डिज़ाइन प्रावधान नहीं मिला। उत्पाद तथ्यों में किसी विशिष्ट सौंदर्यपरक पैकेजिंग, कंटेनर ज्यामिति अथवा नवीन आकार का विवरण नहीं है।"
            elif lang == "mr":
                des_reason = f"'{name}' साठी पुनर्प्राप्त स्त्रोतांमध्ये संबंधित औद्योगिक डिझाइन तरतूद आढळली नाही. उत्पादनात कोणत्याही नाविन्यपूर्ण आकाराचा किंवा सौंदर्यपरक पॅकेजिंगचा उल्लेख नाही."
            else:
                des_reason = f"No relevant provision identified in retrieved sources for '{name}'. Product facts describe a functional formulation without evidence of a novel ornamental shape, bespoke container geometry, or aesthetic packaging design under the WIPO Hague System."
            des_provisions = ["WIPO Hague Agreement Concerning the International Registration of Industrial Designs"]
        results[CATEGORY_DESIGN] = {"status": des_status, "reason": des_reason, "provisions": des_provisions}

        # 6. PLANT VARIETY PROTECTION (International)
        if has_pvp_evidence:
            pv_status = IP_STATUS_POTENTIALLY_RELEVANT
            if lang == "hi":
                pv_reason = f"यदि उत्पाद '{name}' हेतु नई वानस्पतिक किस्म (DUS) विकसित की गई है, तो UPOV कन्वेंशन के तहत पादप प्रजनक अधिकार प्रासंगिक हो सकते हैं।"
            elif lang == "mr":
                pv_reason = f"जर '{name}' साठी नवीन वनस्पती वाण (DUS निकष) विकसित केले असेल, तर UPOV कन्व्हेन्शन अंतर्गत पैदासकार हक्क सुसंगत ठरू शकतात."
            else:
                pv_reason = f"Potentially relevant for '{name}'. Product facts describe a newly bred, distinct, uniform, and stable (DUS) botanical variety protectable under the International Union for the Protection of New Varieties of Plants (UPOV Convention)."
            pv_provisions = ["International Union for the Protection of New Varieties of Plants (UPOV Convention 1991)"]
        elif is_uncertain and ("breeder" in all_context or "cultivar" in all_context):
            pv_status = IP_STATUS_NEEDS_HUMAN_REVIEW
            if lang == "hi":
                pv_reason = f"पादप घटकों के प्रजनक स्रोत व किस्म की मानवीय समीक्षा अनुशंसित है।"
            elif lang == "mr":
                pv_reason = f"घटक संकलनाच्या पैदासकार स्त्रोताचे मानवी पुनरावलोकन आवश्यक आहे."
            else:
                pv_reason = f"Human review recommended for '{name}' to verify whether raw botanicals derive from proprietary registered cultivars."
            pv_provisions = ["UPOV Convention — Variety Verification Standards"]
        else:
            pv_status = IP_STATUS_NOT_INDICATED
            if lang == "hi":
                pv_reason = f"उत्पाद '{name}' एक निर्मित योग है। UPOV कन्वेंशन के तहत पादप प्रजनक अधिकार केवल जीवित नई पादप किस्मों और प्रवर्धन सामग्री पर लागू होते हैं, निर्मित योगों पर नहीं।"
            elif lang == "mr":
                pv_reason = f"'{name}' हे तयार उत्पादन आहे. UPOV कन्व्हेन्शन अंतर्गत वनस्पती पैदासकार हक्क केवळ जिवंत वनस्पती वाणांवर लागू होतात, तयार उत्पादनावर नाही."
            else:
                pv_reason = f"No relevant provision identified in retrieved sources for '{name}'. Plant variety protection under the UPOV Convention applies strictly to propagating material and newly bred live plant varieties, not to processed finished formulations."
            pv_provisions = ["International Union for the Protection of New Varieties of Plants (UPOV Convention 1991)"]
        results[CATEGORY_PLANT_VARIETY] = {"status": pv_status, "reason": pv_reason, "provisions": pv_provisions}

        # 7. TRADITIONAL KNOWLEDGE / PRIOR ART (International)
        if has_tk_evidence:
            tk_status = IP_STATUS_RELEVANT
            if lang == "hi":
                tk_reason = f"उत्पाद '{name}' में पारंपरिक हर्बल घटक शामिल हैं। अंतरराष्ट्रीय पेटेंट कार्यालयों (USPTO, EPO, WIPO) के पास भारत के टीकेडीएल (TKDL) का सीधा एक्सेस है, जो ज्ञात हर्बल योगों पर पूर्व-कला के रूप में अनिवार्य रूप से जांची जाती है।"
            elif lang == "mr":
                tk_reason = f"'{name}' मध्ये पारंपारिक औषधी वनस्पतींचा समावेश आहे. आंतरराष्ट्रीय पेटंट कार्यालयांकडे भारताच्या TKDL चा थेट ॲक्सेस आहे, ज्यामुळे ज्ञात घटकांवर पूर्व-कला तपासणी अत्यंत सुसंगत ठरते."
            else:
                tk_reason = f"Directly relevant for '{name}'. Product facts incorporate classical medicinal botanicals. International Searching Authorities (ISAs at USPTO, EPO, WIPO) systematically search India's Traditional Knowledge Digital Library (TKDL) under PCT Chapter 21/Rule 33.1 as primary prior art against patent claims on traditional herbs."
            tk_provisions = [
                "PCT Rule 33.1 & Chapter 21 (International Search Guidelines on Traditional Knowledge)",
                "WIPO Intergovernmental Committee on Genetic Resources and Traditional Knowledge (IGC)",
                "CSIR-TKDL International Access Agreements (with USPTO, EPO, JPO)"
            ]
            if has_indian_resource:
                tk_provisions.append("Biological Diversity Act, 2002 — Section 6 (Form III Clearance for IP grants on Indian biological resources)")
            else:
                tk_provisions.append("Nagoya Protocol on ABS — Internationally Recognized Certificate of Compliance (IRCC where applicable)")
        elif is_uncertain:
            tk_status = IP_STATUS_NEEDS_HUMAN_REVIEW
            if lang == "hi":
                tk_reason = f"घटकों के पारंपरिक ज्ञान संदर्भ की मानवीय समीक्षा अनुशंसित है।"
            elif lang == "mr":
                tk_reason = f"घटकांच्या पारंपारिक ज्ञान संदर्भाचे मानवी पुनरावलोकन अनुशंसित आहे."
            else:
                tk_reason = f"Human review recommended for '{name}' to verify whether formulation ingredients correspond to documented traditional medicine prior art."
            tk_provisions = ["PCT Rule 33.1 — Prior Art Verification Guidelines"]
        else:
            tk_status = IP_STATUS_NOT_INDICATED
            if lang == "hi":
                tk_reason = f"उत्पाद '{name}' हेतु पुनर्प्राप्त स्रोतों में कोई पारंपरिक ज्ञान पूर्व-कला प्रावधान नहीं मिला। उत्पाद में कोई पारंपरिक वानस्पतिक घटक या जैव-संसाधन संकेतित नहीं हैं।"
            elif lang == "mr":
                tk_reason = f"'{name}' साठी पुनर्प्राप्त स्त्रोतांमध्ये पारंपारिक ज्ञान पूर्व-कला तरतूद आढळली नाही. उत्पादनात पारंपारिक वनस्पती घटक नाहीत."
            else:
                tk_reason = f"No relevant provision identified in retrieved sources for '{name}'. Product facts do not indicate any classical traditional medicine, traditional knowledge texts, or biological resources."
            tk_provisions = ["PCT Rule 33.1 (Prior Art Search Standards)"]
        results[CATEGORY_TK_PRIOR_ART] = {"status": tk_status, "reason": tk_reason, "provisions": tk_provisions}

        return results

    # =========================================================================
    # INDIA DOMESTIC REGIME EVALUATION
    # =========================================================================

    # 1. PATENT (India - Domestic Regime)
    if is_uncertain:
        p_status = IP_STATUS_NEEDS_HUMAN_REVIEW
        if lang == "hi":
            p_reason = f"उत्पाद '{name}' का वर्गीकरण अनिश्चित है। पेटेंट योग्यता निर्धारित करने से पहले सामग्री व प्रक्रिया का मानवीय/कानूनी सत्यापन आवश्यक है।"
        elif lang == "mr":
            p_reason = f"'{name}' या उत्पादनाचे वर्गीकरण अनिश्चित आहे. पेटंट पात्रता ठरवण्यापूर्वी घटक व प्रक्रियेचे मानवी/कायदेशीर पुनरावलोकन आवश्यक आहे."
        else:
            p_reason = f"Classification for '{name}' is ambiguous or flagged with uncertainty. Statutory patentability under Section 3 cannot be conclusively assessed without expert verification of novel technical characteristics."
        p_provisions = ["Section 3(p), Patents Act 1970", "Section 3(e), Patents Act 1970"]

    elif is_classical:
        p_status = IP_STATUS_NOT_INDICATED
        if lang == "hi":
            p_reason = f"शास्त्रीय आयुर्वेदिक योग '{name}' पर उत्पाद पेटेंट वर्जित है क्योंकि यह प्रथम अनुसूची संहिताओं में वर्णित पारंपरिक ज्ञान (TK) है।"
        elif lang == "mr":
            p_reason = f"पारंपारिक आयुर्वेदिक योग '{name}' वर उत्पादन पेटंट नाकारले जाते, कारण हे पहिल्या अनुसूचीतील संहितेत नोंदवलेले पारंपारिक ज्ञान (TK) आहे."
        else:
            p_reason = f"Product patent is statutorily barred for classical formulation '{name}' under Section 3(p), as recipes documented in First Schedule Ayurvedic Samhitas form non-patentable public traditional knowledge."
        p_provisions = [
            "Section 3(p), The Patents Act, 1970 (Traditional Knowledge Non-Patentability Bar)",
            "Section 25(1)(k) & 64(1)(p), The Patents Act, 1970 (TK Opposition & Revocation)"
        ]

    elif has_patent_evidence:
        p_status = IP_STATUS_RELEVANT if is_phytopharm else IP_STATUS_POTENTIALLY_RELEVANT
        if lang == "hi":
            p_reason = f"उत्पाद '{name}' में मानकीकृत अर्क अथवा नवीन तकनीकी प्रक्रिया संकेतित है। धारा 3(d) एवं 3(e) के अनुपालन के अधीन प्रक्रिया अथवा रचना पेटेंट प्रासंगिक है।"
        elif lang == "mr":
            p_reason = f"'{name}' मध्ये प्रमाणित अर्क किंवा नाविन्यपूर्ण तंत्रज्ञान दर्शविले आहे. कलम 3(d) व 3(e) अंतर्गत पेटंट सुसंगत आहे."
        else:
            p_reason = f"Potentially relevant for '{name}'. Product facts demonstrate technical novelty, standardized biomarker fraction, or inventive formulation vehicle. Process or formulation patent can be pursued provided biological origin is disclosed under Section 10(4)(d)(ii) and Section 3(e) synergistic efficacy is proven."
        p_provisions = [
            "Section 3(d), The Patents Act, 1970 (Enhanced Therapeutic Efficacy Requirement)",
            "Section 3(e), The Patents Act, 1970 (Synergistic Activity Mandate)",
            "Section 10(4)(d)(ii), The Patents Act, 1970 (Mandatory Biological Origin Disclosure)",
            "Section 6, Biological Diversity Act, 2002 (Prior NBA Approval before Patent Grant)"
        ]

    elif is_aahar:
        p_status = IP_STATUS_NOT_INDICATED
        if lang == "hi":
            p_reason = f"आयुर्वेद आहार उत्पाद '{name}' केवल पोषण व स्वास्थ्य संवर्धन हेतु है, उपचारात्मक दावे न होने के कारण पेटेंट योग्य नहीं है।"
        elif lang == "mr":
            p_reason = f"आयुर्वेद आहार उत्पादन '{name}' केवळ पोषण व आरोग्यासाठी आहे, उपचारात्मक दावे नसल्याने पेटंट पात्र नाही."
        else:
            p_reason = f"Not indicated for Ayurveda Aahar product '{name}'. Food formulations derived from classical dietary texts are non-therapeutic and statutorily excluded from medicinal patents under Section 3(p)."
        p_provisions = [
            "Section 3(p), The Patents Act, 1970",
            "Regulation 3, Food Safety and Standards (Ayurveda Aahar) Regulations, 2022"
        ]

    else:
        # Proprietary or general herbal product without documented novelty or inventive technical subject matter
        p_status = IP_STATUS_NOT_INDICATED
        if lang == "hi":
            p_reason = f"उत्पाद '{name}' हेतु पुनर्प्राप्त स्रोतों में कोई प्रासंगिक पेटेंट प्रावधान नहीं मिला। उत्पाद तथ्यों में नवीन तकनीकी विषय अथवा अप्रत्याशित प्रभावकारिता (synergy) का प्रायोगिक साक्ष्य नहीं है। भारतीय पेटेंट अधिनियम की धारा 3(e) के तहत ज्ञात घटकों के सामान्य मिश्रण पेटेंट योग्य नहीं हैं, तथा धारा 3(p) पारंपरिक ज्ञान को बाहर करती है।"
        elif lang == "mr":
            p_reason = f"'{name}' साठी पुनर्प्राप्त स्त्रोतांमध्ये संबंधित पेटंट तरतूद आढळली नाही. उत्पादनात नाविन्यपूर्ण तंत्रज्ञान किंवा उपचारात्मक सिनर्जीचा प्रायोगिक पुरावा नाही. पेटंट कायदा कलम 3(e) अंतर्गत ज्ञात घटकांचे साधे मिश्रण पेटंटसाठी अपात्र आहे व कलम 3(p) पारंपारिक ज्ञानाला वगळते."
        else:
            p_reason = f"No relevant provision identified in retrieved sources for '{name}'. Product facts provide no evidence of technical novelty, inventive extraction, or experimental synergy. Under Section 3(e) of The Patents Act 1970, mere admixtures of known substances without proven synergistic efficacy are excluded from patentability, and Section 3(p) excludes traditional knowledge duplication."
        p_provisions = [
            "Section 3(e), The Patents Act, 1970 (Mere Admixture Non-Patentability Bar)",
            "Section 3(p), The Patents Act, 1970 (Traditional Knowledge Exclusion)"
        ]

    results[CATEGORY_PATENT] = {
        "status": p_status,
        "reason": p_reason,
        "provisions": p_provisions
    }

    # =========================================================================
    # 2. TRADEMARK (India)
    # =========================================================================
    if has_brand_mark_involved:
        tm_status = IP_STATUS_RELEVANT
        if lang == "hi":
            tm_reason = f"उत्पाद '{name}' में व्यावसायिक ब्रांड नाम शामिल है। ट्रेड मार्क्स एक्ट 1999 के तहत नाइस वर्गीकरण क्लास 5 (आयुर्वेदिक औषधियां) अथवा क्लास 3 (प्रसाधन सामग्री) में पंजीकरण व्यावसायिक एकाधिकार हेतु प्रासंगिक है।"
        elif lang == "mr":
            tm_reason = f"'{name}' मध्ये व्यावसायिक ब्रँड नाव समाविष्ट आहे. ट्रेड मार्क्स ॲक्ट १९९९ अंतर्गत क्लास ५ (औषधे) किंवा क्लास ३ (सौंदर्य प्रसाधने) मध्ये नोंदणी व्यावसायिक संरक्षणासाठी सुसंगत आहे."
        else:
            tm_reason = f"Potentially relevant for '{name}'. Product facts involve a distinctive commercial brand name. Trademark protection under Nice Classification Class 5 (medicines) or Class 3 (cosmetics) provides statutory exclusivity under Trade Marks Act 1999."
        tm_provisions = [
            "Section 9(1)(a) & 9(1)(b), Trade Marks Act, 1999",
            "Nice Classification Class 5 / Class 3",
            "Section 28 & 29, Trade Marks Act, 1999 (Exclusive Rights & Infringement Protection)"
        ]
    elif is_uncertain:
        tm_status = IP_STATUS_NEEDS_HUMAN_REVIEW
        if lang == "hi":
            tm_reason = f"उत्पाद नाम '{name}' के विशिष्ट बनाम वर्णनात्मक होने की पुष्टि हेतु मानवीय समीक्षा अनुशंसित है।"
        elif lang == "mr":
            tm_reason = f"उत्पादनाचे नाव '{name}' विशिष्ट आहे की केवळ वर्णनात्मक याची पडताळणी करण्यासाठी मानवी पुनरावलोकन अनुशंसित आहे."
        else:
            tm_reason = f"Human review recommended for '{name}' to evaluate whether the brand name is sufficiently distinctive under Section 9(1) of Trade Marks Act 1999."
        tm_provisions = ["Section 9(1)(b), Trade Marks Act, 1999"]
    else:
        tm_status = IP_STATUS_NOT_INDICATED
        if lang == "hi":
            tm_reason = f"उत्पाद '{name}' एक सामान्य वर्णनात्मक अथवा शास्त्रीय नाम है। धारा 9(1)(b) के तहत केवल वर्णनात्मक या शास्त्रीय आयुर्वेदिक संहिताओं के सामान्य नामों पर ट्रेडमार्क पंजीकरण वर्जित है।"
        elif lang == "mr":
            tm_reason = f"'{name}' हे सामान्य किंवा पारंपारिक नाव आहे. कलम 9(1)(b) अंतर्गत केवळ वर्णनात्मक किंवा पारंपारिक आयुर्वेदिक नावांवर ट्रेडमार्क नोंदणी नाकारली जाते."
        else:
            tm_reason = f"No relevant provision identified in retrieved sources for '{name}'. The designation is a generic descriptive or pharmacopoeial name. Section 9(1)(b) of the Trade Marks Act 1999 prohibits registration of marks consisting exclusively of indications designating kind, quality, or generic terms."
        tm_provisions = [
            "Section 9(1)(b), Trade Marks Act, 1999 (Absolute Grounds for Refusal: Descriptive Indications)"
        ]

    results[CATEGORY_TRADEMARK] = {
        "status": tm_status,
        "reason": tm_reason,
        "provisions": tm_provisions
    }

    # =========================================================================
    # 3. GEOGRAPHICAL INDICATION (GI) (India)
    # =========================================================================
    if has_gi_evidence:
        gi_status = IP_STATUS_POTENTIALLY_RELEVANT
        if lang == "hi":
            gi_reason = f"उत्पाद '{name}' में भौगोलिक क्षेत्र से जुड़े विशेष वानस्पतिक घटक संकेतित हैं। अधिकृत उपयोगकर्ता (Authorized User) के रूप में जीआई टैग प्रासंगिक हो सकता है।"
        elif lang == "mr":
            gi_reason = f"'{name}' मध्ये विशिष्ट भौगोलिक क्षेत्रातील घटकांचा संदर्भ आहे. अधिकृत वापरकर्ता म्हणून GI टॅग सुसंगत ठरू शकतो."
        else:
            gi_reason = f"Potentially relevant for '{name}'. The formulation ingredients include regional botanical cultivars that may correspond to registered Geographical Indications. Producers in the designated region can apply as Authorized Users under Section 17."
        gi_provisions = [
            "Section 2(e), Geographical Indications of Goods Act, 1999 (Definition of GI)",
            "Section 17, Geographical Indications of Goods Act, 1999 (Registration as Authorized User)"
        ]
    elif is_uncertain and any(kw in all_context for kw in ["region", "valley", "hills", "mountain", "terroir"]):
        gi_status = IP_STATUS_NEEDS_HUMAN_REVIEW
        if lang == "hi":
            gi_reason = f"कच्चे माल के विशिष्ट भौगोलिक उद्गम का विवरण अस्पष्ट है। जीआई मूल्यांकन हेतु स्रोत की मानवीय समीक्षा आवश्यक है।"
        elif lang == "mr":
            gi_reason = f"कच्च्या मालाच्या भौगोलिक उगमाची माहिती अस्पष्ट आहे. GI मूल्यांकनासाठी मानवी पडताळणी आवश्यक आहे."
        else:
            gi_reason = f"Needs human review for '{name}'. Specific agro-climatic terroir and geographical origin of raw botanicals require factual verification."
        gi_provisions = ["Section 2(e) & Section 9, Geographical Indications of Goods Act, 1999"]
    else:
        gi_status = IP_STATUS_NOT_INDICATED
        if lang == "hi":
            gi_reason = f"उत्पाद '{name}' हेतु पुनर्प्राप्त स्रोतों में कोई प्रासंगिक जीआई प्रावधान नहीं मिला। उत्पाद तथ्यों में किसी विशिष्ट भौगोलिक उद्गम अथवा क्षेत्र-विशेष की ख्याति का कोई दावा संकेतित नहीं है।"
        elif lang == "mr":
            gi_reason = f"'{name}' साठी पुनर्प्राप्त स्त्रोतांमध्ये संबंधित GI तरतूद आढळली नाही. उत्पादनात कोणत्याही विशिष्ट भौगोलिक उगमाचा संदर्भ नाही."
        else:
            gi_reason = f"No relevant provision identified in retrieved sources for '{name}'. Product facts establish no geographical-origin connection or regional cultivar. Under Section 9 of the Geographical Indications of Goods Act 1999, generic terms are prohibited from GI registration."
        gi_provisions = [
            "Section 9, Geographical Indications of Goods Act, 1999 (Prohibition of Registration of Generic Names)"
        ]

    results[CATEGORY_GI] = {
        "status": gi_status,
        "reason": gi_reason,
        "provisions": gi_provisions
    }

    # =========================================================================
    # 4. COPYRIGHT (India)
    # =========================================================================
    if has_copyright_evidence:
        cr_status = IP_STATUS_POTENTIALLY_RELEVANT
        if lang == "hi":
            cr_reason = f"उत्पाद '{name}' के मूल कलात्मक कार्य (पैकेजिंग लेबल, कलात्मक चित्र, तकनीकी निर्देशिका) पर कॉपीराइट संरक्षण लागू होता है।"
        elif lang == "mr":
            cr_reason = f"'{name}' च्या मूळ कलात्मक डिझाईन (Artistic Work), पॅकेजिंग लेबल व माहितीपत्रकावर कॉपीराइट संरक्षण लागू होते."
        else:
            cr_reason = f"Potentially relevant for '{name}'. Product facts document original artistic label layouts, bespoke packaging artwork, or proprietary clinical monographs protected as original artistic/literary works under Section 13(1)."
        cr_provisions = [
            "Section 13(1), The Copyright Act, 1957 (Works in which Copyright Subsists: Original Literary and Artistic Works)",
            "Section 52, The Copyright Act, 1957 (Fair Dealing and Public Domain Knowledge)"
        ]
    elif is_uncertain and ("brochure" in all_context or "monograph" in all_context or "artwork" in all_context):
        cr_status = IP_STATUS_NEEDS_HUMAN_REVIEW
        if lang == "hi":
            cr_reason = f"प्रचार सामग्री में मूल साहित्यिक/कलात्मक अभिव्यक्ति की पुष्टि हेतु मानवीय समीक्षा अनुशंसित है।"
        elif lang == "mr":
            cr_reason = f"साहित्यातील मूळ कलात्मक अभिव्यक्ती तपासण्यासाठी मानवी पुनरावलोकन अनुशंसित आहे."
        else:
            cr_reason = f"Human review recommended for '{name}' to verify whether product collateral constitutes protectable original artistic or literary expression."
        cr_provisions = ["Section 13(1), The Copyright Act, 1957"]
    else:
        cr_status = IP_STATUS_NOT_INDICATED
        if lang == "hi":
            cr_reason = f"उत्पाद '{name}' हेतु पुनर्प्राप्त स्रोतों में कोई प्रासंगिक कॉपीराइट प्रावधान नहीं मिला। उत्पाद तथ्यों में केवल तथ्यात्मक घटक सूची व उपचारात्मक उपयोग शामिल हैं। शास्त्रीय नुस्खे और तथ्यात्मक जानकारी कॉपीराइट अधिनियम की धारा 13(1) के तहत कॉपीराइट योग्य नहीं हैं।"
        elif lang == "mr":
            cr_reason = f"'{name}' साठी पुनर्प्राप्त स्त्रोतांमध्ये संबंधित कॉपीराइट तरतूद आढळली नाही. उत्पादनात केवळ घटकांची तथ्यात्मक माहिती आणि उपचारात्मक उपयोग आहे, जे कॉपीराइट कायद्याच्या कलम 13(1) अंतर्गत संरक्षित नाही."
        else:
            cr_reason = f"No relevant provision identified in retrieved sources for '{name}'. Product facts comprise factual ingredient listings and standard therapeutic uses. Factual formulations, classical recipes, and functional therapeutic descriptions are in the public domain and outside copyright protection under Section 13(1) and Section 52 of The Copyright Act 1957."
        cr_provisions = [
            "Section 13(1), The Copyright Act, 1957 (Original Literary and Artistic Works Requirement)",
            "Section 52, The Copyright Act, 1957 (Public Domain Knowledge Exemption)"
        ]

    results[CATEGORY_COPYRIGHT] = {
        "status": cr_status,
        "reason": cr_reason,
        "provisions": cr_provisions
    }

    # =========================================================================
    # 5. INDUSTRIAL DESIGN (India)
    # =========================================================================
    if has_design_evidence:
        des_status = IP_STATUS_POTENTIALLY_RELEVANT
        if lang == "hi":
            des_reason = f"उत्पाद '{name}' के विशिष्ट कंटेनर, बॉटल का आकार, डिस्पेंसर, या ब्लिस्टर पैक की नवीन ज्यामिति (Shape & Configuration) को डिज़ाइन एक्ट 2000 के तहत सुरक्षित किया जा सकता है।"
        elif lang == "mr":
            des_reason = f"'{name}' च्या विशिष्ट कंटेनर, बाटलीचा आकार किंवा पॅकेजिंगच्या नाविन्यपूर्ण आकारासाठी (Shape & Configuration) डिझाइन संरक्षण मिळू शकते."
        else:
            des_reason = f"Potentially relevant for '{name}'. Product facts describe a novel, non-functional ornamental shape, bespoke bottle geometry, customized applicator, or distinctive container configuration registrable under Section 2(d) of the Designs Act 2000."
        des_provisions = [
            "Section 2(d) & Section 4, The Designs Act, 2000 (Definition of Design: Novelty in Shape, Configuration, and Pattern)",
            "Locarno Classification for Industrial Designs (Class 9: Packages and Containers)"
        ]
    elif is_uncertain and ("container" in all_context or "bottle" in all_context or "applicator" in all_context):
        des_status = IP_STATUS_NEEDS_HUMAN_REVIEW
        if lang == "hi":
            des_reason = f"पैकेजिंग आकार की सौंदर्यपरक नवीनता बनाम कार्यात्मक उपयोगिता की पुष्टि हेतु मानवीय समीक्षा अनुशंसित है।"
        elif lang == "mr":
            des_reason = f"पॅकेजिंग आकाराच्या सौंदर्यात्मक नाविन्यतेची पडताळणी करण्यासाठी मानवी पुनरावलोकन अनुशंसित आहे."
        else:
            des_reason = f"Human review recommended for '{name}' to evaluate whether packaging features possess protectable aesthetic novelty versus functional utility under Section 2(d) of Designs Act 2000."
        des_provisions = ["Section 2(d), The Designs Act, 2000"]
    else:
        des_status = IP_STATUS_NOT_INDICATED
        if lang == "hi":
            des_reason = f"उत्पाद '{name}' हेतु पुनर्प्राप्त स्रोतों में कोई प्रासंगिक औद्योगिक डिज़ाइन प्रावधान नहीं मिला। उत्पाद तथ्यों में किसी नवीन सौंदर्यपरक पैकेजिंग, कंटेनर ज्यामिति अथवा नवीन आकार का विवरण नहीं है।"
        elif lang == "mr":
            des_reason = f"'{name}' साठी पुनर्प्राप्त स्त्रोतांमध्ये संबंधित औद्योगिक डिझाइन तरतूद आढळली नाही. उत्पादनात कोणत्याही नाविन्यपूर्ण आकाराचा किंवा सौंदर्यपरक पॅकेजिंगचा उल्लेख नाही."
        else:
            des_reason = f"No relevant provision identified in retrieved sources for '{name}'. Product facts describe a standard formulation without evidence of a novel ornamental shape, bespoke container geometry, or aesthetic packaging design under Section 2(d) of The Designs Act 2000."
        des_provisions = [
            "Section 2(d), The Designs Act, 2000 (Requirement of Novelty in Shape or Configuration)"
        ]

    results[CATEGORY_DESIGN] = {
        "status": des_status,
        "reason": des_reason,
        "provisions": des_provisions
    }

    # =========================================================================
    # 6. PLANT VARIETY PROTECTION (India - PPV&FR)
    # =========================================================================
    if has_pvp_evidence:
        pv_status = IP_STATUS_POTENTIALLY_RELEVANT
        if lang == "hi":
            pv_reason = f"यदि उत्पाद '{name}' हेतु किसी विशेष नई अथवा विशिष्ट औषधीय पादप किस्म (Distinct, Uniform, Stable) का विकास किया गया है, तो प्रजनक अधिकार (Breeder Rights) प्रासंगिक हैं।"
        elif lang == "mr":
            pv_reason = f"जर '{name}' साठी विशिष्ट नवीन किंवा सुधारित औषधी वनस्पती वाण (DUS निकष) विकसित केले असेल, तर पैदासकार हक्क (Breeder Rights) सुसंगत आहेत."
        else:
            pv_reason = f"Potentially relevant for '{name}'. Product facts describe a distinct, uniform, and stable (DUS) medicinal plant variety bred or developed by the entity, registrable under Section 15 of PPV&FR Act 2001."
        pv_provisions = [
            "Section 15, Protection of Plant Varieties and Farmers' Rights Act, 2001 (Criteria for Registration: NDUS)",
            "Section 26, PPV&FR Act, 2001 (Benefit Sharing with Local Farming Communities)"
        ]
    elif is_uncertain and ("breeder" in all_context or "cultivar" in all_context):
        pv_status = IP_STATUS_NEEDS_HUMAN_REVIEW
        if lang == "hi":
            pv_reason = f"पादप घटकों के प्रजनक स्रोत की मानवीय समीक्षा अनुशंसित है।"
        elif lang == "mr":
            pv_reason = f"घटक संकलनाच्या पैदासकार स्त्रोताचे मानवी पुनरावलोकन आवश्यक आहे."
        else:
            pv_reason = f"Needs human review for '{name}'. Raw material procurement documentation is required to confirm whether proprietary cultivated cultivars are involved."
        pv_provisions = ["Section 15 & 28, PPV&FR Act, 2001"]
    else:
        pv_status = IP_STATUS_NOT_INDICATED
        if lang == "hi":
            pv_reason = f"उत्पाद '{name}' एक निर्मित योग है। औषधीय पादप प्रजनक अधिकार केवल जीवित नई पादप किस्मों और प्रवर्धन सामग्री पर लागू होते हैं, तैयार निर्मित योगों पर नहीं।"
        elif lang == "mr":
            pv_reason = f"'{name}' हे तयार औषधी मिश्रण आहे. वनस्पती पैदासकार हक्क केवळ जिवंत वनस्पती वाणांवर लागू होतात, तयार मिश्रणावर नाही."
        else:
            pv_reason = f"No relevant provision identified in retrieved sources for '{name}'. Plant variety protection under PPV&FR Act 2001 applies strictly to propagating material and newly bred live plant varieties, not to processed herbal extracts, tablets, gels, or finished formulations."
        pv_provisions = [
            "Section 2(za) & Section 15, Protection of Plant Varieties and Farmers' Rights Act, 2001"
        ]

    results[CATEGORY_PLANT_VARIETY] = {
        "status": pv_status,
        "reason": pv_reason,
        "provisions": pv_provisions
    }

    # =========================================================================
    # 7. TRADITIONAL KNOWLEDGE / PRIOR ART (India)
    # =========================================================================
    if has_tk_evidence:
        tk_status = IP_STATUS_RELEVANT
        if lang == "hi":
            tk_reason = f"उत्पाद '{name}' भारतीय पारंपरिक ज्ञान एवं जैव संसाधनों से प्रत्यक्ष रूप से जुड़ा है। धारा 3(p) पारंपरिक ज्ञान बहिष्करण, TKDL पूर्व कला एवं जैव विविधता अधिनियम की धारा 6/7 के अनुपालन प्रावधान प्रासंगिक हैं।"
        elif lang == "mr":
            tk_reason = f"'{name}' हे उत्पादन भारतीय पारंपारिक ज्ञान व जैविक संसाधनांशी जोडलेले आहे. कलम 3(p) पारंपारिक ज्ञान अपात्रता, TKDL पूर्व कला शोध व जैवविविधता कायदा कलम 6/7 तरतुदी सुसंगत आहेत."
        else:
            tk_reason = f"Directly relevant for '{name}'. Product facts incorporate classical medicinal botanicals documented in Ayurvedic Samhitas and CSIR-TKDL. Section 3(p) of The Patents Act 1970 excludes traditional knowledge from patentability, and commercial utilization of Indian bio-resources is governed by Section 6 and Section 7 of the Biological Diversity Act 2002."
        tk_provisions = [
            "Section 3(p), The Patents Act, 1970 (Traditional Knowledge Exclusion)",
            "Section 6, Biological Diversity Act, 2002 (Mandatory NBA Approval for IP Applications)",
            "Section 7, Biological Diversity Act, 2002 (Intimation to SBB for Commercial Utilization)",
            "TKDL Access Protocol & CSIR Prior Art Defense Guidelines"
        ]
    elif is_uncertain:
        tk_status = IP_STATUS_NEEDS_HUMAN_REVIEW
        if lang == "hi":
            tk_reason = f"घटकों के पारंपरिक ज्ञान संदर्भ की मानवीय समीक्षा अनुशंसित है।"
        elif lang == "mr":
            tk_reason = f"घटकांच्या पारंपारिक ज्ञान संदर्भाचे मानवी पुनरावलोकन अनुशंसित आहे."
        else:
            tk_reason = f"Human review recommended for '{name}' to verify whether formulation ingredients correspond to traditional knowledge documented in TKDL."
        tk_provisions = ["Section 3(p), The Patents Act, 1970"]
    else:
        tk_status = IP_STATUS_NOT_INDICATED
        if lang == "hi":
            tk_reason = f"उत्पाद '{name}' हेतु पुनर्प्राप्त स्रोतों में कोई पारंपरिक ज्ञान प्रावधान नहीं मिला। उत्पाद में कोई पारंपरिक वानस्पतिक घटक या भारतीय जैव-संसाधन संकेतित नहीं हैं।"
        elif lang == "mr":
            tk_reason = f"'{name}' साठी पुनर्प्राप्त स्त्रोतांमध्ये पारंपारिक ज्ञान तरतूद आढळली नाही. उत्पादनात पारंपारिक वनस्पती घटक नाहीत."
        else:
            tk_reason = f"No relevant provision identified in retrieved sources for '{name}'. Product facts do not indicate any classical traditional medicine, traditional knowledge texts, or biological resources."
        tk_provisions = ["Section 3(p), The Patents Act, 1970"]

    results[CATEGORY_TK_PRIOR_ART] = {
        "status": tk_status,
        "reason": tk_reason,
        "provisions": tk_provisions
    }

    return results
