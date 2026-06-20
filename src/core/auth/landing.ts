import type { SessionResponse } from '@/core/auth/types';

export function resolveLandingPath(session: SessionResponse): string {
  if (
    session.role === 'platform_super_admin' ||
    session.accessLevel === 'platform_admin'
  ) {
    return '/admin/tenants';
  }
  if (!session.onboardingComplete && session.role === 'tenant_owner') {
    return '/onboarding';
  }
  const services = session.services ?? [];
  if (services.includes('business-manager')) {
    return '/dashboard';
  }
  if (services.includes('marketing-hub')) {
    return '/marketing';
  }
  return '/dashboard';
}
