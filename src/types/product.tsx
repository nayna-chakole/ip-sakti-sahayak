import { SupportedJurisdiction, SupportedLanguage } from './user';

export interface ProductFormData {
  productName: string;
  productDescription: string;
  ingredients: string[];
  formulation: string;
  intendedUse: string;
  claimedBenefits: string;
  manufacturingMethod: string;
  sourceOfIngredients: string;
  usesBiologicalResources: boolean;
  involvesTraditionalKnowledge: boolean;
  existingBrandName: string;
  targetMarket: string;
  jurisdiction: SupportedJurisdiction;
  language: SupportedLanguage;
}

export interface ClassificationResult {
  category: string;
  confidence: 'High' | 'Medium' | 'Low' | 'Uncertain';
  statutoryBasis: string;
  reasoning: string[];
  clarificationQuestions?: string[];
  isUnambiguous: boolean;
}
