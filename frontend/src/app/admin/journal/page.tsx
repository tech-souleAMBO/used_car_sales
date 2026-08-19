'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Pencil, Trash2, History } from 'lucide-react';
import { api } from '@/lib/api';

interface ActivityLogEntry {
  id: string;
  adminEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  summary: string;
  createdAt: string;
}

const ACTION_CONFIG = {
  CREATE: { label: 'Création', icon: PlusCircle, className: 'text-success' },
  UPDATE: { label: 'Modification', icon: Pencil, className: 'text-accent' },
  DELETE: { label: 'Suppression', icon: Trash2, className: 'text-danger' },
} as const;

const ENTITY_LABELS: Record<string, string> = {
  Vehicle: 'Véhicule',
  Brand: 'Marque',
};

export default function ActivityLogPage() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.activityLogs
      .list(page, 20)
      .then((res) => {
        setEntries(res.items);
        setTotalPages(res.meta.totalPages);
      })
      .catch(() => setError('Impossible de charger le journal'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
        <History size={22} className="text-accent" />
        Journal d&apos;activité
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Historique des ajouts, modifications et suppressions effectués depuis l&apos;espace admin.
      </p>

      {error && <p className="mt-4 rounded bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="mt-6 text-ink/50">Chargement...</p>
      ) : entries.length === 0 ? (
        <p className="mt-6 text-ink/50">Aucune activité enregistrée pour le moment.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded border border-line bg-white">
          {entries.map((entry) => {
            const config = ACTION_CONFIG[entry.action];
            const Icon = config.icon;
            return (
              <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <Icon size={16} className={`mt-0.5 shrink-0 ${config.className}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">
                    <span className="font-medium">{config.label}</span>
                    {' — '}
                    {ENTITY_LABELS[entry.entityType] ?? entry.entityType} :{' '}
                    <span className="text-ink/80">{entry.summary}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink/50">
                    {entry.adminEmail} · {new Date(entry.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6">
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 text-sm">
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
    </div>
  );
}
