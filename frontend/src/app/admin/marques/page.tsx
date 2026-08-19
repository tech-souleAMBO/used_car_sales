'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import type { Brand } from '@/lib/types';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  function load() {
    api.brands.list(true).then(setBrands).catch(() => setError('Erreur lors du chargement des marques'));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!newBrandName.trim()) return;
    try {
      await api.brands.create({ name: newBrandName.trim() });
      setNewBrandName('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette marque ?')) return;
    try {
      await api.brands.remove(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Marques</h1>

      <form onSubmit={handleCreate} className="mt-6 flex max-w-md gap-2">
        <input
          className="input"
          placeholder="Nom de la nouvelle marque"
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
        />
        <button type="submit" className="btn-accent shrink-0">
          <Plus size={16} />
          Ajouter
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <ul className="mt-6 divide-y divide-line rounded border border-line bg-white">
        {brands.map((brand) => (
          <li key={brand.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-ink">{brand.name}</p>
              <p className="text-xs text-ink/50">
                {brand._count?.vehicles ?? 0} véhicule(s) disponible(s)
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/marques/${brand.id}`}
                aria-label="Modifier"
                className="flex h-8 w-8 items-center justify-center rounded border border-line hover:border-ink"
              >
                <Pencil size={14} />
              </Link>
              <button
                onClick={() => handleDelete(brand.id)}
                aria-label="Supprimer"
                className="flex h-8 w-8 items-center justify-center rounded border border-line text-danger hover:border-danger"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
