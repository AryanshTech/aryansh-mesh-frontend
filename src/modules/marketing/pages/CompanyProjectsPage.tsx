import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, FolderKanban } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CardGridSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { cn } from '@/design-system/lib/utils';
import { useProjects, useCreateProject, type Project } from '@/modules/marketing/api/use-projects';

export default function CompanyProjectsPage() {
  const { t } = useTranslation();
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useProjects(companyId);
  const createMutation = useCreateProject(companyId ?? '');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');

  const projects = data?.items ?? [];

  const onCreate = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    try {
      const project = await createMutation.mutateAsync({ name: name.trim() });
      toast.success('Project created');
      setDrawerOpen(false);
      setName('');
      void navigate(`/marketing/projects/${project.id}`);
    } catch (e) {
      toast.error((e as Error).message || 'Failed to create project');
    }
  };

  const masterContent = (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState title="Failed to load projects" onRetry={() => void refetch()} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban />}
          title="No projects yet"
          description="Create the first project for this company."
          action={<Button onClick={() => setDrawerOpen(true)}><Plus className="size-4" />Add Project</Button>}
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {projects.map((p: Project) => (
            <button
              key={p.id}
              type="button"
              onClick={() => void navigate(`/marketing/projects/${p.id}`)}
              className={cn(
                'flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left',
                'transition-all duration-150 hover:border-hairline-strong hover:shadow-card',
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FolderKanban className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="typo-card-title text-foreground truncate">{p.name}</p>
                <p className="typo-body-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title={t('marketing.projectsTitle')}
        description={t('marketing.projectsSubtitle')}
        actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="size-4" />Add Project</Button>}
      />
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={(o) => { setDrawerOpen(o); if (!o) setName(''); }}
        title="New Project"
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
            <Label htmlFor="proj-name">Project Name *</Label>
            <Input id="proj-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
      </DetailDrawer>
    </PageShell>
  );
}
