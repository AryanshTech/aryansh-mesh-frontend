import { useCallback, useEffect, useRef, useState } from 'react';
import { FileTextIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  downloadBlob,
  exportFilename,
  messagesApi,
  outputsApi,
  projectsApi,
  streamChat,
  threadsApi,
} from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { BriefEditor } from '@/modules/marketing/components/brief/BriefEditor';
import { ChatComposer } from '@/modules/marketing/components/chat/ChatComposer';
import { MessageList } from '@/modules/marketing/components/chat/MessageList';
import { OutputsPanel } from '@/modules/marketing/components/outputs/OutputsPanel';
import { ConfirmDialog } from '@/shared/components/crm/ConfirmDialog';
import { ShellPageActions } from '@/shared/components/layout/ShellPageActions';
import { layout } from '@/design-system/tokens/layout';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { t } from '@/core/i18n';
import type {
  ChatCommandResponse,
  MessageResponse,
  OutputResponse,
  OutputType,
  SseMessageEndEvent,
} from '@/modules/marketing/types/api';
import { Alert, AlertDescription } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import { LinearPageHeader } from '@/shared/components/linear';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { Spinner } from '@/design-system/components/ui/spinner';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/design-system/components/ui/resizable';

type FilterType = OutputType | 'ALL';

export function ThreadWorkspacePage() {
  const { projectId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const { expandCompany } = useSidebarNavContext();

  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [commands, setCommands] = useState<ChatCommandResponse | null>(null);
  const [outputs, setOutputs] = useState<OutputResponse[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [briefOpen, setBriefOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingInsert, setPendingInsert] = useState<string | null>(null);
  const [deleteOutputId, setDeleteOutputId] = useState<string | null>(null);
  const [deletingOutput, setDeletingOutput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadOutputs = useCallback(
    async (type?: OutputType) => {
      const res = await apiFetchWithRetry(
        (token) => outputsApi.list(token, projectId, type),
        getToken
      );
      setOutputs(res.items);
    },
    [projectId, getToken]
  );

  const loadCommands = useCallback(
    async (tid: string) => {
      const res = await apiFetchWithRetry(
        (token) => messagesApi.chatCommands(token, tid),
        getToken
      );
      setCommands(res);
    },
    [getToken]
  );

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const project = await apiFetchWithRetry(
        (token) => projectsApi.get(token, projectId),
        getToken
      );
      expandCompany(project.companyId);

      let threads = await apiFetchWithRetry(
        (token) => threadsApi.listByProject(token, projectId),
        getToken
      );

      if (threads.length === 0 && canWrite) {
        const created = await apiFetchWithRetry(
          (token) =>
            threadsApi.create(token, projectId, { title: t('workspace.mainThread') }),
          getToken
        );
        threads = [created];
      }

      const tid = threads[0]?.threadId;
      if (!tid) return;

      setThreadId(tid);

      const [msgRes] = await Promise.all([
        apiFetchWithRetry(
          (token) => messagesApi.list(token, tid),
          getToken
        ),
        loadCommands(tid),
        loadOutputs(),
      ]);
      setMessages(msgRes.items);
    } finally {
      setLoading(false);
    }
  }, [projectId, getToken, canWrite, loadCommands, loadOutputs, expandCompany]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, streaming]);

  useEffect(() => {
    const type = filter === 'ALL' ? undefined : filter;
    void loadOutputs(type);
  }, [filter, loadOutputs]);

  const handleSend = async (content: string, attachmentIds: string[]) => {
    if (!threadId) return;
    const token = await getToken();
    if (!token) return;

    const optimisticUser: MessageResponse = {
      messageId: `temp-user-${Date.now()}`,
      role: 'USER',
      content,
      attachmentIds,
      incomplete: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setStreaming(true);

    let assistantId = '';
    let assistantContent = '';

    try {
      await streamChat(threadId, token, { content, attachmentIds }, (event, data) => {
        if (event === 'message_start') {
          const start = data as { messageId: string };
          assistantId = start.messageId;
          setMessages((prev) => [
            ...prev,
            {
              messageId: assistantId,
              role: 'ASSISTANT',
              content: '',
              attachmentIds: [],
              incomplete: true,
              createdAt: new Date().toISOString(),
            },
          ]);
        }

        if (event === 'token') {
          const tokenEvent = data as { text: string };
          assistantContent += tokenEvent.text;
          setMessages((prev) =>
            prev.map((m) =>
              m.messageId === assistantId ? { ...m, content: assistantContent } : m
            )
          );
        }

        if (event === 'message_end') {
          const end = data as SseMessageEndEvent;
          setMessages((prev) =>
            prev.map((m) =>
              m.messageId === end.messageId ? { ...m, incomplete: false } : m
            )
          );

          if (end.action === 'SAVED' && end.savedLabel) {
            toast.success(t('workspace.savedAs', { label: end.savedLabel }));
            void loadOutputs(filter === 'ALL' ? undefined : filter);
            if (threadId) void loadCommands(threadId);
          }
        }

        if (event === 'error') {
          const err = data as { message: string };
          toast.error(err.message);
        }
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleDeleteOutput = async () => {
    if (!canWrite || !deleteOutputId) return;
    setDeletingOutput(true);
    try {
      await apiFetchWithRetry(
        (token) => outputsApi.delete(token, projectId, deleteOutputId),
        getToken
      );
      setOutputs((prev) => prev.filter((o) => o.id !== deleteOutputId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteOutputId);
        return next;
      });
      toast.success(t('workspace.deleteSuccess'));
      setDeleteOutputId(null);
    } catch {
      toast.error(t('workspace.deleteError'));
    } finally {
      setDeletingOutput(false);
    }
  };

  const handleExport = async (format: 'CSV' | 'XLSX') => {
    const token = await getToken();
    if (!token) return;
    try {
      const blob = await outputsApi.export(token, projectId, {
        format,
        outputIds: selectedIds.size > 0 ? [...selectedIds] : undefined,
      });
      downloadBlob(blob, exportFilename(format));
      toast.success(t('workspace.exportXlsx'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  if (loading) {
    return (
      <CrmPageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="size-8" />
        </div>
      </CrmPageShell>
    );
  }

  return (
    <CrmPageShell className={layout.dashboard.pageViewport}>
      <LinearPageHeader
        title={t('nav.workspace')}
        description={t('nav.workspaceDescription')}
        actions={
          canWrite ? (
            <ShellPageActions>
              <Button size="sm" variant="outline" onClick={() => setBriefOpen(true)}>
                <FileTextIcon data-icon="inline-start" />
                {t('workspace.editBrief')}
              </Button>
            </ShellPageActions>
          ) : undefined
        }
      />
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-0 flex-1 rounded-lg border"
      >
        <ResizablePanel defaultSize={65} minSize={40} className="min-h-0">
          <div className="flex h-full min-h-0 flex-col p-4">
            {!canWrite && (
              <Alert className="mb-4 shrink-0">
                <AlertDescription>{t('workspace.viewerReadOnly')}</AlertDescription>
              </Alert>
            )}
            <div
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
              aria-live="polite"
              aria-busy={streaming}
            >
              <MessageList messages={messages} streaming={streaming} />
              {streaming ? (
                <span className="sr-only">{t('workspace.streaming')}</span>
              ) : null}
              <div ref={messagesEndRef} />
            </div>
            {threadId && (
              <ChatComposer
                disabled={!canWrite || streaming}
                commands={commands}
                threadId={threadId}
                getToken={getToken}
                pendingInsert={pendingInsert}
                onPendingInsertConsumed={() => setPendingInsert(null)}
                onSend={handleSend}
              />
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35} minSize={25} className="min-h-0">
          <OutputsPanel
            outputs={outputs}
            filter={filter}
            onFilterChange={setFilter}
            selectedIds={selectedIds}
            onToggleSelect={(id) =>
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
            }
            onInsertLabel={(label) => setPendingInsert(`@${label}`)}
            onDelete={(id) => setDeleteOutputId(id)}
            onExport={handleExport}
            canWrite={canWrite}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <ConfirmDialog
        open={Boolean(deleteOutputId)}
        onOpenChange={(open) => !open && setDeleteOutputId(null)}
        title={t('common.confirmDelete')}
        description={t('workspace.deleteConfirm')}
        onConfirm={() => void handleDeleteOutput()}
        loading={deletingOutput}
      />

      <BriefEditor
        projectId={projectId}
        open={briefOpen}
        onClose={() => setBriefOpen(false)}
      />
    </CrmPageShell>
  );
}
