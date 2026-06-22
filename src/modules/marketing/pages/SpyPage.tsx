import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EyeIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { agentJobsApi, competitorsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageAsyncShell } from '@/shared/components/crm/PageAsyncShell';
import { LinearPageHeader } from '@/shared/components/linear';
import { formatDate, t } from '@/core/i18n';
import type { CompetitorResponse } from '@/modules/marketing/types/api';
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

export function SpyPage() {
  const { projectId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const [competitors, setCompetitors] = useState<CompetitorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetchWithRetry(
        (token) => competitorsApi.list(token, projectId),
        getToken
      );
      setCompetitors(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.network'));
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
      toast.success(t('spy.runSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.network'));
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
      toast.success(t('spy.createSuccess'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.network'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <CrmPageShell>
      <LinearPageHeader
        title={t('spy.title')}
        description={t('spy.subtitle')}
        actions={
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
      <PageAsyncShell
        loading={loading}
        error={error}
        errorDescription={error ?? undefined}
        onRetry={() => void load()}
        skeleton={<Skeleton className="h-64 w-full rounded-lg" />}
      >
        {competitors.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <EyeIcon />
              </EmptyMedia>
              <EmptyTitle>{t('spy.empty')}</EmptyTitle>
              <EmptyDescription>{t('spy.tableDescription')}</EmptyDescription>
            </EmptyHeader>
            {canWrite ? (
              <EmptyContent>
                <Button size="sm" onClick={() => setModalOpen(true)}>
                  <PlusIcon data-icon="inline-start" />
                  {t('spy.addCompetitor')}
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : (
          <Card className="overflow-hidden">
            <CardHeader dense className="border-b border-border">
              <CardTitle className={cn(typographyClasses.cardTitle, 'text-foreground')}>
                {t('spy.tableTitle')}
              </CardTitle>
              <p className={cn(typographyClasses.bodySm, 'text-muted-foreground')}>
                {t('spy.tableDescription')}
              </p>
            </CardHeader>
            <CardContent dense className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={typographyClasses.eyebrowUpper}>{t('spy.tableName')}</TableHead>
                  <TableHead className={typographyClasses.eyebrowUpper}>{t('spy.tableUrl')}</TableHead>
                  <TableHead className={typographyClasses.eyebrowUpper}>{t('spy.tableLastProfiled')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      {c.url ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/90 hover:underline"
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
                ))}
              </TableBody>
            </Table>
            </CardContent>
          </Card>
        )}
      </PageAsyncShell>

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
