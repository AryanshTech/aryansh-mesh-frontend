import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Brain } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Button } from '@/design-system/components/ui/button';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Badge } from '@/design-system/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import {
  useBrandMemory,
  useBrandMemoryVersions,
  useSaveBrandMemory,
  useSetCurrentBrandMemory,
} from '@/modules/marketing/api/use-brand-memory';

interface Props {
  projectId: string;
  tenantId?: string;
}

export function BrandVoiceTab({ projectId, tenantId }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useBrandMemory(projectId, tenantId);
  const { data: versions = [] } = useBrandMemoryVersions(projectId, tenantId);
  const saveMutation = useSaveBrandMemory(projectId, tenantId);
  const setCurrentMutation = useSetCurrentBrandMemory(projectId, tenantId);

  const [content, setContent] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');

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

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (isError) {
    return <ErrorState title={t('marketing.brandMemory.loadFailed')} onRetry={() => void refetch()} />;
  }

  if (!data && !content) {
    return (
      <EmptyState
        icon={<Brain />}
        title={t('marketing.brandMemory.emptyTitle')}
        description={t('marketing.brandMemory.emptyDescription')}
        action={
          <Button onClick={() => setContent('# Brand voice\n\n')}>
            {t('marketing.brandMemory.startWriting')}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="typo-body-sm text-muted-foreground">{t('marketing.brandMemory.tabHint')}</p>
        <Button onClick={() => void onSave()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </div>

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
  );
}
