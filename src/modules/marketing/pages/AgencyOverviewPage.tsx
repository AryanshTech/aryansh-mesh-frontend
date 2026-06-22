import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { useAgencyCompanies } from '@/modules/marketing/hooks/use-agency-companies';
import { t } from '@/core/i18n';
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
import { Avatar, AvatarFallback } from '@/design-system/components/ui/avatar';
import {
  LinearInsightBanner,
  LinearPageHeader,
  LinearProgressBar,
} from '@/shared/components/linear';
import { layout } from '@/design-system/tokens/layout';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';

const PHASES = ['spy', 'write', 'film', 'publish'] as const;
const PHASE_PROGRESS = [100, 65, 0, 0];

export function AgencyOverviewPage() {
  const { data, isLoading } = useAgencyCompanies();
  const companies = data?.items ?? [];

  return (
    <CrmPageShell>
      <LinearPageHeader
        title={t('linear.overview.title')}
        description={t('agency.subtitle')}
        metaPills={[
          { id: 'ai', label: t('linear.overview.aiCapacity'), value: '84%', variant: 'primary' },
          { id: 'risks', label: t('linear.overview.activeRisks'), value: '2', variant: 'warning' },
        ]}
        actions={
          <Button size="sm" asChild>
            <Link to="/marketing/companies">
              <Plus data-icon="inline-start" />
              {t('companies.create')}
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : companies.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>{t('agency.emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('agency.emptyDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/marketing/companies">
                <Plus data-icon="inline-start" />
                {t('companies.create')}
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className={layout.dashboard.bentoGrid}>
            <Card className={cn(layout.linear.hairlineCard, 'col-span-12 lg:col-span-8')}>
              <CardHeader dense className="flex-row items-center justify-between border-b border-border">
                <CardTitle>{t('linear.overview.gtmProgress')}</CardTitle>
                <span className={cn('rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5', typographyClasses.caption, 'text-primary')}>
                  {t('linear.overview.liveBadge')}
                </span>
              </CardHeader>
              <CardContent dense className="flex flex-col gap-8">
                {companies.slice(0, 2).map((company, index) => (
                  <div key={company.companyId}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
                          <Building2 className="text-muted-foreground" />
                        </div>
                        <div>
                          <Link
                            to={`/marketing/companies/${company.companyId}`}
                            className="font-semibold hover:text-primary"
                          >
                            {company.name}
                          </Link>
                          <p className={typographyClasses.eyebrowUpper}>{company.companyCode}</p>
                        </div>
                      </div>
                      <div className={cn('flex gap-8', typographyClasses.mono, 'text-muted-foreground')}>
                        <div className="text-right">
                          <span className="block uppercase">{t('linear.overview.health')}</span>
                          <span className={index === 1 ? 'text-warning' : 'text-primary'}>
                            {index === 1 ? '72.1%' : '98.4%'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block uppercase">{t('linear.overview.budget')}</span>
                          <span>{index === 1 ? '$42k' : '$128k'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {PHASES.map((phase, phaseIndex) => (
                        <div
                          key={phase}
                          className={cn(
                            'relative flex h-12 flex-col justify-center overflow-hidden rounded-md border border-border px-2',
                            phaseIndex < 2 ? 'bg-muted text-primary' : 'bg-card text-muted-foreground',
                          )}
                        >
                          <span className={typographyClasses.eyebrowUpper}>{t(`linear.project.phases.${phase}`)}</span>
                          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-border">
                            <div
                              className={cn('h-full', phaseIndex < 2 ? 'bg-primary' : 'bg-transparent')}
                              style={{ width: `${PHASE_PROGRESS[phaseIndex]}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={cn(layout.linear.hairlineCard, 'col-span-12 flex flex-col lg:col-span-4')}>
              <CardHeader dense>
                <CardTitle>{t('linear.overview.crmPipeline')}</CardTitle>
              </CardHeader>
              <CardContent dense className="flex flex-1 flex-col gap-6">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className={typographyClasses.eyebrowUpper}>{t('linear.overview.totalPipeline')}</p>
                  <p className={cn(typographyClasses.displayMd, typographyClasses.tabular)}>$1.24M</p>
                </div>
                <LinearProgressBar label={t('linear.overview.proposalSent')} value={65} displayValue="$450k" />
                <LinearProgressBar label={t('linear.overview.negotiation')} value={30} displayValue="$210k" />
                <LinearProgressBar label={t('linear.overview.discovery')} value={85} displayValue="$580k" />
                <div>
                  <p className={cn('mb-2', typographyClasses.eyebrowUpper, 'text-muted-foreground')}>
                    {t('linear.overview.hotLeads')}
                  </p>
                  <div className="flex -space-x-2">
                    {['JD', 'AM', 'SK'].map((initials) => (
                      <Avatar key={initials} className="size-8 border border-border">
                        <AvatarFallback className={typographyClasses.caption}>{initials}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <LinearInsightBanner
            title={t('linear.overview.strategicInsight')}
            description={t('linear.overview.strategicInsightDescription')}
            primaryAction={{ label: t('linear.catalog.acceptRecommendation'), onClick: () => {} }}
            secondaryAction={{ label: t('linear.catalog.dismiss'), onClick: () => {} }}
          />

          <Card className={layout.linear.hairlineCard}>
            <CardHeader dense className="flex-row items-center justify-between">
              <CardTitle>{t('linear.overview.clientHealth')}</CardTitle>
            </CardHeader>
            <CardContent dense>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {companies.slice(0, 6).map((company, index) => (
                  <Link
                    key={company.companyId}
                    to={`/marketing/companies/${company.companyId}`}
                    className="rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:border-primary"
                  >
                    <p className="font-semibold text-sm">{company.name}</p>
                    <div className={cn('mt-3 h-0.5 w-full', index === 2 ? 'bg-warning' : 'bg-primary')} />
                    <div className={cn('mt-3 flex items-center justify-between', typographyClasses.mono, 'text-muted-foreground')}>
                      <span>${((index + 1) * 24.5).toFixed(1)}k</span>
                      <TrendingUp className="size-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className={cn('flex items-center justify-between border-t border-border pt-4', typographyClasses.caption, 'text-muted-foreground')}>
            <span>{t('linear.overview.systemNominal')}</span>
            <span className={cn('rounded border border-border bg-muted px-2 py-0.5', typographyClasses.mono)}>v2.4.0</span>
          </div>
        </>
      )}
    </CrmPageShell>
  );
}
