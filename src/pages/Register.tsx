import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTranslation, Language } from '../i18n/index.js';
import { Shield, User, Mail, Lock, ArrowRight, AlertCircle, Briefcase, Globe } from 'lucide-react';

interface RegisterProps {
  onNavigateLogin: () => void;
  onRegisterSuccess: () => void;
  onCancel?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateLogin, onRegisterSuccess, onCancel }) => {
  const { t, lang } = useTranslation();
  const { register, updateUserLanguage } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleLabel, setRoleLabel] = useState('Researcher');
  const [consent, setConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages: Array<{ code: Language; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' }
  ];

  const roleOptions = [
    { label: t('auth.roles.researcher') || 'Researcher', backendRole: 'Researcher' },
    { label: t('auth.roles.manufacturer') || 'Entrepreneur / Startup', backendRole: 'Manufacturer/Startup' },
    { label: t('auth.roles.practitioner') || 'Ayurvedic Practitioner', backendRole: 'Ayurvedic Practitioner' },
    { label: t('auth.roles.ipProfessional') || 'Legal / IP Professional', backendRole: 'IP Professional' },
    { label: t('auth.roles.student') || 'Student / Academic', backendRole: 'Student' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage(t('auth.errors.fullNameRequired') || 'Full name is required');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMessage(t('auth.errors.invalidEmail') || 'A valid email address is required');
      return;
    }

    if (password.length < 8 || !/\d/.test(password)) {
      setErrorMessage(t('auth.errors.passwordComplexity') || 'Password must be at least 8 characters and contain at least one number');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('auth.errors.passwordMismatch') || 'Passwords do not match');
      return;
    }

    if (!consent) {
      setErrorMessage(t('auth.errors.consentRequired') || 'You must agree to data processing under the Digital Personal Data Protection Act, 2023');
      return;
    }

    const matchedRole = roleOptions.find((r) => r.label === roleLabel)?.backendRole || 'Researcher';

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role: matchedRole as any,
        consent,
        preferredLanguage: lang
      });
      onRegisterSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-sm tracking-tight text-white">
            {t('app.title') || 'IP-SAKTI Sahayak'}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              ← Analyze Product
            </button>
          )}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
          >
            {t('auth.signInBtn')}
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md mx-auto w-full bg-slate-950/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-4 my-auto">
        {/* Title */}
        <div className="space-y-1.5 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {t('auth.registerTitle')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('auth.registerSubtitle')}
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
                id={`register-lang-${l.code}`}
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
            onClick={onNavigateLogin}
            className="py-2 px-3 rounded-lg text-slate-400 hover:text-white transition text-center cursor-pointer"
          >
            {t('auth.signInBtn')}
          </button>
          <button
            type="button"
            className="py-2 px-3 rounded-lg bg-amber-500 text-slate-950 shadow-sm text-center font-bold"
          >
            {t('auth.createAccount')}
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('auth.fullName')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.fullNamePlaceholder') || 'Dr. Rajesh Sharma'}
                required
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder') || 'name@institution.gov.in'}
                required
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('auth.role')}
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <select
                id="register-role"
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                {roleOptions.map((r) => (
                  <option key={r.label} value={r.label}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars"
                  required
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  id="register-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-1">
            <label className="flex items-start space-x-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                id="register-consent-checkbox"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <span className="leading-snug text-[11px] text-slate-400">
                {t('auth.consentCheckbox')}
              </span>
            </label>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span>{isSubmitting ? 'Registering...' : t('auth.signUpBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
          <span>{t('auth.haveAccount')} </span>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer ml-1"
          >
            {t('auth.signInBtn')}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto w-full text-center py-4 text-[11px] text-slate-500">
        Digital Personal Data Protection (DPDP) Act, 2023 Compliant • Official Ayush IP Portal
      </div>
    </div>
  );
};
