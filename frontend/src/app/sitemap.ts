import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.automarche.fr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/comparateur`, changeFrequency: 'weekly', priority: 0.3 },
    { url: `${SITE_URL}/mentions-legales`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${SITE_URL}/confidentialite`, changeFrequency: 'yearly', priority: 0.1 },
  ];

  try {
    // Récupère un large échantillon de véhicules disponibles pour le sitemap
    const result = await api.vehicles.search({ limit: 100, sortBy: 'recent' });
    const vehicleRoutes: MetadataRoute.Sitemap = result.items.map((vehicle) => ({
      url: `${SITE_URL}/vehicules/${vehicle.slug}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    return [...staticRoutes, ...vehicleRoutes];
  } catch {
    // Si l'API est indisponible au moment de la génération, on retourne au moins les pages statiques
    return staticRoutes;
  }
}
