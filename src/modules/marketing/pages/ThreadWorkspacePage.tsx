import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState } from '@/shared/components/ErrorState';
import { Button } from '@/design-system/components/ui/button';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { cn } from '@/design-system/lib/utils';
import { useMessages, useSendMessage, type Message } from '@/modules/marketing/api/use-threads';

export default function ThreadWorkspacePage() {
  const { t } = useTranslation();
  const { threadId } = useParams<{ projectId: string; threadId: string }>();

  const { data, isLoading, isError, refetch } = useMessages(threadId);
  const sendMutation = useSendMessage(threadId ?? '');

  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = data?.items ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    try {
      await sendMutation.mutateAsync(trimmed);
    } catch (e) {
      toast.error((e as Error).message || 'Failed to send message');
      setText(trimmed);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void onSend();
    }
  };

  return (
    <PageShell className="h-[calc(100vh-4rem)] flex flex-col gap-0 py-0 px-0 max-w-none">
      <div className="flex-shrink-0 px-6 pt-6 md:px-8">
        <PageHeader
          title={t('marketing.threadsTitle')}
          description={t('marketing.threadsSubtitle')}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 md:px-8">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                <Skeleton className="h-12 w-64 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState title="Failed to load messages" onRetry={() => void refetch()} />
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="typo-body-sm text-muted-foreground">No messages yet. Start the conversation below.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-3xl mx-auto">
            {messages.map((msg: Message) => (
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
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={cn(
                    'mt-1 typo-eyebrow typo-tabular',
                    msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground',
                  )}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-border bg-card px-6 py-3 md:px-8">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('marketing.messagePlaceholder')}
            rows={1}
            className="flex-1 resize-none min-h-[40px] max-h-[160px]"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => void onSend()}
            disabled={sendMutation.isPending || !text.trim()}
            className="shrink-0"
            aria-label={t('marketing.sendMessage')}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
