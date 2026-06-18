import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRightIcon, FolderKanbanIcon, PlusIcon } from 'lucide-react';
import { companiesApi, projectsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { DataTableCard } from '@/modules/marketing/components/dashboard/data-table-card';
import { StatCard } from '@/modules/marketing/components/dashboard/stat-card';
import { PageShell } from '@/modules/marketing/components/layout/page-shell';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { invalidateProjects, queryKeys } from '@/modules/marketing/hooks/query-client';
import { formatDate, t } from '@/core/i18n';
import type { CompanyResponse } from '@/modules/marketing/types/api';
import { Button } from '@/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import { Field, FieldGroup, FieldLabel } from '@/design-system/components/ui/field';
import { Input } from '@/design-system/components/ui/input';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';

export function CompanyProjectsPage() {
  const { companyId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const navigate = useNavigate();
  const { expandCompany } = useSidebarNavContext();
  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [creating, setCreating] = useState(false);

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects(companyId),
    queryFn: () =>
      apiFetchWithRetry(
        (token) => projectsApi.listByCompany(token, companyId),
        getToken
      ),
    enabled: !!companyId,
  });

  const projects = projectsQuery.data ?? [];
  const loading = projectsQuery.isLoading || !company;

  const loadCompany = async () => {
    const companyRes = await apiFetchWithRetry(
      (token) => companiesApi.get(token, companyId),
      getToken
    );
    setCompany(companyRes);
  };

  useEffect(() => {
    void loadCompany();
  }, [companyId, getToken]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const project = await apiFetchWithRetry(
        (token) => projectsApi.create(token, companyId, { name: projectName }),
        getToken
      );
      setModalOpen(false);
      setProjectName('');
      invalidateProjects(companyId);
      expandCompany(companyId);
      navigate(`/marketing/projects/${project.projectId}/studio`);
    } finally {
      setCreating(false);
    }
  };

  const createButton = canWrite ? (
    <Button size="sm" onClick={() => setModalOpen(true)}>
      <PlusIcon data-icon="inline-start" />
      {t('projects.create')}
    </Button>
  ) : undefined;

  return (
    <PageShell
      scrollable
      title={t('projects.title')}
      description={t('projects.subtitle', { company: company?.name ?? '' })}
      headerActions={createButton}
    >
      {loading ? (
        <Skeleton className="h-28 w-full max-w-sm rounded-xl" />
      ) : (
        <div className="grid gap-4 md:max-w-sm">
          <StatCard
            title={t('projects.statTotal')}
            value={projects.length}
            description={t('projects.statTotalHint')}
            icon={FolderKanbanIcon}
          />
        </div>
      )}

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : projects.length === 0 ? (
        <Empty className="rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyTitle>{t('projects.title')}</EmptyTitle>
            <EmptyDescription>{t('projects.empty')}</EmptyDescription>
          </EmptyHeader>
          {canWrite && (
            <Button onClick={() => setModalOpen(true)}>
              {t('projects.create')}
            </Button>
          )}
        </Empty>
      ) : (
        <DataTableCard
          title={t('projects.tableTitle')}
          description={t('projects.tableDescription')}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('projects.tableName')}</TableHead>
                <TableHead>{t('projects.tableOnboarding')}</TableHead>
                <TableHead>{t('projects.tableCreated')}</TableHead>
                <TableHead className="text-right">
                  {t('projects.tableActions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.projectId}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t(`onboardingStatus.${project.onboardingStatus}`)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(project.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/marketing/projects/${project.projectId}`}>
                        {t('projects.open')}
                        <ArrowRightIcon data-icon="inline-end" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableCard>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('projects.create')}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="projectName">
                {t('projects.projectName')}
              </FieldLabel>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !projectName}
            >
              {creating ? t('companies.creating') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
