import type { SessionResponse } from '@/core/auth/types';

export function getPostLoginPath(session: SessionResponse): string {
  if (session.role === 'platform_super_admin') {
    return '/business/admin/tenants';
  }
  if (!session.onboardingComplete && session.role === 'tenant_owner') {
    return '/business/onboarding';
  }
  return '/business/dashboard';
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
