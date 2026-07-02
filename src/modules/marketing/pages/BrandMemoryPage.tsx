import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState } from '@/shared/components/ErrorState';
import { Button } from '@/design-system/components/ui/button';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Badge } from '@/design-system/components/ui/badge';
import { MarketingBackLink } from '@/modules/marketing/components/MarketingBackLink';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import { useMarketingProjectGuard } from '@/modules/marketing/hooks/use-marketing-project-guard';
import {
  useBrandMemory,
  useBrandMemoryVersions,
  useSaveBrandMemory,
  useSetCurrentBrandMemory,
} from '@/modules/marketing/api/use-brand-memory';

export default function BrandMemoryPage() {
  const { t } = useTranslation();
  const { projectId: urlProjectId } = useParams<{ projectId: string }>();
  const { tenantId } = useTenantPath();
  const { projectId, isResolving, projectMismatch, queriesEnabled } =
    useMarketingProjectGuard(tenantId, urlProjectId);

  const { data, isLoading, isError, refetch } = useBrandMemory(
    projectId,
    tenantId || undefined,
    queriesEnabled,
  );
  const { data: versions = [] } = useBrandMemoryVersions(
    projectId,
    tenantId || undefined,
    queriesEnabled,
  );
  const saveMutation = useSaveBrandMemory(projectId ?? '', tenantId || undefined);
  const setCurrentMutation = useSetCurrentBrandMemory(projectId ?? '', tenantId || undefined);

  const [content, setContent] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');

  useEffect(() => {
    if (data) {
      setContent(data.contentMarkdown);
      setSelectedVersionId(data.id);
    }
  }, [data]);

  useEffect(() => {
    setContent('');
    setSelectedVersionId('');
  }, [tenantId, projectId]);

  const onSave = async () => {
    try {
      await saveMutation.mutateAsync(content);
      toast.success(t('marketing.brandMemory.saved'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brandMemory.saveFailed'));
    }
  };

  const onSetCurrent = async (memoryId: string) => {
    try {
      await setCurrentMutation.mutateAsync(memoryId);
      toast.success(t('marketing.brandMemory.versionSet'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brandMemory.versionSetFailed'));
    }
  };

  const onVersionChange = (memoryId: string) => {
    setSelectedVersionId(memoryId);
    const version = versions.find((entry) => entry.id === memoryId);
    if (version) setContent(version.contentMarkdown);
  };

  return (
    <PageShell>
      <MarketingBackLink
        to="/marketing"
        label={t('marketing.brandMemory.backToWorkspace')}
        className="mb-4"
      />
      <PageHeader
        title={t('marketing.brandMemoryTitle')}
        description={t('marketing.brandMemorySubtitle')}
        actions={
          <Button onClick={() => void onSave()} disabled={saveMutation.isPending || isLoading}>
            {saveMutation.isPending ? t('common.loading') : t('common.save')}
          </Button>
        }
      />
      {isError ? (
        <ErrorState
          title={t('marketing.brandMemory.loadFailed')}
          onRetry={() => void refetch()}
        />
      ) : isResolving || projectMismatch || isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <div className="flex flex-col gap-4 max-w-3xl">
          {versions.length > 1 ? (
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedVersionId} onValueChange={onVersionChange}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder={t('marketing.brandMemory.selectVersion')} />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {t('marketing.brandMemory.versionLabel', { version: version.version })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedVersionId && data?.id !== selectedVersionId ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={setCurrentMutation.isPending}
                  onClick={() => void onSetCurrent(selectedVersionId)}
                >
                  {t('marketing.brandMemory.setCurrent')}
                </Button>
              ) : null}
              {data?.isCurrent ? (
                <Badge variant="secondary">{t('marketing.brandMemory.current')}</Badge>
              ) : null}
            </div>
          ) : null}

          <Textarea
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('marketing.brandMemory.placeholder')}
            className="resize-y font-mono text-sm"
          />
          {data?.createdAt ? (
            <p className="text-xs text-muted-foreground">
              {t('marketing.brandMemory.lastSaved', {
                date: new Date(data.createdAt).toLocaleString(),
              })}
            </p>
          ) : null}

        </div>
      )}
    </PageShell>
  );
}
