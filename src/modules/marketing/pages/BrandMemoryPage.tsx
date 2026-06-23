import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState } from '@/shared/components/ErrorState';
import { Button } from '@/design-system/components/ui/button';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { useBrandMemory, useSaveBrandMemory } from '@/modules/marketing/api/use-brand-memory';

export default function BrandMemoryPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();

  const { data, isLoading, isError, refetch } = useBrandMemory(projectId);
  const saveMutation = useSaveBrandMemory(projectId ?? '');

  const [content, setContent] = useState('');

  useEffect(() => {
    if (data) setContent(data.content);
  }, [data]);

  const onSave = async () => {
    try {
      await saveMutation.mutateAsync(content);
      toast.success('Brand memory saved');
    } catch (e) {
      toast.error((e as Error).message || 'Failed to save');
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('marketing.brandMemoryTitle')}
        description={t('marketing.brandMemorySubtitle')}
        actions={
          <Button onClick={() => void onSave()} disabled={saveMutation.isPending || isLoading}>
            {saveMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        }
      />
      {isError ? (
        <ErrorState title="Failed to load brand memory" onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <div className="flex flex-col gap-2 max-w-2xl">
          <Textarea
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your brand guidelines, tone of voice, key messages, and positioning here…"
            className="resize-y font-mono text-sm"
          />
          {data?.updatedAt ? (
            <p className="text-xs text-muted-foreground">
              Last saved: {new Date(data.updatedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
