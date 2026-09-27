import React, { useState } from 'react';
import { BookOpen, ExternalLink, FileText, X, Check, Copy, ShieldCheck, Scale } from 'lucide-react';
import { StoredCitation } from '../api/client.js';
import { useTranslation } from '../i18n/index.js';
import {
  translateSection,
  translateActName,
  translateStatutoryText
} from '../utils/statutoryTranslation.js';

interface CitationChipProps {
  citation: StoredCitation;
  onOpenKnowledgeBase?: () => void;
}

export const CitationChip: React.FC<CitationChipProps> = ({ citation, onOpenKnowledgeBase }) => {
  const { lang, t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const localizedSection = translateSection(citation.section, lang);
  const localizedDocument = translateActName(citation.document || (citation as any).source, lang);
  const localizedHeading = citation.heading ? translateStatutoryText(citation.heading, lang) : '';
  const localizedText = citation.text ? translateStatutoryText(citation.text, lang) : '';
  const localizedAuthority = citation.authority ? translateStatutoryText(citation.authority, lang) : '';

  const handleCopy = () => {
    const textToCopy = `[${localizedDocument} - ${localizedSection}${localizedHeading ? ` (${localizedHeading})` : ''}]\n${localizedText || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 hover:border-emerald-400 transition-all shadow-2xs cursor-pointer group"
        title="Click to view authoritative statutory evidence chunk"
      >
        <Scale className="w-3.5 h-3.5 text-emerald-700 group-hover:text-emerald-800" />
        <span className="font-semibold text-emerald-950">{localizedSection}</span>
        <span className="text-emerald-400 font-normal">|</span>
        <span className="text-emerald-800 truncate max-w-[130px] sm:max-w-[190px]">
          {localizedDocument}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200">
          {lang === 'hi' ? 'साक्ष्य' : lang === 'mr' ? 'पुरावा' : 'Evidence'}
        </span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span>
                      {lang === 'hi'
                        ? 'आधिकारिक वैधानिक साक्ष्य'
                        : lang === 'mr'
                        ? 'अधिकृत वैधानिक पुरावा'
                        : 'Authoritative Statutory Evidence'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      {lang === 'hi' ? 'सत्यापित अंश' : lang === 'mr' ? 'पडताळलेला उतारा' : 'Verified Passage'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'hi'
                      ? 'इस परामर्श को आधार देने वाला सटीक वैधानिक उद्धरण'
                      : lang === 'mr'
                      ? 'या सल्ल्यासाठी घेतलेला अचूक कायदेशीर संदर्भ'
                      : 'Exact statutory chunk retrieved to ground this advice'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="py-4 space-y-4 overflow-y-auto pr-1">
              {/* Document & Section details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="font-semibold uppercase text-slate-400 text-[10px] block">
                    {lang === 'hi'
                      ? 'अधिनियम / विनियामक व्यवस्था'
                      : lang === 'mr'
                      ? 'कायदा / नियामक चौकट'
                      : 'Statute / Regulatory Instrument'}
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">{localizedDocument}</p>
                  {localizedAuthority && (
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {lang === 'hi' ? 'प्राधिकरण' : lang === 'mr' ? 'प्राधिकरण' : 'Authority'}: {localizedAuthority}
                    </p>
                  )}
                </div>
                <div>
                  <span className="font-semibold uppercase text-slate-400 text-[10px] block">
                    {lang === 'hi'
                      ? 'लागू कानूनी धारा / अनुच्छेद'
                      : lang === 'mr'
                      ? 'लागू कायदेशीर कलम / अनुच्छेद'
                      : 'Statutory Provision / Article'}
                  </span>
                  <p className="font-bold text-emerald-900 mt-0.5">{localizedSection}</p>
                  {localizedHeading && (
                    <p className="text-slate-600 italic text-[11px] mt-0.5 font-medium">{localizedHeading}</p>
                  )}
                </div>
                {citation.version && (
                  <div>
                    <span className="font-semibold uppercase text-slate-400 text-[10px] block">
                      {lang === 'hi' ? 'संस्करण / राजपत्र संस्करण' : lang === 'mr' ? 'आवृत्ती / राजपत्र आवृत्ती' : 'Version / Gazette Edition'}
                    </span>
                    <p className="text-slate-700 font-medium mt-0.5">{citation.version}</p>
                  </div>
                )}
                {citation.effectiveDate && (
                  <div>
                    <span className="font-semibold uppercase text-slate-400 text-[10px] block">
                      {lang === 'hi' ? 'प्रभावी / लागू तिथि' : lang === 'mr' ? 'लागू तारीख' : 'Effective / Ratified Date'}
                    </span>
                    <p className="text-slate-700 font-medium mt-0.5">{citation.effectiveDate}</p>
                  </div>
                )}
              </div>

              {/* Exact Text Evidence Chunk */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {lang === 'hi'
                        ? 'वैधानिक मूल पाठ'
                        : lang === 'mr'
                        ? 'मूळ कायदेशीर संहिता उतारा'
                        : 'Statutory Text Passage'}
                    </span>
                  </span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 font-medium transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">
                          {lang === 'hi' ? 'कॉपी किया गया' : lang === 'mr' ? 'कॉपी केले' : 'Copied'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          {lang === 'hi' ? 'साक्ष्य कॉपी करें' : lang === 'mr' ? 'पुरावा कॉपी करा' : 'Copy Evidence'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs leading-relaxed font-mono whitespace-pre-wrap border border-slate-800 shadow-inner max-h-56 overflow-y-auto">
                  {localizedText ||
                    (lang === 'hi'
                      ? 'आधिकारिक राजपत्र भंडार से सत्यापित विधिक पाठ। संपूर्ण अधिनियम देखने हेतु नॉलेज बेस खोलें।'
                      : lang === 'mr'
                      ? 'अधिकृत राजपत्रातून पडताळलेला कायदेशीर मजकूर. संपूर्ण कायदा पाहण्यासाठी नॉलेज बेस उघडा.'
                      : 'Authoritative legal text verified from official gazette repository. Please open the full Knowledge Base to inspect the full Act.')}
                </div>
              </div>

              {/* Verification statement */}
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">
                    {lang === 'hi'
                      ? 'वैधानिक आधार नियम:'
                      : lang === 'mr'
                      ? 'वैधानिक आधार नियम:'
                      : 'Statutory Grounding Rule:'}
                  </span>{' '}
                  {lang === 'hi'
                    ? 'यह विशिष्ट कानूनी अंश उत्तर देने से पूर्व ज्ञानकोष से निकाला गया है। सहायक एआई बिना वैधानिक आधार के कानून नहीं बनाता।'
                    : lang === 'mr'
                    ? 'हा विशिष्ट कायदेशीर उतारा उत्तर देण्यापूर्वी संदर्भ साहित्यातून काढला गेला आहे. सहायक एआय कायदेशीर पुराव्याशिवाय उत्तर देत नाही.'
                    : 'This specific passage was retrieved prior to LLM response generation. The assistant cannot fabricate laws or cite sections outside the loaded evidence corpus.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {citation.sourceUrl ? (
                <a
                  href={citation.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                >
                  <span>
                    {lang === 'hi'
                      ? 'आधिकारिक राजपत्र / संधि स्रोत'
                      : lang === 'mr'
                      ? 'अधिकृत राजपत्र / करार स्त्रोत'
                      : 'Official Gazette / Treaty Source'}
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span />
              )}

              <div className="flex items-center space-x-2">
                {onOpenKnowledgeBase && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      onOpenKnowledgeBase();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                  >
                    {lang === 'hi' ? 'ज्ञान पुस्तकालय' : lang === 'mr' ? 'ज्ञान ग्रंथालय' : 'Knowledge Library'}
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#0F2A4A] hover:bg-slate-800 text-white rounded-lg transition"
                >
                  {lang === 'hi' ? 'बंद करें' : lang === 'mr' ? 'बंद करा' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
