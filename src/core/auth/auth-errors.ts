import { ApiError } from '@/core/api/types';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'auth.errors.invalidCredential',
  INVALID_EMAIL: 'auth.errors.invalidEmail',
  TOO_MANY_REQUESTS: 'auth.errors.tooManyRequests',
  USER_DISABLED: 'auth.errors.userDisabled',
  EMAIL_EXISTS: 'auth.errors.emailInUse',
  WEAK_PASSWORD: 'auth.errors.weakPassword',
  AUTH_NOT_CONFIGURED: 'auth.errors.authNotConfigured',
  AUTH_PROVIDER_ERROR: 'auth.errors.authNotConfigured',
};

export function getAuthErrorKey(error: unknown): string {
  if (error instanceof ApiError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? 'auth.errors.signInFailed';
  }
  return 'auth.errors.signInFailed';
}

export function isEmailExistsError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'EMAIL_EXISTS';
}

export function isPasswordResetUserNotFound(_error: unknown): boolean {
  return false;
}
