import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Rocket } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { WebsiteIntegrationPanel } from '@/modules/business/components/website/WebsiteIntegrationPanel';
import { useWebsiteIntegration } from '@/modules/business/hooks/use-website-integration';

export default function WebsiteConnectPage() {
  const { t } = useTranslation();
  const {
    tenantSlug,
    tenantName,
    allowedOrigins,
    profilePath,
    publishPath,
    apiBase,
    embedOrigin,
    hasSlug,
  } = useWebsiteIntegration();

  return (
    <PageShell>
      <PageHeader title={t('connect.title')} description={t('connect.subtitle')} />

      {!hasSlug ? (
        <Alert>
          <AlertTitle>{t('connect.noSlugTitle')}</AlertTitle>
          <AlertDescription>{t('connect.noSlugDescription')}</AlertDescription>
        </Alert>
      ) : (
        <div className="flex max-w-5xl flex-col gap-6">
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
                  <Rocket className="size-4" />
                  {t('connect.openPublish')}
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`${apiBase}/public/tenants/${tenantSlug}/snapshot`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4" />
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
        </div>
      )}
    </PageShell>
  );
}
