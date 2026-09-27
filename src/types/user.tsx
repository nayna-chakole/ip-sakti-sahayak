export type SupportedLanguage = 'en' | 'hi' | 'mr';
export type SupportedJurisdiction = 'India' | 'International';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organization?: string;
  preferredLanguage: SupportedLanguage;
}

export interface AuthResponse {
  token: string;
  user: User;
}
