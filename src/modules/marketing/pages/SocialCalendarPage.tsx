import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, CalendarDays } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CardGridSkeleton } from '@/shared/components/Skeletons';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import {
  useSocialPosts,
  useCreateSocialPost,
  useApproveSocialPost,
  useRejectSocialPost,
  type SocialPost,
  type SocialPostInput,
} from '@/modules/marketing/api/use-social-posts';

const PLATFORMS = [
  'LINKEDIN',
  'X',
  'INSTAGRAM',
  'TIKTOK',
  'YOUTUBE',
  'FACEBOOK',
  'THREADS',
] as const;

const NEW_POST: SocialPostInput = { content: '', platform: 'LINKEDIN' };

function postTone(status: SocialPost['status']) {
  if (status === 'APPROVED') return 'success' as const;
  if (status === 'SCHEDULED') return 'info' as const;
  if (status === 'PENDING_APPROVAL') return 'warning' as const;
  return 'default' as const;
}

export default function SocialCalendarPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { tenantId } = useTenantPath();

  const { data, isLoading, isError, refetch } = useSocialPosts(projectId, tenantId);
  const createMutation = useCreateSocialPost(projectId ?? '', tenantId);
  const approveMutation = useApproveSocialPost(projectId ?? '', tenantId);
  const rejectMutation = useRejectSocialPost(projectId ?? '', tenantId);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<SocialPostInput>({ ...NEW_POST });

  const posts = data?.items ?? [];

  const onCreate = async () => {
    if (!draft.content.trim()) { toast.error('Content is required'); return; }
    try {
      await createMutation.mutateAsync({
        content: draft.content.trim(),
        platform: draft.platform,
        scheduledDate: draft.scheduledDate?.trim() || undefined,
      });
      toast.success('Post created');
      setDrawerOpen(false);
      setDraft({ ...NEW_POST });
    } catch (e) {
      toast.error((e as Error).message || 'Failed to create post');
    }
  };

  const onApprove = async (postId: string) => {
    try {
      await approveMutation.mutateAsync(postId);
      toast.success('Post approved');
    } catch (e) {
      toast.error((e as Error).message || 'Failed to approve');
    }
  };

  const onReject = async (postId: string) => {
    try {
      await rejectMutation.mutateAsync({
        postId,
        feedback: t('marketing.social.rejectFeedback'),
      });
      toast.success('Post rejected');
    } catch (e) {
      toast.error((e as Error).message || 'Failed to reject');
    }
  };

  const masterContent = (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState title="Failed to load posts" onRetry={() => void refetch()} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<CalendarDays />}
          title="No posts yet"
          description="Create social media posts for this project."
          action={<Button onClick={() => setDrawerOpen(true)}><Plus className="size-4" />Add Post</Button>}
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
                  <StatusBadge label={post.status} tone={postTone(post.status)} />
                  {post.platform ? (
                    <span className="text-xs text-muted-foreground">{post.platform}</span>
                  ) : null}
                </div>
                {post.scheduledDate ? (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {post.scheduledDate}
                  </span>
                ) : null}
              </div>
              <p className="typo-body-sm text-foreground line-clamp-4">{post.content}</p>
              {post.status === 'DRAFT' || post.status === 'PENDING_APPROVAL' ? (
                <div className="flex items-center gap-2">
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
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title={t('marketing.socialCalendarTitle')}
        description={t('marketing.socialCalendarSubtitle')}
        actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="size-4" />Add Post</Button>}
      />
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={(o) => { setDrawerOpen(o); if (!o) setDraft({ ...NEW_POST }); }}
        title="New Social Post"
        master={masterContent}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => { setDrawerOpen(false); setDraft({ ...NEW_POST }); }}>Cancel</Button>
            <Button onClick={() => void onCreate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sp-content">Content *</Label>
            <Textarea id="sp-content" rows={5} value={draft.content} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} />
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
                    {platform}
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
      </DetailDrawer>
    </PageShell>
  );
}
