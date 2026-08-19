'use client';

import { useEffect, useState } from 'react';
import { MailOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  vehicleId?: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.contact
      .list()
      .then((data) => setMessages(data))
      .catch(() => setError('Impossible de charger les messages'))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkAsRead(id: string) {
    try {
      await api.contact.markAsRead(id);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Messages de contact</h1>

      {error && <p className="mt-4 rounded bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="mt-6 text-ink/50">Chargement...</p>
      ) : messages.length === 0 ? (
        <p className="mt-6 text-ink/50">Aucun message reçu pour le moment.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded border p-4 ${m.isRead ? 'border-line bg-white' : 'border-accent/40 bg-accent/5'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">
                    {m.name} <span className="font-normal text-ink/50">— {m.email}</span>
                  </p>
                  {m.phone && <p className="text-xs text-ink/50">{m.phone}</p>}
                  <p className="mt-2 text-sm text-ink/80">{m.message}</p>
                  <p className="mt-2 text-xs text-ink/40">
                    {new Date(m.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                {!m.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(m.id)}
                    aria-label="Marquer comme lu"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-line hover:border-ink"
                  >
                    <MailOpen size={14} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
