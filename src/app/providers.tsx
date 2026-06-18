import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/core/i18n';
import { AuthProvider } from '@/core/auth/auth-context';
import { LocaleProvider } from '@/modules/marketing/contexts/locale-context';
import { Toaster } from '@/design-system/components/ui/sonner';
import { TooltipProvider } from '@/design-system/components/ui/tooltip';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <LocaleProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </LocaleProvider>
        </AuthProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
