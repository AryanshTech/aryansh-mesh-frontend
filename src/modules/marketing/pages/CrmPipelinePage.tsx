import { useCallback, useEffect, useMemo, useState } from 'react';
import { BriefcaseIcon, UsersIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { contactsApi, dealsApi, projectsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { KanbanBoard } from '@/modules/marketing/components/studio/KanbanBoard';
import { DataTableCard } from '@/modules/marketing/components/dashboard/data-table-card';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageAsyncShell } from '@/shared/components/crm/PageAsyncShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { formatDate, t } from '@/core/i18n';
import type { ContactResponse, DealResponse, DealStage } from '@/modules/marketing/types/api';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';

const DEAL_STAGES: DealStage[] = [
  'LEAD',
  'QUALIFIED',
  'PROPOSAL',
  'WON',
  'LOST',
];

export function CrmPipelinePage() {
  const { projectId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingDeal, setMovingDeal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const project = await apiFetchWithRetry(
        (token) => projectsApi.get(token, projectId),
        getToken
      );
      setCompanyId(project.companyId);
      const [contactsRes, dealsRes] = await Promise.all([
        apiFetchWithRetry(
          (token) => contactsApi.list(token, project.companyId),
          getToken
        ),
        apiFetchWithRetry(
          (token) => dealsApi.list(token, project.companyId),
          getToken
        ),
      ]);
      setContacts(contactsRes);
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

  const dealColumns = useMemo(
    () =>
      DEAL_STAGES.map((id) => ({
        id,
        title: t(`dealStages.${id}`),
      })),
    []
  );

  const dealItems = useMemo(
    () =>
      deals.map((deal) => ({
        id: deal.id,
        columnId: deal.stage,
        title: deal.name,
        subtitle: new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'USD',
        }).format(deal.value),
      })),
    [deals]
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
        getToken
      );
      toast.success(t('crm.moveSuccess'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.network'));
    } finally {
      setMovingDeal(false);
    }
  };

  const skeleton = <Skeleton className="h-64 w-full rounded-lg" />;

  return (
    <CrmPageShell>
      <PageHeader description={t('crm.subtitle')} />
      <PageAsyncShell
        loading={loading}
        error={error}
        errorDescription={error ?? undefined}
        onRetry={() => void load()}
        skeleton={skeleton}
      >
        <Tabs defaultValue="contacts">
          <TabsList className="flex-wrap">
            <TabsTrigger value="contacts">{t('crm.contactsTab')}</TabsTrigger>
            <TabsTrigger value="deals">{t('crm.dealsTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <DataTableCard
              title={t('crm.contactsTitle')}
              description={t('crm.contactsDescription')}
            >
              {contacts.length === 0 ? (
                <Empty className="border-0 py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <UsersIcon />
                    </EmptyMedia>
                    <EmptyTitle>{t('crm.contactsEmptyTitle')}</EmptyTitle>
                    <EmptyDescription>{t('crm.contactsEmpty')}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('crm.tableName')}</TableHead>
                      <TableHead>{t('crm.tableEmail')}</TableHead>
                      <TableHead>{t('crm.tableRole')}</TableHead>
                      <TableHead>{t('crm.tableCreated')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact, index) => (
                      <TableRow
                        key={contact.id}
                        className="stagger-item"
                        style={{ ['--stagger-delay' as string]: `${index * 40}ms` }}
                      >
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.email || '—'}</TableCell>
                        <TableCell>{contact.role || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(contact.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DataTableCard>
          </TabsContent>

          <TabsContent value="deals">
            <DataTableCard
              title={t('crm.dealsTitle')}
              description={t('crm.dealsDescription', { companyId: companyId ?? '' })}
            >
              {deals.length === 0 ? (
                <Empty className="border-0 py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BriefcaseIcon />
                    </EmptyMedia>
                    <EmptyTitle>{t('crm.dealsEmptyTitle')}</EmptyTitle>
                    <EmptyDescription>{t('crm.dealsEmpty')}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="px-2 pb-4">
                  <KanbanBoard
                    columns={dealColumns}
                    items={dealItems}
                    disabled={!canWrite || movingDeal}
                    onMove={(itemId, toColumnId) =>
                      void handleMoveDeal(itemId, toColumnId)
                    }
                  />
                </div>
              )}
            </DataTableCard>
          </TabsContent>
        </Tabs>
      </PageAsyncShell>
    </CrmPageShell>
  );
}
