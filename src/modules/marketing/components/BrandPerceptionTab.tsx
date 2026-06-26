import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { RefreshCw, Sparkles, Eye } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Button } from '@/design-system/components/ui/button';
import { Card } from '@/design-system/components/ui/card';
import {
  useBrandPerceptionPreview,
  useGenerateBrandPerception,
} from '@/modules/marketing/api/use-brand-perception';

interface Props {
  projectId: string;
  tenantId?: string;
}

export function BrandPerceptionTab({ projectId, tenantId }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isFetching } = useBrandPerceptionPreview(
    projectId,
    tenantId,
  );
  const saveMutation = useGenerateBrandPerception(projectId, tenantId);

  const hasPreview = Boolean(data?.contentMarkdown?.trim());

  const onRefresh = async () => {
    try {
      await refetch();
      toast.success(t('marketing.brandPerception.refreshed'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brandPerception.errorTitle'));
    }
  };

  const onSave = async () => {
    try {
      await saveMutation.mutateAsync();
      toast.success(t('marketing.brandPerception.generated'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brandPerception.generateFailed'));
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (isError) return <ErrorState title={t('marketing.brandPerception.errorTitle')} onRetry={() => void refetch()} />;

  if (!hasPreview) {
    return (
      <EmptyState
        icon={<Eye />}
        title={t('marketing.brandPerception.emptyTitle')}
        description={t('marketing.brandPerception.emptyDescription')}
        action={
          <Button onClick={() => void onRefresh()} disabled={isFetching}>
            <RefreshCw className="size-4" />
            {isFetching ? t('common.loading') : t('marketing.brandPerception.refreshPreview')}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => void onRefresh()} disabled={isFetching}>
          <RefreshCw className="size-4" />
          {isFetching ? t('common.loading') : t('marketing.brandPerception.refreshPreview')}
        </Button>
        <Button onClick={() => void onSave()} disabled={saveMutation.isPending}>
          <Sparkles className="size-4" />
          {saveMutation.isPending ? t('common.loading') : t('marketing.brandPerception.generate')}
        </Button>
      </div>
      <Card className="p-6 max-h-[70vh] overflow-y-auto">
        <pre className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed">
          {data?.contentMarkdown}
        </pre>
      </Card>
      {saveMutation.isSuccess ? (
        <Button variant="link" className="h-auto self-start p-0" asChild>
          <Link to={`/marketing/projects/${projectId}/brand-memory`}>
            {t('marketing.brandMemory.viewLink')}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
