'use client';

import { useState } from 'react';
import { Scale } from 'lucide-react';
import clsx from 'clsx';
import { useComparisons } from '@/lib/ComparisonsContext';

export function CompareButton({ vehicleId, className }: { vehicleId: string; className?: string }) {
  const { inComparison, toggle } = useComparisons();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const compared = inComparison(vehicleId);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await toggle(vehicleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={compared}
      aria-label={compared ? 'Retirer du comparateur' : 'Ajouter au comparateur'}
      title={error ?? undefined}
      className={clsx(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white',
        className,
      )}
    >
      <Scale size={16} className={compared ? 'text-accent' : 'text-ink/60'} />
    </button>
  );
}
