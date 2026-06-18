import type { SessionResponse } from '@/core/auth/types';

export function resolveLandingPath(session: SessionResponse): string {
  if (session.role === 'platform_super_admin') {
    return '/business/admin/tenants';
  }
  if (!session.onboardingComplete && session.role === 'tenant_owner') {
    return '/business/onboarding';
  }
  const services = session.services ?? [];
  if (services.includes('marketing-hub')) {
    return '/marketing';
  }
  if (services.includes('business-manager')) {
    return '/business/dashboard';
  }
  return '/business/dashboard';
}
