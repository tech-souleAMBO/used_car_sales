'use client';

import { useState, useRef } from 'react';
import { Mail } from 'lucide-react';
import { api } from '@/lib/api';

const FORMSUBMIT_URL = 'https://formsubmit.co/mavoituredoccasion.fr@gmail.com';

export function ContactForm({ vehicleId, vehicleLabel }: { vehicleId: string; vehicleLabel?: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      await api.contact.send({ vehicleId, ...form });

      const hiddenForm = document.createElement('form');
      hiddenForm.action = FORMSUBMIT_URL;
      hiddenForm.method = 'POST';
      hiddenForm.target = 'formsubmit_frame';
      hiddenForm.style.display = 'none';

      const fields: Record<string, string> = {
        name: form.name,
        email: form.email,
        phone: form.phone || 'Non renseigne',
        vehicle: vehicleLabel || 'General',
        message: form.message,
        _subject: `Nouvelle demande de contact - ${vehicleLabel || 'General'}`,
        _captcha: 'false',
        _template: 'table',
        _next: window.location.href,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        hiddenForm.appendChild(input);
      });

      document.body.appendChild(hiddenForm);
      hiddenForm.submit();
      document.body.removeChild(hiddenForm);

      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded border border-success/30 bg-success/5 p-4 text-sm text-success">
        Votre message a bien été envoyé. Le vendeur vous répondra directement par e-mail.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <iframe ref={iframeRef} name="formsubmit_frame" style={{ display: 'none' }} />
      <div>
        <label className="label" htmlFor="name">
          Nom
        </label>
        <input
          id="name"
          required
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label className="label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          className="input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <label className="label" htmlFor="phone">
          Téléphone (optionnel)
        </label>
        <input
          id="phone"
          className="input"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div>
        <label className="label" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          required
          minLength={10}
          rows={4}
          className="input"
          placeholder="Bonjour, ce véhicule est-il toujours disponible ?"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      {status === 'error' && <p className="text-sm text-danger">{errorMessage}</p>}

      <button type="submit" disabled={status === 'loading'} className="btn-outline w-full">
        <Mail size={16} />
        {status === 'loading' ? 'Envoi...' : 'Envoyer un e-mail au vendeur'}
      </button>
    </form>
  );
}
