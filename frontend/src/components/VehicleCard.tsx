import Link from 'next/link';

import { Gauge, Fuel, Cog } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { formatPrice, formatMileage, FUEL_LABELS, TRANSMISSION_LABELS } from '@/lib/format';
import { FavoriteButton } from './FavoriteButton';
import { CompareButton } from './CompareButton';

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const coverImage = vehicle.images[0]?.url;

  return (
    <Link
      href={`/vehicules/${vehicle.slug}`}
      className="group block overflow-hidden rounded border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-line">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={`${vehicle.brand.name} ${vehicle.model}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink/40">
            Aucune photo
          </div>
        )}

        <div className="absolute right-2 top-2 flex gap-2">
          <CompareButton vehicleId={vehicle.id} />
          <FavoriteButton vehicleId={vehicle.id} />
        </div>

        {vehicle.isFeatured && (
          <span className="absolute left-2 top-2 rounded bg-accent px-2 py-1 text-xs font-medium text-white">
            Coup de cœur
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
          {vehicle.brand.name}
        </p>
        <h3 className="mt-0.5 truncate font-display text-base font-medium text-ink">
          {vehicle.model} {vehicle.version && <span className="text-ink/50">· {vehicle.version}</span>}
        </h3>

        {/* Bandeau "instrument de bord" : chiffres tabulaires façon compteur */}
        <div className="mt-3 flex items-center gap-4 border-y border-line py-2 text-xs text-ink/60">
          <span className="flex items-center gap-1.5">
            <Gauge size={14} />
            <span className="tabular-figure">{formatMileage(vehicle.mileage)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel size={14} />
            {FUEL_LABELS[vehicle.fuelType]}
          </span>
          <span className="flex items-center gap-1.5">
            <Cog size={14} />
            {TRANSMISSION_LABELS[vehicle.transmission]}
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="tabular-figure font-display text-xl font-bold text-ink">
              {formatPrice(vehicle.price)}
            </p>
            <p className="text-xs text-ink/50">
              {vehicle.year} · {vehicle.city}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
