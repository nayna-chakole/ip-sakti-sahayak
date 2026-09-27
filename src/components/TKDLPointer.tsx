import React from 'react';
import { useTranslation } from '../i18n/index.js';
import { AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface TKDLPointerProps {
  riskLevel: 'High' | 'Medium' | 'Low';
}

export const TKDLPointer: React.FC<TKDLPointerProps> = ({ riskLevel }) => {
  const { lang, t } = useTranslation();

  if (riskLevel === 'Low') return null;

  return (
    <div id="tkdl-pointer-card" className="p-4 bg-orange-50 border border-orange-300 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
            {t('tkdlPointer.title')}
          </h4>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            riskLevel === 'High'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-orange-100 text-orange-800 border border-orange-200'
          }`}
        >
          {riskLevel === 'High'
            ? (lang === 'hi' ? 'उच्च पूर्व कला विचार (Prior Art)' : lang === 'mr' ? 'उच्च पूर्व कला विचार (Prior Art)' : 'High Prior Art Risk')
            : (lang === 'hi' ? 'मध्यम पूर्व कला विचार (Prior Art)' : lang === 'mr' ? 'मध्यम पूर्व कला विचार (Prior Art)' : 'Medium Prior Art Risk')}
        </span>
      </div>

      <p className="text-xs text-slate-700 leading-relaxed">
        {t('tkdlPointer.description')}
      </p>

      <div className="pt-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">
          {lang === 'hi'
            ? 'वैधानिक अपवर्जन: पेटेंट अधिनियम, 1970 (धारा 3(p))'
            : lang === 'mr'
            ? 'कायदेशीर अपवर्जन: पेटंट कायदा, १९७० (कलम 3(p))'
            : 'Statutory consideration: The Patents Act, 1970 (Section 3(p))'}
        </span>
        <a
          href="https://tkdl.res.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white hover:bg-orange-100 text-orange-900 text-xs font-semibold rounded-lg border border-orange-300 transition"
        >
          <span>{t('tkdlPointer.button')}</span>
          <ExternalLink className="w-3 h-3 text-orange-600" />
        </a>
      </div>
    </div>
  );
};
