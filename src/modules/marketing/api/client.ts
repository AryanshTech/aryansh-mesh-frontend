import { api } from '@/core/api/client';
import { ApiError } from '@/core/api/types';

export async function apiFetch<T>(
  path: string,
  _token: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const body = options.body;

  if (body instanceof FormData) {
    return api.upload<T>(path, body);
  }

  let parsedBody: unknown;
  if (typeof body === 'string' && body.length > 0) {
    parsedBody = JSON.parse(body) as unknown;
  }

  switch (method) {
    case 'GET':
      return api.get<T>(path);
    case 'POST':
      return api.post<T>(path, parsedBody);
    case 'PUT':
      return api.put<T>(path, parsedBody);
    case 'PATCH':
      return api.patch<T>(path, parsedBody);
    case 'DELETE':
      return api.delete<T>(path);
    default:
      throw new ApiError(400, { code: 'UNSUPPORTED_METHOD', message: method });
  }
}

export async function authApiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  return apiFetch<T>(path, token, options);
}

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8090';
  return raw.endsWith('/api/v1') ? raw.slice(0, -'/api/v1'.length) : raw;
}

export { ApiError };
