'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { getOrCreateSessionId } from '@/lib/session';

interface ComparisonsContextValue {
  comparisonIds: Set<string>;
  inComparison: (vehicleId: string) => boolean;
  toggle: (vehicleId: string) => Promise<boolean>;
  refresh: () => void;
}

const ComparisonsContext = createContext<ComparisonsContextValue>({
  comparisonIds: new Set(),
  inComparison: () => false,
  toggle: async () => false,
  refresh: () => {},
});

export function ComparisonsProvider({ children }: { children: ReactNode }) {
  const [comparisonIds, setComparisonIds] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;
    api.comparisons
      .checkIds(sessionId)
      .then((res) => setComparisonIds(new Set(res.ids)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const inComparison = useCallback(
    (vehicleId: string) => comparisonIds.has(vehicleId),
    [comparisonIds],
  );

  const toggle = useCallback(
    async (vehicleId: string) => {
      const sessionId = getOrCreateSessionId();
      const result = await api.comparisons.toggle(sessionId, vehicleId);
      setComparisonIds((prev) => {
        const next = new Set(prev);
        if (result.inComparison) {
          next.add(vehicleId);
        } else {
          next.delete(vehicleId);
        }
        return next;
      });
      return result.inComparison;
    },
    [],
  );

  return (
    <ComparisonsContext.Provider value={{ comparisonIds, inComparison, toggle, refresh: load }}>
      {children}
    </ComparisonsContext.Provider>
  );
}

export function useComparisons() {
  return useContext(ComparisonsContext);
}
