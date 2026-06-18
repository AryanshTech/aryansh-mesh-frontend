import { apiFetch, authApiFetch, getApiBaseUrl } from './client';
import { ApiError } from '@/core/api/types';
import type {
  AgentJobResponse,
  ApiErrorResponse,
  AttachmentResponse,
  BrandMemoryResponse,
  BriefResponse,
  ChatCommandResponse,
  ChatRequest,
  CompaniesPageResponse,
  CompanyResponse,
  CompetitorResponse,
  ContactResponse,
  ContentItemResponse,
  CreateBrandMemoryRequest,
  CreateCompanyRequest,
  CreateCompetitorRequest,
  CreateContactRequest,
  CreateContentRequest,
  CreateDealRequest,
  CreatePostIdeaRequest,
  CreateProjectRequest,
  CreateSocialPostRequest,
  CreateStyleReferenceRequest,
  CreateThreadRequest,
  ContentFeedbackResponse,
  ContentAuditResponse,
  ContentAuditRowResponse,
  StyleCaptureResponse,
  TriggerContentAuditRequest,
  DealResponse,
  ExportFormat,
  ExportRequest,
  MeResponse,
  MessagesPageResponse,
  MarketingMindmapResponse,
  MarketingStyleProfileResponse,
  OnboardingAnswerRequest,
  OnboardingStatusResponse,
  OutputType,
  OutputsPageResponse,
  PatchDealStageRequest,
  PostIdeaResponse,
  ProjectFeedResponse,
  ProjectResponse,
  RejectContentRequest,
  SaveMarketingMindmapRequest,
  SaveMarketingStyleProfileRequest,
  SocialPostResponse,
  StyleReferenceResponse,
  ThreadResponse,
  TriggerWorkflowRequest,
  UpdateBriefRequest,
  UpdateCompanyRequest,
  UpdateContentRequest,
  UpdateFeedbackStatusRequest,
  UpdatePostIdeaStatusRequest,
} from '@/modules/marketing/types/api';

export const authApi = {
  session: (token: string) =>
    authApiFetch<{ uid: string; email: string; accessLevel: string; displayName?: string }>(
      '/auth/session',
      token,
      { method: 'POST' },
    ),
  me: (token: string) => authApiFetch<MeResponse>('/me', token),
};

export const platformTeamApi = {
  list: (token: string) =>
    authApiFetch<{ items: Array<{ uid: string; email: string; displayName: string; createdAt: string; active: boolean }> }>(
      '/platform/team',
      token,
    ),
};

export const companiesApi = {
  list: (token: string, page = 0, size = 20) =>
    apiFetch<CompaniesPageResponse>(`/companies?page=${page}&size=${size}`, token),
  get: (token: string, companyId: string) =>
    apiFetch<CompanyResponse>(`/marketing/companies/${companyId}`, token),
  create: (token: string, body: CreateCompanyRequest) =>
    apiFetch<CompanyResponse>('/marketing/companies', token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (token: string, companyId: string, body: UpdateCompanyRequest) =>
    apiFetch<CompanyResponse>(`/marketing/companies/${companyId}`, token, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (token: string, companyId: string) =>
    apiFetch<void>(`/marketing/companies/${companyId}`, token, { method: 'DELETE' }),
};

export const projectsApi = {
  listByCompany: (token: string, companyId: string) =>
    apiFetch<ProjectResponse[]>(`/marketing/companies/${companyId}/projects`, token),
  get: (token: string, projectId: string) =>
    apiFetch<ProjectResponse>(`/projects/${projectId}`, token),
  create: (token: string, companyId: string, body: CreateProjectRequest) =>
    apiFetch<ProjectResponse>(`/marketing/companies/${companyId}/projects`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getBrief: (token: string, projectId: string) =>
    apiFetch<BriefResponse>(`/projects/${projectId}/brief`, token),
  updateBrief: (token: string, projectId: string, body: UpdateBriefRequest) =>
    apiFetch<BriefResponse>(`/projects/${projectId}/brief`, token, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};

export const onboardingApi = {
  getStatus: (token: string, projectId: string) =>
    apiFetch<OnboardingStatusResponse>(`/projects/${projectId}/onboarding`, token),
  answer: (token: string, projectId: string, body: OnboardingAnswerRequest) =>
    apiFetch<OnboardingStatusResponse>(`/projects/${projectId}/onboarding`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const brandMemoriesApi = {
  list: (token: string, projectId: string) =>
    apiFetch<BrandMemoryResponse[]>(`/projects/${projectId}/brand-memories`, token),
  getCurrent: (token: string, projectId: string) =>
    apiFetch<BrandMemoryResponse | null>(
      `/projects/${projectId}/brand-memories/current`,
      token
    ),
  create: (token: string, projectId: string, body: CreateBrandMemoryRequest) =>
    apiFetch<BrandMemoryResponse>(`/projects/${projectId}/brand-memories`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  setCurrent: (token: string, projectId: string, id: string) =>
    apiFetch<BrandMemoryResponse>(
      `/projects/${projectId}/brand-memories/${id}/current`,
      token,
      { method: 'PUT' }
    ),
};

export const competitorsApi = {
  list: (token: string, projectId: string) =>
    apiFetch<CompetitorResponse[]>(`/projects/${projectId}/competitors`, token),
  create: (token: string, projectId: string, body: CreateCompetitorRequest) =>
    apiFetch<CompetitorResponse>(`/projects/${projectId}/competitors`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const contentApi = {
  list: (token: string, projectId: string) =>
    apiFetch<ContentItemResponse[]>(`/projects/${projectId}/content`, token),
  create: (token: string, projectId: string, body: CreateContentRequest) =>
    apiFetch<ContentItemResponse>(`/projects/${projectId}/content`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  approve: (token: string, projectId: string, id: string) =>
    apiFetch<ContentItemResponse>(
      `/projects/${projectId}/content/${id}/approve`,
      token,
      { method: 'POST' }
    ),
  reject: (token: string, projectId: string, id: string, body: RejectContentRequest) =>
    apiFetch<ContentItemResponse>(
      `/projects/${projectId}/content/${id}/reject`,
      token,
      { method: 'POST', body: JSON.stringify(body) }
    ),
  patchStatus: (token: string, projectId: string, id: string, body: UpdateContentRequest) =>
    apiFetch<ContentItemResponse>(
      `/projects/${projectId}/content/${id}/status`,
      token,
      { method: 'PATCH', body: JSON.stringify(body) }
    ),
};

export const socialPostsApi = {
  list: (token: string, projectId: string) =>
    apiFetch<SocialPostResponse[]>(`/projects/${projectId}/social-posts`, token),
  create: (token: string, projectId: string, body: CreateSocialPostRequest) =>
    apiFetch<SocialPostResponse>(`/projects/${projectId}/social-posts`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const agentJobsApi = {
  list: (token: string, projectId: string) =>
    apiFetch<AgentJobResponse[]>(`/projects/${projectId}/agent-jobs`, token),
  trigger: (token: string, projectId: string, body: TriggerWorkflowRequest) =>
    apiFetch<AgentJobResponse>(`/projects/${projectId}/agent-jobs`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const contactsApi = {
  list: (token: string, companyId: string) =>
    apiFetch<ContactResponse[]>(`/marketing/companies/${companyId}/contacts`, token),
  create: (token: string, companyId: string, body: CreateContactRequest) =>
    apiFetch<ContactResponse>(`/marketing/companies/${companyId}/contacts`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const dealsApi = {
  list: (token: string, companyId: string) =>
    apiFetch<DealResponse[]>(`/marketing/companies/${companyId}/deals`, token),
  create: (token: string, companyId: string, body: CreateDealRequest) =>
    apiFetch<DealResponse>(`/marketing/companies/${companyId}/deals`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  patchStage: (token: string, companyId: string, id: string, body: PatchDealStageRequest) =>
    apiFetch<DealResponse>(`/marketing/companies/${companyId}/deals/${id}/stage`, token, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

export const studioApi = {
  feed: (token: string, projectId: string) =>
    apiFetch<ProjectFeedResponse>(`/projects/${projectId}/feed`, token),
  listPostIdeas: (token: string, projectId: string) =>
    apiFetch<PostIdeaResponse[]>(`/projects/${projectId}/post-ideas`, token),
  createPostIdea: (token: string, projectId: string, body: CreatePostIdeaRequest) =>
    apiFetch<PostIdeaResponse>(`/projects/${projectId}/post-ideas`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  patchPostIdeaStatus: (
    token: string,
    projectId: string,
    id: string,
    body: UpdatePostIdeaStatusRequest
  ) =>
    apiFetch<PostIdeaResponse>(`/projects/${projectId}/post-ideas/${id}/status`, token, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  listFeedback: (token: string, projectId: string) =>
    apiFetch<ContentFeedbackResponse[]>(`/projects/${projectId}/content-feedback`, token),
  patchFeedbackStatus: (
    token: string,
    projectId: string,
    id: string,
    body: UpdateFeedbackStatusRequest
  ) =>
    apiFetch<ContentFeedbackResponse>(
      `/projects/${projectId}/content-feedback/${id}/status`,
      token,
      { method: 'PATCH', body: JSON.stringify(body) }
    ),
  listStyleReferences: (token: string, projectId: string) =>
    apiFetch<StyleReferenceResponse[]>(`/projects/${projectId}/style-references`, token),
  createStyleReference: (
    token: string,
    projectId: string,
    body: CreateStyleReferenceRequest
  ) =>
    apiFetch<StyleReferenceResponse>(`/projects/${projectId}/style-references`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  analyzeStyleReference: (token: string, projectId: string, id: string) =>
    apiFetch<StyleReferenceResponse>(
      `/projects/${projectId}/style-references/${id}/analyze`,
      token,
      { method: 'POST' }
    ),
  getStyleProfile: (token: string, projectId: string) =>
    apiFetch<MarketingStyleProfileResponse | null>(
      `/projects/${projectId}/marketing-style-profiles/current`,
      token
    ),
  saveStyleProfile: (
    token: string,
    projectId: string,
    body: SaveMarketingStyleProfileRequest
  ) =>
    apiFetch<MarketingStyleProfileResponse>(
      `/projects/${projectId}/marketing-style-profiles`,
      token,
      { method: 'POST', body: JSON.stringify(body) }
    ),
  getMindmap: (token: string, projectId: string) =>
    apiFetch<MarketingMindmapResponse | null>(
      `/projects/${projectId}/marketing-mindmaps/current`,
      token
    ),
  saveMindmap: (token: string, projectId: string, body: SaveMarketingMindmapRequest) =>
    apiFetch<MarketingMindmapResponse>(
      `/projects/${projectId}/marketing-mindmaps/current`,
      token,
      { method: 'PUT', body: JSON.stringify(body) }
    ),
  listStyleCaptures: (token: string, projectId: string) =>
    apiFetch<StyleCaptureResponse[]>(`/projects/${projectId}/style-captures`, token),
  getStyleCapture: (token: string, projectId: string, id: string) =>
    apiFetch<StyleCaptureResponse>(`/projects/${projectId}/style-captures/${id}`, token),
  applyCaptureToBrief: (token: string, projectId: string, id: string) =>
    apiFetch<MarketingStyleProfileResponse>(
      `/projects/${projectId}/style-captures/${id}/apply-to-brief`,
      token,
      { method: 'POST' }
    ),
};

export const contentAuditApi = {
  list: (token: string, projectId: string) =>
    apiFetch<ContentAuditResponse[]>(`/projects/${projectId}/content-audits`, token),
  get: (token: string, projectId: string, auditId: string) =>
    apiFetch<ContentAuditResponse>(`/projects/${projectId}/content-audits/${auditId}`, token),
  listRows: (token: string, projectId: string, auditId: string) =>
    apiFetch<ContentAuditRowResponse[]>(
      `/projects/${projectId}/content-audits/${auditId}/rows`,
      token
    ),
  trigger: (token: string, projectId: string, body: TriggerContentAuditRequest) =>
    apiFetch<ContentAuditResponse>(`/projects/${projectId}/content-audits`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  exportUrl: (projectId: string, auditId: string) =>
    `/api/v1/projects/${projectId}/content-audits/${auditId}/export.xlsx`,
};

export const threadsApi = {
  listByProject: (token: string, projectId: string) =>
    apiFetch<ThreadResponse[]>(`/projects/${projectId}/threads`, token),
  create: (token: string, projectId: string, body: CreateThreadRequest = {}) =>
    apiFetch<ThreadResponse>(`/projects/${projectId}/threads`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const messagesApi = {
  list: (token: string, threadId: string, page = 0, size = 50) =>
    apiFetch<MessagesPageResponse>(
      `/threads/${threadId}/messages?page=${page}&size=${size}`,
      token
    ),
  chatCommands: (token: string, threadId: string) =>
    apiFetch<ChatCommandResponse>(`/threads/${threadId}/chat-commands`, token),
};

export const attachmentsApi = {
  upload: async (
    token: string,
    threadId: string,
    file: File
  ): Promise<AttachmentResponse> => {
    const form = new FormData();
    form.append('file', file);
    return apiFetch<AttachmentResponse>(
      `/threads/${threadId}/attachments`,
      token,
      { method: 'POST', body: form }
    );
  },
};

export const outputsApi = {
  list: (
    token: string,
    projectId: string,
    type?: OutputType,
    page = 0,
    size = 20
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (type) params.set('type', type);
    return apiFetch<OutputsPageResponse>(
      `/projects/${projectId}/outputs?${params}`,
      token
    );
  },
  delete: (token: string, projectId: string, outputId: string) =>
    apiFetch<void>(`/projects/${projectId}/outputs/${outputId}`, token, {
      method: 'DELETE',
    }),
  export: async (
    token: string,
    projectId: string,
    body: ExportRequest
  ): Promise<Blob> => {
    const res = await fetch(
      `${getApiBaseUrl()}/api/v1/projects/${projectId}/outputs/export`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  },
};

export type StreamChatHandler = (event: string, data: unknown) => void;

export async function streamChat(
  threadId: string,
  token: string,
  body: ChatRequest,
  onEvent: StreamChatHandler
): Promise<void> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/v1/threads/${threadId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok || !res.body) {
    const errBody = (await res.json().catch(() => ({}))) as ApiErrorResponse;
    const code = errBody.error?.code ?? 'UNKNOWN';
    const message = errBody.error?.message ?? 'Chat stream failed';
    throw new ApiError(res.status, { code, message });
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
      let event = 'message';
      let data = '';
      for (const line of part.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) data = line.slice(5).trim();
      }
      if (data) onEvent(event, JSON.parse(data));
    }
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportFilename(format: ExportFormat): string {
  return format === 'XLSX' ? 'outputs.xlsx' : 'outputs.csv';
}
