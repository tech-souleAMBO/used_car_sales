'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice, STATUS_LABELS } from '@/lib/format';
import type { Vehicle, VehicleStatus } from '@/lib/types';

const STATUS_FILTERS: { value: VehicleStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'AVAILABLE', label: STATUS_LABELS.AVAILABLE },
  { value: 'DRAFT', label: STATUS_LABELS.DRAFT },
  { value: 'RESERVED', label: STATUS_LABELS.RESERVED },
  { value: 'SOLD', label: STATUS_LABELS.SOLD },
];

const PAGE_SIZE = 15;

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const result = await api.vehicles.adminSearch({
          page,
          limit: PAGE_SIZE,
          status: statusFilter || undefined,
          sortBy: 'recent',
        });
        if (!cancelled) {
          setVehicles(result.items);
          setTotalPages(result.meta.totalPages);
          setTotal(result.meta.total);
        }
      } catch {
        if (!cancelled) setError('Erreur lors du chargement des véhicules');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, statusFilter]);

  function handleStatusChange(value: VehicleStatus | '') {
    setStatusFilter(value);
    setPage(1);
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer définitivement ce véhicule ?')) return;
    try {
      await api.vehicles.remove(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">Véhicules</h1>
        <Link href="/admin/vehicules/nouveau" className="btn-accent">
          <Plus size={16} />
          Ajouter un véhicule
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <select
          className="input max-w-xs"
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value as VehicleStatus | '')}
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-ink/50">
          <span className="tabular-figure font-medium text-ink">{total}</span> véhicule
          {total > 1 ? 's' : ''}
        </p>
      </div>

      {error && <p className="mt-4 rounded bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="mt-6 text-ink/50">Chargement...</p>
      ) : vehicles.length === 0 ? (
        <p className="mt-6 text-ink/50">Aucun véhicule ne correspond à ce filtre.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded border border-line bg-white">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="border-b border-line bg-paper text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="p-3">Véhicule</th>
                <th className="p-3">Prix</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Vues</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <p className="font-medium text-ink">
                      {v.brand?.name ?? 'Inconnue'} {v.model}
                    </p>
                    <p className="text-xs text-ink/50">
                      {v.year} · {v.city}
                    </p>
                  </td>
                  <td className="p-3 tabular-figure">{formatPrice(v.price)}</td>
                  <td className="p-3">
                    <span className="rounded bg-line/60 px-2 py-1 text-xs">
                      {STATUS_LABELS[v.status]}
                    </span>
                  </td>
                  <td className="p-3 tabular-figure text-ink/60">{v.viewsCount}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/vehicules/${v.id}`}
                        aria-label="Modifier"
                        className="flex h-8 w-8 items-center justify-center rounded border border-line hover:border-ink"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(v.id)}
                        aria-label="Supprimer"
                        className="flex h-8 w-8 items-center justify-center rounded border border-line text-danger hover:border-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-outline disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="tabular-figure flex items-center px-2 text-ink/50">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="btn-outline disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
