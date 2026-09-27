import { ProductAnalysisInput, ProductAnalysisResult } from '../api/client.js';

export interface AnalysisHistoryItem {
  id: string;
  caseId: string;
  timestamp: string;
  productName: string;
  category: string;
  intendedUse: string;
  ingredients: string;
  dosageForm: string;
  confidence: 'High' | 'Medium' | 'Low';
  targetMarket?: string;
  language?: 'en' | 'hi' | 'mr' | string;
  ipStatus?: string;
  absStatus?: string;
  humanReviewStatus?: 'Analysis Completed' | 'Dossier Generated' | 'Review Requested' | 'Submitted' | 'Under Review' | 'Reviewed/Closed' | string;
  followsClassicalText?: 'yes_fully' | 'partially' | 'no';
  classicalTextName?: string;
  claimsMade?: string;
  input: ProductAnalysisInput;
  result: ProductAnalysisResult;
  dossier?: any;
}

const STORAGE_KEY = 'ip_sakti_analysis_history_v1';

export const INITIAL_SEEDED_HISTORY: AnalysisHistoryItem[] = [
  {
    id: 'seed-triphala-churna',
    caseId: 'CASE-20260925-TRI001',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    productName: 'Triphala Churna (Classical AFI)',
    category: 'Classical Ayurvedic Medicine',
    intendedUse: 'Digestive motility regulation, bowel health, mild laxative and tridoshic balancing (Deepana-Pachana)',
    ingredients: 'Terminalia chebula (Haritaki) 1 part, Terminalia bellirica (Bibhitaki) 1 part, Emblica officinalis (Amalaki) 1 part',
    dosageForm: 'Churna (Micronized Herbal Powder)',
    confidence: 'High',
    targetMarket: 'India',
    language: 'en',
    ipStatus: 'Section 3(p) TK Bar (Non-Patentable)',
    absStatus: 'SBB Prior Intimation Required (Sec 7 BDA)',
    humanReviewStatus: 'Analysis Completed',
    followsClassicalText: 'yes_fully',
    classicalTextName: 'Charaka Samhita, Chikitsa Sthana & Ayurvedic Formulary of India (AFI Part I)',
    claimsMade: 'Authoritative classical rasayana formulation for digestive health and anti-constipation support',
    input: {
      productName: 'Triphala Churna (Classical AFI)',
      intendedUse: 'Digestive motility regulation, bowel health, mild laxative and tridoshic balancing (Deepana-Pachana)',
      ingredients: 'Terminalia chebula (Haritaki) 1 part, Terminalia bellirica (Bibhitaki) 1 part, Emblica officinalis (Amalaki) 1 part',
      dosageForm: 'Churna (Micronized Herbal Powder)',
      followsClassicalText: 'yes_fully',
      classicalTextName: 'Charaka Samhita, Chikitsa Sthana & Ayurvedic Formulary of India (AFI Part I)',
      targetMarket: 'India',
      claimsMade: 'Authoritative classical rasayana formulation for digestive health and anti-constipation support',
      sourceOfIngredients: 'Cultivated biological resources from certified cultivators in Madhya Pradesh',
      formulationMethod: 'Traditional Bhavana and fine pulverization through 80-mesh sieve conforming to Ayurvedic Pharmacopoeia of India (API)'
    },
    result: {
      category: 'Classical Ayurvedic Medicine',
      confidence: 'High',
      classificationFactors: [
        'Strictly complies with the classical recipe recorded in the Ayurvedic Formulary of India (AFI Part I) and Charaka Samhita.',
        'No synthetic active pharmaceutical ingredients, modern additives, or chemical excipients.',
        'Meets statutory criteria under Section 3(a) of the Drugs and Cosmetics Act, 1940.'
      ],
      regulatoryFramework: [
        'Requires SLA Manufacturing License on Form 25D under the Drugs & Cosmetics Rules, 1945.',
        'Schedule T Good Manufacturing Practices (GMP) compliance mandatory.',
        'Exempted from clinical trial / safety-efficacy data submission under Rule 158B.'
      ],
      ipImplications: [
        'Barred from patent protection in India under Section 3(p) of the Patents Act, 1970 (Traditional Knowledge exclusion).',
        'Prior art documented in Traditional Knowledge Digital Library (TKDL) and Ayurvedic treatises.',
        'Trademark protection available for distinctive proprietary brand identifiers.'
      ],
      absRelevance: [
        'Commercial utilization of biological resources sourced within India triggers the Biological Diversity Act, 2002.',
        'Indian citizens and domestic companies require prior intimation to State Biodiversity Board (SBB).',
        'National Biodiversity Authority (NBA) approval not required if 100% Indian-held equity.'
      ],
      missingInformation: [],
      citations: [
        {
          documentId: 'dca_1940',
          source: 'Drugs & Cosmetics Act, 1940',
          section: 'Section 3(a)',
          heading: 'Definition of Ayurvedic, Siddha or Unani Drug',
          authority: 'CDSCO / State Licensing Authority'
        },
        {
          documentId: 'patents_act_1970',
          source: 'Indian Patents Act, 1970',
          section: 'Section 3(p)',
          heading: 'Inventions which in effect are Traditional Knowledge not patentable',
          authority: 'Indian Patent Office (CGPDTM)'
        },
        {
          documentId: 'bda_2002',
          source: 'Biological Diversity Act, 2002',
          section: 'Section 7',
          heading: 'Prior intimation to State Biodiversity Board for commercial utilization',
          authority: 'National Biodiversity Authority (NBA)'
        }
      ]
    }
  },
  {
    id: 'seed-jointcalm-herbogel',
    caseId: 'CASE-20260925-JNT002',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    productName: 'JointCalm Herbogel (Proprietary Nano-Vehicle)',
    category: 'Patent / Proprietary Ayurvedic Medicine',
    intendedUse: 'Targeted topical relief for arthritic joint pain, inflammatory swelling, and muscular stiffness',
    ingredients: 'Standardized Shallaki extract (Boswellia serrata, 65% Boswellic acids), Gandhapura Taila (Gaultheria procumbens), Pudina Satva (Mentha arvensis), encapsulated in lipid nanoparticle emulgel base',
    dosageForm: 'Topical Emulgel / Nano-Suspension',
    confidence: 'High',
    targetMarket: 'India and Export (USA / EU)',
    language: 'en',
    ipStatus: 'Patentable Delivery Matrix (Section 3(e) Synergism)',
    absStatus: 'Wild-harvest BDA compliance (0.1%-0.5% Benefit Sharing)',
    humanReviewStatus: 'Dossier Generated',
    followsClassicalText: 'partially',
    classicalTextName: 'Bhavaprakasha Nighantu (for Shallaki and Gandhapura herbs)',
    claimsMade: 'Rapid transdermal penetration with sustained localized anti-inflammatory action',
    input: {
      productName: 'JointCalm Herbogel (Proprietary Nano-Vehicle)',
      intendedUse: 'Targeted topical relief for arthritic joint pain, inflammatory swelling, and muscular stiffness',
      ingredients: 'Standardized Shallaki extract (Boswellia serrata, 65% Boswellic acids), Gandhapura Taila (Gaultheria procumbens), Pudina Satva (Mentha arvensis), encapsulated in lipid nanoparticle emulgel base',
      dosageForm: 'Topical Emulgel / Nano-Suspension',
      followsClassicalText: 'partially',
      classicalTextName: 'Bhavaprakasha Nighantu (for Shallaki and Gandhapura herbs)',
      targetMarket: 'India and Export (USA / EU)',
      claimsMade: 'Rapid transdermal penetration with sustained localized anti-inflammatory action',
      sourceOfIngredients: 'Sustainably wild-harvested oleo-gum-resin from forest produce cooperatives in Rajasthan',
      formulationMethod: 'Supercritical fluid extraction followed by high-pressure homogenization into biocompatible carbomer lipid carrier'
    },
    result: {
      category: 'Patent / Proprietary Ayurvedic Medicine',
      confidence: 'High',
      classificationFactors: [
        'Formulated with recognized Ayurvedic pharmacopoeial plant extracts alongside a novel lipid nanocarrier delivery matrix.',
        'Not described in classical authoritative treatises in this exact composition or delivery mode.',
        'Classified as Patent or Proprietary Ayurvedic Medicine under Section 3(h) of Drugs & Cosmetics Act, 1940.'
      ],
      regulatoryFramework: [
        'Requires SLA Proprietary Ayush Drug License under Rule 158B of Drugs & Cosmetics Rules.',
        'Published literature or pilot safety/efficacy validation data mandatory for approval.',
        'Manufacturing premises must be certified under Schedule T Good Manufacturing Practices (GMP).'
      ],
      ipImplications: [
        'The novel lipid nano-delivery system and synergistic extraction process are potentially patentable under Indian Patents Act, 1970 (Section 3(e) synergistic efficacy and Section 48 product claims).',
        'Must establish non-obvious inventive step overcoming Section 3(p) prior art objection.',
        'Design patent protection viable for specialized ergonomic applicator dispenser.'
      ],
      absRelevance: [
        'Access to wild Boswellia serrata biological resources necessitates compliance with Biological Diversity Act, 2002.',
        'Benefit sharing levy applies (0.1% to 0.5% ex-factory sale price) payable to State Biodiversity Board.'
      ],
      missingInformation: [],
      citations: [
        {
          documentId: 'dca_1940',
          source: 'Drugs & Cosmetics Act, 1940',
          section: 'Section 3(h)',
          heading: 'Patent or Proprietary Medicine definition for Ayush systems',
          authority: 'State Licensing Authority'
        },
        {
          documentId: 'dc_rules_1945',
          source: 'Drugs & Cosmetics Rules, 1945',
          section: 'Rule 158B',
          heading: 'Guidelines for grant of license of patent or proprietary Ayurvedic medicines',
          authority: 'State Licensing Authority (SLA)'
        },
        {
          documentId: 'patents_act_1970',
          source: 'Indian Patents Act, 1970',
          section: 'Section 3(e)',
          heading: 'Substance obtained by a mere admixture vs synergistic composition',
          authority: 'Indian Patent Office'
        }
      ]
    }
  },
  {
    id: 'seed-amrit-rasayana',
    caseId: 'CASE-20260925-AMR003',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    productName: 'Amrit Rasayana Immunity Granules',
    category: 'Ayurveda Aahar',
    intendedUse: 'Daily wellness dietary supplement for general vitality, stamina, and oxidative stress defense',
    ingredients: 'Amalaki (Emblica officinalis), Ashwagandha (Withania somnifera), Pippali, Elaichi, Jaggery (Guda), Cow Ghee (Ghrita)',
    dosageForm: 'Sweetened Granules / Lehya Premix',
    confidence: 'High',
    targetMarket: 'India',
    language: 'en',
    ipStatus: 'Trademark & Packaging Trade Dress Eligible',
    absStatus: 'Sec 40 BDA Commodity Exemption Applicable',
    humanReviewStatus: 'Analysis Completed',
    followsClassicalText: 'yes_fully',
    classicalTextName: 'Ashtanga Hridaya (Uttara Sthana) & Ayurveda Aahar Schedule A',
    claimsMade: 'Nutritional food supplement for general health, energy, and nourishment (Ojas vardhana)',
    input: {
      productName: 'Amrit Rasayana Immunity Granules',
      intendedUse: 'Daily wellness dietary supplement for general vitality, stamina, and oxidative stress defense',
      ingredients: 'Amalaki (Emblica officinalis), Ashwagandha (Withania somnifera), Pippali, Elaichi, Jaggery (Guda), Cow Ghee (Ghrita)',
      dosageForm: 'Sweetened Granules / Lehya Premix',
      followsClassicalText: 'yes_fully',
      classicalTextName: 'Ashtanga Hridaya (Uttara Sthana) & Ayurveda Aahar Schedule A',
      targetMarket: 'India',
      claimsMade: 'Nutritional food supplement for general health, energy, and nourishment (Ojas vardhana)',
      sourceOfIngredients: 'Direct farm sourcing with organic certification from certified growers in Maharashtra'
    },
    result: {
      category: 'Ayurveda Aahar',
      confidence: 'High',
      classificationFactors: [
        'Formulated exclusively with authoritative recipes specified in Schedule A of the Food Safety and Standards (Ayurveda Aahar) Regulations, 2022.',
        'Targeted exclusively as food/dietary wellness without claiming disease cure or treatment.',
        'Exempt from D&C Act drug licensing; governed by FSSAI.'
      ],
      regulatoryFramework: [
        'Requires FSSAI Central License under Ayurveda Aahar category.',
        'Mandatory Ayurveda Aahar Logo on primary packaging as per FSSAI guidelines.',
        'Must display mandatory statutory warning: "FOR DIETARY USE ONLY - NOT FOR MEDICINAL USE".'
      ],
      ipImplications: [
        'Traditional food formulation excluded from patentability under Section 3(p) and 3(j).',
        'Trade dress, branding, and packaging can be protected via Trademarks and Copyrights.'
      ],
      absRelevance: [
        'Exempted from Section 3 and Section 7 of Biological Diversity Act if biological resources are traded as commodities under Section 40 notification.'
      ],
      missingInformation: [],
      citations: [
        {
          documentId: 'fssai_aahar_2022',
          source: 'Food Safety and Standards (Ayurveda Aahar) Regulations, 2022',
          section: 'Regulation 3 & Schedule A',
          heading: 'Definition, Scope and Permitted Classical Formulations for Ayurveda Aahar',
          authority: 'Food Safety and Standards Authority of India (FSSAI)'
        }
      ]
    }
  }
];

export function getStoredAnalysisHistory(): AnalysisHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Clean any previously seeded sample cases
      const cleaned = parsed.filter((item: any) => !item.id?.startsWith('seed-'));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return [];
  } catch (err) {
    console.error('Failed to read analysis history from localStorage:', err);
    return [];
  }
}

export function saveAnalysisToHistory(
  input: ProductAnalysisInput,
  result: ProductAnalysisResult,
  extra?: {
    caseId?: string;
    language?: string;
    ipStatus?: string;
    absStatus?: string;
    humanReviewStatus?: string;
    dossier?: any;
  }
): AnalysisHistoryItem {
  const currentLang = typeof window !== 'undefined' ? (localStorage.getItem('lang') || 'en') : 'en';
  const generatedCaseId = extra?.caseId || result.caseId || `CASE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Infer real IP Status summary
  const patentCat = result.ipProtectionAnalysis?.ipCategories?.find((c) => c.category === 'Patent');
  const ipStatus = extra?.ipStatus || (patentCat ? `${patentCat.status} (${patentCat.category})` : (result.ipImplications?.[0] || 'Evaluated'));

  // Infer real ABS Status summary
  const absStatus = extra?.absStatus || (result.absRelevance?.[0] || (result.category === 'Classical Ayurvedic Medicine' ? 'SBB Prior Intimation' : 'Analyzed'));

  const newItem: AnalysisHistoryItem = {
    id: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    caseId: generatedCaseId,
    timestamp: new Date().toISOString(),
    productName: input.productName || result.productDetailsSummary?.productName || 'Analyzed Formulation',
    category: result.category,
    intendedUse: input.intendedUse || result.productDetailsSummary?.intendedUse || '',
    ingredients: input.ingredients || '',
    dosageForm: input.dosageForm || result.productDetailsSummary?.dosageForm || 'Unspecified Form',
    confidence: result.confidence,
    targetMarket: input.targetMarket || result.productDetailsSummary?.targetMarket || 'India',
    language: extra?.language || currentLang,
    ipStatus,
    absStatus,
    humanReviewStatus: extra?.humanReviewStatus || 'Analysis Completed',
    followsClassicalText: input.followsClassicalText,
    classicalTextName: input.classicalTextName,
    claimsMade: input.claimsMade,
    input,
    result,
    dossier: extra?.dossier
  };

  try {
    const current = getStoredAnalysisHistory();
    // Prepend new item
    const updated = [newItem, ...current.filter((item) => item.productName.toLowerCase() !== newItem.productName.toLowerCase())];
    // Keep max 25 items
    const trimmed = updated.slice(0, 25);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save analysis to history:', err);
  }

  return newItem;
}

export function deleteAnalysisFromHistory(id: string): AnalysisHistoryItem[] {
  try {
    const current = getStoredAnalysisHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete analysis item:', err);
    return [];
  }
}

export function clearAllAnalysisHistory(): AnalysisHistoryItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear analysis history:', err);
  }
  return [];
}

export function resetAnalysisHistoryToDefaults(): AnalysisHistoryItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset analysis history:', err);
  }
  return [];
}
