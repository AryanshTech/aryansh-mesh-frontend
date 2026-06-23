import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth/use-auth';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas text-mute">
        <span className="text-sm">Loading…</span>
      </div>
    );
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Navigate to="/auth/login" replace />;
  if (user?.role !== 'PLATFORM_ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}
