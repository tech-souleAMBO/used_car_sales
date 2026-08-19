import { api } from '@/lib/api';
import { VehicleCard } from '@/components/VehicleCard';
import { SearchFilters } from '@/components/SearchFilters';
import { Pagination } from '@/components/Pagination';
import type { VehicleSearchParams } from '@/lib/types';

export const dynamic = 'force-dynamic'; // le catalogue dépend des filtres de recherche

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params: VehicleSearchParams = {
    brandId: searchParams.brandId,
    model: searchParams.model,
    city: searchParams.city,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    minYear: searchParams.minYear ? Number(searchParams.minYear) : undefined,
    maxYear: searchParams.maxYear ? Number(searchParams.maxYear) : undefined,
    maxMileage: searchParams.maxMileage ? Number(searchParams.maxMileage) : undefined,
    fuelType: searchParams.fuelType as VehicleSearchParams['fuelType'],
    transmission: searchParams.transmission as VehicleSearchParams['transmission'],
    bodyType: searchParams.bodyType as VehicleSearchParams['bodyType'],
    search: searchParams.search,
    sortBy: (searchParams.sortBy as VehicleSearchParams['sortBy']) ?? 'recent',
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 24,
  };

  let result, brands;
  try {
    [result, brands] = await Promise.all([
      api.vehicles.search(params),
      api.brands.list(),
    ]);
  } catch {
    return (
      <div className="p-10 text-center text-ink/50">
        Impossible de charger le catalogue. Veuillez réessayer.
      </div>
    );
  }

  function buildHref(page: number) {
    const qs = new URLSearchParams(searchParams as Record<string, string>);
    qs.set('page', String(page));
    return `/?${qs.toString()}`;
  }

  return (
    <div>
      {/* Hero : thèse de la plateforme */}
      <section className="border-b border-line bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            {result.meta.total.toLocaleString('fr-FR')} véhicules en ligne
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Trouvez votre prochaine voiture, partout en France.
          </h1>
          <p className="mt-4 max-w-xl text-paper/70">
            Annonces vérifiées, contact direct avec le vendeur par e-mail, sans
            intermédiaire.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <SearchFilters brands={brands} />
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-ink/60">
                <span className="tabular-figure font-medium text-ink">{result.meta.total}</span>{' '}
                résultat{result.meta.total > 1 ? 's' : ''}
              </p>
            </div>

            {result.items.length === 0 ? (
              <div className="rounded border border-dashed border-line p-12 text-center text-ink/50">
                Aucun véhicule ne correspond à ces critères. Essayez d&apos;élargir votre
                recherche.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}

            <div className="mt-10">
              <Pagination
                currentPage={result.meta.page}
                totalPages={result.meta.totalPages}
                buildHref={buildHref}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
