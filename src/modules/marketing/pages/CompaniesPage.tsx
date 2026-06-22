import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2Icon, FolderKanbanIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { companiesApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { LinearPageHeader, LinearStatCard } from '@/shared/components/linear';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { invalidateCompanies, queryKeys } from '@/modules/marketing/hooks/query-client';
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
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';

function countNewThisMonth(companies: CompanyResponse[]): number {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return companies.filter((c) => new Date(c.createdAt).getTime() >= cutoff).length;
}

export function CompaniesPage() {
  const { getToken, canWrite } = useAuth();
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
      <LinearPageHeader
        title={t('nav.companies')}
        description={t('companies.subtitle')}
        actions={createButton}
      />
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <LinearStatCard
            label={t('companies.statTotal')}
            value={companies.length}
            icon={Building2Icon}
          />
          <LinearStatCard
            label={t('companies.statNewMonth')}
            value={countNewThisMonth(companies)}
            icon={UsersIcon}
          />
          <LinearStatCard
            label={t('companies.statProjects')}
            value={projectCount}
            icon={FolderKanbanIcon}
          />
        </div>
      )}

      {loading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : companies.length === 0 ? (
        <Empty className="rounded-lg border border-dashed py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2Icon />
            </EmptyMedia>
            <EmptyTitle>{t('companies.emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('companies.empty')}</EmptyDescription>
          </EmptyHeader>
          {canWrite ? (
            <EmptyContent>
              <Button onClick={() => setModalOpen(true)}>
                {t('companies.create')}
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader dense className="border-b border-border">
            <CardTitle className={cn(typographyClasses.cardTitle, 'text-foreground')}>
              {t('companies.tableTitle')}
            </CardTitle>
            <p className={cn(typographyClasses.bodySm, 'text-muted-foreground')}>
              {t('companies.tableDescription')}
            </p>
          </CardHeader>
          <CardContent dense className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={typographyClasses.eyebrowUpper}>{t('companies.tableCode')}</TableHead>
                <TableHead className={typographyClasses.eyebrowUpper}>{t('companies.tableName')}</TableHead>
                <TableHead className={typographyClasses.eyebrowUpper}>{t('companies.tableCreated')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.companyId}>
                  <TableCell className="font-mono text-sm">
                    <Link
                      to={`/marketing/companies/${company.companyId}`}
                      className="font-medium text-foreground hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                    >
                      {company.companyCode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/marketing/companies/${company.companyId}`}
                      className="font-medium text-foreground hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                    >
                      {company.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-tabular text-muted-foreground">
                    {formatDate(company.createdAt)}
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
