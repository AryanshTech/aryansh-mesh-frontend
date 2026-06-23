import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Sparkles, Eye } from 'lucide-react';
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
}

export function BrandPerceptionTab({ projectId }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useBrandPerceptionPreview(projectId);
  const generateMutation = useGenerateBrandPerception(projectId);

  const onGenerate = async () => {
    try {
      await generateMutation.mutateAsync();
      toast.success(t('marketing.brandPerception.generated'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brandPerception.generateFailed'));
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (isError) return <ErrorState title={t('marketing.brandPerception.errorTitle')} onRetry={() => void refetch()} />;

  if (!data || !data.contentMarkdown?.trim()) {
    return (
      <EmptyState
        icon={<Eye />}
        title={t('marketing.brandPerception.emptyTitle')}
        description={t('marketing.brandPerception.emptyDescription')}
        action={
          <Button onClick={() => void onGenerate()} disabled={generateMutation.isPending}>
            <Sparkles className="size-4" />
            {generateMutation.isPending ? t('common.loading') : t('marketing.brandPerception.generate')}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => void onGenerate()} disabled={generateMutation.isPending}>
          <Sparkles className="size-4" />
          {generateMutation.isPending ? t('common.loading') : t('marketing.brandPerception.generate')}
        </Button>
      </div>
      <Card className="p-6 max-h-[70vh] overflow-y-auto">
        <pre className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed">
          {data.contentMarkdown}
        </pre>
      </Card>
    </div>
  );
}
