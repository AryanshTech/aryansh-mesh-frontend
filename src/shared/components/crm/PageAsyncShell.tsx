import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import { AsyncContentReveal } from '@/shared/components/crm/AsyncContentReveal';

type PageAsyncShellProps = {
  loading: boolean;
  error?: string | null;
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  skeleton: ReactNode;
  children: ReactNode;
  reveal?: boolean;
};

export function PageAsyncShell({
  loading,
  error,
  errorTitle,
  errorDescription,
  onRetry,
  skeleton,
  children,
  reveal = true,
}: PageAsyncShellProps) {
  const { t } = useTranslation();

  if (loading) {
    return <>{skeleton}</>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{errorTitle ?? t('errors.network')}</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <span>{errorDescription ?? error}</span>
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={onRetry}>
              {t('common.retry')}
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  }

  if (reveal) {
    return <AsyncContentReveal loading={false}>{children}</AsyncContentReveal>;
  }

  return <>{children}</>;
}
