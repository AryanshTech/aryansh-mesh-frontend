import { Link } from 'react-router-dom';
import { Copy, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Input } from '@/design-system/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs';
import { Textarea } from '@/design-system/components/ui/textarea';
import { typographyClasses, mutedBodySm } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';
import { ConnectorGuideCard } from '@/modules/business/features/publish/ConnectorGuideCard';
import {
  buildCorsExampleOrigins,
  buildDebugCurl,
  buildEmbedScript,
  buildEnvBlock,
  buildFetchSnippet,
  buildNextProxySnippet,
  buildViteProxySnippet,
  publicApiEndpoints,
  type WebsiteIntegrationContext,
} from '@/modules/business/features/publish/website-integration-snippets';

type WebsiteIntegrationPanelProps = WebsiteIntegrationContext & {
  profilePath: string;
  allowedOrigins?: string[];
};

function CopyBlock({
  label,
  value,
  copiedLabel,
  copyLabel,
}: {
  label: string;
  value: string;
  copiedLabel: string;
  copyLabel: string;
}) {
  async function copy() {
    await navigator.clipboard.writeText(value);
    toast.success(copiedLabel);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className={typographyClasses.button}>{label}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
          <Copy className="size-4" data-icon="inline-start" />
          {copyLabel}
        </Button>
      </div>
      <Textarea readOnly value={value} className={cn('min-h-[120px] resize-y', typographyClasses.mono)} />
    </div>
  );
}

export function WebsiteIntegrationPanel({
  tenantName,
  tenantSlug,
  apiBase,
  embedOrigin,
  profilePath,
  allowedOrigins = [],
}: WebsiteIntegrationPanelProps) {
  const { t } = useTranslation();
  const ctx: WebsiteIntegrationContext = { tenantName, tenantSlug, apiBase, embedOrigin };
  const endpoints = publicApiEndpoints(ctx);
  const copyLabel = t('publish.integration.copy');
  const setupSteps = [
    'publish.integration.steps.publish',
    'publish.integration.steps.cors',
    'publish.integration.steps.env',
    'publish.integration.steps.routes',
    'publish.integration.steps.verify',
  ] as const;

  const troubleshootRows = [
    ['publish.integration.troubleshoot.corsBlocked.symptom', 'publish.integration.troubleshoot.corsBlocked.fix'],
    ['publish.integration.troubleshoot.curlWorks.symptom', 'publish.integration.troubleshoot.curlWorks.fix'],
    ['publish.integration.troubleshoot.unauthorized.symptom', 'publish.integration.troubleshoot.unauthorized.fix'],
    ['publish.integration.troubleshoot.booking403.symptom', 'publish.integration.troubleshoot.booking403.fix'],
    ['publish.integration.troubleshoot.notFound.symptom', 'publish.integration.troubleshoot.notFound.fix'],
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('publish.integration.title')}</CardTitle>
        <CardDescription>{t('publish.integration.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="setup">{t('publish.integration.tabs.setup')}</TabsTrigger>
            <TabsTrigger value="cors">{t('publish.integration.tabs.cors')}</TabsTrigger>
            <TabsTrigger value="api">{t('publish.integration.tabs.api')}</TabsTrigger>
            <TabsTrigger value="embed">{t('publish.integration.tabs.embed')}</TabsTrigger>
            <TabsTrigger value="dev">{t('publish.integration.tabs.dev')}</TabsTrigger>
            <TabsTrigger value="troubleshoot">{t('publish.integration.tabs.troubleshoot')}</TabsTrigger>
            <TabsTrigger value="guide">{t('publish.integration.tabs.guide')}</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="flex flex-col gap-4">
            <p className={mutedBodySm}>{t('publish.integration.howItWorks')}</p>
            <ol className="flex flex-col gap-3">
              {setupSteps.map((key, index) => (
                <li key={key} className="flex gap-3 rounded-card-inner border border-border bg-muted/30 p-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className={typographyClasses.bodySm}>{t(key)}</p>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{t('publish.hub.slugLabel', { slug: tenantSlug })}</Badge>
              <Button variant="outline" size="sm" asChild>
                <a href={endpoints[0].path} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" data-icon="inline-start" />
                  {t('publish.hub.viewApiSnapshot')}
                </a>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="cors" className="flex flex-col gap-4">
            <p className={mutedBodySm}>{t('publish.integration.corsIntro')}</p>
            {allowedOrigins.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className={typographyClasses.button}>{t('publish.integration.registeredOrigins')}</p>
                <div className="flex flex-wrap gap-2">
                  {allowedOrigins.map((origin) => (
                    <Badge key={origin} variant="outline">
                      {origin}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className={mutedBodySm}>{t('publish.integration.noOrigins')}</p>
            )}
            <CopyBlock
              label={t('publish.integration.exampleOrigins')}
              value={buildCorsExampleOrigins()}
              copiedLabel={t('publish.integration.copied')}
              copyLabel={copyLabel}
            />
            <Button variant="outline" size="sm" asChild>
              <Link to={profilePath}>{t('publish.integration.openProfile')}</Link>
            </Button>
          </TabsContent>

          <TabsContent value="api" className="flex flex-col gap-4">
            <CopyBlock
              label={t('publish.integration.envVars')}
              value={buildEnvBlock(ctx)}
              copiedLabel={t('publish.integration.copied')}
              copyLabel={copyLabel}
            />
            <div className="overflow-x-auto rounded-card-inner border border-border">
              <table className={cn('w-full min-w-[520px] text-left', typographyClasses.bodySm)}>
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className={cn('px-3 py-2', typographyClasses.eyebrowUpper)}>{t('publish.integration.table.method')}</th>
                    <th className={cn('px-3 py-2', typographyClasses.eyebrowUpper)}>{t('publish.integration.table.path')}</th>
                    <th className={cn('px-3 py-2', typographyClasses.eyebrowUpper)}>{t('publish.integration.table.purpose')}</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((endpoint) => (
                    <tr key={endpoint.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                      </td>
                      <td className={cn('px-3 py-2', typographyClasses.mono)}>{endpoint.path}</td>
                      <td className={cn('px-3 py-2 text-muted-foreground', typographyClasses.bodySm)}>{t(endpoint.purposeKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CopyBlock
              label={t('publish.integration.fetchExample')}
              value={buildFetchSnippet(ctx)}
              copiedLabel={t('publish.integration.copied')}
              copyLabel={copyLabel}
            />
          </TabsContent>

          <TabsContent value="embed" className="flex flex-col gap-4">
            <p className={mutedBodySm}>{t('publish.embed.hint')}</p>
            <CopyBlock
              label={t('publish.embed.title')}
              value={buildEmbedScript(ctx)}
              copiedLabel={t('publish.embed.copied')}
              copyLabel={copyLabel}
            />
          </TabsContent>

          <TabsContent value="dev" className="flex flex-col gap-4">
            <p className={mutedBodySm}>{t('publish.integration.devIntro')}</p>
            <CopyBlock
              label={t('publish.integration.viteProxy')}
              value={buildViteProxySnippet()}
              copiedLabel={t('publish.integration.copied')}
              copyLabel={copyLabel}
            />
            <CopyBlock
              label={t('publish.integration.nextProxy')}
              value={buildNextProxySnippet()}
              copiedLabel={t('publish.integration.copied')}
              copyLabel={copyLabel}
            />
          </TabsContent>

          <TabsContent value="troubleshoot" className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-card-inner border border-border">
              <table className={cn('w-full min-w-[520px] text-left', typographyClasses.bodySm)}>
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className={cn('px-3 py-2', typographyClasses.eyebrowUpper)}>{t('publish.integration.table.symptom')}</th>
                    <th className={cn('px-3 py-2', typographyClasses.eyebrowUpper)}>{t('publish.integration.table.fix')}</th>
                  </tr>
                </thead>
                <tbody>
                  {troubleshootRows.map(([symptomKey, fixKey]) => (
                    <tr key={symptomKey} className="border-b border-border last:border-0">
                      <td className={cn('px-3 py-2 align-top', typographyClasses.bodySm)}>{t(symptomKey)}</td>
                      <td className={cn('px-3 py-2 align-top text-muted-foreground', typographyClasses.bodySm)}>{t(fixKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CopyBlock
              label={t('publish.integration.debugCommands')}
              value={buildDebugCurl(ctx)}
              copiedLabel={t('publish.integration.copied')}
              copyLabel={copyLabel}
            />
          </TabsContent>

          <TabsContent value="guide" className="flex flex-col gap-4">
            <ConnectorGuideCard
              embedded
              tenantName={tenantName}
              tenantSlug={tenantSlug}
              apiBase={apiBase}
              embedOrigin={embedOrigin}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
