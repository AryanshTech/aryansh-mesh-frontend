import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Building2Icon, FolderKanbanIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { companiesApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { DataTableCard } from '@/modules/marketing/components/dashboard/data-table-card';
import { StatCard } from '@/modules/marketing/components/dashboard/stat-card';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { invalidateCompanies, queryKeys } from '@/modules/marketing/hooks/query-client';
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
  EmptyMedia,
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

function countNewThisMonth(companies: CompanyResponse[]): number {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return companies.filter((c) => new Date(c.createdAt).getTime() >= cutoff).length;
}

export function CompaniesPage() {
  const { getToken, canWrite } = useAuth();
  const navigate = useNavigate();
  const { projectsByCompany, expandCompany } = useSidebarNavContext();

  const companiesQuery = useQuery({
    queryKey: queryKeys.companies,
    queryFn: async () => {
      const res = await apiFetchWithRetry(
        (token) => companiesApi.list(token, 0, 100),
        getToken
      );
      return res.items;
    },
  });

  const companies = companiesQuery.data ?? [];
  const loading = companiesQuery.isLoading;
  const [modalOpen, setModalOpen] = useState(false);
  const [companyCode, setCompanyCode] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const projectCount = useMemo(
    () =>
      Object.values(projectsByCompany).reduce(
        (sum, projects) => sum + projects.length,
        0
      ),
    [projectsByCompany]
  );

  const handleCreate = async () => {
    setCreating(true);
    try {
      const created = await apiFetchWithRetry(
        (token) => companiesApi.create(token, { companyCode, name }),
        getToken
      );
      setModalOpen(false);
      setCompanyCode('');
      setName('');
      invalidateCompanies();
      expandCompany(created.companyId);
    } finally {
      setCreating(false);
    }
  };

  const createButton = canWrite ? (
    <Button size="sm" onClick={() => setModalOpen(true)}>
      <PlusIcon data-icon="inline-start" />
      {t('companies.create')}
    </Button>
  ) : undefined;

  return (
    <CrmPageShell>
      <PageHeader
        title={t('companies.title')}
        description={t('companies.subtitle')}
        action={createButton}
      />
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title={t('companies.statTotal')}
            value={companies.length}
            description={t('companies.statTotalHint')}
            icon={Building2Icon}
          />
          <StatCard
            title={t('companies.statNewMonth')}
            value={countNewThisMonth(companies)}
            description={t('companies.statNewMonthHint')}
            icon={UsersIcon}
          />
          <StatCard
            title={t('companies.statProjects')}
            value={projectCount}
            description={t('companies.statProjectsHint')}
            icon={FolderKanbanIcon}
          />
        </div>
      )}

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : companies.length === 0 ? (
        <Empty className="rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2Icon />
            </EmptyMedia>
            <EmptyTitle>{t('companies.title')}</EmptyTitle>
            <EmptyDescription>{t('companies.empty')}</EmptyDescription>
          </EmptyHeader>
          {canWrite && (
            <Button onClick={() => setModalOpen(true)}>
              {t('companies.create')}
            </Button>
          )}
        </Empty>
      ) : (
        <DataTableCard
          title={t('companies.tableTitle')}
          description={t('companies.tableDescription')}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('companies.tableCode')}</TableHead>
                <TableHead>{t('companies.tableName')}</TableHead>
                <TableHead>{t('companies.tableCreated')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow
                  key={company.companyId}
                  className="cursor-pointer"
                  onClick={() => navigate(`/marketing/companies/${company.companyId}`)}
                >
                  <TableCell className="font-mono text-sm">
                    {company.companyCode}
                  </TableCell>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="font-tabular text-muted-foreground">
                    {formatDate(company.createdAt)}
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
            <DialogTitle>{t('companies.create')}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="companyCode">{t('companies.companyCode')}</FieldLabel>
              <Input
                id="companyCode"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="companyName">{t('companies.companyName')}</FieldLabel>
              <Input
                id="companyName"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !companyCode || !name}
            >
              {creating ? t('companies.creating') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrmPageShell>
  );
}
