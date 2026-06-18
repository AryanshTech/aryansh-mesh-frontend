import { useEffect, useRef, useState } from 'react';
import { PaperclipIcon, SendIcon } from 'lucide-react';
import type { ChatCommandResponse } from '@/modules/marketing/types/api';
import { attachmentsApi } from '@/modules/marketing/api/endpoints';
import { t } from '@/core/i18n';
import { Button } from '@/design-system/components/ui/button';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Badge } from '@/design-system/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/design-system/components/ui/command';
import { buildAutocompleteItems } from './CommandAutocomplete';

const QUICK_ACTIONS = [
  { key: 'quickGi', token: '@gi' },
  { key: 'quickStudio', token: '@studio' },
  { key: 'quickLifestyle', token: '@lifestyle' },
  { key: 'quickSave', token: '@save' },
] as const;

interface PendingAttachment {
  id: string;
  name: string;
  previewUrl: string;
}

interface ChatComposerProps {
  disabled?: boolean;
  commands: ChatCommandResponse | null;
  onSend: (content: string, attachmentIds: string[]) => Promise<void>;
  pendingInsert?: string | null;
  onPendingInsertConsumed?: () => void;
  threadId: string;
  getToken: () => Promise<string | null>;
}

export function ChatComposer({
  disabled,
  commands,
  onSend,
  pendingInsert,
  onPendingInsertConsumed,
  threadId,
  getToken,
}: ChatComposerProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [autocompleteQuery, setAutocompleteQuery] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const insertToken = (token: string) => {
    setContent((prev) => {
      const spacer = prev.endsWith(' ') || !prev ? '' : ' ';
      return `${prev}${spacer}${token} `;
    });
    setAutocompleteQuery(null);
    document.getElementById('chat-composer')?.focus();
  };

  useEffect(() => {
    if (pendingInsert) {
      insertToken(pendingInsert);
      onPendingInsertConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- insert on external pendingInsert only
  }, [pendingInsert]);

  const handleChange = (value: string) => {
    setContent(value);
    const match = value.match(/@(\w*)$/);
    setAutocompleteQuery(match ? match[1] : null);
  };

  const handleAttach = async (file: File) => {
    const token = await getToken();
    if (!token) return;

    const uploaded = await attachmentsApi.upload(token, threadId, file);
    const previewUrl = URL.createObjectURL(file);
    setAttachments((prev) => [
      ...prev,
      { id: uploaded.attachmentId, name: file.name, previewUrl },
    ]);
  };

  const handleSend = async () => {
    if (!content.trim() || sending || disabled) return;
    setSending(true);
    try {
      await onSend(
        content.trim(),
        attachments.map((a) => a.id)
      );
      setContent('');
      setAttachments([]);
      setAutocompleteQuery(null);
    } finally {
      setSending(false);
    }
  };

  const autocompleteItems =
    autocompleteQuery !== null && commands
      ? buildAutocompleteItems(
          autocompleteQuery,
          commands.commands,
          commands.savedLabels
        )
      : [];

  return (
    <div className="flex shrink-0 flex-col gap-3 border-t pt-4">
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map(({ key, token }) => (
          <Badge
            key={key}
            variant="outline"
            className="cursor-pointer font-mono"
            onClick={() => !disabled && insertToken(token)}
          >
            {t(`chat.${key}`)}
          </Badge>
        ))}
      </div>

      {attachments.length > 0 && (
        <div className="flex gap-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="size-12 overflow-hidden rounded-md border"
            >
              <img src={a.previewUrl} alt={a.name} className="size-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="relative flex flex-col gap-2">
        {autocompleteQuery !== null && autocompleteItems.length > 0 && (
          <Command className="absolute bottom-full left-0 right-0 z-10 mb-1 rounded-lg border bg-popover">
            <CommandList>
              <CommandEmpty>{t('chat.noCommands')}</CommandEmpty>
              <CommandGroup>
                {autocompleteItems.map((item) => (
                  <CommandItem
                    key={item.token}
                    value={item.token}
                    onSelect={() => insertToken(item.token)}
                  >
                    <span className="font-mono text-primary">{item.token}</span>
                    <span className="text-muted-foreground">{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}

        <Textarea
          id="chat-composer"
          value={content}
          disabled={disabled || sending}
          placeholder={t('workspace.placeholder')}
          rows={3}
          className="font-mono text-sm"
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />

        <div className="flex justify-between">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleAttach(file);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || attachments.length >= 5}
            onClick={() => fileRef.current?.click()}
          >
            <PaperclipIcon data-icon="inline-start" />
            {t('workspace.attach')}
          </Button>
          <Button
            size="sm"
            disabled={disabled || sending || !content.trim()}
            onClick={handleSend}
          >
            <SendIcon data-icon="inline-start" />
            {t('workspace.send')}
          </Button>
        </div>
      </div>
    </div>
  );
}
