import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export type ShellLayoutMode = 'business' | 'marketing';

/** Business routes use global header above sidebar; marketing uses sidebar-first. */
export function useShellLayoutMode(): ShellLayoutMode {
  const { pathname } = useLocation();

  return useMemo(() => {
    if (pathname.startsWith('/marketing')) {
      return 'marketing';
    }
    if (
      pathname.startsWith('/t/') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/connect') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/team') ||
      pathname.startsWith('/account') ||
      pathname.startsWith('/admin/tenants')
    ) {
      return 'business';
    }
    return 'marketing';
  }, [pathname]);
}

export function isBusinessShellPath(pathname: string): boolean {
  return (
    pathname.startsWith('/t/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/connect') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/team') ||
    pathname.startsWith('/account')
  );
}
