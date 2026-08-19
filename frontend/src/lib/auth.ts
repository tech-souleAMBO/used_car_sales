'use client';

// L'access token (courte durée, 15 min) est conservé en mémoire ET dans localStorage
// pour survivre à un rechargement de page. Le refresh token reste géré exclusivement
// par un cookie httpOnly posé par le backend.

let accessToken: string | null = typeof window !== 'undefined'
  ? localStorage.getItem('admin_access_token')
  : null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('admin_access_token', token);
    } else {
      localStorage.removeItem('admin_access_token');
    }
  }
}

export function isAuthenticated(): boolean {
  return !!accessToken;
}
