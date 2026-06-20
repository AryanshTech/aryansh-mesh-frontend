import { api } from '@/core/api/client';
import { resolveApiV1BaseUrl, resolveGatewayOrigin } from '@/core/api/config';
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
  return resolveGatewayOrigin();
}

export function getApiV1BaseUrl(): string {
  return resolveApiV1BaseUrl();
}

export { ApiError };
