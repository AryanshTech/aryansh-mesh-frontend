import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Edit, RefreshCw, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { contentApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageAsyncShell } from '@/shared/components/crm/PageAsyncShell';
import { LinearPageHeader, LinearQueueList, LinearSplitLayout } from '@/shared/components/linear';
import { safeT, t } from '@/core/i18n';
import type { ContentItemResponse } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent } from '@/design-system/components/ui/card';
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
import { ScrollArea } from '@/design-system/components/ui/scroll-area';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';

export function ContentStudioPage() {
  const { projectId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const [items, setItems] = useState<ContentItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetchWithRetry(
        (token) => contentApi.list(token, projectId),
        getToken,
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

  const pendingItems = useMemo(
    () => items.filter((item) => item.status === 'PENDING_APPROVAL'),
    [items],
  );

  const queueItems = useMemo(
    () =>
      pendingItems.map((item) => ({
        id: item.id,
        eyebrow: safeT(`contentTypes.${item.type}`, item.type),
        title: item.title,
        subtitle: t('linear.studio.agentLabel'),
        timestamp: new Date(item.createdAt).toLocaleDateString(),
      })),
    [pendingItems],
  );

  const selected = pendingItems.find((item) => item.id === (selectedId ?? pendingItems[0]?.id));

  const handleApprove = async (id: string) => {
    setActing(id);
    try {
      await apiFetchWithRetry(
        (token) => contentApi.approve(token, projectId, id),
        getToken,
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
        getToken,
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
    <CrmPageShell mode="viewport" className="gap-4 p-6">
      <LinearPageHeader
        title={t('nav.content')}
        description={t('content.queueDescription')}
      />
      <PageAsyncShell
        loading={loading}
        error={error}
        onRetry={() => void load()}
        skeleton={<Skeleton className="h-64 w-full rounded-lg" />}
      >
        {pendingItems.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles />
              </EmptyMedia>
              <EmptyTitle>{t('content.empty')}</EmptyTitle>
              <EmptyDescription>{t('content.queueDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <LinearSplitLayout
            leftDefaultSize={22}
            rightDefaultSize={28}
            left={
              <LinearQueueList
                title={t('linear.studio.pendingDrafts')}
                count={pendingItems.length}
                items={queueItems}
                activeId={selected?.id}
                onSelect={setSelectedId}
                className="h-full min-h-[560px]"
              />
            }
            center={
              selected ? (
                <div className="flex h-full min-h-[560px] flex-col bg-card">
                  <div className="flex items-center justify-between border-b border-border px-8 py-4">
                    <div>
                      <h2 className={typographyClasses.displayLg}>
                        {t('linear.studio.draftTitle', { title: selected.title })}
                      </h2>
                      <p className={typographyClasses.caption}>{t('linear.studio.reviewingAgent')}</p>
                    </div>
                    {canWrite ? (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit data-icon="inline-start" />
                          {t('linear.studio.edit')}
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw data-icon="inline-start" />
                          {t('linear.studio.regenerate')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={acting === selected.id}
                          onClick={() => openRejectDialog(selected.id)}
                        >
                          <X data-icon="inline-start" />
                          {t('content.rejectConfirm')}
                        </Button>
                        <Button
                          size="sm"
                          disabled={acting === selected.id}
                          onClick={() => void handleApprove(selected.id)}
                        >
                          <Check data-icon="inline-start" />
                          {t('content.approve')}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  <ScrollArea className="flex-1 scrollbar-linear">
                    <div className="mx-auto max-w-3xl p-8">
                      <Card>
                        <CardContent dense className="prose prose-sm max-w-none pt-6 dark:prose-invert">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                            {selected.contentMarkdown || t('linear.studio.noContent')}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </div>
              ) : null
            }
            right={
              <div className="flex h-full min-h-[560px] flex-col border-l border-border bg-background">
                <div className="border-b border-border px-4 py-4">
                  <h3 className={cn(typographyClasses.eyebrow, 'flex items-center gap-2 text-foreground')}>
                    {t('linear.studio.intelligenceContext')}
                  </h3>
                </div>
                <ScrollArea className="flex-1 scrollbar-linear">
                  <div className="flex flex-col gap-6 p-4">
                    <section>
                      <h4 className={typographyClasses.eyebrowUpper}>{t('linear.studio.brandMemory')}</h4>
                      <Card className="mt-3">
                        <CardContent dense className="text-xs text-muted-foreground">
                          {t('linear.studio.brandVoiceHint')}
                        </CardContent>
                      </Card>
                    </section>
                    <section>
                      <h4 className={typographyClasses.eyebrowUpper}>{t('linear.studio.systemInstructions')}</h4>
                      <Card className="mt-3 font-mono text-xs">
                        <CardContent dense>{t('linear.studio.systemInstructionsPreview')}</CardContent>
                      </Card>
                    </section>
                    <section>
                      <h4 className={typographyClasses.eyebrowUpper}>{t('linear.studio.gtmSignals')}</h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline">SaaS</Badge>
                        <Badge variant="outline">Agentic</Badge>
                      </div>
                    </section>
                  </div>
                </ScrollArea>
              </div>
            }
          />
        )}
      </PageAsyncShell>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('content.rejectDialogTitle')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
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
