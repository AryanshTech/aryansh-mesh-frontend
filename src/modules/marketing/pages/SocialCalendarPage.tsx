import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, CalendarDays, Brain } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CardGridSkeleton } from '@/shared/components/Skeletons';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import { FormDialog } from '@/shared/components/FormDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import { useMarketingProjectGuard } from '@/modules/marketing/hooks/use-marketing-project-guard';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import { MarketingBackLink } from '@/modules/marketing/components/MarketingBackLink';
import { SocialPlatformActions } from '@/modules/marketing/components/SocialPlatformActions';
import {
  useSocialPosts,
  useCreateSocialPost,
  useApproveSocialPost,
  useRejectSocialPost,
  type SocialPost,
  type SocialPostInput,
  type SocialPlatform,
} from '@/modules/marketing/api/use-social-posts';
import { platformColors } from '@/design-system/tokens/platformColors';
import { useBrandMemory, useSaveBrandMemory } from '@/modules/marketing/api/use-brand-memory';
import { appendPlatformStyleToMemory, buildSocialDraftContent } from '@/modules/marketing/lib/social-content';

const PLATFORMS: SocialPlatform[] = [
  'LINKEDIN',
  'X',
  'INSTAGRAM',
  'TIKTOK',
  'YOUTUBE',
  'FACEBOOK',
  'THREADS',
];

const NEW_POST: SocialPostInput = { content: '', platform: 'LINKEDIN' };

function postTone(status: SocialPost['status']) {
  if (status === 'APPROVED') return 'success' as const;
  if (status === 'SCHEDULED') return 'info' as const;
  if (status === 'PENDING_APPROVAL') return 'warning' as const;
  if (status === 'REJECTED') return 'danger' as const;
  return 'default' as const;
}

function PlatformBadge({ platform }: { platform: SocialPlatform }) {
  const { t } = useTranslation();
  const color = platformColors[platform];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {t(`marketing.social.platforms.${platform}`)}
    </span>
  );
}

export default function SocialCalendarPage() {
  const { t } = useTranslation();
  const { projectId: urlProjectId } = useParams<{ projectId: string }>();
  const { tenantId } = useTenantPath();
  const { projectId, isResolving, projectMismatch, queriesEnabled } =
    useMarketingProjectGuard(tenantId, urlProjectId);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: brandMemory } = useBrandMemory(projectId, tenantId, queriesEnabled);
  const saveMemory = useSaveBrandMemory(projectId ?? '', tenantId);
  const { data, isLoading, isError, refetch } = useSocialPosts(projectId, tenantId, queriesEnabled);
  const createMutation = useCreateSocialPost(projectId ?? '', tenantId);
  const approveMutation = useApproveSocialPost(projectId ?? '', tenantId);
  const rejectMutation = useRejectSocialPost(projectId ?? '', tenantId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<SocialPostInput>({ ...NEW_POST });
  const [rememberPostId, setRememberPostId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('compose') !== '1') return;
    const platform = searchParams.get('platform') as SocialPlatform | null;
    const topic = searchParams.get('topic') ?? '';
    const brief = searchParams.get('brief') ?? '';
    if (platform && PLATFORMS.includes(platform)) {
      setDraft({
        platform,
        content: buildSocialDraftContent({ platform, topic, brief: brief || undefined }),
      });
      setDialogOpen(true);
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const posts = data?.items ?? [];

  const closeDialog = () => {
    setDialogOpen(false);
    setDraft({ ...NEW_POST });
  };

  const onCreate = async () => {
    if (!draft.content.trim()) {
      toast.error(t('marketing.social.contentRequired'));
      return;
    }
    try {
      await createMutation.mutateAsync({
        content: draft.content.trim(),
        platform: draft.platform,
        scheduledDate: draft.scheduledDate?.trim() || undefined,
      });
      toast.success(t('marketing.social.postCreated'));
      closeDialog();
    } catch (e) {
      toast.error((e as Error).message || t('marketing.social.createFailed'));
    }
  };

  const onApprove = async (postId: string) => {
    try {
      await approveMutation.mutateAsync(postId);
      toast.success(t('marketing.social.postApproved'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.social.approveFailed'));
    }
  };

  const onReject = async (postId: string) => {
    try {
      await rejectMutation.mutateAsync({
        postId,
        feedback: t('marketing.social.rejectFeedback'),
      });
      toast.success(t('marketing.social.postRejected'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.social.rejectFailed'));
    }
  };

  const onRememberStyle = async (post: SocialPost) => {
    setRememberPostId(post.id);
    try {
      const next = appendPlatformStyleToMemory(
        brandMemory?.contentMarkdown ?? '',
        post.platform,
        post.content,
      );
      await saveMemory.mutateAsync(next);
      toast.success(t('marketing.social.styleSaved'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.social.styleSaveFailed'));
    } finally {
      setRememberPostId(null);
    }
  };

  return (
    <PageShell>
      <MarketingBackLink
        to="/marketing"
        label={t('marketing.threads.backToWorkspace')}
        className="mb-4"
      />
      {projectId ? (
        <SocialPlatformActions
          projectId={projectId}
          tenantId={tenantId}
          className="mb-6"
        />
      ) : null}
      <PageHeader
        title={t('marketing.socialCalendarTitle')}
        description={t('marketing.socialCalendarSubtitle')}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            {t('marketing.social.addPost')}
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <CardGridSkeleton />
        ) : isResolving || projectMismatch ? (
          <CardGridSkeleton />
        ) : isError ? (
          <ErrorState title={t('marketing.social.errorTitle')} onRetry={() => void refetch()} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<CalendarDays />}
            title={t('marketing.social.emptyTitle')}
            description={t('marketing.social.emptyDescription')}
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="size-4" />
                {t('marketing.social.addPost')}
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post: SocialPost) => (
              <div
                key={post.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      label={t(`marketing.social.status.${post.status}`)}
                      tone={postTone(post.status)}
                    />
                    {post.platform ? (
                      <PlatformBadge platform={post.platform} />
                    ) : null}
                  </div>
                  {post.scheduledDate ? (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {post.scheduledDate}
                    </span>
                  ) : null}
                </div>
                <p className="typo-body-sm text-foreground line-clamp-4">{post.content}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {post.status === 'DRAFT' || post.status === 'PENDING_APPROVAL' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void onApprove(post.id)}
                        disabled={approveMutation.isPending && approveMutation.variables === post.id}
                      >
                        {t('marketing.approve')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => void onReject(post.id)}
                        disabled={
                          rejectMutation.isPending &&
                          rejectMutation.variables?.postId === post.id
                        }
                      >
                        {t('marketing.reject')}
                      </Button>
                    </>
                  ) : null}
                  {post.status === 'APPROVED' || post.status === 'SCHEDULED' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void onRememberStyle(post)}
                      disabled={rememberPostId === post.id || saveMemory.isPending}
                    >
                      <Brain className="size-3.5" />
                      {t('marketing.social.rememberStyle')}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FormDialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('marketing.social.newPost')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sp-content">{t('marketing.social.fieldContent')}</Label>
              <Textarea
                id="sp-content"
                rows={5}
                value={draft.content}
                onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sp-platform">{t('marketing.social.platform')}</Label>
              <Select
                value={draft.platform}
                onValueChange={(value) =>
                  setDraft((d) => ({ ...d, platform: value as SocialPostInput['platform'] }))
                }
              >
                <SelectTrigger id="sp-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {t(`marketing.social.platforms.${platform}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sp-date">{t('marketing.social.scheduleDate')}</Label>
              <Input
                id="sp-date"
                type="date"
                value={draft.scheduledDate ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, scheduledDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={closeDialog}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={() => void onCreate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? t('marketing.social.creating') : t('marketing.social.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </PageShell>
  );
}
