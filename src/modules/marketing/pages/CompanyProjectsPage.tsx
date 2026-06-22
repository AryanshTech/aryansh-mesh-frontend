import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRightIcon, FolderKanbanIcon, PlusIcon } from 'lucide-react';
import { companiesApi, projectsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { LinearPageHeader, LinearStatCard } from '@/shared/components/linear';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { invalidateProjects, queryKeys } from '@/modules/marketing/hooks/query-client';
import { formatDate, t } from '@/core/i18n';
import type { CompanyResponse } from '@/modules/marketing/types/api';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import {
  Empty,
  EmptyContent,
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
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';

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
    <CrmPageShell>
      <LinearPageHeader
        title={company?.name ?? t('projects.title')}
        description={t('projects.subtitle', { company: company?.name ?? '' })}
        actions={createButton}
      />
      {loading ? (
        <Skeleton className="h-28 w-full max-w-sm rounded-lg" />
      ) : (
        <div className="grid gap-4 md:max-w-sm">
          <LinearStatCard
            label={t('projects.statTotal')}
            value={projects.length}
            icon={FolderKanbanIcon}
          />
        </div>
      )}

      {loading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : projects.length === 0 ? (
        <Empty className="rounded-lg border border-dashed py-12">
          <EmptyHeader>
            <EmptyTitle>{t('projects.emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('projects.empty')}</EmptyDescription>
          </EmptyHeader>
          {canWrite ? (
            <EmptyContent>
              <Button onClick={() => setModalOpen(true)}>
                {t('projects.create')}
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader dense className="border-b border-border">
            <CardTitle className={cn(typographyClasses.cardTitle, 'text-foreground')}>
              {t('projects.tableTitle')}
            </CardTitle>
            <p className={cn(typographyClasses.bodySm, 'text-muted-foreground')}>
              {t('projects.tableDescription')}
            </p>
          </CardHeader>
          <CardContent dense className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={typographyClasses.eyebrowUpper}>{t('projects.tableName')}</TableHead>
                <TableHead className={typographyClasses.eyebrowUpper}>{t('projects.tableOnboarding')}</TableHead>
                <TableHead className={typographyClasses.eyebrowUpper}>{t('projects.tableCreated')}</TableHead>
                <TableHead className={cn('text-right', typographyClasses.eyebrowUpper)}>
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
          </CardContent>
        </Card>
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
    </CrmPageShell>
  );
}
