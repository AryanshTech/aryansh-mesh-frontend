import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { contactsApi, dealsApi, projectsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { KanbanBoard } from '@/modules/marketing/components/studio/KanbanBoard';
import { DataTableCard } from '@/modules/marketing/components/dashboard/data-table-card';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { formatDate, t } from '@/core/i18n';
import type { ContactResponse, DealResponse, DealStage } from '@/modules/marketing/types/api';
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
  const [movingDeal, setMovingDeal] = useState(false);

  const load = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId, getToken]);

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
      await load();
    } finally {
      setMovingDeal(false);
    }
  };

  return (
    <CrmPageShell>
      <PageHeader description={t('crm.subtitle')} />
      {loading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
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
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        {t('crm.contactsEmpty')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.email || '—'}</TableCell>
                        <TableCell>{contact.role || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(contact.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </DataTableCard>
          </TabsContent>

          <TabsContent value="deals">
            <DataTableCard
              title={t('crm.dealsTitle')}
              description={t('crm.dealsDescription', { companyId: companyId ?? '' })}
            >
              {deals.length === 0 ? (
                <p className="px-6 pb-6 text-sm text-muted-foreground">
                  {t('crm.dealsEmpty')}
                </p>
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
      )}
    </CrmPageShell>
  );
}
