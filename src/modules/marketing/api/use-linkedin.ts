import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';

export interface LinkedInInspirationPost {
  text: string;
  likes?: number | null;
  whyItWorks?: string | null;
  createdAt?: string | null;
}

export interface LinkedInPersona {
  id: string;
  projectId: string;
  name: string;
  isDefault: boolean;
  coreProfile?: string | null;
  voiceTone?: string | null;
  contentRules?: string | null;
  inspirationPosts?: LinkedInInspirationPost[];
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SaveLinkedInPersonaInput {
  name: string;
  coreProfile?: string;
  voiceTone?: string;
  contentRules?: string;
  inspirationPosts?: LinkedInInspirationPost[];
}

export interface LinkedInTopic {
  id: string;
  title: string;
  angle?: string | null;
  source?: string | null;
  score?: number;
}

export interface LinkedInHook {
  id: string;
  text: string;
}

export interface LinkedInTopicDevelopment {
  topicId: string;
  title: string;
  deepNotes?: string | null;
  hooks: LinkedInHook[];
}

export interface LinkedInDraft {
  id: string;
  topicId: string;
  topicTitle: string;
  hookText: string;
  caption: string;
}

export interface LinkedInProposedRule {
  id: string;
  rule: string;
  evidence: string;
  enabled: boolean;
}

export interface LinkedInOAuthStatus {
  enabled: boolean;
  connected: boolean;
  memberUrn?: string | null;
}

function root(projectId: string, tenantId?: string): string {
  return tenantId
    ? `/tenants/${tenantId}/marketing/linkedin`
    : `/projects/${projectId}/linkedin`;
}

function scopeKey(projectId: string, tenantId?: string): string {
  return tenantId ? `tenant:${tenantId}` : `project:${projectId}`;
}

export const linkedInKeys = {
  personas: (key: string) => ['marketing', 'linkedin', 'personas', key] as const,
  oauth: (key: string) => ['marketing', 'linkedin', 'oauth', key] as const,
};

export function useLinkedInPersonas(projectId: string | undefined, tenantId?: string, enabled = true) {
  const key = scopeKey(projectId ?? '', tenantId);
  return useQuery({
    queryKey: linkedInKeys.personas(key),
    queryFn: () => api.get<LinkedInPersona[]>(`${root(projectId!, tenantId)}/personas`),
    enabled: enabled && (!!projectId || !!tenantId),
    select: (rows) => rows ?? [],
  });
}

export function useSaveLinkedInPersona(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const key = scopeKey(projectId, tenantId);
  return useMutation({
    mutationFn: (input: { personaId?: string; body: SaveLinkedInPersonaInput }) =>
      input.personaId
        ? api.put<LinkedInPersona>(`${root(projectId, tenantId)}/personas/${input.personaId}`, input.body)
        : api.post<LinkedInPersona>(`${root(projectId, tenantId)}/personas`, input.body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: linkedInKeys.personas(key) });
    },
  });
}

export function useSetDefaultLinkedInPersona(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const key = scopeKey(projectId, tenantId);
  return useMutation({
    mutationFn: (personaId: string) =>
      api.put<LinkedInPersona>(`${root(projectId, tenantId)}/personas/${personaId}/default`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: linkedInKeys.personas(key) });
    },
  });
}

export function useDeleteLinkedInPersona(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const key = scopeKey(projectId, tenantId);
  return useMutation({
    mutationFn: (personaId: string) =>
      api.delete<void>(`${root(projectId, tenantId)}/personas/${personaId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: linkedInKeys.personas(key) });
    },
  });
}

export function useLinkedInPipeline(projectId: string, tenantId?: string) {
  const base = `${root(projectId, tenantId)}/pipeline`;
  const discover = useMutation({
    mutationFn: (input: { personaId?: string; seedIdeas?: string[]; runId?: string }) =>
      api.post<{ runId: string; topics: LinkedInTopic[]; researchWarning?: string | null }>(
        `${base}/discover`,
        input,
      ),
  });
  const develop = useMutation({
    mutationFn: (input: {
      personaId?: string;
      runId?: string;
      topics: Array<{ id: string; title: string; angle?: string }>;
    }) =>
      api.post<{ runId: string; developments: LinkedInTopicDevelopment[] }>(`${base}/develop`, input),
  });
  const write = useMutation({
    mutationFn: (input: {
      personaId?: string;
      runId?: string;
      selections: Array<{
        topicId: string;
        topicTitle?: string;
        angle?: string;
        hookId?: string;
        hookText: string;
      }>;
    }) => api.post<{ runId: string; drafts: LinkedInDraft[] }>(`${base}/write`, input),
  });
  const proposeRules = useMutation({
    mutationFn: (input: {
      personaId?: string;
      originalText: string;
      editedText: string;
      feedback?: string;
    }) => api.post<{ rules: LinkedInProposedRule[] }>(`${base}/propose-rules`, input),
  });
  return { discover, develop, write, proposeRules };
}

export function useLinkedInOAuthStatus(projectId: string | undefined, tenantId?: string, enabled = true) {
  const key = scopeKey(projectId ?? '', tenantId);
  return useQuery({
    queryKey: linkedInKeys.oauth(key),
    queryFn: () => api.get<LinkedInOAuthStatus>(`${root(projectId!, tenantId)}/oauth/status`),
    enabled: enabled && (!!projectId || !!tenantId),
  });
}

export function useLinkedInOAuthActions(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const key = scopeKey(projectId, tenantId);
  const start = useMutation({
    mutationFn: () =>
      api.get<{ authorizationUrl: string; state: string }>(`${root(projectId, tenantId)}/oauth/start`),
  });
  const disconnect = useMutation({
    mutationFn: () => api.post<void>(`${root(projectId, tenantId)}/oauth/disconnect`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: linkedInKeys.oauth(key) });
    },
  });
  return { start, disconnect };
}
