import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, MessageSquare } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import { FormDialog } from '@/shared/components/FormDialog';
import { cn } from '@/design-system/lib/utils';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import { MarketingBackLink } from '@/modules/marketing/components/MarketingBackLink';
import { useMarketingProjectGuard } from '@/modules/marketing/hooks/use-marketing-project-guard';
import { useThreads, useCreateThread, type Thread } from '@/modules/marketing/api/use-threads';

export default function ProjectDashboardPage() {
  const { t } = useTranslation();
  const { projectId: urlProjectId } = useParams<{ projectId: string }>();
  const { tenantId } = useTenantPath();
  const navigate = useNavigate();
  const {
    projectId,
    workspace,
    isResolving,
    projectMismatch,
    queriesEnabled,
  } = useMarketingProjectGuard(tenantId, urlProjectId);

  const { data, isLoading, isError, refetch } = useThreads(
    projectId,
    tenantId,
    queriesEnabled,
  );
  const createMutation = useCreateThread(projectId ?? '', tenantId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');

  const threads = data?.items ?? [];
  const pageTitle = workspace?.project.name ?? t('marketing.projectDashboardTitle');

  const onCreate = async () => {
    if (!title.trim()) {
      toast.error(t('marketing.threads.nameRequired'));
      return;
    }
    if (!projectId) return;

    try {
      const thread = await createMutation.mutateAsync({ title: title.trim() });
      toast.success(t('marketing.threads.created'));
      setDialogOpen(false);
      setTitle('');
      void navigate(`/marketing/projects/${projectId}/threads/${thread.id}`);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.threads.createFailed'));
    }
  };

  return (
    <PageShell>
      <MarketingBackLink
        to="/marketing"
        label={t('marketing.projectDashboard.backToWorkspace')}
        className="mb-4"
      />
      <PageHeader
        title={pageTitle}
        description={t('marketing.projectDashboardSubtitle')}
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)} disabled={!queriesEnabled}>
            <Plus className="size-3.5" />
            {t('marketing.threads.new')}
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <p className="typo-card-title text-foreground">{t('marketing.threads.title')}</p>

        {isResolving || projectMismatch ? (
          <ListSkeleton rows={4} />
        ) : isLoading ? (
          <ListSkeleton rows={4} />
        ) : isError ? (
          <ErrorState title={t('marketing.threads.loadFailed')} onRetry={() => void refetch()} />
        ) : threads.length === 0 ? (
          <EmptyState
            icon={<MessageSquare />}
            title={t('marketing.threads.emptyTitle')}
            description={t('marketing.threads.emptyDescription')}
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="size-4" />
                {t('marketing.threads.new')}
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
            {threads.map((thread: Thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() =>
                  void navigate(`/marketing/projects/${projectId}/threads/${thread.id}`)
                }
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left',
                  'transition-colors hover:bg-muted/30',
                )}
              >
                <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate font-medium text-foreground">{thread.title}</span>
                <span className="shrink-0 typo-eyebrow text-faint tabular-nums">
                  {new Date(thread.createdAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <FormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setTitle('');
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('marketing.threads.new')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label htmlFor="th-name">{t('marketing.threads.nameLabel')}</Label>
            <Input
              id="th-name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void onCreate();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setDialogOpen(false);
                setTitle('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={() => void onCreate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? t('common.loading') : t('marketing.threads.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </PageShell>
  );
}
