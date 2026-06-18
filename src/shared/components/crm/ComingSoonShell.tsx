import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader, type BreadcrumbItemConfig } from '@/shared/components/crm/PageHeader';

interface ComingSoonShellProps {
  titleKey: string;
  descriptionKey?: string;
  comingSoonKey?: string;
  breadcrumbs?: BreadcrumbItemConfig[];
  children?: React.ReactNode;
}

export function ComingSoonShell({
  titleKey,
  descriptionKey,
  comingSoonKey = 'common.comingSoon',
  breadcrumbs,
  children,
}: ComingSoonShellProps) {
  const { t } = useTranslation();

  return (
    <CrmPageShell>
      <PageHeader
        title={t(titleKey)}
        description={descriptionKey ? t(descriptionKey) : undefined}
        breadcrumbs={breadcrumbs}
      />
      <Alert>
        <Info className="size-4" />
        <AlertTitle>{t('common.apiPendingTitle')}</AlertTitle>
        <AlertDescription>{t(comingSoonKey)}</AlertDescription>
      </Alert>
      {children && (
        <Card>
          <CardHeader>
            <CardTitle>{t(titleKey)}</CardTitle>
            {descriptionKey && (
              <CardDescription>{t(descriptionKey)}</CardDescription>
            )}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      )}
    </CrmPageShell>
  );
}
