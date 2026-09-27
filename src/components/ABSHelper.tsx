import React from 'react';
import { useTranslation } from '../i18n/index.js';
import { ShieldAlert, CheckSquare, Square, CheckCircle, AlertTriangle } from 'lucide-react';

interface ABSHelperProps {
  checklist?: {
    resourceIdentified: boolean;
    sourceDocumented: boolean;
    nbaApprovalStatus: boolean;
    markedAsReviewed: boolean;
  };
  onUpdateChecklist: (updated: {
    resourceIdentified?: boolean;
    sourceDocumented?: boolean;
    nbaApprovalStatus?: boolean;
    markedAsReviewed?: boolean;
  }) => void;
}

export const ABSHelper: React.FC<ABSHelperProps> = ({
  checklist = {
    resourceIdentified: false,
    sourceDocumented: false,
    nbaApprovalStatus: false,
    markedAsReviewed: false
  },
  onUpdateChecklist
}) => {
  const { t } = useTranslation();

  return (
    <div id="abs-compliance-card" className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              {t('absHelper.title')}
            </h4>
            <p className="text-[11px] text-slate-600">
              {t('absHelper.subtitle')}
            </p>
          </div>
        </div>

        {checklist.markedAsReviewed ? (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>{t('absHelper.reviewedStatus')}</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-700" />
            <span>{t('absHelper.pendingStatus')}</span>
          </span>
        )}
      </div>

      {/* Checklist Items */}
      <div className="space-y-2 pt-1">
        {/* Step 1 */}
        <label className="flex items-start space-x-2.5 text-xs text-slate-800 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => onUpdateChecklist({ resourceIdentified: !checklist.resourceIdentified })}
            className="mt-0.5 text-amber-700 hover:text-amber-800"
          >
            {checklist.resourceIdentified ? (
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <span className={checklist.resourceIdentified ? 'line-through text-slate-500' : ''}>
            {t('absHelper.step1')}
          </span>
        </label>

        {/* Step 2 */}
        <label className="flex items-start space-x-2.5 text-xs text-slate-800 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => onUpdateChecklist({ sourceDocumented: !checklist.sourceDocumented })}
            className="mt-0.5 text-amber-700 hover:text-amber-800"
          >
            {checklist.sourceDocumented ? (
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <span className={checklist.sourceDocumented ? 'line-through text-slate-500' : ''}>
            {t('absHelper.step2')}
          </span>
        </label>

        {/* Step 3 */}
        <label className="flex items-start space-x-2.5 text-xs text-slate-800 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => onUpdateChecklist({ nbaApprovalStatus: !checklist.nbaApprovalStatus })}
            className="mt-0.5 text-amber-700 hover:text-amber-800"
          >
            {checklist.nbaApprovalStatus ? (
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <span className={checklist.nbaApprovalStatus ? 'line-through text-slate-500' : ''}>
            {t('absHelper.step3')}
          </span>
        </label>
      </div>

      {/* Mark Reviewed Toggle */}
      <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
        <span className="text-[11px] text-slate-600">
          Statutory pathway: Biological Diversity Act, 2002 (Sec 3 & 6)
        </span>
        <button
          type="button"
          onClick={() => onUpdateChecklist({ markedAsReviewed: !checklist.markedAsReviewed })}
          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
            checklist.markedAsReviewed
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-white text-slate-800 border-slate-300 hover:border-amber-400'
          }`}
        >
          {checklist.markedAsReviewed ? 'Marked as Reviewed' : t('absHelper.markReviewed')}
        </button>
      </div>
    </div>
  );
};
