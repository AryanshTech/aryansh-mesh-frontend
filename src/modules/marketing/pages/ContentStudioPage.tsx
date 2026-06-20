import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckIcon, FileTextIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { contentApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { DataTableCard } from '@/modules/marketing/components/dashboard/data-table-card';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageAsyncShell } from '@/shared/components/crm/PageAsyncShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { t } from '@/core/i18n';
import type { ContentItemResponse } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';

export function ContentStudioPage() {
  const { projectId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const [items, setItems] = useState<ContentItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetchWithRetry(
        (token) => contentApi.list(token, projectId),
        getToken
      );
      setItems(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.network'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId, getToken]);

  const handleApprove = async (id: string) => {
    setActing(id);
    try {
      await apiFetchWithRetry(
        (token) => contentApi.approve(token, projectId, id),
        getToken
      );
      toast.success(t('content.approveSuccess'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.network'));
    } finally {
      setActing(null);
    }
  };

  const openRejectDialog = (id: string) => {
    setRejectTargetId(id);
    setRejectFeedback(t('content.rejectDefault'));
    setRejectOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTargetId || !rejectFeedback.trim()) return;
    setActing(rejectTargetId);
    try {
      await apiFetchWithRetry(
        (token) =>
          contentApi.reject(token, projectId, rejectTargetId, {
            feedback: rejectFeedback.trim(),
          }),
        getToken
      );
      toast.success(t('content.rejectSuccess'));
      setRejectOpen(false);
      setRejectTargetId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.network'));
    } finally {
      setActing(null);
    }
  };

  return (
    <CrmPageShell>
      <PageHeader description={t('content.subtitle')} />
      <PageAsyncShell
        loading={loading}
        error={error}
        onRetry={() => void load()}
        skeleton={<Skeleton className="h-64 w-full rounded-lg" />}
      >
        {items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileTextIcon />
              </EmptyMedia>
              <EmptyTitle>{t('content.empty')}</EmptyTitle>
              <EmptyDescription>{t('content.queueDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <DataTableCard
            title={t('content.queueTitle')}
            description={t('content.queueDescription')}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('content.tableTitle')}</TableHead>
                  <TableHead>{t('content.tableType')}</TableHead>
                  <TableHead>{t('content.tableStatus')}</TableHead>
                  <TableHead className="text-right">{t('content.tableActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{t(`contentTypes.${item.type}`)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(`contentStatus.${item.status}`)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canWrite && item.status === 'PENDING_APPROVAL' && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            disabled={acting === item.id}
                            onClick={() => void handleApprove(item.id)}
                          >
                            <CheckIcon data-icon="inline-start" />
                            {t('content.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={acting === item.id}
                            onClick={() => openRejectDialog(item.id)}
                          >
                            <XIcon data-icon="inline-start" />
                            {t('content.reject')}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableCard>
        )}
      </PageAsyncShell>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('content.rejectDialogTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-feedback">{t('content.rejectPrompt')}</Label>
            <Input
              id="reject-feedback"
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectFeedback.trim() || acting !== null}
              onClick={() => void handleRejectConfirm()}
            >
              {t('content.rejectConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrmPageShell>
  );
}
