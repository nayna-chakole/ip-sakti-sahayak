import { SupportedJurisdiction, SupportedLanguage } from './user';

export interface RetrievedEvidence {
  documentId: string;
  chunkId: string;
  content: string;
  source: string;
  section: string;
  documentType?: string;
  jurisdiction: SupportedJurisdiction;
  country: string;
  region?: string;
  topic: string;
  version: string;
  sourceUrl: string;
  heading?: string;
  authority?: string;
  effectiveDate?: string;
  relevanceScore: number;
}

export interface GroundedCitation {
  source: string;
  document?: string;
  section: string;
  documentType?: string;
  authority?: string;
  version?: string;
  effectiveDate?: string;
  sourceUrl?: string;
  contextSnippet?: string;
}

export interface RAGResponse {
  answer: string;
  citations: GroundedCitation[];
  evidenceCount: number;
  evidence: RetrievedEvidence[];
  confidence: 'High' | 'Medium' | 'Low' | 'Abstained';
  jurisdiction: SupportedJurisdiction;
  language: SupportedLanguage;
  abstained: boolean;
  abstentionReason?: string;
}
