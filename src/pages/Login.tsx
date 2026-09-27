import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTranslation, Language } from '../i18n/index.js';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Globe } from 'lucide-react';

interface LoginProps {
  onNavigateRegister: () => void;
  onLoginSuccess: () => void;
  onCancel?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onNavigateRegister,
  onLoginSuccess,
  onCancel
}) => {
  const { t, lang } = useTranslation();
  const { login, updateUserLanguage, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages: Array<{ code: Language; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    clearSessionExpiredMessage();

    if (!email.trim() || !password) {
      setErrorMessage(t('auth.errors.invalidCredentials') || 'Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || t('auth.errors.invalidCredentials') || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100 p-4 sm:p-6">
      {/* Top Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-sm tracking-tight text-white">
            {t('app.title') || 'IP-SAKTI Sahayak'}
          </span>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition cursor-pointer flex items-center space-x-1"
          >
            <span>← Analyze Product</span>
          </button>
        ) : (
          <span className="text-[11px] text-amber-400/90 font-medium">
            Ayush IPR & Statutory Support
          </span>
        )}
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full bg-slate-950/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-5 my-auto">
        {/* Title */}
        <div className="space-y-1.5 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {t('auth.loginTitle')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Compact Language Switcher Pills: English | हिंदी | मराठी */}
        <div className="flex items-center justify-between bg-slate-900/95 rounded-xl p-1.5 border border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 pl-1.5 font-medium">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Language:</span>
          </div>
          <div className="flex items-center space-x-1">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                id={`login-lang-${l.code}`}
                onClick={() => updateUserLanguage(l.code)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  lang === l.code
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two Clear Options: Login / Create Account */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            className="py-2 px-3 rounded-lg bg-amber-500 text-slate-950 shadow-sm text-center font-bold"
          >
            {t('auth.signInBtn')}
          </button>
          <button
            type="button"
            onClick={onNavigateRegister}
            className="py-2 px-3 rounded-lg text-slate-400 hover:text-white transition text-center cursor-pointer"
          >
            {t('auth.createAccount')}
          </button>
        </div>

        {sessionExpiredMessage && !errorMessage && (
          <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{sessionExpiredMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder') || 'name@domain.com'}
                required
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>


          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs sm:text-sm pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Authenticating...' : t('auth.signInBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
          <span>{t('auth.noAccount')} </span>
          <button
            id="navigate-register-btn"
            type="button"
            onClick={onNavigateRegister}
            className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer ml-1"
          >
            {t('auth.createAccount')}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto w-full text-center py-4 text-[11px] text-slate-500">
        Digital Personal Data Protection Act, 2023 Compliant
      </div>
    </div>
  );
};
