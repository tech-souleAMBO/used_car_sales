'use client';

const SESSION_COOKIE_NAME = 'session_id';
const CONSENT_COOKIE_NAME = 'cookie_consent';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

// Identifiant de secours utilisé pour la session courante quand le cookie ne peut pas être
// persisté (consentement refusé ou non encore donné) : les favoris/comparateur restent
// fonctionnels le temps de la page, sans persistance entre les visites.
let transientSessionId: string | null = null;

/** Récupère (ou crée) l'identifiant de session anonyme utilisé pour les favoris et le comparateur.
 * Le cookie n'est posé de façon persistante que si l'utilisateur a accepté les cookies (RGPD) ;
 * sinon un identifiant temporaire (non persistant) est utilisé pour la session en cours. */
export function getOrCreateSessionId(): string {
  if (typeof document === 'undefined') return '';

  const existing = readCookie(SESSION_COOKIE_NAME);
  if (existing) return existing;

  const consent = readCookie(CONSENT_COOKIE_NAME);
  const newId = generateId();

  if (consent === 'accepted') {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${SESSION_COOKIE_NAME}=${newId}; path=/; max-age=${oneYear}; SameSite=Lax`;
    return newId;
  }

  // Pas de consentement (encore) donné : identifiant transitoire, non persisté en cookie
  if (!transientSessionId) transientSessionId = newId;
  return transientSessionId;
}
