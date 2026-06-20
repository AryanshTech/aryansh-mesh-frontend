import { useParams } from 'react-router-dom';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { t } from '@/core/i18n';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { PaletteIcon } from 'lucide-react';

export function CreativeStudioPage() {
  const { projectId = '' } = useParams();

  return (
    <CrmPageShell>
      <PageHeader title={t('creative.title')} description={t('creative.subtitle')} />
      <Alert>
        <PaletteIcon />
        <AlertTitle>{t('creative.comingSoonTitle')}</AlertTitle>
        <AlertDescription>{t('creative.comingSoonDescription')}</AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t('creative.shellTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('creative.shellDescription', { projectId })}
          </p>
        </CardContent>
      </Card>
    </CrmPageShell>
  );
}
