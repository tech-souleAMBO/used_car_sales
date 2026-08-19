'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Upload, Link as LinkIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { FUEL_LABELS, TRANSMISSION_LABELS, BODY_TYPE_LABELS, STATUS_LABELS } from '@/lib/format';
import type { Brand, Vehicle } from '@/lib/types';

interface VehicleFormProps {
  initialVehicle?: Vehicle; // absent = création
  returnTo?: string; // page de redirection après enregistrement
}

const emptyForm = {
  brandId: '',
  model: '',
  version: '',
  year: new Date().getFullYear(),
  price: 0,
  mileage: 0,
  fuelType: 'ESSENCE',
  transmission: 'MANUELLE',
  bodyType: '',
  doors: 5,
  seats: 5,
  power: 100,
  color: '',
  city: '',
  postalCode: '',
  region: '',
  description: '',
  contactPhone: '',
  contactEmail: '',
  status: 'DRAFT',
  isFeatured: false,
};

export function VehicleForm({ initialVehicle, returnTo }: VehicleFormProps) {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<typeof emptyForm>(
    initialVehicle
      ? {
          ...emptyForm,
          ...initialVehicle,
          price: Number(initialVehicle.price),
          version: initialVehicle.version ?? '',
          bodyType: initialVehicle.bodyType ?? '',
          color: initialVehicle.color ?? '',
          region: initialVehicle.region ?? '',
          contactPhone: initialVehicle.contactPhone ?? '',
          contactEmail: initialVehicle.contactEmail ?? '',
          doors: initialVehicle.doors ?? 5,
          seats: initialVehicle.seats ?? 5,
          power: initialVehicle.power ?? 100,
        }
      : emptyForm,
  );
  const [images, setImages] = useState(initialVehicle?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrlError, setImageUrlError] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.brands.list(true).then(setBrands).catch(() => setError('Erreur lors du chargement des marques'));
  }, []);

  function update<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const MAX_SIZE = 15 * 1024 * 1024; // 15 Mo
    const oversized = files.find((f) => f.size > MAX_SIZE);
    if (oversized) {
      setError(`Le fichier "${oversized.name}" dépasse la taille maximale de 15 Mo.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const { urls } = await api.upload.images(files);
      if (initialVehicle) {
        const updated = await api.vehicles.addImages(initialVehicle.id, urls);
        setImages(updated.images);
      } else {
        // En création, les images seront attachées après la création du véhicule
        setImages((prev) => [
          ...prev,
          ...urls.map((url, i) => ({ id: `pending-${i}-${url}`, url, order: prev.length + i })),
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi des images");
    } finally {
      setUploading(false);
    }
  }

  async function handleAddImageUrl() {
    const url = imageUrlInput.trim();
    if (!url) return;

    if (!/^https?:\/\/.+/i.test(url)) {
      setImageUrlError("Le lien doit commencer par http:// ou https://");
      return;
    }

    setImageUrlError('');
    setAddingUrl(true);
    try {
      if (initialVehicle) {
        const updated = await api.vehicles.addImages(initialVehicle.id, [url]);
        setImages(updated.images);
      } else {
        setImages((prev) => [...prev, { id: `pending-url-${Date.now()}`, url, order: prev.length }]);
      }
      setImageUrlInput('');
    } catch (err) {
      setImageUrlError(err instanceof Error ? err.message : "Impossible d'ajouter ce lien");
    } finally {
      setAddingUrl(false);
    }
  }

  async function handleRemoveImage(imageId: string) {
    if (initialVehicle && !imageId.startsWith('pending-')) {
      try {
        await api.vehicles.removeImage(initialVehicle.id, imageId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la suppression de l'image");
        return;
      }
    }
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      bodyType: form.bodyType || undefined,
      version: form.version || undefined,
      color: form.color || undefined,
      region: form.region || undefined,
      contactPhone: form.contactPhone || undefined,
      contactEmail: form.contactEmail || undefined,
    };

    try {
      if (initialVehicle) {
        await api.vehicles.update(initialVehicle.id, payload as any);
      } else {
        const created = await api.vehicles.create(payload as any);
        const pendingUrls = images.map((img) => img.url);
        if (pendingUrls.length > 0) {
          await api.vehicles.addImages(created.id, pendingUrls);
        }
      }
      router.push(returnTo ?? '/admin/vehicules');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="rounded bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      <fieldset className="grid gap-4 rounded border border-line bg-white p-5 sm:grid-cols-2">
        <legend className="px-1 font-display text-sm font-medium text-ink">Identification</legend>

        <div>
          <label className="label" htmlFor="brandId">
            Marque
          </label>
          <select
            id="brandId"
            required
            className="input"
            value={form.brandId}
            onChange={(e) => update('brandId', e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="model">
            Modèle
          </label>
          <input
            id="model"
            required
            className="input"
            value={form.model}
            onChange={(e) => update('model', e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="version">
            Version / finition
          </label>
          <input
            id="version"
            className="input"
            value={form.version}
            onChange={(e) => update('version', e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="year">
            Année
          </label>
          <input
            id="year"
            type="number"
            required
            className="input"
            value={form.year}
            onChange={(e) => update('year', Number(e.target.value))}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded border border-line bg-white p-5 sm:grid-cols-3">
        <legend className="px-1 font-display text-sm font-medium text-ink">
          Prix &amp; caractéristiques
        </legend>

        <div>
          <label className="label" htmlFor="price">
            Prix (€)
          </label>
          <input
            id="price"
            type="number"
            required
            className="input"
            value={form.price}
            onChange={(e) => update('price', Number(e.target.value))}
          />
        </div>

        <div>
          <label className="label" htmlFor="mileage">
            Kilométrage
          </label>
          <input
            id="mileage"
            type="number"
            required
            className="input"
            value={form.mileage}
            onChange={(e) => update('mileage', Number(e.target.value))}
          />
        </div>

        <div>
          <label className="label" htmlFor="power">
            Puissance (ch)
          </label>
          <input
            id="power"
            type="number"
            className="input"
            value={form.power}
            onChange={(e) => update('power', Number(e.target.value))}
          />
        </div>

        <div>
          <label className="label" htmlFor="fuelType">
            Carburant
          </label>
          <select
            id="fuelType"
            className="input"
            value={form.fuelType}
            onChange={(e) => update('fuelType', e.target.value)}
          >
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
            value={form.transmission}
            onChange={(e) => update('transmission', e.target.value)}
          >
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
            value={form.bodyType}
            onChange={(e) => update('bodyType', e.target.value)}
          >
            <option value="">—</option>
            {Object.entries(BODY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="doors">
            Portes
          </label>
          <input
            id="doors"
            type="number"
            className="input"
            value={form.doors}
            onChange={(e) => update('doors', Number(e.target.value))}
          />
        </div>

        <div>
          <label className="label" htmlFor="seats">
            Places
          </label>
          <input
            id="seats"
            type="number"
            className="input"
            value={form.seats}
            onChange={(e) => update('seats', Number(e.target.value))}
          />
        </div>

        <div>
          <label className="label" htmlFor="color">
            Couleur
          </label>
          <input
            id="color"
            className="input"
            value={form.color}
            onChange={(e) => update('color', e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded border border-line bg-white p-5 sm:grid-cols-3">
        <legend className="px-1 font-display text-sm font-medium text-ink">Localisation</legend>

        <div>
          <label className="label" htmlFor="city">
            Ville
          </label>
          <input
            id="city"
            required
            className="input"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="postalCode">
            Code postal
          </label>
          <input
            id="postalCode"
            required
            className="input"
            value={form.postalCode}
            onChange={(e) => update('postalCode', e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="region">
            Région
          </label>
          <input
            id="region"
            className="input"
            value={form.region}
            onChange={(e) => update('region', e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded border border-line bg-white p-5">
        <legend className="px-1 font-display text-sm font-medium text-ink">Description</legend>
        <textarea
          required
          minLength={20}
          rows={5}
          className="input"
          placeholder="Historique du véhicule, entretien, équipements..."
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </fieldset>

      <fieldset className="grid gap-4 rounded border border-line bg-white p-5 sm:grid-cols-2">
        <legend className="px-1 font-display text-sm font-medium text-ink">Contact</legend>

        <div>
          <label className="label" htmlFor="contactPhone">
            Téléphone (format +33...)
          </label>
          <input
            id="contactPhone"
            className="input"
            value={form.contactPhone}
            onChange={(e) => update('contactPhone', e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="contactEmail">
            E-mail de contact
          </label>
          <input
            id="contactEmail"
            type="email"
            className="input"
            value={form.contactEmail}
            onChange={(e) => update('contactEmail', e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="rounded border border-line bg-white p-5">
        <legend className="px-1 font-display text-sm font-medium text-ink">Photos (5 à 10)</legend>

        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(img.id)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-line text-xs text-ink/50 hover:border-ink">
            <Upload size={18} />
            {uploading ? 'Envoi...' : 'Ajouter'}
            <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
          </label>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <label className="label" htmlFor="imageUrl">
            Ou coller un lien d&apos;image depuis un autre site
          </label>
          <div className="flex gap-2">
            <input
              id="imageUrl"
              type="url"
              className="input"
              placeholder="https://exemple.com/photo-voiture.jpg"
              value={imageUrlInput}
              onChange={(e) => {
                setImageUrlInput(e.target.value);
                if (imageUrlError) setImageUrlError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImageUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              disabled={addingUrl || !imageUrlInput.trim()}
              className="btn-outline shrink-0 disabled:opacity-40"
            >
              <LinkIcon size={15} />
              {addingUrl ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
          {imageUrlError && <p className="mt-1.5 text-sm text-danger">{imageUrlError}</p>}
          <p className="mt-1.5 text-xs text-ink/50">
            Le lien doit pointer directement vers un fichier image (jpg, png, webp...).
          </p>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded border border-line bg-white p-5 sm:grid-cols-2">
        <legend className="px-1 font-display text-sm font-medium text-ink">Publication</legend>

        <div>
          <label className="label" htmlFor="status">
            Statut
          </label>
          <select
            id="status"
            className="input"
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 self-end pb-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => update('isFeatured', e.target.checked)}
          />
          Mettre en avant (coup de cœur)
        </label>
      </fieldset>

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={saving} className="btn-accent">
          {saving ? 'Enregistrement...' : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
