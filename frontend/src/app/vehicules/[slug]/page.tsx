import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Gauge, Fuel, Cog, MapPin, Calendar, DoorOpen, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice, formatMileage, FUEL_LABELS, TRANSMISSION_LABELS, BODY_TYPE_LABELS } from '@/lib/format';
import { VehicleGallery } from '@/components/VehicleGallery';
import { ContactForm } from '@/components/ContactForm';
import { ShareButtons } from '@/components/ShareButtons';
import { FavoriteButton } from '@/components/FavoriteButton';
import { CompareButton } from '@/components/CompareButton';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const vehicle = await api.vehicles.getBySlug(params.slug);
    return {
      title: `${vehicle.brand.name} ${vehicle.model} ${vehicle.year} — ${formatPrice(vehicle.price)}`,
      description: vehicle.description.slice(0, 155),
    };
  } catch {
    return { title: 'Véhicule introuvable' };
  }
}

export default async function VehicleDetailPage({ params }: PageProps) {
  let vehicle;
  try {
    vehicle = await api.vehicles.getBySlug(params.slug);
  } catch {
    notFound();
  }

  const specs = [
    { icon: Calendar, label: 'Année', value: String(vehicle.year) },
    { icon: Gauge, label: 'Kilométrage', value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: 'Carburant', value: FUEL_LABELS[vehicle.fuelType] },
    { icon: Cog, label: 'Transmission', value: TRANSMISSION_LABELS[vehicle.transmission] },
    ...(vehicle.doors ? [{ icon: DoorOpen, label: 'Portes', value: String(vehicle.doors) }] : []),
    ...(vehicle.seats ? [{ icon: Users, label: 'Places', value: String(vehicle.seats) }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-ink/50">
        <span>{vehicle.brand.name}</span> <span className="mx-1">/</span> <span>{vehicle.model}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <VehicleGallery images={vehicle.images} alt={`${vehicle.brand.name} ${vehicle.model}`} />

          <div className="mt-8">
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {vehicle.brand.name} {vehicle.model}{' '}
              {vehicle.version && <span className="text-ink/50">· {vehicle.version}</span>}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/60">
              <MapPin size={14} />
              {vehicle.city} ({vehicle.postalCode})
            </p>

            {/* Bandeau caractéristiques façon tableau de bord */}
            <div className="mt-6 grid grid-cols-2 gap-4 rounded border border-line bg-white p-5 sm:grid-cols-3">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink/50">
                    <Icon size={13} />
                    {label}
                  </p>
                  <p className="tabular-figure mt-1 font-display text-lg font-medium text-ink">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="font-display text-lg font-medium text-ink">Description</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-ink/80">
                {vehicle.description}
              </p>
            </div>

            {vehicle.bodyType && (
              <p className="mt-4 text-sm text-ink/60">
                Carrosserie : <span className="text-ink">{BODY_TYPE_LABELS[vehicle.bodyType]}</span>
                {vehicle.color && (
                  <>
                    {' '}
                    · Couleur : <span className="text-ink">{vehicle.color}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Colonne contact - sticky */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded border border-line bg-white p-5">
            <div className="flex items-start justify-between">
              <p className="tabular-figure font-display text-3xl font-bold text-ink">
                {formatPrice(vehicle.price)}
              </p>
              <div className="flex gap-2">
                <CompareButton vehicleId={vehicle.id} className="!bg-paper" />
                <FavoriteButton vehicleId={vehicle.id} className="!bg-paper" />
              </div>
            </div>

            <div className="my-6 border-t border-line" />

            <h2 className="mb-3 font-display text-sm font-medium text-ink">
              Contacter le vendeur par e-mail
            </h2>
            <ContactForm vehicleId={vehicle.id} vehicleLabel={`${vehicle.brand.name} ${vehicle.model} ${vehicle.year}`} />

            <div className="mt-6 border-t border-line pt-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-ink/50">Partager</p>
              <ShareButtons title={`${vehicle.brand.name} ${vehicle.model} ${vehicle.year}`} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
