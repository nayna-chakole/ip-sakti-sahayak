import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/index.js';
import {
  LogOut,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  X,
  User,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  MessageSquareHeart,
  Send
} from 'lucide-react';

export interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: 'confirm' | 'after-logout';
  onConfirmLogout: () => Promise<void> | void;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  userName?: string;
  userRole?: string;
  userEmail?: string;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  initialStep = 'confirm',
  onConfirmLogout,
  onNavigateLogin,
  onNavigateRegister,
  userName = 'User',
  userRole = 'Researcher',
  userEmail
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<'confirm' | 'after-logout'>(initialStep);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customComment, setCustomComment] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
      setIsLoggingOut(false);
      setSelectedReason('');
      setCustomComment('');
      setFeedbackSubmitted(false);
    }
  }, [isOpen, initialStep]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirmLogout();
      setCurrentStep('after-logout');
    } catch (err) {
      console.error('Logout error:', err);
      setCurrentStep('after-logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason && !customComment.trim()) return;

    try {
      const feedbackRecord = {
        timestamp: new Date().toISOString(),
        user: userName,
        reason: selectedReason,
        comment: customComment.trim()
      };
      const existing = JSON.parse(localStorage.getItem('ip_sakti_logout_feedback') || '[]');
      existing.unshift(feedbackRecord);
      localStorage.setItem('ip_sakti_logout_feedback', JSON.stringify(existing.slice(0, 20)));
    } catch {
      // ignore localstorage errors
    }
    setFeedbackSubmitted(true);
  };

  const reasons = [
    {
      id: 'finished',
      label: t('logoutModal.reasonFinished') || 'Finished analyzing my Ayurvedic product',
      icon: '🌿'
    },
    {
      id: 'switch_account',
      label: t('logoutModal.reasonSwitchAccount') || 'Need to switch to another account / role',
      icon: '🔄'
    },
    {
      id: 'break',
      label: t('logoutModal.reasonBreak') || 'Taking a break, will resume later',
      icon: '⏸️'
    },
    {
      id: 'facilitator',
      label: t('logoutModal.reasonFacilitator') || 'Need expert assistance or human facilitator',
      icon: '⚖️'
    },
    {
      id: 'browsing',
      label: t('logoutModal.reasonBrowsing') || 'Just evaluating / exploratory testing',
      icon: '🧪'
    }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden relative flex flex-col transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#0A192F] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl ${
              currentStep === 'confirm'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {currentStep === 'confirm' ? (
                <LogOut className="w-5 h-5 text-red-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {currentStep === 'confirm'
                  ? (t('logoutModal.confirmTitle') || 'Confirm Logout')
                  : (t('logoutModal.afterLogoutTitle') || 'Logged Out Successfully')}
              </h2>
              <p className="text-xs text-slate-400">
                {currentStep === 'confirm'
                  ? (t('logoutModal.confirmSubtitle') || 'Are you sure you want to end your session?')
                  : (t('logoutModal.afterLogoutSubtitle') || 'Your session has ended safely.')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={t('logoutModal.close') || 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {currentStep === 'confirm' ? (
            /* STEP 1: CONFIRMATION */
            <div className="space-y-5">
              {/* User Identity Card */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-sm">
                    {userName ? userName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">{userName}</div>
                    <div className="text-xs text-amber-400/90 font-medium">{userRole}</div>
                    {userEmail && (
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{userEmail}</div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-medium px-2 py-0.5 rounded border border-emerald-500/30">
                  Active Session
                </span>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 space-y-1">
                <div className="font-semibold text-amber-300 flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Session Termination Notice</span>
                </div>
                <p>
                  {t('logoutModal.confirmMessage', { name: userName, role: userRole }) ||
                    `You are currently signed in as ${userName} (${userRole}). Logging out will close your authenticated session.`}
                </p>
                <p className="text-[11px] text-slate-400 pt-1">
                  Your previously saved formulation reports and consultation history remain securely saved in your browser history.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  id="cancel-logout-btn"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                >
                  {t('logoutModal.cancelBtn') || 'Stay Logged In'}
                </button>
                <button
                  type="button"
                  id="confirm-logout-action-btn"
                  disabled={isLoggingOut}
                  onClick={handleLogoutClick}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Logging out...' : (t('logoutModal.confirmBtn') || 'Yes, Log Out')}</span>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: POST-LOGOUT "ASK ABOUT LOGOUT" SURVEY & NAVIGATION */
            <div className="space-y-5 animate-fadeIn">
              {/* Green Session Closed Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-emerald-300">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
                <div>
                  <div className="font-semibold text-emerald-200">
                    {t('logoutModal.afterLogoutTitle') || 'Logged Out Successfully'}
                  </div>
                  <div className="text-[11px] text-emerald-300/80">
                    Your session has been securely invalidated. You are now browsing as a guest.
                  </div>
                </div>
              </div>

              {/* Ask About Logout: Interactive Feedback Question */}
              <form onSubmit={handleSaveFeedback} className="space-y-3.5 bg-slate-800/60 rounded-xl p-4 border border-slate-700/70">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                    <MessageSquareHeart className="w-4 h-4" />
                    <span>{t('logoutModal.askQuestion') || 'What is the primary reason for logging out today?'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Help us improve the Ayurvedic IPR decision support platform by sharing a quick insight.
                  </p>
                </div>

                {/* Reason Selection Chips */}
                <div className="space-y-2">
                  {reasons.map((r) => {
                    const isSelected = selectedReason === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedReason(r.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-200 border-amber-500/80 shadow-xs'
                            : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:bg-slate-700/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-sm">{r.icon}</span>
                          <span>{r.label}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Optional Comment Input */}
                <div className="pt-1">
                  <input
                    type="text"
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    placeholder={t('logoutModal.feedbackPlaceholder') || 'Any feedback or suggestions for IP-SAKTI Sahayak? (Optional)'}
                    className="w-full px-3.5 py-2 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Feedback Submission confirmation / trigger */}
                {feedbackSubmitted ? (
                  <div className="bg-amber-500/15 border border-amber-500/40 rounded-lg p-2.5 text-center text-xs text-amber-300 font-medium animate-fadeIn">
                    ✓ {t('logoutModal.feedbackThanks') || 'Thank you! Your feedback helps us improve AYUSH regulatory decision support.'}
                  </div>
                ) : (
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!selectedReason && !customComment.trim()}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('logoutModal.submitFeedback') || 'Submit Reason'}</span>
                    </button>
                  </div>
                )}
              </form>

              {/* What would you like to do next? */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Next Actions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {onNavigateLogin && (
                    <button
                      type="button"
                      id="post-logout-login-again-btn"
                      onClick={() => {
                        onClose();
                        onNavigateLogin();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <span>{t('logoutModal.loginAgain') || 'Sign In Again'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onNavigateRegister && (
                    <button
                      type="button"
                      id="post-logout-register-btn"
                      onClick={() => {
                        onClose();
                        onNavigateRegister();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>{t('logoutModal.registerNew') || 'Create New Account'}</span>
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  id="post-logout-continue-btn"
                  onClick={onClose}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs border border-slate-800 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('logoutModal.continueDashboard') || 'Continue to Analyze Product'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
