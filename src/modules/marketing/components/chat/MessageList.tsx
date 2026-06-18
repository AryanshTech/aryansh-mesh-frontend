import type { MessageResponse } from '@/modules/marketing/types/api';
import { cn } from '@/design-system/lib/utils';
import { ScrollArea } from '@/design-system/components/ui/scroll-area';

interface MessageListProps {
  messages: MessageResponse[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <ScrollArea className="min-h-0 flex-1 pr-4">
      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <div
            key={message.messageId}
            className={cn(
              'max-w-[85%] rounded-lg px-4 py-3 text-sm',
              message.role === 'USER'
                ? 'ml-auto bg-foreground text-background'
                : 'bg-muted font-mono',
              message.incomplete && 'opacity-70'
            )}
          >
            <pre className="whitespace-pre-wrap break-words font-[inherit]">
              {message.content}
            </pre>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
