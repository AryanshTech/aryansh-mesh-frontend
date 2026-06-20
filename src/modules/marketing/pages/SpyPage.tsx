import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EyeIcon, PlusIcon } from 'lucide-react';
import { agentJobsApi, competitorsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { DataTableCard } from '@/modules/marketing/components/dashboard/data-table-card';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { formatDate, t } from '@/core/i18n';
import type { CompetitorResponse } from '@/modules/marketing/types/api';
import { Button } from '@/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
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

export function SpyPage() {
  const { projectId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const [competitors, setCompetitors] = useState<CompetitorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetchWithRetry(
        (token) => competitorsApi.list(token, projectId),
        getToken
      );
      setCompetitors(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId, getToken]);

  const handleRunSpy = async () => {
    setRunning(true);
    try {
      await apiFetchWithRetry(
        (token) =>
          agentJobsApi.trigger(token, projectId, { workflowId: 'RUN_SPY' }),
        getToken
      );
    } finally {
      setRunning(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await apiFetchWithRetry(
        (token) => competitorsApi.create(token, projectId, { name, url }),
        getToken
      );
      setModalOpen(false);
      setName('');
      setUrl('');
      await load();
    } finally {
      setCreating(false);
    }
  };

  return (
    <CrmPageShell>
      <PageHeader
        title={t('spy.title')}
        description={t('spy.subtitle')}
        action={
          canWrite ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
                <PlusIcon data-icon="inline-start" />
                {t('spy.addCompetitor')}
              </Button>
              <Button size="sm" disabled={running} onClick={() => void handleRunSpy()}>
                <EyeIcon data-icon="inline-start" />
                {running ? t('spy.running') : t('spy.runSpy')}
              </Button>
            </div>
          ) : undefined
        }
      />
      {loading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <DataTableCard
          title={t('spy.tableTitle')}
          description={t('spy.tableDescription')}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('spy.tableName')}</TableHead>
                <TableHead>{t('spy.tableUrl')}</TableHead>
                <TableHead>{t('spy.tableLastProfiled')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    {t('spy.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                competitors.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      {c.url ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent-blue)] hover:underline"
                        >
                          {c.url}
                        </a>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.lastProfiledAt ? formatDate(c.lastProfiledAt) : t('spy.never')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DataTableCard>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('spy.addCompetitor')}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="competitorName">{t('spy.competitorName')}</FieldLabel>
              <Input
                id="competitorName"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="competitorUrl">{t('spy.competitorUrl')}</FieldLabel>
              <Input
                id="competitorUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={creating || !name}>
              {creating ? t('companies.creating') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrmPageShell>
  );
}
