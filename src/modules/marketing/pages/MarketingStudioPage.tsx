import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PlusIcon } from 'lucide-react';
import { contentApi, studioApi, agentJobsApi, contentAuditApi } from '@/modules/marketing/api/endpoints';
import { AgentPipelineViz } from '@/modules/marketing/components/studio/AgentPipelineViz';
import { ContentAuditPanel } from '@/modules/marketing/components/studio/ContentAuditPanel';
import { DesignBriefPanel } from '@/modules/marketing/components/studio/DesignBriefPanel';
import { FeedTimeline } from '@/modules/marketing/components/studio/FeedTimeline';
import { KanbanBoard } from '@/modules/marketing/components/studio/KanbanBoard';
import { StyleCapturePanel } from '@/modules/marketing/components/studio/StyleCapturePanel';
import {
  STUDIO_PLATFORMS,
  StyleReferenceCard,
} from '@/modules/marketing/components/studio/StyleReferenceCard';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { invalidateProjectStudio, queryKeys } from '@/modules/marketing/hooks/query-client';
import { ToggleGroup, ToggleGroupItem } from '@/design-system/components/ui/toggle-group';
import { t } from '@/core/i18n';
import type {
  ContentStatus,
  FeedbackStatus,
  PostIdeaStatus,
  SocialPlatform,
  StyleReferenceResponse,
  StyleCaptureResponse,
} from '@/modules/marketing/types/api';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/design-system/components/ui/field';
import { Input } from '@/design-system/components/ui/input';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs';
import { Textarea } from '@/design-system/components/ui/textarea';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { resolveApiV1BaseUrl } from '@/core/api/config';
import { cn } from '@/design-system/lib/utils';

const STUDIO_TABS = [
  'feed',
  'feedbacks',
  'ideas',
  'content',
  'styles',
  'audits',
  'mindmap',
] as const;

type StudioTab = (typeof STUDIO_TABS)[number];

function isStudioTab(value: string | null): value is StudioTab {
  return STUDIO_TABS.includes(value as StudioTab);
}

function buildDefaultMindmapNodes(): Node[] {
  return [
    {
      id: 'client',
      position: { x: 250, y: 0 },
      data: { label: t('studio.mindmap.nodes.client') },
      type: 'default',
    },
    {
      id: 'channels',
      position: { x: 100, y: 150 },
      data: { label: t('studio.mindmap.nodes.channels') },
      type: 'default',
    },
    {
      id: 'pillars',
      position: { x: 400, y: 150 },
      data: { label: t('studio.mindmap.nodes.pillars') },
      type: 'default',
    },
  ];
}

const DEFAULT_MINDMAP_EDGES: Edge[] = [
  { id: 'client-channels', source: 'client', target: 'channels' },
  { id: 'client-pillars', source: 'client', target: 'pillars' },
];

function parseMindmapNodes(raw: Record<string, unknown>[]): Node[] {
  if (!raw.length) return buildDefaultMindmapNodes();
  return raw.map((node) => ({
    id: String(node.id ?? ''),
    position: (node.position as { x: number; y: number }) ?? { x: 0, y: 0 },
    data: (node.data as { label: string }) ?? { label: '' },
    type: (node.type as string) ?? 'default',
  }));
}

function parseMindmapEdges(raw: Record<string, unknown>[]): Edge[] {
  if (!raw.length) return DEFAULT_MINDMAP_EDGES;
  return raw.map((edge) => ({
    id: String(edge.id ?? `${edge.source}-${edge.target}`),
    source: String(edge.source ?? ''),
    target: String(edge.target ?? ''),
  }));
}

export function MarketingStudioPage() {
  const { projectId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getToken, canWrite } = useAuth();

  const tabParam = searchParams.get('tab');
  const captureIdParam = searchParams.get('captureId');
  const activeTab: StudioTab = isStudioTab(tabParam) ? tabParam : 'feed';

  const setTab = (tab: StudioTab) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const feedQuery = useQuery({
    queryKey: queryKeys.feed(projectId),
    queryFn: () =>
      apiFetchWithRetry((token) => studioApi.feed(token, projectId), getToken),
    enabled: !!projectId,
  });

  const feedbackQuery = useQuery({
    queryKey: queryKeys.contentFeedback(projectId),
    queryFn: () =>
      apiFetchWithRetry(
        (token) => studioApi.listFeedback(token, projectId),
        getToken
      ),
    enabled: !!projectId && activeTab === 'feedbacks',
  });

  const ideasQuery = useQuery({
    queryKey: queryKeys.postIdeas(projectId),
    queryFn: () =>
      apiFetchWithRetry(
        (token) => studioApi.listPostIdeas(token, projectId),
        getToken
      ),
    enabled: !!projectId && activeTab === 'ideas',
  });

  const contentQuery = useQuery({
    queryKey: queryKeys.content(projectId),
    queryFn: () =>
      apiFetchWithRetry((token) => contentApi.list(token, projectId), getToken),
    enabled: !!projectId && activeTab === 'content',
  });

  const styleRefsQuery = useQuery({
    queryKey: queryKeys.styleReferences(projectId),
    queryFn: () =>
      apiFetchWithRetry(
        (token) => studioApi.listStyleReferences(token, projectId),
        getToken
      ),
    enabled: !!projectId && activeTab === 'styles',
  });

  const styleCapturesQuery = useQuery({
    queryKey: queryKeys.styleCaptures(projectId),
    queryFn: () =>
      apiFetchWithRetry(
        (token) => studioApi.listStyleCaptures(token, projectId),
        getToken
      ),
    enabled: !!projectId && (activeTab === 'styles' || activeTab === 'mindmap'),
  });

  const contentAuditsQuery = useQuery({
    queryKey: queryKeys.contentAudits(projectId),
    queryFn: () =>
      apiFetchWithRetry(
        (token) => contentAuditApi.list(token, projectId),
        getToken
      ),
    enabled: !!projectId && activeTab === 'audits',
  });

  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  useEffect(() => {
    if (contentAuditsQuery.data?.length && !selectedAuditId) {
      setSelectedAuditId(contentAuditsQuery.data[0].id);
    }
  }, [contentAuditsQuery.data, selectedAuditId]);

  const auditRowsQuery = useQuery({
    queryKey: queryKeys.contentAuditRows(projectId, selectedAuditId ?? ''),
    queryFn: () =>
      apiFetchWithRetry(
        (token) =>
          contentAuditApi.listRows(token, projectId, selectedAuditId!),
        getToken
      ),
    enabled: !!projectId && !!selectedAuditId && activeTab === 'audits',
  });

  const styleProfileQuery = useQuery({
    queryKey: queryKeys.styleProfile(projectId),
    queryFn: () =>
      apiFetchWithRetry(
        (token) => studioApi.getStyleProfile(token, projectId),
        getToken
      ),
    enabled: !!projectId && activeTab === 'styles',
  });

  const mindmapQuery = useQuery({
    queryKey: queryKeys.mindmap(projectId),
    queryFn: () =>
      apiFetchWithRetry(
        (token) => studioApi.getMindmap(token, projectId),
        getToken
      ),
    enabled: !!projectId && activeTab === 'mindmap',
  });

  const jobsQuery = useQuery({
    queryKey: queryKeys.agentJobs(projectId),
    queryFn: () =>
      apiFetchWithRetry(
        (token) => agentJobsApi.list(token, projectId),
        getToken
      ),
    enabled: !!projectId,
  });

  const [ideaDialogOpen, setIdeaDialogOpen] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [creatingIdea, setCreatingIdea] = useState(false);

  const [refDialogOpen, setRefDialogOpen] = useState(false);
  const [refPlatform, setRefPlatform] = useState<SocialPlatform>('INSTAGRAM');
  const [refUrl, setRefUrl] = useState('');
  const [refName, setRefName] = useState('');
  const [refNotes, setRefNotes] = useState('');
  const [creatingRef, setCreatingRef] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('INSTAGRAM');

  const [nodes, setNodes, onNodesChange] = useNodesState(buildDefaultMindmapNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_MINDMAP_EDGES);
  const [savingMindmap, setSavingMindmap] = useState(false);

  const [selectedCaptureId, setSelectedCaptureId] = useState<string | null>(
    captureIdParam
  );
  const [applyingCaptureId, setApplyingCaptureId] = useState<string | null>(null);
  const [runningAudit, setRunningAudit] = useState(false);

  useEffect(() => {
    if (captureIdParam) {
      setSelectedCaptureId(captureIdParam);
    }
  }, [captureIdParam]);

  useEffect(() => {
    if (styleCapturesQuery.data?.length && !selectedCaptureId) {
      setSelectedCaptureId(styleCapturesQuery.data[0].id);
    }
  }, [styleCapturesQuery.data, selectedCaptureId]);

  useEffect(() => {
    if (mindmapQuery.data) {
      setNodes(parseMindmapNodes(mindmapQuery.data.nodes));
      setEdges(parseMindmapEdges(mindmapQuery.data.edges));
    } else if (
      styleCapturesQuery.data?.[0]?.mindmapSeedNodes?.length &&
      activeTab === 'mindmap'
    ) {
      const seed = styleCapturesQuery.data[0];
      setNodes(parseMindmapNodes(seed.mindmapSeedNodes));
      setEdges(parseMindmapEdges(seed.mindmapSeedEdges));
    } else if (mindmapQuery.isSuccess && !mindmapQuery.data) {
      setNodes(buildDefaultMindmapNodes());
      setEdges(DEFAULT_MINDMAP_EDGES);
    }
  }, [mindmapQuery.data, mindmapQuery.isSuccess, styleCapturesQuery.data, activeTab, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const feedbackMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackStatus }) =>
      apiFetchWithRetry(
        (token) =>
          studioApi.patchFeedbackStatus(token, projectId, id, { status }),
        getToken
      ),
    onSuccess: () => invalidateProjectStudio(projectId),
  });

  const ideaStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PostIdeaStatus }) =>
      apiFetchWithRetry(
        (token) =>
          studioApi.patchPostIdeaStatus(token, projectId, id, { status }),
        getToken
      ),
    onSuccess: () => invalidateProjectStudio(projectId),
  });

  const contentStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContentStatus }) =>
      apiFetchWithRetry(
        (token) => contentApi.patchStatus(token, projectId, id, { status }),
        getToken
      ),
    onSuccess: () => invalidateProjectStudio(projectId),
  });

  const saveProfileMutation = useMutation({
    mutationFn: (body: {
      industry?: string;
      tone?: string;
      contentPillars?: string[];
      briefMarkdown: string;
    }) =>
      apiFetchWithRetry(
        (token) => studioApi.saveStyleProfile(token, projectId, body),
        getToken
      ),
    onSuccess: () => invalidateProjectStudio(projectId),
  });

  const feedbackColumns = useMemo(
    () =>
      (['OPEN', 'IN_REVIEW', 'RESOLVED'] as FeedbackStatus[]).map((id) => ({
        id,
        title: t(`studio.feedbackStatus.${id}`),
      })),
    []
  );

  const feedbackItems = useMemo(
    () =>
      (feedbackQuery.data ?? []).map((fb) => ({
        id: fb.id,
        columnId: fb.status,
        title: fb.feedbackText,
        subtitle: t(`studio.feedbackTarget.${fb.targetType}`),
      })),
    [feedbackQuery.data]
  );

  const ideaColumns = useMemo(
    () =>
      (['BACKLOG', 'READY', 'IN_PROGRESS', 'DONE'] as PostIdeaStatus[]).map(
        (id) => ({
          id,
          title: t(`studio.postIdeaStatus.${id}`),
        })
      ),
    []
  );

  const ideaItems = useMemo(
    () =>
      (ideasQuery.data ?? [])
        .filter((idea) => ideaColumns.some((col) => col.id === idea.status))
        .map((idea) => ({
        id: idea.id,
        columnId: idea.status,
        title: idea.title,
        subtitle: idea.description ?? undefined,
        })),
    [ideasQuery.data, ideaColumns]
  );

  const contentColumns = useMemo(
    () =>
      (
        [
          'IDEA',
          'DRAFTING',
          'PENDING_APPROVAL',
          'APPROVED',
          'PUBLISHED',
        ] as ContentStatus[]
      ).map((id) => ({
        id,
        title: t(`contentStatus.${id}`),
      })),
    []
  );

  const contentItems = useMemo(
    () =>
      (contentQuery.data ?? [])
        .filter((item) =>
          contentColumns.some((col) => col.id === item.status)
        )
        .map((item) => ({
          id: item.id,
          columnId: item.status,
          title: item.title,
          subtitle: t(`contentTypes.${item.type}`),
        })),
    [contentQuery.data, contentColumns]
  );

  const refsByPlatform = useMemo(() => {
    const map = new Map<SocialPlatform, StyleReferenceResponse[]>();
    for (const platform of STUDIO_PLATFORMS) {
      map.set(
        platform,
        (styleRefsQuery.data ?? []).filter((r) => r.platform === platform)
      );
    }
    return map;
  }, [styleRefsQuery.data]);

  const handleCreateIdeaFromReference = async (
    title: string,
    styleReferenceId: string
  ) => {
    await apiFetchWithRetry(
      (token) =>
        studioApi.createPostIdea(token, projectId, {
          title,
          styleReferenceId,
        }),
      getToken
    );
    invalidateProjectStudio(projectId);
    setTab('ideas');
  };

  const handleUseCaptureForPost = async (capture: StyleCaptureResponse) => {
    if (!capture.styleReferenceId) return;
    const title =
      capture.posts[0]?.text?.toString().slice(0, 80) ||
      t('studio.captures.defaultIdeaTitle');
    await handleCreateIdeaFromReference(title, capture.styleReferenceId);
  };

  const handleApplyCaptureToBrief = async (captureId: string) => {
    setApplyingCaptureId(captureId);
    try {
      await apiFetchWithRetry(
        (token) => studioApi.applyCaptureToBrief(token, projectId, captureId),
        getToken
      );
      invalidateProjectStudio(projectId);
    } finally {
      setApplyingCaptureId(null);
    }
  };

  const handleRunContentAudit = async (payload: {
    sourceUrl: string;
    platform: SocialPlatform;
    maxPages?: number;
  }) => {
    setRunningAudit(true);
    try {
      const audit = await apiFetchWithRetry(
        (token) => contentAuditApi.trigger(token, projectId, payload),
        getToken
      );
      setSelectedAuditId(audit.id);
      invalidateProjectStudio(projectId);
    } finally {
      setRunningAudit(false);
    }
  };

  const handleExportAudit = async (auditId: string) => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(
      `${resolveApiV1BaseUrl()}/projects/${projectId}/content-audits/${auditId}/export.xlsx`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-audit-${auditId}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateIdea = async () => {
    if (!ideaTitle.trim()) return;
    setCreatingIdea(true);
    try {
      await apiFetchWithRetry(
        (token) =>
          studioApi.createPostIdea(token, projectId, {
            title: ideaTitle.trim(),
            description: ideaDescription.trim() || undefined,
          }),
        getToken
      );
      invalidateProjectStudio(projectId);
      setIdeaDialogOpen(false);
      setIdeaTitle('');
      setIdeaDescription('');
    } finally {
      setCreatingIdea(false);
    }
  };

  const handleCreateRef = async () => {
    if (!refUrl.trim()) return;
    setCreatingRef(true);
    try {
      await apiFetchWithRetry(
        (token) =>
          studioApi.createStyleReference(token, projectId, {
            platform: refPlatform,
            sourceUrl: refUrl.trim(),
            displayName: refName.trim() || undefined,
            notesMarkdown: refNotes.trim() || undefined,
          }),
        getToken
      );
      invalidateProjectStudio(projectId);
      setRefDialogOpen(false);
      setRefUrl('');
      setRefName('');
      setRefNotes('');
    } finally {
      setCreatingRef(false);
    }
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      await apiFetchWithRetry(
        (token) => studioApi.analyzeStyleReference(token, projectId, id),
        getToken
      );
      invalidateProjectStudio(projectId);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleSaveMindmap = async () => {
    setSavingMindmap(true);
    try {
      await apiFetchWithRetry(
        (token) =>
          studioApi.saveMindmap(token, projectId, {
            nodes: nodes as unknown as Record<string, unknown>[],
            edges: edges as unknown as Record<string, unknown>[],
          }),
        getToken
      );
      invalidateProjectStudio(projectId);
    } finally {
      setSavingMindmap(false);
    }
  };

  const isLoading =
    (activeTab === 'feed' && feedQuery.isLoading) ||
    (activeTab === 'feedbacks' && feedbackQuery.isLoading) ||
    (activeTab === 'ideas' && ideasQuery.isLoading) ||
    (activeTab === 'content' && contentQuery.isLoading) ||
    (activeTab === 'styles' &&
      (styleRefsQuery.isLoading ||
        styleProfileQuery.isLoading ||
        styleCapturesQuery.isLoading)) ||
    (activeTab === 'audits' && contentAuditsQuery.isLoading) ||
    (activeTab === 'mindmap' && mindmapQuery.isLoading);

  return (
    <CrmPageShell className="min-w-0">
      <PageHeader description={t('studio.subtitle')} />
      {jobsQuery.data && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('studio.pipelineTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AgentPipelineViz jobs={jobsQuery.data} />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setTab(v as StudioTab)} className="min-w-0 w-full">
        <TabsList className="flex-wrap h-auto w-full justify-start">
          {STUDIO_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {t(`studio.tabs.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {isLoading ? (
          <Skeleton className="mt-4 h-64 w-full rounded-lg" />
        ) : (
          <>
            <TabsContent value="feed">
              <FeedTimeline events={feedQuery.data?.items ?? []} />
            </TabsContent>

            <TabsContent value="feedbacks">
              <KanbanBoard
                columns={feedbackColumns}
                items={feedbackItems}
                disabled={!canWrite || feedbackMutation.isPending}
                onMove={(itemId, toColumnId) =>
                  feedbackMutation.mutate({
                    id: itemId,
                    status: toColumnId as FeedbackStatus,
                  })
                }
              />
            </TabsContent>

            <TabsContent value="ideas">
              <div className="mb-4 flex justify-end">
                <Button
                  size="sm"
                  disabled={!canWrite}
                  onClick={() => setIdeaDialogOpen(true)}
                >
                  <PlusIcon data-icon="inline-start" />
                  {t('studio.ideas.create')}
                </Button>
              </div>
              <KanbanBoard
                columns={ideaColumns}
                items={ideaItems}
                disabled={!canWrite || ideaStatusMutation.isPending}
                onMove={(itemId, toColumnId) =>
                  ideaStatusMutation.mutate({
                    id: itemId,
                    status: toColumnId as PostIdeaStatus,
                  })
                }
              />
            </TabsContent>

            <TabsContent value="content">
              <KanbanBoard
                columns={contentColumns}
                items={contentItems}
                disabled={!canWrite || contentStatusMutation.isPending}
                onMove={(itemId, toColumnId) =>
                  contentStatusMutation.mutate({
                    id: itemId,
                    status: toColumnId as ContentStatus,
                  })
                }
              />
            </TabsContent>

            <TabsContent value="styles">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <ToggleGroup
                    type="single"
                    value={selectedPlatform}
                    onValueChange={(value) => {
                      if (value) setSelectedPlatform(value as SocialPlatform);
                    }}
                    variant="pill-category"
                    className="flex flex-wrap justify-start gap-2"
                  >
                    {STUDIO_PLATFORMS.map((platform) => (
                      <ToggleGroupItem key={platform} value={platform} className="text-sm">
                        {t(`studio.platforms.${platform}`)}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canWrite}
                    onClick={() => {
                      setRefPlatform(selectedPlatform);
                      setRefDialogOpen(true);
                    }}
                  >
                    <PlusIcon data-icon="inline-start" />
                    {t('studio.styles.addReference')}
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {(refsByPlatform.get(selectedPlatform) ?? []).map((ref) => (
                    <StyleReferenceCard
                      key={ref.id}
                      reference={ref}
                      disabled={!canWrite}
                      analyzing={analyzingId === ref.id}
                      onAnalyze={canWrite ? handleAnalyze : undefined}
                      onUseForPost={
                        canWrite
                          ? (reference) =>
                              void handleCreateIdeaFromReference(
                                reference.displayName ||
                                  t('studio.captures.defaultIdeaTitle'),
                                reference.id
                              )
                          : undefined
                      }
                    />
                  ))}
                </div>

                <StyleCapturePanel
                  captures={styleCapturesQuery.data ?? []}
                  selectedCaptureId={selectedCaptureId}
                  onSelectCapture={(id) => {
                    setSelectedCaptureId(id);
                    const next = new URLSearchParams(searchParams);
                    next.set('captureId', id);
                    setSearchParams(next, { replace: true });
                  }}
                  onUseForPost={
                    canWrite ? (capture) => void handleUseCaptureForPost(capture) : undefined
                  }
                  onApplyToBrief={
                    canWrite
                      ? (captureId) => void handleApplyCaptureToBrief(captureId)
                      : undefined
                  }
                  applyingId={applyingCaptureId}
                  disabled={!canWrite}
                />

                {(refsByPlatform.get(selectedPlatform) ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t('studio.styles.empty')}
                  </p>
                )}

                <DesignBriefPanel
                  profile={styleProfileQuery.data ?? null}
                  disabled={!canWrite}
                  saving={saveProfileMutation.isPending}
                  onSave={(data) => saveProfileMutation.mutate(data)}
                />
              </div>
            </TabsContent>

            <TabsContent value="audits">
              <ContentAuditPanel
                audits={contentAuditsQuery.data ?? []}
                rows={auditRowsQuery.data ?? []}
                selectedAuditId={selectedAuditId}
                onSelectAudit={setSelectedAuditId}
                onTrigger={(payload) => void handleRunContentAudit(payload)}
                onExport={(auditId) => void handleExportAudit(auditId)}
                running={runningAudit}
                disabled={!canWrite}
              />
            </TabsContent>

            <TabsContent value="mindmap">
              <div className="mb-4 flex justify-end">
                <Button
                  size="sm"
                  disabled={!canWrite || savingMindmap}
                  onClick={() => void handleSaveMindmap()}
                >
                  {savingMindmap ? t('common.loading') : t('studio.mindmap.save')}
                </Button>
              </div>
              <Card className="h-[min(500px,50vh)] min-w-0 w-full overflow-hidden p-0">
                <CardContent className="h-full p-0">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  nodesDraggable={canWrite}
                  nodesConnectable={canWrite}
                  elementsSelectable={canWrite}
                >
                  <Background />
                  <Controls />
                  <MiniMap />
                </ReactFlow>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      <Dialog open={ideaDialogOpen} onOpenChange={setIdeaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('studio.ideas.createTitle')}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>{t('studio.ideas.titleLabel')}</FieldLabel>
              <Input
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder={t('studio.ideas.titlePlaceholder')}
              />
            </Field>
            <Field>
              <FieldLabel>{t('studio.ideas.descriptionLabel')}</FieldLabel>
              <Textarea
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                placeholder={t('studio.ideas.descriptionPlaceholder')}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIdeaDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={creatingIdea || !ideaTitle.trim()}
              onClick={() => void handleCreateIdea()}
            >
              {creatingIdea ? t('common.loading') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={refDialogOpen} onOpenChange={setRefDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('studio.styles.addReferenceTitle')}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>{t('studio.styles.platform')}</FieldLabel>
              <Input value={t(`studio.platforms.${refPlatform}`)} disabled />
            </Field>
            <Field>
              <FieldLabel>{t('studio.styles.sourceUrl')}</FieldLabel>
              <Input
                value={refUrl}
                onChange={(e) => setRefUrl(e.target.value)}
                placeholder={t('marketing.studio.urlPlaceholder')}
              />
            </Field>
            <Field>
              <FieldLabel>{t('studio.styles.displayName')}</FieldLabel>
              <Input
                value={refName}
                onChange={(e) => setRefName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>{t('studio.styles.notes')}</FieldLabel>
              <Textarea
                value={refNotes}
                onChange={(e) => setRefNotes(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={creatingRef || !refUrl.trim()}
              onClick={() => void handleCreateRef()}
            >
              {creatingRef ? t('common.loading') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrmPageShell>
  );
}
