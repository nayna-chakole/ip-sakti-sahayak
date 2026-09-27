import React, { useState, useEffect } from 'react';
import {
  ProductAnalysisInput,
  ProductAnalysisResult,
  IPProtectionAnalysisResult,
  ComplianceAnalysisResult,
  api
} from '../api/client.js';
import { IPProtectionAnalysisCard } from './IPProtectionAnalysisCard.js';
import { ABSRegulatoryComplianceCard } from './ABSRegulatoryComplianceCard.js';
import { CaseDossierModal } from './CaseDossierModal.js';
import { FacilitatorModal } from './FacilitatorModal.js';
import { CaseDossier, FacilitatorReviewTicket } from '../types/analysis.js';
import { useAuth } from '../context/AuthContext.js';
import { ConfidenceBadge } from './ConfidenceBadge.js';
import { LoginRequiredModal } from './LoginRequiredModal.js';
import { useTranslation } from '../i18n/index.js';
import { exportCaseDossierToPdf } from '../utils/pdfExport.js';
import {
  translateCategory,
  translateActName,
  translateSection,
  translateStatutoryText
} from '../utils/statutoryTranslation.js';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  FileText,
  CheckCircle2,
  Layers,
  Scale,
  RotateCcw,
  ExternalLink,
  BookOpen,
  UserCheck,
  Tag,
  Globe2,
  ArrowRight,
  History,
  Lock,
  LogIn,
  Download,
  Clock
} from 'lucide-react';

interface ProductAnalysisModuleProps {
  onClassificationComplete?: (result: ProductAnalysisResult) => void;
  onOpenFacilitator?: () => void;
  onOpenKnowledgeBase?: () => void;
  onContinueToABS?: () => void;
  onContinueToLegalGuidance?: (result: ProductAnalysisResult) => void;
  currentJurisdiction?: 'India' | 'International';
  loadedInput?: ProductAnalysisInput | null;
  loadedResult?: ProductAnalysisResult | null;
  onSaveHistory?: (input: ProductAnalysisInput, result: ProductAnalysisResult) => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

interface FormFieldErrors {
  productName?: string;
  intendedUse?: string;
  ingredients?: string;
  dosageForm?: string;
  followsClassicalText?: string;
  targetMarket?: string;
}

export const ProductAnalysisModule: React.FC<ProductAnalysisModuleProps> = ({
  onClassificationComplete,
  onOpenFacilitator,
  onOpenKnowledgeBase,
  onContinueToABS,
  onContinueToLegalGuidance,
  currentJurisdiction = 'India',
  loadedInput,
  loadedResult,
  onSaveHistory,
  onOpenHistory,
  historyCount,
  onOpenAuth
}) => {
  const { t, lang } = useTranslation();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [formData, setFormData] = useState<ProductAnalysisInput>({
    productName: '',
    intendedUse: '',
    ingredients: '',
    dosageForm: '',
    followsClassicalText: 'no',
    classicalTextName: '',
    targetMarket: currentJurisdiction === 'International' ? 'International' : 'India',
    claimsMade: '',
    sourceOfIngredients: '',
    formulationMethod: '',
    manufacturingDetails: ''
  });

  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProductAnalysisResult | null>(null);
  const [ipAnalysisData, setIpAnalysisData] = useState<IPProtectionAnalysisResult | null>(null);
  const [isLoadingIp, setIsLoadingIp] = useState(false);
  const [ipError, setIpError] = useState<string | null>(null);

  // ABS & Regulatory Compliance Analysis State
  const [complianceData, setComplianceData] = useState<ComplianceAnalysisResult | null>(null);
  const [isLoadingCompliance, setIsLoadingCompliance] = useState(false);
  const [complianceError, setComplianceError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoadedFromHistory, setIsLoadedFromHistory] = useState(false);

  // Final Case Dossier & Human Facilitator Review State
  const [activeCaseId, setActiveCaseId] = useState<string>(
    () => `CASE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  );
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isFacilitatorModalOpen, setIsFacilitatorModalOpen] = useState(false);
  const [currentCaseDossier, setCurrentCaseDossier] = useState<CaseDossier | null>(null);
  const [isLoadingDossier, setIsLoadingDossier] = useState(false);
  const [reviewTicket, setReviewTicket] = useState<FacilitatorReviewTicket | null>(null);

  const ensureCaseDossier = async (): Promise<CaseDossier | null> => {
    if (!analysisResult) return null;
    if (currentCaseDossier && currentCaseDossier.language === lang && currentCaseDossier.caseId === activeCaseId) {
      return currentCaseDossier;
    }
    setIsLoadingDossier(true);
    try {
      const res = await api.dossier.create({
        caseId: activeCaseId,
        language: lang,
        jurisdiction: currentJurisdiction,
        productContext: {
          productName: formData.productName || analysisResult.productDetailsSummary?.productName || 'Ayurvedic Formulation',
          ingredients: formData.ingredients,
          intendedUse: formData.intendedUse,
          dosageForm: formData.dosageForm,
          followsClassicalText: formData.followsClassicalText,
          classicalTextName: formData.classicalTextName,
          targetMarket: formData.targetMarket || currentJurisdiction,
          sourceOfIngredients: formData.sourceOfIngredients,
          claimsMade: formData.claimsMade,
          formulationMethod: formData.formulationMethod,
          manufacturingDetails: formData.manufacturingDetails
        },
        classification: analysisResult,
        ipProtectionAnalysis: ipAnalysisData || analysisResult.ipProtectionAnalysis,
        complianceAnalysis: complianceData,
        citations: analysisResult.citations || [],
        applicant: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          : undefined
      });
      if (res && res.dossier) {
        setCurrentCaseDossier(res.dossier);
        return res.dossier;
      }
      return null;
    } catch (err) {
      console.error('Failed to create case dossier via API:', err);
      // Construct clean structured object strictly from existing results (non-blocking fallback)
      const fallbackDossier: CaseDossier = {
        caseId: activeCaseId,
        title: `Statutory Case Dossier — ${formData.productName || 'Ayurvedic Formulation'}`,
        statusLabel: 'Preliminary Statutory Decision Support Dossier',
        timestamp: new Date().toISOString(),
        language: lang,
        jurisdiction: currentJurisdiction,
        applicant: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : undefined,
        productInformation: {
          productName: formData.productName || 'Ayurvedic Formulation',
          ingredients: formData.ingredients || 'Not specified',
          intendedUse: formData.intendedUse || 'Not specified',
          dosageForm: formData.dosageForm || 'Not specified',
          followsClassicalText: formData.followsClassicalText || 'Unspecified',
          targetMarket: formData.targetMarket || currentJurisdiction,
          sourceOfIngredients: formData.sourceOfIngredients,
          claimsMade: formData.claimsMade
        },
        classification: {
          category: analysisResult.category,
          confidence: analysisResult.confidence,
          statutoryBasis: 'Drugs and Cosmetics Act, 1940',
          regulatoryPathway: analysisResult.regulatoryFramework || [],
          reasoning: analysisResult.classificationFactors || [],
          isUnambiguous: analysisResult.confidence === 'High',
          citations: analysisResult.citations || []
        },
        ipProtectionAnalysis: {
          summary: ipAnalysisData?.summary || '',
          ipCategories: ipAnalysisData?.ipCategories || []
        },
        absRegulatoryCompliance: complianceData ? {
          summary: complianceData.summary,
          biodiversityABS: complianceData.biodiversityABS,
          nbaApproval: complianceData.nbaApproval,
          traditionalKnowledgeTKDL: complianceData.traditionalKnowledgeTKDL,
          regulatoryRequirements: complianceData.regulatoryRequirements
        } : {
          biodiversityABS: {},
          nbaApproval: {},
          traditionalKnowledgeTKDL: {},
          regulatoryRequirements: {}
        },
        ragEvidence: (analysisResult.citations || []).map((c) => ({
          document: c.document || c.source,
          section: c.section,
          heading: c.heading,
          authority: c.authority,
          textSnippet: c.textSnippet,
          sourceUrl: c.sourceUrl
        })),
        uncertaintyFlags: [],
        humanReviewStatus: 'Submitted',
        disclaimer: 'This AI-generated assessment is for legal and regulatory research and decision-support purposes only. It does not constitute legal advice, statutory clearance, regulatory approval, or a final determination. Verify applicable requirements with the relevant authority or qualified legal/regulatory professional.'
      };
      setCurrentCaseDossier(fallbackDossier);
      return fallbackDossier;
    } finally {
      setIsLoadingDossier(false);
    }
  };

  const handleOpenDossierView = async () => {
    const d = await ensureCaseDossier();
    if (d) {
      setIsDossierModalOpen(true);
    }
  };

  const handleExportDossierAction = async () => {
    const d = await ensureCaseDossier();
    if (d) {
      exportCaseDossierToPdf(d, lang);
    }
  };

  const handleOpenHumanReview = async () => {
    await ensureCaseDossier();
    setIsFacilitatorModalOpen(true);
  };

  // Requirement 4: Automatic IP analysis execution using the same product context
  const fetchIpAnalysis = async (
    resObj: ProductAnalysisResult,
    formObj: ProductAnalysisInput,
    targetLang: string
  ) => {
    setIsLoadingIp(true);
    setIpError(null);
    try {
      const jur = (currentJurisdiction === 'International' || resObj.jurisdiction === 'International' || resObj.productDetailsSummary?.targetMarket === 'International' || formObj.targetMarket === 'International')
        ? 'International'
        : (currentJurisdiction || resObj.jurisdiction || resObj.productDetailsSummary?.targetMarket || formObj.targetMarket || 'India');
      const ingredients = formObj.ingredients || (resObj.productDetailsSummary as any)?.ingredients || '';
      const followsClassical = resObj.productDetailsSummary?.followsClassicalText || formObj.followsClassicalText || 'no';

      const ipResult = await api.ip.analyze({
        productName: resObj.productDetailsSummary?.productName || formObj.productName || 'Ayurvedic Formulation',
        category: resObj.category,
        productClassification: resObj.category,
        regulatoryCategory: resObj.category,
        ingredients,
        intendedUse: resObj.productDetailsSummary?.intendedUse || formObj.intendedUse,
        dosageForm: resObj.productDetailsSummary?.dosageForm || formObj.dosageForm,
        followsClassicalText: followsClassical,
        classical_text_basis: followsClassical,
        classicalTextName: formObj.classicalTextName,
        targetMarket: jur,
        jurisdiction: jur,
        confidence: resObj.confidence,
        uncertaintyStatus: resObj.confidence === 'High' ? 'Resolved' : 'Uncertainty Flagged'
      }, jur, targetLang);

      setIpAnalysisData(ipResult);
    } catch (err: any) {
      console.warn('IP Protection Analysis fetch warning:', err);
      // Requirement 17: Do not break classification if IP analysis fails
      setIpError('IP Protection Analysis is temporarily unavailable.');
    } finally {
      setIsLoadingIp(false);
    }
  };

  // Automatic ABS & Regulatory Compliance execution using the SAME product context
  const fetchComplianceAnalysis = async (
    resObj: ProductAnalysisResult,
    formObj: ProductAnalysisInput,
    targetLang: string
  ) => {
    setIsLoadingCompliance(true);
    setComplianceError(null);
    try {
      const jur = (currentJurisdiction === 'International' || resObj.jurisdiction === 'International' || resObj.productDetailsSummary?.targetMarket === 'International' || formObj.targetMarket === 'International')
        ? 'International'
        : (currentJurisdiction || resObj.jurisdiction || resObj.productDetailsSummary?.targetMarket || formObj.targetMarket || 'India');
      const ingredients = formObj.ingredients || (resObj.productDetailsSummary as any)?.ingredients || '';
      const followsClassical = resObj.productDetailsSummary?.followsClassicalText || formObj.followsClassicalText || 'no';

      const compResult = await api.compliance.analyze({
        productName: resObj.productDetailsSummary?.productName || formObj.productName || 'Ayurvedic Formulation',
        category: resObj.category,
        productClassification: resObj.category,
        regulatoryCategory: resObj.category,
        ingredients,
        intendedUse: resObj.productDetailsSummary?.intendedUse || formObj.intendedUse,
        dosageForm: resObj.productDetailsSummary?.dosageForm || formObj.dosageForm,
        followsClassicalText: followsClassical,
        classical_text_basis: followsClassical,
        classicalTextName: formObj.classicalTextName,
        targetMarket: jur,
        jurisdiction: jur,
        confidence: resObj.confidence,
        uncertaintyStatus: resObj.confidence === 'High' ? 'Resolved' : 'Uncertainty Flagged'
      }, jur, targetLang);

      setComplianceData(compResult);
    } catch (err: any) {
      console.warn('ABS & Regulatory Compliance Analysis fetch warning:', err);
      setComplianceError('ABS & Regulatory Compliance Analysis is temporarily unavailable.');
    } finally {
      setIsLoadingCompliance(false);
    }
  };

  // Synchronize IP & Compliance Analysis when result, language, or jurisdiction changes
  useEffect(() => {
    if (analysisResult) {
      const targetJur = (currentJurisdiction === 'International' || analysisResult.jurisdiction === 'International' || formData.targetMarket === 'International') ? 'International' : 'India';

      // IP sync
      if (
        !(ipAnalysisData &&
        (ipAnalysisData as any).language === lang &&
        (ipAnalysisData as any).jurisdiction === targetJur &&
        ipAnalysisData.productName === (analysisResult.productDetailsSummary?.productName || formData.productName))
      ) {
        if (analysisResult.ipProtectionAnalysis && (analysisResult.ipProtectionAnalysis as any).language === lang && (analysisResult.ipProtectionAnalysis as any).jurisdiction === targetJur) {
          setIpAnalysisData(analysisResult.ipProtectionAnalysis);
          setIpError(null);
        } else if (!isLoadedFromHistory) {
          fetchIpAnalysis(analysisResult, formData, lang);
        }
      }

      // Compliance sync
      if (
        !(complianceData &&
        complianceData.language === lang &&
        (complianceData as any).jurisdiction === targetJur &&
        complianceData.productName === (analysisResult.productDetailsSummary?.productName || formData.productName))
      ) {
        if (analysisResult.complianceAnalysis && (analysisResult.complianceAnalysis as any).language === lang && (analysisResult.complianceAnalysis as any).jurisdiction === targetJur) {
          setComplianceData(analysisResult.complianceAnalysis);
          setComplianceError(null);
        } else if (!isLoadedFromHistory) {
          fetchComplianceAnalysis(analysisResult, formData, lang);
        }
      }
    } else {
      setIpAnalysisData(null);
      setIpError(null);
      setComplianceData(null);
      setComplianceError(null);
    }
  }, [analysisResult, lang, isLoadedFromHistory, currentJurisdiction]);

  // Synchronize when a historical submission is loaded
  useEffect(() => {
    if (loadedInput) {
      setFormData(loadedInput);
      setFieldErrors({});
      setTouched({});
      setSubmitAttempted(false);
      setError(null);
      setIsLoadedFromHistory(true);
    }
    if (loadedResult) {
      setAnalysisResult(loadedResult);
      if (loadedResult.caseId) {
        setActiveCaseId(loadedResult.caseId);
      }
      if (loadedResult.ipProtectionAnalysis) {
        setIpAnalysisData(loadedResult.ipProtectionAnalysis);
        setIpError(null);
      }
      if (loadedResult.complianceAnalysis) {
        setComplianceData(loadedResult.complianceAnalysis);
        setComplianceError(null);
      }
    }
  }, [loadedInput, loadedResult]);

  // Sync targetMarket when jurisdiction changes via Header
  useEffect(() => {
    if (currentJurisdiction && !isLoadedFromHistory) {
      setFormData((prev) => ({
        ...prev,
        targetMarket: currentJurisdiction === 'International' ? 'International' : 'India'
      }));
    }
  }, [currentJurisdiction, isLoadedFromHistory]);

  const validateField = (field: keyof FormFieldErrors, value: string): string | undefined => {
    switch (field) {
      case 'productName':
        if (!value || !value.trim()) {
          return t('productAnalysis.validation.nameRequired');
        }
        if (value.trim().length < 2) {
          return t('productAnalysis.validation.nameMin');
        }
        return undefined;

      case 'intendedUse':
        if (!value || !value.trim()) {
          return t('productAnalysis.validation.useRequired');
        }
        if (value.trim().length < 5) {
          return t('productAnalysis.validation.useMin');
        }
        return undefined;

      case 'ingredients':
        if (!value || !value.trim()) {
          return t('productAnalysis.validation.ingredientsRequired');
        }
        if (value.trim().length < 5) {
          return t('productAnalysis.validation.ingredientsMin');
        }
        return undefined;

      case 'dosageForm':
        if (!value || !value.trim()) {
          return t('productAnalysis.validation.dosageRequired');
        }
        return undefined;

      case 'followsClassicalText':
        if (!value) {
          return t('productAnalysis.validation.classicalStatusRequired');
        }
        return undefined;

      case 'targetMarket':
        if (!value) {
          return t('productAnalysis.validation.targetMarketRequired');
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const validateAll = (data: ProductAnalysisInput): FormFieldErrors => {
    const errors: FormFieldErrors = {};
    const fields: (keyof FormFieldErrors)[] = [
      'productName',
      'intendedUse',
      'ingredients',
      'dosageForm',
      'followsClassicalText',
      'targetMarket'
    ];

    for (const field of fields) {
      const err = validateField(field, data[field] || '');
      if (err) {
        errors[field] = err;
      }
    }
    return errors;
  };

  const handleInputChange = (field: keyof ProductAnalysisInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Revalidate on change if touched or submit already attempted
    if (touched[field] || submitAttempted) {
      const err = validateField(field as keyof FormFieldErrors, value);
      setFieldErrors((prev) => ({
        ...prev,
        [field]: err
      }));
    }
  };

  const handleBlur = (field: keyof FormFieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field] || '');
    setFieldErrors((prev) => ({
      ...prev,
      [field]: err
    }));
  };

  const handleLoadSample = (sampleType: 'classical' | 'proprietary' | 'aahar' | 'phytopharmaceutical' | 'cosmetic') => {
    const activeMarket = currentJurisdiction === 'International' ? 'International' : 'India';
    switch (sampleType) {
      case 'classical':
        setFormData({
          productName: 'Triphala Churna',
          intendedUse: 'Digestive regulation, mild laxative, bowel motility balancing (Deepana-Pachana)',
          ingredients: 'Terminalia chebula (Haritaki) 1 part, Terminalia bellirica (Bibhitaki) 1 part, Emblica officinalis (Amalaki) 1 part',
          dosageForm: 'Churna (Coarse/Fine Herbal Powder)',
          followsClassicalText: 'yes_fully',
          classicalTextName: 'Charaka Samhita (Chikitsa Sthana) & Ayurvedic Formulary of India (AFI Part I)',
          targetMarket: activeMarket,
          claimsMade: 'Classical prior art digestive aid as per authoritative Ayurvedic Samhitas',
          sourceOfIngredients: 'Cultivated and sustainably collected Indian botanical resources',
          formulationMethod: 'Traditional drying, pulverization, sifting through 80-mesh sieve (Schedule T GMP)',
          manufacturingDetails: 'Licensed Ayurvedic Pharmacy conforming to Schedule T GMP'
        });
        break;

      case 'proprietary':
        setFormData({
          productName: 'JointCalm Herbogel',
          intendedUse: 'Relief of joint stiffness, muscle aches, and musculoskeletal inflammation',
          ingredients: 'Shallaki extract (Boswellia serrata 65% Boswellic acids) 5%, Nirgundi oil (Vitex negundo) 10%, Gandhapura oil (Gaultheria fragrantissima) 8%, Gel base q.s.',
          dosageForm: 'Topical Emulgel',
          followsClassicalText: 'no',
          classicalTextName: '',
          targetMarket: activeMarket,
          claimsMade: 'Synergistic relief of joint swelling and pain through multi-herbal penetrative gel base',
          sourceOfIngredients: 'Commercial extract supplier with certified Certificate of Analysis (CoA)',
          formulationMethod: 'Proprietary aqueous-alcoholic hydrogel micro-emulsification technology',
          manufacturingDetails: 'Ayurvedic proprietary license from State Licensing Authority (Form 25D)'
        });
        break;

      case 'aahar':
        setFormData({
          productName: 'Amrit Rasayana Granules',
          intendedUse: 'Daily nutritional health supplement, rasayana nourishment, antioxidant stamina support',
          ingredients: 'Emblica officinalis (Amla fruit pulp), Desmodium gangeticum (Shalaparni), Cow Ghee, Wild Honey, Raw Cane Sugar (Khanda)',
          dosageForm: 'Granules / Avaleha Paste',
          followsClassicalText: 'partially',
          classicalTextName: 'Ashtanga Hridaya (Rasayana Adhyaya) formulation concept adapted for dietary use',
          targetMarket: activeMarket,
          claimsMade: 'General dietary health supplement; strictly no disease treatment or medical cure claims',
          sourceOfIngredients: 'Organic certified Indian farms',
          formulationMethod: 'Slow thermal cooking in ghee-honey base per Schedule T & FSSAI Schedule IV',
          manufacturingDetails: 'FSSAI Ayurveda Aahar License under Food Safety and Standards Regulations 2022'
        });
        break;

      case 'phytopharmaceutical':
        setFormData({
          productName: 'Phyto-Curcum 500mg',
          intendedUse: 'Adjuvant anti-inflammatory therapy in rheumatoid arthritis with documented clinical trial phase II data',
          ingredients: 'Standardized purified fraction of Curcuma longa rhizome containing 95% total Curcuminoids (Curcumin, Demethoxycurcumin, Bisdemethoxycurcumin)',
          dosageForm: 'Standardized Film-Coated Tablet',
          followsClassicalText: 'no',
          classicalTextName: '',
          targetMarket: activeMarket,
          claimsMade: 'Clinically validated reduction in serum TNF-alpha and inflammatory CRP biomarkers',
          sourceOfIngredients: 'Supercritical CO2 extracted and column-chromatography purified fraction',
          formulationMethod: 'Purified botanical fraction prepared under Schedule Y / New Drugs Rules 2019 guidelines',
          manufacturingDetails: 'CDSCO Form 44 / New Drug Approval clinical dossier filing with DCGI'
        });
        break;

      case 'cosmetic':
        setFormData({
          productName: 'Kumkumadi Radiance Face Elixir',
          intendedUse: 'Skin brightening, evening complexion tone, cosmetic topical moisturizing',
          ingredients: 'Crocus sativus (Keshara/Saffron) stigma, Pterocarpus santalinus (Raktachandana), Ficus benghalensis, Sesame oil (Tila taila)',
          dosageForm: 'Cosmetic Facial Serum Oil',
          followsClassicalText: 'partially',
          classicalTextName: 'Bhavaprakasha Nighantu (Taila Varga) cosmetic recipe',
          targetMarket: activeMarket === 'International' ? 'International' : 'Both',
          claimsMade: 'Cosmetic enhancement of natural skin radiance and barrier moisturization',
          sourceOfIngredients: 'Cultivated Ayurvedic herbs from contracted domestic farms',
          formulationMethod: 'Murchhita sesame oil processing with decoction and herbal paste (Taila paka)',
          manufacturingDetails: 'Cosmetic manufacturing license under Drugs & Cosmetics Rules (Part XIII/Schedule M-II)'
        });
        break;
    }

    setFieldErrors({});
    setTouched({});
    setSubmitAttempted(false);
    setError(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce authentication requirement for product analysis
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setSubmitAttempted(true);

    // Mark all required fields as touched
    setTouched({
      productName: true,
      intendedUse: true,
      ingredients: true,
      dosageForm: true,
      followsClassicalText: true,
      targetMarket: true
    });

    const errors = validateAll(formData);
    setFieldErrors(errors);

    const errorKeys = Object.keys(errors) as (keyof FormFieldErrors)[];
    if (errorKeys.length > 0) {
      setError(t('productAnalysis.validation.summaryError', { count: errorKeys.length }));

      // Focus the first invalid field for seamless keyboard and screen-reader accessibility
      const fieldIdMap: Record<keyof FormFieldErrors, string> = {
        productName: 'product-name-input',
        intendedUse: 'product-intended-use-input',
        ingredients: 'product-ingredients-input',
        dosageForm: 'product-dosage-form-input',
        followsClassicalText: 'product-classical-status-select',
        targetMarket: 'product-target-market-select'
      };

      for (const key of errorKeys) {
        const targetId = fieldIdMap[key];
        if (targetId) {
          const el = document.getElementById(targetId);
          if (el) {
            el.focus();
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          break;
        }
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const activeJur = (currentJurisdiction === 'International' || formData.targetMarket === 'International')
        ? 'International'
        : (currentJurisdiction || formData.targetMarket || 'India');
      const result = await api.product.analyze({
        ...formData,
        jurisdiction: activeJur,
        targetMarket: activeJur
      });
      setAnalysisResult(result);
      setIsLoadedFromHistory(false);

      // Requirement 4: Automatic IP analysis execution using the same product context
      if (result.ipProtectionAnalysis && result.ipProtectionAnalysis.language === lang && (result.ipProtectionAnalysis as any).jurisdiction === activeJur) {
        setIpAnalysisData(result.ipProtectionAnalysis);
        setIpError(null);
      } else {
        fetchIpAnalysis(result, formData, lang);
      }

      if (result.complianceAnalysis && result.complianceAnalysis.language === lang && (result.complianceAnalysis as any).jurisdiction === activeJur) {
        setComplianceData(result.complianceAnalysis);
        setComplianceError(null);
      } else {
        fetchComplianceAnalysis(result, formData, lang);
      }

      if (onClassificationComplete) {
        onClassificationComplete(result);
      }
      if (onSaveHistory && user) {
        onSaveHistory(formData, result);
      }
    } catch (err: any) {
      console.error('Product analysis request failed:', err);
      setError(err?.message || 'Failed to analyze product. Please verify the inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      productName: '',
      intendedUse: '',
      ingredients: '',
      dosageForm: '',
      followsClassicalText: 'no',
      classicalTextName: '',
      targetMarket: currentJurisdiction === 'International' ? 'International' : 'India',
      claimsMade: '',
      sourceOfIngredients: '',
      formulationMethod: '',
      manufacturingDetails: ''
    });
    setAnalysisResult(null);
    setFieldErrors({});
    setTouched({});
    setSubmitAttempted(false);
    setError(null);
    setIsLoadedFromHistory(false);
  };

  const getInputClassName = (field: keyof FormFieldErrors, baseClasses: string = '') => {
    const hasError = (touched[field] || submitAttempted) && !!fieldErrors[field];
    const isSuccess = (touched[field] || submitAttempted) && !fieldErrors[field] && !!formData[field]?.trim();

    if (hasError) {
      return `${baseClasses} border-red-500 bg-red-50/20 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-200`;
    }
    if (isSuccess) {
      return `${baseClasses} border-emerald-400 bg-emerald-50/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`;
    }
    return `${baseClasses} border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500`;
  };

  // Determine if evidence is insufficient or requires human review
  const isEvidenceInsufficient =
    analysisResult &&
    (analysisResult.confidence === 'Low' ||
      (analysisResult.missingInformation && analysisResult.missingInformation.length > 0) ||
      (analysisResult.questionsForUser && analysisResult.questionsForUser.length > 0));

  return (
    <div className="space-y-6">
      {/* Module Title & Quick Presets */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-amber-500/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {t('productAnalysis.title')}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="self-start sm:self-auto text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('productAnalysis.resetBtn')}</span>
            </button>
          </div>
        </div>

        {/* History Loaded Indicator Banner */}
        {isLoadedFromHistory && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-extrabold">Loaded from Analysis History: </span>
                <span>Reviewing past submission for <strong>{formData.productName}</strong> {analysisResult?.category ? `(${analysisResult.category})` : ''}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] underline text-amber-800 hover:text-amber-950 font-bold cursor-pointer self-start sm:self-auto"
            >
              Clear & Start New Formulation
            </button>
          </div>
        )}

        {/* Quick sample testing prefill helper */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
          <span className="text-slate-500 text-xs font-semibold mr-1 flex items-center space-x-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('productAnalysis.quickPresets')}</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 sm:flex-wrap -mx-1 px-1">
            <button
              type="button"
              onClick={() => handleLoadSample('classical')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-medium text-xs whitespace-nowrap transition cursor-pointer shrink-0"
            >
              {t('productAnalysis.presetClassical')}
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('proprietary')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-medium text-xs whitespace-nowrap transition cursor-pointer shrink-0"
            >
              {t('productAnalysis.presetProprietary')}
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('aahar')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-medium text-xs whitespace-nowrap transition cursor-pointer shrink-0"
            >
              {t('productAnalysis.presetAahar')}
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('phytopharmaceutical')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-medium text-xs whitespace-nowrap transition cursor-pointer shrink-0"
            >
              {t('productAnalysis.presetPhyto')}
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('cosmetic')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-medium text-xs whitespace-nowrap transition cursor-pointer shrink-0"
            >
              {t('productAnalysis.presetCosmetic')}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Input Form with all requested fields */}
      <form onSubmit={handleAnalyze} noValidate className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t('productAnalysis.formHeader')}
          </span>
        </div>

        {/* 1. Product / Formulation Name */}
        <div className="space-y-1">
          <label htmlFor="product-name-input" className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>
              {t('productAnalysis.nameLabel')} <span className="text-red-500">*</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">{t('productAnalysis.nameSub')}</span>
          </label>
          <input
            id="product-name-input"
            type="text"
            value={formData.productName}
            onChange={(e) => handleInputChange('productName', e.target.value)}
            onBlur={() => handleBlur('productName')}
            placeholder={t('productAnalysis.namePlaceholder')}
            className={getInputClassName('productName', 'w-full text-xs sm:text-sm p-2.5 rounded-xl border focus:outline-none transition-colors')}
            aria-invalid={(touched.productName || submitAttempted) && !!fieldErrors.productName}
          />
          {(touched.productName || submitAttempted) && fieldErrors.productName && (
            <p className="text-[11px] font-semibold text-red-600 flex items-center space-x-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{fieldErrors.productName}</span>
            </p>
          )}
        </div>

        {/* 2. Intended Use */}
        <div className="space-y-1">
          <label htmlFor="product-intended-use-input" className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>
              {t('productAnalysis.useLabel')} <span className="text-red-500">*</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">{t('productAnalysis.useSub')}</span>
          </label>
          <input
            id="product-intended-use-input"
            type="text"
            value={formData.intendedUse}
            onChange={(e) => handleInputChange('intendedUse', e.target.value)}
            onBlur={() => handleBlur('intendedUse')}
            placeholder={t('productAnalysis.usePlaceholder')}
            className={getInputClassName('intendedUse', 'w-full text-xs sm:text-sm p-2.5 rounded-xl border focus:outline-none transition-colors')}
            aria-invalid={(touched.intendedUse || submitAttempted) && !!fieldErrors.intendedUse}
          />
          {(touched.intendedUse || submitAttempted) && fieldErrors.intendedUse && (
            <p className="text-[11px] font-semibold text-red-600 flex items-center space-x-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{fieldErrors.intendedUse}</span>
            </p>
          )}
        </div>

        {/* 3. Ingredients */}
        <div className="space-y-1">
          <label htmlFor="product-ingredients-input" className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>
              {t('productAnalysis.ingredientsLabel')} <span className="text-red-500">*</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">{t('productAnalysis.ingredientsSub')}</span>
          </label>
          <textarea
            id="product-ingredients-input"
            rows={2}
            value={formData.ingredients}
            onChange={(e) => handleInputChange('ingredients', e.target.value)}
            onBlur={() => handleBlur('ingredients')}
            placeholder={t('productAnalysis.ingredientsPlaceholder')}
            className={getInputClassName('ingredients', 'w-full text-xs sm:text-sm p-2.5 rounded-xl border focus:outline-none transition-colors')}
            aria-invalid={(touched.ingredients || submitAttempted) && !!fieldErrors.ingredients}
          />
          {(touched.ingredients || submitAttempted) && fieldErrors.ingredients && (
            <p className="text-[11px] font-semibold text-red-600 flex items-center space-x-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{fieldErrors.ingredients}</span>
            </p>
          )}
        </div>

        {/* Row: 4. Dosage/Form & 5. Classical-Text Status & 6. Target Market */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* 4. Dosage / Form */}
          <div className="space-y-1">
            <label htmlFor="product-dosage-form-input" className="text-xs font-bold text-slate-800 block">
              {t('productAnalysis.dosageLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              id="product-dosage-form-input"
              type="text"
              value={formData.dosageForm}
              onChange={(e) => handleInputChange('dosageForm', e.target.value)}
              onBlur={() => handleBlur('dosageForm')}
              placeholder={t('productAnalysis.dosagePlaceholder')}
              className={getInputClassName('dosageForm', 'w-full text-sm sm:text-xs p-2.5 rounded-xl border focus:outline-none transition-colors min-h-[42px]')}
              aria-invalid={(touched.dosageForm || submitAttempted) && !!fieldErrors.dosageForm}
            />
            {(touched.dosageForm || submitAttempted) && fieldErrors.dosageForm && (
              <p className="text-[11px] font-semibold text-red-600 flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                <span>{fieldErrors.dosageForm}</span>
              </p>
            )}
          </div>

          {/* 5. Classical-Text Status */}
          <div className="space-y-1">
            <label htmlFor="product-classical-status-select" className="text-xs font-bold text-slate-800 block">
              {t('productAnalysis.classicalLabel')} <span className="text-red-500">*</span>
            </label>
            <select
              id="product-classical-status-select"
              value={formData.followsClassicalText}
              onChange={(e) => handleInputChange('followsClassicalText', e.target.value)}
              onBlur={() => handleBlur('followsClassicalText')}
              className={getInputClassName('followsClassicalText', 'w-full text-sm sm:text-xs p-2.5 rounded-xl border focus:outline-none bg-white cursor-pointer transition-colors min-h-[42px]')}
            >
              <option value="yes_fully">{t('productAnalysis.classicalFully')}</option>
              <option value="partially">{t('productAnalysis.classicalPartially')}</option>
              <option value="no">{t('productAnalysis.classicalNo')}</option>
            </select>
            {(touched.followsClassicalText || submitAttempted) && fieldErrors.followsClassicalText && (
              <p className="text-[11px] font-semibold text-red-600 flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                <span>{fieldErrors.followsClassicalText}</span>
              </p>
            )}
          </div>

          {/* 6. Target Market / Jurisdiction */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label htmlFor="product-target-market-select" className="text-xs font-bold text-slate-800 block">
              {t('productAnalysis.targetMarketLabel')} <span className="text-red-500">*</span>
            </label>
            <select
              id="product-target-market-select"
              value={formData.targetMarket}
              onChange={(e) => handleInputChange('targetMarket', e.target.value)}
              onBlur={() => handleBlur('targetMarket')}
              className={getInputClassName('targetMarket', 'w-full text-sm sm:text-xs p-2.5 rounded-xl border focus:outline-none bg-white cursor-pointer transition-colors min-h-[42px]')}
            >
              <option value="India">{t('productAnalysis.marketIndia')}</option>
              <option value="International">{t('productAnalysis.marketIntl')}</option>
              <option value="Both">{t('productAnalysis.marketBoth')}</option>
            </select>
            {(touched.targetMarket || submitAttempted) && fieldErrors.targetMarket && (
              <p className="text-[11px] font-semibold text-red-600 flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                <span>{fieldErrors.targetMarket}</span>
              </p>
            )}
          </div>
        </div>

        {/* Optional Context: Classical Treatise & Claims */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-1">
          <div className="space-y-1">
            <label htmlFor="product-treatise-input" className="text-xs font-semibold text-slate-700 block">
              {t('productAnalysis.treatiseLabel')}
            </label>
            <input
              id="product-treatise-input"
              type="text"
              value={formData.classicalTextName}
              onChange={(e) => handleInputChange('classicalTextName', e.target.value)}
              placeholder={t('productAnalysis.treatisePlaceholder')}
              className="w-full text-sm sm:text-xs p-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none min-h-[42px]"
            />
            {formData.followsClassicalText === 'yes_fully' && !formData.classicalTextName?.trim() && (
              <p className="text-[10px] text-amber-700 italic flex items-center space-x-1 mt-0.5">
                <BookOpen className="w-3 h-3 shrink-0 text-amber-600" />
                <span>{t('productAnalysis.validation.classicalTreatiseWarning')}</span>
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="product-claims-input" className="text-xs font-semibold text-slate-700 block">
              {t('productAnalysis.claimsLabel')}
            </label>
            <input
              id="product-claims-input"
              type="text"
              value={formData.claimsMade}
              onChange={(e) => handleInputChange('claimsMade', e.target.value)}
              placeholder={t('productAnalysis.claimsPlaceholder')}
              className="w-full text-sm sm:text-xs p-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none min-h-[42px]"
            />
          </div>
        </div>

        {/* Error / Validation Summary Banner */}
        {error && (
          <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-xl text-xs text-red-900 space-y-1.5 shadow-xs animate-fadeIn">
            <div className="flex items-center space-x-2 font-bold text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            {submitAttempted && Object.keys(fieldErrors).length > 0 && (
              <ul className="list-disc list-inside text-[11px] text-red-700 pl-1 space-y-0.5 font-medium">
                {fieldErrors.productName && <li>{fieldErrors.productName}</li>}
                {fieldErrors.intendedUse && <li>{fieldErrors.intendedUse}</li>}
                {fieldErrors.ingredients && <li>{fieldErrors.ingredients}</li>}
                {fieldErrors.dosageForm && <li>{fieldErrors.dosageForm}</li>}
                {fieldErrors.followsClassicalText && <li>{fieldErrors.followsClassicalText}</li>}
                {fieldErrors.targetMarket && <li>{fieldErrors.targetMarket}</li>}
              </ul>
            )}
          </div>
        )}

        {/* Guest Mode Notice when unauthenticated */}
        {!user && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <p className="text-xs text-slate-700 font-medium">
                {lang === 'hi'
                  ? 'अतिथि मोड सक्रिय है। आप पूर्ण AI वर्गीकरण एवं IP विश्लेषण चला सकते हैं।'
                  : lang === 'mr'
                  ? 'अतिथी मोड सुरू आहे. तुम्ही संपूर्ण AI वर्गीकरण व IP विश्लेषण करू शकता.'
                  : 'Guest Mode active. You can run full formulation classification & IP protection analysis.'}
              </p>
            </div>
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto transition"
              >
                <LogIn className="w-3.5 h-3.5 mr-1 inline" />
                <span>{lang === 'hi' ? 'साइन इन करें' : lang === 'mr' ? 'साइन इन करा' : 'Sign In'}</span>
              </button>
            )}
          </div>
        )}

        {/* Clear "Analyze Product" Action - High visibility and clearance from floating widgets */}
        <div className="pt-4 pb-4 flex flex-col sm:flex-row sm:justify-end sm:pr-24 relative z-20">
          <button
            id="analyze-product-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto justify-center px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center space-x-2 disabled:opacity-50 transition cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>{t('productAnalysis.analyzingBtn')}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>{t('productAnalysis.analyzeBtn')}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* DEDICATED CLASSIFICATION RESULT SECTION */}
      {analysisResult && (
        <div id="classification-result-section" className="bg-white p-6 rounded-2xl border-2 border-amber-500 shadow-lg space-y-6">
          {/* Header Row: Product Category, Jurisdiction & Confidence */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  {lang === 'hi' ? 'प्रारंभिक वर्गीकरण मूल्यांकन' : lang === 'mr' ? 'प्राथमिक वर्गीकरण मूल्यांकन' : 'Preliminary Classification Assessment'}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  analysisResult.confidence === 'Low' || isEvidenceInsufficient || analysisResult.category.toLowerCase().includes('uncertain')
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : (analysisResult.confidence === 'Medium' || (analysisResult.missingInformation && analysisResult.missingInformation.length > 0))
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  {analysisResult.confidence === 'Low' || isEvidenceInsufficient || analysisResult.category.toLowerCase().includes('uncertain')
                    ? (lang === 'hi' ? 'मूल्यांकन स्थिति: अतिरिक्त सत्यापन आवश्यक' : lang === 'mr' ? 'मूल्यांकन स्थिती: अधिक पडताळणी आवश्यक' : 'Assessment Status: Further Verification Required')
                    : (analysisResult.confidence === 'Medium' || (analysisResult.missingInformation && analysisResult.missingInformation.length > 0))
                    ? (lang === 'hi' ? 'मूल्यांकन स्थिति: मानवीय समीक्षा अनुशंसित' : lang === 'mr' ? 'मूल्यांकन स्थिती: मानवी पुनरावलोकन अनुशंसित' : 'Assessment Status: Human Review Recommended')
                    : (lang === 'hi' ? 'मूल्यांकन स्थिति: कोई तात्कालिक विनियामक विरोध नहीं पाया गया' : lang === 'mr' ? 'मूल्यांकन स्थिती: कोणताही तात्काळ नियामक विरोध आढळला नाही' : 'Assessment Status: No Immediate Regulatory Conflict Identified')}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 flex items-center space-x-1">
                  <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('productAnalysis.jurisdictionText')} <strong>{analysisResult.productDetailsSummary?.targetMarket || formData.targetMarket || 'India'}</strong></span>
                </span>
              </div>

              {/* 1. Product category */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {translateCategory(analysisResult.category, lang)}
              </h3>
              <p className="text-xs text-slate-600">
                {t('productAnalysis.evaluatedFor')} <strong className="text-slate-900">{analysisResult.productDetailsSummary?.productName || formData.productName}</strong>
              </p>
            </div>

            {/* 6. Confidence Badge */}
            <div className="flex items-center space-x-2 shrink-0">
              <ConfidenceBadge confidence={analysisResult.confidence} />
            </div>
          </div>

          {/* 7. "NEEDS HUMAN REVIEW" BANNER (WHEN EVIDENCE IS INSUFFICIENT) */}
          {isEvidenceInsufficient && (
            <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>{t('productAnalysis.needsReviewTitle')}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] uppercase">
                  {t('productAnalysis.needsReviewBadge')}
                </span>
              </div>

              <p className="text-slate-700 text-xs leading-relaxed">
                {t('productAnalysis.needsReviewDesc')}
              </p>

              {analysisResult.missingInformation && analysisResult.missingInformation.length > 0 && (
                <div className="bg-white/80 p-3 rounded-lg border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-950 text-xs block">
                    {t('productAnalysis.gapsTitle')}
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs">
                    {analysisResult.missingInformation.map((item, idx) => (
                      <li key={idx}>{translateStatutoryText(item, lang)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {onOpenFacilitator && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onOpenFacilitator}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{t('productAnalysis.escalateBtn')}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Reason for Classification */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Scale className="w-4 h-4 text-blue-700" />
              <span>{t('productAnalysis.reasonTitle')}</span>
            </span>
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-2">
              {analysisResult.classificationFactors.map((factor, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs leading-relaxed text-slate-800">
                  <span className="text-blue-700 font-extrabold mt-0.5">•</span>
                  <span>{translateStatutoryText(factor, lang)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Applicable Regulatory Pathway */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>{t('productAnalysis.pathwayTitle')}</span>
            </span>
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
              {analysisResult.regulatoryFramework.map((pathway, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs leading-relaxed text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{translateStatutoryText(pathway, lang)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Retrieved Legal Evidence / Citations for Classification (from RAG) */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-slate-700" />
                <span>{t('productAnalysis.citationsTitle')}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {t('productAnalysis.citationsCount', { count: analysisResult.citations?.length || 0 })}
              </span>
            </div>

            {analysisResult.citations && analysisResult.citations.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {analysisResult.citations.map((citation, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-amber-400/80 transition space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-extrabold text-xs text-[#0F2A4A]">
                            {translateActName(citation.source, lang)}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            {translateSection(citation.section, lang)}
                          </span>
                        </div>
                        {citation.heading && (
                          <div className="text-[11px] font-semibold text-slate-700">
                            {translateStatutoryText(citation.heading, lang)}
                          </div>
                        )}
                      </div>

                      {onOpenKnowledgeBase && (
                        <button
                          type="button"
                          onClick={onOpenKnowledgeBase}
                          className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center space-x-1 shrink-0 p-1 hover:bg-amber-50 rounded cursor-pointer"
                        >
                          <span>{t('productAnalysis.viewStatute')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {citation.textSnippet && (
                      <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-amber-500/50 pl-2.5 py-0.5 bg-amber-50/20 rounded-r">
                        "{translateStatutoryText(citation.textSnippet, lang)}"
                      </p>
                    )}

                    <div className="flex items-center space-x-3 text-[10px] text-slate-600 pt-1 border-t border-slate-200/60 flex-wrap">
                      {citation.authority && (
                        <span>{t('productAnalysis.statuteAuthority')} <strong className="text-slate-700">{translateStatutoryText(citation.authority, lang)}</strong></span>
                      )}
                      {citation.effectiveDate && (
                        <span>{t('productAnalysis.statuteEffective')} <strong className="text-slate-700">{citation.effectiveDate}</strong></span>
                      )}
                      {citation.version && (
                        <span>{t('productAnalysis.statuteVersion')} <strong className="text-slate-700">{citation.version}</strong></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                No statutory citations directly retrieved for this specific formulation query.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UI POSITION: IMMEDIATELY AFTER PRODUCT CLASSIFICATION RESULT              */}
      {/* SECTION 2: PRODUCT-SPECIFIC IP PROTECTION ANALYSIS (7 STATUTORY CATEGORIES) */}
      {/* ========================================================================= */}
      {analysisResult && (
        <IPProtectionAnalysisCard
          data={ipAnalysisData || analysisResult.ipProtectionAnalysis}
          isLoading={isLoadingIp}
          error={ipError}
          onRetry={() => fetchIpAnalysis(analysisResult, formData, lang)}
          productName={analysisResult.productDetailsSummary?.productName || formData.productName}
          categoryName={analysisResult.category}
          onOpenKnowledgeBase={onOpenKnowledgeBase}
        />
      )}

      {/* ========================================================================= */}
      {/* UI POSITION: IMMEDIATELY AFTER IP PROTECTION ANALYSIS                     */}
      {/* SECTION 3: ABS & REGULATORY COMPLIANCE ANALYSIS (4 STATUTORY PILLARS)     */}
      {/* ├── Biodiversity / ABS Assessment                                         */}
      {/* ├── NBA Approval Assessment                                               */}
      {/* ├── Traditional Knowledge / TKDL Assessment                               */}
      {/* └── Product Regulatory Requirements                                       */}
      {/* ========================================================================= */}
      {analysisResult && (
        <ABSRegulatoryComplianceCard
          data={complianceData}
          isLoading={isLoadingCompliance}
          error={complianceError}
          onRetry={() => fetchComplianceAnalysis(analysisResult, formData, lang)}
          productName={analysisResult.productDetailsSummary?.productName || formData.productName}
          categoryName={analysisResult.category}
          onOpenKnowledgeBase={onOpenKnowledgeBase}
        />
      )}

      {/* Product Analysis Completed Summary & Quick Actions */}
      {analysisResult && (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{lang === 'hi' ? 'प्रारंभिक फॉर्म्युलेशन मूल्यांकन पूर्ण (निर्णय समर्थन)' : lang === 'mr' ? 'प्राथमिक फॉर्म्युलेशन मूल्यांकन पूर्ण (निर्णय सहाय्य)' : 'Preliminary Formulation Assessment Complete (Decision Support)'}</span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {lang === 'hi'
                ? 'यह प्रारंभिक विनियामक निर्णय-समर्थन मूल्यांकन है। विस्तृत विधिक एवं पेटेंट अनुसंधान हेतु सहायक चैट का उपयोग करें।'
                : lang === 'mr'
                ? 'हे प्राथमिक नियामक निर्णय-सहाय्य मूल्यांकन आहे. सविस्तर कायदेशीर व पेटंट संशोधनासाठी सहायक चॅट वापरा.'
                : 'This is a preliminary regulatory decision-support assessment. For detailed statutory queries, click the floating Sahayak Chat icon.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-legal-chatbot'));
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap"
              title="Ask questions about this analysis via the floating chatbot"
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{lang === 'hi' ? 'सहायक से पूछें' : lang === 'mr' ? 'सहायकाला विचारा' : 'Ask Sahayak Chat'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAnalysisResult(null);
                setCurrentCaseDossier(null);
                setReviewTicket(null);
                setError(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{lang === 'hi' ? 'अन्य विश्लेषण करें' : lang === 'mr' ? 'दुसरे विश्लेषण करा' : 'Analyze Another'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Requirement 5: Concise Visible Statutory Decision-Support Disclaimer */}
      {analysisResult && (
        <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-slate-700 leading-relaxed space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-amber-950 text-xs">
            <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{lang === 'hi' ? 'वैधानिक विनियामक अस्वीकरण' : lang === 'mr' ? 'वैधानिक नियामक अस्वीकरण' : 'Regulatory Decision-Support Disclaimer'}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {lang === 'hi'
              ? 'यह एआई-जनित मूल्यांकन केवल कानूनी एवं विनियामक अनुसंधान और निर्णय-समर्थन उद्देश्यों के लिए है। यह कानूनी सलाह, वैधानिक अनापत्ति, विनियामक स्वीकृति या अंतिम निर्णय नहीं है। संबंधित प्राधिकरण या योग्य कानूनी/विनियामक विशेषज्ञ के साथ लागू आवश्यकताओं का सत्यापन करें।'
              : lang === 'mr'
              ? 'हे एआय-व्युत्पन्न मूल्यांकन केवळ कायदेशीर व नियामक संशोधन आणि निर्णय-सहाय्यासाठी आहे. हा कोणताही कायदेशीर सल्ला, वैधानिक मंजुरी, नियामक मान्यता किंवा अंतिम निर्णय नाही. संबंधित प्राधिकरणाकडे किंवा पात्र कायदेशीर/नियामक तज्ज्ञांकडून लागू आवश्यकतांची खात्री करा.'
              : 'This AI-generated assessment is for legal and regulatory research and decision-support purposes only. It does not constitute legal advice, statutory clearance, regulatory approval, or a final determination. Verify applicable requirements with the relevant authority or qualified legal/regulatory professional.'}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FINAL CASE DOSSIER & HUMAN FACILITATOR REVIEW SECTION                     */}
      {/* ========================================================================= */}
      {analysisResult && (
        <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 flex-wrap">
                  <span>{t('caseDossier.sectionTitle')}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30">
                    {activeCaseId}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t('caseDossier.sectionSubtitle')}
                </p>
              </div>
            </div>

            {reviewTicket && (
              <div className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 self-start sm:self-auto shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>Ticket: <strong>{reviewTicket.reviewId}</strong> ({t('caseDossier.statusSubmitted')})</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Action 1: View Case Dossier (Single authoritative dossier viewer) */}
            <button
              type="button"
              onClick={handleOpenDossierView}
              disabled={isLoadingDossier}
              className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer text-center"
            >
              <FileText className="w-4 h-4 text-slate-950 shrink-0" />
              <span>{isLoadingDossier ? (lang === 'hi' ? 'डोजियर तैयार हो रहा है...' : lang === 'mr' ? 'डॉझियर तयार होत आहे...' : 'Building Dossier...') : t('caseDossier.viewBtn')}</span>
            </button>

            {/* Action 2: Download Report in PDF format */}
            <button
              type="button"
              onClick={handleExportDossierAction}
              disabled={isLoadingDossier}
              className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/40 shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer text-center"
              title="Download official statutory report in PDF format"
            >
              <Download className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lang === 'hi' ? 'रिपोर्ट डाउनलोड करें (PDF)' : lang === 'mr' ? 'अहवाल डाउनलोड करा (PDF)' : 'Download Report (PDF)'}</span>
            </button>

            {/* Action 3: Request Human Review */}
            <button
              type="button"
              onClick={handleOpenHumanReview}
              className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer text-center"
            >
              <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('caseDossier.requestReviewBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Case Dossier Modal */}
      <CaseDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        caseDossier={currentCaseDossier}
        onRequestHumanReview={() => {
          setIsDossierModalOpen(false);
          setIsFacilitatorModalOpen(true);
        }}
      />

      {/* Facilitator Review Request Modal */}
      <FacilitatorModal
        isOpen={isFacilitatorModalOpen}
        onClose={() => setIsFacilitatorModalOpen(false)}
        dossier={currentCaseDossier}
        onReviewSubmitted={(ticket) => {
          setReviewTicket(ticket);
        }}
      />
      {/* Modal Prompt when unauthenticated user attempts to analyze */}
      <LoginRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onNavigateLogin={() => onOpenAuth?.('login')}
        onNavigateRegister={() => onOpenAuth?.('register')}
        actionAttempted="Formulation Analysis & Classification"
      />
    </div>
  );
};
