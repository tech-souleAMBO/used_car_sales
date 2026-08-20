'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
        <p className="text-danger">Lien invalide ou manquant.</p>
        <Link href="/admin/forgot-password" className="mt-4 text-sm text-accent hover:underline">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await api.auth.resetPassword(token, password, passwordConfirmation);
      setSuccess(data.message);
      setTimeout(() => router.push('/admin'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <Image src="/logo-icon.png" alt="" width={600} height={455} className="h-16 w-auto" />
      <h1 className="mt-6 font-display text-2xl font-bold text-ink">Nouveau mot de passe</h1>
      <p className="mt-1 text-sm text-ink/60">Choisissez un nouveau mot de passe pour votre compte.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="password">Nouveau mot de passe</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="passwordConfirmation">Confirmer le mot de passe</label>
          <input
            id="passwordConfirmation"
            type="password"
            required
            minLength={6}
            className="input"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {success && (
          <p className="rounded bg-success/10 p-3 text-sm text-success">
            {success} Redirection vers la connexion...
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          <KeyRound size={16} />
          {loading ? 'Enregistrement...' : 'Réinitialiser'}
        </button>
      </form>

      <Link href="/admin" className="mt-4 flex items-center justify-center gap-1.5 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft size={14} />
        Retour à la connexion
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-ink/50">Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
