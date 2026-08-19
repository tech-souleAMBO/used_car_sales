'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Brand } from '@/lib/types';
import { FUEL_LABELS, TRANSMISSION_LABELS, BODY_TYPE_LABELS } from '@/lib/format';

export function SearchFilters({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState({
    search: searchParams.get('search') ?? '',
    brandId: searchParams.get('brandId') ?? '',
    city: searchParams.get('city') ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    minYear: searchParams.get('minYear') ?? '',
    maxYear: searchParams.get('maxYear') ?? '',
    maxMileage: searchParams.get('maxMileage') ?? '',
    fuelType: searchParams.get('fuelType') ?? '',
    transmission: searchParams.get('transmission') ?? '',
    bodyType: searchParams.get('bodyType') ?? '',
    sortBy: searchParams.get('sortBy') ?? 'recent',
  });

  function update(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', '1');
    router.push(`/?${params.toString()}`);
  }

  function resetFilters() {
    router.push('/');
  }

  return (
    <form
      onSubmit={applyFilters}
      className="space-y-5 rounded border border-line bg-white p-5"
      aria-label="Recherche avancée"
    >
      <div>
        <label className="label" htmlFor="search">
          Recherche libre
        </label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            id="search"
            className="input pl-8"
            placeholder="Modèle, finition..."
            value={values.search}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="brandId">
          Marque
        </label>
        <select
          id="brandId"
          className="input"
          value={values.brandId}
          onChange={(e) => update('brandId', e.target.value)}
        >
          <option value="">Toutes les marques</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name} {brand._count ? `(${brand._count.vehicles})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="city">
          Ville
        </label>
        <input
          id="city"
          className="input"
          placeholder="Paris, Lyon..."
          value={values.city}
          onChange={(e) => update('city', e.target.value)}
        />
      </div>

      <div>
        <span className="label">Prix (€)</span>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            className="input"
            placeholder="Min"
            value={values.minPrice}
            onChange={(e) => update('minPrice', e.target.value)}
          />
          <input
            type="number"
            min={0}
            className="input"
            placeholder="Max"
            value={values.maxPrice}
            onChange={(e) => update('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div>
        <span className="label">Année</span>
        <div className="flex gap-2">
          <input
            type="number"
            className="input"
            placeholder="De"
            value={values.minYear}
            onChange={(e) => update('minYear', e.target.value)}
          />
          <input
            type="number"
            className="input"
            placeholder="À"
            value={values.maxYear}
            onChange={(e) => update('maxYear', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="maxMileage">
          Kilométrage max
        </label>
        <input
          id="maxMileage"
          type="number"
          className="input"
          placeholder="150 000"
          value={values.maxMileage}
          onChange={(e) => update('maxMileage', e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="fuelType">
          Carburant
        </label>
        <select
          id="fuelType"
          className="input"
          value={values.fuelType}
          onChange={(e) => update('fuelType', e.target.value)}
        >
          <option value="">Tous</option>
          {Object.entries(FUEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="transmission">
          Transmission
        </label>
        <select
          id="transmission"
          className="input"
          value={values.transmission}
          onChange={(e) => update('transmission', e.target.value)}
        >
          <option value="">Toutes</option>
          {Object.entries(TRANSMISSION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="bodyType">
          Carrosserie
        </label>
        <select
          id="bodyType"
          className="input"
          value={values.bodyType}
          onChange={(e) => update('bodyType', e.target.value)}
        >
          <option value="">Toutes</option>
          {Object.entries(BODY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="sortBy">
          Trier par
        </label>
        <select
          id="sortBy"
          className="input"
          value={values.sortBy}
          onChange={(e) => update('sortBy', e.target.value)}
        >
          <option value="recent">Plus récentes</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="year_desc">Année (récente)</option>
          <option value="mileage_asc">Kilométrage croissant</option>
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-accent flex-1">
          Rechercher
        </button>
        <button type="button" onClick={resetFilters} className="btn-outline">
          Réinitialiser
        </button>
      </div>
    </form>
  );
}
