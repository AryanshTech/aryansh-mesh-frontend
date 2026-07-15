import { API_BASE, ApiError } from '@/core/api/client';
import { getAccessToken } from '@/core/auth/token-storage';

export interface ThreadChatRequest {
  content: string;
  attachmentIds?: string[];
}

export interface ThreadChatSyncResult {
  userMessageId: string;
  assistantMessageId: string;
  content: string;
  complete: boolean;
}

export type ThreadChatEventHandler = (event: string, data: unknown) => void;

function requireTenantId(tenantId?: string): string {
  if (!tenantId?.trim()) {
    throw new ApiError('Select a business before chatting.', 400, 'TENANT_REQUIRED');
  }
  return tenantId.trim();
}

function chatMessagesUrl(threadId: string, tenantId: string, sync = false): string {
  const base = `${API_BASE}/tenants/${tenantId}/marketing/threads/${threadId}/messages`;
  return sync ? `${base}/sync` : base;
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const errBody = (await res.json()) as {
      message?: string;
      error?: { message?: string };
    };
    return errBody.message ?? errBody.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

/** Non-streaming fallback when SSE fails (proxy/security/async issues). */
export async function syncThreadChat(
  threadId: string,
  body: ThreadChatRequest,
  tenantId?: string,
  signal?: AbortSignal,
): Promise<ThreadChatSyncResult> {
  const scopedTenantId = requireTenantId(tenantId);
  const token = getAccessToken();
  const res = await fetch(chatMessagesUrl(threadId, scopedTenantId, true), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    throw new ApiError(
      await readErrorMessage(res, res.statusText || 'Chat sync failed'),
      res.status,
    );
  }

  return (await res.json()) as ThreadChatSyncResult;
}

export async function streamThreadChat(
  threadId: string,
  body: ThreadChatRequest,
  onEvent: ThreadChatEventHandler,
  tenantId?: string,
  signal?: AbortSignal,
): Promise<void> {
  const scopedTenantId = requireTenantId(tenantId);
  const token = getAccessToken();
  const res = await fetch(chatMessagesUrl(threadId, scopedTenantId), {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new ApiError(
      await readErrorMessage(res, res.statusText || 'Chat stream failed'),
      res.status,
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let sawMessageStart = false;
  let sawError = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      if (!part.trim()) continue;

      let event = 'message';
      const dataLines: string[] = [];
      for (const line of part.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
      }
      const data = dataLines.join('\n');
      if (!data) continue;

      let parsed: unknown = data;
      try {
        parsed = JSON.parse(data) as unknown;
      } catch {
        // keep raw string if not JSON
      }

      if (event === 'message_start') sawMessageStart = true;
      if (event === 'error') sawError = true;
      onEvent(event, parsed);
    }
  }

  // Broken SSE (e.g. Access Denied after commit) often ends with no events.
  if (!sawMessageStart && !sawError) {
    throw new ApiError('Chat stream ended before a reply started.', 502, 'STREAM_EMPTY');
  }
}
