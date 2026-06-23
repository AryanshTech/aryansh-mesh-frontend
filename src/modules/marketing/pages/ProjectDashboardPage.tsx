import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, MessageSquare, Brain, CalendarDays } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { cn } from '@/design-system/lib/utils';
import { useProject } from '@/modules/marketing/api/use-projects';
import { useThreads, useCreateThread, type Thread } from '@/modules/marketing/api/use-threads';

export default function ProjectDashboardPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: project } = useProject(projectId);
  const { data, isLoading, isError, refetch } = useThreads(projectId);
  const createMutation = useCreateThread(projectId ?? '');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');

  const threads = data?.items ?? [];

  const onCreate = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    try {
      const thread = await createMutation.mutateAsync({ name: name.trim() });
      toast.success('Thread created');
      setDrawerOpen(false);
      setName('');
      void navigate(`/marketing/projects/${projectId}/threads/${thread.id}`);
    } catch (e) {
      toast.error((e as Error).message || 'Failed to create thread');
    }
  };

  const masterContent = (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
        <Link
          to={`/marketing/projects/${projectId}/brand-memory`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-hairline-strong hover:shadow-card"
        >
          <Brain className="size-5 text-muted-foreground" />
          <span className="typo-card-title text-foreground">Brand Memory</span>
        </Link>
        <Link
          to={`/marketing/projects/${projectId}/social`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-hairline-strong hover:shadow-card"
        >
          <CalendarDays className="size-5 text-muted-foreground" />
          <span className="typo-card-title text-foreground">Social Calendar</span>
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="typo-card-title text-foreground">Threads</p>
          <Button size="sm" onClick={() => setDrawerOpen(true)}>
            <Plus className="size-3.5" />New Thread
          </Button>
        </div>
        {isLoading ? (
          <ListSkeleton rows={4} />
        ) : isError ? (
          <ErrorState title="Failed to load threads" onRetry={() => void refetch()} />
        ) : threads.length === 0 ? (
          <EmptyState
            icon={<MessageSquare />}
            title="No threads yet"
            description="Create a thread to start a marketing conversation."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {threads.map((thread: Thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => void navigate(`/marketing/projects/${projectId}/threads/${thread.id}`)}
                className={cn(
                  'flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0',
                  'transition-colors hover:bg-muted/30',
                )}
              >
                <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="font-medium text-foreground truncate">{thread.name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title={project?.name ?? t('marketing.projectDashboardTitle')}
        description={t('marketing.projectDashboardSubtitle')}
      />
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={(o) => { setDrawerOpen(o); if (!o) setName(''); }}
        title="New Thread"
        master={masterContent}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => { setDrawerOpen(false); setName(''); }}>Cancel</Button>
            <Button onClick={() => void onCreate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="th-name">Thread Name *</Label>
            <Input id="th-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
      </DetailDrawer>
    </PageShell>
  );
}
