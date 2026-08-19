'use client';

import { useEffect, useState } from 'react';
import { Scale, X } from 'lucide-react';
import { api } from '@/lib/api';
import { getOrCreateSessionId } from '@/lib/session';
import type { Vehicle } from '@/lib/types';
import {
  formatPrice,
  formatMileage,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  BODY_TYPE_LABELS,
} from '@/lib/format';

const ROWS: { label: string; render: (v: Vehicle) => React.ReactNode }[] = [
  { label: 'Prix', render: (v) => <span className="tabular-figure font-bold">{formatPrice(v.price)}</span> },
  { label: 'Année', render: (v) => v.year },
  { label: 'Kilométrage', render: (v) => <span className="tabular-figure">{formatMileage(v.mileage)}</span> },
  { label: 'Carburant', render: (v) => FUEL_LABELS[v.fuelType] },
  { label: 'Transmission', render: (v) => TRANSMISSION_LABELS[v.transmission] },
  { label: 'Carrosserie', render: (v) => (v.bodyType ? BODY_TYPE_LABELS[v.bodyType] : '—') },
  { label: 'Puissance', render: (v) => (v.power ? `${v.power} ch` : '—') },
  { label: 'Ville', render: (v) => v.city },
];

export default function ComparatorPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
    api.comparisons
      .list(sid)
      .then((items) => setVehicles(items.map((i: any) => i.vehicle).filter(Boolean)))
      .catch(() => setError('Impossible de charger le comparateur'))
      .finally(() => setLoading(false));
  }, []);

  async function removeVehicle(vehicleId: string) {
    try {
      await api.comparisons.toggle(sessionId, vehicleId);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
        <Scale size={22} className="text-accent" />
        Comparateur
      </h1>
      <p className="mt-1 text-sm text-ink/60">Comparez jusqu&apos;à 4 véhicules côte à côte.</p>

      {error && <p className="mt-4 rounded bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="mt-6 text-ink/50">Chargement...</p>
      ) : vehicles.length === 0 ? (
        <div className="mt-6 rounded border border-dashed border-line p-12 text-center text-ink/50">
          Ajoutez des véhicules au comparateur depuis le catalogue pour les voir apparaître ici.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="w-32" />
                {vehicles.map((v) => (
                  <th key={v.id} className="border-b border-line p-3 text-left align-top">
                    <div className="relative">
                      <button
                        onClick={() => removeVehicle(v.id)}
                        aria-label="Retirer du comparateur"
                        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/10 hover:bg-ink/20"
                      >
                        <X size={13} />
                      </button>
                      {v.images[0] && (
                        <img
                          src={v.images[0].url}
                          alt={`${v.brand?.name ?? ''} ${v.model}`}
                          className="mb-2 aspect-[4/3] w-full rounded object-cover"
                        />
                      )}
                      <p className="font-display text-sm font-medium text-ink">
                        {v.brand?.name ?? 'Inconnue'} {v.model}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="odd:bg-white even:bg-white/50">
                  <td className="border-b border-line p-3 text-xs font-medium uppercase tracking-wide text-ink/50">
                    {row.label}
                  </td>
                  {vehicles.map((v) => (
                    <td key={v.id} className="border-b border-line p-3 text-sm text-ink">
                      {row.render(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
