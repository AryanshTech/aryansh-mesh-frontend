import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2Icon,
  FolderKanbanIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react';
import { companiesApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { StatCard } from '@/modules/marketing/components/dashboard/stat-card';
import { PageShell } from '@/modules/marketing/components/layout/page-shell';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { formatDate, t } from '@/core/i18n';
import type { CompanyResponse } from '@/modules/marketing/types/api';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
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
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { projectsByCompany } = useSidebarNavContext();
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const projectCount = useMemo(
    () =>
      Object.values(projectsByCompany).reduce(
        (sum, projects) => sum + projects.length,
        0
      ),
    [projectsByCompany]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiFetchWithRetry(
          (token) => companiesApi.list(token),
          getToken
        );
        setCompanies(res.items);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [getToken]);

  return (
    <PageShell
      scrollable
      title={t('agency.title')}
      description={t('agency.subtitle')}
      headerActions={
        <Button size="sm" asChild>
          <Link to="/marketing/companies">
            <PlusIcon data-icon="inline-start" />
            {t('companies.create')}
          </Link>
        </Button>
      }
    >
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
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
      )}

      <div className="spotlight-card p-6">
        <h2 className="font-display text-xl font-semibold">{t('agency.spotlightTitle')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('agency.spotlightDescription')}</p>
        <Button className="mt-4" asChild>
          <Link to="/marketing/companies">{t('agency.viewCompanies')}</Link>
        </Button>
      </div>

      {!loading && companies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('agency.recentCompanies')}</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableCell className="text-muted-foreground">
                      {formatDate(company.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
