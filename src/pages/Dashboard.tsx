import React, { useState, useEffect } from 'react';
import {
  api,
  UserSession,
  ClassificationResult,
  ProductAnalysisResult,
  ProductAnalysisInput
} from '../api/client.js';
import { FullProductAnalysisReport } from '../types/analysis.js';
import { useAuth } from '../context/AuthContext.js';
import { useTranslation } from '../i18n/index.js';
import { Header } from '../components/Header.js';
import { ProductAnalysisModule } from '../components/ProductAnalysisModule.js';
import { DocumentLibraryModal } from '../components/DocumentLibraryModal.js';
import { FacilitatorModal } from '../components/FacilitatorModal.js';
import { CaseHistoryDrawer } from '../components/CaseHistoryDrawer.js';
import {
  getStoredAnalysisHistory,
  saveAnalysisToHistory,
  deleteAnalysisFromHistory,
  clearAllAnalysisHistory,
  resetAnalysisHistoryToDefaults,
  AnalysisHistoryItem
} from '../utils/historyStorage.js';
import {
  RefreshCw,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  User as UserIcon,
  History,
  Layers,
  FileText,
  Scale
} from 'lucide-react';

interface DashboardProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onViewFullReport?: (report: FullProductAnalysisReport) => void;
  onStartAnalysis?: () => void;
  onProductAnalyzed?: (product: any) => void;
  currentJurisdiction?: 'India' | 'International';
  onJurisdictionChange?: (jur: 'India' | 'International') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenAuth,
  onViewFullReport,
  onProductAnalyzed,
  currentJurisdiction: externalJurisdiction,
  onJurisdictionChange: onExternalJurisdictionChange
}) => {
  const { t, lang } = useTranslation();
  const { user, handleSessionExpired } = useAuth();

  const [session, setSession] = useState<UserSession>({
    jurisdiction: externalJurisdiction || ((typeof window !== 'undefined' && localStorage.getItem('ip_sakti_jurisdiction')) as any) || 'India',
    chatHistory: []
  });

  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Modals
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [isFacilitatorOpen, setIsFacilitatorOpen] = useState(false);
  const [autoEscalate, setAutoEscalate] = useState(false);

  // Analysis History State
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyViewMode, setHistoryViewMode] = useState<'sidebar' | 'modal'>('modal');
  const [activeHistoryItem, setActiveHistoryItem] = useState<AnalysisHistoryItem | null>(null);
  const [historyToast, setHistoryToast] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    try {
      const res = await api.history.getHistory();
      if (res && Array.isArray(res.history)) {
        setHistory(res.history);
      } else {
        setHistory(getStoredAnalysisHistory());
      }
    } catch (err) {
      console.warn('Could not fetch server history, falling back to local store:', err);
      setHistory(getStoredAnalysisHistory());
    }
  };

  const fetchSession = async () => {
    if (!user) {
      setIsLoadingSession(false);
      return;
    }
    try {
      localStorage.removeItem('ip_sakti_has_classified');
      const res = await api.session.get();
      if (res && res.session) {
        setSession(res.session);
      }
    } catch (err: any) {
      console.error('Failed to load session:', err);
      if (err?.status === 401 || err?.message?.includes('Authentication required') || err?.message?.includes('session')) {
        handleSessionExpired('Session expired, please log in again.');
      }
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (externalJurisdiction && externalJurisdiction !== session.jurisdiction) {
      setSession((prev) => ({ ...prev, jurisdiction: externalJurisdiction }));
    }
  }, [externalJurisdiction]);

  const handleJurisdictionChange = async (jur: 'India' | 'International') => {
    setSession((prev) => ({ ...prev, jurisdiction: jur }));
    onExternalJurisdictionChange?.(jur);
    try {
      localStorage.setItem('ip_sakti_jurisdiction', jur);
    } catch {
      // ignore local storage error
    }
    if (!user) return;
    try {
      const res = await api.session.updateJurisdiction(jur);
      if (res?.session) {
        setSession((prev) => ({ ...prev, ...res.session, jurisdiction: jur }));
      }
    } catch (err: any) {
      console.warn('Non-blocking: could not sync jurisdiction with server session:', err?.message || err);
    }
  };

  const handleProductAnalysisComplete = (result: ProductAnalysisResult) => {
    const legacyResult: ClassificationResult = (result as any).legacyResult || {
      product_name: result.productDetailsSummary?.productName || 'Analyzed Product',
      category: result.category,
      intended_use: result.productDetailsSummary?.intendedUse || '',
      formulation_basis: result.productDetailsSummary?.followsClassicalText || '',
      why_assigned: result.classificationFactors.join(' '),
      patent_potential: result.ipImplications[0] || 'Patentability assessment required',
      ip_considerations: result.ipImplications.join(' | '),
      regulatory_considerations: result.regulatoryFramework.join(' | '),
      abs_status: result.absRelevance.join(' | '),
      abs_required: result.absRelevance.some((r) => !r.toLowerCase().includes('exempt')),
      tkdl_3p_risk: result.category === 'Classical Ayurvedic Medicine' ? 'High' : 'Low',
      confidence: result.confidence,
      classificationTimestamp: new Date().toISOString()
    };

    setSession((prev) => ({
      ...prev,
      classificationResult: legacyResult
    }));

    onProductAnalyzed?.({
      productName: result.productDetailsSummary?.productName || 'Analyzed Product',
      category: result.category,
      intendedUse: result.productDetailsSummary?.intendedUse,
      targetMarket: result.productDetailsSummary?.targetMarket || session.jurisdiction
    });

    if (result.confidence === 'Low') {
      setAutoEscalate(true);
    }
  };

  const buildFullReportFromResult = (result: ProductAnalysisResult): FullProductAnalysisReport => {
    const isClassical = result.category === 'Classical Ayurvedic Medicine';
    const isProprietary = result.category === 'Patent / Proprietary Ayurvedic Medicine';
    const productName = result.productDetailsSummary?.productName || 'Ayurvedic Product';
    const jur = (result.productDetailsSummary?.targetMarket || session.jurisdiction || 'India') as 'India' | 'International';

    return {
      productSummary: {
        productName,
        productDescription: result.productDetailsSummary?.intendedUse || '',
        classification: result.category,
        jurisdiction: jur,
        targetMarket: result.productDetailsSummary?.targetMarket || jur,
        ingredientsCount: 1,
        ingredients: [result.productDetailsSummary?.productName ? `${result.productDetailsSummary.productName} formulation` : 'Botanical extracts']
      },
      classification: {
        category: result.category,
        confidence: result.confidence,
        statutoryBasis: result.regulatoryFramework[0] || 'Drugs and Cosmetics Act, 1940 (First/Second Schedule)',
        reasoning: result.classificationFactors,
        clarificationQuestions: result.questionsForUser || [],
        isUnambiguous: result.confidence === 'High'
      },
      ipProtectionAnalysis: result.ipProtectionAnalysis,
      ipConsiderations: [
        {
          category: 'Product Patentability (Section 3(p) Patents Act 1970)',
          status: (isClassical ? 'Caution / Barred' : isProprietary ? 'Conditional' : 'Eligible') as any,
          statutoryProvision: 'Patents Act, 1970 — Section 3(p)',
          evidenceSnippet: 'Traditional Ayurvedic knowledge and public domain formulation recipes are non-patentable under Section 3(p).',
          keyFindings: result.ipImplications,
          nextSteps: ['Conduct comprehensive TKDL prior-art search.', 'Protect brand identity via Trademark Act 1999 (Class 5 & 30).']
        },
        {
          category: 'Admixture / Synergy Exclusions (Section 3(e))',
          status: (isProprietary ? 'Conditional' : 'Caution / Barred') as any,
          statutoryProvision: 'Patents Act, 1970 — Section 3(e)',
          evidenceSnippet: 'Mere admixtures without synergistic clinical validation are excluded from patent protection.',
          keyFindings: ['Formulations must exhibit unexpected therapeutic synergism to overcome Section 3(e).'],
          nextSteps: ['Generate combination index (CI < 1) bioassay data.']
        }
      ],
      regulatoryConsiderations: [
        {
          regulatoryArea: 'AYUSH Manufacturing Licensing',
          jurisdiction: jur,
          controllingAuthority: 'State Licensing Authority (SLA)',
          statutoryMandate: 'Drugs and Cosmetics Act, 1940 & Rules 1945',
          requirements: result.regulatoryFramework,
          complianceChecklist: [
            'Schedule T GMP Certificate for premises',
            'Ayurvedic technical person supervision',
            'Raw material CoA'
          ]
        },
        {
          regulatoryArea: 'Biological Diversity (ABS Compliance)',
          jurisdiction: jur,
          controllingAuthority: 'National Biodiversity Authority (NBA) & State Biodiversity Boards',
          statutoryMandate: 'Biological Diversity Act, 2002',
          requirements: result.absRelevance,
          complianceChecklist: [
            'Geographic source documentation of herbs',
            'Intimation to SBB prior to commercial scale launch'
          ]
        }
      ],
      traditionalKnowledge: {
        traditionalKnowledgeInvolved: isClassical,
        biologicalResourcesUsed: true,
        tkdlPriorArtExposure: isClassical ? 'High (Documented in Ayurvedic Samhitas)' : 'Medium',
        patentsActSection3pStatus: isClassical ? 'Barred under Section 3(p)' : 'Conditional upon non-obvious synergistic efficacy',
        absClearanceRequired: result.absRelevance.some(r => !r.toLowerCase().includes('exempt')) ? 'Prior Intimation Mandated' : 'Exemption Evaluation Required'
      },
      risksAndAttentionAreas: [
        {
          area: 'IP / Patent Barrier',
          severity: isClassical ? 'High' : 'Medium',
          description: isClassical ? 'Cannot obtain product patent on classical formulation.' : 'Must establish unexpected synergistic index.',
          statutoryRef: 'Section 3(p) & 3(e), Patents Act 1970',
          actionRequired: 'Rely on registered trademarks and proprietary processes.'
        }
      ],
      recommendedNextSteps: [
        'Complete Trademark search on IP India Portal for coined brand name.',
        'Verify Schedule T GMP compliance of your extraction and manufacturing facility.',
        'File prior intimation with the concerned State Biodiversity Board for raw material collection.'
      ],
      citations: ((result.citations || []) as any[]).map((c) => ({
        source: c.source || c.document || 'Statutory Legal Corpus',
        section: c.section || '',
        authority: c.authority,
        version: c.version,
        effectiveDate: c.effectiveDate,
        sourceUrl: c.sourceUrl,
        contextSnippet: c.heading || c.textSnippet
      })),
      groundedSynthesis: `Formulation classified as ${result.category} with ${result.confidence} confidence.`,
      confidence: result.confidence,
      jurisdiction: jur,
      language: 'en'
    };
  };

  // Revisit a historical submission
  const handleSelectHistoryItem = (item: AnalysisHistoryItem) => {
    setActiveHistoryItem(item);
    handleProductAnalysisComplete(item.result);
    setHistoryToast(`Loaded "${item.productName}" from analysis history.`);
    setTimeout(() => setHistoryToast(null), 4000);
  };

  // Save new analysis to history
  const handleSaveHistory = async (input: ProductAnalysisInput, result: ProductAnalysisResult) => {
    const saved = saveAnalysisToHistory(input, result);
    if (user) {
      try {
        await api.history.saveHistory(saved);
        const res = await api.history.getHistory();
        if (res?.history) {
          setHistory(res.history);
        }
      } catch (err) {
        console.warn('Could not sync history to server:', err);
        setHistory(getStoredAnalysisHistory());
      }
    } else {
      setHistory(getStoredAnalysisHistory());
    }
    setActiveHistoryItem(saved);
  };

  // Delete history item
  const handleDeleteHistory = async (id: string) => {
    deleteAnalysisFromHistory(id);
    if (user) {
      try {
        await api.history.deleteHistory(id);
      } catch (err) {
        console.warn('Could not sync history deletion to server:', err);
      }
    }
    setHistory((prev) => prev.filter((item) => item.id !== id && item.caseId !== id));
    if (activeHistoryItem?.id === id || activeHistoryItem?.caseId === id) {
      setActiveHistoryItem(null);
    }
  };

  // Clear history
  const handleClearHistory = async () => {
    clearAllAnalysisHistory();
    if (user) {
      try {
        await api.history.clearHistory();
      } catch (err) {
        console.warn('Could not sync history clear to server:', err);
      }
    }
    setHistory([]);
    setActiveHistoryItem(null);
  };

  // Reset defaults
  const handleResetDefaultHistory = () => {
    const defaults = resetAnalysisHistoryToDefaults();
    setHistory(defaults);
  };

  const handleUpdateAbsChecklist = async (checklist: any) => {
    try {
      const res = await api.session.updateAbsChecklist(checklist);
      setSession((prev) => ({
        ...prev,
        absChecklist: res.absChecklist
      }));
    } catch (err: any) {
      console.error('Failed to update ABS checklist:', err);
      if (err?.status === 401 || err?.message?.includes('Authentication required') || err?.message?.includes('session')) {
        handleSessionExpired('Session expired, please log in again.');
      }
    }
  };

  const handleResetSession = async () => {
    try {
      const res = await api.session.reset();
      setSession(res.session);
      setActiveHistoryItem(null);
    } catch (err: any) {
      console.error('Failed to reset session:', err);
      if (err?.status === 401 || err?.message?.includes('Authentication required') || err?.message?.includes('session')) {
        handleSessionExpired('Session expired, please log in again.');
      }
    }
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">
            Initializing IP-SAKTI Regulatory Workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col relative">
      {/* Universal Top Header with compact language toggle, history trigger & lockable jurisdiction/facilitator */}
      <Header
        jurisdiction={session.jurisdiction}
        onJurisdictionChange={handleJurisdictionChange}
        onOpenKnowledgeBase={() => setIsKnowledgeOpen(true)}
        onOpenFacilitator={() => {
          setAutoEscalate(false);
          setIsFacilitatorOpen(true);
        }}
        onOpenHistory={() => {
          if (!user) {
            onOpenAuth?.('login');
            return;
          }
          setHistoryViewMode('modal');
          setIsHistoryOpen(true);
        }}
        historyCount={history.length}
        isClassified={Boolean(session.classificationResult?.category)}
        onOpenAuth={onOpenAuth}
      />

      {/* Floating Toast Notification when historical formulation is loaded */}
      {historyToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 border border-amber-500 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">{historyToast}</span>
        </div>
      )}

      {/* Statutory Advisory Notice */}
      <div className="bg-amber-50/90 border-b border-amber-200/90 px-4 py-1.5 text-center text-[11px] text-amber-950 flex items-center justify-center space-x-2 shadow-2xs">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span className="font-medium">
          <strong className="font-bold text-amber-900">{t('dashboard.statutoryNoticeLabel')}</strong> {t('app.disclaimer')}
        </span>
      </div>

      {/* Main Workspace Body: Single Pure Focus on Analyze the Product */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-5 pb-28 sm:pb-32">
        {/* Welcome Username Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{t('dashboard.welcome', { name: user?.name || 'Practitioner' })}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {t('dashboard.welcomeSubtitle')}
            </p>
          </div>
          {user && (
            <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
              <UserIcon className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-slate-400">{t('nav.role')}</span>
              <span className="font-bold text-amber-800">{user.role}</span>
            </div>
          )}
        </div>

        {/* Formulation Analysis & Classification Module */}
        <div className="max-w-4xl mx-auto w-full space-y-5 py-1">
          <ProductAnalysisModule
            onClassificationComplete={handleProductAnalysisComplete}
            onContinueToLegalGuidance={(result) => {
              const fullReport = buildFullReportFromResult(result);
              onViewFullReport?.(fullReport);
            }}
            onOpenFacilitator={() => {
              setAutoEscalate(false);
              setIsFacilitatorOpen(true);
            }}
            onOpenKnowledgeBase={() => setIsKnowledgeOpen(true)}
            currentJurisdiction={session.jurisdiction}
            loadedInput={activeHistoryItem?.input}
            loadedResult={activeHistoryItem?.result}
            onSaveHistory={handleSaveHistory}
            onOpenAuth={onOpenAuth}
          />

          {/* Persistent Legal Notice & Regulatory Decision-Support Disclaimer */}
          <div className="mt-8 mb-4 p-3.5 bg-slate-100/90 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5 shadow-2xs">
            <Scale className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-slate-800">
                {lang === 'hi' ? 'वैधानिक अस्वीकरण:' : lang === 'mr' ? 'वैधानिक अस्वीकरण:' : 'Statutory & Regulatory Disclaimer:'}
              </span>{' '}
              {lang === 'hi'
                ? 'आईपी-शक्ति सहायक एक एआई-संवर्धित नियामक निर्णय-सहायता प्रणाली है। सभी आउटपुट केवल अनुसंधान और सूचनात्मक उद्देश्यों के लिए हैं, कानूनी सलाह नहीं हैं। औपचारिक आवेदन से पूर्व पंजीकृत पेटेंट अटॉर्नी या विनियामक सलाहकार से पुष्टि करें।'
                : lang === 'mr'
                ? 'आयपी-शक्ती सहायक ही एआय-संवर्धित नियामक निर्णय-सहायता प्रणाली आहे. सर्व निष्पत्ती केवळ संशोधन आणि माहितीच्या उद्देशाने आहेत, कायदेशीर सल्ला नाही. औपचारिक अर्जापूर्वी नोंदणीकृत पेटंट वकील किंवा नियामक सल्लागाराकडून खात्री करा.'
                : 'IP-SAKTI Sahayak is an AI-augmented regulatory decision-support system. All outputs are strictly informational for research and navigation purposes and do not constitute formal legal advice. Verify requirements with a registered patent attorney or relevant statutory authority.'}
            </div>
          </div>
        </div>
      </main>

      {/* Case History Sidebar / Modal Drawer */}
      <CaseHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        cases={history}
        history={history}
        onOpenCase={handleSelectHistoryItem}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteCase={handleDeleteHistory}
        onDeleteHistoryItem={handleDeleteHistory}
        onClearHistory={handleClearHistory}
        onResetDefaults={handleResetDefaultHistory}
        activeItemId={activeHistoryItem?.id}
        activeCaseId={activeHistoryItem?.caseId}
        defaultViewMode={historyViewMode}
      />

      {/* Knowledge Base Reference Corpus Modal */}
      <DocumentLibraryModal
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
      />

      {/* Human IP Facilitator Review Modal */}
      <FacilitatorModal
        isOpen={isFacilitatorOpen}
        onClose={() => setIsFacilitatorOpen(false)}
        autoEscalated={autoEscalate}
      />
    </div>
  );
};
