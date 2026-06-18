import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckIcon, XIcon } from 'lucide-react';
import { contentApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { DataTableCard } from '@/modules/marketing/components/dashboard/data-table-card';
import { PageShell } from '@/modules/marketing/components/layout/page-shell';
import { t } from '@/core/i18n';
import type { ContentItemResponse } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
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
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetchWithRetry(
        (token) => contentApi.list(token, projectId),
        getToken
      );
      setItems(res);
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
      await load();
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id: string) => {
    const feedback =
      window.prompt(t('content.rejectPrompt')) ?? t('content.rejectDefault');
    if (!feedback.trim()) return;

    setActing(id);
    try {
      await apiFetchWithRetry(
        (token) =>
          contentApi.reject(token, projectId, id, { feedback: feedback.trim() }),
        getToken
      );
      await load();
    } finally {
      setActing(null);
    }
  };

  return (
    <PageShell
      scrollable
      title={t('content.title')}
      description={t('content.subtitle')}
    >
      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
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
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {t('content.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{t(`contentTypes.${item.type}`)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`contentStatus.${item.status}`)}
                      </Badge>
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
                            onClick={() => void handleReject(item.id)}
                          >
                            <XIcon data-icon="inline-start" />
                            {t('content.reject')}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DataTableCard>
      )}
    </PageShell>
  );
}
