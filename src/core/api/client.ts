import { ApiError, type ApiErrorBody } from '@/core/api/types';
import { resolveApiV1BaseUrl } from '@/core/api/config';

type TokenGetter = (forceRefresh?: boolean) => Promise<string | null>;
type UnauthorizedHandler = () => void;

let getToken: TokenGetter = async () => null;
let onUnauthorized: UnauthorizedHandler = () => undefined;

export function configureApiClient(options: {
  getToken: TokenGetter;
  onUnauthorized: UnauthorizedHandler;
}) {
  getToken = options.getToken;
  onUnauthorized = options.onUnauthorized;
}

const baseUrl = resolveApiV1BaseUrl();

export function getApiBaseUrl(): string {
  return baseUrl;
}

export { resolveGatewayOrigin, resolveApiV1BaseUrl } from '@/core/api/config';

async function parseError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return new ApiError(response.status, body);
  } catch {
    return new ApiError(response.status, {
      code: 'UNKNOWN',
      message: response.statusText || 'Request failed',
    });
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retried = false,
): Promise<T> {
  const token = await getToken(false);
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && !retried) {
    const freshToken = await getToken(true);
    if (freshToken) {
      return request<T>(method, path, body, true);
    }
    onUnauthorized();
    throw await parseError(response);
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function uploadRequest<T>(path: string, formData: FormData, retried = false): Promise<T> {
  const token = await getToken(false);
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401 && !retried) {
    const freshToken = await getToken(true);
    if (freshToken) {
      return uploadRequest<T>(path, formData, true);
    }
    onUnauthorized();
    throw await parseError(response);
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, formData: FormData) => uploadRequest<T>(path, formData),
};

export { ApiError };
