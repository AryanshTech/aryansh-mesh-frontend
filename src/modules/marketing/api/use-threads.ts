import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';

export interface Thread {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ThreadInput {
  name: string;
}

export function useThreads(projectId: string | undefined) {
  return useQuery({
    queryKey: ['marketing', 'threads', projectId],
    queryFn: () =>
      api.get<{ items: Thread[]; total: number } | Thread[]>(
        `/projects/${projectId!}/threads`,
      ),
    enabled: !!projectId,
    select: (data) => (Array.isArray(data) ? { items: data, total: data.length } : data),
  });
}

export function useCreateThread(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ThreadInput) =>
      api.post<Thread>(`/projects/${projectId}/threads`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'threads', projectId] });
    },
  });
}

export function useMessages(threadId: string | undefined) {
  return useQuery({
    queryKey: ['marketing', 'messages', threadId],
    queryFn: () =>
      api.get<{ items: Message[]; total: number } | Message[]>(
        `/threads/${threadId!}/messages`,
      ),
    enabled: !!threadId,
    select: (data) => (Array.isArray(data) ? { items: data, total: data.length } : data),
  });
}

export function useSendMessage(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.post<Message>(`/threads/${threadId}/messages/sync`, { content }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'messages', threadId] });
    },
  });
}
