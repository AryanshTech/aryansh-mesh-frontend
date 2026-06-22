import { useCallback, useEffect, useMemo, useState } from 'react';
import { Briefcase, Plus, Search } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { dealsApi, projectsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { KanbanBoard } from '@/modules/marketing/components/studio/KanbanBoard';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageAsyncShell } from '@/shared/components/crm/PageAsyncShell';
import { LinearFilterBar, LinearPageHeader } from '@/shared/components/linear';
import { t } from '@/core/i18n';
import type { DealResponse, DealStage } from '@/modules/marketing/types/api';
import { Button } from '@/design-system/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import { Input } from '@/design-system/components/ui/input';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';

const DEAL_STAGES: DealStage[] = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

const STAGE_LABEL_KEYS: Record<DealStage, string> = {
  LEAD: 'dealStages.LEAD',
  QUALIFIED: 'dealStages.QUALIFIED',
  PROPOSAL: 'dealStages.PROPOSAL',
  WON: 'linear.crm.archiveWon',
  LOST: 'linear.crm.archiveLost',
};

export function CrmPipelinePage() {
  const { projectId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingDeal, setMovingDeal] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const project = await apiFetchWithRetry(
        (token) => projectsApi.get(token, projectId),
        getToken,
      );
      setCompanyId(project.companyId);
      const [dealsRes] = await Promise.all([
        apiFetchWithRetry(
          (token) => dealsApi.list(token, project.companyId),
          getToken,
        ),
      ]);
      setDeals(dealsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.network'));
    } finally {
      setLoading(false);
    }
  }, [projectId, getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredDeals = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return deals;
    return deals.filter((deal) => deal.name.toLowerCase().includes(query));
  }, [deals, search]);

  const dealColumns = useMemo(
    () =>
      DEAL_STAGES.map((id) => ({
        id,
        title: t(STAGE_LABEL_KEYS[id]),
      })),
    [],
  );

  const dealItems = useMemo(
    () =>
      filteredDeals.map((deal) => {
        const formatted = new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'USD',
        }).format(deal.value);
        const archived = deal.stage === 'WON' || deal.stage === 'LOST';
        return {
          id: deal.id,
          columnId: deal.stage,
          title: deal.name,
          contact: t('linear.crm.dealOwner'),
          value: formatted,
          priority: deal.value >= 50000 ? ('high' as const) : deal.value >= 10000 ? ('medium' as const) : ('low' as const),
          priorityLabel: deal.value >= 50000 ? t('linear.crm.priorityHigh') : undefined,
          aiInsight: deal.stage === 'PROPOSAL' ? t('linear.crm.aiProbability', { pct: 72 }) : undefined,
          avatars: [deal.name.slice(0, 2).toUpperCase()],
          archived,
        };
      }),
    [filteredDeals],
  );

  const handleMoveDeal = async (dealId: string, toColumnId: string) => {
    if (!companyId) return;
    setMovingDeal(true);
    try {
      await apiFetchWithRetry(
        (token) =>
          dealsApi.patchStage(token, companyId, dealId, {
            stage: toColumnId as DealStage,
          }),
        getToken,
      );
      toast.success(t('crm.moveSuccess'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.network'));
    } finally {
      setMovingDeal(false);
    }
  };

  const pipelineTotal = useMemo(
    () =>
      new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', notation: 'compact' }).format(
        deals.reduce((sum, d) => sum + d.value, 0),
      ),
    [deals],
  );

  const skeleton = <Skeleton className="h-64 w-full rounded-lg" />;

  return (
    <CrmPageShell mode="viewport" className="gap-6 p-6">
      <LinearPageHeader
        title={t('crm.dealsTitle')}
        description={t('crm.subtitle')}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('linear.crm.searchDeals')}
                className={cn('h-9 w-56 pl-9', typographyClasses.bodySm)}
              />
            </div>
            <Button size="sm">
              <Plus data-icon="inline-start" />
              {t('linear.crm.createDeal')}
            </Button>
          </div>
        }
      />
      <PageAsyncShell
        loading={loading}
        error={error}
        errorDescription={error ?? undefined}
        onRetry={() => void load()}
        skeleton={skeleton}
      >
        <LinearFilterBar
          chips={[
            { id: 'owner', label: t('linear.crm.owner'), value: t('linear.crm.allAgents') },
            { id: 'date', label: t('linear.crm.date'), value: t('linear.crm.last30Days') },
          ]}
          trailing={<span className={cn(typographyClasses.mono, 'text-primary')}>{pipelineTotal}</span>}
        />

        {deals.length === 0 ? (
          <Empty className="border border-border py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Briefcase />
              </EmptyMedia>
              <EmptyTitle>{t('crm.dealsEmptyTitle')}</EmptyTitle>
              <EmptyDescription>{t('crm.dealsEmpty')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden">
            <KanbanBoard
              columns={dealColumns}
              items={dealItems}
              disabled={!canWrite || movingDeal}
              onMove={(itemId, toColumnId) => void handleMoveDeal(itemId, toColumnId)}
            />
          </div>
        )}
      </PageAsyncShell>
    </CrmPageShell>
  );
}
