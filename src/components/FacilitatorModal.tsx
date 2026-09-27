import React, { useState } from 'react';
import { api } from '../api/client.js';
import { useTranslation } from '../i18n/index.js';
import { useAuth } from '../context/AuthContext.js';
import { CaseDossier, FacilitatorReviewTicket } from '../types/analysis.js';
import {
  UserCheck,
  Download,
  CheckCircle2,
  X,
  AlertTriangle,
  Send,
  Clock,
  ShieldCheck,
  FileText,
  Building2,
  Sparkles
} from 'lucide-react';

interface FacilitatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoEscalated?: boolean;
  dossier?: CaseDossier | null;
  onReviewSubmitted?: (ticket: FacilitatorReviewTicket) => void;
}

export const FacilitatorModal: React.FC<FacilitatorModalProps> = ({
  isOpen,
  onClose,
  autoEscalated = false,
  dossier,
  onReviewSubmitted
}) => {
  const { t, lang } = useTranslation();
  const { user } = useAuth();

  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState<'Standard' | 'Expedited'>('Standard');
  const [submitting, setSubmitting] = useState(false);
  const [reviewTicket, setReviewTicket] = useState<FacilitatorReviewTicket | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // If we don't have a full dossier passed yet, fetch/create it
      let activeDossier = dossier;
      if (!activeDossier) {
        const res = await api.dossier.create({
          language: lang,
          applicant: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
              }
            : undefined
        });
        activeDossier = res.dossier;
      }

      const res = await api.facilitator.submitReview({
        dossier: activeDossier,
        notes,
        urgency
      });

      const ticket = res.ticket;
      setReviewTicket(ticket);
      onReviewSubmitted?.(ticket);
    } catch (err: any) {
      console.error('Failed to submit facilitator review:', err);
      setError(err?.message || 'Failed to submit review request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportDossier = async () => {
    setDownloading(true);
    try {
      if (dossier) {
        const res = await api.dossier.export({ dossier });
        const textContent = res.dossierText;
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IP-SAKTI-Dossier-${dossier.caseId}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const res = await api.facilitator.getDossier();
        const dossierData = res.dossier;
        const jsonStr = JSON.stringify(dossierData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IP-SAKTI-Dossier-${user?.name?.replace(/\s+/g, '_') || 'Export'}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export dossier:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 border border-amber-500/20 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                {t('caseDossier.reviewModalTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('caseDossier.reviewModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {autoEscalated && !reviewTicket && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              The assistant flagged that this query involves borderline regulatory nuances or moderate statutory grounding. A human facilitator review is recommended.
            </span>
          </div>
        )}

        {/* Form or Confirmation */}
        {!reviewTicket ? (
          <form onSubmit={handleSubmitReview} className="py-4 space-y-4 text-xs sm:text-sm text-slate-700">
            <p className="leading-relaxed text-slate-600 text-xs">
              {t('facilitator.description')}
            </p>

            {/* Case Snapshot Banner */}
            {dossier && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    {t('caseDossier.caseId')}: <span className="font-mono text-amber-800">{dossier.caseId}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {dossier.jurisdiction}
                  </span>
                </div>
                <div className="text-slate-700">
                  <strong>Product:</strong> {dossier.productInformation?.productName} ({dossier.classification?.category})
                </div>
                {dossier.uncertaintyFlags && dossier.uncertaintyFlags.length > 0 && (
                  <div className="text-[11px] text-amber-800 font-semibold pt-1">
                    ⚠ {dossier.uncertaintyFlags.length} statutory review flag(s) attached to this submission.
                  </div>
                )}
              </div>
            )}

            {/* Optional Applicant Notes */}
            <div className="space-y-1.5">
              <label htmlFor="facilitator-notes-input" className="block text-xs font-bold text-slate-800">
                {t('caseDossier.reviewNotesLabel')}
              </label>
              <textarea
                id="facilitator-notes-input"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('caseDossier.reviewNotesPlaceholder')}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white placeholder:text-slate-400"
              />
            </div>

            {/* Urgency */}
            <div className="space-y-1.5">
              <label htmlFor="facilitator-urgency-select" className="block text-xs font-bold text-slate-800">
                {t('caseDossier.urgencyLabel')}
              </label>
              <select
                id="facilitator-urgency-select"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="Standard">{t('caseDossier.urgencyStandard')}</option>
                <option value="Expedited">{t('caseDossier.urgencyExpedited')}</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleExportDossier}
                disabled={downloading}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Exporting...' : t('facilitator.downloadBtn')}</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? t('caseDossier.submittingReview') : t('caseDossier.submitReviewBtn')}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation State */
          <div className="py-5 space-y-4 animate-fadeIn">
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <h4 className="font-black text-sm text-emerald-950">
                  {t('caseDossier.reviewSubmittedSuccess')}
                </h4>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed pl-8">
                {t('caseDossier.reviewConfirmationNotice')}
              </p>
            </div>

            {/* Ticket Details Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">{t('caseDossier.reviewId')}:</span>
                <span className="font-mono font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {reviewTicket.reviewId}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">{t('caseDossier.caseId')}:</span>
                <span className="font-mono font-bold text-slate-800">
                  {reviewTicket.caseId}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">{t('caseDossier.status')}:</span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {t('caseDossier.statusSubmitted')}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">{t('caseDossier.assignedCell')}:</span>
                <span className="font-semibold text-slate-800">
                  {reviewTicket.assignedCell}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Timestamp:</span>
                <span className="text-slate-700">
                  {new Date(reviewTicket.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 italic">
              Note: This submission registers your formal dossier with the Ayush IP Cell. No simulated completion has been triggered. Registered human facilitators process tickets in accordance with official statutory workflows.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleExportDossier}
                className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 rounded-lg border border-slate-300 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('facilitator.downloadBtn')}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition cursor-pointer"
              >
                {t('caseDossier.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
