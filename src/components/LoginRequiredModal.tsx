import React from 'react';
import { useTranslation } from '../i18n/index.js';
import { Lock, ShieldCheck, LogIn, UserPlus, X, Sparkles, AlertCircle } from 'lucide-react';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  actionAttempted?: string;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  isOpen,
  onClose,
  onNavigateLogin,
  onNavigateRegister,
  actionAttempted = 'Formulation Analysis'
}) => {
  const { lang, t } = useTranslation();

  if (!isOpen) return null;

  const content = {
    en: {
      badge: 'Authentication Required',
      title: 'Sign In to Analyze Product',
      subtitle: 'Guest users can inspect features and presets, but analysis requires an account',
      description:
        'You can freely inspect all formulation fields, select sample presets (Triphala, JointCalm, etc.), and view statutory references in guest mode. However, executing AI classification, assessing patentability exclusions (Section 3(p) & 3(e)), and generating official regulatory dossiers requires signing into an active IP-SAKTI account.',
      feature1: 'Previewing inputs, sample formulations & statutory references is always free.',
      feature2: 'Instant statutory classification & citation audit requires user authentication.',
      signInBtn: 'Sign In to Run Analysis',
      registerBtn: 'Create Free Account',
      continueBrowsing: 'Continue Exploring in Guest Mode'
    },
    hi: {
      badge: 'प्रमाणीकरण आवश्यक',
      title: 'उत्पाद विश्लेषण के लिए लॉगिन करें',
      subtitle: 'अतिथि उपयोगकर्ता सभी फ़ील्ड और नमूने देख सकते हैं, परंतु विश्लेषण हेतु लॉगिन अनिवार्य है',
      description:
        'आप बिना लॉगिन किए फॉर्म के सभी फ़ील्ड, शास्त्रीय एवं प्रोप्रायटरी नमूने (त्रिफला, जॉइंटकाल्म आदि) देख और भर सकते हैं। परंतु एआई वैधानिक वर्गीकरण निष्पादित करने, पेटेंटेबिलिटी बहिष्करण (धारा 3(p) और 3(e)) की जांच करने तथा आधिकारिक विनियामक रिपोर्ट प्राप्त करने हेतु लॉगिन आवश्यक है।',
      feature1: 'फ़ॉर्मूलेशन फ़ील्ड, संदर्भ ग्रंथ और नमूनों का अन्वेषण पूरी तरह सुलभ है।',
      feature2: 'सटीक विधिक वर्गीकरण व रिपोर्ट निर्माण हेतु सुरक्षित लॉगिन अनिवार्य है।',
      signInBtn: 'लॉगिन करें और विश्लेषण शुरू करें',
      registerBtn: 'नया निःशुल्क खाता बनाएं',
      continueBrowsing: 'गेस्ट मोड में अन्वेषण जारी रखें'
    },
    mr: {
      badge: 'प्रमाणीकरण आवश्यक',
      title: 'उत्पादन विश्लेषणासाठी लॉगिन करा',
      subtitle: 'अतिथी वापरकर्ते सर्व घटक पाहू शकतात, परंतु विश्लेषणासाठी लॉगिन आवश्यक आहे',
      description:
        'आपण लॉगिन न करता फॉर्म्युलेशन इनपुट, शास्त्रीय आणि प्रोप्रायटरी नमुने (त्रिफळा, जॉईंटकाल्म इत्यादी) तपासू शकता. तथापि, एआय वैधानिक वर्गीकरण, पेटंट पात्रता (कलम 3(p) आणि 3(e)) आणि अधिकृत नियामक अहवाल जनरेट करण्यासाठी लॉगिन आवश्यक आहे.',
      feature1: 'सर्व इनपुट्स, नमुना फॉर्म्युलेशन्स आणि कायदेशीर संदर्भ पाहण्यासाठी खुले आहेत.',
      feature2: 'कायदेशीर वर्गीकरण व विश्लेषण अहवालासाठी वापरकर्ता लॉगिन आवश्यक आहे.',
      signInBtn: 'लॉगिन करा आणि विश्लेषण करा',
      registerBtn: 'नवीन विनामूल्य खाते तयार करा',
      continueBrowsing: 'गेस्ट मोडमध्ये पूर्वावलोकन सुरू ठेवा'
    }
  };

  const c = content[lang as 'en' | 'hi' | 'mr'] || content.en;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border-2 border-amber-400 shadow-2xl space-y-5 animate-scaleUp text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Lock Icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider mb-1">
                {c.badge}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-tight">
                {c.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle & Descriptive Explanation */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {c.description}
        </p>

        {/* Feature Distinction Checklist */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 space-y-2 text-xs text-amber-950">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-slate-700">{c.feature1}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold text-slate-900">{c.feature2}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {onNavigateLogin && (
            <button
              id="login-modal-signin-btn"
              type="button"
              onClick={() => {
                onClose();
                onNavigateLogin();
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{c.signInBtn}</span>
            </button>
          )}

          {onNavigateRegister && (
            <button
              id="login-modal-register-btn"
              type="button"
              onClick={() => {
                onClose();
                onNavigateRegister();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-amber-400 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>{c.registerBtn}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            {c.continueBrowsing}
          </button>
        </div>
      </div>
    </div>
  );
};
