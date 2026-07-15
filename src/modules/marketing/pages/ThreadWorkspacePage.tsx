import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Briefcase, Loader2, Send } from 'lucide-react';
import { ApiError } from '@/core/api/client';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState } from '@/shared/components/ErrorState';
import { Button } from '@/design-system/components/ui/button';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { cn } from '@/design-system/lib/utils';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import { MarketingBackLink } from '@/modules/marketing/components/MarketingBackLink';
import { useMarketingProjectGuard } from '@/modules/marketing/hooks/use-marketing-project-guard';
import { useMessages, useSendMessage, type Message } from '@/modules/marketing/api/use-threads';

function createOptimisticUserMessage(content: string): Message {
  return {
    id: `temp-user-${Date.now()}`,
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
  };
}

function createOptimisticAssistantMessage(messageId: string): Message {
  return {
    id: messageId,
    role: 'assistant',
    content: '',
    createdAt: new Date().toISOString(),
  };
}

export default function ThreadWorkspacePage() {
  const { t } = useTranslation();
  const { projectId: urlProjectId, threadId } = useParams<{ projectId: string; threadId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { tenantId } = useTenantPath();
  const {
    projectId,
    isResolving,
    projectMismatch,
    queriesEnabled,
  } = useMarketingProjectGuard(tenantId, urlProjectId);

  const { data, isLoading, isError, refetch, error } = useMessages(threadId, tenantId, {
    enabled: queriesEnabled,
  });
  const sendMutation = useSendMessage(threadId ?? '', tenantId);

  const [text, setText] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialPromptSent = useRef(false);

  useEffect(() => {
    // Do not clobber in-flight stream tokens with a stale cache snapshot.
    if (streaming || sendMutation.isPending) return;
    if (data?.items) {
      setLocalMessages(data.items);
    }
  }, [data?.items, streaming, sendMutation.isPending]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages.length, streaming]);

  const onSend = useCallback(async (overrideContent?: string) => {
    const trimmed = (overrideContent ?? text).trim();
    if (!trimmed || !threadId || !tenantId || !queriesEnabled) return;

    if (!overrideContent) setText('');
    setLocalMessages((prev) => [...prev, createOptimisticUserMessage(trimmed)]);
    setStreaming(true);

    let assistantId = '';
    let assistantContent = '';
    let sawAssistant = false;

    try {
      await sendMutation.mutateAsync({
        content: trimmed,
        onEvent: (event, payload) => {
          if (event === 'message_start') {
            const start = payload as { messageId: string };
            assistantId = start.messageId;
            sawAssistant = true;
            setLocalMessages((prev) => [...prev, createOptimisticAssistantMessage(assistantId)]);
          }

          if (event === 'token' && assistantId) {
            const tokenEvent = payload as { text: string };
            assistantContent += tokenEvent.text;
            setLocalMessages((prev) =>
              prev.map((message) =>
                message.id === assistantId ? { ...message, content: assistantContent } : message,
              ),
            );
          }

          if (event === 'error') {
            const err = payload as { code?: string; message: string };
            const message =
              err.code === 'VERTEX_ERROR'
                ? t('marketing.threads.vertexUnavailable')
                : err.message || t('marketing.threads.sendFailed');
            toast.error(message);
          }
        },
      });

      if (!sawAssistant || !assistantContent.trim()) {
        toast.error(t('marketing.threads.emptyReply'));
      }
    } catch (e) {
      const status = e instanceof ApiError ? e.status : undefined;
      const fallback =
        status === 503
          ? t('marketing.threads.serviceUnavailable')
          : t('marketing.threads.sendFailed');
      toast.error((e as Error).message || fallback);
      if (!overrideContent) setText(trimmed);
      setLocalMessages((prev) =>
        prev.filter((message) => !message.id.startsWith('temp-user-') && message.id !== assistantId),
      );
    } finally {
      setStreaming(false);
    }
  }, [queriesEnabled, sendMutation, t, tenantId, text, threadId]);

  const isSending = sendMutation.isPending || streaming;

  useEffect(() => {
    const initialPrompt = (location.state as { initialPrompt?: string } | null)?.initialPrompt;
    if (
      !initialPrompt ||
      initialPromptSent.current ||
      isLoading ||
      isSending ||
      !queriesEnabled ||
      !tenantId
    ) {
      return;
    }
    initialPromptSent.current = true;
    // Drop one-shot navigation state so refresh does not resend.
    navigate(location.pathname, { replace: true, state: null });
    void onSend(initialPrompt);
  }, [
    isLoading,
    isSending,
    location.pathname,
    location.state,
    navigate,
    onSend,
    queriesEnabled,
    tenantId,
  ]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void onSend();
    }
  };

  return (
    <PageShell className="flex min-h-0 flex-1 flex-col gap-0 px-0 py-0 max-w-none">
      <div className="flex-shrink-0 px-6 pt-6 md:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <MarketingBackLink
            to={`/marketing/projects/${projectId}`}
            label={t('marketing.threads.backToProject')}
          />
          <MarketingBackLink
            to="/marketing"
            label={t('marketing.threads.backToWorkspace')}
          />
        </div>
        <PageHeader
          title={t('marketing.threadsTitle')}
          description={t('marketing.threadsSubtitle')}
        />
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="typo-body-sm text-muted-foreground">{t('marketing.desk.threadBanner')}</p>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link to="/marketing?tab=social">
              <Briefcase className="size-3.5" />
              {t('marketing.desk.openDesk')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="min-h-0 flex-1 overflow-y-auto px-6 py-4 md:px-8"
          aria-live="polite"
          aria-busy={streaming}
        >
        {isResolving || projectMismatch ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                <Skeleton className="h-12 w-64 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                <Skeleton className="h-12 w-64 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title={
              error instanceof ApiError && error.status === 404
                ? t('marketing.threads.notFound')
                : t('marketing.threads.loadMessagesFailed')
            }
            onRetry={() => void refetch()}
          />
        ) : localMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="typo-body-sm text-muted-foreground">{t('marketing.threads.emptyMessages')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-3xl mx-auto">
            {localMessages.map((msg: Message) => (
              <div
                key={msg.id}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {msg.content || (streaming && msg.role === 'assistant' ? '…' : '')}
                  </p>
                  <p
                    className={cn(
                      'mt-1 typo-eyebrow typo-tabular',
                      msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground',
                    )}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {streaming ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                <span className="typo-body-sm">{t('marketing.threads.streaming')}</span>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        )}
        </div>

        <div className="flex-shrink-0 border-t border-border bg-card px-6 py-3 md:px-8">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
            }}
            onKeyDown={onKeyDown}
            placeholder={t('marketing.messagePlaceholder')}
            rows={1}
            className="flex-1 resize-none min-h-[40px] max-h-[160px] overflow-y-auto"
            disabled={isSending || !queriesEnabled}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => void onSend()}
            disabled={isSending || !text.trim() || !queriesEnabled}
            className="shrink-0"
            aria-label={t('marketing.sendMessage')}
          >
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
        </div>
      </div>
    </PageShell>
  );
}
