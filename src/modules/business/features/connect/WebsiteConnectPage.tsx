import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Rocket } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { WebsiteIntegrationPanel } from '@/modules/business/features/publish/WebsiteIntegrationPanel';
import { useWebsiteIntegrationContext } from '@/modules/business/hooks/use-website-integration';
import { useWorkspaceBreadcrumbs } from '@/modules/business/hooks/use-workspace-breadcrumbs';

export function WebsiteConnectPage() {
  const { t } = useTranslation();
  const breadcrumbs = useWorkspaceBreadcrumbs(t('pages.connect'));
  const {
    tenantSlug,
    tenantName,
    allowedOrigins,
    profilePath,
    publishPath,
    apiBase,
    embedOrigin,
    hasSlug,
  } = useWebsiteIntegrationContext();

  return (
    <CrmPageShell>
      <PageHeader description={t('connect.subtitle')} breadcrumbs={breadcrumbs} />

      {!hasSlug ? (
        <Alert>
          <AlertTitle>{t('connect.noSlugTitle')}</AlertTitle>
          <AlertDescription>{t('connect.noSlugDescription')}</AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                {t('connect.overviewTitle')}
                <Badge variant="secondary">{t('publish.hub.slugLabel', { slug: tenantSlug })}</Badge>
              </CardTitle>
              <CardDescription>{t('connect.overviewDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={publishPath}>
                  <Rocket className="size-4" data-icon="inline-start" />
                  {t('connect.openPublish')}
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`${apiBase}/public/tenants/${tenantSlug}/snapshot`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4" data-icon="inline-start" />
                  {t('publish.hub.viewApiSnapshot')}
                </a>
              </Button>
            </CardContent>
          </Card>

          <WebsiteIntegrationPanel
            tenantName={tenantName}
            tenantSlug={tenantSlug}
            apiBase={apiBase}
            embedOrigin={embedOrigin}
            profilePath={profilePath}
            allowedOrigins={allowedOrigins}
          />
        </>
      )}
    </CrmPageShell>
  );
}
