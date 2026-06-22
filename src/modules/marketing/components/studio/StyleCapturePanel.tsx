import { formatDateTime, safeT, t } from '@/core/i18n';
import type { StyleCaptureResponse } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { ScrollArea } from '@/design-system/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs';

interface StyleCapturePanelProps {
  captures: StyleCaptureResponse[];
  selectedCaptureId?: string | null;
  onSelectCapture: (id: string) => void;
  onUseForPost?: (capture: StyleCaptureResponse) => void;
  onApplyToBrief?: (captureId: string) => void;
  applyingId?: string | null;
  disabled?: boolean;
}

export function StyleCapturePanel({
  captures,
  selectedCaptureId,
  onSelectCapture,
  onUseForPost,
  onApplyToBrief,
  applyingId = null,
  disabled = false,
}: StyleCapturePanelProps) {
  const selected =
    captures.find((capture) => capture.id === selectedCaptureId) ?? captures[0];

  if (!captures.length) {
    return (
      <p className="text-sm text-muted-foreground">{t('studio.captures.empty')}</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {captures.map((capture) => (
          <Button
            key={capture.id}
            size="sm"
            variant={selected?.id === capture.id ? 'default' : 'outline'}
            onClick={() => onSelectCapture(capture.id)}
          >
            {safeT(`studio.platforms.${capture.platform}`, capture.platform)} · {capture.posts.length}{' '}
            {t('studio.captures.posts')}
          </Button>
        ))}
      </div>

      {selected && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">{t('studio.captures.title')}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {safeT(`studio.analyzeStatus.${selected.analyzeStatus}`, selected.analyzeStatus)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(selected.createdAt)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href={selected.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm text-primary hover:underline"
            >
              {selected.sourceUrl}
            </a>

            <Tabs defaultValue="design">
              <TabsList>
                <TabsTrigger value="design">{t('studio.captures.designTab')}</TabsTrigger>
                <TabsTrigger value="content">{t('studio.captures.contentTab')}</TabsTrigger>
                <TabsTrigger value="framework">{t('studio.captures.frameworkTab')}</TabsTrigger>
              </TabsList>
              <TabsContent value="design">
                <DocBlock text={selected.docs?.designGuidelinesMd} />
              </TabsContent>
              <TabsContent value="content">
                <DocBlock text={selected.docs?.contentStyleMd} />
              </TabsContent>
              <TabsContent value="framework">
                <DocBlock text={selected.docs?.postingFrameworkMd} />
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-2">
              {onUseForPost && selected.styleReferenceId && (
                <Button
                  size="sm"
                  disabled={disabled}
                  onClick={() => onUseForPost(selected)}
                >
                  {t('studio.captures.useForPost')}
                </Button>
              )}
              {onApplyToBrief && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={disabled || applyingId === selected.id}
                  onClick={() => onApplyToBrief(selected.id)}
                >
                  {applyingId === selected.id
                    ? t('common.loading')
                    : t('studio.captures.applyToBrief')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DocBlock({ text }: { text: string | null | undefined }) {
  if (!text) {
    return (
      <p className="text-sm text-muted-foreground">{t('studio.captures.noDoc')}</p>
    );
  }
  return (
    <ScrollArea className="max-h-64 rounded-lg border border-border bg-muted/30">
      <pre className="whitespace-pre-wrap p-3 text-xs">{text}</pre>
    </ScrollArea>
  );
}
