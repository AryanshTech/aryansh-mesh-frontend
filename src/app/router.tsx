import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from '@/core/auth/guards';
import { resolveLandingPath } from '@/core/auth/landing';
import { useAuth } from '@/core/auth/use-auth';
import { AppLayout } from '@/shell/AppLayout';
import { LoginPage } from '@/modules/business/features/auth/LoginPage';
import { ForgotPasswordPage } from '@/modules/business/features/auth/ForgotPasswordPage';
import { AcceptInvitePage } from '@/modules/business/features/auth/AcceptInvitePage';
import { SignUpPage } from '@/modules/business/features/auth/SignUpPage';
import { businessRoutes } from '@/modules/business/routes';
import { marketingRoutes } from '@/modules/marketing/routes';

function LegacyBusinessRedirect({ segment }: { segment: string }) {
  const location = useLocation();
  const rest = location.pathname.replace(`/${segment}`, '');
  return <Navigate to={`/business/${segment}${rest}${location.search}`} replace />;
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
          <Route element={<AppLayout />}>
            <Route path="/business">{businessRoutes()}</Route>
            <Route path="/marketing">{marketingRoutes()}</Route>
          </Route>
        </Route>

        {/* Business legacy redirects */}
        <Route path="/dashboard" element={<Navigate to="/business/dashboard" replace />} />
        <Route path="/onboarding" element={<Navigate to="/business/onboarding" replace />} />
        <Route path="/business" element={<Navigate to="/business/profile" replace />} />
        <Route path="/products/*" element={<LegacyBusinessRedirect segment="products" />} />
        <Route path="/costs/*" element={<LegacyBusinessRedirect segment="costs" />} />
        <Route path="/clients/*" element={<LegacyBusinessRedirect segment="clients" />} />
        <Route path="/locations/*" element={<LegacyBusinessRedirect segment="locations" />} />
        <Route path="/testimonials/*" element={<LegacyBusinessRedirect segment="testimonials" />} />
        <Route path="/content/*" element={<LegacyBusinessRedirect segment="content" />} />
        <Route path="/bookings" element={<Navigate to="/business/bookings" replace />} />
        <Route path="/publish" element={<Navigate to="/business/publish" replace />} />
        <Route path="/settings/team" element={<Navigate to="/business/settings/team" replace />} />
        <Route path="/settings/account" element={<Navigate to="/business/settings/account" replace />} />
        <Route path="/admin/tenants/*" element={<LegacyBusinessRedirect segment="admin/tenants" />} />

        {/* Marketing legacy redirects */}
        <Route path="/companies/*" element={<LegacyMarketingRedirect />} />
        <Route path="/projects/*" element={<LegacyMarketingRedirect />} />
        <Route path="/clients" element={<Navigate to="/marketing/companies" replace />} />
        <Route path="/clients/:clientId" element={<Navigate to="/marketing/companies/:clientId" replace />} />

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
