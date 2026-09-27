import React from 'react';
import { HelpCircle, X, ShieldAlert, CheckCircle2, Scale, Globe2, BookOpen, UserCheck, ArrowRight } from 'lucide-react';
import { ChatMessage, UserSession } from '../api/client.js';
import { useTranslation } from '../i18n/index.js';
import {
  translateSection,
  translateActName,
  translateCategory,
  translateStatutoryText
} from '../utils/statutoryTranslation.js';

interface WhyThisAnswerModalProps {
  message: ChatMessage;
  session: UserSession;
  onClose: () => void;
  onOpenFacilitator?: () => void;
}

export const WhyThisAnswerModal: React.FC<WhyThisAnswerModalProps> = ({
  message,
  session,
  onClose,
  onOpenFacilitator
}) => {
  const { lang } = useTranslation();
  const details = message.explanationDetails;
  const classification = session.classificationResult;
  const jurisdiction = details?.jurisdictionUsed || session.jurisdiction || 'India';
  const confidence = message.confidence || 'Medium';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <HelpCircle className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span>
                  {lang === 'hi'
                    ? 'यह उत्तर क्यों?'
                    : lang === 'mr'
                    ? 'हे उत्तर का?'
                    : 'Why this answer?'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                    confidence === 'High'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : confidence === 'Medium'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {confidence === 'High'
                    ? (lang === 'hi' ? 'उच्च विश्वसनीयता तर्क' : lang === 'mr' ? 'उच्च विश्वासार्हता तर्क' : 'High Confidence Reasoning')
                    : confidence === 'Medium'
                    ? (lang === 'hi' ? 'मध्यम विश्वसनीयता तर्क' : lang === 'mr' ? 'मध्यम विश्वासार्हता तर्क' : 'Medium Confidence Reasoning')
                    : (lang === 'hi' ? 'समीक्षा अनुशंसित' : lang === 'mr' ? 'पुनरावलोकन आवश्यक' : 'Review Recommended')}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'hi'
                  ? 'पारदर्शी सत्यापन मार्ग: वर्गीकरण, क्षेत्राधिकार एवं पुनर्प्राप्त कानून'
                  : lang === 'mr'
                  ? 'पारदर्शक पडताळणी मार्ग: वर्गवारी, कार्यक्षेत्र व शोधलेला कायदा'
                  : 'Transparent verification trail: classification, jurisdiction, and retrieved law'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 overflow-y-auto pr-1 text-xs">
          {/* 1. Classification & Jurisdiction */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-semibold uppercase text-slate-400 text-[10px] block flex items-center space-x-1">
                <Scale className="w-3 h-3 text-slate-500" />
                <span>
                  {lang === 'hi'
                    ? 'उत्पाद वर्गीकरण'
                    : lang === 'mr'
                    ? 'उत्पादन वर्गवारी'
                    : 'Product Classification'}
                </span>
              </span>
              <p className="font-bold text-slate-900 mt-1">
                {translateCategory(details?.classificationUsed || classification?.category, lang) || (lang === 'hi' ? 'वर्गीकृत नहीं' : lang === 'mr' ? 'वर्गीकृत नाही' : 'Not Classified')}
              </p>
              {classification?.product_name && (
                <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                  {lang === 'hi' ? 'उत्पाद:' : lang === 'mr' ? 'उत्पादन:' : 'Product:'} {classification.product_name}
                </p>
              )}
            </div>

            <div>
              <span className="font-semibold uppercase text-slate-400 text-[10px] block flex items-center space-x-1">
                <Globe2 className="w-3 h-3 text-slate-500" />
                <span>
                  {lang === 'hi'
                    ? 'वैधानिक क्षेत्राधिकार'
                    : lang === 'mr'
                    ? 'वैधानिक कार्यक्षेत्र'
                    : 'Statutory Jurisdiction'}
                </span>
              </span>
              <p className="font-bold text-slate-900 mt-1">
                {jurisdiction === 'India'
                  ? (lang === 'hi' ? 'भारत (India)' : lang === 'mr' ? 'भारत (India)' : 'India')
                  : (lang === 'hi' ? 'अंतर्राष्ट्रीय (International)' : lang === 'mr' ? 'आंतरराष्ट्रीय (International)' : 'International')}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {jurisdiction === 'India'
                  ? (lang === 'hi' ? 'भारतीय कानून (पेटेंट, जैव विविधता, FSSAI)' : lang === 'mr' ? 'भारतीय कायदे (पेटंट, जैवविविधता, FSSAI)' : 'Indian Statutes (Patents, BDA, FSSAI)')
                  : (lang === 'hi' ? 'अंतर्राष्ट्रीय व्यवस्थाएं (WIPO, नागोया, PCT)' : lang === 'mr' ? 'आंतरराष्ट्रीय चौकटी (WIPO, नागोया, PCT)' : 'International Regimes (WIPO, Nagoya, PCT)')}
              </p>
            </div>
          </div>

          {/* 2. Sources Retrieved */}
          <div className="space-y-1.5">
            <span className="font-semibold uppercase text-slate-400 text-[10px] block flex items-center space-x-1">
              <BookOpen className="w-3 h-3 text-slate-500" />
              <span>
                {lang === 'hi'
                  ? 'पुनर्प्राप्त आधिकारिक वैधानिक अधिनियम / कानून'
                  : lang === 'mr'
                  ? 'शोधलेले अधिकृत वैधानिक कायदे व नियम'
                  : 'Authoritative Statutory Sources Retrieved'}
              </span>
            </span>

            {details?.sourcesRetrieved && details.sourcesRetrieved.length > 0 ? (
              <div className="space-y-1.5">
                {details.sourcesRetrieved.map((src, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium flex items-center justify-between"
                  >
                    <span>{translateActName(src, lang)}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {lang === 'hi' ? 'सक्रिय' : lang === 'mr' ? 'सक्रिय' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            ) : message.citations && message.citations.length > 0 ? (
              <div className="space-y-1.5">
                {message.citations.map((c, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium flex items-center justify-between"
                  >
                    <span>
                      {translateActName(c.document, lang)} ({translateSection(c.section, lang)})
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium border border-emerald-200">
                      {lang === 'hi' ? 'वैधानिक धारा' : lang === 'mr' ? 'कायदेशीर कलम' : 'Statutory Section'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                {lang === 'hi'
                  ? 'इस क्षेत्राधिकार में कोई भी वैधानिक प्रावधान खोज सीमा को पूरा नहीं करता।'
                  : lang === 'mr'
                  ? 'या कार्यक्षेत्रात कोणतेही कायदेशीर कलम शोध मर्यादेत बसले नाही.'
                  : 'No matching statutory sections met the keyword threshold in this jurisdiction.'}
              </div>
            )}
          </div>

          {/* 3. Confidence & Legal Rationale */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-semibold uppercase text-slate-400 text-[10px] block">
              {lang === 'hi'
                ? 'विश्वसनीयता एवं वैधानिक तर्क'
                : lang === 'mr'
                ? 'विश्वासार्हता व वैधानिक तर्क'
                : 'Confidence & Statutory Rationale'}
            </span>
            <p className="text-slate-700 leading-relaxed font-normal">
              {translateStatutoryText(
                details?.confidenceReason ||
                  (confidence === 'High'
                    ? 'All statements are directly backed by retrieved legal provisions from loaded statutory instruments.'
                    : confidence === 'Medium'
                    ? 'Based on general statutory provisions; case-specific nuances require detailed experimental or clinical documentation.'
                    : 'Insufficient or ambiguous evidence in the current knowledge base. The system strictly abstains from inventing law.'),
                lang
              )}
            </p>

            {details?.retrievalRelevance && (
              <p className="text-[11px] text-slate-500 font-mono">
                {lang === 'hi' ? 'वैधानिक मिलान:' : lang === 'mr' ? 'कायदेशीर जुळवणी:' : 'Statutory Match:'} {translateStatutoryText(details.retrievalRelevance, lang)}
              </p>
            )}
          </div>

          {/* 4. Safe Abstention Notice if Low confidence or out of scope */}
          {(message.out_of_scope || confidence === 'Low') && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
              <div className="flex items-center space-x-2 text-rose-900 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>
                  {lang === 'hi'
                    ? 'सुरक्षित परिहार (Safe Abstention लागू)'
                    : lang === 'mr'
                    ? 'सुरक्षित नकार (Safe Abstention लागू)'
                    : 'Safe Abstention Enforced'}
                </span>
              </div>
              <p className="text-rose-800 leading-relaxed text-[11px]">
                {lang === 'hi'
                  ? 'चूंकि आधिकारिक कानूनी प्रावधानों का उच्च निश्चितता के साथ मिलान नहीं हो सका, इसलिए प्रणाली ने अटकल लगाने से इनकार कर दिया। आपको आयुष या पेटेंट विशेषज्ञ से परामर्श करने की सलाह दी जाती है।'
                  : lang === 'mr'
                  ? 'कारण अधिकृत कायदेशीर कलमे पुरेशा खात्रीने जुळू शकली नाहीत, म्हणून प्रणालीने अंदाज बांधणे टाळले. आपण आयुष किंवा पेटंट तज्ञांचा सल्ला घ्यावा.'
                  : 'Because authoritative legal provisions could not be matched with high certainty, the system declined to speculate. You are advised to escalate this inquiry to a qualified specialist.'}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-b-0 border-slate-200">
          {onOpenFacilitator && (
            <button
              onClick={() => {
                onClose();
                onOpenFacilitator();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>
                {lang === 'hi'
                  ? 'मानव सुविधा प्रदाता समीक्षा अनुरोध'
                  : lang === 'mr'
                  ? 'मानवी तज्ञ पुनरावलोकन विनंती'
                  : 'Request Human Facilitator'}
              </span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition cursor-pointer"
          >
            {lang === 'hi' ? 'बंद करें' : lang === 'mr' ? 'बंद करा' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
