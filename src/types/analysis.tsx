import { ClassificationResult, ProductFormData } from './product';
import { GroundedCitation, RetrievedEvidence } from './rag';
import { SupportedJurisdiction, SupportedLanguage } from './user';

export interface IPCategoryAnalysis {
  category: string;
  status: 'Eligible' | 'Caution / Barred' | 'Conditional' | 'Recommended Action';
  statutoryProvision: string;
  evidenceSnippet: string;
  keyFindings: string[];
  nextSteps: string[];
}

export interface RegulatoryCategoryAnalysis {
  regulatoryArea: string;
  jurisdiction: string;
  controllingAuthority: string;
  statutoryMandate: string;
  requirements: string[];
  complianceChecklist: string[];
}

export interface RiskItem {
  area: string;
  severity: 'High' | 'Medium' | 'Caution';
  description: string;
  statutoryRef: string;
  actionRequired: string;
}

export interface IPProtectionCategoryItem {
  category: string;
  status: 'Relevant' | 'Potentially Relevant' | 'Not Indicated' | 'Needs Human Review';
  reason: string;
  provisions: string[];
  evidence: string;
  citations: any[];
  sources: string[];
  officialLinks: { title: string; url: string }[];
}

export interface IPProtectionAnalysisResult {
  productName: string;
  classificationCategory: string;
  jurisdiction: string;
  language: string;
  summary: string;
  ipCategories: IPProtectionCategoryItem[];
  timestamp: string;
}

export interface FullProductAnalysisReport {
  productSummary: {
    productName: string;
    productDescription?: string;
    classification: string;
    jurisdiction: string;
    targetMarket: string;
    ingredientsCount: number;
    ingredients: string[];
  };
  classification: ClassificationResult;
  ipProtectionAnalysis?: IPProtectionAnalysisResult;
  ipConsiderations: IPCategoryAnalysis[];
  regulatoryConsiderations: RegulatoryCategoryAnalysis[];
  traditionalKnowledge: {
    traditionalKnowledgeInvolved: boolean;
    biologicalResourcesUsed: boolean;
    tkdlPriorArtExposure: string;
    patentsActSection3pStatus: string;
    absClearanceRequired: string;
  };
  risksAndAttentionAreas: RiskItem[];
  recommendedNextSteps: string[];
  citations: GroundedCitation[];
  groundedSynthesis: string;
  confidence: string;
  jurisdiction: SupportedJurisdiction;
  language: SupportedLanguage;
}

export interface HistoryRecord {
  id: string;
  userId: string;
  productName: string;
  classification: string;
  jurisdiction: string;
  language: string;
  createdAt: string;
  input: ProductFormData;
  result: FullProductAnalysisReport;
}

export interface CaseDossierProductInfo {
  productName: string;
  ingredients: string;
  intendedUse: string;
  dosageForm: string;
  followsClassicalText: string;
  targetMarket: string;
  sourceOfIngredients?: string;
  claimsMade?: string;
}

export interface CaseDossierClassification {
  category: string;
  confidence: 'High' | 'Medium' | 'Low' | string;
  statutoryBasis: string;
  regulatoryPathway?: string[];
  reasoning: string[];
  isUnambiguous?: boolean;
  citations?: any[];
}

export interface CaseDossierCitation {
  document: string;
  actRegulation?: string;
  section: string;
  sectionRule?: string;
  heading?: string;
  authority?: string;
  jurisdiction?: string;
  textSnippet?: string;
  relevantEvidenceSnippet?: string;
  sourceUrl?: string;
}

export interface CaseDossierUncertaintyFlag {
  dimension: string;
  type?: string;
  severity: 'High' | 'Medium' | 'Low' | string;
  message: string;
  missingItem?: string;
}

export interface CaseDossier {
  caseId: string;
  title: string;
  statusLabel: string;
  timestamp: string;
  language: string;
  jurisdiction: string;
  applicant?: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  productInformation: CaseDossierProductInfo;
  classification: CaseDossierClassification;
  ipProtectionAnalysis: {
    productName?: string;
    classificationCategory?: string;
    jurisdiction?: string;
    language?: string;
    summary?: string;
    ipCategories: IPProtectionCategoryItem[];
  };
  absRegulatoryCompliance: {
    summary?: string;
    biodiversityABS: any;
    nbaApproval: any;
    traditionalKnowledgeTKDL: any;
    regulatoryRequirements: any;
  };
  ragEvidence: CaseDossierCitation[];
  uncertaintyFlags: CaseDossierUncertaintyFlag[];
  humanReviewStatus: 'Submitted' | 'Under Human Review' | 'Review Completed' | string;
  disclaimer: string;
}

export interface FacilitatorReviewTicket {
  reviewId: string;
  caseId: string;
  status: 'Submitted' | 'Under Human Review' | 'Review Completed';
  timestamp: string;
  language: string;
  confirmationMessage: string;
  assignedCell: string;
  urgency: string;
  applicantNotes: string;
  productInformation?: CaseDossierProductInfo;
  classificationResult?: CaseDossierClassification;
  ipAnalysis?: any;
  absRegulatoryAnalysis?: any;
  ragCitations?: CaseDossierCitation[];
  uncertaintyFlags?: CaseDossierUncertaintyFlag[];
  humanReviewReasons?: string[];
  caseSummary: {
    productName?: string;
    category?: string;
    confidence?: string;
    uncertaintyFlagCount?: number;
  };
  dossierSnapshot?: any;
}

