import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { CaseDossier, CaseDossierCitation, IPProtectionCategoryItem } from '../types/analysis.js';
import { useTranslation } from '../i18n/index.js';
import { useAuth } from '../context/AuthContext.js';
import { exportCaseDossierToPdf } from '../utils/pdfExport.js';
import {
  translateProvision,
  translateSection,
  translateActName,
  translateCategory,
  translateIpCategoryName,
  translateIpStatus,
  translateStatutoryText
} from '../utils/statutoryTranslation.js';
import {
  FileText,
  X,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Leaf,
  Scale,
  Sparkles,
  UserCheck,
  Layers,
  Clock,
  Globe,
  Tag,
  BookOpen
} from 'lucide-react';

interface CaseDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseDossier: CaseDossier | null;
  onRequestHumanReview?: () => void;
  onExportJson?: () => void;
  onExportTextPdf?: () => void;
}

export const CaseDossierModal: React.FC<CaseDossierModalProps> = ({
  isOpen,
  onClose,
  caseDossier,
  onRequestHumanReview,
  onExportJson,
  onExportTextPdf
}) => {
  const { t, lang } = useTranslation();
  const { user } = useAuth();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    classification: true,
    ipProtection: true,
    absRegulatory: true,
    ragEvidence: false,
    uncertainties: true
  });

  const [expandedIpCats, setExpandedIpCats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // If opened with high severity uncertainties, ensure uncertainties section is open
    if (caseDossier?.uncertaintyFlags && caseDossier.uncertaintyFlags.length > 0) {
      setExpandedSections((prev) => ({ ...prev, uncertainties: true }));
    }
  }, [caseDossier]);

  if (!isOpen || !caseDossier) return null;

  const toggleSection = (sec: string) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const toggleIpCat = (catKey: string) => {
    setExpandedIpCats((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const expandAll = () => {
    setExpandedSections({
      summary: true,
      classification: true,
      ipProtection: true,
      absRegulatory: true,
      ragEvidence: true,
      uncertainties: true
    });
    const ipExpanded: Record<string, boolean> = {};
    caseDossier.ipProtectionAnalysis?.ipCategories?.forEach((cat) => {
      ipExpanded[cat.category] = true;
    });
    setExpandedIpCats(ipExpanded);
  };

  const collapseAll = () => {
    setExpandedSections({
      summary: false,
      classification: false,
      ipProtection: false,
      absRegulatory: false,
      ragEvidence: false,
      uncertainties: false
    });
    setExpandedIpCats({});
  };

  // Safe Export JSON
  const handleExportJson = () => {
    if (onExportJson) {
      onExportJson();
      return;
    }
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(caseDossier, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${caseDossier.caseId}_Dossier_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to export JSON:', err);
    }
  };

  // Safe Print Report
  const handlePrint = () => {
    window.print();
  };

  // Safe Export PDF format download
  const handleExportTextPdf = async () => {
    if (onExportTextPdf) {
      onExportTextPdf();
      return;
    }
    try {
      exportCaseDossierToPdf(caseDossier, lang);
    } catch (err) {
      console.error('Failed to export dossier PDF:', err);
      // Fallback: trigger print
      window.print();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Relevant':
      case 'Applicable':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Potentially Relevant':
      case 'Potentially Applicable':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Needs Human Review':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Not Indicated':
      case 'Not available':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const prod = caseDossier.productInformation || ({} as any);
  const cls = caseDossier.classification || ({} as any);
  const ipData = caseDossier.ipProtectionAnalysis || ({} as any);
  const ipCategories: IPProtectionCategoryItem[] = ipData.ipCategories || [];
  const abs = caseDossier.absRegulatoryCompliance || ({} as any);
  const citations: CaseDossierCitation[] = caseDossier.ragEvidence || [];
  const flags = caseDossier.uncertaintyFlags || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scaleUp">
        {/* Dossier Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {caseDossier.caseId}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(caseDossier.timestamp).toLocaleDateString()}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {caseDossier.statusLabel}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {caseDossier.title || t('caseDossier.modalTitle')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('caseDossier.modalSubtitle')}
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={expandAll}
              className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition cursor-pointer"
            >
              {t('caseDossier.expandAll')}
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition cursor-pointer"
            >
              {t('caseDossier.collapseAll')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {/* ========================================================================= */}
          {/* SECTION 1: CASE SUMMARY & PRODUCT INFORMATION                             */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection('summary')}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition cursor-pointer border-b border-slate-200"
            >
              <div className="flex items-center space-x-2 text-left">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {t('caseDossier.caseSummary')} & {t('caseDossier.productInfo')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Case identifier, timestamp, applicant metadata, and formulation attributes
                  </p>
                </div>
              </div>
              {expandedSections.summary ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </button>

            {expandedSections.summary && (
              <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
                {/* Meta details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">{t('caseDossier.caseId')}:</span>
                    <strong className="text-slate-900">{caseDossier.caseId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">{t('caseDossier.date')}:</span>
                    <span className="text-slate-800">{new Date(caseDossier.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">{t('caseDossier.jurisdiction')}:</span>
                    <strong className="text-amber-800">{caseDossier.jurisdiction}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">{t('caseDossier.language')}:</span>
                    <span className="text-slate-800 uppercase font-semibold">{caseDossier.language}</span>
                  </div>
                  {caseDossier.applicant && (
                    <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-slate-200 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                      <span><strong>{t('caseDossier.applicant')}:</strong> {caseDossier.applicant.name} ({caseDossier.applicant.role})</span>
                      <span>• {caseDossier.applicant.email}</span>
                    </div>
                  )}
                </div>

                {/* Product formulation table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block font-semibold mb-0.5">{t('caseDossier.productName')}</span>
                    <span className="font-bold text-slate-900 text-sm">{prod.productName || t('caseDossier.notAvailable')}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block font-semibold mb-0.5">{t('caseDossier.dosageForm')}</span>
                    <span className="text-slate-900 font-medium">{prod.dosageForm || t('caseDossier.notAvailable')}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 md:col-span-2">
                    <span className="text-slate-500 block font-semibold mb-0.5">{t('caseDossier.ingredients')}</span>
                    <span className="text-slate-900 font-mono text-[11px] leading-relaxed block bg-slate-50 p-2 rounded border border-slate-100">
                      {prod.ingredients || t('caseDossier.notAvailable')}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block font-semibold mb-0.5">{t('caseDossier.intendedUse')}</span>
                    <span className="text-slate-800 leading-relaxed">{prod.intendedUse || t('caseDossier.notAvailable')}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block font-semibold mb-0.5">{t('caseDossier.classicalStatus')}</span>
                    <span className="text-slate-800 font-semibold">{prod.followsClassicalText || t('caseDossier.notAvailable')}</span>
                    <div className="text-[11px] text-slate-500 mt-1">
                      <strong>{t('caseDossier.targetMarket')}:</strong> {prod.targetMarket || caseDossier.jurisdiction}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: PRODUCT CLASSIFICATION                                         */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection('classification')}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition cursor-pointer border-b border-slate-200"
            >
              <div className="flex items-center space-x-2 text-left">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {t('caseDossier.productClassification')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Assigned regulatory category, statutory confidence, and legal pathways
                  </p>
                </div>
              </div>
              {expandedSections.classification ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </button>

            {expandedSections.classification && (
              <div className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div>
                    <span className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider block">
                      {t('caseDossier.category')}
                    </span>
                    <h4 className="text-base font-black text-emerald-950">
                      {translateCategory(cls.category, lang) || t('caseDossier.notAvailable')}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-600 font-semibold">{t('caseDossier.confidence')}:</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-emerald-900 border border-emerald-300 shadow-2xs">
                      {translateIpStatus(cls.confidence || 'High', lang)}
                    </span>
                  </div>
                </div>

                {cls.regulatoryPathway && cls.regulatoryPathway.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">
                      {t('caseDossier.regulatoryPathway')}:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                      {cls.regulatoryPathway.map((p: string, idx: number) => (
                        <li key={idx}>{translateStatutoryText(p, lang)}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {cls.reasoning && cls.reasoning.length > 0 && (
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <span className="font-bold text-slate-800 block">
                      {t('caseDossier.statutoryReasoning')}:
                    </span>
                    <ul className="space-y-1 text-slate-700">
                      {cls.reasoning.map((r: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{translateStatutoryText(r, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: IP PROTECTION ANALYSIS (7 STATUTORY CATEGORIES)                */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection('ipProtection')}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition cursor-pointer border-b border-slate-200"
            >
              <div className="flex items-center space-x-2 text-left">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {t('caseDossier.ipProtection')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Status, explanation, legal provisions, evidence, and citations across all 7 pathways
                  </p>
                </div>
              </div>
              {expandedSections.ipProtection ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </button>

            {expandedSections.ipProtection && (
              <div className="p-4 sm:p-5 space-y-3">
                {ipCategories && ipCategories.length > 0 ? (
                  ipCategories.map((cat, idx) => {
                    const isExpanded = !!expandedIpCats[cat.category];
                    const letterCode = (cat as any).letterCode || String.fromCharCode(65 + idx);
                    return (
                      <div
                        key={cat.category || idx}
                        className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                      >
                        <button
                          type="button"
                          onClick={() => toggleIpCat(cat.category)}
                          className="w-full p-3 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between text-left transition cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded bg-slate-200 font-bold text-xs flex items-center justify-center text-slate-700 shrink-0">
                              {letterCode}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {translateIpCategoryName(cat.category, lang)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                                cat.status
                              )}`}
                            >
                              {translateIpStatus(cat.status, lang)}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-3.5 space-y-2 text-xs border-t border-slate-200 bg-white">
                            <div>
                              <span className="font-semibold text-slate-500 block mb-0.5">
                                {t('caseDossier.explanation')}:
                              </span>
                              <p className="text-slate-800 leading-relaxed">
                                {translateStatutoryText((cat as any).explanation || cat.reason, lang) || t('caseDossier.notAvailable')}
                              </p>
                            </div>

                            {((cat as any).legalProvisions || cat.provisions) &&
                              ((cat as any).legalProvisions || cat.provisions).length > 0 && (
                                <div>
                                  <span className="font-semibold text-slate-500 block mb-0.5">
                                    {t('caseDossier.legalProvisions')}:
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {((cat as any).legalProvisions || cat.provisions).map(
                                      (prov: string, pIdx: number) => (
                                        <span
                                          key={pIdx}
                                          className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-mono text-[10px]"
                                        >
                                          {translateProvision(prov, lang)}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {cat.evidence && (
                              <div>
                                <span className="font-semibold text-slate-500 block mb-0.5">
                                  {t('caseDossier.evidence')}:
                                </span>
                                <p className="text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-200">
                                  "{translateStatutoryText(cat.evidence, lang)}"
                                </p>
                              </div>
                            )}

                            {cat.citations && cat.citations.length > 0 && (
                              <div>
                                <span className="font-semibold text-slate-500 block mb-0.5">
                                  {t('caseDossier.citations')}:
                                </span>
                                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                                  {cat.citations.map((c: any, cIdx: number) => (
                                    <li key={cIdx}>
                                      <strong>{translateActName(c.document || c.source, lang)}</strong> {translateSection(c.section, lang)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                    {t('caseDossier.notAvailable')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: ABS & REGULATORY COMPLIANCE (4 STATUTORY PILLARS)              */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection('absRegulatory')}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition cursor-pointer border-b border-slate-200"
            >
              <div className="flex items-center space-x-2 text-left">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {t('caseDossier.absRegulatory')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Biodiversity (ABS), NBA requirements, TKDL prior art, and statutory licensing pathways
                  </p>
                </div>
              </div>
              {expandedSections.absRegulatory ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </button>

            {expandedSections.absRegulatory && (
              <div className="p-4 sm:p-5 space-y-3 text-xs">
                {/* Pillar A: Biodiversity / ABS */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      <span>A. Biodiversity / ABS Assessment</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        abs.biodiversityABS?.status
                      )}`}
                    >
                      {abs.biodiversityABS?.status || t('caseDossier.notAvailable')}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {abs.biodiversityABS?.explanation || abs.biodiversityABS?.reasoning || t('caseDossier.notAvailable')}
                  </p>
                  {abs.biodiversityABS?.relevantBiologicalResources?.length > 0 && (
                    <div className="text-[11px] text-slate-600">
                      <strong>Resources:</strong> {abs.biodiversityABS.relevantBiologicalResources.join(', ')}
                    </div>
                  )}
                </div>

                {/* Pillar B: NBA Approval */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>B. NBA Approval Assessment</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        abs.nbaApproval?.status
                      )}`}
                    >
                      {abs.nbaApproval?.status || t('caseDossier.notAvailable')}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {abs.nbaApproval?.explanation || abs.nbaApproval?.reasoning || t('caseDossier.notAvailable')}
                  </p>
                  {abs.nbaApproval?.formType && (
                    <div className="text-[11px] text-slate-600">
                      <strong>Form Mandate:</strong> {abs.nbaApproval.formType}
                    </div>
                  )}
                </div>

                {/* Pillar C: Traditional Knowledge / TKDL */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <span>C. Traditional Knowledge / TKDL</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        abs.traditionalKnowledgeTKDL?.status
                      )}`}
                    >
                      {abs.traditionalKnowledgeTKDL?.status || t('caseDossier.notAvailable')}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {abs.traditionalKnowledgeTKDL?.explanation ||
                      abs.traditionalKnowledgeTKDL?.reasoning ||
                      t('caseDossier.notAvailable')}
                  </p>
                  {abs.traditionalKnowledgeTKDL?.effectOnIpProtection && (
                    <div className="text-[11px] text-slate-600">
                      <strong>IP Impact:</strong> {abs.traditionalKnowledgeTKDL.effectOnIpProtection}
                    </div>
                  )}
                </div>

                {/* Pillar D: Product Regulatory Requirements */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <Scale className="w-4 h-4 text-purple-600" />
                      <span>D. Product Regulatory Requirements</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        abs.regulatoryRequirements?.status
                      )}`}
                    >
                      {abs.regulatoryRequirements?.status || t('caseDossier.notAvailable')}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {abs.regulatoryRequirements?.explanation ||
                      abs.regulatoryRequirements?.reasoning ||
                      t('caseDossier.notAvailable')}
                  </p>
                  {abs.regulatoryRequirements?.applicablePathway && (
                    <div className="text-[11px] text-slate-600">
                      <strong>Pathway:</strong> {abs.regulatoryRequirements.applicablePathway} (Authority: {abs.regulatoryRequirements.controllingAuthority || 'State Ayush SLA'})
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: RAG EVIDENCE & CITATIONS                                       */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection('ragEvidence')}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition cursor-pointer border-b border-slate-200"
            >
              <div className="flex items-center space-x-2 text-left">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {t('caseDossier.ragEvidence')} ({citations.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verifiable Act, regulation, section/rule, and authoritative statutory evidence snippets
                  </p>
                </div>
              </div>
              {expandedSections.ragEvidence ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </button>

            {expandedSections.ragEvidence && (
              <div className="p-4 sm:p-5 space-y-3">
                {citations && citations.length > 0 ? (
                  citations.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs hover:border-amber-400 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900">
                          {translateActName(c.document || c.actRegulation || '', lang)}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-mono text-[10px] rounded font-bold shrink-0">
                          {translateSection(c.section || c.sectionRule || '', lang)}
                        </span>
                      </div>
                      {(c.relevantEvidenceSnippet || c.textSnippet) && (
                        <p className="text-slate-600 italic bg-amber-50/30 p-2 rounded border-l-2 border-amber-500 leading-relaxed text-[11px]">
                          "{c.relevantEvidenceSnippet || c.textSnippet}"
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>Authority: {c.authority || 'Statutory Authority'}</span>
                        {c.sourceUrl && (
                          <a
                            href={c.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-700 hover:text-amber-900 flex items-center space-x-1 font-bold"
                          >
                            <span>Gazette / Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                    No statutory citations recorded.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 6: UNCERTAINTIES & HUMAN REVIEW FLAGS                              */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection('uncertainties')}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition cursor-pointer border-b border-slate-200"
            >
              <div className="flex items-center space-x-2 text-left">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-700 flex items-center justify-center font-bold text-xs">
                  6
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {t('caseDossier.uncertainties')} ({flags.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Borderline classifications, missing formulation facts, and human review flags
                  </p>
                </div>
              </div>
              {expandedSections.uncertainties ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </button>

            {expandedSections.uncertainties && (
              <div className="p-4 sm:p-5 space-y-2 text-xs">
                {flags && flags.length > 0 ? (
                  flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl flex items-start space-x-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{flag.dimension}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-rose-700 border border-rose-200">
                            {flag.severity}
                          </span>
                        </div>
                        <p className="text-slate-700">{flag.message}</p>
                        {flag.missingItem && (
                          <div className="text-[11px] text-slate-500 pt-0.5">
                            <strong>Missing / Action Required:</strong> {flag.missingItem}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('caseDossier.noFlagsNotice')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legal Disclaimer */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong>Statutory Notice: </strong>
            {caseDossier.disclaimer}
          </div>
        </div>

        {/* Dossier Footer & Action Buttons */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>{t('caseDossier.exportJson')}</span>
            </button>
            <button
              type="button"
              onClick={handleExportTextPdf}
              className="px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>{t('caseDossier.exportPdf')}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>{t('caseDossier.printReport')}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {onRequestHumanReview && (
              <button
                type="button"
                onClick={onRequestHumanReview}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-slate-950" />
                <span>{t('caseDossier.requestReviewBtn')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition cursor-pointer"
            >
              {t('caseDossier.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
