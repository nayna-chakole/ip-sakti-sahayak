import React from 'react';
import { CaseHistoryDrawer, CaseHistoryDrawerProps } from './CaseHistoryDrawer.js';
import { AnalysisHistoryItem } from '../utils/historyStorage.js';

export interface AnalysisHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisHistoryItem[];
  onSelectHistoryItem: (item: AnalysisHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory?: () => void;
  onResetDefaults?: () => void;
  activeItemId?: string;
  defaultViewMode?: 'sidebar' | 'modal';
}

export const AnalysisHistoryDrawer: React.FC<AnalysisHistoryDrawerProps> = (props) => {
  return (
    <CaseHistoryDrawer
      isOpen={props.isOpen}
      onClose={props.onClose}
      cases={props.history}
      history={props.history}
      onOpenCase={props.onSelectHistoryItem}
      onSelectHistoryItem={props.onSelectHistoryItem}
      onDeleteCase={props.onDeleteHistoryItem}
      onDeleteHistoryItem={props.onDeleteHistoryItem}
      onClearHistory={props.onClearHistory}
      onResetDefaults={props.onResetDefaults}
      activeItemId={props.activeItemId}
      defaultViewMode={props.defaultViewMode}
    />
  );
};

export { CaseHistoryDrawer };
export default AnalysisHistoryDrawer;
