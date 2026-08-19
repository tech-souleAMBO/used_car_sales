import type { FuelType, Transmission, BodyType, VehicleStatus } from './types';

export function formatPrice(price: string | number): string {
  const value = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMileage(mileage: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(mileage)} km`;
}

export const FUEL_LABELS: Record<FuelType, string> = {
  ESSENCE: 'Essence',
  DIESEL: 'Diesel',
  ELECTRIQUE: 'Électrique',
  HYBRIDE: 'Hybride',
  GPL: 'GPL',
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  MANUELLE: 'Manuelle',
  AUTOMATIQUE: 'Automatique',
};

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  BERLINE: 'Berline',
  CITADINE: 'Citadine',
  SUV: 'SUV',
  BREAK: 'Break',
  COUPE: 'Coupé',
  CABRIOLET: 'Cabriolet',
  MONOSPACE: 'Monospace',
  UTILITAIRE: 'Utilitaire',
};

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: 'Disponible',
  RESERVED: 'Réservé',
  SOLD: 'Vendu',
  DRAFT: 'Brouillon',
};
