'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Upload, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice, STATUS_LABELS } from '@/lib/format';
import type { Brand, Vehicle } from '@/lib/types';

export default function BrandDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [b, v] = await Promise.all([
          api.brands.getById(params.id),
          api.vehicles.adminSearch({ brandId: params.id, limit: 100 }),
        ]);
        if (!cancelled) {
          setBrand(b);
          setName(b.name);
          setLogoUrl(b.logoUrl ?? '');
          setVehicles(v.items);
        }
      } catch {
        if (!cancelled) setError('Marque introuvable');
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await api.brands.update(params.id, { name, logoUrl: logoUrl || undefined });
      setBrand(updated);
      setSuccess('Marque mise à jour');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('Le fichier dépasse la taille maximale de 15 Mo.');
      e.target.value = '';
      return;
    }
    setUploading(true);
    setError('');
    try {
      const { urls } = await api.upload.images([file]);
      setLogoUrl(urls[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette marque ? Les véhicules rattachés ne seront pas supprimés.')) return;
    try {
      await api.brands.remove(params.id);
      router.push('/admin/marques');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  async function handleDeleteVehicle(id: string) {
    if (!confirm('Supprimer définitivement ce véhicule ?')) return;
    try {
      await api.vehicles.remove(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  if (error && !brand) return <p className="text-danger">{error}</p>;
  if (!brand) return <p className="text-ink/50">Chargement...</p>;

  return (
    <div>
      <Link href="/admin/marques" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft size={14} />
        Retour aux marques
      </Link>

      <h1 className="font-display text-2xl font-bold text-ink">{brand.name}</h1>

      {error && <p className="mt-2 rounded bg-danger/10 p-3 text-sm text-danger">{error}</p>}
      {success && <p className="mt-2 rounded bg-success/10 p-3 text-sm text-success">{success}</p>}

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <fieldset className="rounded border border-line bg-white p-5">
          <legend className="px-1 font-display text-sm font-medium text-ink">Informations</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="brandName">Nom de la marque</label>
              <input
                id="brandName"
                required
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Logo</label>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={brand.name} className="h-12 w-12 rounded border border-line object-contain" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded border border-dashed border-line text-xs text-ink/30">
                    —
                  </div>
                )}
                <label className="btn-outline cursor-pointer text-xs">
                  <Upload size={14} />
                  {uploading ? 'Envoi...' : 'Upload'}
                  <input type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                </label>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="url"
                  className="input text-xs"
                  placeholder="Ou coller un lien d'image"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-ink/40">
                Le lien doit pointer directement vers un fichier image.
              </p>
            </div>
          </div>
        </fieldset>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger/5"
          >
            <Trash2 size={14} />
            Supprimer la marque
          </button>
          <button type="submit" disabled={saving} className="btn-accent">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink">
          Véhicules ({vehicles.length})
        </h2>

        {vehicles.length === 0 ? (
          <p className="mt-4 text-ink/50">Aucun véhicule pour cette marque.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded border border-line bg-white">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="border-b border-line bg-paper text-left text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="p-3">Modèle</th>
                  <th className="p-3">Prix</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Année</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-line last:border-0">
                    <td className="p-3 font-medium text-ink">{v.model}</td>
                    <td className="p-3 tabular-figure">{formatPrice(v.price)}</td>
                    <td className="p-3">
                      <span className="rounded bg-line/60 px-2 py-1 text-xs">
                        {STATUS_LABELS[v.status]}
                      </span>
                    </td>
                    <td className="p-3 tabular-figure text-ink/60">{v.year}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/vehicules/${v.id}?returnTo=${encodeURIComponent(`/admin/marques/${params.id}`)}`}
                          className="text-xs text-accent hover:underline"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDeleteVehicle(v.id)}
                          aria-label="Supprimer"
                          className="flex h-7 w-7 items-center justify-center rounded border border-line text-danger hover:border-danger"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
