import React, { useState, useEffect, useCallback } from 'react';
import { FullProductAnalysisReport, CaseDossier } from '../types/analysis.js';
import { IPProtectionAnalysisCard } from '../components/IPProtectionAnalysisCard.js';
import { ABSRegulatoryComplianceCard } from '../components/ABSRegulatoryComplianceCard.js';
import { CaseDossierModal } from '../components/CaseDossierModal.js';
import { FacilitatorModal } from '../components/FacilitatorModal.js';
import { api, IPProtectionAnalysisResult, ComplianceAnalysisResult } from '../api/client.js';
import { useTranslation } from '../i18n/index.js';
import { exportFullReportToPdf } from '../utils/pdfExport.js';
import {
  translateActName,
  translateSection,
  translateProvision,
  translateCategory,
  translateIpStatus,
  translateStatutoryText
} from '../utils/statutoryTranslation.js';
import {
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Printer,
  ChevronRight,
  ExternalLink,
  Info,
  Scale,
  Building2,
  Leaf,
  Globe2,
  FileText,
  Download
} from 'lucide-react';

interface AnalysisResultProps {
  report: FullProductAnalysisReport;
  onNewAnalysis: () => void;
}

export const AnalysisResultPage: React.FC<AnalysisResultProps> = ({ report, onNewAnalysis }) => {
  const { lang, t } = useTranslation();
  const [ipData, setIpData] = useState<IPProtectionAnalysisResult | null>(report.ipProtectionAnalysis || null);
  const [loadingIp, setLoadingIp] = useState<boolean>(!report.ipProtectionAnalysis);
  const [ipError, setIpError] = useState<string | null>(null);

  // ABS & Regulatory Compliance state
  const [complianceData, setComplianceData] = useState<ComplianceAnalysisResult | null>(null);
  const [loadingCompliance, setLoadingCompliance] = useState<boolean>(true);
  const [complianceError, setComplianceError] = useState<string | null>(null);

  const fetchIpAnalysis = useCallback(async () => {
    if (!report || !report.productSummary) return;
    setLoadingIp(true);
    setIpError(null);

    const jur = report.jurisdiction || 'India';
    const targetLang = (lang as string) || (report.language as string) || 'en';

    const ingredientsStr = Array.isArray(report.productSummary.ingredients)
      ? report.productSummary.ingredients.join(', ')
      : (report.productSummary.ingredients || '');

    const followsClassical =
      (report.productSummary as any)?.followsClassicalText ||
      (report.traditionalKnowledge?.traditionalKnowledgeInvolved ? 'yes' : 'no');

    const productContext = {
      productName: report.productSummary.productName || 'Ayurvedic Product',
      product_name: report.productSummary.productName || 'Ayurvedic Product',
      ingredients: ingredientsStr,
      intendedUse: report.productSummary.productDescription || '',
      dosageForm: (report.productSummary as any)?.dosageForm || 'Standard Formulation',
      followsClassicalText: followsClassical,
      targetMarket: report.productSummary.targetMarket || jur,
      category: report.classification?.category || 'Classical Ayurvedic Medicine',
      jurisdiction: jur,
      language: targetLang,
      noveltyAspects: (report.productSummary as any)?.noveltyAspects,
      claimsMade: (report.productSummary as any)?.claimsMade
    };

    try {
      const result = await api.ip.analyze(productContext, jur, targetLang);
      if (result && result.ipCategories) {
        setIpData(result);
      } else {
        throw new Error('Incomplete IP analysis payload');
      }
    } catch (err: any) {
      console.error('Failed to fetch IP Protection analysis:', err);
      setIpError(err?.message || 'Failed to load IP Protection Analysis');
    } finally {
      setLoadingIp(false);
    }
  }, [report, lang]);

  const fetchComplianceAnalysis = useCallback(async () => {
    if (!report || !report.productSummary) return;
    setLoadingCompliance(true);
    setComplianceError(null);

    const jur = report.jurisdiction || 'India';
    const targetLang = (lang as string) || (report.language as string) || 'en';

    const ingredientsStr = Array.isArray(report.productSummary.ingredients)
      ? report.productSummary.ingredients.join(', ')
      : (report.productSummary.ingredients || '');

    const followsClassical =
      (report.productSummary as any)?.followsClassicalText ||
      (report.traditionalKnowledge?.traditionalKnowledgeInvolved ? 'yes' : 'no');

    const productContext = {
      productName: report.productSummary.productName || 'Ayurvedic Product',
      product_name: report.productSummary.productName || 'Ayurvedic Product',
      ingredients: ingredientsStr,
      intendedUse: report.productSummary.productDescription || '',
      dosageForm: (report.productSummary as any)?.dosageForm || 'Standard Formulation',
      followsClassicalText: followsClassical,
      targetMarket: report.productSummary.targetMarket || jur,
      category: report.classification?.category || 'Classical Ayurvedic Medicine',
      jurisdiction: jur,
      language: targetLang,
      sourceOfIngredients: (report.productSummary as any)?.sourceOfIngredients || 'Domestic cultivated',
      manufacturingDetails: (report.productSummary as any)?.manufacturingDetails,
      claimsMade: (report.productSummary as any)?.claimsMade
    };

    try {
      const result = await api.compliance.analyze(productContext, jur, targetLang);
      if (result && result.biodiversityABS) {
        setComplianceData(result);
      } else {
        throw new Error('Incomplete compliance analysis payload');
      }
    } catch (err: any) {
      console.error('Failed to fetch ABS & Regulatory compliance:', err);
      setComplianceError(err?.message || 'Failed to load ABS & Regulatory Compliance');
    } finally {
      setLoadingCompliance(false);
    }
  }, [report, lang]);

  useEffect(() => {
    if (!report.ipProtectionAnalysis) {
      fetchIpAnalysis();
    }
    fetchComplianceAnalysis();
  }, [report, fetchIpAnalysis, fetchComplianceAnalysis]);

  // Case Dossier Modal state
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [dossierData, setDossierData] = useState<CaseDossier | null>(null);
  const [isLoadingDossier, setIsLoadingDossier] = useState(false);

  // Human Facilitator Review Modal state
  const [isFacilitatorModalOpen, setIsFacilitatorModalOpen] = useState(false);

  const handleOpenDossier = async () => {
    if (dossierData) {
      setIsDossierModalOpen(true);
      return;
    }

    setIsLoadingDossier(true);
    const jur = report.jurisdiction || 'India';
    const ingredientsStr = Array.isArray(report.productSummary.ingredients)
      ? report.productSummary.ingredients.join(', ')
      : (report.productSummary.ingredients || '');
    const followsClassical = (report.productSummary as any)?.followsClassicalText || (report.traditionalKnowledge?.traditionalKnowledgeInvolved ? 'yes' : 'no');

    try {
      const res = await api.dossier.create({
        productContext: {
          productName: report.productSummary.productName,
          ingredients: ingredientsStr,
          intendedUse: report.productSummary.productDescription,
          dosageForm: (report.productSummary as any)?.dosageForm || 'Unspecified Form',
          followsClassicalText: followsClassical,
          targetMarket: report.productSummary.targetMarket || jur
        },
        classification: report.classification,
        ipProtectionAnalysis: ipData || report.ipProtectionAnalysis,
        complianceAnalysis: complianceData,
        citations: report.citations || []
      });
      if (res?.dossier) {
        setDossierData(res.dossier);
        setIsDossierModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to open dossier in AnalysisResultPage:', err);
      // Fallback: build minimal dossier
      const fallback: CaseDossier = {
        caseId: `CASE-${(report.productSummary.productName || 'AYUR').slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        title: `Statutory Case Dossier — ${report.productSummary.productName}`,
        statusLabel: 'Completed Analysis',
        timestamp: new Date().toISOString(),
        language: lang,
        jurisdiction: report.jurisdiction,
        productInformation: {
          productName: report.productSummary.productName,
          ingredients: ingredientsStr,
          intendedUse: report.productSummary.productDescription || '',
          dosageForm: (report.productSummary as any)?.dosageForm || 'Standard Formulation',
          followsClassicalText: followsClassical,
          targetMarket: report.productSummary.targetMarket || jur
        },
        classification: {
          category: report.classification.category,
          confidence: report.classification.confidence,
          statutoryBasis: report.classification.statutoryBasis,
          reasoning: report.classification.reasoning
        },
        ipProtectionAnalysis: ipData || report.ipProtectionAnalysis || {
          summary: 'Evaluated under 7 statutory IP regimes.',
          ipCategories: []
        },
        absRegulatoryCompliance: complianceData ? {
          summary: complianceData.summary,
          biodiversityABS: complianceData.biodiversityABS,
          nbaApproval: complianceData.nbaApproval,
          traditionalKnowledgeTKDL: complianceData.traditionalKnowledgeTKDL,
          regulatoryRequirements: complianceData.regulatoryRequirements
        } : {
          biodiversityABS: {} as any,
          nbaApproval: {} as any,
          traditionalKnowledgeTKDL: {} as any,
          regulatoryRequirements: {} as any
        },
        ragEvidence: (report.citations || []).map(c => ({
          document: c.source,
          section: c.section,
          authority: c.authority,
          textSnippet: c.contextSnippet,
          sourceUrl: c.sourceUrl
        })),
        uncertaintyFlags: [],
        humanReviewStatus: 'Submitted',
        disclaimer: 'Statutory decision support only.'
      };
      setDossierData(fallback);
      setIsDossierModalOpen(true);
    } finally {
      setIsLoadingDossier(false);
    }
  };

  const handleDownloadPdf = () => {
    exportFullReportToPdf(report, lang);
  };

  const handlePrint = () => {
    window.print();
  };

  // Localized headers and labels
  const ui = {
    topBannerBadge: lang === 'hi' ? 'आईपी-शक्ति • विधिक एवं विनियामक निर्णय-समर्थन रिपोर्ट' : lang === 'mr' ? 'आयपी-शक्ती • कायदेशीर व नियामक निर्णय-सहाय्य अहवाल' : 'IP-SAKTI • Legal & Regulatory Decision-Support Report',
    topBannerDesc: lang === 'hi'
      ? 'यह रिपोर्ट धारा 3(p), 3(e), टीकेडीएल पूर्व कला, जैव विविधता (ABS) एवं विनियामक अनुपालन का प्रारंभिक निर्णय-समर्थन मूल्यांकन प्रस्तुत करती है।'
      : lang === 'mr'
      ? 'हा अहवाल कलम ३(p), ३(e), टीकेडीएल पूर्व कला, जैविक विविधता (ABS) आणि नियामक अनुपालनाचे प्राथमिक निर्णय-सहाय्य मूल्यांकन सादर करतो.'
      : 'This report provides a preliminary decision-support assessment of patentability provisions (Section 3(p), 3(e)), TKDL prior art, ABS statutory mandates, and regulatory pathways based strictly on retrieved legal provisions.',
    viewDossier: lang === 'hi' ? 'केस डोजियर देखें' : lang === 'mr' ? 'केस डॉझियर पहा' : 'View Case Dossier',
    downloadPdf: lang === 'hi' ? 'रिपोर्ट डाउनलोड करें (PDF)' : lang === 'mr' ? 'अहवाल डाउनलोड करा (PDF)' : 'Download PDF Report',
    printReport: lang === 'hi' ? 'रिपोर्ट प्रिंट करें' : lang === 'mr' ? 'अहवाल मुद्रित करा' : 'Print Report',
    newAnalysis: lang === 'hi' ? 'नया विश्लेषण' : lang === 'mr' ? 'नवीन विश्लेषण' : 'New Analysis',
    sec1Title: lang === 'hi' ? '1. उत्पाद सारांश एवं वैधानिक वर्गीकरण' : lang === 'mr' ? '१. उत्पादन सारांश व वैधानिक वर्गीकरण' : '1. Product Summary & Statutory Classification',
    sec4Title: lang === 'hi' ? '4. पारंपरिक ज्ञान एवं जैव विविधता मूल्यांकन' : lang === 'mr' ? '४. पारंपारिक ज्ञान व जैवविविधता मूल्यांकन' : '4. Traditional Knowledge & Biodiversity Assessment',
    sec5Title: lang === 'hi' ? '5. महत्वपूर्ण जोखिम एवं ध्यान योग्य क्षेत्र' : lang === 'mr' ? '५. गंभीर जोखीम व लक्ष देण्याचे क्षेत्र' : '5. Critical Risks & Attention Areas',
    sec6Title: lang === 'hi' ? '6. अनुशंसित वैधानिक आगामी कदम' : lang === 'mr' ? '६. शिफारस केलेले कायदेशीर पुढील पावले' : '6. Recommended Statutory Next Steps',
    sec7Title: lang === 'hi' ? '7. विधिक संश्लेषण एवं आधिकारिक साक्ष्य उद्धरण' : lang === 'mr' ? '७. कायदेशीर संश्लेषण व अधिकृत संदर्भ' : '7. Legal Synthesis & Authoritative Citations',
    productName: lang === 'hi' ? 'उत्पाद का नाम' : lang === 'mr' ? 'उत्पादनाचे नाव' : 'Product Name',
    classification: lang === 'hi' ? 'वर्गीकरण' : lang === 'mr' ? 'वर्गीकरण' : 'Classification',
    jurisdiction: lang === 'hi' ? 'अधिकार क्षेत्र' : lang === 'mr' ? 'अधिकारक्षेत्र' : 'Jurisdiction',
    targetMarket: lang === 'hi' ? 'लक्षित बाजार' : lang === 'mr' ? 'लक्षित बाजार' : 'Target Market',
    statutoryBasis: lang === 'hi' ? 'वैधानिक आधार:' : lang === 'mr' ? 'कायदेशीर आधार:' : 'Statutory Basis:',
    reasoning: lang === 'hi' ? 'वर्गीकरण के कारण:' : lang === 'mr' ? 'वर्गीकरणाची कारणे:' : 'Reasoning:',
    disclaimer: lang === 'hi'
      ? 'यह एआई-जनित मूल्यांकन केवल कानूनी एवं विनियामक अनुसंधान और निर्णय-समर्थन उद्देश्यों के लिए है। यह कानूनी सलाह, वैधानिक अनापत्ति, विनियामक स्वीकृति या अंतिम निर्णय नहीं है। संबंधित प्राधिकरण या योग्य कानूनी/विनियामक विशेषज्ञ के साथ लागू आवश्यकताओं का सत्यापन करें।'
      : lang === 'mr'
      ? 'हे एआय-व्युत्पन्न मूल्यांकन केवळ कायदेशीर व नियामक संशोधन आणि निर्णय-सहाय्यासाठी आहे. हा कोणताही कायदेशीर सल्ला, वैधानिक मंजुरी, नियामक मान्यता किंवा अंतिम निर्णय नाही. संबंधित प्राधिकरणाकडे किंवा पात्र कायदेशीर/नियामक तज्ज्ञांकडून लागू आवश्यकतांची खात्री करा.'
      : 'This AI-generated assessment is for legal and regulatory research and decision-support purposes only. It does not constitute legal advice, statutory clearance, regulatory approval, or a final determination. Verify applicable requirements with the relevant authority or qualified legal/regulatory professional.'
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-3 sm:px-4 space-y-6 sm:space-y-8">
      {/* Top Banner & Actions - Fully responsive, no overlap */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1 flex-wrap">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{ui.topBannerBadge}</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold truncate">{report.productSummary.productName}</h1>
          <p className="text-xs text-amber-100 mt-1 max-w-2xl leading-relaxed">
            {ui.topBannerDesc}
          </p>
        </div>

        {/* Action Buttons - Clean Wrap, No Overlap */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Action 1: View Case Dossier (Single authoritative dossier viewer) */}
          <button
            type="button"
            onClick={handleOpenDossier}
            disabled={isLoadingDossier}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-colors cursor-pointer shadow-sm text-center"
          >
            <FileText className="w-4 h-4 text-slate-950 shrink-0" />
            <span>{isLoadingDossier ? (lang === 'hi' ? 'डोजियर खुल रहा है...' : lang === 'mr' ? 'डॉझियर उघडत आहे...' : 'Loading Dossier...') : ui.viewDossier}</span>
          </button>

          {/* Action 2: Download Report in PDF format */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm text-center"
            title="Download full statutory report in PDF format"
          >
            <Download className="w-4 h-4 text-white shrink-0" />
            <span>{ui.downloadPdf}</span>
          </button>

          {/* Action 3: Print Report */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-colors cursor-pointer text-center"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{ui.printReport}</span>
          </button>

          {/* Action 4: New Analysis */}
          <button
            type="button"
            onClick={onNewAnalysis}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700 text-center"
          >
            <span>{ui.newAnalysis}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. PRODUCT SUMMARY & STATUTORY CLASSIFICATION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-3 mb-4">
          <FileCheck2 className="w-5 h-5 text-amber-700 shrink-0" />
          <span>{ui.sec1Title}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block uppercase font-medium">{ui.productName}</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
              {report.productSummary.productName}
            </span>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-xs text-amber-800 block uppercase font-semibold">{ui.classification}</span>
            <span className="text-sm font-bold text-amber-950 mt-0.5 block">
              {translateCategory(report.classification.category, lang)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block uppercase font-medium">{ui.jurisdiction}</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {report.jurisdiction}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block uppercase font-medium">{ui.targetMarket}</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
              {report.productSummary.targetMarket || 'Domestic India'}
            </span>
          </div>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
          <div className="text-xs font-bold text-slate-800 mb-1">{ui.statutoryBasis}</div>
          <div className="text-xs font-semibold text-amber-900 mb-2">
            {translateActName(report.classification.statutoryBasis, lang)}
          </div>
          <div className="text-xs font-bold text-slate-800 mb-1">{ui.reasoning}</div>
          <ul className="space-y-1 text-xs text-slate-700">
            {report.classification.reasoning.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{translateStatutoryText(r, lang)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. IP PROTECTION ANALYSIS (7 STATUTORY COLLAPSIBLE CARDS) */}
      {(loadingIp || ipData || ipError) && (
        <IPProtectionAnalysisCard
          data={ipData}
          isLoading={loadingIp}
          error={ipError}
          onRetry={fetchIpAnalysis}
          productName={report.productSummary?.productName}
          categoryName={report.classification?.category}
        />
      )}

      {/* 3. ABS & REGULATORY COMPLIANCE ANALYSIS (4 STATUTORY PILLARS) */}
      {(loadingCompliance || complianceData || complianceError) && (
        <ABSRegulatoryComplianceCard
          data={complianceData}
          isLoading={loadingCompliance}
          error={complianceError}
          onRetry={fetchComplianceAnalysis}
          productName={report.productSummary?.productName}
          categoryName={report.classification?.category}
        />
      )}

      {/* ADDITIONAL IP CONSIDERATIONS & SAFEGUARDS */}
      {report.ipConsiderations && report.ipConsiderations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-3 mb-4">
            <Scale className="w-5 h-5 text-amber-700 shrink-0" />
            <span>
              {lang === 'hi' ? 'अतिरिक्त बौद्धिक संपदा सुरक्षा एवं विचारणीय बिंदु' : lang === 'mr' ? 'अतिरिक्त बौद्धिक संपदा संरक्षण व विचार' : 'Additional IP Considerations & Safeguards'}
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.ipConsiderations.map((ip, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">
                      {translateCategory(ip.category, lang)}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        ip.status.includes('Eligible')
                          ? 'bg-emerald-100 text-emerald-800'
                          : ip.status.includes('Barred') || ip.status.includes('Caution')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {translateIpStatus(ip.status, lang)}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-amber-800 mb-1.5">
                    {lang === 'hi' ? 'वैधानिक नियम' : lang === 'mr' ? 'कायदेशीर नियम' : 'Statutory Rule'}: {translateProvision(ip.statutoryProvision, lang)}
                  </div>

                  {ip.evidenceSnippet && (
                    <p className="text-xs text-slate-600 italic bg-white p-2 rounded border border-slate-100 mb-3">
                      "{translateStatutoryText(ip.evidenceSnippet, lang)}"
                    </p>
                  )}

                  <div className="space-y-1 mb-3">
                    <span className="text-xs font-bold text-slate-700 block">
                      {lang === 'hi' ? 'मुख्य निष्कर्ष:' : lang === 'mr' ? 'मुख्य निष्कर्ष:' : 'Key Findings:'}
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {ip.keyFindings.map((kf, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400">•</span>
                          <span>{translateStatutoryText(kf, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TRADITIONAL KNOWLEDGE & BIODIVERSITY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-3 mb-4">
          <Leaf className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{ui.sec4Title}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl border border-amber-200 bg-amber-50">
            <span className="text-xs font-bold text-amber-900 uppercase block mb-1">
              {lang === 'hi' ? 'टीकेडीएल पूर्व-कला प्रकटीकरण' : lang === 'mr' ? 'टीकेडीएल पूर्व-कला प्रकटीकरण' : 'TKDL Prior-Art Exposure'}
            </span>
            <p className="text-xs text-slate-700">
              {translateStatutoryText(report.traditionalKnowledge.tkdlPriorArtExposure, lang)}
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl border border-red-200 bg-red-50">
            <span className="text-xs font-bold text-red-900 uppercase block mb-1">
              {lang === 'hi' ? 'पेटेंट अधिनियम धारा 3(p) स्थिति' : lang === 'mr' ? 'पेटंट कायदा कलम 3(p) स्थिती' : 'Patents Act Section 3(p) Status'}
            </span>
            <p className="text-xs text-slate-700">
              {translateStatutoryText(report.traditionalKnowledge.patentsActSection3pStatus, lang)}
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl border border-emerald-200 bg-emerald-50">
            <span className="text-xs font-bold text-emerald-900 uppercase block mb-1">
              {lang === 'hi' ? 'एबीएस (ABS) मूल्यांकन स्थिति' : lang === 'mr' ? 'एबीएस (ABS) मूल्यांकन स्थिती' : 'ABS Assessment Status'}
            </span>
            <p className="text-xs text-slate-700">
              {translateStatutoryText(report.traditionalKnowledge.absClearanceRequired, lang)}
            </p>
          </div>
        </div>
      </div>

      {/* 5. RISKS & ATTENTION AREAS */}
      {report.risksAndAttentionAreas && report.risksAndAttentionAreas.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{ui.sec5Title}</span>
          </h2>

          <div className="space-y-3">
            {report.risksAndAttentionAreas.map((risk, i) => (
              <div
                key={i}
                className="p-3.5 sm:p-4 rounded-xl border border-red-100 bg-red-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-200 text-red-900">
                      {translateIpStatus(risk.severity, lang)}: {translateStatutoryText(risk.area, lang)}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Ref: {translateProvision(risk.statutoryRef, lang)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {translateStatutoryText(risk.description, lang)}
                  </p>
                </div>
                <div className="self-start sm:self-auto shrink-0 bg-white px-3 py-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-900 whitespace-nowrap">
                  {translateStatutoryText(risk.actionRequired, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. RECOMMENDED NEXT STEPS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{ui.sec6Title}</span>
        </h2>

        <ol className="space-y-2 text-xs text-slate-800 list-decimal list-inside">
          {report.recommendedNextSteps.map((step, idx) => (
            <li key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-medium leading-relaxed">
              <span>{translateStatutoryText(step, lang)}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 7. LEGAL SYNTHESIS & AUTHORITATIVE CITATIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-3 mb-4">
          <BookOpen className="w-5 h-5 text-amber-700 shrink-0" />
          <span>{ui.sec7Title}</span>
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-800 whitespace-pre-line mb-6 font-serif">
          {translateStatutoryText(report.groundedSynthesis, lang)}
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            {lang === 'hi' ? `आधिकारिक विधिक साक्ष्य उद्धरण (${report.citations.length})` : lang === 'mr' ? `अधिकृत कायदेशीर संदर्भ पुरावे (${report.citations.length})` : `Authoritative Statutory Citations (${report.citations.length})`}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.citations.map((c, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 transition-colors space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {translateActName(c.source, lang)}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 shrink-0">
                    {translateSection(c.section, lang)}
                  </span>
                </div>
                {c.authority && (
                  <div className="text-xs text-slate-500">
                    {lang === 'hi' ? 'प्राधिकरण' : lang === 'mr' ? 'प्राधिकरण' : 'Authority'}: {translateStatutoryText(c.authority, lang)}
                  </div>
                )}
                {c.contextSnippet && (
                  <p className="text-[11px] text-slate-600 italic line-clamp-2">
                    "{translateStatutoryText(c.contextSnippet, lang)}"
                  </p>
                )}
                {c.sourceUrl && (
                  <a
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 pt-1 font-medium"
                  >
                    <span>{lang === 'hi' ? 'आधिकारिक राजपत्र / विधिक स्रोत' : lang === 'mr' ? 'अधिकृत राजपत्र / कायदेशीर स्त्रोत' : 'Official Gazette / Statutory Source'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-slate-700 leading-relaxed space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-amber-950 text-xs">
            <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{lang === 'hi' ? 'वैधानिक विनियामक अस्वीकरण' : lang === 'mr' ? 'वैधानिक नियामक अस्वीकरण' : 'Regulatory Decision-Support Disclaimer'}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {ui.disclaimer}
          </p>
        </div>
      </div>

      {/* Case Dossier Modal (Single Dossier Modal) */}
      <CaseDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        caseDossier={dossierData}
        onRequestHumanReview={() => {
          setIsDossierModalOpen(false);
          setIsFacilitatorModalOpen(true);
        }}
      />

      {/* Facilitator Review Request Modal */}
      <FacilitatorModal
        isOpen={isFacilitatorModalOpen}
        onClose={() => setIsFacilitatorModalOpen(false)}
        dossier={dossierData}
      />
    </div>
  );
};
