import React, { useState } from 'react';
import { UserSession, ClassificationResult, WizardAnswers } from '../api/client.js';
import { useTranslation } from '../i18n/index.js';
import { ConfidenceBadge } from './ConfidenceBadge.js';
import { ABSHelper } from './ABSHelper.js';
import { ABSComplianceWorkflow } from './ABSComplianceWorkflow.js';
import { TKDLPointer } from './TKDLPointer.js';
import {
  translateCategory,
  translateStatutoryText,
  translateActName,
  translateSection
} from '../utils/statutoryTranslation.js';
import {
  Layers,
  RotateCcw,
  CheckCircle2,
  Info,
  Sliders,
  ShieldCheck,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface ClassificationPanelProps {
  session: UserSession;
  onClassificationUpdated: (result: ClassificationResult, answers: WizardAnswers) => void;
  onUpdateAbsChecklist: (checklist: any) => void;
  onResetSession: () => void;
  onRequestNewAnalysis?: () => void;
}

export const ClassificationPanel: React.FC<ClassificationPanelProps> = ({
  session,
  onUpdateAbsChecklist,
  onResetSession,
  onRequestNewAnalysis
}) => {
  const { t, lang } = useTranslation();
  const [viewTab, setViewTab] = useState<'dossier' | 'abs'>('dossier');

  const activeResult = session.classificationResult;

  const handleReanalyze = () => {
    if (onRequestNewAnalysis) {
      onRequestNewAnalysis();
    } else {
      onResetSession();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Dossier Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>{t('dashboard.dossierTitle')}</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            {t('dashboard.dossierSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReanalyze}
          className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 transition shadow-2xs cursor-pointer"
          title={t('dashboard.reanalyzeBtn')}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>{t('dashboard.reanalyzeBtn')}</span>
        </button>
      </div>

      {/* Sub-tabs: Statutory Dossier vs ABS Compliance Tracker */}
      <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setViewTab('dossier')}
          className={`py-1.5 px-2 rounded-lg transition text-center truncate cursor-pointer ${
            viewTab === 'dossier'
              ? 'bg-amber-500 text-slate-950 shadow-xs border border-amber-500 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('dashboard.dossierTab')}
        </button>

        <button
          type="button"
          onClick={() => setViewTab('abs')}
          className={`py-1.5 px-2 rounded-lg transition text-center truncate cursor-pointer ${
            viewTab === 'abs'
              ? 'bg-amber-500 text-slate-950 shadow-xs border border-amber-500 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('dashboard.absTab')}
        </button>
      </div>

      {/* TAB 1: Statutory Dossier */}
      {viewTab === 'dossier' && (
        <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
          {activeResult ? (
            <>
              {/* Product Name & Category Badge */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Evaluated Formulation
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {activeResult.product_name || 'Ayurvedic Formulation'}
                    </h3>
                  </div>
                  <ConfidenceBadge confidence={activeResult.confidence} />
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    {t('dashboard.categoryLabel')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-xs border border-amber-200">
                    {translateCategory(activeResult.category, lang)}
                  </span>
                </div>
              </div>

              {/* Formulation Basis & Intended Use */}
              {(activeResult.formulation_basis || activeResult.intended_use) && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                  {activeResult.intended_use && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        {lang === 'hi' ? 'चिकित्सीय प्रयोजन / संकेत:' : lang === 'mr' ? 'उपचारात्मक हेतू / संकेत:' : 'Intended Use / Indication:'}
                      </span>
                      <p className="text-xs text-slate-800 font-medium">
                        {translateStatutoryText(activeResult.intended_use, lang)}
                      </p>
                    </div>
                  )}
                  {activeResult.formulation_basis && (
                    <div className="pt-1.5 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        {lang === 'hi' ? 'शास्त्रीय ग्रंथ संरेखण:' : lang === 'mr' ? 'शास्त्रीय ग्रंथ सुसंगतता:' : 'Classical Text Alignment:'}
                      </span>
                      <p className="text-xs text-slate-800">
                        {translateStatutoryText(activeResult.formulation_basis, lang)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Statutory Reasons (Why Assigned) */}
              {activeResult.why_assigned && (
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-1">
                  <span className="font-bold text-[11px] text-blue-900 flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                    <span>{lang === 'hi' ? 'वैधानिक विधिक कारण:' : lang === 'mr' ? 'वैधानिक कायदेशीर कारणे:' : 'Statutory Legal Reasons:'}</span>
                  </span>
                  <p className="text-xs leading-relaxed text-blue-900">
                    {translateStatutoryText(activeResult.why_assigned, lang)}
                  </p>
                </div>
              )}

              {/* Applicable Regulatory Pathway */}
              {activeResult.regulatory_considerations && (
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <span className="font-bold text-[11px] text-emerald-900 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {lang === 'hi' 
                        ? 'विनियामक लाइसेंसिंग मार्ग (औषधि एवं प्रसाधन सामग्री अधिनियम / SLA):' 
                        : lang === 'mr' 
                        ? 'नियामक परवाना मार्ग (औषध व सौंदर्यप्रसाधने कायदा / SLA):' 
                        : 'Regulatory Route & Licensing (D&C Act / SLA):'}
                    </span>
                  </span>
                  <p className="text-xs leading-relaxed text-emerald-950">
                    {translateStatutoryText(activeResult.regulatory_considerations, lang)}
                  </p>
                </div>
              )}

              {/* IP Strategy & Section 3(p) TKDL */}
              <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-2">
                <span className="font-bold text-[11px] text-purple-900 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>
                    {lang === 'hi' 
                      ? 'पेटेंट एवं बौद्धिक संपदा विचार (धारा 3(p) / TKDL):' 
                      : lang === 'mr' 
                      ? 'पेटंट व बौद्धिक संपदा विचार (कलम 3(p) / TKDL):' 
                      : 'Patent & IP Considerations (Section 3(p)): '}
                  </span>
                </span>
                <p className="text-xs leading-relaxed text-purple-950">
                  {translateStatutoryText(activeResult.patent_potential, lang)}
                </p>
                {activeResult.ip_considerations && (
                  <p className="text-[11px] text-purple-900 leading-relaxed border-t border-purple-200/60 pt-1.5">
                    {translateStatutoryText(activeResult.ip_considerations, lang)}
                  </p>
                )}
              </div>

              {/* ABS Status Banner */}
              {activeResult.abs_status && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs block">{translateStatutoryText(activeResult.abs_status, lang)}</span>
                    <span className="text-[10px] text-amber-800">
                      {session.jurisdiction === 'International'
                        ? (lang === 'hi' ? 'नागोया प्रोटोकॉल / सीमा-पार एबीएस' : lang === 'mr' ? 'नागोया प्रोटोकॉल / आंतरराष्ट्रीय एबीएस' : 'Nagoya Protocol / Cross-Border ABS')
                        : `${translateActName('Biological Diversity Act 2002', lang)} ${lang === 'hi' ? '(धारा 3, 7 / फॉर्म 1)' : lang === 'mr' ? '(कलम ३, ७ / अर्ज १)' : 'Form 1'}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewTab('abs')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    {lang === 'hi' ? 'एबीएस ट्रैकर देखें' : lang === 'mr' ? 'एबीएस ट्रॅकर पहा' : 'View ABS Tracker'}
                  </button>
                </div>
              )}

              {/* TKDL Prior-Art Pointer */}
              <TKDLPointer riskLevel={activeResult.tkdl_3p_risk} />

              {/* Quick Link to Re-analyze */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleReanalyze}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('dashboard.reanalyzeBtn')}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
              <Info className="w-6 h-6 text-slate-400 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">
                {t('dashboard.notClassifiedYet')}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('dashboard.notClassifiedDesc')}
              </p>
              <button
                type="button"
                onClick={handleReanalyze}
                className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('dashboard.reanalyzeBtn')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ABS Compliance Tracker */}
      {viewTab === 'abs' && (
        <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              <span>
                {session.jurisdiction === 'International'
                  ? (lang === 'hi' ? 'सीमा-पार एबीएस / नागोया प्रोटोकॉल अनुपालन' : lang === 'mr' ? 'आंतरराष्ट्रीय एबीएस / नागोया प्रोटोकॉल अनुपालन' : 'Cross-Border ABS & Nagoya Protocol Compliance')
                  : (lang === 'hi' ? 'जैविक विविधता अधिनियम अनुपालन' : lang === 'mr' ? 'जैविक विविधता कायदा अनुपालन' : 'Biological Diversity Act Compliance')}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setViewTab('dossier')}
              className="text-[11px] text-amber-800 hover:text-amber-950 font-bold cursor-pointer"
            >
              ← Back to Dossier
            </button>
          </div>

          <ABSComplianceWorkflow session={session} />

          {activeResult && activeResult.abs_required && (
            <ABSHelper
              checklist={session.absChecklist}
              onUpdateChecklist={onUpdateAbsChecklist}
            />
          )}
        </div>
      )}
    </div>
  );
};
