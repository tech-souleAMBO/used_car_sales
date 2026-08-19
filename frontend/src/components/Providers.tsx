'use client';

import { type ReactNode } from 'react';
import { FavoritesProvider } from '@/lib/FavoritesContext';
import { ComparisonsProvider } from '@/lib/ComparisonsContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FavoritesProvider>
      <ComparisonsProvider>{children}</ComparisonsProvider>
    </FavoritesProvider>
  );
}
