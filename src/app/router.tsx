import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from '@/core/auth/guards';
import { resolveLandingPath } from '@/core/auth/landing';
import { useAuth } from '@/core/auth/use-auth';
import { AppShell } from '@/shell/AppShell';
import { LoginPage } from '@/modules/business/features/auth/LoginPage';
import { ForgotPasswordPage } from '@/modules/business/features/auth/ForgotPasswordPage';
import { AcceptInvitePage } from '@/modules/business/features/auth/AcceptInvitePage';
import { SignUpPage } from '@/modules/business/features/auth/SignUpPage';
import { businessRoutes } from '@/modules/business/routes';
import { marketingRoutes } from '@/modules/marketing/routes';

function LegacyBusinessPrefixRedirect() {
  const { pathname, search } = useLocation();
  let rest = pathname.replace(/^\/business/, '');
  if (!rest || rest === '/') {
    rest = '/dashboard';
  } else if (rest === '/business') {
    rest = '/profile';
  }
  return <Navigate to={`${rest}${search}`} replace />;
}

function LegacyMarketingRedirect() {
  const location = useLocation();
  const rest = location.pathname.replace(/^\//, '');
  return <Navigate to={`/marketing/${rest}${location.search}`} replace />;
}

function RootRedirect() {
  const { isAuthenticated, session, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !session) return <Navigate to="/login" replace />;
  return <Navigate to={resolveLandingPath(session)} replace />;
}

function NotFoundRedirect() {
  const { isAuthenticated, session, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && session) {
    return <Navigate to={resolveLandingPath(session)} replace />;
  }
  return <Navigate to="/login" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            {businessRoutes()}
            <Route path="/marketing">{marketingRoutes()}</Route>
          </Route>
        </Route>

        {/* Legacy /business/* redirects */}
        <Route path="/business/*" element={<LegacyBusinessPrefixRedirect />} />

        {/* Marketing legacy redirects */}
        <Route path="/companies/*" element={<LegacyMarketingRedirect />} />
        <Route path="/projects/*" element={<LegacyMarketingRedirect />} />

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
