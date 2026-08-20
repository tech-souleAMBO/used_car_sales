'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Send } from 'lucide-react';
import { api } from '@/lib/api';

const FORMSUBMIT_URL = 'https://formsubmit.co/alexambo197@gmail.com';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await api.auth.forgotPassword(email);

      if (data.resetUrl) {
        fetch(FORMSUBMIT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Systeme Autolara',
            email: 'noreply@autolara.com',
            message:
              'Bonjour,\n\n' +
              'Vous avez demande la reinitialisation de votre mot de passe.\n\n' +
              'Cliquez sur le lien ci-dessous (valable 2 heures) :\n' +
              data.resetUrl +
              '\n\n' +
              "Si vous n'avez pas fait cette demande, ignorez cet email.",
            _subject: 'Reinitialisation de votre mot de passe',
            _captcha: 'false',
            _template: 'table',
          }),
        }).catch(() => {});
      }

      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <Image src="/logo-icon.png" alt="" width={600} height={455} className="h-16 w-auto" />
      <h1 className="mt-6 font-display text-2xl font-bold text-ink">Mot de passe oublié</h1>
      <p className="mt-1 text-sm text-ink/60">
        Entrez votre adresse e-mail et vous recevrez un lien pour réinitialiser votre mot de passe.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {success && <p className="rounded bg-success/10 p-3 text-sm text-success">{success}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          <Send size={16} />
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </form>

      <Link href="/admin" className="mt-4 flex items-center justify-center gap-1.5 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft size={14} />
        Retour à la connexion
      </Link>
    </div>
  );
}
