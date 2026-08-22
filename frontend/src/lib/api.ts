import type {
  Vehicle,
  Brand,
  PaginatedResult,
  VehicleSearchParams,
} from './types';
import { getAccessToken, setAccessToken } from './auth';

// Côté client : on appelle le backend directement (le proxy Next.js ne transmet pas le header Authorization).
// Côté serveur (Server Components) : variable d'env BACKEND_INTERNAL_URL ou fallback local.
const BACKEND_BASE = process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:8000';
const PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

function getApiUrl(): string {
  if (typeof window === 'undefined') return `${BACKEND_BASE}/api/v1`;
  if (PUBLIC_BACKEND_URL) return `${PUBLIC_BACKEND_URL}/api/v1`;
  return '/api/v1';
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // ajoute l'en-tête Authorization avec l'access token admin
  skipRefresh?: boolean; // évite une boucle infinie lors de l'appel de refresh lui-même
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth, skipRefresh, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      (finalHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  // `credentials: 'include'` est nécessaire sur TOUTES les requêtes (même publiques) pour que
  // le navigateur envoie/reçoive le cookie httpOnly du refresh token (domaine croisé en dev :
  // frontend sur :3000, API sur :4000).
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: 'include',
    cache: 'no-store',
  });

  // Tentative de rafraîchissement automatique du token en cas de 401 sur une route admin
  if (response.status === 401 && auth && !skipRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, { ...options, skipRefresh: true });
    }
    setAccessToken(null);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message ?? "Une erreur est survenue lors de l'appel à l'API");
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json();
}

/**
 * Échange le cookie httpOnly de refresh token contre un nouvel access token.
 * Utilisé automatiquement en cas de 401, et au montage du layout admin pour restaurer
 * la session après un rechargement de page (l'access token en mémoire ne survit pas au reload).
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) return false;
    const data = await response.json();
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

function buildQueryString(params: object): string {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// ---------------------- Catalogue public ----------------------

export const api = {
  vehicles: {
    search: (params: VehicleSearchParams = {}) =>
      request<PaginatedResult<Vehicle>>(`/vehicles${buildQueryString(params)}`),

    // Recherche admin : tous statuts confondus par défaut, pagination réelle, protégée par JWT
    adminSearch: (params: VehicleSearchParams = {}) =>
      request<PaginatedResult<Vehicle>>(`/vehicles/admin/search${buildQueryString(params)}`, {
        auth: true,
      }),

    getBySlug: (slug: string) => request<Vehicle>(`/vehicles/${slug}`),

    getById: (id: string) => request<Vehicle>(`/vehicles/admin/by-id/${id}`, { auth: true }),

    create: (data: Partial<Vehicle>) =>
      request<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(data), auth: true }),

    update: (id: string, data: Partial<Vehicle>) =>
      request<Vehicle>(`/vehicles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        auth: true,
      }),

    remove: (id: string) =>
      request<{ message: string }>(`/vehicles/${id}`, { method: 'DELETE', auth: true }),

    addImages: (id: string, urls: string[]) =>
      request<Vehicle>(`/vehicles/${id}/images`, {
        method: 'POST',
        body: JSON.stringify({ urls }),
        auth: true,
      }),

    removeImage: (id: string, imageId: string) =>
      request<Vehicle>(`/vehicles/${id}/images/${imageId}`, { method: 'DELETE', auth: true }),
  },

  brands: {
    list: (includeInactive = false) =>
      request<Brand[]>(`/brands${includeInactive ? '?includeInactive=true' : ''}`),

    getById: (id: string) => request<Brand>(`/brands/${id}`),

    create: (data: { name: string; logoUrl?: string }) =>
      request<Brand>('/brands', { method: 'POST', body: JSON.stringify(data), auth: true }),

    update: (id: string, data: Partial<Brand>) =>
      request<Brand>(`/brands/${id}`, { method: 'PATCH', body: JSON.stringify(data), auth: true }),

    remove: (id: string) =>
      request<{ message: string }>(`/brands/${id}`, { method: 'DELETE', auth: true }),
  },

  favorites: {
    list: (sessionId: string) => request<any[]>(`/favorites/${sessionId}`),
    checkIds: (sessionId: string) => request<{ ids: string[] }>(`/favorites/${sessionId}/check`),
    toggle: (sessionId: string, vehicleId: string) =>
      request<{ favorited: boolean }>('/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ sessionId, vehicleId }),
      }),
  },

  comparisons: {
    list: (sessionId: string) => request<any[]>(`/comparisons/${sessionId}`),
    checkIds: (sessionId: string) => request<{ ids: string[] }>(`/comparisons/${sessionId}/check`),
    toggle: (sessionId: string, vehicleId: string) =>
      request<{ inComparison: boolean }>('/comparisons/toggle', {
        method: 'POST',
        body: JSON.stringify({ sessionId, vehicleId }),
      }),
    clear: (sessionId: string) =>
      request<{ message: string }>(`/comparisons/${sessionId}`, { method: 'DELETE' }),
  },

  contact: {
    send: (data: { vehicleId?: string; name: string; email: string; phone?: string; message: string }) =>
      request<{ message: string; id: string }>('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: (onlyUnread = false) =>
      request<any[]>(`/contact${onlyUnread ? '?onlyUnread=true' : ''}`, { auth: true }),
    markAsRead: (id: string) =>
      request<any>(`/contact/${id}/read`, { method: 'PATCH', auth: true }),
  },

  auth: {
    login: async (email: string, password: string) => {
      const data = await request<{ accessToken: string; admin: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(data.accessToken);
      return data;
    },
    refresh: refreshAccessToken,
    logout: async () => {
      const result = await request<{ message: string }>('/auth/logout', {
        method: 'POST',
        auth: true,
      });
      setAccessToken(null);
      return result;
    },
    forgotPassword: (email: string) =>
      request<{ message: string; resetUrl: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token: string, password: string, passwordConfirmation: string) =>
      request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password, password_confirmation: passwordConfirmation }),
      }),
  },

  upload: {
    images: async (files: File[]): Promise<{ urls: string[] }> => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files[]', file));
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${getApiUrl()}/upload/images`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "Échec de l'upload des images");
      }
      return response.json();
    },
  },

  stats: {
    dashboard: () => request<any>('/stats/dashboard', { auth: true }),
  },

  activityLogs: {
    list: (page = 1, limit = 20) =>
      request<{
        items: {
          id: string;
          adminEmail: string;
          action: 'CREATE' | 'UPDATE' | 'DELETE';
          entityType: string;
          summary: string;
          createdAt: string;
        }[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(`/activity-logs?page=${page}&limit=${limit}`, { auth: true }),
  },
};
