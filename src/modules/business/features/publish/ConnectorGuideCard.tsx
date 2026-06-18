import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Textarea } from '@/design-system/components/ui/textarea';
import { buildConnectorGuide } from '@/modules/business/features/publish/build-connector-guide';

interface ConnectorGuideCardProps {
  tenantName: string;
  tenantSlug: string;
  apiBase: string;
  embedOrigin: string;
}

export function ConnectorGuideCard({
  tenantName,
  tenantSlug,
  apiBase,
  embedOrigin,
}: ConnectorGuideCardProps) {
  const { t } = useTranslation();
  const guide = buildConnectorGuide({ tenantName, tenantSlug, apiBase, embedOrigin });

  async function copyGuide() {
    await navigator.clipboard.writeText(guide);
    toast.success(t('publish.connectorGuide.copied'));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{t('publish.connectorGuide.title')}</CardTitle>
          <CardDescription>{t('publish.connectorGuide.description')}</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void copyGuide()}>
          <Copy className="mr-2 size-4" />
          {t('publish.connectorGuide.copy')}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-muted-foreground">{t('publish.connectorGuide.hint')}</p>
        <Textarea
          readOnly
          value={guide}
          className="min-h-[560px] resize-y font-mono text-xs leading-relaxed"
          aria-label={t('publish.connectorGuide.title')}
        />
      </CardContent>
    </Card>
  );
}
