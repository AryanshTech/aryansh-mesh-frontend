import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, api } from '@/core/api/client';
import {
  streamThreadChat,
  syncThreadChat,
  type ThreadChatEventHandler,
} from '@/modules/marketing/api/stream-thread-chat';

export interface Thread {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ThreadInput {
  title: string;
}

interface ThreadApi {
  threadId: string;
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageApi {
  messageId: string;
  role: string;
  content: string;
  createdAt: string;
}

interface MessagesPageApi {
  items: MessageApi[];
  page: number;
  size: number;
  total: number;
}

function threadsRoot(projectId: string, tenantId?: string): string {
  return tenantId
    ? `/tenants/${tenantId}/marketing/threads`
    : `/projects/${projectId}/threads`;
}

function threadMessagesRoot(threadId: string, tenantId?: string): string {
  return tenantId
    ? `/tenants/${tenantId}/marketing/threads/${threadId}/messages`
    : `/threads/${threadId}/messages`;
}

function mapThread(raw: ThreadApi): Thread {
  return {
    id: raw.threadId,
    projectId: raw.projectId,
    title: raw.title,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function mapMessage(raw: MessageApi): Message {
  return {
    id: raw.messageId,
    role: raw.role === 'assistant' ? 'assistant' : 'user',
    content: raw.content,
    createdAt: raw.createdAt,
  };
}

export function useThreads(
  projectId: string | undefined,
  tenantId?: string,
  enabled = true,
) {
  const scopeKey = tenantId ? `tenant:${tenantId}` : `project:${projectId}`;
  return useQuery({
    queryKey: ['marketing', 'threads', scopeKey],
    queryFn: async () => {
      const rows = await api.get<ThreadApi[]>(threadsRoot(projectId!, tenantId));
      const items = (rows ?? []).map(mapThread);
      return { items, total: items.length };
    },
    enabled: enabled && (!!projectId || !!tenantId),
  });
}

export function useCreateThread(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const scopeKey = tenantId ? `tenant:${tenantId}` : `project:${projectId}`;
  return useMutation({
    mutationFn: async (input: ThreadInput) => {
      const raw = await api.post<ThreadApi>(threadsRoot(projectId, tenantId), {
        title: input.title,
      });
      return mapThread(raw);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'threads', scopeKey] });
    },
  });
}

export function useMessages(
  threadId: string | undefined,
  tenantId?: string,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && !!threadId && !!tenantId;
  return useQuery({
    queryKey: ['marketing', 'messages', threadId, tenantId ?? 'project'],
    queryFn: async () => {
      const page = await api.get<MessagesPageApi>(threadMessagesRoot(threadId!, tenantId), {
        query: { page: 0, size: 100 },
      });
      if (!page) return { items: [], total: 0 };
      const items = (page.items ?? []).map(mapMessage);
      return { items, total: page.total ?? items.length };
    },
    enabled,
  });
}

export interface StreamMessageInput {
  content: string;
  onEvent: ThreadChatEventHandler;
}

export function useSendMessage(threadId: string, tenantId?: string) {
  const qc = useQueryClient();
  const messagesKey = ['marketing', 'messages', threadId, tenantId ?? 'project'] as const;

  return useMutation({
    mutationFn: async ({ content, onEvent }: StreamMessageInput) => {
      try {
        await streamThreadChat(threadId, { content }, onEvent, tenantId);
      } catch (err) {
        const status = err instanceof ApiError ? err.status : 0;
        const code = err instanceof ApiError ? err.code : undefined;

        if (code === 'TENANT_REQUIRED') {
          throw err;
        }

        // Broken SSE after HTTP 200 often already saved the user message.
        // Nudge sync so GCP LLM replies without duplicating the prompt.
        const continuation =
          code === 'STREAM_EMPTY'
            ? 'Please reply to my previous message now. Return only the finished draft.'
            : null;

        const shouldFallback =
          continuation !== null ||
          status === 0 ||
          status === 403 ||
          status === 502 ||
          status === 503;

        if (!shouldFallback) {
          throw err;
        }

        const result = await syncThreadChat(
          threadId,
          { content: continuation ?? content },
          tenantId,
        );
        onEvent('message_start', { messageId: result.assistantMessageId });
        if (result.content) {
          onEvent('token', { text: result.content });
        }
        onEvent('message_end', {
          messageId: result.assistantMessageId,
          complete: result.complete,
        });
      }
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: messagesKey });
    },
  });
}
