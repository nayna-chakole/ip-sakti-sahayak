export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Researcher' | 'Ayurvedic Practitioner' | 'Manufacturer/Startup' | 'IP Professional';
  // Authorization role — controls what the user can see/do. NOT the same as `role` above.
  accessRole: 'admin' | 'expert' | 'user';
  preferredLanguage: 'en' | 'hi' | 'mr';
}

export interface StoredCitation {
  document: string;
  section: string;
  documentId?: string;
  heading?: string;
  text?: string;
  jurisdiction?: 'India' | 'International';
  version?: string;
  effectiveDate?: string;
  authority?: string;
  sourceUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: StoredCitation[];
  confidence?: 'High' | 'Medium' | 'Low';
  out_of_scope?: boolean;
  explanationDetails?: {
    classificationUsed?: string;
    jurisdictionUsed?: string;
    sourcesRetrieved?: string[];
    relevantLegalSections?: string[];
    retrievalRelevance?: string;
    confidenceReason?: string;
  };
}

export interface WizardAnswers {
  product_name?: string | null;
  ingredients?: string | null;
  is_classical_based?: 'yes_fully' | 'partially' | 'no_proprietary' | null;
  is_new_formulation?: 'yes' | 'no' | null;
  q1_intended_use: string | null;
  q2_formulation_origin: string | null;
  q3_ingredient_form: string | null;
  q4_novelty_claim: string | null;
  q5_biological_resource_source: string | null;
  q6_target_market: string | null;
}

export interface ProductAnalysisInput {
  productName: string;
  ingredients: string;
  sourceOfIngredients?: string;
  formulationMethod?: string;
  intendedUse: string;
  dosageForm?: string;
  claimsMade?: string;
  followsClassicalText?: 'yes_fully' | 'partially' | 'no';
  classicalTextName?: string;
  manufacturingDetails?: string;
  targetMarket?: string;
  jurisdiction?: 'India' | 'International';
}

export interface ABSAssessmentInput {
  biologicalResourceUsed?: string;
  scientificName?: string;
  commonName?: string;
  sourceLocation?: string;
  associatedTKInvolved?: 'yes' | 'no' | 'unspecified';
  accessedInIndia?: 'yes' | 'no' | 'unspecified';
  purposeOfAccess?: 'commercial_utilisation' | 'research' | 'bio_survey' | 'other' | 'unspecified';
  intendedUseType?: 'commercial' | 'research' | 'personal' | 'unspecified';
  entityType?: 'indian_individual' | 'indian_company_no_foreign' | 'foreign_entity_or_foreign_participation' | 'unspecified';
  commercializationStatus?: 'commercialized' | 'under_development' | 'research_only' | 'unspecified';
  targetJurisdiction?: 'India' | 'International' | 'both';
  productCategory?: string;
  productName?: string;
  ingredients?: string;
}

export type ABSStatus =
  | 'ABS_RELEVANT'
  | 'ABS_MAY_APPLY_ADDITIONAL_INFO_REQUIRED'
  | 'ABS_NOT_IDENTIFIED'
  | 'HUMAN_FACILITATOR_REVIEW_REQUIRED';

export interface ABSAssessmentResult {
  status: ABSStatus;
  statusLabel: string;
  whyFlagged: string[];
  biologicalFactors: string[];
  applicableFrameworks: string[];
  possibleAuthority: string;
  possibleProcess: string;
  requiredDocuments: string[];
  requiredActions: string[];
  nextComplianceStep: string;
  missingInformation: string[];
  questionsForUser: string[];
  citations: AuthoritativeCitation[];
  confidence: 'High' | 'Medium' | 'Low';
  requiresHumanReview: boolean;
  jurisdictionApplied: 'India' | 'International';
}

export interface AuthoritativeCitation {
  documentId?: string;
  document?: string;
  source: string;
  section: string;
  heading?: string;
  authority?: string;
  version?: string;
  effectiveDate?: string;
  sourceUrl?: string;
  relevanceScore?: number;
  relevanceNote?: string;
  textSnippet?: string;
}

export interface ProductAnalysisResult {
  id?: string;
  category: string;
  localizedCategory?: string;
  confidence: 'High' | 'Medium' | 'Low';
  classificationFactors: string[];
  regulatoryFramework: string[];
  ipImplications: string[];
  absRelevance: string[];
  missingInformation: string[];
  questionsForUser?: string[];
  citations: AuthoritativeCitation[];
  jurisdiction?: 'India' | 'International';
  productDetailsSummary?: {
    productName: string;
    intendedUse: string;
    dosageForm: string;
    targetMarket: string;
    followsClassicalText: 'yes_fully' | 'partially' | 'no';
  };
  caseId?: string;
  ipProtectionAnalysis?: IPProtectionAnalysisResult;
  complianceAnalysis?: ComplianceAnalysisResult;
  legacyResult?: ClassificationResult;
  session?: UserSession;
}

export interface IPProtectionCategoryItem {
  category: string;
  status: 'Relevant' | 'Potentially Relevant' | 'Not Indicated' | 'Needs Human Review';
  reason: string;
  provisions: string[];
  evidence: string;
  citations: AuthoritativeCitation[];
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

export interface BiodiversityABSSection {
  title: string;
  status: 'Applicable' | 'Potentially Applicable' | 'Not Indicated' | 'Needs Human Review';
  biologicalResourceIndicated: boolean;
  relevantBiologicalResources: string[];
  isNbaApprovalRelevant: boolean;
  reasoning: string;
  missingInformation?: string;
  provisions: string[];
  citations?: AuthoritativeCitation[];
  officialAuthority: string;
  officialSourceUrl: string;
}

export interface NBAApprovalSection {
  title: string;
  status: 'Applicable' | 'Potentially Applicable' | 'Not Indicated' | 'Needs Human Review';
  formType: string;
  reasoning: string;
  provisions: string[];
  citations?: AuthoritativeCitation[];
  officialAuthority: string;
  officialSourceUrl: string;
}

export interface TraditionalKnowledgeTKDLSection {
  title: string;
  status: 'Applicable' | 'Potentially Applicable' | 'Not Indicated' | 'Needs Human Review';
  traditionalKnowledgeInvolvement: string;
  reasoning: string;
  effectOnIpProtection: string;
  provisions: string[];
  citations?: AuthoritativeCitation[];
  officialAuthority: string;
  officialSourceUrl: string;
}

export interface RegulatoryRequirementsSection {
  title: string;
  status: 'Applicable' | 'Potentially Applicable' | 'Not Indicated' | 'Needs Human Review';
  regulatoryCategory: string;
  applicablePathway: string;
  reasoning: string;
  specificRequirements: string[];
  provisions: string[];
  citations?: AuthoritativeCitation[];
  controllingAuthority: string;
  officialSourceUrl: string;
}

export interface ComplianceAnalysisResult {
  productName: string;
  classificationCategory: string;
  jurisdiction: string;
  language: string;
  summary: string;
  biodiversityABS: BiodiversityABSSection;
  nbaApproval: NBAApprovalSection;
  traditionalKnowledgeTKDL: TraditionalKnowledgeTKDLSection;
  regulatoryRequirements: RegulatoryRequirementsSection;
  timestamp: string;
}

export interface ClassificationResult {
  product_name?: string;
  category: string;
  intended_use?: string;
  formulation_basis?: string;
  why_assigned?: string;
  patent_potential: string;
  ip_considerations?: string;
  regulatory_considerations?: string;
  abs_status?: string;
  abs_required: boolean;
  tkdl_3p_risk: 'High' | 'Medium' | 'Low';
  confidence: 'High' | 'Medium' | 'Low';
  classificationTimestamp: string;
}

export interface UserSession {
  jurisdiction: 'India' | 'International';
  classificationAnswers?: WizardAnswers;
  classificationResult?: ClassificationResult;
  absChecklist?: {
    resourceIdentified: boolean;
    sourceDocumented: boolean;
    nbaApprovalStatus: boolean;
    markedAsReviewed: boolean;
  };
  chatHistory: ChatMessage[];
}

export interface PresetItem {
  id: string;
  name: string;
  description: string;
  answers: WizardAnswers;
}

export interface DocumentStatus {
  id: string;
  title: string;
  shortTitle?: string;
  actRegulation?: string;
  year: number | string;
  jurisdiction: 'India' | 'International' | string;
  topic?: string;
  version?: string;
  effectiveDate?: string;
  lastVerifiedDate?: string;
  authority?: string;
  sourceAuthority?: string;
  sourceUrl: string;
  isLoaded: boolean;
  sectionCount?: number;
  sectionsCovered?: string[];
  sections?: Array<{
    sectionNumber: string;
    heading?: string;
    title?: string;
    text: string;
    version?: string;
    effectiveDate?: string;
    authority?: string;
    keywords?: string[];
    relevance?: string;
    practicalImpact?: string;
    sourceUrl?: string;
  }>;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const TOKEN_STORAGE_KEY = 'ip_sakti_token';
let inMemoryToken: string | null = null;

// Initialize inMemoryToken from storage on startup
try {
  if (typeof window !== 'undefined') {
    inMemoryToken = window.sessionStorage?.getItem(TOKEN_STORAGE_KEY) || window.localStorage?.getItem(TOKEN_STORAGE_KEY) || null;
  }
} catch {
  // Ignore storage access restriction
}

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
  try {
    if (typeof window !== 'undefined') {
      if (token) {
        window.sessionStorage?.setItem(TOKEN_STORAGE_KEY, token);
        window.localStorage?.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        window.sessionStorage?.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage?.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  } catch {
    // Ignore storage errors
  }
}

export function getAuthToken(): string | null {
  if (inMemoryToken) {
    return inMemoryToken;
  }
  try {
    if (typeof window !== 'undefined') {
      const stored = window.sessionStorage?.getItem(TOKEN_STORAGE_KEY) || window.localStorage?.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        inMemoryToken = stored;
        return stored;
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

export function clearAuthToken(): void {
  setAuthToken(null);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach Authorization: Bearer <token> if available
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const currentLang = typeof window !== 'undefined' ? (localStorage.getItem('lang') || 'en') : 'en';
  if (!headers.has('x-language')) {
    headers.set('x-language', currentLang);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include' // Send cookies automatically as well
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status} error`;
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMsg = data.error;
      }
    } catch {
      // ignore json parse error
    }
    throw new ApiError(errorMsg, response.status);
  }

  return response.json();
}

export const api = {
  auth: {
    register: async (data: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      role: string;
      consent: boolean;
      preferredLanguage?: string;
    }) => {
      const res = await request<{ user: User; token?: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res.token) {
        setAuthToken(res.token);
      }
      return res;
    },

    login: async (credentials: { email: string; password: string }) => {
      const res = await request<{ user: User; token?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      if (res.token) {
        setAuthToken(res.token);
      }
      return res;
    },

    logout: async () => {
      try {
        return await request<{ message: string }>('/api/auth/logout', { method: 'POST' });
      } finally {
        clearAuthToken();
      }
    },

    me: async () => {
      const res = await request<{ user: User | null; token?: string }>('/api/auth/me', { method: 'GET' });
      if (res.token) {
        setAuthToken(res.token);
      }
      return res;
    },

    updateLanguage: (language: 'en' | 'hi' | 'mr') =>
      request<{ preferredLanguage: string }>('/api/auth/language', {
        method: 'PATCH',
        body: JSON.stringify({ language })
      })
  },

  session: {
    get: () => request<{ session: UserSession }>('/api/session', { method: 'GET' }),

    updateJurisdiction: (jurisdiction: 'India' | 'International') =>
      request<{ session: UserSession }>('/api/session/jurisdiction', {
        method: 'PUT',
        body: JSON.stringify({ jurisdiction })
      }),

    updateAbsChecklist: (checklist: Partial<UserSession['absChecklist']>) =>
      request<{ absChecklist: UserSession['absChecklist'] }>('/api/session/abs-checklist', {
        method: 'PUT',
        body: JSON.stringify(checklist)
      }),

    reset: () => request<{ message: string; session: UserSession }>('/api/session/reset', { method: 'POST' })
  },

  classification: {
    getPresets: () => request<{ presets: PresetItem[] }>('/api/classification/presets', { method: 'GET' }),

    classify: (answers: WizardAnswers) =>
      request<{ result: ClassificationResult; session: UserSession }>('/api/classification/classify', {
        method: 'POST',
        body: JSON.stringify({ answers })
      }),

    extractFreeText: (description: string) =>
      request<{ extractedAnswers: WizardAnswers; notice: string }>('/api/classification/extract-free-text', {
        method: 'POST',
        body: JSON.stringify({ description })
      })
  },

  product: {
    analyze: (data: ProductAnalysisInput) =>
      request<ProductAnalysisResult>('/api/product/analyze', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    classify: (data: ProductAnalysisInput) =>
      request<ProductAnalysisResult>('/api/product/classify', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  abs: {
    assess: (data: ABSAssessmentInput) =>
      request<ABSAssessmentResult>('/api/abs/assess', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  chat: {
    sendMessage: (query: string, language?: string) => {
      const activeLang = language || (typeof window !== 'undefined' ? (localStorage.getItem('lang') || 'en') : 'en');
      return request<{ message: ChatMessage; chatHistory: ChatMessage[] }>('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({ query, language: activeLang })
      });
    }
  },

  knowledge: {
    getDocuments: () => request<{ documents: DocumentStatus[] }>('/api/knowledge/documents', { method: 'GET' }),

    toggleDocument: (documentId: string, loaded: boolean) =>
      request<{ message: string; documents: DocumentStatus[] }>('/api/knowledge/toggle', {
        method: 'POST',
        body: JSON.stringify({ documentId, loaded })
      })
  },

  facilitator: {
    getDossier: () => request<{ dossier: any }>('/api/facilitator/dossier', { method: 'GET' }),
    submitReview: (data: any) =>
      request<{ ticket: any }>('/api/facilitator/review', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getReview: (id: string) =>
      request<{ ticket: any }>(`/api/facilitator/review/${id}`, { method: 'GET' })
  },

  dossier: {
    create: (data: any) =>
      request<{ dossier: any }>('/api/dossier/create', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    export: (data: any) =>
      request<{ dossierText: string; caseId: string }>('/api/dossier/export', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  rag: {
    query: (query: string, jurisdiction: string = 'India', language?: string, productContext?: any) => {
      const activeLang = language || (typeof window !== 'undefined' ? (localStorage.getItem('lang') || 'en') : 'en');
      return request<any>('/api/rag/query', {
        method: 'POST',
        body: JSON.stringify({ query, jurisdiction, language: activeLang, productContext })
      });
    }
  },

  ip: {
    analyze: (productContext: any, jurisdiction: string = 'India', language: string = 'en') =>
      request<IPProtectionAnalysisResult>('/api/ip/analyze', {
        method: 'POST',
        body: JSON.stringify({ productContext, jurisdiction, language })
      })
  },

  compliance: {
    analyze: (productContext: any, jurisdiction: string = 'India', language: string = 'en') =>
      request<ComplianceAnalysisResult>('/api/compliance/analyze', {
        method: 'POST',
        body: JSON.stringify({ productContext, jurisdiction, language })
      })
  },

  history: {
    getHistory: () => request<{ history: any[] }>('/api/analysis/history', { method: 'GET' }),
    saveHistory: (item: any) =>
      request<{ message: string; item: any }>('/api/analysis/history', {
        method: 'POST',
        body: JSON.stringify(item)
      }),
    deleteHistory: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/analysis/history/${id}`, {
        method: 'DELETE'
      }),
    clearHistory: () =>
      request<{ success: boolean; message: string }>('/api/analysis/history', {
        method: 'DELETE'
      })
  }
};