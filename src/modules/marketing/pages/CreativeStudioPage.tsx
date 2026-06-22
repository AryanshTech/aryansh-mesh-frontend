import { useParams } from 'react-router-dom';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { LinearPageHeader } from '@/shared/components/linear';
import { t } from '@/core/i18n';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { PaletteIcon } from 'lucide-react';

export function CreativeStudioPage() {
  const { projectId = '' } = useParams();

  return (
    <CrmPageShell>
      <LinearPageHeader title={t('creative.title')} description={t('creative.subtitle')} />
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
          <p className="typo-body-sm text-muted-foreground">
            {t('creative.shellDescription', { projectId })}
          </p>
        </CardContent>
      </Card>
    </CrmPageShell>
  );
}
