import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

export interface RequestDraft {
  portId: number | null;
  portName: string;
  categoryId: number | null;
  categoryName: string;
  subcategoryId: number | null;
  subcategoryName: string;
  vesselName: string;
  imoNumber: string;
  title: string;
  description: string;
  serviceDate: string;
  serviceTime: string;
  budgetMin: string;
  budgetMax: string;
  urgency: 'standard' | 'urgent' | 'emergency';
}

interface RequestDraftContextValue {
  draft: RequestDraft;
  setDraftField: <K extends keyof RequestDraft>(
    key: K,
    value: RequestDraft[K],
  ) => void;
  resetDraft: () => void;
}

const initialDraft: RequestDraft = {
  portId: null,
  portName: '',
  categoryId: null,
  categoryName: '',
  subcategoryId: null,
  subcategoryName: '',
  vesselName: '',
  imoNumber: '',
  title: '',
  description: '',
  serviceDate: '',
  serviceTime: '',
  budgetMin: '',
  budgetMax: '',
  urgency: 'standard',
};

const RequestDraftContext = createContext<RequestDraftContextValue | null>(null);

export const RequestDraftProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [draft, setDraft] = useState<RequestDraft>(initialDraft);

  const setDraftField = useCallback(
    <K extends keyof RequestDraft>(key: K, value: RequestDraft[K]) => {
      setDraft(d => ({ ...d, [key]: value }));
    },
    [],
  );

  const resetDraft = useCallback(() => setDraft(initialDraft), []);

  return (
    <RequestDraftContext.Provider value={{ draft, setDraftField, resetDraft }}>
      {children}
    </RequestDraftContext.Provider>
  );
};

export const useRequestDraft = (): RequestDraftContextValue => {
  const ctx = useContext(RequestDraftContext);
  if (!ctx)
    throw new Error(
      'useRequestDraft must be used inside <RequestDraftProvider>',
    );
  return ctx;
};
