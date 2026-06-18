import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth/use-auth';
import { usePermissions } from '@/core/permissions/use-permissions';
import { resolveLandingPath } from '@/core/auth/landing';
import { Skeleton } from '@/design-system/components/ui/skeleton';

function AuthLoading() {
  return (
    <div className="flex min-h-screen flex-col gap-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Skeleton className="h-64 w-full max-w-md" />
      </div>
    );
  }

  if (isAuthenticated && session) {
    return <Navigate to={resolveLandingPath(session)} replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { loading } = useAuth();
  const { isSuperAdmin, isPlatformAdmin } = usePermissions();
  const location = useLocation();
  const isMarketingAdmin = location.pathname.startsWith('/marketing/admin');

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (isMarketingAdmin) {
    if (!isPlatformAdmin) return <Navigate to="/marketing" replace />;
    return <Outlet />;
  }
  if (!isSuperAdmin) return <Navigate to="/business/dashboard" replace />;
  return <Outlet />;
}

export function OnboardingRoute() {
  const { session, loading } = useAuth();

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (session?.onboardingComplete) {
    return <Navigate to="/business/dashboard" replace />;
  }
  return <Outlet />;
}
