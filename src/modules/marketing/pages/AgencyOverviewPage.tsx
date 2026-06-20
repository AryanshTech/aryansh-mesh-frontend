import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2Icon,
  FolderKanbanIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react';
import { StatCard } from '@/modules/marketing/components/dashboard/stat-card';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { FeatureListShell } from '@/shared/components/crm/FeatureListShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { useAgencyCompanies } from '@/modules/marketing/hooks/use-agency-companies';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { formatDate, t } from '@/core/i18n';
import type { CompanyResponse } from '@/modules/marketing/types/api';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
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

export function AgencyOverviewPage() {
  const navigate = useNavigate();
  const { projectsByCompany } = useSidebarNavContext();
  const { data, isLoading } = useAgencyCompanies();
  const companies = data?.items ?? [];

  const projectCount = useMemo(
    () =>
      Object.values(projectsByCompany).reduce(
        (sum, projects) => sum + projects.length,
        0,
      ),
    [projectsByCompany],
  );

  return (
    <CrmPageShell>
      <PageHeader
        description={t('agency.subtitle')}
        action={
          <Button size="sm" asChild>
            <Link to="/marketing/companies">
              <PlusIcon data-icon="inline-start" />
              {t('companies.create')}
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <Empty className="rounded-lg border border-dashed py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2Icon />
            </EmptyMedia>
            <EmptyTitle>{t('agency.emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('agency.emptyDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/marketing/companies">
                <PlusIcon data-icon="inline-start" />
                {t('companies.create')}
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title={t('agency.statCompanies')}
              value={companies.length}
              description={t('agency.statCompaniesHint')}
              icon={Building2Icon}
            />
            <StatCard
              title={t('agency.statNewMonth')}
              value={countNewThisMonth(companies)}
              description={t('agency.statNewMonthHint')}
              icon={SparklesIcon}
            />
            <StatCard
              title={t('agency.statProjects')}
              value={projectCount}
              description={t('agency.statProjectsHint')}
              icon={FolderKanbanIcon}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('agency.spotlightTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="max-w-prose text-sm text-muted-foreground">
                {t('agency.spotlightDescription')}
              </p>
              <Button className="mt-4" asChild>
                <Link to="/marketing/companies">{t('agency.viewCompanies')}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>{t('agency.recentCompanies')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4">
              <FeatureListShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('companies.tableCode')}</TableHead>
                      <TableHead>{t('companies.tableName')}</TableHead>
                      <TableHead>{t('companies.tableCreated')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.slice(0, 5).map((company) => (
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
              </FeatureListShell>
            </CardContent>
          </Card>
        </>
      )}
    </CrmPageShell>
  );
}
