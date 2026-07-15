import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, CalendarDays, Brain } from 'lucide-react';
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
import { cn } from '@/design-system/lib/utils';
import { platformColors } from '@/design-system/tokens/platformColors';
import {
  useSocialPosts,
  useCreateSocialPost,
  useApproveSocialPost,
  useRejectSocialPost,
  useScheduleSocialPost,
  type SocialPost,
  type SocialPostInput,
  type SocialPlatform,
} from '@/modules/marketing/api/use-social-posts';
import { useBrandMemory, useSaveBrandMemory } from '@/modules/marketing/api/use-brand-memory';
import { appendPlatformStyleToMemory, buildSocialDraftContent } from '@/modules/marketing/lib/social-content';
import {
  addDaysIso,
  getCadenceDays,
  type ProfilePlatform,
} from '@/modules/marketing/lib/platform-profile';

const PLATFORMS: SocialPlatform[] = [
  'LINKEDIN',
  'INSTAGRAM',
  'X',
  'FACEBOOK',
  'THREADS',
  'TIKTOK',
  'YOUTUBE',
];

const FILTER_CHIPS: Array<SocialPlatform | 'ALL'> = ['ALL', 'LINKEDIN', 'INSTAGRAM', 'X'];

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

interface Props {
  projectId: string;
  tenantId?: string;
}

export function SocialCalendarTab({ projectId, tenantId }: Props) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: brandMemory } = useBrandMemory(projectId, tenantId);
  const saveMemory = useSaveBrandMemory(projectId, tenantId);
  const { data, isLoading, isError, refetch } = useSocialPosts(projectId, tenantId);
  const createMutation = useCreateSocialPost(projectId, tenantId);
  const approveMutation = useApproveSocialPost(projectId, tenantId);
  const rejectMutation = useRejectSocialPost(projectId, tenantId);
  const scheduleMutation = useScheduleSocialPost(projectId, tenantId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<SocialPostInput>({ ...NEW_POST });
  const [rememberPostId, setRememberPostId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const platformFilter = searchParams.get('platform') as SocialPlatform | null;

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
    const next = new URLSearchParams(searchParams);
    next.delete('compose');
    next.delete('topic');
    next.delete('brief');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const allPosts = data?.items ?? [];
  const posts =
    platformFilter && PLATFORMS.includes(platformFilter)
      ? allPosts.filter((p) => p.platform === platformFilter)
      : allPosts;

  const timingByPlatform = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const platforms: ProfilePlatform[] = ['LINKEDIN', 'INSTAGRAM', 'X'];
    return platforms.map((plat) => {
      const platPosts = allPosts.filter((p) => p.platform === plat);
      const lastGenerated = platPosts.reduce<string | null>((best, p) => {
        if (!best || p.createdAt > best) return p.createdAt;
        return best;
      }, null);
      const upcoming = platPosts
        .map((p) => p.scheduledDate)
        .filter((d): d is string => !!d && d >= today)
        .sort();
      const cadence = getCadenceDays(plat, brandMemory?.contentMarkdown);
      const nextFromCadence = lastGenerated
        ? addDaysIso(new Date(lastGenerated), cadence)
        : addDaysIso(new Date(), cadence);
      const nextGenerate = upcoming[0] ?? nextFromCadence;
      return { platform: plat, lastGenerated, nextGenerate, count: platPosts.length };
    });
  }, [allPosts, brandMemory?.contentMarkdown]);

  const formatGenerated = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso.slice(0, 10);
    }
  };

  const setFilter = (value: SocialPlatform | 'ALL') => {
    const next = new URLSearchParams(searchParams);
    if (value === 'ALL') next.delete('platform');
    else next.set('platform', value);
    setSearchParams(next, { replace: true });
  };

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
    setBusyId(postId);
    try {
      await approveMutation.mutateAsync(postId);
      toast.success(t('marketing.social.postApproved'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.social.approveFailed'));
    } finally {
      setBusyId(null);
    }
  };

  const onReject = async (postId: string) => {
    setBusyId(postId);
    try {
      await rejectMutation.mutateAsync({
        postId,
        feedback: t('marketing.social.rejectFeedback'),
      });
      toast.success(t('marketing.social.postRejected'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.social.rejectFailed'));
    } finally {
      setBusyId(null);
    }
  };

  const onSchedule = async (postId: string) => {
    setBusyId(postId);
    try {
      await scheduleMutation.mutateAsync(postId);
      toast.success(t('marketing.desk.linkedinScheduled'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.social.approveFailed'));
    } finally {
      setBusyId(null);
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
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <p className="typo-eyebrow-upper text-faint">{t('marketing.workspace.tabs.calendar')}</p>
        <h2 className="mt-1 typo-card-title text-foreground text-xl">
          {t('marketing.socialCalendarTitle')}
        </h2>
        <p className="mt-1 max-w-2xl typo-body-sm text-muted-foreground">
          {t('marketing.socialCalendarSubtitle')}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {FILTER_CHIPS.map((chip) => {
              const active =
                chip === 'ALL' ? !platformFilter : platformFilter === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFilter(chip)}
                  className={cn(
                    'rounded-full px-3 py-1.5 typo-eyebrow transition-colors',
                    active
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:text-foreground',
                  )}
                >
                  {chip === 'ALL'
                    ? t('marketing.social.filterAll')
                    : t(`marketing.social.platforms.${chip}`)}
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            onClick={() => {
              if (platformFilter && PLATFORMS.includes(platformFilter)) {
                setDraft({ content: '', platform: platformFilter });
              }
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            {t('marketing.social.addPost')}
          </Button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {timingByPlatform.map(({ platform: plat, lastGenerated, nextGenerate, count }) => (
            <div
              key={plat}
              className="rounded-xl border border-border bg-muted/30 px-3 py-2.5"
            >
              <p className="typo-eyebrow font-medium" style={{ color: platformColors[plat] }}>
                {t(`marketing.social.platforms.${plat}`)}
                <span className="ml-1 text-muted-foreground">({count})</span>
              </p>
              <p className="mt-1 typo-eyebrow text-muted-foreground">
                {t('marketing.calendar.generated')}:{' '}
                <span className="text-foreground">
                  {lastGenerated
                    ? formatGenerated(lastGenerated)
                    : t('marketing.calendar.never')}
                </span>
              </p>
              <p className="typo-eyebrow text-muted-foreground">
                {t('marketing.calendar.nextGenerate')}:{' '}
                <span className="text-foreground">{nextGenerate}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState title={t('marketing.social.errorTitle')} onRetry={() => void refetch()} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<CalendarDays />}
          title={t('marketing.social.emptyTitle')}
          description={t('marketing.social.emptyDescription')}
          action={
            <Button type="button" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              {t('marketing.social.addPost')}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => {
            const busy = busyId === post.id;
            return (
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
                    {post.platform ? <PlatformBadge platform={post.platform} /> : null}
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {t('marketing.calendar.generated')}: {formatGenerated(post.createdAt)}
                    </span>
                    {post.scheduledDate ? (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {t('marketing.calendar.scheduled')}: {post.scheduledDate}
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="typo-body-sm text-foreground line-clamp-4">{post.content}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {post.status === 'DRAFT' || post.status === 'PENDING_APPROVAL' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void onApprove(post.id)}
                      >
                        {t('marketing.approve')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={busy}
                        onClick={() => void onReject(post.id)}
                      >
                        {t('marketing.reject')}
                      </Button>
                    </>
                  ) : null}
                  {post.status === 'APPROVED' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void onSchedule(post.id)}
                    >
                      <CalendarDays className="size-3.5" />
                      {t('marketing.desk.linkedinSchedule')}
                    </Button>
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
            );
          })}
        </div>
      )}

      <FormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
          else setDialogOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('marketing.social.newPost')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cal-content">{t('marketing.social.fieldContent')}</Label>
              <Textarea
                id="cal-content"
                rows={5}
                value={draft.content}
                onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cal-platform">{t('marketing.social.platform')}</Label>
              <Select
                value={draft.platform}
                onValueChange={(value) =>
                  setDraft((d) => ({ ...d, platform: value as SocialPostInput['platform'] }))
                }
              >
                <SelectTrigger id="cal-platform">
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
              <Label htmlFor="cal-date">{t('marketing.social.scheduleDate')}</Label>
              <Input
                id="cal-date"
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
            <Button
              type="button"
              onClick={() => void onCreate()}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending
                ? t('marketing.social.creating')
                : t('marketing.social.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </div>
  );
}
