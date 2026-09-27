import { Language } from '../i18n/index.js';

/**
 * Statutory Section Dictionary for English, Hindi, and Marathi
 */
export const STATUTORY_SECTIONS_MAP: Record<string, { hi: string; mr: string; en: string }> = {
  'Section 3(p)': {
    en: 'Section 3(p) — Traditional Knowledge Non-Patentability Bar',
    hi: 'धारा 3(p) — पारंपरिक ज्ञान पेटेंट गैर-योग्यता प्रतिबंध (Patents Act 1970)',
    mr: 'कलम 3(p) — पारंपारिक ज्ञान पेटंट बंदी (Patents Act 1970)'
  },
  'Section 3(e)': {
    en: 'Section 3(e) — Synergistic Activity Mandate vs Mere Admixture',
    hi: 'धारा 3(e) — सहक्रियात्मक प्रभाव (Synergy) अधिदेश बनाम मात्र मिश्रण',
    mr: 'कलम 3(e) — सिनर्जिस्टिक प्रभाव (Synergy) आवश्यकता विरुद्ध केवळ मिश्रण'
  },
  'Section 3(d)': {
    en: 'Section 3(d) — Enhanced Therapeutic Efficacy Requirement',
    hi: 'धारा 3(d) — ज्ञात यौगिक का नया रूप / संवर्धित चिकित्सीय प्रभावकारिता',
    mr: 'कलम 3(d) — ज्ञात पदार्थाचे नवीन रूप / वाढीव उपचारात्मक परिणामकारकता'
  },
  'Section 10(4)(d)(ii)': {
    en: 'Section 10(4)(d)(ii) — Mandatory Biological Resource Origin Disclosure',
    hi: 'धारा 10(4)(d)(ii) — जैविक संसाधन के स्रोत एवं भौगोलिक उत्पत्ति का अनिवार्य प्रकटीकरण',
    mr: 'कलम 10(4)(d)(ii) — जैविक संसाधनाचा स्त्रोत व भौगोलिक उगम जाहीर करणे बंधनकारक'
  },
  'Section 25 & 64': {
    en: 'Section 25 & 64 — Traditional Knowledge Opposition & Revocation',
    hi: 'धारा 25 एवं 64 — पारंपरिक ज्ञान के आधार पर पेटेंट विरोध एवं रद्दीकरण',
    mr: 'कलम 25 व 64 — पारंपारिक ज्ञानाच्या आधारावर पेटंट विरोध व रद्द करणे'
  },
  'Section 3': {
    en: 'Section 3 — Foreign Entity NBA Prior Approval Mandate (Form I)',
    hi: 'धारा 3 — विदेशी संस्थाओं/व्यक्तियों हेतु NBA की पूर्व अनुमति (फॉर्म 1)',
    mr: 'कलम 3 — परदेशी व्यक्ती/कंपन्यांसाठी NBA ची पूर्वपरवानगी (फॉर्म 1)'
  },
  'Section 6': {
    en: 'Section 6 — Mandatory NBA Approval Prior to IP / Patent Grant (Form III)',
    hi: 'धारा 6 — पेटेंट/बौद्धिक संपदा अनुदान से पूर्व NBA फॉर्म III स्वीकृति',
    mr: 'कलम 6 — पेटंट/बौद्धिक संपदा मिळण्यापूर्वी NBA फॉर्म III मंजुरी'
  },
  'Section 7': {
    en: 'Section 7 — Prior Intimation to State Biodiversity Board (SBB)',
    hi: 'धारा 7 — व्यावसायिक उपयोग हेतु राज्य जैव विविधता बोर्ड (SBB) को पूर्व सूचना',
    mr: 'कलम 7 — व्यावसायिक वापरासाठी राज्य जैवविविधता मंडळाला (SBB) पूर्वसूचना'
  },
  'Section 40 & NTAC': {
    en: 'Section 40 & NTAC Notification — Normally Traded Commodities Exemption',
    hi: 'धारा 40 एवं NTAC अधिसूचना — सामान्य व्यापारिक कृषि उत्पादों हेतु छूट',
    mr: 'कलम 40 व NTAC अधिसूचना — सामान्य व्यापारी कृषी वस्तूंसाठी सूट'
  },
  'Section 3(a)': {
    en: 'Section 3(a) — Classical Ayurvedic Medicine (Samhita Codified)',
    hi: 'धारा 3(a) — शास्त्रीय आयुर्वेदिक औषधि (अधिकृत संहिताओं पर आधारित)',
    mr: 'कलम 3(a) — शास्त्रीय आयुर्वेदिक औषध (अधिकृत संहितेवर आधारित)'
  },
  'Section 3(h)': {
    en: 'Section 3(h) — Ayurvedic Proprietary Medicine (Patent / Proprietary)',
    hi: 'धारा 3(h) — आयुर्वेदिक प्रोप्रायटरी औषधि (पेटेंट या स्वामित्व औषधि)',
    mr: 'कलम 3(h) — आयुर्वेदिक प्रोप्रायटरी औषध (पेटंट किंवा मालकी औषध)'
  },
  'Rule 158B': {
    en: 'Rule 158B — Safety & Efficacy Evidence for Proprietary Medicines',
    hi: 'नियम 158B — प्रोप्रायटरी औषधियों हेतु सुरक्षा एवं प्रभावकारिता प्रायोगिक साक्ष्य',
    mr: 'नियम 158B — प्रोप्रायटरी औषधांसाठी सुरक्षितता व परिणामकारकता डेटा'
  },
  'Schedule T': {
    en: 'Schedule T — Good Manufacturing Practices (GMP)',
    hi: 'शेड्यूल T — उत्तम विनिर्माण आचरण (Good Manufacturing Practices - GMP)',
    mr: 'शेड्यूल T — उत्कृष्ट औषध उत्पादन पद्धती (Good Manufacturing Practices - GMP)'
  },
  'Regulation 3': {
    en: 'Regulation 3 — Ayurveda Aahar Dietary Definition & Boundaries',
    hi: 'विनियम 3 — आयुर्वेद आहार की परिभाषा एवं पोषण सीमाएं',
    mr: 'नियमन 3 — आयुर्वेद आहाराची व्याख्या व पोषण मर्यादा'
  },
  'Regulation 6': {
    en: 'Regulation 6 — Mandatory Ayurveda Aahar Official Logo & Warning',
    hi: 'विनियम 6 — अनिवार्य आयुर्वेद आहार लोगो एवं वैधानिक चेतावनी लेबल',
    mr: 'नियमन 6 — अनिवार्य आयुर्वेद आहार लोगो व वैधानिक इशारा लेबल'
  },
  'Section 9(1)(b)': {
    en: 'Section 9(1)(b) — Absolute Grounds for Refusal: Descriptive Indications',
    hi: 'धारा 9(1)(b) — वर्णनात्मक सामान्य शब्दों के एकाधिकार पर रोक (Trade Marks Act 1999)',
    mr: 'कलम 9(1)(b) — वर्णनात्मक सामान्य नावांवर एकाधिकार बंदी (Trade Marks Act 1999)'
  },
  'Section 13(1)': {
    en: 'Section 13(1) — Original Literary & Artistic Works Copyright',
    hi: 'धारा 13(1) — मूल साहित्यिक एवं कलात्मक कृतियों पर कॉपीराइट सुरक्षा (Copyright Act 1957)',
    mr: 'कलम 13(1) — मूळ साहित्यिक व कलात्मक कामांवर कॉपीराइट संरक्षण (Copyright Act 1957)'
  },
  'Section 2(d)': {
    en: 'Section 2(d) — Novelty in Shape & Configuration of Packaging',
    hi: 'धारा 2(d) — कंटेनर एवं पैकेजिंग के नवीन आकार व विन्यास का डिजाइन पंजीकरण (Designs Act 2000)',
    mr: 'कलम 2(d) — पॅकेजिंग व बाटलीच्या नाविन्यपूर्ण आकाराची डिझाइन नोंदणी (Designs Act 2000)'
  },
  'Section 15': {
    en: "Section 15 — Distinct, Uniform, Stable (DUS) Plant Variety Protection",
    hi: "धारा 15 — विशिष्ट, एकरूप, स्थिर (DUS) नई पादप किस्म हेतु प्रजनक अधिकार (PPV&FR Act 2001)",
    mr: "कलम 15 — विशिष्ट, एकसमान, स्थिर (DUS) नवीन वनस्पती वाणासाठी पैदासकार हक्क (PPV&FR Act 2001)"
  },
  'Schedule E(1)': {
    en: 'Schedule E(1) — List of Poisonous Substances in Ayurveda',
    hi: 'शेड्यूल E(1) — आयुर्वेद में विषैले पदार्थों की वैधानिक सूची एवं शोधन नियम',
    mr: 'शेड्यूल E(1) — आयुर्वेदातील विषारी पदार्थांची यादी व शोधन नियम'
  },
  'Rule 161': {
    en: 'Rule 161 — Mandatory Labeling & Statutory Warnings',
    hi: 'नियम 161 — अनिवार्य लेबलिंग, घटक प्रकटीकरण एवं वैधानिक चेतावनी',
    mr: 'नियम 161 — अनिवार्य लेबलिंग, घटक प्रकटीकरण व वैधानिक इशारा'
  },
  'First Schedule': {
    en: 'First Schedule — Authoritative Classical Texts of Ayurveda',
    hi: 'प्रथम अनुसूची — आयुर्वेद के आधिकारिक शास्त्रीय ग्रंथ (First Schedule Samhitas)',
    mr: 'पहिली अनुसूची — आयुर्वेदाचे अधिकृत शास्त्रीय ग्रंथ (First Schedule Samhitas)'
  },
  'Second Schedule': {
    en: 'Second Schedule — Standards to be Complied with by Imported Drugs and by Drugs Manufactured for Sale',
    hi: 'द्वितीय अनुसूची — औषधि विनिर्माण मानक एवं औषधकोश अनुपालन',
    mr: 'दुसरी अनुसूची — औषध उत्पादन मानके व औषधकोश अनुपालन'
  },
  'Section 6(1)': {
    en: 'Section 6(1) — Prior NBA Approval Mandatory for Intellectual Property Right Applications',
    hi: 'धारा 6(1) — पेटेंट एवं बौद्धिक संपदा हेतु अनिवार्य पूर्व NBA अनुमोदन (फॉर्म III)',
    mr: 'कलम ६(१) — पेटंट व बौद्धिक संपदा अर्जांसाठी अनिवार्य पूर्व NBA मंजुरी (फॉर्म III)'
  },
  'Section 2(1)(j)': {
    en: 'Section 2(1)(j) — Definition of Invention: Novelty and Inventive Step',
    hi: 'धारा 2(1)(j) — आविष्कार की परिभाषा: नवीनता एवं आविष्कारशील कदम',
    mr: 'कलम २(१)(j) — शोधाची व्याख्या: नाविन्यता आणि कल्पक पाऊल'
  },
  'Section 21': {
    en: 'Section 21 — Determination of Equitable Access and Benefit Sharing (ABS)',
    hi: 'धारा 21 — न्यायसंगत पहुंच एवं लाभ-साझाकरण (ABS) का निर्धारण',
    mr: 'कलम २१ — न्याय्य प्रवेश आणि लाभ वाटप (ABS) निर्धारण'
  }
};

/**
 * Concise Statutory Sections Map for badges and short section citations
 */
export const STATUTORY_SECTIONS_SHORT_MAP: Record<string, { hi: string; mr: string; en: string }> = {
  'Section 3(p)': { en: 'Section 3(p)', hi: 'धारा 3(p)', mr: 'कलम 3(p)' },
  'Section 3(e)': { en: 'Section 3(e)', hi: 'धारा 3(e)', mr: 'कलम 3(e)' },
  'Section 3(d)': { en: 'Section 3(d)', hi: 'धारा 3(d)', mr: 'कलम 3(d)' },
  'Section 3(a)': { en: 'Section 3(a)', hi: 'धारा 3(a)', mr: 'कलम 3(a)' },
  'Section 3(h)': { en: 'Section 3(h)', hi: 'धारा 3(h)', mr: 'कलम 3(h)' },
  'Section 6': { en: 'Section 6', hi: 'धारा 6', mr: 'कलम 6' },
  'Section 6(1)': { en: 'Section 6(1)', hi: 'धारा 6(1)', mr: 'कलम 6(1)' },
  'Section 7': { en: 'Section 7', hi: 'धारा 7', mr: 'कलम 7' },
  'Section 3': { en: 'Section 3', hi: 'धारा 3', mr: 'कलम 3' },
  'Section 4': { en: 'Section 4', hi: 'धारा 4', mr: 'कलम 4' },
  'Section 9': { en: 'Section 9', hi: 'धारा 9', mr: 'कलम 9' },
  'Section 21': { en: 'Section 21', hi: 'धारा 21', mr: 'कलम 21' },
  'Section 40': { en: 'Section 40', hi: 'धारा 40', mr: 'कलम 40' },
  'Section 40 & NTAC': { en: 'Section 40 & NTAC', hi: 'धारा 40 एवं NTAC', mr: 'कलम 40 व NTAC' },
  'Section 10(4)(d)(ii)': { en: 'Section 10(4)(d)(ii)', hi: 'धारा 10(4)(d)(ii)', mr: 'कलम 10(4)(d)(ii)' },
  'Section 25 & 64': { en: 'Section 25 & 64', hi: 'धारा 25 व 64', mr: 'कलम 25 व 64' },
  'Section 9(1)(b)': { en: 'Section 9(1)(b)', hi: 'धारा 9(1)(b)', mr: 'कलम 9(1)(b)' },
  'Section 11(1)': { en: 'Section 11(1)', hi: 'धारा 11(1)', mr: 'कलम 11(1)' },
  'Section 13(1)': { en: 'Section 13(1)', hi: 'धारा 13(1)', mr: 'कलम 13(1)' },
  'Section 2(1)(j)': { en: 'Section 2(1)(j)', hi: 'धारा 2(1)(j)', mr: 'कलम 2(1)(j)' },
  'Section 2(d)': { en: 'Section 2(d)', hi: 'धारा 2(d)', mr: 'कलम 2(d)' },
  'Section 2(e)': { en: 'Section 2(e)', hi: 'धारा 2(e)', mr: 'कलम 2(e)' },
  'Section 15': { en: 'Section 15', hi: 'धारा 15', mr: 'कलम 15' },
  'Section 52(1)(a)': { en: 'Section 52(1)(a)', hi: 'धारा 52(1)(a)', mr: 'कलम 52(1)(a)' },
  'Section 69 & 71': { en: 'Section 69 & 71', hi: 'धारा 69 एवं 71', mr: 'कलम 69 व 71' },
  'Rule 158B': { en: 'Rule 158B', hi: 'नियम 158B', mr: 'नियम 158B' },
  'Rule 161': { en: 'Rule 161', hi: 'नियम 161', mr: 'नियम 161' },
  'Rule 2(eb) & Rule 122E': { en: 'Rule 2(eb) & Rule 122E', hi: 'नियम 2(eb) एवं 122E', mr: 'नियम 2(eb) व 122E' },
  'First Schedule': { en: 'First Schedule', hi: 'प्रथम अनुसूची', mr: 'पहिली अनुसूची' },
  'Second Schedule': { en: 'Second Schedule', hi: 'द्वितीय अनुसूची', mr: 'दुसरी अनुसूची' },
  'Schedule T': { en: 'Schedule T (GMP)', hi: 'शेड्यूल T (GMP)', mr: 'शेड्यूल T (GMP)' },
  'Schedule T (Rule 157)': { en: 'Schedule T (Rule 157)', hi: 'शेड्यूल T (नियम 157 - GMP)', mr: 'शेड्यूल T (नियम 157 - GMP)' },
  'Schedule T Part II': { en: 'Schedule T Part II', hi: 'शेड्यूल T भाग II', mr: 'शेड्यूल T भाग २' },
  'Schedule Y (Appendix I-B)': { en: 'Schedule Y (Appendix I-B)', hi: 'शेड्यूल Y (परिशिष्ट I-B)', mr: 'शेड्यूल Y (परिशिष्ट I-B)' },
  'Schedule E(1)': { en: 'Schedule E(1)', hi: 'शेड्यूल E(1)', mr: 'शेड्यूल E(1)' },
  'Article 2 & 3': { en: 'Article 2 & 3', hi: 'अनुच्छेद 2 एवं 3', mr: 'अनुच्छेद २ व ३' },
  'Article 3': { en: 'Article 3', hi: 'अनुच्छेद 3', mr: 'अनुच्छेद ३' },
  'Article 5': { en: 'Article 5', hi: 'अनुच्छेद 5', mr: 'अनुच्छेद ५' },
  'Article 6': { en: 'Article 6', hi: 'अनुच्छेद 6', mr: 'अनुच्छेद ६' },
  'Article 8(j)': { en: 'Article 8(j)', hi: 'अनुच्छेद 8(j)', mr: 'अनुच्छेद ८(j)' },
  'Article 10': { en: 'Article 10', hi: 'अनुच्छेद 10', mr: 'अनुच्छेद १०' },
  'Article 12': { en: 'Article 12', hi: 'अनुच्छेद 12', mr: 'अनुच्छेद १२' },
  'Article 15': { en: 'Article 15', hi: 'अनुच्छेद 15', mr: 'अनुच्छेद १५' },
  'Article 15 & 16': { en: 'Article 15 & 16', hi: 'अनुच्छेद 15 एवं 16', mr: 'अनुच्छेद १५ व १६' },
  'Article 27.1': { en: 'Article 27.1', hi: 'अनुच्छेद 27.1', mr: 'अनुच्छेद २७.१' },
  'Article 27.3(b)': { en: 'Article 27.3(b)', hi: 'अनुच्छेद 27.3(b)', mr: 'अनुच्छेद २७.३(b)' },
  'Article 29': { en: 'Article 29', hi: 'अनुच्छेद 29', mr: 'अनुच्छेद २९' },
  'Geneva Act Article 5': { en: 'Geneva Act Article 5', hi: 'जिनेवा एक्ट अनुच्छेद 5', mr: 'जिनेव्हा ॲक्ट अनुच्छेद ५' },
  'PCT Rule 33.1': { en: 'PCT Rule 33.1', hi: 'पीसीटी नियम 33.1', mr: 'पीसीटी नियम ३३.१' },
  'PCT Chapter 21': { en: 'PCT Chapter 21', hi: 'पीसीटी अध्याय 21', mr: 'पीसीटी प्रकरण २१' },
  'Regulation 3': { en: 'Regulation 3', hi: 'विनियम 3', mr: 'नियमन ३' },
  'Regulation 3(1)': { en: 'Regulation 3(1)', hi: 'विनियम 3(1)', mr: 'नियमन ३(१)' },
  'Regulation 5': { en: 'Regulation 5', hi: 'विनियम 5', mr: 'नियमन ५' },
  'Regulation 6': { en: 'Regulation 6', hi: 'विनियम 6', mr: 'नियमन ६' },
  'Regulation 3 & Schedule IV': { en: 'Regulation 3 & Schedule IV', hi: 'विनियम 3 एवं अनुसूची IV', mr: 'नियमन ३ व अनुसूची IV' },
  'Regulation 2, 3 & 4 (ABS Regulations 2014)': { en: 'Regulation 2, 3 & 4 (ABS Regulations 2014)', hi: 'विनियम 2, 3 एवं 4 (ABS विनियम 2014)', mr: 'नियमन २, ३ व ४ (ABS नियमन २०१४)' },
  'Form III & Regulation 8': { en: 'Form III & Regulation 8', hi: 'फॉर्म III एवं विनियमन 8', mr: 'फॉर्म III व नियमन ८' },
  'Guiding Principle 1 & 2': { en: 'Guiding Principle 1 & 2', hi: 'मार्गदर्शक सिद्धांत 1 एवं 2', mr: 'मार्गदर्शक तत्त्वे १ व २' },
  'Guiding Principle 4 & 5': { en: 'Guiding Principle 4 & 5', hi: 'मार्गदर्शक सिद्धांत 4 एवं 5', mr: 'मार्गदर्शक तत्त्वे ४ व ५' },
  'Nice Classification Notice': { en: 'Nice Classification Notice', hi: 'नाइस वर्गीकरण अधिसूचना', mr: 'नाइस वर्गवारी अधिसूचना' },
  'TKDL Access Protocol': { en: 'TKDL Access Protocol', hi: 'टीकेडीएल एक्सेस प्रोटोकॉल', mr: 'TKDL ॲक्सेस प्रोटोकॉल' },
  'TKDL Framework 1': { en: 'TKDL Framework 1', hi: 'टीकेडीएल पूर्व कला ढांचा 1', mr: 'TKDL पूर्व कला चौकट १' },
  'US FDA DSHEA & Botanical Drug Guidance': { en: 'US FDA DSHEA & Botanical Drug Guidance', hi: 'यूएस एफडीए DSHEA एवं बोटैनिकल ड्रग गाइडेंस', mr: 'US FDA DSHEA व बोटॅनिकल ड्रग मार्गदर्शक तत्त्वे' },
  'FDA Botanical Guidance': { en: 'FDA Botanical Guidance', hi: 'यूएस एफडीए बोटैनिकल ड्रग गाइडेंस', mr: 'US FDA बोटॅनिकल मार्गदर्शक तत्त्वे' },
  'EU Directive 2004/24/EC': { en: 'EU Directive 2004/24/EC', hi: 'ईयू निर्देश 2004/24/EC (THMPD)', mr: 'EU निर्देश २००४/२४/EC (THMPD)' },
  'EU THMPD 2004/24/EC': { en: 'EU THMPD 2004/24/EC', hi: 'ईयू THMPD निर्देश 2004/24/EC', mr: 'EU THMPD निर्देश २००४/२४/EC' },
  'Nagoya Protocol on ABS': { en: 'Nagoya Protocol on ABS', hi: 'नागोया प्रोटोकॉल (ABS)', mr: 'नागोया प्रोटोकॉल (ABS)' }
};

/**
 * Acts and Regulatory Statutes Dictionary
 */
export const STATUTORY_ACTS_MAP: Record<string, { hi: string; mr: string; en: string }> = {
  'International Regulatory Frameworks for Herbal & Botanical Products': {
    en: 'International Regulatory Frameworks for Herbal & Botanical Products',
    hi: 'हर्बल एवं वानस्पतिक उत्पादों हेतु अंतर्राष्ट्रीय विनियामक व्यवस्था',
    mr: 'हर्बल व वनस्पती उत्पादनांसाठी आंतरराष्ट्रीय नियामक चौकट'
  },
  'International Herbal Regimes (US FDA / EU EMA)': {
    en: 'International Herbal Regimes (US FDA / EU EMA)',
    hi: 'अंतर्राष्ट्रीय हर्बल व्यवस्थाएं (यूएस एफडीए / ईयू ईएमए)',
    mr: 'आंतरराष्ट्रीय हर्बल चौकटी (यूएस एफडीए / ईयू ईएमए)'
  },
  'International Regulatory Frameworks for Herbal Products (US DSHEA / EU THMPD / Nagoya)': {
    en: 'International Regulatory Frameworks for Herbal Products (US DSHEA / EU THMPD / Nagoya)',
    hi: 'हर्बल उत्पादों हेतु अंतर्राष्ट्रीय विनियामक व्यवस्था (US DSHEA / EU THMPD / नागोया)',
    mr: 'हर्बल उत्पादनांसाठी आंतरराष्ट्रीय नियामक चौकट (US DSHEA / EU THMPD / नागोया)'
  },
  'The Patents Act, 1970 (India)': {
    en: 'The Patents Act, 1970',
    hi: 'पेटेंट अधिनियम, 1970 (भारत)',
    mr: 'पेटंट कायदा, १९७० (भारत)'
  },
  'Biological Diversity Act, 2002 & Amendment Act, 2023 (India)': {
    en: 'Biological Diversity Act, 2002 & Amendment Act, 2023',
    hi: 'जैविक विविधता अधिनियम, 2002 एवं संशोधन अधिनियम, 2023',
    mr: 'जैविक विविधता कायदा, २००२ आणि सुधारणा कायदा, २०२३'
  },
  'Patent Cooperation Treaty (PCT) & Traditional Medicine Search Guidelines': {
    en: 'Patent Cooperation Treaty (PCT) & Traditional Medicine Search Guidelines',
    hi: 'पेटेंट सहयोग संधि (PCT) एवं पारंपरिक चिकित्सा खोज दिशानिर्देश',
    mr: 'पेटंट सहकार्य करार (PCT) व पारंपारिक औषध शोध मार्गदर्शक तत्त्वे'
  },
  'Patent Cooperation Treaty (PCT)': {
    en: 'Patent Cooperation Treaty (PCT)',
    hi: 'पेटेंट सहयोग संधि (PCT)',
    mr: 'पेटंट सहकार्य करार (PCT)'
  },
  'WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge': {
    en: 'WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge',
    hi: 'डब्ल्यूआईपीओ (WIPO) आनुवंशिक संसाधन एवं पारंपरिक ज्ञान संधि',
    mr: 'विपो (WIPO) जनुकीय संसाधने व पारंपारिक ज्ञान करार'
  },
  'Nagoya Protocol on Access to Genetic Resources and the Fair and Equitable Sharing of Benefits Arising from their Utilization': {
    en: 'Nagoya Protocol on Access and Benefit Sharing (ABS)',
    hi: 'नागोया प्रोटोकॉल (Nagoya Protocol on ABS)',
    mr: 'नागोया प्रोटोकॉल (Nagoya Protocol - ABS)'
  },
  'Nagoya Protocol': {
    en: 'Nagoya Protocol on ABS',
    hi: 'नागोया प्रोटोकॉल (Nagoya Protocol on ABS)',
    mr: 'नागोया प्रोटोकॉल (Nagoya Protocol - ABS)'
  },
  'Convention on Biological Diversity': {
    en: 'Convention on Biological Diversity (CBD)',
    hi: 'जैव विविधता पर संयुक्त राष्ट्र अभिसमय (CBD)',
    mr: 'जैविक विविधतेवरील संयुक्त राष्ट्र परिषद (CBD)'
  },
  'WHO Guidelines for Methodologies on Research and Evaluation of Traditional Medicine': {
    en: 'WHO Guidelines for Traditional Medicine Evaluation',
    hi: 'विश्व स्वास्थ्य संगठन (WHO) पारंपरिक चिकित्सा अनुसंधान दिशानिर्देश',
    mr: 'जागतिक आरोग्य संघटना (WHO) पारंपारिक औषध संशोधन मार्गदर्शक तत्त्वे'
  },
  'The Patents Act, 1970 (as amended)': {
    en: 'The Patents Act, 1970 (as amended)',
    hi: 'पेटेंट अधिनियम, 1970 (यथा संशोधित)',
    mr: 'पेटंट कायदा, १९७० (सुधारित)'
  },
  'Patents Act 1970': {
    en: 'Patents Act 1970',
    hi: 'पेटेंट अधिनियम 1970',
    mr: 'पेटंट कायदा १९७०'
  },
  'The Patents Act 1970': {
    en: 'The Patents Act 1970',
    hi: 'पेटेंट अधिनियम 1970',
    mr: 'पेटंट कायदा १९७०'
  },
  'Biological Diversity Act, 2002 (as amended by 2023 Amendment Act)': {
    en: 'Biological Diversity Act, 2002 (as amended by 2023 Amendment Act)',
    hi: 'जैविक विविधता अधिनियम, 2002 (संशोधित 2023)',
    mr: 'जैविक विविधता कायदा, २००२ (सुधारित २०२३)'
  },
  'Biological Diversity Act 2002': {
    en: 'Biological Diversity Act 2002',
    hi: 'जैविक विविधता अधिनियम 2002',
    mr: 'जैविक विविधता कायदा २००२'
  },
  'Biological Diversity Act 2002/2023': {
    en: 'Biological Diversity Act 2002/2023',
    hi: 'जैविक विविधता अधिनियम 2002/2023',
    mr: 'जैविक विविधता कायदा २००२/२०२३'
  },
  'Drugs and Cosmetics Act, 1940 & Rules 1945': {
    en: 'Drugs and Cosmetics Act, 1940 & Rules 1945',
    hi: 'औषधि एवं प्रसाधन सामग्री अधिनियम, 1940 एवं नियमावली 1945',
    mr: 'औषध व सौंदर्यप्रसाधने कायदा, १९४० आणि नियम १९४५'
  },
  'Drugs & Cosmetics Act 1940': {
    en: 'Drugs & Cosmetics Act 1940',
    hi: 'औषधि एवं प्रसाधन सामग्री अधिनियम 1940',
    mr: 'औषध व सौंदर्यप्रसाधने कायदा १९४०'
  },
  'Drugs and Cosmetics Act, 1940': {
    en: 'Drugs and Cosmetics Act, 1940',
    hi: 'औषधि एवं प्रसाधन सामग्री अधिनियम, 1940',
    mr: 'औषध व सौंदर्यप्रसाधने कायदा, १९४०'
  },
  'Food Safety and Standards (Ayurveda Aahar) Regulations, 2022': {
    en: 'Food Safety and Standards (Ayurveda Aahar) Regulations, 2022',
    hi: 'खाद्य सुरक्षा एवं मानक (आयुर्वेद आहार) विनियम, 2022',
    mr: 'अन्न सुरक्षा व मानके (आयुर्वेद आहार) नियमन, २०२२'
  },
  'FSSAI Ayurveda Aahar 2022': {
    en: 'FSSAI Ayurveda Aahar Regulations 2022',
    hi: 'एफएसएसएआई आयुर्वेद आहार विनियम 2022',
    mr: 'एफएसएसएआय आयुर्वेद आहार नियमन २०२२'
  },
  'Trade Marks Act, 1999': {
    en: 'Trade Marks Act, 1999',
    hi: 'व्यापार चिन्ह अधिनियम, 1999',
    mr: 'व्यापार चिन्ह कायदा, १९९९'
  },
  'The Copyright Act, 1957': {
    en: 'The Copyright Act, 1957',
    hi: 'प्रतिलिप्याधिकार (कॉपीराइट) अधिनियम, 1957',
    mr: 'कॉपीराइट कायदा, १९५७'
  },
  'The Designs Act, 2000': {
    en: 'The Designs Act, 2000',
    hi: 'डिजाइन अधिनियम, 2000',
    mr: 'डिझाइन कायदा, २०००'
  },
  'The Designs Act, 2000 (India)': {
    en: 'The Designs Act, 2000',
    hi: 'डिजाइन अधिनियम, 2000',
    mr: 'डिझाइन कायदा, २०००'
  },
  'The Copyright Act, 1957 (India)': {
    en: 'The Copyright Act, 1957',
    hi: 'प्रतिलिप्याधिकार (कॉपीराइट) अधिनियम, 1957',
    mr: 'कॉपीराइट कायदा, १९५७'
  },
  'Trade Marks Act, 1999 (India)': {
    en: 'Trade Marks Act, 1999',
    hi: 'व्यापार चिन्ह अधिनियम, 1999',
    mr: 'व्यापार चिन्ह कायदा, १९९९'
  },
  'Drugs and Cosmetics Act, 1940 & Rules, 1945 (India)': {
    en: 'Drugs and Cosmetics Act, 1940 & Rules, 1945',
    hi: 'औषधि एवं प्रसाधन सामग्री अधिनियम, 1940 एवं नियमावली, 1945',
    mr: 'औषध व सौंदर्यप्रसाधने कायदा, १९४० आणि नियम, १९४५'
  },
  'Drugs and Cosmetics Act, 1940 & Rules 1945 (Ayush Provisions)': {
    en: 'Drugs and Cosmetics Act, 1940 & Rules 1945 (Ayush Provisions)',
    hi: 'औषधि एवं प्रसाधन सामग्री अधिनियम, 1940 एवं नियमावली 1945',
    mr: 'औषध व सौंदर्यप्रसाधने कायदा, १९४० आणि नियम १९४५'
  },
  'Biological Diversity Rules, 2004 & ABS Guidelines, 2014 (India)': {
    en: 'Biological Diversity Rules, 2004 & ABS Guidelines, 2014',
    hi: 'जैविक विविधता नियमावली, 2004 एवं ABS दिशानिर्देश, 2014',
    mr: 'जैविक विविधता नियम, २००४ आणि ABS मार्गदर्शक तत्त्वे, २०१४'
  },
  'Budapest Treaty on the International Recognition of the Deposit of Microorganisms': {
    en: 'Budapest Treaty on Microorganisms Deposit',
    hi: 'सूक्ष्मजीवों के निक्षेप की अंतर्राष्ट्रीय मान्यता पर बुडापेस्ट संधि',
    mr: 'सूक्ष्मजीवांच्या निक्षेपाच्या आंतरराष्ट्रीय मान्यतेबाबत बुडापेस्ट करार'
  },
  'CDSCO Regulatory Provisions for Phytopharmaceutical Drugs (India)': {
    en: 'CDSCO Regulatory Provisions for Phytopharmaceuticals',
    hi: 'फाइटोफार्मास्युटिकल औषधियों हेतु सीडीएससीओ विनियामक प्रावधान',
    mr: 'फायटोफार्मास्युटिकल औषधांसाठी सीडीएससीओ नियामक तरतुदी'
  },
  'CGPDTM Guidelines for Patent Applications relating to Traditional Knowledge & Bio-resources': {
    en: 'CGPDTM Guidelines on Traditional Knowledge & Bio-resources',
    hi: 'पारंपरिक ज्ञान एवं जैविक संसाधनों हेतु सीजीपीडीटीएम दिशानिर्देश',
    mr: 'पारंपारिक ज्ञान व जैविक संसाधनांसाठी सीजीपीडीटीएम मार्गदर्शक तत्त्वे'
  },
  'Convention on Biological Diversity (CBD, 1992)': {
    en: 'Convention on Biological Diversity (CBD, 1992)',
    hi: 'जैव विविधता पर संयुक्त राष्ट्र अभिसमय (CBD, 1992)',
    mr: 'जैविक विविधतेवरील संयुक्त राष्ट्र परिषद (CBD, १९९२)'
  },
  'Geographical Indications of Goods (Registration and Protection) Act, 1999': {
    en: 'Geographical Indications of Goods (Registration and Protection) Act, 1999',
    hi: 'माल भौगोलिक उपदर्शन (पंजीकरण एवं संरक्षण) अधिनियम, 1999',
    mr: 'वस्तूंचे भौगोलिक उपदर्शन (नोंदणी व संरक्षण) कायदा, १९९९'
  },
  'Geographical Indications of Goods Act, 1999': {
    en: 'Geographical Indications of Goods Act, 1999',
    hi: 'माल भौगोलिक उपदर्शन (जीआई) अधिनियम, 1999',
    mr: 'वस्तूंचे भौगोलिक उपदर्शन (GI) कायदा, १९९९'
  },
  'Hague System for the International Registration of Industrial Designs': {
    en: 'Hague System for International Design Registration',
    hi: 'औद्योगिक डिजाइनों के अंतर्राष्ट्रीय पंजीकरण हेतु हेग प्रणाली',
    mr: 'औद्योगिक डिझाइनच्या आंतरराष्ट्रीय नोंदणीसाठी हेग प्रणाली'
  },
  'International Botanical & Traditional Herbal Medicine Regulatory Directives': {
    en: 'International Botanical & Herbal Directives (US FDA / EU THMPD)',
    hi: 'अंतर्राष्ट्रीय वानस्पतिक एवं पारंपरिक हर्बल चिकित्सा विनियामक निर्देश',
    mr: 'आंतरराष्ट्रीय वनस्पती व पारंपारिक हर्बल औषध नियामक निर्देश'
  },
  'Madrid System for the International Registration of Marks': {
    en: 'Madrid System for International Registration of Marks',
    hi: 'ट्रेडमार्क के अंतर्राष्ट्रीय पंजीकरण हेतु मैड्रिड प्रणाली',
    mr: 'ट्रेडमार्कच्या आंतरराष्ट्रीय नोंदणीसाठी माद्रिद प्रणाली'
  },
  'Nagoya Protocol on Access to Genetic Resources and Benefit-Sharing (CBD)': {
    en: 'Nagoya Protocol on Access and Benefit Sharing (ABS)',
    hi: 'आनुवंशिक संसाधनों की पहुंच एवं लाभ-साझाकरण पर नागोया प्रोटोकॉल (ABS)',
    mr: 'जनुकीय संसाधनांचा वापर व लाभ वाटपाबाबत नागोया प्रोटोकॉल (ABS)'
  },
  'Protection of Plant Varieties and Farmers Rights Act, 2001 (India)': {
    en: 'Protection of Plant Varieties and Farmers Rights Act, 2001',
    hi: 'पादप किस्म एवं कृषक अधिकार संरक्षण अधिनियम, 2001',
    mr: 'वनस्पती वाण व शेतकरी हक्क संरक्षण कायदा, २००१'
  },
  "Protection of Plant Varieties and Farmers' Rights Act, 2001": {
    en: "Protection of Plant Varieties and Farmers' Rights Act, 2001",
    hi: "पादप किस्म एवं कृषक अधिकार संरक्षण अधिनियम, 2001",
    mr: "वनस्पती वाण व शेतकरी हक्क संरक्षण कायदा, २००१"
  },
  'Schedule T: Good Manufacturing Practices (GMP) for ASU Drugs (India)': {
    en: 'Schedule T: Good Manufacturing Practices (GMP) for ASU Drugs',
    hi: 'शेड्यूल T: आयुष औषधियों हेतु उत्तम विनिर्माण आचरण (GMP)',
    mr: 'शेड्यूल T: आयुष औषधांसाठी उत्कृष्ट उत्पादन पद्धती (GMP)'
  },
  'The Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 (India)': {
    en: 'Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954',
    hi: 'औषधि एवं जादुई उपचार (आपत्तिजनक विज्ञापन) अधिनियम, 1954',
    mr: 'औषध आणि जादुई उपाय (आक्षेपार्ह जाहिरात) कायदा, १९५४'
  },
  'Traditional Knowledge Digital Library (TKDL) Prior Art Framework': {
    en: 'Traditional Knowledge Digital Library (TKDL) Prior Art Framework',
    hi: 'पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL) पूर्व कला ढांचा',
    mr: 'पारंपारिक ज्ञान डिजिटल लायब्ररी (TKDL) पूर्व कला चौकट'
  },
  'WTO Agreement on Trade-Related Aspects of Intellectual Property Rights (TRIPS)': {
    en: 'WTO TRIPS Agreement on Intellectual Property Rights',
    hi: 'विश्व व्यापार संगठन TRIPS समझौता (बौद्धिक संपदा अधिकार)',
    mr: 'जागतिक व्यापार संघटना (WTO) TRIPS करार (बौद्धिक संपदा हक्क)'
  }
};

/**
 * Product Categories Localization Dictionary
 */
export const PRODUCT_CATEGORIES_MAP: Record<string, { hi: string; mr: string; en: string }> = {
  'Classical Ayurvedic Medicine': {
    en: 'Classical Ayurvedic Medicine',
    hi: 'शास्त्रीय आयुर्वेदिक औषधि (Classical Ayurvedic Medicine)',
    mr: 'शास्त्रीय आयुर्वेदिक औषध (Classical Ayurvedic Medicine)'
  },
  'Patent / Proprietary Ayurvedic Medicine': {
    en: 'Patent / Proprietary Ayurvedic Medicine',
    hi: 'आयुर्वेदिक प्रोप्रायटरी / पेटेंट औषधि (Proprietary Medicine)',
    mr: 'आयुर्वेदिक प्रोप्रायटरी / पेटंट औषध (Proprietary Medicine)'
  },
  'Ayurveda Aahar': {
    en: 'Ayurveda Aahar',
    hi: 'आयुर्वेद आहार (Ayurveda Aahar)',
    mr: 'आयुर्वेद आहार (Ayurveda Aahar)'
  },
  'Ayurvedic Cosmetic': {
    en: 'Ayurvedic Cosmetic',
    hi: 'आयुर्वेदिक सौंदर्य प्रसाधन (Ayurvedic Cosmetic)',
    mr: 'आयुर्वेदिक सौंदर्यप्रसाधन (Ayurvedic Cosmetic)'
  },
  'Phytopharmaceutical Drug': {
    en: 'Phytopharmaceutical Drug',
    hi: 'पादप-औषधीय (फाइटोफार्मास्युटिकल) औषधि',
    mr: 'फायटोफार्मास्युटिकल औषध'
  },
  'Dietary Supplement / Nutraceutical': {
    en: 'Dietary Supplement / Nutraceutical',
    hi: 'आहार पूरक / न्यूट्रास्युटिकल (Dietary Supplement)',
    mr: 'आहार पूरक / न्यूट्रास्युटिकल (Dietary Supplement)'
  },
  'Herbal Extract / Raw Material': {
    en: 'Herbal Extract / Raw Material',
    hi: 'वानस्पतिक अर्क / कच्चा हर्बल घटक',
    mr: 'हर्बल अर्क / कच्चा घटक'
  }
};

/**
 * IP Categories (7 Categories) Localization Dictionary
 */
export const IP_CATEGORIES_NAME_MAP: Record<string, { hi: string; mr: string; en: string }> = {
  'Patent': {
    en: 'Patent (Product & Process)',
    hi: 'पेटेंट (उत्पाद एवं प्रक्रिया - Section 3(p) व 3(e))',
    mr: 'पेटंट (उत्पादन व प्रक्रिया - Section 3(p) व 3(e))'
  },
  'Trademark': {
    en: 'Trademark (Brand & Trade Dress)',
    hi: 'ट्रेडमार्क (ब्रांड नाम एवं ट्रेड ड्रेस - Trade Marks Act 1999)',
    mr: 'ट्रेडमार्क (ब्रँड नाव व ट्रेड ड्रेस - Trade Marks Act 1999)'
  },
  'Geographical Indication (GI)': {
    en: 'Geographical Indication (GI)',
    hi: 'भौगोलिक उपदर्शन (GI - उद्भव स्थान संरक्षण)',
    mr: 'भौगोलिक उपदर्शन (GI - मूळ स्थान संरक्षण)'
  },
  'Copyright': {
    en: 'Copyright (Literature, Packaging & Software)',
    hi: 'कॉपीराइट (साहित्यिक रचना, पैकेजिंग व लेबल सामग्री)',
    mr: 'कॉपीराइट (साहित्यिक मजकूर, पॅकेजिंग व लेबल माहिती)'
  },
  'Industrial Design': {
    en: 'Industrial Design (Bottle, Shape & Outer Packaging)',
    hi: 'औद्योगिक डिजाइन (कंटेनर, शीशी व पैकेजिंग का नवीन आकार)',
    mr: 'औद्योगिक डिझाइन (बाटली, डबी व पॅकेजिंगचा नवीन आकार)'
  },
  'Plant Variety Protection': {
    en: 'Plant Variety Protection (PPV&FR Act)',
    hi: 'पादप किस्म संरक्षण (PPV&FR अधिनियम - प्रजनक अधिकार)',
    mr: 'वनस्पती वाण संरक्षण (PPV&FR कायदा - पैदासकार हक्क)'
  },
  'Traditional Knowledge / Prior Art': {
    en: 'Traditional Knowledge / Prior Art (TKDL Status)',
    hi: 'पारंपरिक ज्ञान / पूर्व कला (TKDL एवं संहिताओं में पूर्व-अस्तित्व)',
    mr: 'पारंपारिक ज्ञान / पूर्व कला (TKDL व संहितेतील पूर्व-नोंद)'
  }
};

/**
 * Translates Category Name
 */
export function translateCategory(category: string | undefined | null, lang: Language): string {
  if (!category || lang === 'en') return category || '';
  for (const [key, val] of Object.entries(PRODUCT_CATEGORIES_MAP)) {
    if (category.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(category.toLowerCase())) {
      return val[lang] || val.en;
    }
  }
  return category;
}

/**
 * Translates IP Category Name
 */
export function translateIpCategoryName(categoryName: string | undefined | null, lang: Language): string {
  if (!categoryName || lang === 'en') return categoryName || '';
  for (const [key, val] of Object.entries(IP_CATEGORIES_NAME_MAP)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(categoryName.toLowerCase())) {
      return val[lang] || val.en;
    }
  }
  return categoryName;
}

/**
 * Translates an Act Name into the selected language
 */
export function translateActName(actName: string | undefined | null, lang: Language): string {
  if (!actName) return '';

  if (lang === 'en') {
    let t = actName;
    t = t.replace(/(?:The\s+)?पेट[ंे]ट\s+(?:अधिनियम|कायदा),?\s*(?:१९७०|1970)?(?:\s*\(.*?\))?/gi, 'The Patents Act, 1970');
    t = t.replace(/जैविक\s+विविधता\s+(?:अधिनियम|कायदा),?\s*(?:२००२|2002)?(?:\s*\(.*?\))?/gi, 'Biological Diversity Act, 2002');
    t = t.replace(/(?:औषध\s+व\s+सौंदर्यप्रसाधने|औषधि\s+एवं\s+प्रसाधन\s+सामग्री)\s+(?:अधिनियम|कायदा),?\s*(?:१९४०|1940)?(?:\s*\(.*?\))?/gi, 'Drugs and Cosmetics Act, 1940');
    t = t.replace(/व्यापार\s+चिन्ह\s+(?:अधिनियम|कायदा),?\s*(?:१९९९|1999)?(?:\s*\(.*?\))?/gi, 'Trade Marks Act, 1999');
    t = t.replace(/(?:प्रतिलिप्याधिकार\s*\(कॉपीराइट\)|कॉपीराइट)\s+(?:अधिनियम|कायदा),?\s*(?:१९५७|1957)?(?:\s*\(.*?\))?/gi, 'The Copyright Act, 1957');
    t = t.replace(/डि[जझ]ाइन\s+(?:अधिनियम|कायदा),?\s*(?:२०००|2000)?(?:\s*\(.*?\))?/gi, 'The Designs Act, 2000');
    t = t.replace(/(?:अन्न\s+सुरक्षा\s+व\s+मानके|खाद्य\s+सुरक्षा\s+एवं\s+मानक)\s*\(आयुर्वेद\s+आहार\)\s*(?:नियमन|विनियम),?\s*(?:२०२२|2022)?/gi, 'Food Safety and Standards (Ayurveda Aahar) Regulations, 2022');
    t = t.replace(/पेट[ंे]ट\s+सहकार्य\s+करार\s*\(PCT\)|पेटेंट\s+सहयोग\s+संधि\s*\(PCT\)/gi, 'Patent Cooperation Treaty (PCT)');
    t = t.replace(/नागोया\s+प्रोटोकॉल\s*\(ABS\)/gi, 'Nagoya Protocol on ABS');
    return t;
  }

  const sortedKeys = Object.keys(STATUTORY_ACTS_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (actName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(actName.toLowerCase())) {
      return STATUTORY_ACTS_MAP[key][lang] || STATUTORY_ACTS_MAP[key].en;
    }
  }

  if (lang === 'hi') {
    let t = actName;
    t = t.replace(/(?:The\s+)?Patents Act,? 1970(?:\s*\(.*?\))?/gi, 'पेटेंट अधिनियम, 1970');
    t = t.replace(/Biological Diversity Act,? 2002(?:\s*&.*?)?(?:\s*\(.*?\))?/gi, 'जैविक विविधता अधिनियम, 2002');
    t = t.replace(/Biological Diversity Rules,? 2004(?:\s*&.*?)?(?:\s*\(.*?\))?/gi, 'जैविक विविधता नियमावली, 2004 एवं ABS दिशानिर्देश');
    t = t.replace(/Drugs and Cosmetics Act,? 1940(?:\s*&.*?)?(?:\s*\(.*?\))?/gi, 'औषधि एवं प्रसाधन सामग्री अधिनियम, 1940 एवं नियमावली 1945');
    t = t.replace(/Drugs & Cosmetics Act,? 1940(?:\s*\(.*?\))?/gi, 'औषधि एवं प्रसाधन सामग्री अधिनियम, 1940');
    t = t.replace(/Trade Marks Act,? 1999(?:\s*\(.*?\))?/gi, 'व्यापार चिन्ह अधिनियम, 1999');
    t = t.replace(/Copyright Act,? 1957(?:\s*\(.*?\))?/gi, 'प्रतिलिप्याधिकार (कॉपीराइट) अधिनियम, 1957');
    t = t.replace(/Designs Act,? 2000(?:\s*\(.*?\))?/gi, 'डिजाइन अधिनियम, 2000');
    t = t.replace(/Geographical Indications.*?Act,? 1999/gi, 'माल भौगोलिक उपदर्शन (जीआई) अधिनियम, 1999');
    t = t.replace(/Protection of Plant Varieties.*?Act,? 2001/gi, 'पादप किस्म एवं कृषक अधिकार संरक्षण अधिनियम, 2001');
    t = t.replace(/Food Safety and Standards.*?2022/gi, 'खाद्य सुरक्षा एवं मानक (आयुर्वेद आहार) विनियम, 2022');
    t = t.replace(/Patent Cooperation Treaty/gi, 'पेटेंट सहयोग संधि (PCT)');
    t = t.replace(/Nagoya Protocol.*?/gi, 'नागोया प्रोटोकॉल (Nagoya Protocol on ABS)');
    t = t.replace(/WIPO Treaty.*?/gi, 'डब्ल्यूआईपीओ (WIPO) पारंपरिक ज्ञान संधि');
    t = t.replace(/Convention on Biological Diversity/gi, 'जैव विविधता अभिसमय (CBD)');
    t = t.replace(/Budapest Treaty.*?/gi, 'बुडापेस्ट संधि');
    t = t.replace(/Madrid System.*?/gi, 'मैड्रिड प्रणाली');
    t = t.replace(/Hague System.*?/gi, 'हेग प्रणाली');
    t = t.replace(/CDSCO Regulatory.*?/gi, 'सीडीएससीओ फाइटोफार्मास्युटिकल विनियामक प्रावधान');
    t = t.replace(/Traditional Knowledge Digital Library.*?/gi, 'पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL)');
    // If text was in Marathi, localize to Hindi
    t = t.replace(/कायदा/g, 'अधिनियम').replace(/नियमन/g, 'विनियम');
    return t;
  }

  if (lang === 'mr') {
    let t = actName;
    t = t.replace(/(?:The\s+)?Patents Act,? 1970(?:\s*\(.*?\))?/gi, 'पेटंट कायदा, १९७०');
    t = t.replace(/Biological Diversity Act,? 2002(?:\s*&.*?)?(?:\s*\(.*?\))?/gi, 'जैविक विविधता कायदा, २००२');
    t = t.replace(/Biological Diversity Rules,? 2004(?:\s*&.*?)?(?:\s*\(.*?\))?/gi, 'जैविक विविधता नियम, २००४ आणि ABS मार्गदर्शक तत्त्वे');
    t = t.replace(/Drugs and Cosmetics Act,? 1940(?:\s*&.*?)?(?:\s*\(.*?\))?/gi, 'औषध व सौंदर्यप्रसाधने कायदा, १९४० आणि नियम १९४५');
    t = t.replace(/Drugs & Cosmetics Act,? 1940(?:\s*\(.*?\))?/gi, 'औषध व सौंदर्यप्रसाधने कायदा, १९४०');
    t = t.replace(/Trade Marks Act,? 1999(?:\s*\(.*?\))?/gi, 'व्यापार चिन्ह कायदा, १९९९');
    t = t.replace(/Copyright Act,? 1957(?:\s*\(.*?\))?/gi, 'कॉपीराइट कायदा, १९५७');
    t = t.replace(/Designs Act,? 2000(?:\s*\(.*?\))?/gi, 'डिझाइन कायदा, २०००');
    t = t.replace(/Geographical Indications.*?Act,? 1999/gi, 'वस्तूंचे भौगोलिक उपदर्शन (GI) कायदा, १९९९');
    t = t.replace(/Protection of Plant Varieties.*?Act,? 2001/gi, 'वनस्पती वाण व शेतकरी हक्क संरक्षण कायदा, २००१');
    t = t.replace(/Food Safety and Standards.*?2022/gi, 'अन्न सुरक्षा व मानके (आयुर्वेद आहार) नियमन, २०२२');
    t = t.replace(/Patent Cooperation Treaty/gi, 'पेटंट सहकार्य करार (PCT)');
    t = t.replace(/Nagoya Protocol.*?/gi, 'नागोया प्रोटोकॉल (Nagoya Protocol - ABS)');
    t = t.replace(/WIPO Treaty.*?/gi, 'विपो (WIPO) पारंपारिक ज्ञान करार');
    t = t.replace(/Convention on Biological Diversity/gi, 'जैविक विविधता परिषद (CBD)');
    t = t.replace(/Budapest Treaty.*?/gi, 'बुडापेस्ट करार');
    t = t.replace(/Madrid System.*?/gi, 'माद्रिद प्रणाली');
    t = t.replace(/Hague System.*?/gi, 'हेग प्रणाली');
    t = t.replace(/CDSCO Regulatory.*?/gi, 'सीडीएससीओ फायटोफार्मास्युटिकल नियामक तरतुदी');
    t = t.replace(/Traditional Knowledge Digital Library.*?/gi, 'पारंपारिक ज्ञान डिजिटल लायब्ररी (TKDL)');
    // If text was in Hindi, localize to Marathi
    t = t.replace(/अधिनियम/g, 'कायदा').replace(/विनियम/g, 'नियमन');
    return t;
  }

  return actName;
}

/**
 * Translates a Section Name into the selected language
 */
export function translateSection(section: string | undefined | null, lang: Language): string {
  if (!section) return '';

  const trimmed = section.trim();

  if (lang === 'en') {
    let s = trimmed;
    if (STATUTORY_SECTIONS_SHORT_MAP[trimmed]) {
      return STATUTORY_SECTIONS_SHORT_MAP[trimmed].en;
    }
    s = s.replace(/पहिली\s+अनुसूची|प्रथम\s+अनुसूची/gi, 'First Schedule');
    s = s.replace(/दुसरी\s+अनुसूची|द्वितीय\s+अनुसूची/gi, 'Second Schedule');
    s = s.replace(/कलम\s+|धारा\s+/gi, 'Section ');
    s = s.replace(/नियमन\s+|विनियम\s+/gi, 'Regulation ');
    s = s.replace(/प्रकरण\s+|अध्याय\s+/gi, 'Chapter ');
    s = s.replace(/अनुच्छेद\s+/gi, 'Article ');
    s = s.replace(/फॉर्म\s+/gi, 'Form ');
    return s;
  }

  if (STATUTORY_SECTIONS_SHORT_MAP[trimmed]) {
    return STATUTORY_SECTIONS_SHORT_MAP[trimmed][lang] || STATUTORY_SECTIONS_SHORT_MAP[trimmed].en;
  }

  for (const [key, val] of Object.entries(STATUTORY_SECTIONS_SHORT_MAP)) {
    if (trimmed.toLowerCase() === key.toLowerCase()) {
      return val[lang] || val.en;
    }
  }

  if (lang === 'hi') {
    let s = trimmed;
    s = s.replace(/First\s+Schedule|पहिली\s+अनुसूची/gi, 'प्रथम अनुसूची');
    s = s.replace(/Second\s+Schedule|दुसरी\s+अनुसूची/gi, 'द्वितीय अनुसूची');
    s = s.replace(/Section\s+|कलम\s+/gi, 'धारा ');
    s = s.replace(/Rule\s+/gi, 'नियम ');
    s = s.replace(/Article\s+/gi, 'अनुच्छेद ');
    s = s.replace(/Chapter\s+|प्रकरण\s+/gi, 'अध्याय ');
    s = s.replace(/Regulation\s+|नियमन\s+/gi, 'विनियम ');
    s = s.replace(/Schedule\s+/gi, 'शेड्यूल ');
    s = s.replace(/Form\s+/gi, 'फॉर्म ');
    return s;
  }

  if (lang === 'mr') {
    let s = trimmed;
    s = s.replace(/First\s+Schedule|प्रथम\s+अनुसूची/gi, 'पहिली अनुसूची');
    s = s.replace(/Second\s+Schedule|द्वितीय\s+अनुसूची/gi, 'दुसरी अनुसूची');
    s = s.replace(/Section\s+|धारा\s+/gi, 'कलम ');
    s = s.replace(/Rule\s+/gi, 'नियम ');
    s = s.replace(/Article\s+/gi, 'अनुच्छेद ');
    s = s.replace(/Chapter\s+|अध्याय\s+/gi, 'प्रकरण ');
    s = s.replace(/Regulation\s+|विनियम\s+/gi, 'नियमन ');
    s = s.replace(/Schedule\s+/gi, 'शेड्यूल ');
    s = s.replace(/Form\s+/gi, 'फॉर्म ');
    return s;
  }

  return section;
}

/**
 * Translates a full legal provision string into the selected language
 */
export function translateProvision(provision: string | undefined | null, lang: Language): string {
  if (!provision) return '';
  if (lang === 'en') return provision;

  // Direct section mapping lookup
  for (const [key, val] of Object.entries(STATUTORY_SECTIONS_MAP)) {
    if (provision.toLowerCase().includes(key.toLowerCase())) {
      let text = provision.replace(new RegExp(key, 'gi'), val[lang]);
      return translateStatutoryText(text, lang);
    }
  }

  return translateStatutoryText(provision, lang);
}

/**
 * Translates IP Status badges into localized representations
 */
export function translateIpStatus(status: string | undefined | null, lang: Language): string {
  if (!status) return '';

  const statusMap: Record<string, { en: string; hi: string; mr: string }> = {
    'Relevant': {
      en: 'Potentially Relevant Provision',
      hi: 'संभावित प्रासंगिक प्रावधान (Potentially Relevant Provision)',
      mr: 'संभाव्य सुसंगत तरतूद (Potentially Relevant Provision)'
    },
    'Potentially Relevant': {
      en: 'Potentially Relevant Provision',
      hi: 'संभावित प्रासंगिक प्रावधान (Potentially Relevant Provision)',
      mr: 'संभाव्य सुसंगत तरतूद (Potentially Relevant Provision)'
    },
    'Needs Human Review': {
      en: 'Human Review Recommended',
      hi: 'मानवीय समीक्षा अनुशंसित (Human Review Recommended)',
      mr: 'मानवी पुनरावलोकन अनुशंसित (Human Review Recommended)'
    },
    'Not Indicated': {
      en: 'No Relevant Provision Identified in Retrieved Sources',
      hi: 'पुनर्प्राप्त स्रोतों में कोई प्रासंगिक प्रावधान नहीं मिला',
      mr: 'पुनर्प्राप्त स्त्रोतांमध्ये संबंधित तरतूद आढळली नाही'
    },
    'Applicable': {
      en: 'Potentially Applicable',
      hi: 'संभावित लागू (Potentially Applicable)',
      mr: 'संभाव्य लागू (Potentially Applicable)'
    },
    'Potentially Applicable': {
      en: 'Potentially Applicable',
      hi: 'संभावित लागू (Potentially Applicable)',
      mr: 'संभाव्य लागू (Potentially Applicable)'
    },
    'Barred': {
      en: 'Potential IP Barrier Identified',
      hi: 'संभावित आईपी बाधा चिह्नित (Potential IP Barrier Identified)',
      mr: 'संभाव्य आयपी अडथळा आढळला (Potential IP Barrier Identified)'
    },
    'Caution / Barred': {
      en: 'Potential IP Barrier Identified',
      hi: 'संभावित आईपी बाधा चिह्नित (Potential IP Barrier Identified)',
      mr: 'संभाव्य आयपी अडथळा आढळला (Potential IP Barrier Identified)'
    },
    'Conditional': {
      en: 'Further Verification Required',
      hi: 'अतिरिक्त सत्यापन आवश्यक (Further Verification Required)',
      mr: 'अधिक पडताळणी आवश्यक (Further Verification Required)'
    },
    'Eligible': {
      en: 'Assessment Indicates Pathway Available (Verification Required)',
      hi: 'मूल्यांकन मार्ग उपलब्ध दर्शाता है (सत्यापन आवश्यक)',
      mr: 'मूल्यांकन मार्ग उपलब्ध दर्शवते (पडताळणी आवश्यक)'
    },
    'High': {
      en: 'High Confidence (Research Basis)',
      hi: 'उच्च विश्वसनीयता (अनुसंधान आधार)',
      mr: 'उच्च विश्वासार्हता (संशोधन आधार)'
    },
    'Medium': {
      en: 'Medium Confidence (Review Recommended)',
      hi: 'मध्यम विश्वसनीयता (समीक्षा अनुशंसित)',
      mr: 'मध्यम विश्वासार्हता (पुनरावलोकन अनुशंसित)'
    },
    'Low': {
      en: 'Uncertainty Flagged (Review Recommended)',
      hi: 'अनिश्चितता चिह्नित (समीक्षा अनुशंसित)',
      mr: 'अनिश्चितता चिन्हांकित (पुनरावलोकन अनुशंसित)'
    }
  };

  const direct = statusMap[status];
  if (direct) {
    return direct[lang] || direct.en;
  }

  // Case-insensitive match check
  for (const [key, val] of Object.entries(statusMap)) {
    if (status.toLowerCase() === key.toLowerCase()) {
      return val[lang] || val.en;
    }
  }

  if (lang === 'en') {
    if (status.toLowerCase().includes('bar')) return 'Potential IP Barrier Identified';
    if (status.toLowerCase().includes('eligib')) return 'Assessment Indicates Pathway Available (Verification Required)';
    if (status.toLowerCase().includes('review')) return 'Human Review Recommended';
    return status;
  }

  return status;
}

/**
 * Universal Statutory Text Translator
 * Translates common English legal reasoning, statutory phrases, and conclusions into Hindi or Marathi.
 */
export function translateStatutoryText(text: string | undefined | null, lang: Language): string {
  if (!text || lang === 'en') return text || '';

  let s = text;

  // Specific common full sentences from the expert AI pipeline:
  const PHRASE_PAIRS: Array<[RegExp, { hi: string; mr: string }]> = [
    [
      /Traditional Ayurvedic knowledge and public domain formulation recipes are non-patentable under Section 3\(p\)\.?/gi,
      {
        hi: 'पारंपरिक आयुर्वेदिक ज्ञान एवं सार्वजनिक क्षेत्र के ग्रंथ नुस्खे पेटेंट अधिनियम की धारा 3(p) के तहत पेटेंट योग्य नहीं हैं।',
        mr: 'पारंपारिक आयुर्वेदिक ज्ञान आणि सार्वजनिक डोमेन संहितेतील पाककृती पेटंट कायद्याच्या कलम 3(p) अंतर्गत पेटंटपात्र नाहीत.'
      }
    ],
    [
      /Mere admixtures without synergistic clinical validation are excluded from patent protection\.?/gi,
      {
        hi: 'बिना सहक्रियात्मक (सिनर्जिस्टिक) नैदानिक सत्यापन के केवल घटकों का मिश्रण धारा 3(e) के तहत पेटेंट से बाहर है।',
        mr: 'सिनर्जिस्टिक वैद्यकीय प्रमाणीकरणाशिवाय केवळ घटकांचे साधे मिश्रण कलम 3(e) अंतर्गत पेटंट संरक्षणातून वगळले आहे.'
      }
    ],
    [
      /Formulations must exhibit unexpected therapeutic synergism to overcome Section 3\(e\)\.?/gi,
      {
        hi: 'धारा 3(e) की बाधा पार करने के लिए फॉर्म्युलेशन में अप्रत्याशित चिकित्सीय सहक्रिया (Synergism) प्रमाणित होना अनिवार्य है।',
        mr: 'कलम 3(e) ची अट पूर्ण करण्यासाठी फॉर्म्युलेशनमध्ये अनपेक्षित उपचारात्मक सिनर्जी सिद्ध होणे आवश्यक आहे.'
      }
    ],
    [
      /Conduct comprehensive TKDL clearance search\.?/gi,
      {
        hi: 'पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL) में व्यापक क्लीयरेंस खोज करें।',
        mr: 'पारंपारिक ज्ञान डिजिटल लायब्ररीमध्ये (TKDL) सविस्तर शोध घ्या.'
      }
    ],
    [
      /Protect brand identity via Trademark Act 1999 \(Class 5 & 30\)\.?/gi,
      {
        hi: 'ट्रेडमार्क अधिनियम 1999 (वर्ग 5 एवं 30) के अंतर्गत ब्रांड नाम सुरक्षित करें।',
        mr: 'ट्रेडमार्क कायदा १९९९ (वर्ग ५ व ३०) अंतर्गत ब्रँड नाव संरक्षित करा.'
      }
    ],
    [
      /Generate combination index \(CI < 1\) bioassay data\.?/gi,
      {
        hi: 'कॉम्बिनेशन इंडेक्स (CI < 1) बायोएसे सिनर्जी डेटा तैयार करें।',
        mr: 'कॉम्बिनेशन इंडेक्स (CI < 1) बायोएसे सिनर्जी डेटा तयार करा.'
      }
    ],
    [
      /Schedule T GMP Certificate for premises/gi,
      {
        hi: 'परिसर हेतु अनुसूची टी (Schedule T) उत्तम विनिर्माण प्रमाण पत्र (GMP)',
        mr: 'उत्पादन युनिटसाठी शेड्यूल टी (Schedule T) उत्तम उत्पादन प्रमाणपत्र (GMP)'
      }
    ],
    [
      /Ayurvedic technical person supervision/gi,
      {
        hi: 'मान्यताप्राप्त आयुर्वेदिक तकनीकी विशेषज्ञ की देखरेख',
        mr: 'मान्यताप्राप्त आयुर्वेदिक तांत्रिक तज्ञाचे पर्यवेक्षण'
      }
    ],
    [
      /Geographic source documentation of herbs/gi,
      {
        hi: 'जड़ी-बूटियों के भौगोलिक स्रोत एवं मूल स्थान का दस्तावेजीकरण',
        mr: 'औषधी वनस्पतींच्या भौगोलिक स्त्रोताचे दस्तऐवजीकरण'
      }
    ],
    [
      /Intimation to SBB prior to commercial scale launch/gi,
      {
        hi: 'व्यावसायिक पैमाने पर निर्माण से पूर्व राज्य जैव विविधता बोर्ड (SBB) को सूचना',
        mr: 'व्यावसायिक उत्पादनापूर्वी राज्य जैवविविधता मंडळाला (SBB) पूर्वसूचना'
      }
    ],
    [
      /Cannot obtain product patent on classical formulation\.?/gi,
      {
        hi: 'शास्त्रीय संहिता-आधारित फॉर्म्युलेशन पर उत्पाद पेटेंट प्राप्त नहीं किया जा सकता।',
        mr: 'शास्त्रीय संहितेवर आधारित फॉर्म्युलेशनवर उत्पादन पेटंट मिळवता येत नाही.'
      }
    ],
    [
      /Rely on registered trademarks and proprietary processes\.?/gi,
      {
        hi: 'पंजीकृत ट्रेडमार्क एवं मालिकाना विनिर्माण प्रक्रिया संरक्षण पर ध्यान दें।',
        mr: 'नोंदणीकृत ट्रेडमार्क व मालकी उत्पादन प्रक्रियेच्या संरक्षणावर भर द्या.'
      }
    ],
    [
      /Barred under Section 3\(p\)/gi,
      {
        hi: 'धारा 3(p) के तहत पूर्णतः प्रतिबंधित (पारंपरिक ज्ञान)',
        mr: 'कलम 3(p) अंतर्गत पूर्णपणे प्रतिबंधित (पारंपारिक ज्ञान)'
      }
    ],
    [
      /High \(Documented in Ayurvedic Samhitas\)/gi,
      {
        hi: 'उच्च (प्राचीन आयुर्वेदिक संहिताओं में पूर्व-प्रलेखित)',
        mr: 'उच्च (प्राचीन आयुर्वेदिक संहितेमध्ये पूर्व-नोंदणीकृत)'
      }
    ],
    [
      /Prior Intimation Mandated/gi,
      {
        hi: 'पूर्व सूचना अनिवार्य (Section 7 BDA 2002)',
        mr: 'पूर्वसूचना बंधनकारक (Section 7 BDA 2002)'
      }
    ],
    [
      /Formulation classified as (.+?) with (.+?) confidence/gi,
      {
        hi: 'फॉर्म्युलेशन को $2 विश्वसनीयता के साथ "$1" के रूप में वर्गीकृत किया गया है।',
        mr: 'फॉर्म्युलेशनचे $2 विश्वासार्हतेसह "$1" म्हणून वर्गीकरण केले गेले आहे.'
      }
    ],
    [
      /Ingredients documented in official Ayurvedic treatise/gi,
      {
        hi: 'घटक द्रव्य आधिकारिक प्रथम अनुसूची आयुर्वेदिक संहिताओं में प्रलेखित हैं',
        mr: 'घटक द्रव्ये अधिकृत पहिल्या अनुसूचीतील आयुर्वेदिक संहितेमध्ये नोंदवलेली आहेत'
      }
    ],
    [
      /Dosage form conforms to classical manufacturing methods/gi,
      {
        hi: 'औषध स्वरूप पारंपरिक विनिर्माण विधियों के सर्वथा अनुकूल है',
        mr: 'औषध स्वरूप पारंपारिक उत्पादन पद्धतींशी पूर्णतः सुसंगत आहे'
      }
    ],
    [
      /Intended therapeutic use is consistent with traditional indications/gi,
      {
        hi: 'चिकित्सीय प्रयोजन पारंपरिक ग्रंथ संकेतों के अनुरूप है',
        mr: 'उपचारात्मक हेतू पारंपारिक संहिता संकेतांशी सुसंगत आहे'
      }
    ],
    [
      /Requires Schedule T GMP compliance and State Licensing Authority/gi,
      {
        hi: 'शेड्यूल T जीएमपी अनुपालन एवं राज्य अनुज्ञापन प्राधिकरण (SLA) अनुमोदन अनिवार्य है',
        mr: 'शेड्यूल T जीएमपी अनुपालन व राज्य परवाना प्राधिकरण (SLA) मंजुरी आवश्यक आहे'
      }
    ],
    [
      /Section 3\(p\) of the Patents Act, 1970 prohibits patents on traditional knowledge/gi,
      {
        hi: 'पेटेंट अधिनियम 1970 की धारा 3(p) पारंपरिक ज्ञान अथवा ज्ञात घटकों पर पेटेंट प्रतिबंधित करती है',
        mr: 'पेटंट कायदा १९७० चे कलम 3(p) पारंपारिक ज्ञान किंवा ज्ञात घटकांवर पेटंट प्रतिबंधित करते'
      }
    ],
    [
      /Section 3\(e\) excludes mere admixtures/gi,
      {
        hi: 'धारा 3(e) केवल गुणों के एकत्रीकरण वाले साधारण मिश्रणों को पेटेंट से बाहर रखती है',
        mr: 'कलम 3(e) केवळ गुणांचे एकत्रिकरण असणाऱ्या साध्या मिश्रणांना पेटंटमधून वगळते'
      }
    ],
    [
      /Section 7 of Biological Diversity Act, 2002 requires prior intimation/gi,
      {
        hi: 'जैविक विविधता अधिनियम 2002 की धारा 7 भारतीय संस्थाओं हेतु राज्य जैव विविधता बोर्ड को पूर्व सूचना अनिवार्य करती है',
        mr: 'जैविक विविधता कायदा २००२ चे कलम 7 भारतीय घटकांसाठी राज्य जैवविविधता मंडळाला पूर्वसूचना बंधनकारक करते'
      }
    ],
    [
      /Section 3 requires prior NBA approval/gi,
      {
        hi: 'धारा 3 विदेशी स्वामित्व अथवा विदेशी सहभागिता वाले मामलों में NBA की पूर्व अनुमति अनिवार्य करती है',
        mr: 'कलम 3 परदेशी मालकी किंवा सहभाग असलेल्या प्रकरणांत NBA ची पूर्वपरवानगी बंधनकारक करते'
      }
    ],
    [
      /Section 6 mandates NBA approval before applying for intellectual property/gi,
      {
        hi: 'धारा 6 जैविक संसाधनों पर आधारित बौद्धिक संपदा अधिकार प्राप्त करने से पूर्व NBA फॉर्म III स्वीकृति अनिवार्य करती है',
        mr: 'कलम 6 जैविक संसाधनांवर आधारित बौद्धिक संपदा मिळवण्यापूर्वी NBA फॉर्म III मंजुरी बंधनकारक करते'
      }
    ]
  ];

  for (const [regex, replacement] of PHRASE_PAIRS) {
    if (regex.test(s)) {
      s = s.replace(regex, replacement[lang]);
    }
  }

  // Key word & statutory token translations:
  if (lang === 'hi') {
    s = s
      .replace(/\bPatents Act,? 1970\b/gi, 'पेटेंट अधिनियम, 1970')
      .replace(/\bThe Patents Act,? 1970\b/gi, 'पेटेंट अधिनियम, 1970')
      .replace(/\bBiological Diversity Act,? 2002\b/gi, 'जैविक विविधता अधिनियम, 2002')
      .replace(/\bDrugs and Cosmetics Act,? 1940\b/gi, 'औषधि एवं प्रसाधन सामग्री अधिनियम, 1940')
      .replace(/\bDrugs & Cosmetics Act 1940\b/gi, 'औषधि एवं प्रसाधन सामग्री अधिनियम, 1940')
      .replace(/\bTrade Marks Act,? 1999\b/gi, 'व्यापार चिन्ह अधिनियम, 1999')
      .replace(/\bCopyright Act,? 1957\b/gi, 'कॉपीराइट अधिनियम, 1957')
      .replace(/\bDesigns Act,? 2000\b/gi, 'डिजाइन अधिनियम, 2000')
      .replace(/\bSection 3\(p\)\b/gi, 'धारा 3(p)')
      .replace(/\bSection 3\(e\)\b/gi, 'धारा 3(e)')
      .replace(/\bSection 3\(d\)\b/gi, 'धारा 3(d)')
      .replace(/\bSection 3\(a\)\b/gi, 'धारा 3(a)')
      .replace(/\bSection 3\(h\)\b/gi, 'धारा 3(h)')
      .replace(/\bSection 6\b/gi, 'धारा 6')
      .replace(/\bSection 7\b/gi, 'धारा 7')
      .replace(/\bSection 3\b/gi, 'धारा 3')
      .replace(/\bSection 40\b/gi, 'धारा 40')
      .replace(/\bRule 158B\b/gi, 'नियम 158B')
      .replace(/\bRule 161\b/gi, 'नियम 161')
      .replace(/\bSchedule T\b/gi, 'शेड्यूल T (GMP)')
      .replace(/\bSchedule E\(1\)\b/gi, 'शेड्यूल E(1)')
      .replace(/\bFirst Schedule\b/gi, 'प्रथम अनुसूची')
      .replace(/\bSecond Schedule\b/gi, 'द्वितीय अनुसूची')
      .replace(/\bClassical Ayurvedic Medicine\b/gi, 'शास्त्रीय आयुर्वेदिक औषधि')
      .replace(/\bPatent \/ Proprietary Ayurvedic Medicine\b/gi, 'आयुर्वेदिक प्रोप्रायटरी औषधि')
      .replace(/\bAyurveda Aahar\b/gi, 'आयुर्वेद आहार')
      .replace(/\bNational Biodiversity Authority\b/gi, 'राष्ट्रीय जैव विविधता प्राधिकरण (NBA)')
      .replace(/\bState Biodiversity Board\b/gi, 'राज्य जैव विविधता बोर्ड (SBB)')
      .replace(/\bState Licensing Authority\b/gi, 'राज्य अनुज्ञापन प्राधिकरण (SLA)')
      .replace(/\btraditional knowledge\b/gi, 'पारंपरिक ज्ञान')
      .replace(/\bprior art\b/gi, 'पूर्व कला (Prior Art)')
      .replace(/\bsynergistic\b/gi, 'सहक्रियात्मक (Synergistic)')
      .replace(/\bsynergy\b/gi, 'सहक्रिया (Synergy)')
      .replace(/\bmere admixture\b/gi, 'मात्र मिश्रण (Mere Admixture)')
      .replace(/\bHigh confidence\b/gi, 'उच्च विश्वसनीयता')
      .replace(/\bMedium confidence\b/gi, 'मध्यम विश्वसनीयता')
      .replace(/\bLow confidence\b/gi, 'न्यूनतम विश्वसनीयता');
  }

  if (lang === 'mr') {
    s = s
      .replace(/\bPatents Act,? 1970\b/gi, 'पेटंट कायदा, १९७०')
      .replace(/\bThe Patents Act,? 1970\b/gi, 'पेटंट कायदा, १९७०')
      .replace(/\bBiological Diversity Act,? 2002\b/gi, 'जैविक विविधता कायदा, २००२')
      .replace(/\bDrugs and Cosmetics Act,? 1940\b/gi, 'औषध व सौंदर्यप्रसाधने कायदा, १९४०')
      .replace(/\bDrugs & Cosmetics Act 1940\b/gi, 'औषध व सौंदर्यप्रसाधने कायदा, १९४०')
      .replace(/\bTrade Marks Act,? 1999\b/gi, 'व्यापार चिन्ह कायदा, १९९९')
      .replace(/\bCopyright Act,? 1957\b/gi, 'कॉपीराइट कायदा, १९५७')
      .replace(/\bDesigns Act,? 2000\b/gi, 'डिझाइन कायदा, २०००')
      .replace(/\bSection 3\(p\)\b/gi, 'कलम 3(p)')
      .replace(/\bSection 3\(e\)\b/gi, 'कलम 3(e)')
      .replace(/\bSection 3\(d\)\b/gi, 'कलम 3(d)')
      .replace(/\bSection 3\(a\)\b/gi, 'कलम 3(a)')
      .replace(/\bSection 3\(h\)\b/gi, 'कलम 3(h)')
      .replace(/\bSection 6\b/gi, 'कलम 6')
      .replace(/\bSection 7\b/gi, 'कलम 7')
      .replace(/\bSection 3\b/gi, 'कलम 3')
      .replace(/\bSection 40\b/gi, 'कलम 40')
      .replace(/\bRule 158B\b/gi, 'नियम 158B')
      .replace(/\bRule 161\b/gi, 'नियम 161')
      .replace(/\bSchedule T\b/gi, 'शेड्यूल T (GMP)')
      .replace(/\bSchedule E\(1\)\b/gi, 'शेड्यूल E(1)')
      .replace(/\bFirst Schedule\b/gi, 'पहिली अनुसूची')
      .replace(/\bSecond Schedule\b/gi, 'दुसरी अनुसूची')
      .replace(/\bClassical Ayurvedic Medicine\b/gi, 'शास्त्रीय आयुर्वेदिक औषध')
      .replace(/\bPatent \/ Proprietary Ayurvedic Medicine\b/gi, 'आयुर्वेदिक प्रोप्रायटरी औषध')
      .replace(/\bAyurveda Aahar\b/gi, 'आयुर्वेद आहार')
      .replace(/\bNational Biodiversity Authority\b/gi, 'राष्ट्रीय जैवविविधता प्राधिकरण (NBA)')
      .replace(/\bState Biodiversity Board\b/gi, 'राज्य जैवविविधता मंडळ (SBB)')
      .replace(/\bState Licensing Authority\b/gi, 'राज्य परवाना प्राधिकरण (SLA)')
      .replace(/\btraditional knowledge\b/gi, 'पारंपारिक ज्ञान')
      .replace(/\bprior art\b/gi, 'पूर्व कला (Prior Art)')
      .replace(/\bsynergistic\b/gi, 'सिनर्जिस्टिक (Synergistic)')
      .replace(/\bsynergy\b/gi, 'सिनर्जी (Synergy)')
      .replace(/\bmere admixture\b/gi, 'केवळ मिश्रण (Mere Admixture)')
      .replace(/\bHigh confidence\b/gi, 'उच्च विश्वासार्हता')
      .replace(/\bMedium confidence\b/gi, 'मध्यम विश्वासार्हता')
      .replace(/\bLow confidence\b/gi, 'कमी विश्वासार्हता');
  }

  return s;
}
