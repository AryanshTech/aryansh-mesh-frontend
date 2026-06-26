/**
 * API client — fetch wrapper for the monolith backend.
 * Base: VITE_API_BASE_URL + /api/v1
 * Bearer token injected from token storage.
 */
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/core/auth/token-storage';
import type { ApiError, ErrorEnvelope } from './types';

const RAW_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080';

export const API_BASE = `${RAW_BASE.replace(/\/$/, '')}/api/v1`;

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  /** form-data; body is FormData */
  multipart?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(API_BASE + (path.startsWith('/') ? path : `/${path}`));
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.append(k, String(v));
    }
  }
  return url.toString();
}

class ApiErrorImpl extends Error implements ApiError {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;
let refreshInFlight: Promise<string | null> | null = null;

/** Called by AuthProvider so 401 + failed refresh updates React auth state. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

function emitUnauthorized() {
  clearTokens();
  onUnauthorized?.();
}

async function performTokenRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      idToken?: string;
      refreshToken?: string;
      expiresIn?: string | number;
    };
    if (data.idToken) {
      setTokens({
        accessToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      });
      return data.idToken;
    }
  } catch {
    /* swallow */
  }
  return null;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = performTokenRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/** Refresh tokens using the persisted refresh token (e.g. on app startup). */
export async function refreshAuthTokens(): Promise<string | null> {
  return refreshAccessToken();
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal, headers = {}, skipAuth, multipart } = opts;

  const doFetch = async (token: string | null): Promise<Response> => {
    const finalHeaders: Record<string, string> = { Accept: 'application/json', ...headers };
    if (!multipart && body !== undefined) finalHeaders['Content-Type'] = 'application/json';
    if (token && !skipAuth) finalHeaders.Authorization = `Bearer ${token}`;

    return fetch(buildUrl(path, query), {
      method,
      headers: finalHeaders,
      body: multipart
        ? (body as FormData)
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
      signal,
    });
  };

  let token = skipAuth ? null : getAccessToken();
  let res = await doFetch(token);

  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  if (res.status === 401 && !skipAuth) {
    emitUnauthorized();
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const env = parsed as ErrorEnvelope | undefined;
    throw new ApiErrorImpl(
      env?.message ?? res.statusText ?? 'Request failed',
      res.status,
      env?.code,
      env?.details
    );
  }

  return parsed as T;
}

export const api = {
  get: <T,>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'GET' }),
  post: <T,>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body }),
  put: <T,>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T,>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T,>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'DELETE' }),
  upload: <T,>(path: string, form: FormData, opts?: Omit<RequestOptions, 'method' | 'body' | 'multipart'>) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body: form, multipart: true }),
};

export { ApiErrorImpl as ApiError };
