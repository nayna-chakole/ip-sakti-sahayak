import React, { useState } from 'react';
import { useTranslation } from '../i18n/index.js';
import { useAuth } from '../context/AuthContext.js';
import { RAGResponse, GroundedCitation } from '../types/rag';
import { api } from '../api/client.js';
import {
  translateActName,
  translateSection
} from '../utils/statutoryTranslation.js';
import {
  X,
  Send,
  Loader2,
  Bot,
  Sparkles,
  Lock,
  LogIn,
  UserPlus,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  citations?: GroundedCitation[];
  confidence?: string;
  abstained?: boolean;
}

interface ChatbotFloatingButtonProps {
  currentJurisdiction?: 'India' | 'International';
  productContext?: any;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
}

export const ChatbotFloatingButton: React.FC<ChatbotFloatingButtonProps> = ({
  currentJurisdiction,
  productContext,
  onNavigateLogin,
  onNavigateRegister
}) => {
  const activeJurisdiction = currentJurisdiction || ((typeof window !== 'undefined' && localStorage.getItem('ip_sakti_jurisdiction')) as any) || 'India';
  const { lang } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-legal-chatbot', handleOpen);
    return () => window.removeEventListener('open-legal-chatbot', handleOpen);
  }, []);

  const getWelcomeMessage = (): string => {
    if (lang === 'hi') {
      return 'नमस्ते! मैं सहयक (Sahayak) एआई विधिक सहायक हूँ। आयुर्वेदिक उत्पादों, पेटेंट अधिनियम धारा 3(p), जैव विविधता नियम अथवा विनियामक आवश्यकताओं के बारे में कोई भी प्रश्न अपनी भाषा में पूछें।';
    }
    if (lang === 'mr') {
      return 'नमस्कार! मी सहायक (Sahayak) एआय कायदेशीर सल्लागार आहे. आयुर्वेदिक उत्पादने, पेटंट कायदा कलम 3(p) किंवा जैवविविधता नियमांबद्दल कोणताही प्रश्न विचारा.';
    }
    return 'Welcome to IP-SAKTI Sahayak AI Legal Assistant. Ask any statutory question regarding Ayurvedic products, Patents Act Section 3(p), Biological Diversity ABS requirements, or statutory drug regulations.';
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: getWelcomeMessage()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync welcome message if language changes before conversation
  React.useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'assistant',
            content: getWelcomeMessage()
          }
        ];
      }
      return prev;
    });
  }, [lang]);

  const handleSend = async () => {
    if (!user) {
      return;
    }

    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content: userText
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res: RAGResponse = await api.rag.query(
        userText,
        activeJurisdiction,
        lang as any,
        productContext
      );

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        content: res.answer,
        citations: res.citations,
        confidence: res.confidence,
        abstained: res.abstained
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        content:
          lang === 'hi'
            ? 'विधिक ज्ञानकोष से परामर्श लेते समय एक तकनीकी समस्या उत्पन्न हुई। कृपया अपना प्रश्न पुनः पूछें।'
            : lang === 'mr'
            ? 'कायदेशीर संदर्भ तपासताना एक तांत्रिक अडचण आली. कृपया आपला प्रश्न पुन्हा विचारा.'
            : 'A system error occurred while consulting the authoritative legal corpus. Please try rephrasing your query.',
        abstained: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const currentLangLabel =
    lang === 'hi' ? 'उत्तर भाषा: हिंदी' : lang === 'mr' ? 'उत्तर भाषा: मराठी' : 'Answers: English';

  return (
    <>
      {/* Real AI Assistant Ask Bot Floating Symbol - Compact & Sleek */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-3 py-2.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-[#0F2A4A] via-[#163860] to-[#0A1D33] hover:from-[#13355c] hover:to-[#102a46] text-white rounded-full shadow-xl hover:shadow-amber-500/25 border-2 border-amber-400/90 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          title="Ask Sahayak AI Assistant"
          aria-label="Open Ask Sahayak AI Assistant"
        >
          {/* Pulsing AI Live Status Beacon */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>

          {/* AI Assistant Robot Icon */}
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Bot className="w-4 h-4 text-slate-950" />
          </div>

          {/* Sleek Compact Label */}
          <div className="flex items-center gap-1 text-left pr-0.5">
            <span className="text-xs font-black text-amber-300 whitespace-nowrap">Ask Sahayak</span>
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse hidden sm:inline" />
          </div>
        </button>
      )}

      {/* Floating Chat Modal - Compact & Clean */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 w-auto sm:w-[380px] max-w-[calc(100vw-24px)] h-[calc(100dvh-90px)] sm:h-[500px] max-h-[540px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Real Assistant Ask Bot Header */}
          <div className="bg-gradient-to-r from-[#0F2A4A] via-[#163860] to-[#0A1D33] text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 border-b border-amber-500/40">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Bot Avatar with live badge */}
              <div className="relative w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
                <Bot className="w-5 h-5 text-slate-950" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0F2A4A] rounded-full" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-black truncate text-white">Sahayak AI Assistant</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-400/40 shrink-0">
                    {currentLangLabel}
                  </span>
                </div>
                <span className="text-[10px] text-amber-200/90 truncate block">
                  {productContext?.productName || productContext?.product_name
                    ? `Context: ${productContext.productName || productContext.product_name}`
                    : `Statutory RAG • ${activeJurisdiction} Legal Corpus`}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages & Auth Prompt */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50 overscroll-contain">
            {/* If user is not authenticated, show polite sign-in/register request */}
            {!user && (
              <div className="p-4 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-400/80 rounded-2xl text-center space-y-3 shadow-sm animate-fadeIn">
                <div className="w-11 h-11 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-700">
                  <Lock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {lang === 'hi'
                      ? 'सहयक एआई परामर्श हेतु लॉगिन आवश्यक है'
                      : lang === 'mr'
                      ? 'सहायक एआय सल्लामसलतीसाठी लॉगिन आवश्यक आहे'
                      : 'Sign In or Register to Use Sahayak AI'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {lang === 'hi'
                      ? 'वैधानिक ज्ञानकोष, पेटेंट अधिनियम धारा 3(p) और विनियामक अनुपालन के उद्धृत उत्तर प्राप्त करने हेतु कृपया साइन इन करें अथवा निःशुल्क पंजीकरण करें।'
                      : lang === 'mr'
                      ? 'कायदेशीर संदर्भ, पेटंट कायदा कलम 3(p) आणि विनियामक तरतुदींवर आधारित अचूक उत्तरांसाठी कृपया लॉगिन किंवा नोंदणी करा.'
                      : 'Statutory RAG consultation with live codified citations requires an account. Please sign in or register to chat with Sahayak AI.'}
                  </p>
                </div>
                <div className="space-y-2 pt-1">
                  {onNavigateLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateLogin();
                      }}
                      className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'लॉगिन करें' : lang === 'mr' ? 'लॉगिन करा' : 'Sign In to Ask Questions'}</span>
                    </button>
                  )}
                  {onNavigateRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateRegister();
                      }}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'hi' ? 'नया निःशुल्क खाता बनाएं' : lang === 'mr' ? 'नवीन खाते तयार करा' : 'Create Free Account / Register'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-amber-700 text-white rounded-br-none'
                      : m.abstained
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>

                  {/* Citations */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {lang === 'hi' ? 'वैधानिक उद्धरण / अधिनियम:' : lang === 'mr' ? 'कायदेशीर संदर्भ / कायदे:' : 'Statutory Citations & Acts:'}
                      </div>
                      {m.citations.map((c, idx) => (
                        <div key={idx} className="text-[10px] text-amber-900 font-medium flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900">• {translateActName(c.source || c.document, lang)}</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold border border-amber-200 text-[9px]">
                            {translateSection(c.section, lang)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                <span>{lang === 'hi' ? 'वैधानिक विधिक ज्ञानकोष की खोज...' : lang === 'mr' ? 'कायदेशीर वैधानिक संदर्भ शोधत आहे...' : 'Searching statutory legal corpus...'}</span>
              </div>
            )}
          </div>

          {/* Input or Locked Notice */}
          {!user ? (
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2 text-slate-600 min-w-0">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate text-xs font-semibold">
                  {lang === 'hi'
                    ? 'प्रश्न पूछने के लिए कृपया साइन इन करें'
                    : lang === 'mr'
                    ? 'प्रश्न विचारण्यासाठी कृपया साइन इन करा'
                    : 'Sign in or register to send questions'}
                </span>
              </div>
              {onNavigateLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateLogin();
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shrink-0 cursor-pointer shadow-xs transition"
                >
                  {lang === 'hi' ? 'साइन इन' : lang === 'mr' ? 'साइन इन' : 'Sign In'}
                </button>
              )}
            </div>
          ) : (
            <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask an IP or regulatory question..."
                className="flex-1 px-3 py-2 text-sm sm:text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2.5 sm:p-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
