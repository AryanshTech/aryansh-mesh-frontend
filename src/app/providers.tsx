import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/core/auth/AuthProvider';
import { ActiveTenantProvider } from '@/core/tenant/ActiveTenantContext';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { queryClient } from '@/core/query/client';
import i18n from '@/core/i18n';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ActiveTenantProvider>
              {children}
              <Toaster
                position="bottom-right"
                richColors
                closeButton
                theme="dark"
                toastOptions={{
                  style: {
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  },
                }}
              />
            </ActiveTenantProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
