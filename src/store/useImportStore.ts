import { create } from 'zustand';

// Transient, non-persisted hand-off for statement text between SmartFeaturesScreen and
// StatementReviewScreen — too large/variable to pass safely through a URL query param.
type State = {
  pendingStatementText: string;
  setPendingStatementText: (text: string) => void;
};

export const useImportStore = create<State>()(set => ({
  pendingStatementText: '',
  setPendingStatementText: text => set({ pendingStatementText: text }),
}));
