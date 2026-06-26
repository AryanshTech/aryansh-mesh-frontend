import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth/use-auth';
import type { ReactNode } from 'react';

function AuthLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-canvas text-mute">
      <span className="text-sm">Loading…</span>
    </div>
  );
}

function hasInviteContext(pathname: string, search: string): boolean {
  return (
    pathname.includes('accept-invite') ||
    search.includes('token=') ||
    search.includes('inviteToken=')
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthLoading />;
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

/** Auth pages — redirect to app when already signed in, except during invite acceptance. */
export function GuestRoute() {
  const { status } = useAuth();
  const location = useLocation();
  const inviteFlow = hasInviteContext(location.pathname, location.search);

  if (status === 'loading') {
    return <AuthLoading />;
  }
  if (status === 'authenticated' && !inviteFlow) {
    const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';
    return <Navigate to={from} replace />;
  }
  return <Outlet />;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  if (status === 'loading') return <AuthLoading />;
  if (status === 'unauthenticated') return <Navigate to="/auth/login" replace />;
  if (user?.role !== 'PLATFORM_ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}
