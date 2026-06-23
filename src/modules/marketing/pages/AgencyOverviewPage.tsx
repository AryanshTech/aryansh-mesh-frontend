import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CardGridSkeleton } from '@/shared/components/Skeletons';
import { cn } from '@/design-system/lib/utils';
import { useCompanies, type Company } from '@/modules/marketing/api/use-companies';

export default function AgencyOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useCompanies();
  const companies = data?.items ?? [];

  return (
    <PageShell>
      <PageHeader
        title={t('marketing.overviewTitle')}
        description={t('marketing.overviewSubtitle')}
      />
      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState title="Failed to load companies" onRetry={() => void refetch()} />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={<Building2 />}
          title="No companies yet"
          description="Go to Companies to add your first one."
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {companies.map((c: Company) => (
            <button
              key={c.id}
              type="button"
              onClick={() => void navigate(`/marketing/companies/${c.id}`)}
              className={cn(
                'flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left',
                'transition-all duration-150 hover:border-hairline-strong hover:shadow-card',
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Building2 className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="typo-card-title text-foreground truncate">{c.name}</p>
                <p className="typo-body-sm text-muted-foreground">
                  Created {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </PageShell>
  );
}
