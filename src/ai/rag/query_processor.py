"""
IP-SAKTI Sahayak / JurifyLaw: Advanced Multilingual Query Processor
Handles language detection (English, Hindi, Marathi), legal entity extraction,
intent classification, synonym expansion, and botanical name mapping.
"""

import re
from typing import Dict, List, Set, Any

BOTANICAL_SYNONYMS: Dict[str, List[str]] = {
    "ashwagandha": ["withania somnifera", "indian ginseng", "winter cherry", "अश्वगंधा", "अश्वगंधाचे", "अश्वगंधेचे"],
    "turmeric": ["curcuma longa", "curcumin", "haridra", "हल्दी", "हळद", "हळदीचे"],
    "amla": ["phyllanthus emblica", "emblica officinalis", "indian gooseberry", "amalaki", "आंवला", "आवळा"],
    "tulsi": ["ocimum sanctum", "holy basil", "ocimum tenuiflorum", "तुलसी", "तुळस"],
    "brahmi": ["bacopa monnieri", "water hyssop", "ब्राह्मी"],
    "triphala": ["haritaki", "bibhitaki", "amalaki", "terminalia chebula", "terminalia bellerica", "त्रिफला", "त्रिफळा"],
    "guduchi": ["tinospora cordifolia", "giloy", "amrita", "गुडूची", "गिलोय", "गुळवेल"],
    "shilajit": ["mineral pitch", "asphaltum punjabianum", "शिलाजीत"],
    "guggulu": ["commiphora mukul", "commiphora wightii", "गुग्गुलु", "गुग्गुळ"],
    "neem": ["azadirachta indica", "नीम", "कडुनिंब"],
    "shatavari": ["asparagus racemosus", "शतावरी"],
    "chyawanprash": ["chyavanaprasha", "classical avaleha", "first schedule formulation", "च्यवनप्राश"]
}

# Marathi distinctive tokens & suffixes
MARATHI_INDICATORS = {
    "आहे", "नाही", "काय", "कसे", "करावे", "पेटंट", "औषध", "कायदा", "नोंदणी", "करावी",
    "मिळेल", "होते", "आहेत", "शक्य", "करणे", "कोणते", "नियम", "सांगा", "मिळू", "शकते",
    "याचे", "त्याचे", "केले", "जाऊ", "येईल"
}

# Hindi distinctive tokens
HINDI_INDICATORS = {
    "है", "नहीं", "क्या", "कैसे", "करना", "दवा", "प्रावधान", "होगा", "सकते", "होता",
    "सकता", "किया", "जाएगा", "प्राप्त", "अधिनियम", "बारे", "बताएं", "दीजिए", "चाहिए"
}

SECTION_PATTERNS = [
    r'section\s*3\s*\(\s*p\s*\)',
    r'धारा\s*3\s*\(\s*p\s*\)',
    r'कलम\s*3\s*\(\s*p\s*\)',
    r'section\s*3\s*\(\s*e\s*\)',
    r'धारा\s*3\s*\(\s*e\s*\)',
    r'कलम\s*3\s*\(\s*e\s*\)',
    r'section\s*3\s*\(\s*d\s*\)',
    r'section\s*3\s*\(\s*a\s*\)',
    r'section\s*3\s*\(\s*h\s*\)',
    r'section\s*6(?:\s*\(\s*1\s*\))?',
    r'section\s*7',
    r'section\s*10(?:\s*\(\s*4\s*\))?',
    r'section\s*40',
    r'form\s*(?:i{1,3}|1|2|3)',
    r'फॉर्म\s*(?:i{1,3}|1|2|3|3|३)',
    r'schedule\s*t',
    r'शेड्यूल\s*टी',
    r'rule\s*158\s*b',
    r'नियम\s*158\s*b',
    r'regulation\s*3',
    r'regulation\s*6'
]

AYUSH_LEGAL_KEYWORDS: Set[str] = {
    "patent", "patents", "ip", "intellectual property", "trademark", "trade mark", "copyright",
    "design", "designs", "industrial design", "geographical indication", "gi", "plant variety",
    "breeder", "farmers rights", "ppvfr", "ppv&fr",
    "ayush", "ayurved", "ayurveda", "ayurvedic", "unani", "siddha", "sowa", "rigpa", "homeopath",
    "herbal", "botanical", "drug", "drugs", "medicine", "medicinal", "formulation", "churna",
    "taila", "bhasma", "asava", "arishta", "vati", "extract", "fraction", "ingredient",
    "tkdl", "traditional knowledge", "prior art", "novelty", "synergy", "synergistic", "admixture",
    "license", "licensing", "gmp", "schedule t", "rule 158", "fssai", "aahar", "dietary",
    "supplement", "biodiversity", "nba", "sbb", "form 3", "form iii", "form 1", "form i", "abs",
    "benefit sharing", "export", "fda", "dshea", "thmpd", "ema", "cdsco", "clinical trial",
    "samhita", "charaka", "sushruta", "vagbhata", "section 3", "section 6", "section 7",
    "section 10", "धारा", "कलम", "पेटंट", "पेटेंट", "औषध", "दवा", "लाइसेंस", "परवाना", "नियम",
    "जैव", "विविधता", "संहिता", "च्यवनप्राश", "अश्वगंधा", "हल्दी", "तुळस", "तुलसी", "आहार",
    "व्यावसायिक", "उत्पादन", "बायोडायव्हर्सिटी", "प्राधिकरण", "न्यायालय", "कायदा", "अधिनियम",
    "भौगोलिक संकेत", "औद्योगिक डिझाइन", "औद्योगिक डिझाईन", "वनस्पती वाण"
}

class QueryProcessor:
    def __init__(self):
        pass

    def is_domain_relevant(self, query: str, detected_sections: List[str], detected_botanicals: List[str]) -> bool:
        """Determines if query is relevant to the Ayush statutory and legal corpus."""
        if detected_sections or detected_botanicals:
            return True
        query_lower = query.lower()
        return any(kw in query_lower for kw in AYUSH_LEGAL_KEYWORDS)

    def detect_language(self, query: str, explicit_language: str = "") -> str:
        """Detect language: 'en', 'hi', or 'mr'."""
        if explicit_language in ["hi", "hindi", "Hindi"]:
            return "hi"
        if explicit_language in ["mr", "marathi", "Marathi"]:
            return "mr"
        if explicit_language in ["en", "english", "English"]:
            # If explicit_language is en but text is entirely Devanagari, let text override
            has_devanagari = bool(re.search(r'[\u0900-\u097F]', query))
            if not has_devanagari:
                return "en"

        text_lower = query.lower()
        has_devanagari = bool(re.search(r'[\u0900-\u097F]', query))
        if not has_devanagari:
            return "en"

        # Check for Marathi indicators
        marathi_hits = sum(1 for token in MARATHI_INDICATORS if token in text_lower)
        hindi_hits = sum(1 for token in HINDI_INDICATORS if token in text_lower)

        if marathi_hits > hindi_hits:
            return "mr"
        elif hindi_hits > 0:
            return "hi"

        # Default to Marathi if explicit requested or if marathi tokens present
        if explicit_language == "mr":
            return "mr"
        return "hi"

    def process(self, query: str, context_jurisdiction: str = "India", explicit_language: str = "") -> Dict[str, Any]:
        """Pre-processes raw user query into an enriched, entity-tagged legal search request."""
        clean_text = query.strip()
        query_lower = clean_text.lower()

        # 1. Detect language
        language = self.detect_language(clean_text, explicit_language)

        # 2. Extract statutory references
        detected_sections = self._extract_statutory_sections(query_lower)

        # 3. Extract botanical and classical entities
        detected_botanicals = self._extract_botanicals(query_lower)

        # 4. Classify primary legal intent
        intent = self._classify_intent(query_lower, detected_sections)

        # 5. Generate expanded search tokens
        expanded_terms = self._expand_terms(query_lower, intent, detected_sections, detected_botanicals)

        # 6. Extract jurisdiction hints
        if context_jurisdiction and str(context_jurisdiction).strip():
            jurisdiction = "International" if str(context_jurisdiction).strip().lower() == "international" else "India"
        else:
            is_intl = any(
                w in query_lower for w in ["international", "export", "fda", "europe", "eu", "thmpd", "dshea", "विदेश", "परदेश"]
            )
            jurisdiction = "International" if is_intl else "India"

        # 7. Check domain relevance
        domain_relevant = self.is_domain_relevant(clean_text, detected_sections, detected_botanicals)

        return {
            "original_query": clean_text,
            "normalized_query": query_lower,
            "language": language,
            "is_domain_relevant": domain_relevant,
            "detected_sections": detected_sections,
            "detected_botanicals": detected_botanicals,
            "intent": intent,
            "jurisdiction": jurisdiction,
            "expanded_terms": expanded_terms,
            "anchor_keywords": list(set(detected_sections + detected_botanicals + expanded_terms[:6]))
        }

    def _extract_statutory_sections(self, text: str) -> List[str]:
        found = []
        for pattern in SECTION_PATTERNS:
            matches = re.findall(pattern, text)
            for m in matches:
                norm = re.sub(r'[\s\(\)]', '', m)
                found.append(norm)

        shorthands = {
            "3(p)": "section3(p)",
            "3p": "section3(p)",
            "३(पी)": "section3(p)",
            "3(e)": "section3(e)",
            "3e": "section3(e)",
            "३(ई)": "section3(e)",
            "3(d)": "section3(d)",
            "3d": "section3(d)",
            "3(a)": "section3(a)",
            "3a": "section3(a)",
            "3(h)": "section3(h)",
            "3h": "section3(h)",
            "form 3": "formiii",
            "form iii": "formiii",
            "फॉर्म ३": "formiii",
            "फॉर्म 3": "formiii",
            "form 1": "formi",
            "form i": "formi",
            "फॉर्म १": "formi",
            "schedule t": "schedulet",
            "शेड्यूल टी": "schedulet",
            "rule 158b": "rule158b",
            "नियम 158b": "rule158b",
            "tkdl": "tkdl",
            "ntac": "ntac",
            "nba": "nba",
            "एनबीए": "nba",
            "sbb": "sbb",
            "एसबीबी": "sbb",
            "fssai": "fssai",
            "एफएसएसएआई": "fssai"
        }
        for token, normalized in shorthands.items():
            if token in text:
                if normalized not in found:
                    found.append(normalized)

        return list(set(found))

    def _extract_botanicals(self, text: str) -> List[str]:
        found = []
        for common_name, aliases in BOTANICAL_SYNONYMS.items():
            if common_name in text:
                found.append(common_name)
            for alias in aliases:
                if alias.lower() in text:
                    found.append(common_name)
                    break
        return list(set(found))

    def _classify_intent(self, text: str, sections: List[str]) -> str:
        sec_str = " ".join(sections)
        if "3(p)" in sec_str or "3p" in sec_str or "tkdl" in sec_str or "पारंपरिक" in text or "पारंपारिक" in text:
            return "PATENTABILITY_TRADITIONAL_KNOWLEDGE_BAR"
        if "3(e)" in sec_str or "3e" in sec_str or "synergy" in text or "सिनर्जी" in text or "admixture" in text:
            return "PATENTABILITY_SYNERGY_ADMIXTURE"
        if "formi" in sec_str or "formiii" in sec_str or "section6" in sec_str or "section7" in sec_str or "nba" in sec_str or "sbb" in sec_str or "biodiversity" in text or "जैव विविधता" in text:
            return "ABS_BIODIVERSITY_COMPLIANCE"
        if "schedulet" in sec_str or "rule158b" in sec_str or "3(a)" in sec_str or "3(h)" in sec_str or "license" in text or "लायसन्स" in text or "परवाना" in text:
            return "DRUG_REGULATORY_LICENSING"
        if "regulation" in sec_str or "aahar" in text or "dietary" in text or "fssai" in text or "आहार" in text:
            return "AYURVEDA_AAHAR_FOOD_SUPPLEMENT"

        if any(w in text for w in ["patent", "पेटंट", "पेटेंट", "invent", "novelty", "prior art"]):
            if any(w in text for w in ["classical", "samhita", "charaka", "traditional", "ancient", "पारंपरिक", "ग्रंथ"]):
                return "PATENTABILITY_TRADITIONAL_KNOWLEDGE_BAR"
            return "PATENTABILITY_SYNERGY_ADMIXTURE"

        if any(w in text for w in ["export", "fda", "europe", "us", "international", "thmpd", "विदेश", "परदेश"]):
            return "EXPORT_INTERNATIONAL_REGIME"

        return "GENERAL_AYUSH_IP"

    def _expand_terms(self, text: str, intent: str, sections: List[str], botanicals: List[str]) -> List[str]:
        expansions = []
        if intent == "PATENTABILITY_TRADITIONAL_KNOWLEDGE_BAR":
            expansions.extend(["section 3(p)", "traditional knowledge", "tkdl", "prior art anticipation", "first schedule samhita", "non-patentable"])
        elif intent == "PATENTABILITY_SYNERGY_ADMIXTURE":
            expansions.extend(["section 3(e)", "mere admixture", "synergy", "isobologram", "potentiation", "combination index", "inventive step"])
        elif intent == "ABS_BIODIVERSITY_COMPLIANCE":
            expansions.extend(["biological diversity act", "form iii", "form i", "national biodiversity authority", "state biodiversity board", "section 6", "section 7", "abs levy"])
        elif intent == "DRUG_REGULATORY_LICENSING":
            expansions.extend(["drugs and cosmetics act", "section 3(a)", "section 3(h)", "schedule t", "gmp", "rule 158b", "state licensing authority"])
        elif intent == "AYURVEDA_AAHAR_FOOD_SUPPLEMENT":
            expansions.extend(["ayurveda aahar regulations 2022", "fssai", "regulation 6", "dietary use only", "statutory warning logo"])
        elif intent == "EXPORT_INTERNATIONAL_REGIME":
            expansions.extend(["us fda botanical drug guidance", "dshea 1994", "eu thmpd", "nagoya protocol"])

        for bot in botanicals:
            if bot in BOTANICAL_SYNONYMS:
                expansions.extend(BOTANICAL_SYNONYMS[bot])

        return list(dict.fromkeys(expansions))

# Singleton instance
query_processor = QueryProcessor()
