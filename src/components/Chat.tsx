import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { api, ChatMessage, UserSession } from '../api/client.js';
import { useTranslation } from '../i18n/index.js';
import { CitationChip } from './CitationChip.js';
import { ConfidenceBadge } from './ConfidenceBadge.js';
import { WhyThisAnswerModal } from './WhyThisAnswerModal.js';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
  UserCheck,
  Scale
} from 'lucide-react';

interface ChatProps {
  session: UserSession;
  onSendMessage: (query: string) => Promise<void>;
  onResetSession: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenFacilitator: () => void;
  isLoading: boolean;
  isLocked?: boolean;
}

export const Chat: React.FC<ChatProps> = ({
  session,
  onSendMessage,
  onResetSession,
  onOpenKnowledgeBase,
  onOpenFacilitator,
  isLoading,
  isLocked = false
}) => {
  const { t } = useTranslation();
  const [inputQuery, setInputQuery] = useState('');
  const [selectedExplanationMsg, setSelectedExplanationMsg] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.chatHistory, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const query = inputQuery.trim();
    setInputQuery('');
    await onSendMessage(query);
  };

  const sampleQuestions = [
    t('chat.q1'),
    t('chat.q2'),
    t('chat.q3'),
    t('chat.q4')
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#0F2A4A] rounded-lg text-amber-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                {t('dashboard.chatPanelTitle')}
              </h3>
              <span className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                Python RAG
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {t('dashboard.chatPanelSubtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetSession}
          className="text-xs text-slate-500 hover:text-red-600 flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
          title={t('chat.clearChat')}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('chat.clearChat')}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Shield className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                {t('chat.workspaceTitle')}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('chat.emptyNotice')}
              </p>
            </div>

            {/* Quick Consultation Chips */}
            <div className="w-full max-w-lg pt-2 space-y-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                {t('chat.suggestedQueries')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setInputQuery(q);
                    }}
                    className="p-2.5 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-xs text-slate-700 hover:text-slate-950 transition cursor-pointer"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          session.chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-[#0F2A4A] text-amber-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-xs space-y-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-[#0F2A4A] text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-xs'
                }`}
              >
                {/* Header status bar for Assistant */}
                {msg.sender === 'assistant' && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 gap-2 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <ConfidenceBadge confidence={msg.confidence} />
                      {msg.out_of_scope && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                          {t('chat.outOfScopeBadge')}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedExplanationMsg(msg)}
                        className="inline-flex items-center space-x-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition cursor-pointer"
                        title="View reasoning, product classification, jurisdiction, and legal grounds"
                      >
                        <HelpCircle className="w-3 h-3 text-blue-600" />
                        <span>{t('chat.whyThisAnswer')}</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}

                {/* Markdown content */}
                <div className="text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none text-inherit">
                  <div className="markdown-body">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>

                {/* Grounded Citations Section */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {t('chat.citationsLabel')} {t('chat.clickChipEvidence')}
                      </span>
                      <button
                        type="button"
                        onClick={onOpenKnowledgeBase}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-semibold cursor-pointer"
                      >
                        {t('chat.inspectCorpus')}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((cite, idx) => (
                        <CitationChip
                          key={idx}
                          citation={cite}
                          onOpenKnowledgeBase={onOpenKnowledgeBase}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Safe Abstention / Borderline Escalation Notice */}
                {msg.sender === 'assistant' && (msg.out_of_scope || (msg.confidence && msg.confidence !== 'High')) && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="text-xs text-amber-900 leading-snug">
                        <span className="font-semibold block">{t('facilitator.title')}</span>
                        <span>{t('facilitator.subtitle')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenFacilitator}
                        className="shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0F2A4A] hover:bg-slate-800 text-white rounded-lg transition cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t('nav.requestReview')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 mt-1 font-bold shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start space-x-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-[#0F2A4A] text-amber-400 flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs space-y-1 text-xs text-slate-600 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
              <span>{t('chat.typing')}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Why This Answer Modal */}
      {selectedExplanationMsg && (
        <WhyThisAnswerModal
          message={selectedExplanationMsg}
          session={session}
          onClose={() => setSelectedExplanationMsg(null)}
          onOpenFacilitator={onOpenFacilitator}
        />
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            isLocked
              ? t('dashboard.chatLockedDesc')
              : !session.classificationResult
              ? t('dashboard.notClassifiedDesc')
              : t('chat.placeholder')
          }
          className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition ${
            isLocked
              ? 'bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed'
              : 'bg-white border border-slate-300'
          }`}
          disabled={isLoading || isLocked}
        />

        <button
          type="submit"
          disabled={isLoading || isLocked || !inputQuery.trim()}
          className="p-2.5 bg-[#0F2A4A] hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl transition cursor-pointer flex items-center justify-center"
          title={isLocked ? t('dashboard.chatLockedTitle') : t('chat.send')}
        >
          <Send className="w-4 h-4 text-amber-400" />
        </button>
      </form>
    </div>
  );
};
