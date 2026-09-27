import React, { useState } from 'react';
import { IPProtectionAnalysisResult, IPProtectionCategoryItem } from '../api/client.js';
import { useTranslation } from '../i18n/index.js';
import { translateProvision, translateActName, translateSection, translateStatutoryText } from '../utils/statutoryTranslation.js';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lightbulb,
  Tag,
  MapPin,
  FileText,
  Box,
  Leaf,
  BookOpen,
  Scale,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  MinusCircle,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface IPProtectionAnalysisCardProps {
  data?: IPProtectionAnalysisResult | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onOpenKnowledgeBase?: () => void;
  productName?: string;
  categoryName?: string;
}

const CATEGORY_LETTER_MAP: Record<string, string> = {
  'Patent': 'A',
  'Trademark': 'B',
  'Geographical Indication (GI)': 'C',
  'Copyright': 'D',
  'Industrial Design': 'E',
  'Plant Variety Protection': 'F',
  'Traditional Knowledge / Prior Art': 'G'
};

export const IPProtectionAnalysisCard: React.FC<IPProtectionAnalysisCardProps> = ({
  data,
  isLoading = false,
  error = null,
  onRetry,
  onOpenKnowledgeBase,
  productName,
  categoryName
}) => {
  const { lang } = useTranslation();
  
  // Requirement 15: Collapsed by default except for short summary
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const expandAll = () => {
    if (!data?.ipCategories) return;
    const allExpanded: Record<string, boolean> = {};
    data.ipCategories.forEach((cat) => {
      allExpanded[cat.category] = true;
    });
    setExpandedCategories(allExpanded);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  // Localized headers and strings
  const tLabels = {
    // Decision-support headers:
    header: lang === 'hi' 
      ? 'प्रारंभिक बौद्धिक संपदा (IP) मूल्यांकन' 
      : lang === 'mr' 
      ? 'प्राथमिक बौद्धिक संपदा (IP) मूल्यांकन' 
      : 'Preliminary IP Assessment',
    subtitle: lang === 'hi' 
      ? 'उत्पाद-विशिष्ट प्रारंभिक बौद्धिक संपदा मूल्यांकन मार्ग' 
      : lang === 'mr' 
      ? 'उत्पादन-विशिष्ट प्राथमिक बौद्धिक संपदा मूल्यांकन मार्ग' 
      : 'Preliminary product-specific Intellectual Property assessment pathways',
    
    // Requirement 16 loading state:
    loadingTitle: lang === 'hi'
      ? 'बौद्धिक संपदा संरक्षण मार्गों का विश्लेषण किया जा रहा है...'
      : lang === 'mr'
      ? 'बौद्धिक संपदा संरक्षण मार्गांचे विश्लेषण केले जात आहे...'
      : 'Analyzing IP protection pathways...',
    loadingSubtitle: lang === 'hi'
      ? '7 वैधानिक श्रेणियों में सत्यापित कानूनी साक्ष्यों का मूल्यांकन...'
      : lang === 'mr'
      ? '७ वैधानिक प्रकारांमध्ये कायदेशीर पुराव्यांचे मूल्यांकन...'
      : 'Evaluating statutory provisions and RAG legal evidence across 7 IP categories...',
    
    // Requirement 17 error handling:
    errorTitle: lang === 'hi'
      ? 'बौद्धिक संपदा विश्लेषण अस्थायी रूप से अनुपलब्ध है।'
      : lang === 'mr'
      ? 'बौद्धिक संपदा विश्लेषण तात्पुरते अनुपलब्ध आहे.'
      : 'IP Protection Analysis is temporarily unavailable.',
    errorDesc: lang === 'hi'
      ? 'आप नीचे दी गई वर्गीकरण जानकारी और कानूनी मार्गदर्शन का उपयोग जारी रख सकते हैं।'
      : lang === 'mr'
      ? 'तुम्ही खालील वर्गीकरण माहिती व कायदेशीर मार्गदर्शन वापरणे सुरू ठेवू शकता.'
      : 'You can continue using the existing classification and statutory guidance below.',
    retryBtn: lang === 'hi' ? 'पुनः प्रयास करें' : lang === 'mr' ? 'पुन्हा प्रयत्न करा' : 'Retry IP Analysis',

    expandAll: lang === 'hi' ? 'सभी 7 श्रेणियां खोलें' : lang === 'mr' ? 'सर्व ७ प्रकार उघडा' : 'Expand All 7 Pathways',
    collapseAll: lang === 'hi' ? 'सभी समेटें' : lang === 'mr' ? 'सर्व बंद करा' : 'Collapse All',
    
    // Requirement 7 & 18 labels:
    systemAssessmentTitle: lang === 'hi' ? 'प्रणाली मूल्यांकन व उत्पाद-विशिष्ट व्याख्या' : lang === 'mr' ? 'प्रणाली मूल्यांकन व उत्पादन-विशिष्ट स्पष्टीकरण' : 'System Assessment & Product-Specific Explanation',
    provisionsTitle: lang === 'hi' ? 'लागू वैधानिक प्रावधान' : lang === 'mr' ? 'लागू कायदेशीर तरतुदी' : 'Applicable Legal Provision(s)',
    evidenceAreaTitle: lang === 'hi' ? 'साक्ष्य एवं स्रोत (RAG विधिक संग्रह)' : lang === 'mr' ? 'पुरावे व स्रोत (RAG कायदेशीर संग्रह)' : 'Evidence / Sources (from Existing RAG)',
    statutoryEvidenceTitle: lang === 'hi' ? 'प्राप्त वैधानिक साक्ष्य' : lang === 'mr' ? 'प्राप्त कायदेशीर पुरावा' : 'Retrieved Statutory Evidence',
    citationsTitle: lang === 'hi' ? 'सत्यापित स्रोत दस्तावेज़' : lang === 'mr' ? 'सत्यापित संदर्भ दस्तऐवज' : 'Source Document & Citations',
    officialLinksTitle: lang === 'hi' ? 'आधिकारिक सरकारी पोर्टल' : lang === 'mr' ? 'अधिकृत सरकारी पोर्टल' : 'Official Authority / Government Portals',
    statuteDistinction: lang === 'hi' ? 'आधिकारिक विधिक साक्ष्य' : lang === 'mr' ? 'अधिकृत कायदेशीर पुरावा' : 'Authoritative Statutory Corpus',
    assessmentDistinction: lang === 'hi' ? 'उत्पाद-विशिष्ट विश्लेषण' : lang === 'mr' ? 'उत्पादन-विशिष्ट विश्लेषण' : 'Product Assessment'
  };

  // Requirement 16: Clear Loading State
  if (isLoading) {
    return (
      <div
        id="ip-protection-analysis-section"
        className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-amber-500 shadow-md space-y-4 animate-fadeIn"
      >
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
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

        {/* Pulse Skeleton for the 7 categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {['A. Patent', 'B. Trademark', 'C. GI', 'D. Copyright', 'E. Design', 'F. Plant Variety', 'G. TK Prior Art'].map((cat, i) => (
            <div key={i} className="h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-28"></div>
              <div className="ml-auto h-4 bg-amber-100 rounded-full w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Requirement 17: Graceful Error Handling without breaking classification
  if (error) {
    return (
      <div
        id="ip-protection-analysis-section"
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

  // If data hasn't arrived yet and not in explicit error, show loading state
  if (!data || !data.ipCategories || data.ipCategories.length === 0) {
    return (
      <div
        id="ip-protection-analysis-section"
        className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-amber-500 shadow-md space-y-4 animate-fadeIn"
      >
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
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
          {['A. Patent', 'B. Trademark', 'C. GI', 'D. Copyright', 'E. Design', 'F. Plant Variety', 'G. TK Prior Art'].map((cat, i) => (
            <div key={i} className="h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-28"></div>
              <div className="ml-auto h-4 bg-amber-100 rounded-full w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Patent':
        return <Lightbulb className="w-4 h-4 text-amber-600" />;
      case 'Trademark':
        return <Tag className="w-4 h-4 text-blue-600" />;
      case 'Geographical Indication (GI)':
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case 'Copyright':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'Industrial Design':
        return <Box className="w-4 h-4 text-pink-600" />;
      case 'Plant Variety Protection':
        return <Leaf className="w-4 h-4 text-lime-600" />;
      case 'Traditional Knowledge / Prior Art':
        return <BookOpen className="w-4 h-4 text-orange-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getStatusBadge = (status: IPProtectionCategoryItem['status']) => {
    switch (status) {
      case 'Relevant':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />,
          label: lang === 'hi' ? 'प्रासंगिक वैधानिक प्रावधान (Relevant Provision)' : lang === 'mr' ? 'सुसंगत वैधानिक तरतूद (Relevant Provision)' : 'Relevant Statutory Provision'
        };
      case 'Potentially Relevant':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-700" />,
          label: lang === 'hi' ? 'संभावित प्रासंगिक प्रावधान (Potentially Relevant Provision)' : lang === 'mr' ? 'संभाव्य सुसंगत तरतूद (Potentially Relevant Provision)' : 'Potentially Relevant Provision'
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

  // Requirement 6: A. Patent, B. Trademark, C. GI, D. Copyright, E. Design, F. Plant Variety, G. TK Prior Art
  const getCategoryLocalizedName = (cat: string) => {
    const letter = CATEGORY_LETTER_MAP[cat] || '';
    const prefix = letter ? `${letter}. ` : '';

    if (lang === 'hi') {
      switch (cat) {
        case 'Patent': return `${prefix}पेटेंट (Patent)`;
        case 'Trademark': return `${prefix}ट्रेडमार्क (Trademark)`;
        case 'Geographical Indication (GI)': return `${prefix}भौगोलिक संकेत (Geographical Indication)`;
        case 'Copyright': return `${prefix}कॉपीराइट (Copyright)`;
        case 'Industrial Design': return `${prefix}औद्योगिक डिज़ाइन (Industrial Design)`;
        case 'Plant Variety Protection': return `${prefix}पादप किस्म संरक्षण (Plant Variety Protection)`;
        case 'Traditional Knowledge / Prior Art': return `${prefix}पारंपरिक ज्ञान / पूर्व कला (TKDL & Prior Art)`;
        default: return `${prefix}${cat}`;
      }
    } else if (lang === 'mr') {
      switch (cat) {
        case 'Patent': return `${prefix}पेटंट (Patent)`;
        case 'Trademark': return `${prefix}ट्रेडमार्क (Trademark)`;
        case 'Geographical Indication (GI)': return `${prefix}भौगोलिक संकेत (Geographical Indication)`;
        case 'Copyright': return `${prefix}कॉपीराइट (Copyright)`;
        case 'Industrial Design': return `${prefix}औद्योगिक डिझाइन (Industrial Design)`;
        case 'Plant Variety Protection': return `${prefix}वनस्पती वाण संरक्षण (Plant Variety Protection)`;
        case 'Traditional Knowledge / Prior Art': return `${prefix}पारंपारिक ज्ञान / पूर्व कला (TKDL & Prior Art)`;
        default: return `${prefix}${cat}`;
      }
    }

    return `${prefix}${cat}`;
  };

  return (
    <div
      id="ip-protection-analysis-section"
      className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-amber-500/90 shadow-md space-y-4 animate-fadeIn"
    >
      {/* Requirement 5 Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
            <Scale className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                {lang === 'hi' ? 'बौद्धिक संपदा रूपरेखा' : lang === 'mr' ? 'बौद्धिक संपदा चौकट' : 'Statutory IP Pathways'}
              </span>
              <span className="text-xs text-slate-500 font-semibold truncate max-w-xs">
                {data.productName || productName}
              </span>
            </div>
            {/* Exact Requirement 5 Title & Subtitle */}
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
            className="text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-300 transition cursor-pointer shadow-2xs"
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

      {/* Summary Narrative Banner (Requirement 15 short summary) */}
      {data.summary && (
        <div className="p-3.5 bg-gradient-to-r from-amber-50/80 via-slate-50 to-blue-50/40 rounded-xl border border-amber-200 text-xs text-slate-800 flex items-start space-x-2.5">
          <Layers className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">
            {translateStatutoryText(data.summary, lang)}
          </div>
        </div>
      )}

      {/* 7 Expandable Category Cards (Requirement 6: A to G) */}
      <div className="space-y-2.5 pt-1">
        {[...data.ipCategories]
          .sort((a, b) => (CATEGORY_LETTER_MAP[a.category] || 'Z').localeCompare(CATEGORY_LETTER_MAP[b.category] || 'Z'))
          .map((item, idx) => {
          const isExpanded = !!expandedCategories[item.category];
          const badge = getStatusBadge(item.status);
          const icon = getCategoryIcon(item.category);
          const localizedName = getCategoryLocalizedName(item.category);

          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded
                  ? 'border-amber-400 shadow-sm bg-white'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
              }`}
            >
              {/* Accordion Header - Collapsed by default (Req 15) */}
              <button
                type="button"
                onClick={() => toggleCategory(item.category)}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition rounded-xl"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 block truncate">
                      {localizedName}
                    </span>
                    {!isExpanded && (
                      <p className="text-[11px] text-slate-500 truncate max-w-md sm:max-w-xl">
                        {translateStatutoryText(item.reason, lang)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                  <span
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                  <div className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-700" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>
              </button>

              {/* Accordion Body (Expanded View) */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-4 text-xs">
                  {/* Part 1: SYSTEM ASSESSMENT & PRODUCT-SPECIFIC EXPLANATION (Req 7) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {tLabels.assessmentDistinction} • {tLabels.systemAssessmentTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Status: <strong className="text-slate-700">{item.status}</strong>
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 leading-relaxed bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 font-medium space-y-1.5">
                      <p>{translateStatutoryText(item.reason, lang)}</p>
                    </div>
                  </div>

                  {/* Applicable Legal Provisions (Req 7) */}
                  {item.provisions && item.provisions.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                        {tLabels.provisionsTitle}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.provisions.map((prov, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-950 font-bold text-[11px] border border-amber-200"
                          >
                            § {translateProvision(prov, lang)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Part 2: EVIDENCE / SOURCES AREA (Req 18 & Req 7 with clear distinction) */}
                  <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded border border-blue-200 flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-blue-700" />
                        <span>{tLabels.statuteDistinction} • {tLabels.evidenceAreaTitle}</span>
                      </span>
                    </div>

                    {/* Retrieved Evidence from Existing RAG */}
                    {item.evidence && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          {tLabels.statutoryEvidenceTitle}:
                        </span>
                        <div className="p-3 bg-white rounded-lg border border-blue-200 text-slate-700 italic text-[11px] leading-relaxed border-l-3 border-l-blue-600">
                          "{translateStatutoryText(item.evidence, lang)}"
                        </div>
                      </div>
                    )}

                    {/* Authoritative Citations & Source Document */}
                    {item.citations && item.citations.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                          {tLabels.citationsTitle}:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.citations.map((c, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-amber-300 transition space-y-1 shadow-2xs"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-bold text-[11px] text-slate-900 truncate">
                                  {translateActName(c.document || c.source || c.documentId || '', lang)}
                                </span>
                                {c.section && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                                    {translateSection(c.section, lang)}
                                  </span>
                                )}
                              </div>
                              {c.heading && (
                                <p className="text-[10px] text-slate-600 font-medium line-clamp-1">
                                  {translateStatutoryText(c.heading, lang)}
                                </p>
                              )}
                              {c.textSnippet && (
                                <p className="text-[10px] text-slate-500 italic line-clamp-2">
                                  "{translateStatutoryText(c.textSnippet, lang)}"
                                </p>
                              )}
                              {c.authority && (
                                <p className="text-[9px] text-slate-400">
                                  {lang === 'hi' ? 'प्राधिकरण:' : lang === 'mr' ? 'प्राधिकरण:' : 'Auth:'} {translateStatutoryText(c.authority, lang)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Official Authority / Government Links */}
                    {item.officialLinks && item.officialLinks.length > 0 && (
                      <div className="pt-1.5 border-t border-blue-200/50 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                          {tLabels.officialLinksTitle}:
                        </span>
                        {item.officialLinks.map((link, lIdx) => (
                          <a
                            key={lIdx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-amber-900 text-[10px] font-bold transition border border-amber-300 shadow-2xs"
                          >
                            <span>{link.title}</span>
                            <ExternalLink className="w-3 h-3 text-amber-700" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
