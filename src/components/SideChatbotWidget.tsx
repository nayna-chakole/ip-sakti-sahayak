import React, { useState } from 'react';
import { UserSession } from '../api/client.js';
import { Chat } from './Chat.js';
import {
  MessageSquareText,
  X,
  Sparkles,
  Bot,
  Minimize2,
  Maximize2,
  ShieldCheck,
  Scale
} from 'lucide-react';

interface SideChatbotWidgetProps {
  session: UserSession;
  onSendMessage: (query: string) => Promise<void>;
  onResetSession: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenFacilitator: () => void;
  isLoading: boolean;
  activeProductName?: string;
  activeCategory?: string;
}

export const SideChatbotWidget: React.FC<SideChatbotWidgetProps> = ({
  session,
  onSendMessage,
  onResetSession,
  onOpenKnowledgeBase,
  onOpenFacilitator,
  isLoading,
  activeProductName,
  activeCategory
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. SMALL CHATBOT ICON DOCKED ON THE SIDE                                  */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2">
        {!isOpen && (
          <button
            id="open-side-chatbot-btn"
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center space-x-2.5 px-4 py-3 bg-[#0F2A4A] hover:bg-[#163860] text-white rounded-2xl shadow-xl hover:shadow-2xl border-2 border-amber-500/80 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
            title="Open Sahayak Statutory AI Assistant"
          >
            {/* Pulsing beacon */}
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
            </span>

            {/* Bot Icon */}
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-4 h-4 text-slate-950" />
            </div>

            {/* Label */}
            <div className="text-left">
              <div className="text-xs font-bold text-amber-300 flex items-center space-x-1">
                <span>Ask Sahayak AI</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-[10px] text-slate-300 max-w-[140px] truncate">
                {activeProductName ? `Context: ${activeProductName}` : 'Statutory Legal Chat'}
              </div>
            </div>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SLIDE-OUT SIDE CHATBOT PANEL / MODAL                                   */}
      {/* ========================================================================= */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isExpanded
              ? 'inset-3 sm:inset-6 md:inset-10'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-full max-w-[440px] h-[640px] max-h-[85vh]'
          }`}
        >
          {/* Card Container */}
          <div className="w-full h-full rounded-2xl sm:rounded-3xl bg-white shadow-2xl border-2 border-amber-500/40 flex flex-col overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="bg-[#0F2A4A] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-amber-500/30">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
                  <Bot className="w-5 h-5 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    Sahayak AI Assistant
                  </h3>
                  <p className="text-[11px] text-amber-200/90 truncate">
                    {activeProductName ? (
                      <span>Active: <strong>{activeProductName}</strong> {activeCategory ? `(${activeCategory})` : ''}</span>
                    ) : (
                      <span>Indian & International Ayush IPR Consultation</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title={isExpanded ? 'Minimize Window' : 'Expand Window'}
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Close Chatbot"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body: Embedded Grounded Chat */}
            <div className="flex-1 overflow-hidden relative">
              <Chat
                session={session}
                onSendMessage={onSendMessage}
                onResetSession={onResetSession}
                onOpenKnowledgeBase={onOpenKnowledgeBase}
                onOpenFacilitator={onOpenFacilitator}
                isLoading={isLoading}
                isLocked={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
