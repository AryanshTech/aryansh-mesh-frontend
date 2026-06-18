/**
 * Aryansh Marketing Hub API types — mirror backend Dtos.java + SSE events.
 * Canonical CRM types from docs/frontend/api-types.ts (camelCase for REST).
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'MEMBER' | 'VIEWER';

export type OnboardingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';

export type ContentType =
  | 'BLOG'
  | 'LANDING_PAGE'
  | 'EMAIL'
  | 'VIDEO_BRIEF'
  | 'AD_SCRIPT';

export type ContentStatus =
  | 'IDEA'
  | 'DRAFTING'
  | 'HUMANIZING'
  | 'SCORING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'EXPORTED';

export type SocialPlatform =
  | 'LINKEDIN'
  | 'X'
  | 'THREADS'
  | 'BLUESKY'
  | 'MASTODON'
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'PRODUCT_HUNT'
  | 'FACEBOOK'
  | 'PINTEREST'
  | 'REDDIT';

export type PostIdeaStatus =
  | 'BACKLOG'
  | 'READY'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'ARCHIVED';

export type FeedbackStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED';

export type FeedbackTargetType = 'CONTENT' | 'SOCIAL_POST';

export type StyleAnalyzeStatus = 'PENDING' | 'COMPLETE' | 'FAILED';

export type FeedEventType =
  | 'AGENT_JOB'
  | 'CONTENT'
  | 'SOCIAL_POST'
  | 'POST_IDEA'
  | 'FEEDBACK'
  | 'STYLE_REFERENCE';

export type SocialPostStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED';

export type DealStage = 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';

export type AgentJobStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PARTIAL';

export type WorkflowId =
  | 'SETUP_BRAND_CONTEXT'
  | 'RUN_SPY'
  | 'UPDATE_BRAND_MEMORY'
  | 'WRITE_BLOG_POST'
  | 'SCHEDULE_SOCIAL_WEEK'
  | 'CREATE_VIDEO_BRIEF'
  | 'CREATE_AD_CREATIVE'
  | 'RUN_CONTENT_AUDIT';

export type OutputType = 'GI' | 'SP' | 'LP';

export type ChatAction = 'CHAT' | 'SAVED';

export type ServiceIntent = 'GI' | 'SP' | 'LP' | 'GENERAL';

export type MessageRole = 'USER' | 'ASSISTANT';

export type ExportFormat = 'CSV' | 'XLSX';

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}

export interface ApiPage<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

// ─── Auth & users ────────────────────────────────────────────────────────────

export interface MeResponse {
  uid: string;
  email: string;
  displayName?: string;
  accessLevel?: string;
  businessRole?: string | null;
  tenantId?: string | null;
  services?: string[];
  role: Role;
}

export interface UserResponse {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  lastLoginAt: string;
}

export interface UsersListResponse {
  items: UserResponse[];
}

export interface UpdateRoleRequest {
  role: Role;
}

// ─── Companies ───────────────────────────────────────────────────────────────

export interface CreateCompanyRequest {
  companyCode: string;
  name: string;
}

export interface UpdateCompanyRequest {
  name: string;
}

export interface CompanyResponse {
  companyId: string;
  companyCode: string;
  name: string;
  createdAt: string;
  createdBy: string;
}

export type CompaniesPageResponse = ApiPage<CompanyResponse>;

// ─── Projects ──────────────────────────────────────────────────────────────

export interface CreateProjectRequest {
  name: string;
}

export interface UpdateProjectRequest {
  name: string;
}

export interface ProjectResponse {
  projectId: string;
  companyId: string;
  name: string;
  brief: string;
  createdAt: string;
  createdBy: string;
  onboardingStatus: OnboardingStatus;
  typefullySocialSetId: string | null;
}

export interface BriefResponse {
  projectId: string;
  brief: string;
}

export interface UpdateBriefRequest {
  brief: string;
}

// ─── Brand Memory ────────────────────────────────────────────────────────────

export interface BrandMemoryResponse {
  id: string;
  projectId: string;
  version: number;
  contentMarkdown: string;
  isCurrent: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CreateBrandMemoryRequest {
  contentMarkdown: string;
}

// ─── Competitors ─────────────────────────────────────────────────────────────

export interface CompetitorResponse {
  id: string;
  projectId: string;
  name: string;
  url: string;
  lastProfiledAt: string | null;
  createdBy: string;
  createdAt: string;
}

export interface CreateCompetitorRequest {
  name: string;
  url?: string;
}

export interface UpdateCompetitorRequest {
  name?: string;
  url?: string;
}

// ─── Content ─────────────────────────────────────────────────────────────────

export interface ContentItemResponse {
  id: string;
  projectId: string;
  type: ContentType;
  title: string;
  status: ContentStatus;
  contentMarkdown: string;
  brandMemoryVersionId: string;
  skillsUsed: string[];
  agentJobId: string | null;
  createdBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface CreateContentRequest {
  type: ContentType;
  title: string;
  contentMarkdown?: string;
  status?: ContentStatus;
}

export interface UpdateContentRequest {
  title?: string;
  contentMarkdown?: string;
  status?: ContentStatus;
}

export interface RejectContentRequest {
  feedback: string;
}

// ─── Social ──────────────────────────────────────────────────────────────────

export interface SocialPostResponse {
  id: string;
  projectId: string;
  platform: SocialPlatform;
  scheduledDate: string;
  content: string;
  formatType: string;
  status: SocialPostStatus;
  typefullyDraftId: string | null;
  createdAt: string;
}

export interface CreateSocialPostRequest {
  platform: SocialPlatform;
  content: string;
  formatType?: string;
  scheduledDate?: string;
}

export interface UpdateSocialPostRequest {
  content?: string;
  scheduledDate?: string;
  status?: SocialPostStatus;
}

export interface RejectSocialPostRequest {
  feedback: string;
}

export interface PostIdeaResponse {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  platform: SocialPlatform | null;
  formatType: string | null;
  status: PostIdeaStatus;
  styleReferenceId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostIdeaRequest {
  title: string;
  description?: string;
  platform?: SocialPlatform;
  formatType?: string;
  styleReferenceId?: string;
}

export interface UpdatePostIdeaStatusRequest {
  status: PostIdeaStatus;
}

export interface ContentFeedbackResponse {
  id: string;
  projectId: string;
  targetType: FeedbackTargetType;
  targetId: string;
  feedbackText: string;
  status: FeedbackStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFeedbackStatusRequest {
  status: FeedbackStatus;
}

export interface StyleReferenceResponse {
  id: string;
  projectId: string;
  platform: SocialPlatform;
  displayName: string | null;
  sourceUrl: string;
  notesMarkdown: string | null;
  scrapedMarkdown: string | null;
  analyzedStyleMarkdown: string | null;
  formatTags: string[];
  analyzeStatus: StyleAnalyzeStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStyleReferenceRequest {
  platform: SocialPlatform;
  displayName?: string;
  sourceUrl: string;
  notesMarkdown?: string;
}

export interface MarketingStyleProfileResponse {
  id: string;
  projectId: string;
  industry: string | null;
  tone: string | null;
  contentPillars: string[];
  briefMarkdown: string;
  isCurrent: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveMarketingStyleProfileRequest {
  industry?: string;
  tone?: string;
  contentPillars?: string[];
  briefMarkdown: string;
}

export interface MarketingMindmapResponse {
  id: string;
  projectId: string;
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  isCurrent: boolean;
  createdBy: string;
  updatedAt: string;
}

export interface SaveMarketingMindmapRequest {
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
}

export type CaptureMode = 'PAGE' | 'FEED_BATCH';

export interface StyleCaptureDocsResponse {
  designGuidelinesMd: string | null;
  contentStyleMd: string | null;
  postingFrameworkMd: string | null;
}

export interface StyleCaptureResponse {
  id: string;
  projectId: string;
  platform: SocialPlatform;
  sourceUrl: string;
  captureMode: CaptureMode;
  competitorId: string | null;
  styleReferenceId: string | null;
  posts: Record<string, unknown>[];
  cadenceSummary: Record<string, unknown>;
  viralCandidates: string[];
  docs: StyleCaptureDocsResponse | null;
  analyzeStatus: StyleAnalyzeStatus;
  mindmapSeedNodes: Record<string, unknown>[];
  mindmapSeedEdges: Record<string, unknown>[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentAuditStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ContentAuditResponse {
  id: string;
  projectId: string;
  platform: SocialPlatform;
  sourceUrl: string;
  competitorId: string | null;
  status: ContentAuditStatus;
  rowCount: number;
  summaryMarkdown: string | null;
  cadenceSummary: Record<string, unknown>;
  agentJobId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentAuditRowResponse {
  id: string;
  auditId: string;
  projectId: string;
  capturedAt: string;
  sourceUrl: string;
  title: string | null;
  hook: string | null;
  contentSummary: string | null;
  formatType: string | null;
  styleTags: string[];
  engagementSummary: string | null;
  pillar: string | null;
  notes: string | null;
}

export interface TriggerContentAuditRequest {
  sourceUrl: string;
  platform: SocialPlatform;
  competitorId?: string;
  maxPages?: number;
}

export interface FeedEventResponse {
  type: FeedEventType;
  entityId: string;
  title: string;
  summary: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export interface ProjectFeedResponse {
  items: FeedEventResponse[];
}

export interface PatchDealStageRequest {
  stage: DealStage;
}

// ─── Agent Jobs ──────────────────────────────────────────────────────────────

export interface AgentJobResponse {
  id: string;
  projectId: string;
  workflowId: WorkflowId;
  status: AgentJobStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  toolCalls: Record<string, unknown>[];
  tokensUsed: number;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
  createdBy: string;
}

export interface TriggerWorkflowRequest {
  workflowId: WorkflowId;
  input?: Record<string, unknown>;
}

// ─── CRM ─────────────────────────────────────────────────────────────────────

export interface ContactResponse {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: string;
  tags: string[];
  createdAt: string;
}

export interface CreateContactRequest {
  name: string;
  email?: string;
  role?: string;
  tags?: string[];
}

export interface UpdateContactRequest {
  name?: string;
  email?: string;
  role?: string;
  tags?: string[];
}

export interface DealResponse {
  id: string;
  companyId: string;
  projectId: string | null;
  name: string;
  stage: DealStage;
  value: number;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface CreateDealRequest {
  projectId?: string;
  name: string;
  stage?: DealStage;
  value: number;
  startDate: string;
  endDate?: string;
}

export interface UpdateDealRequest {
  name?: string;
  stage?: DealStage;
  value?: number;
  startDate?: string;
  endDate?: string;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export interface OnboardingStatusResponse {
  status: OnboardingStatus;
}

export interface OnboardingAnswerRequest {
  answer: string;
}

// ─── Threads & chat (legacy workspace) ───────────────────────────────────────

export interface CreateThreadRequest {
  title?: string;
}

export interface ThreadResponse {
  threadId: string;
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  messageId: string;
  role: MessageRole;
  content: string;
  attachmentIds: string[];
  incomplete: boolean;
  createdAt: string;
}

export interface MessagesPageResponse {
  items: MessageResponse[];
  page: number;
  size: number;
  total: number;
}

export interface ChatRequest {
  content: string;
  attachmentIds?: string[];
}

export interface ChatSyncResponse {
  userMessageId: string;
  assistantMessageId: string;
  content: string;
  complete: boolean;
  action: ChatAction;
  intent: ServiceIntent | null;
  savedLabel: string | null;
  savedOutputId: string | null;
  savedType: OutputType | null;
  expandedContent: string | null;
}

export interface ChatCommandHint {
  token: string;
  label: string;
  description: string;
  example: string;
}

export interface ChatCommandResponse {
  companyCode: string;
  projectId: string;
  threadId: string;
  commands: ChatCommandHint[];
  savedLabels: string[];
}

export interface AttachmentResponse {
  attachmentId: string;
  projectId: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface OutputResponse {
  outputId: string;
  projectId: string;
  type: OutputType;
  label: string;
  content: string;
  sourceMessageId: string | null;
  createdAt: string;
  createdBy: string;
}

export interface OutputsPageResponse {
  items: OutputResponse[];
  page: number;
  size: number;
  total: number;
}

export interface ExportRequest {
  format?: ExportFormat;
  outputIds?: string[];
}

export interface SseMessageStartEvent {
  messageId: string;
}

export interface SseTokenEvent {
  text: string;
}

export interface SseMessageEndEvent {
  messageId: string;
  complete: boolean;
  action: ChatAction;
  intent?: ServiceIntent;
  savedLabel?: string;
  savedOutputId?: string;
  savedType?: OutputType;
}

export interface SseErrorEvent {
  code: string;
  message: string;
}

export type SseEventName = 'message_start' | 'token' | 'message_end' | 'error';

export type SseEventPayload =
  | SseMessageStartEvent
  | SseTokenEvent
  | SseMessageEndEvent
  | SseErrorEvent;

export interface ParsedSseEvent<T extends SseEventPayload = SseEventPayload> {
  event: SseEventName;
  data: T;
}

export interface SseJobProgressEvent {
  jobId: string;
  step: string;
  percent: number;
}

export interface SseJobCompleteEvent {
  jobId: string;
  status: AgentJobStatus;
  output: Record<string, unknown>;
}

export type CrmSseEvent =
  | { event: 'job_progress'; data: SseJobProgressEvent }
  | { event: 'job_complete'; data: SseJobCompleteEvent };
