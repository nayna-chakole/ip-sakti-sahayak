import React, { useState, useEffect } from 'react';
import { useTranslation, Language } from '../i18n/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Shield,
  BookOpen,
  UserCheck,
  Globe,
  LogOut,
  Lock,
  History,
  LogIn,
  MoreVertical,
  X,
  UserPlus
} from 'lucide-react';
import { LogoutModal } from './LogoutModal.js';

interface HeaderProps {
  jurisdiction: 'India' | 'International';
  onJurisdictionChange: (jur: 'India' | 'International') => void;
  onOpenKnowledgeBase: () => void;
  onOpenFacilitator: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  isClassified?: boolean;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  jurisdiction,
  onJurisdictionChange,
  onOpenKnowledgeBase,
  onOpenFacilitator,
  onOpenHistory,
  historyCount = 0,
  isClassified = false,
  onOpenAuth
}) => {
  const { lang, t } = useTranslation();
  const { user, logout, updateUserLanguage } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logoutModalStep, setLogoutModalStep] = useState<'confirm' | 'after-logout'>('confirm');
  const [userSnapshot, setUserSnapshot] = useState<{ name: string; role: string; email?: string } | null>(null);

  const languages: { code: Language; label: string; short: string }[] = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी', short: 'हिं' },
    { code: 'mr', label: 'मराठी', short: 'मरा' }
  ];

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#0F2A4A] text-white border-b border-amber-500/30 shadow-md">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 lg:gap-4">
        {/* Brand Zone */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-inner text-slate-950 font-bold shrink-0">
            <Shield className="w-5 h-5 text-slate-950" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white whitespace-nowrap truncate">
              {t('app.title')}
            </h1>
          </div>
        </div>

        {/* Laptop & Desktop Controls (Visible directly on header on lg: and up with zero overlap) */}
        <div className="hidden lg:flex items-center space-x-2 xl:space-x-2.5 shrink-0">
          {/* Knowledge Base */}
          <button
            id="open-knowledge-base-btn"
            onClick={onOpenKnowledgeBase}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer whitespace-nowrap shrink-0"
            title={t('nav.knowledgeBase')}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden xl:inline">{t('nav.knowledgeBase')}</span>
            <span className="xl:hidden">{t('nav.docsShort')}</span>
          </button>

          {/* Facilitator Review */}
          <button
            id="open-facilitator-btn"
            disabled={!isClassified}
            onClick={() => isClassified && onOpenFacilitator()}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition whitespace-nowrap shrink-0 ${
              !isClassified
                ? 'opacity-40 cursor-not-allowed bg-slate-800/40 text-slate-400 border-slate-800'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/40 cursor-pointer shadow-xs'
            }`}
            title={!isClassified ? t('dashboard.availableAfterClassification') : t('nav.requestReview')}
          >
            {!isClassified ? (
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className="hidden xl:inline">{t('nav.requestReview')}</span>
            <span className="xl:hidden">{t('nav.reviewShort')}</span>
          </button>

          {/* History */}
          {onOpenHistory && (
            <button
              id="open-analysis-history-btn"
              onClick={onOpenHistory}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 rounded-lg border border-amber-500/40 transition cursor-pointer whitespace-nowrap shrink-0"
              title="View past formulation submissions"
            >
              <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          {/* Jurisdiction Segmented Toggle */}
          <div
            className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700 text-xs shrink-0"
            title={t('nav.jurisdictionLabel')}
          >
            <button
              id="jurisdiction-india-btn"
              onClick={() => onJurisdictionChange('India')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                jurisdiction === 'India'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🇮🇳 {t('nav.jurisdictionIndia')}
            </button>
            <button
              id="jurisdiction-intl-btn"
              onClick={() => onJurisdictionChange('International')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                jurisdiction === 'International'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🌐 {t('nav.jurisdictionInternational')}
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700 text-xs shrink-0">
            <Globe className="w-3.5 h-3.5 ml-1.5 mr-1 text-slate-400 hidden xl:inline" />
            {languages.map((l) => (
              <button
                key={l.code}
                id={`lang-toggle-${l.code}`}
                onClick={() => updateUserLanguage(l.code)}
                className={`px-2 py-1 rounded transition text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  lang === l.code
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center space-x-2 pl-1 border-l border-slate-700 shrink-0">
              <div className="hidden xl:block text-right">
                <div className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-amber-300/90 leading-tight truncate max-w-[120px]">
                  {user.role}
                </div>
              </div>
              <button
                id="header-logout-btn"
                onClick={() => {
                  setUserSnapshot({
                    name: user.name,
                    role: user.role,
                    email: user.email
                  });
                  setLogoutModalStep('confirm');
                  setIsLogoutModalOpen(true);
                }}
                className="p-1.5 text-slate-300 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/30 transition cursor-pointer"
                title={t('nav.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            onOpenAuth && (
              <div className="pl-1 border-l border-slate-700 shrink-0">
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-xs transition cursor-pointer whitespace-nowrap"
                  title="Sign in to your account"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('auth.signInBtn') || 'Sign In'}</span>
                </button>
              </div>
            )
          )}
        </div>

        {/* Mobile & Tablet 3-Dots Button */}
        <div className="flex items-center space-x-2 lg:hidden shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shadow-xs"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            title="Options menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-amber-400" />
            ) : (
              <MoreVertical className="w-5 h-5 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Screen Options Panel (Dedicated bar directly on screen for mobile, never removed) */}
      <div className="lg:hidden bg-[#0A1D33] border-t border-slate-800/90 px-2 sm:px-3 py-1.5 flex items-center justify-between gap-1 sm:gap-2 shadow-inner overflow-x-auto">
        {/* Jurisdiction Bar: India vs International */}
        <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700/80 text-xs shrink-0">
          <button
            type="button"
            onClick={() => onJurisdictionChange('India')}
            className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              jurisdiction === 'India'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🇮🇳</span>
            <span>{lang === 'hi' ? 'भारत' : lang === 'mr' ? 'भारत' : 'India'}</span>
          </button>
          <button
            type="button"
            onClick={() => onJurisdictionChange('International')}
            className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              jurisdiction === 'International'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🌐</span>
            <span>{lang === 'hi' ? 'विदेश' : lang === 'mr' ? 'विदेश' : 'Intl'}</span>
          </button>
        </div>

        {/* Language Bar: English / हिंदी / मराठी */}
        <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700/80 text-xs shrink-0">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => updateUserLanguage(l.code)}
              className={`px-1.5 sm:px-2 py-1 rounded transition text-[11px] font-bold cursor-pointer whitespace-nowrap ${
                lang === l.code
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet 3-Dots Menu Dropdown: Quick Actions & Tools (Language and Jurisdiction are already pinned in the mobile header above) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0A1D33] border-t border-amber-500/30 px-4 py-3.5 space-y-3 shadow-2xl animate-fadeIn">
          {/* Options Panel Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              {lang === 'hi' ? 'विकल्प और साधन' : lang === 'mr' ? 'पर्याय आणि साधने' : 'Options & Tools'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              IP-SAKTI Sahayak
            </span>
          </div>

          {/* 1. Knowledge Base */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenKnowledgeBase();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('nav.knowledgeBase') || 'Knowledge Base & Documents'}</span>
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono uppercase">Open</span>
          </button>

          {/* 4. Analysis & Case History */}
          {onOpenHistory && (
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenHistory();
              }}
              className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <History className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Case History & Records</span>
              </div>
              {historyCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          {/* 5. Request Human Facilitator Review */}
          <button
            type="button"
            disabled={!isClassified}
            onClick={() => {
              if (isClassified) {
                setIsMobileMenuOpen(false);
                onOpenFacilitator();
              }
            }}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between border transition ${
              !isClassified
                ? 'opacity-50 bg-slate-900/60 text-slate-400 border-slate-800 cursor-not-allowed'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/50 hover:bg-amber-500/25 cursor-pointer shadow-xs'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {!isClassified ? (
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              ) : (
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>{t('nav.requestReview') || 'Request Facilitator Review'}</span>
            </div>
            {!isClassified && (
              <span className="text-[10px] text-slate-500">Requires Analysis</span>
            )}
          </button>

          {/* 6. User Profile and Authentication */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-amber-300 truncate">{user.role}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setUserSnapshot({
                      name: user.name,
                      role: user.role,
                      email: user.email
                    });
                    setLogoutModalStep('confirm');
                    setIsLogoutModalOpen(true);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-red-500/15 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer hover:bg-red-500/25 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              onOpenAuth && (
                <div className="w-full flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t('auth.signInBtn')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-slate-300" />
                    <span>{t('auth.registerBtn') || 'Register'}</span>
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation & Post-Logout Survey Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        initialStep={logoutModalStep}
        userName={user?.name || userSnapshot?.name || 'User'}
        userRole={user?.role || userSnapshot?.role || 'Researcher'}
        userEmail={user?.email || userSnapshot?.email}
        onConfirmLogout={async () => {
          await logout();
        }}
        onNavigateLogin={onOpenAuth ? () => onOpenAuth('login') : undefined}
        onNavigateRegister={onOpenAuth ? () => onOpenAuth('register') : undefined}
      />
    </header>
  );
};
