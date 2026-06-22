import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Textarea } from '@/design-system/components/ui/textarea';
import { typographyClasses, mutedBodySm } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';

interface ConnectorGuideCardProps {
  tenantName: string;
  tenantSlug: string;
  apiBase: string;
  embedOrigin: string;
  embedded?: boolean;
}

export function ConnectorGuideCard({
  tenantName,
  tenantSlug,
  apiBase,
  embedOrigin,
  embedded = false,
}: ConnectorGuideCardProps) {
  const { t } = useTranslation();
  const guide = buildConnectorGuide({ tenantName, tenantSlug, apiBase, embedOrigin });

  async function copyGuide() {
    await navigator.clipboard.writeText(guide);
    toast.success(t('publish.connectorGuide.copied'));
  }

  const body = (
    <>
      {!embedded ? (
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
      ) : (
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className={typographyClasses.cardTitle}>{t('publish.connectorGuide.title')}</p>
            <p className={mutedBodySm}>{t('publish.connectorGuide.description')}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void copyGuide()}>
            <Copy className="mr-2 size-4" />
            {t('publish.connectorGuide.copy')}
          </Button>
        </div>
      )}
      <CardContent className={embedded ? 'p-0' : undefined}>
        <p className={cn('mb-3', mutedBodySm)}>{t('publish.connectorGuide.hint')}</p>
        <Textarea
          readOnly
          value={guide}
          className={cn('min-h-[560px] resize-y', typographyClasses.mono)}
          aria-label={t('publish.connectorGuide.title')}
        />
      </CardContent>
    </>
  );

  if (embedded) {
    return <div>{body}</div>;
  }

  return <Card>{body}</Card>;
}
