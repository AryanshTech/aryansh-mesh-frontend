import { API_BASE, ApiError } from '@/core/api/client';
import { getAccessToken } from '@/core/auth/token-storage';

export interface ThreadChatRequest {
  content: string;
  attachmentIds?: string[];
}

export type ThreadChatEventHandler = (event: string, data: unknown) => void;

function chatStreamUrl(threadId: string, tenantId?: string): string {
  if (tenantId) {
    return `${API_BASE}/tenants/${tenantId}/marketing/threads/${threadId}/messages`;
  }
  return `${API_BASE}/threads/${threadId}/messages`;
}

export async function streamThreadChat(
  threadId: string,
  body: ThreadChatRequest,
  onEvent: ThreadChatEventHandler,
  tenantId?: string,
  signal?: AbortSignal,
): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(chatStreamUrl(threadId, tenantId), {
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
    let message = res.statusText || 'Chat stream failed';
    try {
      const errBody = (await res.json()) as {
        message?: string;
        error?: { message?: string };
      };
      message = errBody.message ?? errBody.error?.message ?? message;
    } catch {
      // response body was not JSON
    }
    throw new ApiError(message, res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      if (!part.trim()) continue;

      let event = 'message';
      let data = '';
      for (const line of part.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) data = line.slice(5).trim();
      }
      if (data) onEvent(event, JSON.parse(data) as unknown);
    }
  }
}
