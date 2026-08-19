'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

const CONSENT_COOKIE_NAME = 'cookie_consent';

type ConsentValue = 'accepted' | 'refused';

function readConsent(): ConsentValue | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
  return (match?.split('=')[1] as ConsentValue) ?? null;
}

function writeConsent(value: ConsentValue) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

/**
 * Bandeau RGPD : le cookie de session (favoris/comparateur) n'est créé qu'après acceptation.
 * En cas de refus, seules les fonctionnalités essentielles (navigation, recherche) restent actives ;
 * favoris et comparateur nécessitent le cookie de session et resteront donc indisponibles.
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent() === null) {
      setVisible(true);
    }
  }, []);

  function handleChoice(value: ConsentValue) {
    writeConsent(value);
    setVisible(false);
    if (value === 'refused') {
      // Supprime un éventuel cookie de session déjà posé avant le choix explicite
      document.cookie = 'session_id=; path=/; max-age=0';
    }
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="flex items-start gap-2 text-sm text-ink/80">
          <Cookie size={18} className="mt-0.5 shrink-0 text-accent" />
          <span>
            Nous utilisons un cookie de session pour mémoriser vos favoris et votre comparateur de
            véhicules. Aucune donnée personnelle n&apos;est collectée à des fins publicitaires.{' '}
            <Link href="/confidentialite" className="underline hover:text-ink">
              En savoir plus
            </Link>
          </span>
        </p>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => handleChoice('refused')} className="btn-outline">
            Refuser
          </button>
          <button onClick={() => handleChoice('accepted')} className="btn-accent">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
