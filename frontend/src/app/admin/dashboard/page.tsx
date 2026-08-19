'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Car, CheckCircle, FileText, Tag, Mail, MailWarning, History, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardStats {
  overview: {
    totalVehicles: number;
    availableVehicles: number;
    soldVehicles: number;
    draftVehicles: number;
    totalBrands: number;
    totalContactMessages: number;
    unreadContactMessages: number;
  };
  mostViewedVehicles: { id: string; model: string; viewsCount: number; brand: { name: string } }[];
  vehiclesByBrand: { brand: string; count: number }[];
}

interface ActivityLogEntry {
  id: string;
  adminEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  summary: string;
  createdAt: string;
}

const CARDS = [
  { key: 'totalVehicles', label: 'Véhicules au total', icon: Car },
  { key: 'availableVehicles', label: 'Disponibles', icon: CheckCircle },
  { key: 'draftVehicles', label: 'Brouillons', icon: FileText },
  { key: 'totalBrands', label: 'Marques', icon: Tag },
  { key: 'totalContactMessages', label: 'Messages reçus', icon: Mail },
  { key: 'unreadContactMessages', label: 'Messages non lus', icon: MailWarning },
] as const;

const ACTION_LABELS: Record<ActivityLogEntry['action'], string> = {
  CREATE: 'a créé',
  UPDATE: 'a modifié',
  DELETE: 'a supprimé',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);

  const [error, setError] = useState('');

  useEffect(() => {
    api.stats.dashboard().then(setStats).catch(() => setError('Erreur de chargement'));
    api.activityLogs.list(1, 5).then((res) => setRecentActivity(res.items)).catch(() => {});
  }, []);

  if (!stats) {
    return error ? (
      <p className="text-sm text-danger">{error}</p>
    ) : (
      <p className="text-ink/50">Chargement des statistiques...</p>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Tableau de bord</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="rounded border border-line bg-white p-5">
            <div className="flex items-center gap-2 text-ink/50">
              <Icon size={16} />
              <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
            </div>
            <p className="tabular-figure mt-2 font-display text-3xl font-bold text-ink">
              {stats.overview[key]}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded border border-line bg-white p-5">
          <h2 className="font-display text-sm font-medium text-ink">Véhicules les plus consultés</h2>
          <ul className="mt-3 space-y-2">
            {stats.mostViewedVehicles.map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">
                  {v.brand.name} {v.model}
                </span>
                <span className="tabular-figure text-ink/50">{v.viewsCount} vues</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded border border-line bg-white p-5">
          <h2 className="font-display text-sm font-medium text-ink">Répartition par marque</h2>
          <ul className="mt-3 space-y-2">
            {stats.vehiclesByBrand
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)
              .map((v) => (
                <li key={v.brand} className="flex items-center justify-between text-sm">
                  <span className="text-ink/80">{v.brand}</span>
                  <span className="tabular-figure text-ink/50">{v.count}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-sm font-medium text-ink">
            <History size={16} className="text-accent" />
            Activité récente
          </h2>
          <Link
            href="/admin/journal"
            className="flex items-center gap-1 text-xs font-medium text-ink/50 hover:text-ink"
          >
            Voir tout
            <ArrowRight size={13} />
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <p className="mt-3 text-sm text-ink/50">Aucune activité enregistrée pour le moment.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recentActivity.map((entry) => (
              <li key={entry.id} className="text-sm text-ink/80">
                <span className="text-ink/50">{entry.adminEmail}</span> {ACTION_LABELS[entry.action]}{' '}
                <span className="text-ink">{entry.summary}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
