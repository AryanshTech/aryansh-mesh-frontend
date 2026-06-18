import { api, getApiBaseUrl, ApiError } from '@/core/api/client';
import type { MeResponse, SessionResponse } from '@/core/auth/types';

export interface LoginResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  session: SessionResponse;
}

export interface AuthTokensResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

async function publicRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    try {
      const errorBody = await response.json();
      throw new ApiError(response.status, errorBody);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(response.status, {
        code: 'UNKNOWN',
        message: response.statusText || 'Request failed',
      });
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    publicRequest<LoginResponse>('POST', '/auth/login', { email, password }),
  signUp: (email: string, password: string) =>
    publicRequest<AuthTokensResponse>('POST', '/auth/signup', { email, password }),
  refresh: (refreshToken: string) =>
    publicRequest<AuthTokensResponse>('POST', '/auth/refresh', { refreshToken }),
  passwordReset: (email: string) =>
    publicRequest<void>('POST', '/auth/password-reset', { email }),
  session: () => api.post<SessionResponse>('/auth/session'),
  me: () => api.get<MeResponse>('/me'),
  acceptInvite: (token: string) => api.post<SessionResponse>('/auth/accept-invite', { token }),
};
