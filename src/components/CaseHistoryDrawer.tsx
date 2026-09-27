import React, { useState, useMemo, useEffect } from 'react';
import { AnalysisHistoryItem } from '../utils/historyStorage.js';
import { useTranslation } from '../i18n/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  History,
  X,
  Search,
  RotateCcw,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen,
  Maximize2,
  Minimize2,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Leaf,
  Globe,
  Filter,
  FolderOpen,
  User as UserIcon,
  Copy,
  Check,
  Clock,
  ShieldAlert
} from 'lucide-react';

export interface CaseHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Supports both 'cases' and 'history' property names for compatibility
  cases?: AnalysisHistoryItem[];
  history?: AnalysisHistoryItem[];
  // Supports both 'onOpenCase' and 'onSelectHistoryItem'
  onOpenCase?: (item: AnalysisHistoryItem) => void;
  onSelectHistoryItem?: (item: AnalysisHistoryItem) => void;
  // Supports both 'onDeleteCase' and 'onDeleteHistoryItem'
  onDeleteCase?: (id: string) => void;
  onDeleteHistoryItem?: (id: string) => void;
  onClearHistory?: () => void;
  onResetDefaults?: () => void;
  activeItemId?: string;
  activeCaseId?: string;
  defaultViewMode?: 'sidebar' | 'modal';
  userName?: string;
  userEmail?: string;
}

export const CaseHistoryDrawer: React.FC<CaseHistoryDrawerProps> = ({
  isOpen,
  onClose,
  cases,
  history: historyProp,
  onOpenCase,
  onSelectHistoryItem,
  onDeleteCase,
  onDeleteHistoryItem,
  onClearHistory,
  onResetDefaults,
  activeItemId,
  activeCaseId,
  defaultViewMode = 'modal',
  userName,
  userEmail
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Combine either cases or history prop
  const records = useMemo(() => {
    return cases || historyProp || [];
  }, [cases, historyProp]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'sidebar' | 'modal'>(defaultViewMode);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Keyboard navigation: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body/html scrollbar so the main page's slide/scroll bar is never shown while visiting history
  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isOpen]);

  // Unified Open Case action handler
  const handleOpen = (item: AnalysisHistoryItem) => {
    if (onOpenCase) {
      onOpenCase(item);
    } else if (onSelectHistoryItem) {
      onSelectHistoryItem(item);
    }
    onClose();
  };

  // Unified Delete Case action handler
  const handleDelete = (id: string) => {
    if (onDeleteCase) {
      onDeleteCase(id);
    } else if (onDeleteHistoryItem) {
      onDeleteHistoryItem(id);
    }
    setDeleteConfirmId(null);
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic filter lists derived from saved records
  const categories = useMemo(() => {
    const set = new Set<string>();
    records.forEach((h) => {
      if (h.category) set.add(h.category);
    });
    return ['all', ...Array.from(set)];
  }, [records]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    records.forEach((h) => {
      set.add(h.humanReviewStatus || 'Analysis Completed');
    });
    return ['all', ...Array.from(set)];
  }, [records]);

  // Filter list matching search query and filters
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (item.productName && item.productName.toLowerCase().includes(q)) ||
        (item.caseId && item.caseId.toLowerCase().includes(q)) ||
        (item.id && item.id.toLowerCase().includes(q)) ||
        (item.ingredients && item.ingredients.toLowerCase().includes(q)) ||
        (item.intendedUse && item.intendedUse.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.ipStatus && item.ipStatus.toLowerCase().includes(q)) ||
        (item.absStatus && item.absStatus.toLowerCase().includes(q)) ||
        (item.humanReviewStatus && item.humanReviewStatus.toLowerCase().includes(q));

      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchStatus =
        selectedStatus === 'all' ||
        (item.humanReviewStatus || 'Analysis Completed').toLowerCase() === selectedStatus.toLowerCase();

      const matchLanguage =
        selectedLanguage === 'all' ||
        (item.language || 'en').toLowerCase() === selectedLanguage.toLowerCase();

      const matchJurisdiction =
        selectedJurisdiction === 'all' ||
        (item.targetMarket || 'India').toLowerCase() === selectedJurisdiction.toLowerCase();

      return matchQuery && matchCategory && matchStatus && matchLanguage && matchJurisdiction;
    });
  }, [records, searchQuery, selectedCategory, selectedStatus, selectedLanguage, selectedJurisdiction]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    selectedLanguage !== 'all' ||
    selectedJurisdiction !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedLanguage('all');
    setSelectedJurisdiction('all');
  };

  if (!isOpen) return null;

  const getCategoryBadgeClass = (category: string) => {
    if (category.toLowerCase().includes('classical')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (category.toLowerCase().includes('proprietary') || category.toLowerCase().includes('patent')) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    if (category.toLowerCase().includes('aahar')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (category.toLowerCase().includes('cosmetic')) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const getReviewStatusBadgeClass = (status?: string) => {
    const s = (status || 'Analysis Completed').toLowerCase();
    if (s.includes('submitted') || s.includes('under review')) {
      return 'bg-blue-100 text-blue-900 border-blue-300';
    }
    if (s.includes('dossier')) {
      return 'bg-purple-100 text-purple-900 border-purple-300';
    }
    if (s.includes('requested')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (s.includes('reviewed') || s.includes('closed')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 1) return 'Just now';
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  const activeUserDisplayName = userName || user?.name || 'Ayush Practitioner';
  const activeUserEmail = userEmail || user?.email || 'Confidential Session';

  const drawerContent = (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Drawer / Modal Header */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-800 shrink-0">
            <History className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                Case Analysis History
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                {records.length} {records.length === 1 ? 'case' : 'cases'}
              </span>
            </div>
            {/* User-Specific Data Isolation Badge */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5 truncate">
              <UserIcon className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">
                Isolated Records: <strong className="font-semibold text-slate-700">{activeUserDisplayName}</strong> ({activeUserEmail})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Close Case History"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-3 sm:p-4 bg-white border-b border-slate-200 space-y-2.5">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Case ID, product name, ingredients, classification, or review status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 bg-slate-50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toolbar: Category, Review Status, Language, Jurisdiction */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {/* Category Filter */}
          <div className="flex items-center space-x-1 shrink-0">
            <span className="text-slate-400 font-medium text-[11px]">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 shrink-0">
            <span className="text-slate-400 font-medium text-[11px]">Review:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st === 'all' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex items-center space-x-1 shrink-0">
            <span className="text-slate-400 font-medium text-[11px]">Lang:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Languages</option>
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (HI)</option>
              <option value="mr">मराठी (MR)</option>
            </select>
          </div>

          {/* Jurisdiction Filter */}
          <div className="flex items-center space-x-1 shrink-0">
            <span className="text-slate-400 font-medium text-[11px]">Jur:</span>
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Jurisdictions</option>
              <option value="India">India</option>
              <option value="International">International</option>
            </select>
          </div>

          {/* Clear Filters Button if any active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="ml-auto text-[11px] text-amber-700 hover:text-amber-900 font-semibold underline shrink-0 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Count summary bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <span>
            Showing <strong className="font-semibold text-slate-800">{filteredRecords.length}</strong> of{' '}
            <strong className="font-semibold text-slate-800">{records.length}</strong> recorded cases
          </span>
          <span className="text-emerald-700 font-medium flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Retrieved instantly without re-running RAG</span>
          </span>
        </div>
      </div>

      {/* Case Records List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                {hasActiveFilters ? 'No matching cases found' : 'No analysis cases recorded yet'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'Try clearing or adjusting your search terms and filter criteria.'
                  : 'Submit a formulation in the Product Analysis form to record your case history.'}
              </p>
            </div>
            {hasActiveFilters && (
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredRecords.map((item) => {
            const isActive =
              (activeItemId && (activeItemId === item.id || activeItemId === item.caseId)) ||
              (activeCaseId && (activeCaseId === item.caseId || activeCaseId === item.id));

            const displayCaseId = item.caseId || item.id;
            const langCode = (item.language || 'en').toUpperCase();
            const ipStatusText =
              item.ipStatus ||
              (item.result?.ipProtectionAnalysis?.ipCategories?.[0]?.status
                ? `${item.result.ipProtectionAnalysis.ipCategories[0].status} (${item.result.ipProtectionAnalysis.ipCategories[0].category})`
                : 'Evaluated');
            const absStatusText =
              item.absStatus ||
              (item.result?.absRelevance?.[0] || 'Evaluated');
            const reviewStatus = item.humanReviewStatus || 'Analysis Completed';

            return (
              <div
                key={item.id}
                className={`group rounded-2xl border transition-all duration-200 bg-white p-4 shadow-xs hover:shadow-md ${
                  isActive
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                {/* Top Row: Case ID, Language, Jurisdiction, Date/Time, Delete Action */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2.5">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    {/* 1. Case ID */}
                    <div className="inline-flex items-center space-x-1">
                      <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                        {displayCaseId}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => copyToClipboard(displayCaseId, e)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                        title="Copy Case ID"
                        aria-label="Copy Case ID"
                      >
                        {copiedId === displayCaseId ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* 2. Language */}
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                      <Globe className="w-3 h-3 text-blue-600" />
                      <span>{langCode}</span>
                    </span>

                    {/* 3. Jurisdiction */}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {item.targetMarket || 'India'}
                    </span>
                  </div>

                  {/* 4. Date/Time & Delete */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span
                      className="text-[11px] text-slate-400 flex items-center space-x-1 cursor-default"
                      title={new Date(item.timestamp).toLocaleString()}
                    >
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatTimestamp(item.timestamp)}</span>
                    </span>

                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="px-1.5 py-0.5 text-[10px] bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(item.id);
                        }}
                        className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                        title="Delete case from history"
                        aria-label="Delete case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Product Name & Active Indicator */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-amber-800 transition truncate">
                        {item.productName}
                      </h3>
                      {isActive && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                          <CheckCircle2 className="w-3 h-3 text-amber-600" />
                          <span>Active in Workspace</span>
                        </span>
                      )}
                    </div>

                    {/* Classification Category & Confidence */}
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1 text-xs">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryBadgeClass(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>

                      {item.dosageForm && (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.dosageForm}
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.confidence === 'High'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.confidence === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {item.confidence} Confidence
                      </span>
                    </div>
                  </div>
                </div>

                {/* IP Status & ABS Status Grid */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* IP Status */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        IP Status
                      </div>
                      <div className="text-xs font-semibold text-slate-800 truncate" title={ipStatusText}>
                        {ipStatusText}
                      </div>
                    </div>
                  </div>

                  {/* ABS Status */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2">
                    <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        ABS Status
                      </div>
                      <div className="text-xs font-semibold text-slate-800 truncate" title={absStatusText}>
                        {absStatusText}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Human Review Status Banner */}
                <div className="mt-2 p-2 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs bg-slate-50/50">
                  <div className="flex items-center space-x-2 min-w-0">
                    <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-600">Review Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getReviewStatusBadgeClass(
                        reviewStatus
                      )}`}
                    >
                      {reviewStatus}
                    </span>
                  </div>
                  {item.dossier && (
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium border border-purple-200">
                      Dossier Ready
                    </span>
                  )}
                </div>

                {/* Formulation Details Preview */}
                <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                  <p className="line-clamp-2">
                    <span className="font-semibold text-slate-700">Ingredients: </span>
                    {item.ingredients}
                  </p>
                  <p className="line-clamp-1 text-slate-500">
                    <span className="font-semibold text-slate-700">Indication: </span>
                    {item.intendedUse}
                  </p>
                  {item.classicalTextName && (
                    <div className="flex items-center space-x-1 text-[11px] text-emerald-700 pt-0.5">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.classicalTextName}</span>
                    </div>
                  )}
                </div>

                {/* Action Footer: Open Case & Delete */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Saved State Available
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpen(item)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer group-hover:scale-[1.02]"
                    title="Load saved analysis results without re-running RAG"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-slate-950" />
                    <span>Open Case</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-950" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Drawer / Modal Footer */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
        <div />

        {records.length > 0 && onClearHistory && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-red-500 hover:text-red-700 transition font-medium flex items-center space-x-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        )}
      </div>
    </div>
  );

  // Clean centered modal dialog (no sliding sidebar over the main page)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-transparent transition-opacity cursor-pointer"
        onClick={onClose}
        aria-label="Close Case History"
      />
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[840px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-white animate-scaleUp z-10">
        {drawerContent}
      </div>
    </div>
  );
};

export default CaseHistoryDrawer;
