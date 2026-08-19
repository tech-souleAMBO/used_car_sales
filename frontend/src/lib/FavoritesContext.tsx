'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { getOrCreateSessionId } from '@/lib/session';

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isFavorite: (vehicleId: string) => boolean;
  toggle: (vehicleId: string) => Promise<boolean>;
  refresh: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favoriteIds: new Set(),
  isFavorite: () => false,
  toggle: async () => false,
  refresh: () => {},
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;
    api.favorites
      .checkIds(sessionId)
      .then((res) => setFavoriteIds(new Set(res.ids)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isFavorite = useCallback((vehicleId: string) => favoriteIds.has(vehicleId), [favoriteIds]);

  const toggle = useCallback(
    async (vehicleId: string) => {
      const sessionId = getOrCreateSessionId();
      const result = await api.favorites.toggle(sessionId, vehicleId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (result.favorited) {
          next.add(vehicleId);
        } else {
          next.delete(vehicleId);
        }
        return next;
      });
      return result.favorited;
    },
    [],
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggle, refresh: load }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
