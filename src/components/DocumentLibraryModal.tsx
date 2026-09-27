import React, { useEffect, useState, useMemo } from 'react';
import { api, DocumentStatus } from '../api/client.js';
import { useTranslation } from '../i18n/index.js';
import {
  translateActName,
  translateSection,
  translateStatutoryText
} from '../utils/statutoryTranslation.js';
import {
  BookOpen,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Power,
  Search,
  Building2,
  Scale,
  FileText,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DocumentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Only admins can toggle documents in/out of the retrieval corpus. Everyone else
  // (expert or user) still gets the full read-only list — this is enforced again on
  // the backend (POST /api/knowledge/toggle is admin-only), this prop just avoids
  // showing controls that would return a 403 anyway.
  canManage: boolean;
}

export const DocumentLibraryModal: React.FC<DocumentLibraryModalProps> = ({ isOpen, onClose, canManage }) => {
  const { t, lang } = useTranslation();
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<'all' | 'India' | 'International'>('all');
  const [loadedFilter, setLoadedFilter] = useState<'all' | 'loaded' | 'unloaded'>('all');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.knowledge.getDocuments();
      setDocuments(res.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const handleToggle = async (docId: string, currentLoaded: boolean) => {
    setTogglingId(docId);
    try {
      const res = await api.knowledge.toggleDocument(docId, !currentLoaded);
      setDocuments(res.documents || []);
    } catch (err) {
      console.error('Failed to toggle document state:', err);
    } finally {
      setTogglingId(null);
    }
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !searchQuery.trim() ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.actRegulation && doc.actRegulation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.authority && doc.authority.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.sourceAuthority && doc.sourceAuthority.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.sectionsCovered && doc.sectionsCovered.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (doc.sections && doc.sections.some((sec) => sec.text?.toLowerCase().includes(searchQuery.toLowerCase()) || sec.heading?.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesJurisdiction =
        jurisdictionFilter === 'all' ||
        doc.jurisdiction?.toLowerCase() === jurisdictionFilter.toLowerCase();

      const matchesLoaded =
        loadedFilter === 'all' ||
        (loadedFilter === 'loaded' && doc.isLoaded) ||
        (loadedFilter === 'unloaded' && !doc.isLoaded);

      return matchesSearch && matchesJurisdiction && matchesLoaded;
    });
  }, [documents, searchQuery, jurisdictionFilter, loadedFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-5">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp text-slate-900">
        {/* Header */}
        <div className="bg-[#0F2A4A] text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-400/30 shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white truncate">
                  {lang === 'hi' ? 'आयुष ज्ञानकोश एवं वैधानिक संदर्भ' : lang === 'mr' ? 'आयुष ज्ञानकोश व कायदेशीर संदर्भ' : 'Knowledge Base & Statutory Reference Corpus'}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {documents.length} Statutes
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                {lang === 'hi' ? 'प्राधिकृत भारतीय एवं अंतर्राष्ट्रीय अधिनियम, नियम, एवं विनियामक प्राधिकार' : lang === 'mr' ? 'अधिकृत भारतीय व आंतरराष्ट्रीय कायदे, नियम, आणि विनियामक अधिकार' : 'Authoritative Acts, Regulations, Governing Authorities & Codified Sections'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'hi' ? 'अधिनियम, प्राधिकारी, धारा या कीवर्ड द्वारा खोजें...' : lang === 'mr' ? 'कायदा, प्राधिकरण, कलम किंवा कीवर्डद्वारे शोधा...' : 'Search statutes by title, Act, authority, section (e.g. 3(p), BDA, SBB)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter options */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-slate-500 font-semibold flex items-center space-x-1">
                <Filter className="w-3 h-3 text-slate-400" />
                <span>Jurisdiction:</span>
              </span>
              {(['all', 'India', 'International'] as const).map((jur) => (
                <button
                  key={jur}
                  onClick={() => setJurisdictionFilter(jur)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    jurisdictionFilter === jur
                      ? 'bg-[#0F2A4A] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {jur === 'all' ? 'All' : jur}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-semibold">Loaded Status:</span>
              {(['all', 'loaded', 'unloaded'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setLoadedFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                    loadedFilter === st
                      ? 'bg-amber-500 text-slate-950 shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content list */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-3.5 bg-slate-50/50">
          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-600" />
              <p className="text-xs sm:text-sm font-semibold">Loading statutory knowledge corpus...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-14 text-center text-slate-500 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No matching statutory documents found</h4>
              <p className="text-xs text-slate-500">Try adjusting your search query or reset the filters.</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const isExpanded = expandedDocId === doc.id;
              const sectionsCovered = doc.sectionsCovered || (doc.sections ? doc.sections.map((s) => s.sectionNumber || s.heading) : []);
              const authorityName = doc.authority || doc.sourceAuthority || 'Central Statutory Authority';
              const actReg = doc.actRegulation || doc.title;
              const versionInfo = doc.version || (doc.year ? `Year ${doc.year}` : 'Codified Statutory Text');

              return (
                <div
                  key={doc.id}
                  className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 bg-white ${
                    doc.isLoaded
                      ? 'border-slate-300 shadow-xs hover:border-amber-400'
                      : 'border-slate-200 opacity-75 bg-slate-50/60'
                  }`}
                >
                  {/* Top Row: Title, Year, Jurisdiction, Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                          {translateActName(doc.title, lang)}
                        </h3>
                        {/* Jurisdiction Badge */}
                        <span
                          className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${
                            doc.jurisdiction === 'International'
                              ? 'bg-purple-50 text-purple-900 border-purple-200'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          }`}
                        >
                          {doc.jurisdiction === 'International'
                            ? (lang === 'hi' ? 'अंतर्राष्ट्रीय' : lang === 'mr' ? 'आंतरराष्ट्रीय' : 'International')
                            : (lang === 'hi' ? 'भारत' : lang === 'mr' ? 'भारत' : 'India')}
                        </span>
                        {/* Version/Year Badge */}
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {versionInfo}
                        </span>
                      </div>

                      {/* Act / Regulation Display */}
                      <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-medium">
                        <Scale className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {lang === 'hi' ? 'अधिनियम / विनियम:' : lang === 'mr' ? 'कायदा / नियमन:' : 'Act / Regulation:'}
                        </span>
                        <span className="text-slate-600">{translateActName(actReg, lang)}</span>
                      </div>

                      {/* Authority Display */}
                      <div className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {lang === 'hi' ? 'शासी प्राधिकरण:' : lang === 'mr' ? 'नियामक प्राधिकरण:' : 'Governing Authority:'}
                        </span>
                        <span className="text-slate-600">{translateStatutoryText(authorityName, lang)}</span>
                      </div>
                    </div>

                    {/* Loaded Status & Actions */}
                    <div className="flex items-center space-x-2 sm:self-start shrink-0">
                      {/* Loaded / Not Loaded Badge */}
                      {doc.isLoaded ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{lang === 'hi' ? 'सक्रिय / लोड है' : lang === 'mr' ? 'सक्रिय / लोड केले' : 'Loaded'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>{lang === 'hi' ? 'लोड नहीं है' : lang === 'mr' ? 'लोड नाही' : 'Not Loaded'}</span>
                        </span>
                      )}

                      {/* Toggle Active Loaded State — admin only */}
                      {canManage ? (
                        <button
                        type="button"
                        onClick={() => handleToggle(doc.id, doc.isLoaded)}
                        disabled={togglingId === doc.id}
                        className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer border ${
                          doc.isLoaded
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-2xs'
                        }`}
                        title={doc.isLoaded ? 'Unload statutory sections from retrieval' : 'Load statutory sections for retrieval'}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {doc.isLoaded
                            ? (lang === 'hi' ? 'अनलोड करें' : lang === 'mr' ? 'अनलोड करा' : 'Unload')
                            : (lang === 'hi' ? 'लोड करें' : lang === 'mr' ? 'लोड करा' : 'Load')}
                        </span>
                      </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 italic px-1">
                          {lang === 'hi' ? 'केवल-दृश्य' : lang === 'mr' ? 'फक्त-दृश्य' : 'View only'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sections / Rules Covered Display */}
                  {sectionsCovered && sectionsCovered.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>
                          {lang === 'hi'
                            ? 'शामिल धाराएं / कानूनी नियम:'
                            : lang === 'mr'
                            ? 'समाविष्ट कलमे व कायदेशीर नियम:'
                            : 'Sections / Rules Covered:'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sectionsCovered.map((sec, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200"
                          >
                            {translateSection(typeof sec === 'string' ? sec : String(sec), lang)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Row: Source URL link & Detailed Inspection */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                    {doc.sourceUrl ? (
                      <a
                        href={doc.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-amber-800 hover:text-amber-950 font-semibold hover:underline"
                      >
                        <span>
                          {lang === 'hi'
                            ? 'आधिकारिक स्रोत पोर्टल'
                            : lang === 'mr'
                            ? 'अधिकृत स्त्रोत पोर्टल'
                            : 'Official Source Portal'}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">
                        {lang === 'hi' ? 'स्रोत उपलब्ध नहीं है' : lang === 'mr' ? 'स्त्रोत उपलब्ध नाही' : 'Source unavailable'}
                      </span>
                    )}

                    {doc.sections && doc.sections.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                        className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 transition"
                      >
                        <span>
                          {isExpanded
                            ? (lang === 'hi' ? 'कानूनी धाराएं छिपाएं' : lang === 'mr' ? 'कायदेशीर कलमे लपवा' : 'Hide Statutory Clauses')
                            : (lang === 'hi' ? `कानूनी धाराएं देखें (${doc.sections.length})` : lang === 'mr' ? `कायदेशीर कलमे पहा (${doc.sections.length})` : `Inspect Clauses (${doc.sections.length})`)}
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Expandable Clause Text View */}
                  {isExpanded && doc.sections && doc.sections.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5 animate-fadeIn">
                      <div className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                        {lang === 'hi'
                          ? 'संहिताबद्ध वैधानिक पाठ एवं विधिक प्रभाव:'
                          : lang === 'mr'
                          ? 'कायदेशीर संहिता मजकूर व कायदेशीर प्रभाव:'
                          : 'Codified Statutory Text & Legal Impact:'}
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {doc.sections.map((sec, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-slate-900 text-xs">
                                {translateSection(sec.sectionNumber || (sec as any).section || `Section ${idx + 1}`, lang)} — {translateStatutoryText(sec.heading || sec.title, lang)}
                              </span>
                              {sec.authority && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {translateStatutoryText(sec.authority, lang)}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700 text-xs leading-relaxed font-serif">
                              "{translateStatutoryText(sec.text, lang)}"
                            </p>
                            {sec.relevance && (
                              <p className="text-[11px] text-amber-950 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                                <strong>{lang === 'hi' ? 'कानूनी महत्व:' : lang === 'mr' ? 'कायदेशीर महत्त्व:' : 'Legal Significance:'}</strong> {translateStatutoryText(sec.relevance, lang)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">
            National Ayush Knowledge Base & Statutory Grounding Repository
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#0F2A4A] hover:bg-slate-800 text-white rounded-xl transition cursor-pointer ml-auto"
          >
            Close Repository
          </button>
        </div>
      </div>
    </div>
  );
};