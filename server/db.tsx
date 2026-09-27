import fs from 'fs';
import path from 'path';

// NOTE: This local JSON store is designed for the prototype MVP.
// In production, this would be replaced with a relational PostgreSQL database
// (e.g., via Cloud SQL with connection pooling and ACID guarantees).

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'Student' | 'Researcher' | 'Ayurvedic Practitioner' | 'Manufacturer/Startup' | 'IP Professional';
  preferredLanguage: 'en' | 'hi' | 'mr';
  createdAt: string;
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

export interface StoredChatMessage {
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

export interface UserSessionData {
  classificationAnswers?: WizardAnswers;
  classificationResult?: ClassificationResult;
  jurisdiction: 'India' | 'International';
  absChecklist?: {
    resourceIdentified: boolean;
    sourceDocumented: boolean;
    nbaApprovalStatus: boolean;
    markedAsReviewed: boolean;
  };
  chatHistory: StoredChatMessage[];
}

export interface DatabaseSchema {
  users: Record<string, UserRecord>;
  loginAttempts: Record<string, { count: number; lockedUntil?: number; lastAttempt: number }>;
  userSessions: Record<string, UserSessionData>;
  knowledgeLoaded: Record<string, boolean>;
  analysisHistory?: Record<string, any[]>;
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: {},
      loginAttempts: {},
      userSessions: {},
      knowledgeLoaded: {
        patents_act_1970: true, // Loaded by default so grounded answering works out of the box
        biological_diversity_act_2002: true,
        ayurveda_aahar_regulations_2022: true,
        tkdl_public_info: true,
        gi_act_1999: false // unpopulated demonstration
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readDb(): DatabaseSchema {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading DB, resetting:', err);
    return {
      users: {},
      loginAttempts: {},
      userSessions: {},
      knowledgeLoaded: {}
    };
  }
}

function writeDb(data: DatabaseSchema): void {
  ensureDataDir();
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

export const db = {
  findUserByEmail(email: string): UserRecord | undefined {
    const data = readDb();
    const normalized = email.trim().toLowerCase();
    return Object.values(data.users).find((u) => u.email.toLowerCase() === normalized);
  },

  findUserById(id: string): UserRecord | undefined {
    const data = readDb();
    return data.users[id];
  },

  createUser(user: UserRecord): void {
    const data = readDb();
    data.users[user.id] = user;
    // initialize session data
    if (!data.userSessions[user.id]) {
      data.userSessions[user.id] = {
        jurisdiction: 'India',
        chatHistory: []
      };
    }
    writeDb(data);
  },

  updateUserLanguage(userId: string, lang: 'en' | 'hi' | 'mr'): void {
    const data = readDb();
    if (data.users[userId]) {
      data.users[userId].preferredLanguage = lang;
      writeDb(data);
    }
  },

  getLoginAttempts(email: string) {
    const data = readDb();
    const normalized = email.trim().toLowerCase();
    return data.loginAttempts[normalized] || { count: 0, lastAttempt: 0 };
  },

  recordFailedLogin(email: string): { count: number; lockedUntil?: number } {
    const data = readDb();
    const normalized = email.trim().toLowerCase();
    const now = Date.now();
    const FIFTEEN_MINUTES = 15 * 60 * 1000;

    const current = data.loginAttempts[normalized] || { count: 0, lastAttempt: 0 };
    // reset count if window passed
    if (now - current.lastAttempt > FIFTEEN_MINUTES) {
      current.count = 0;
      delete current.lockedUntil;
    }

    current.count += 1;
    current.lastAttempt = now;

    if (current.count >= 5) {
      current.lockedUntil = now + FIFTEEN_MINUTES;
    }

    data.loginAttempts[normalized] = current;
    writeDb(data);
    return { count: current.count, lockedUntil: current.lockedUntil };
  },

  clearFailedLogins(email: string): void {
    const data = readDb();
    const normalized = email.trim().toLowerCase();
    if (data.loginAttempts[normalized]) {
      delete data.loginAttempts[normalized];
      writeDb(data);
    }
  },

  getUserSession(userId: string): UserSessionData {
    const data = readDb();
    if (!data.userSessions[userId]) {
      data.userSessions[userId] = {
        jurisdiction: 'India',
        chatHistory: []
      };
      writeDb(data);
    }
    return data.userSessions[userId];
  },

  updateUserSession(userId: string, updates: Partial<UserSessionData>): UserSessionData {
    const data = readDb();
    const existing = data.userSessions[userId] || {
      jurisdiction: 'India',
      chatHistory: []
    };
    const updated = { ...existing, ...updates };
    data.userSessions[userId] = updated;
    writeDb(data);
    return updated;
  },

  resetUserSession(userId: string): void {
    const data = readDb();
    data.userSessions[userId] = {
      jurisdiction: 'India',
      chatHistory: []
    };
    writeDb(data);
  },

  getKnowledgeLoadedState(): Record<string, boolean> {
    const data = readDb();
    return data.knowledgeLoaded || {};
  },

  setKnowledgeLoadedState(docId: string, loaded: boolean): void {
    const data = readDb();
    if (!data.knowledgeLoaded) data.knowledgeLoaded = {};
    data.knowledgeLoaded[docId] = loaded;
    writeDb(data);
  },

  saveAnalysisRecord(userId: string, record: any): void {
    const data = readDb();
    if (!data.analysisHistory) data.analysisHistory = {};
    if (!data.analysisHistory[userId]) data.analysisHistory[userId] = [];
    // Remove if already exists with same id or caseId
    const recordId = record.id || record.caseId;
    data.analysisHistory[userId] = data.analysisHistory[userId].filter(
      (item) => item.id !== recordId && item.caseId !== recordId
    );
    // Prepend to list
    data.analysisHistory[userId].unshift(record);
    // Limit to 50 items per user
    if (data.analysisHistory[userId].length > 50) {
      data.analysisHistory[userId] = data.analysisHistory[userId].slice(0, 50);
    }
    writeDb(data);
  },

  deleteAnalysisRecord(userId: string, id: string): boolean {
    const data = readDb();
    if (!data.analysisHistory || !data.analysisHistory[userId]) return false;
    const initialLen = data.analysisHistory[userId].length;
    data.analysisHistory[userId] = data.analysisHistory[userId].filter(
      (item) => item.id !== id && item.caseId !== id
    );
    writeDb(data);
    return data.analysisHistory[userId].length < initialLen;
  },

  clearAnalysisHistory(userId: string): void {
    const data = readDb();
    if (data.analysisHistory && data.analysisHistory[userId]) {
      data.analysisHistory[userId] = [];
      writeDb(data);
    }
  },

  getAnalysisHistory(userId?: string): any[] {
    const data = readDb();
    if (!data.analysisHistory) return [];
    if (userId) {
      return data.analysisHistory[userId] || [];
    }
    // Return all records flat
    const all = Object.values(data.analysisHistory).flat();
    return all.sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime());
  },

  getAnalysisRecordById(userId: string, id: string): any | undefined {
    const data = readDb();
    if (!data.analysisHistory || !data.analysisHistory[userId]) return undefined;
    return data.analysisHistory[userId].find((item) => item.id === id || item.caseId === id);
  }
};
