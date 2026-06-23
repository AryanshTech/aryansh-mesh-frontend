import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/core/auth/guards';
import { AppShell } from '@/shell/AppShell';
import { AuthShell } from '@/shell/AuthShell';
import LoginPage from '@/modules/auth/pages/LoginPage';
import SignUpPage from '@/modules/auth/pages/SignUpPage';
import ForgotPasswordPage from '@/modules/auth/pages/ForgotPasswordPage';
import AcceptInvitePage from '@/modules/auth/pages/AcceptInvitePage';
import { businessRoutes } from '@/modules/business/routes';
import { marketingRoutes } from '@/modules/marketing/routes';
import { adminRoutes } from '@/modules/admin/routes';
import NotFoundPage from '@/shared/components/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthShell />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="accept-invite" element={<AcceptInvitePage />} />
        </Route>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          {businessRoutes}
          {marketingRoutes}
          {adminRoutes}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
