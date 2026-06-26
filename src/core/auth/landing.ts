import type { User } from '@/core/auth/types';

/** Post-auth redirect based on role and tenant membership. */
export function resolveLandingPath(user: User | null): string {
  if (!user) return '/auth/login';
  if (user.role === 'PLATFORM_ADMIN') return '/admin/tenants';
  if (user.tenantId) return '/dashboard';
  return '/onboarding';
}
