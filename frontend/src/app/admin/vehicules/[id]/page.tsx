'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { VehicleForm } from '@/components/VehicleForm';
import { api } from '@/lib/api';
import type { Vehicle } from '@/lib/types';

export default function EditVehiclePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? undefined;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.vehicles
      .getById(params.id)
      .then(setVehicle)
      .catch(() => setError('Véhicule introuvable'));
  }, [params.id]);

  if (error) return <p className="text-danger">{error}</p>;
  if (!vehicle) return <p className="text-ink/50">Chargement...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">
        Modifier {vehicle.brand?.name ?? 'Inconnue'} {vehicle.model}
      </h1>
      <div className="mt-6">
        <VehicleForm initialVehicle={vehicle} returnTo={returnTo} />
      </div>
    </div>
  );
}
