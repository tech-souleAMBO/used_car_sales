'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import clsx from 'clsx';
import { useFavorites } from '@/lib/FavoritesContext';

export function FavoriteButton({ vehicleId, className }: { vehicleId: string; className?: string }) {
  const { isFavorite, toggle } = useFavorites();
  const [loading, setLoading] = useState(false);
  const favorite = isFavorite(vehicleId);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      await toggle(vehicleId);
    } catch {
      // silencieux — l'état revient au précédent
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={favorite}
      aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={clsx(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white',
        className,
      )}
    >
      <Heart
        size={16}
        className={favorite ? 'fill-accent text-accent' : 'text-ink/60'}
      />
    </button>
  );
}
