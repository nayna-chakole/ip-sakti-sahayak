import React from 'react';
import { ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from '../i18n/index.js';

interface ConfidenceBadgeProps {
  confidence?: 'High' | 'Medium' | 'Low';
  showLabel?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence = 'Medium',
  showLabel = true
}) => {
  const { t } = useTranslation();

  if (confidence === 'High') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
        {showLabel && <span>{t('confidence.high')}</span>}
      </span>
    );
  }

  if (confidence === 'Low') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300">
        <AlertCircle className="w-3.5 h-3.5 text-red-700" />
        {showLabel && <span>{t('confidence.low')}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
      <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
      {showLabel && <span>{t('confidence.medium')}</span>}
    </span>
  );
};
