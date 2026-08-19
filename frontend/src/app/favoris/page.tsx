'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { getOrCreateSessionId } from '@/lib/session';
import { VehicleCard } from '@/components/VehicleCard';
import type { Vehicle } from '@/lib/types';

export default function FavoritesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    api.favorites
      .list(sessionId)
      .then((favs) => setVehicles(favs.map((f: any) => f.vehicle).filter(Boolean)))
      .catch(() => setError('Impossible de charger vos favoris'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
        <Heart size={22} className="text-accent" />
        Mes favoris
      </h1>

      {error && <p className="mt-4 rounded bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="mt-6 text-ink/50">Chargement...</p>
      ) : vehicles.length === 0 ? (
        <div className="mt-6 rounded border border-dashed border-line p-12 text-center text-ink/50">
          Vous n&apos;avez pas encore ajouté de véhicule à vos favoris.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
