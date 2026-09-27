import React, { useState } from 'react';
import {
  ComplianceAnalysisResult,
  BiodiversityABSSection,
  NBAApprovalSection,
  TraditionalKnowledgeTKDLSection,
  RegulatoryRequirementsSection,
  AuthoritativeCitation
} from '../api/client.js';
import { useTranslation } from '../i18n/index.js';
import {
  translateProvision,
  translateActName,
  translateSection,
  translateStatutoryText,
  translateCategory
} from '../utils/statutoryTranslation.js';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Leaf,
  Building2,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  MinusCircle,
  Layers,
  Sparkles,
  RefreshCw,
  FileText,
  Scale,
  Award
} from 'lucide-react';

interface ABSRegulatoryComplianceCardProps {
  data?: ComplianceAnalysisResult | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onOpenKnowledgeBase?: () => void;
  productName?: string;
  categoryName?: string;
}

export const ABSRegulatoryComplianceCard: React.FC<ABSRegulatoryComplianceCardProps> = ({
  data,
  isLoading = false,
  error = null,
  onRetry,
  onOpenKnowledgeBase,
  productName,
  categoryName
}) => {
  const { lang } = useTranslation();

  // Collapsed by default except short summary
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const expandAll = () => {
    setExpandedSections({
      biodiversityABS: true,
      nbaApproval: true,
      traditionalKnowledgeTKDL: true,
      regulatoryRequirements: true
    });
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  // Localized labels
  const tLabels = {
    header: lang === 'hi'
      ? 'प्रारंभिक एबीएस एवं विनियामक मूल्यांकन'
      : lang === 'mr'
      ? 'प्राथमिक एबीएस व विनियामक मूल्यांकन'
      : 'Preliminary ABS & Regulatory Assessment',
    subtitle: lang === 'hi'
      ? 'जैव विविधता (ABS), राष्ट्रीय जैव विविधता प्राधिकरण (NBA), पारंपरिक ज्ञान (TKDL) एवं विनियामक अनुज्ञापन का प्रारंभिक मूल्यांकन'
      : lang === 'mr'
      ? 'जैवविविधता (ABS), राष्ट्रीय जैवविविधता प्राधिकरण (NBA), पारंपारिक ज्ञान (TKDL) व विनियामक परवान्याचे प्राथमिक मूल्यांकन'
      : 'Preliminary Assessment of Access & Benefit Sharing (NBA), Traditional Knowledge (TKDL), and Regulatory Licensing Framework',

    loadingTitle: lang === 'hi'
      ? 'एबीएस एवं विनियामक अनुपालन का विश्लेषण किया जा रहा है...'
      : lang === 'mr'
      ? 'एबीएस व विनियामक अनुपालनाचे विश्लेषण केले जात आहे...'
      : 'Analyzing ABS & regulatory compliance...',
    loadingSubtitle: lang === 'hi'
      ? 'जैव विविधता अधिनियम, एनबीए, टीकेडीएल एवं औषध व प्रसाधन सामग्री नियमों का मूल्यांकन...'
      : lang === 'mr'
      ? 'जैविक विविधता कायदा, एनबीए, टीकेडीएल आणि औषध व सौंदर्य प्रसाधन नियमांचे मूल्यांकन...'
      : 'Evaluating statutory provisions across BDA 2002, NBA mandates, TKDL prior art, and product licensing...',

    errorTitle: lang === 'hi'
      ? 'एबीएस एवं विनियामक विश्लेषण अस्थायी रूप से अनुपलब्ध है।'
      : lang === 'mr'
      ? 'एबीएस व विनियामक विश्लेषण तात्पुरते अनुपलब्ध आहे.'
      : 'ABS & Regulatory Compliance Analysis is temporarily unavailable.',
    errorDesc: lang === 'hi'
      ? 'आप उत्पाद वर्गीकरण और बौद्धिक संपदा विश्लेषण का उपयोग जारी रख सकते हैं।'
      : lang === 'mr'
      ? 'तुम्ही उत्पादन वर्गीकरण आणि बौद्धिक संपदा विश्लेषण वापरणे सुरू ठेवू शकता.'
      : 'You can continue using the existing classification and IP analysis.',
    retryBtn: lang === 'hi' ? 'पुनः प्रयास करें' : lang === 'mr' ? 'पुन्हा प्रयत्न करा' : 'Retry Compliance Analysis',

    expandAll: lang === 'hi' ? 'सभी 4 भाग खोलें' : lang === 'mr' ? 'सर्व ४ भाग उघडा' : 'Expand All 4 Sections',
    collapseAll: lang === 'hi' ? 'सभी समेटें' : lang === 'mr' ? 'सर्व बंद करा' : 'Collapse All',

    biologicalResourceLabel: lang === 'hi' ? 'पहचाने गए जैविक संसाधन / घटक' : lang === 'mr' ? 'नोंदवलेले जैविक घटक / वनस्पती' : 'Identified Biological Resource(s)',
    nbaApprovalRequirement: lang === 'hi' ? 'लागू एनबीए प्रपत्र (Form Requirement)' : lang === 'mr' ? 'आवश्यक एनबीए अर्ज प्रकार (Form Requirement)' : 'Applicable NBA Approval Requirement',
    tkdlPriorArtLabel: lang === 'hi' ? 'पारंपरिक ज्ञान / टीकेडीएल सहभाग' : lang === 'mr' ? 'पारंपारिक ज्ञान / टीकेडीएल सहभाग' : 'Traditional Knowledge & TKDL Status',
    effectOnIpLabel: lang === 'hi' ? 'बौद्धिक संपदा (IP) संरक्षण पर प्रभाव' : lang === 'mr' ? 'बौद्धिक संपदा (IP) संरक्षणावरील परिणाम' : 'Statutory Effect on IP Protection',
    regulatoryCategoryLabel: lang === 'hi' ? 'लागू विनियामक श्रेणी' : lang === 'mr' ? 'लागू विनियामक वर्ग' : 'Applicable Regulatory Category',
    regulatoryPathwayLabel: lang === 'hi' ? 'विनियामक अनुज्ञापन मार्ग' : lang === 'mr' ? 'विनियामक परवाना मार्ग' : 'Statutory Licensing Pathway',
    mandatoryRequirementsLabel: lang === 'hi' ? 'विशिष्ट वैधानिक आवश्यकताएं एवं दायित्व' : lang === 'mr' ? 'विशिष्ट वैधानिक आवश्यकता व दायित्वे' : 'Specific Statutory Requirements & Conditions',
    controllingAuthorityLabel: lang === 'hi' ? 'नियंत्रक विनियामक प्राधिकरण' : lang === 'mr' ? 'नियंत्रक विनियामक प्राधिकरण' : 'Controlling Regulatory Authority',

    provisionsTitle: lang === 'hi' ? 'लागू वैधानिक प्रावधान' : lang === 'mr' ? 'लागू कायदेशीर तरतुदी' : 'Applicable Statutory Provision(s)',
    evidenceAreaTitle: lang === 'hi' ? 'साक्ष्य एवं विधिक स्रोत (RAG विधिक संग्रह)' : lang === 'mr' ? 'पुरावे व कायदेशीर स्रोत (RAG संग्रह)' : 'Authoritative Statutory Citations (Retrieved from Corpus)',
    officialPortalLabel: lang === 'hi' ? 'आधिकारिक सरकारी पोर्टल' : lang === 'mr' ? 'अधिकृत सरकारी पोर्टल' : 'Official Authority Portal',
    missingInfoTitle: lang === 'hi' ? 'अनिश्चितता / सत्यापन हेतु आवश्यक अतिरिक्त जानकारी' : lang === 'mr' ? 'अनिश्चितता / पडताळणीसाठी आवश्यक अतिरिक्त माहिती' : 'Uncertainty / Additional Information Required for Verification',
    statuteDistinction: lang === 'hi' ? 'आधिकारिक विधिक साक्ष्य' : lang === 'mr' ? 'अधिकृत कायदेशीर पुरावा' : 'Authoritative Statutory Corpus',
    systemDistinction: lang === 'hi' ? 'प्रणाली विनियामक मूल्यांकन' : lang === 'mr' ? 'प्रणाली विनियामक मूल्यांकन' : 'System Regulatory Assessment'
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applicable':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />,
          label: lang === 'hi' ? 'लागू वैधानिक आवश्यकता (Applicable Requirement)' : lang === 'mr' ? 'लागू वैधानिक आवश्यकता (Applicable Requirement)' : 'Applicable Statutory Requirement'
        };
      case 'Potentially Applicable':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-700" />,
          label: lang === 'hi' ? 'संभावित लागू (Potentially Applicable)' : lang === 'mr' ? 'संभाव्य लागू (Potentially Applicable)' : 'Potentially Applicable'
        };
      case 'Not Indicated':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
          icon: <MinusCircle className="w-3.5 h-3.5 text-slate-500" />,
          label: lang === 'hi' ? 'पुनर्प्राप्त स्रोतों में कोई प्रासंगिक प्रावधान नहीं मिला (No Relevant Provision Identified in Retrieved Sources)' : lang === 'mr' ? 'पुनर्प्राप्त स्त्रोतांमध्ये संबंधित तरतूद आढळली नाही (No Relevant Provision Identified in Retrieved Sources)' : 'No Relevant Provision Identified in Retrieved Sources'
        };
      case 'Needs Human Review':
      default:
        return {
          bg: 'bg-red-100 text-red-900 border-red-300',
          dot: 'bg-red-500',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-700" />,
          label: lang === 'hi' ? 'मानवीय समीक्षा अनुशंसित (Human Review Recommended)' : lang === 'mr' ? 'मानवी पुनरावलोकन अनुशंसित (Human Review Recommended)' : 'Human Review Recommended'
        };
    }
  };

  if (isLoading) {
    return (
      <div
        id="abs-regulatory-compliance-section"
        className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-emerald-600/80 shadow-md space-y-4 animate-fadeIn"
      >
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {tLabels.loadingTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {tLabels.loadingSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {[
            '1. Biodiversity / ABS Assessment',
            '2. NBA Approval Assessment',
            '3. Traditional Knowledge / TKDL Assessment',
            '4. Product Regulatory Requirements'
          ].map((title, i) => (
            <div key={i} className="h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-44"></div>
              <div className="ml-auto h-4 bg-emerald-100 rounded-full w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        id="abs-regulatory-compliance-section"
        className="bg-amber-50/80 p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-xs space-y-2 animate-fadeIn"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                {tLabels.errorTitle}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {tLabels.errorDesc}
              </p>
            </div>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 px-3.5 py-1.5 rounded-xl transition shrink-0 cursor-pointer shadow-2xs self-start sm:self-center"
            >
              {tLabels.retryBtn}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!data || !data.biodiversityABS) {
    return null;
  }

  const getSectionTitle = (key: string, originalTitle: string) => {
    if (lang === 'en') return originalTitle;
    if (key === 'biodiversityABS') {
      return lang === 'hi'
        ? 'जैविक विविधता अधिनियम, 2002 — एबीएस (ABS) प्रयोज्यता'
        : 'जैविक विविधता कायदा, २००२ — एबीएस (ABS) लागू असणे';
    }
    if (key === 'nbaApproval') {
      return lang === 'hi'
        ? 'राष्ट्रीय जैव विविधता प्राधिकरण (NBA) पूर्व अनुमोदन आवश्यकता'
        : 'राष्ट्रीय जैवविविधता प्राधिकरण (NBA) पूर्वपरवानगी आवश्यकता';
    }
    if (key === 'traditionalKnowledgeTKDL') {
      return lang === 'hi'
        ? 'पारंपरिक ज्ञान एवं टीकेडीएल (TKDL) पूर्व कला स्थिति'
        : 'पारंपारिक ज्ञान व टीकेडीएल (TKDL) पूर्व कला स्थिती';
    }
    if (key === 'ayushRegulatoryPath') {
      return lang === 'hi'
        ? 'आयुष विनियामक लाइसेंसिंग मार्ग एवं विनिर्माण आचरण (GMP)'
        : 'आयुष नियामक परवाना मार्ग व उत्पादन पद्धती (GMP)';
    }
    return translateStatutoryText(originalTitle, lang);
  };

  const renderCitationList = (citations?: AuthoritativeCitation[]) => {
    if (!citations || citations.length === 0) return null;
    return (
      <div className="space-y-2 pt-2 border-t border-slate-200/60">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
          <span>{tLabels.evidenceAreaTitle}</span>
        </span>
        <div className="space-y-2">
          {citations.map((c, i) => (
            <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-900 text-xs">
                  {c.document ? translateActName(c.document, lang) : (c.source ? translateActName(c.source, lang) : 'Statute')}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  {translateSection(c.section, lang)}
                </span>
              </div>
              {c.textSnippet && (
                <p className="text-slate-600 italic leading-relaxed text-[11px] border-l-2 border-amber-500/60 pl-2">
                  "{translateStatutoryText(c.textSnippet, lang)}"
                </p>
              )}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>{lang === 'hi' ? 'प्राधिकरण:' : lang === 'mr' ? 'प्राधिकरण:' : 'Authority:'} <strong className="text-slate-700">{translateStatutoryText(c.authority, lang) || 'Statutory Authority'}</strong></span>
                {c.sourceUrl && (
                  <a
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center space-x-1"
                  >
                    <span>{tLabels.officialPortalLabel}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const sectionsConfig = [
    {
      key: 'biodiversityABS',
      title: getSectionTitle('biodiversityABS', data.biodiversityABS.title),
      icon: <Leaf className="w-4 h-4 text-emerald-600" />,
      status: data.biodiversityABS.status,
      badge: getStatusBadge(data.biodiversityABS.status),
      content: (
        <div className="space-y-3">
          {/* Biological Resources Identified */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
            <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
              {tLabels.biologicalResourceLabel}:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {data.biodiversityABS.relevantBiologicalResources.map((res, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-emerald-900 border border-emerald-300 shadow-2xs"
                >
                  {res}
                </span>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800 block">
              {tLabels.systemDistinction}:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
              {translateStatutoryText(data.biodiversityABS.reasoning, lang)}
            </p>
          </div>

          {/* Missing info if applicable */}
          {data.biodiversityABS.missingInformation && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 space-y-1">
              <span className="font-bold flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>{tLabels.missingInfoTitle}:</span>
              </span>
              <p>{translateStatutoryText(data.biodiversityABS.missingInformation, lang)}</p>
            </div>
          )}

          {/* Provisions */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-800 block">
              {tLabels.provisionsTitle}:
            </span>
            <ul className="space-y-1">
              {data.biodiversityABS.provisions.map((p, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{translateProvision(p, lang)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Citations */}
          {renderCitationList(data.biodiversityABS.citations)}

          {/* Official Portal */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {lang === 'hi' ? 'प्राधिकरण:' : lang === 'mr' ? 'प्राधिकरण:' : 'Authority:'} <strong className="text-slate-700">{translateStatutoryText(data.biodiversityABS.officialAuthority, lang)}</strong>
            </span>
            <a
              href={data.biodiversityABS.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center space-x-1"
            >
              <span>{tLabels.officialPortalLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )
    },
    {
      key: 'nbaApproval',
      title: getSectionTitle('nbaApproval', data.nbaApproval.title),
      icon: <Award className="w-4 h-4 text-blue-600" />,
      status: data.nbaApproval.status,
      badge: getStatusBadge(data.nbaApproval.status),
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider block mb-0.5">
              {tLabels.nbaApprovalRequirement}:
            </span>
            <span className="text-xs font-bold text-blue-900 block">
              {translateStatutoryText(data.nbaApproval.formType, lang)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800 block">
              {tLabels.systemDistinction}:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
              {translateStatutoryText(data.nbaApproval.reasoning, lang)}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-800 block">
              {tLabels.provisionsTitle}:
            </span>
            <ul className="space-y-1">
              {data.nbaApproval.provisions.map((p, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{translateProvision(p, lang)}</span>
                </li>
              ))}
            </ul>
          </div>

          {renderCitationList(data.nbaApproval.citations)}

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {lang === 'hi' ? 'प्राधिकरण:' : lang === 'mr' ? 'प्राधिकरण:' : 'Authority:'} <strong className="text-slate-700">{translateStatutoryText(data.nbaApproval.officialAuthority, lang)}</strong>
            </span>
            <a
              href={data.nbaApproval.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-bold inline-flex items-center space-x-1"
            >
              <span>{tLabels.officialPortalLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )
    },
    {
      key: 'traditionalKnowledgeTKDL',
      title: getSectionTitle('traditionalKnowledgeTKDL', data.traditionalKnowledgeTKDL.title),
      icon: <BookOpen className="w-4 h-4 text-orange-600" />,
      status: data.traditionalKnowledgeTKDL.status,
      badge: getStatusBadge(data.traditionalKnowledgeTKDL.status),
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200">
            <span className="text-[11px] font-bold text-orange-950 uppercase tracking-wider block mb-0.5">
              {tLabels.tkdlPriorArtLabel}:
            </span>
            <span className="text-xs font-bold text-orange-900 block">
              {translateStatutoryText(data.traditionalKnowledgeTKDL.traditionalKnowledgeInvolvement, lang)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800 block">
              {tLabels.systemDistinction}:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
              {translateStatutoryText(data.traditionalKnowledgeTKDL.reasoning, lang)}
            </p>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
            <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block mb-1">
              {tLabels.effectOnIpLabel}:
            </span>
            <p className="text-xs text-amber-950 leading-relaxed font-semibold">
              {translateStatutoryText(data.traditionalKnowledgeTKDL.effectOnIpProtection, lang)}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-800 block">
              {tLabels.provisionsTitle}:
            </span>
            <ul className="space-y-1">
              {data.traditionalKnowledgeTKDL.provisions.map((p, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>{translateProvision(p, lang)}</span>
                </li>
              ))}
            </ul>
          </div>

          {renderCitationList(data.traditionalKnowledgeTKDL.citations)}

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {lang === 'hi' ? 'प्राधिकरण:' : lang === 'mr' ? 'प्राधिकरण:' : 'Authority:'} <strong className="text-slate-700">{translateStatutoryText(data.traditionalKnowledgeTKDL.officialAuthority, lang)}</strong>
            </span>
            <a
              href={data.traditionalKnowledgeTKDL.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-700 hover:text-orange-900 font-bold inline-flex items-center space-x-1"
            >
              <span>{tLabels.officialPortalLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )
    },
    {
      key: 'regulatoryRequirements',
      title: getSectionTitle('ayushRegulatoryPath', data.regulatoryRequirements.title),
      icon: <Building2 className="w-4 h-4 text-purple-600" />,
      status: data.regulatoryRequirements.status,
      badge: getStatusBadge(data.regulatoryRequirements.status),
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
              <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wider block mb-0.5">
                {tLabels.regulatoryCategoryLabel}:
              </span>
              <span className="text-xs font-bold text-purple-900 block truncate">
                {translateCategory(data.regulatoryRequirements.regulatoryCategory, lang)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-0.5">
                {tLabels.regulatoryPathwayLabel}:
              </span>
              <span className="text-xs font-bold text-slate-900 block">
                {translateStatutoryText(data.regulatoryRequirements.applicablePathway, lang)}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800 block">
              {tLabels.systemDistinction}:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
              {translateStatutoryText(data.regulatoryRequirements.reasoning, lang)}
            </p>
          </div>

          {/* Mandatory Specific Requirements */}
          <div className="p-3.5 bg-gradient-to-br from-purple-50/50 to-white rounded-xl border border-purple-200 space-y-2">
            <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wider block">
              {tLabels.mandatoryRequirementsLabel}:
            </span>
            <ul className="space-y-1.5">
              {data.regulatoryRequirements.specificRequirements.map((req, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{translateStatutoryText(req, lang)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-800 block">
              {tLabels.provisionsTitle}:
            </span>
            <ul className="space-y-1">
              {data.regulatoryRequirements.provisions.map((p, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>{translateProvision(p, lang)}</span>
                </li>
              ))}
            </ul>
          </div>

          {renderCitationList(data.regulatoryRequirements.citations)}

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {lang === 'hi' ? 'प्राधिकरण:' : lang === 'mr' ? 'प्राधिकरण:' : 'Authority:'} <strong className="text-slate-700">{translateStatutoryText(data.regulatoryRequirements.controllingAuthority, lang)}</strong>
            </span>
            <a
              href={data.regulatoryRequirements.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 hover:text-purple-900 font-bold inline-flex items-center space-x-1"
            >
              <span>{tLabels.officialPortalLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )
    }
  ];

  return (
    <div
      id="abs-regulatory-compliance-section"
      className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-emerald-600/90 shadow-md space-y-4 animate-fadeIn"
    >
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                {lang === 'hi' ? 'वैधानिक अनुपालन ढांचा' : lang === 'mr' ? 'वैधानिक अनुपालन चौकट' : 'Statutory Compliance Matrix'}
              </span>
              <span className="text-xs text-slate-500 font-semibold truncate max-w-xs">
                {data.productName || productName}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {tLabels.header}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              {tLabels.subtitle}
            </p>
          </div>
        </div>

        {/* Global Expand / Collapse All Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={expandAll}
            className="text-[11px] font-bold text-emerald-900 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-300 transition cursor-pointer shadow-2xs"
          >
            {tLabels.expandAll}
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
          >
            {tLabels.collapseAll}
          </button>
        </div>
      </div>

      {/* Summary Narrative Banner */}
      {data.summary && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-50/80 via-slate-50 to-blue-50/40 rounded-xl border border-emerald-200 text-xs text-slate-800 flex items-start space-x-2.5">
          <Layers className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">
            {data.summary}
          </div>
        </div>
      )}

      {/* 4 Expandable Cards Structure:
          ├── Biodiversity / ABS Assessment
          ├── NBA Approval Assessment
          ├── Traditional Knowledge / TKDL Assessment
          └── Product Regulatory Requirements
      */}
      <div className="space-y-2.5 pt-1">
        {sectionsConfig.map((sec, idx) => {
          const isExpanded = !!expandedSections[sec.key];

          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded
                  ? 'border-emerald-500 shadow-sm bg-white'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
              }`}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection(sec.key)}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {sec.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                      {sec.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                  <span
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${sec.badge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sec.badge.dot}`}></span>
                    <span>{sec.badge.label}</span>
                  </span>
                  <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                </div>
              </button>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="p-4 pt-1 sm:p-5 sm:pt-2 border-t border-slate-100 space-y-4 animate-fadeIn">
                  {sec.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
