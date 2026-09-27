import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User, getAuthToken, clearAuthToken } from '../api/client.js';
import { useTranslation, Language } from '../i18n/index.js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sessionExpiredMessage: string | null;
  clearSessionExpiredMessage: () => void;
  handleSessionExpired: (message?: string) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    consent: boolean;
    preferredLanguage?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUserLanguage: (lang: Language) => Promise<void>;
  isAdmin: boolean;
  isExpert: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
  const { lang, setLang } = useTranslation();

  const handleSessionExpired = (message?: string) => {
    clearAuthToken();
    setUser(null);
    setSessionExpiredMessage(message || 'Your session has expired. Please sign in to continue.');
  };

  const clearSessionExpiredMessage = () => {
    setSessionExpiredMessage(null);
  };

  const fetchCurrentUser = async () => {
    const existingToken = getAuthToken();
    if (!existingToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.auth.me();
      if (res && res.user) {
        setUser(res.user);
        if (res.user.preferredLanguage && res.user.preferredLanguage !== lang) {
          setLang(res.user.preferredLanguage);
        }
      } else {
        clearAuthToken();
        setUser(null);
      }
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setSessionExpiredMessage(null);
    const res = await api.auth.login(credentials);
    setUser(res.user);
    const currentLang = (localStorage.getItem('lang') as Language) || lang;
    if (res.user) {
      if (currentLang && currentLang !== res.user.preferredLanguage) {
        try {
          await api.auth.updateLanguage(currentLang);
          res.user.preferredLanguage = currentLang;
        } catch {
          // ignore
        }
      } else if (res.user.preferredLanguage) {
        setLang(res.user.preferredLanguage);
      }
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    consent: boolean;
    preferredLanguage?: string;
  }) => {
    setSessionExpiredMessage(null);
    const res = await api.auth.register({ ...data, preferredLanguage: lang });
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      clearAuthToken();
      setUser(null);
      setSessionExpiredMessage(null);
      localStorage.removeItem('ip_sakti_has_classified');
    }
  };

  const updateUserLanguage = async (newLang: Language) => {
    setLang(newLang);
    if (user) {
      try {
        await api.auth.updateLanguage(newLang);
        setUser({ ...user, preferredLanguage: newLang });
      } catch (err) {
        console.error('Failed to sync language to profile:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        sessionExpiredMessage,
        clearSessionExpiredMessage,
        handleSessionExpired,
        login,
        register,
        logout,
        updateUserLanguage,
        isAdmin: user?.accessRole === 'admin',
        isExpert: user?.accessRole === 'expert'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}