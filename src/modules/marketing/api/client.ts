import { ApiError } from '@/core/api/types';
import type { ApiErrorBody } from '@/core/api/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8090';

function apiPrefix(): string {
  const base = API_BASE.replace(/\/$/, '');
  return base.endsWith('/api/v1') ? base : `${base}/api/v1`;
}

async function parseLegacyError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody & {
      error?: { code?: string; message?: string };
      code?: string;
      message?: string;
    };
    const code = body.error?.code ?? body.code ?? 'UNKNOWN';
    const message = body.error?.message ?? body.message ?? response.statusText;
    return new ApiError(response.status, { code, message });
  } catch {
    return new ApiError(response.status, {
      code: 'UNKNOWN',
      message: response.statusText || 'Request failed',
    });
  }
}

export async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${apiPrefix()}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw await parseLegacyError(res);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function authApiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  return apiFetch<T>(path, token, options);
}

export function getApiBaseUrl(): string {
  const base = API_BASE.replace(/\/$/, '');
  if (base.endsWith('/api/v1')) {
    return base.slice(0, -'/api/v1'.length);
  }
  return base;
}

export { ApiError };
