import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  CalendarDays,
  Check,
  Copy,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { Button } from '@/design-system/components/ui/button';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { cn } from '@/design-system/lib/utils';
import { platformColors } from '@/design-system/tokens/platformColors';
import {
  useCreativeRuns,
  useCreativeRecipes,
  useUpdateCreativeRun,
  useGenerateCreativeImage,
  type CreativeRun,
  type CreativeRecipe,
  type RunStatus,
} from '@/modules/marketing/api/use-creative';
import { useCreateThread } from '@/modules/marketing/api/use-threads';
import { syncThreadChat } from '@/modules/marketing/api/stream-thread-chat';
import {
  useCreateSocialPost,
  type SocialPlatform,
} from '@/modules/marketing/api/use-social-posts';
import { useCurrentBrandIdentity } from '@/modules/marketing/api/use-brand-identity';
import { buildBrandImagePromptRequest } from '@/modules/marketing/lib/brand-image-prompt';
import { buildLinkedInCommentPrompt, buildPromptFromGenerationBrief, displayRecipeTitle } from '@/modules/marketing/lib/social-content';
import {
  briefFromRecipe,
  emptyGenerationBrief,
  parseRunNotes,
  serializeRunNotes,
  type GenerationBrief,
  type RunNotes,
} from '@/modules/marketing/lib/run-notes';
import { SocialPlatformActions } from '@/modules/marketing/components/SocialPlatformActions';
import { useBrandMemory } from '@/modules/marketing/api/use-brand-memory';
import {
  addDaysIso,
  getCadenceDays,
  type ProfilePlatform,
} from '@/modules/marketing/lib/platform-profile';
import { resolveCreativeAssetUrl } from '@/modules/marketing/api/resolve-creative-asset-url';
import { useContentFeedbackRating } from '@/modules/marketing/api/use-content-feedback';
import {
  buildCaptionGenerationPrompt,
  formatQueuePostsAsMarkdown,
  parseQueuePosts,
  type QueuePost,
} from '@/modules/marketing/lib/parse-social-output';
import { Input } from '@/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';

interface Props {
  projectId: string;
  tenantId?: string;
  initialRunId?: string;
  autoGenerate?: boolean;
  /** When set, only show jobs for this platform and hide multi-platform picker. */
  lockedPlatform?: ProfilePlatform;
  hideHero?: boolean;
  onRunSelected?: (runId: string) => void;
  onClearAutoGenerate?: () => void;
  onOpenBrand?: () => void;
  onOpenCalendar?: (platform?: string) => void;
}

function statusTone(status: RunStatus): 'default' | 'info' | 'warning' | 'success' | 'danger' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    case 'RUNNING_LOCALLY':
    case 'UPLOADED':
      return 'info';
    case 'READY_TO_RUN_LOCALLY':
      return 'warning';
    default:
      return 'default';
  }
}

function channelToPlatform(channel: string): SocialPlatform {
  const c = channel.trim().toLowerCase();
  if (c === 'instagram') return 'INSTAGRAM';
  if (c === 'linkedin') return 'LINKEDIN';
  if (c === 'x' || c === 'twitter') return 'X';
  if (c === 'facebook') return 'FACEBOOK';
  if (c === 'youtube') return 'YOUTUBE';
  return 'INSTAGRAM';
}

function deskStatusLabel(status: RunStatus, t: (key: string) => string): string {
  if (status === 'READY_TO_RUN_LOCALLY' || status === 'PLANNED') {
    return t('marketing.desk.status.ready');
  }
  if (status === 'RUNNING_LOCALLY') return t('marketing.desk.status.generating');
  if (status === 'UPLOADED') return t('marketing.desk.status.done');
  if (status === 'APPROVED') return t('marketing.desk.status.approved');
  if (status === 'REJECTED') return t('marketing.desk.status.rejected');
  return status;
}

function platformAccent(channel?: string): string {
  if (!channel) return platformColors.INSTAGRAM;
  return platformColors[channelToPlatform(channel)] ?? platformColors.INSTAGRAM;
}

export function MarketingDeskTab({
  projectId,
  tenantId,
  initialRunId,
  autoGenerate = false,
  lockedPlatform,
  hideHero = false,
  onRunSelected,
  onClearAutoGenerate,
  onOpenBrand,
  onOpenCalendar,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: runsData, isLoading, isError, refetch } = useCreativeRuns(projectId, tenantId);
  const { data: recipesData } = useCreativeRecipes(projectId, tenantId);
  const { data: identity } = useCurrentBrandIdentity(projectId, tenantId);
  const { data: brandMemory } = useBrandMemory(projectId, tenantId);
  const updateRun = useUpdateCreativeRun(projectId, tenantId);
  const createThread = useCreateThread(projectId, tenantId);
  const createSocialPost = useCreateSocialPost(projectId, tenantId);
  const generateImage = useGenerateCreativeImage(projectId, tenantId);
  const rateFeedback = useContentFeedbackRating(projectId, tenantId);

  const recipeById = useMemo(() => {
    const map = new Map<string, CreativeRecipe>();
    for (const r of recipesData ?? []) map.set(r.id, r);
    return map;
  }, [recipesData]);

  const runs = useMemo(() => {
    const list = [...(runsData ?? [])];
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    if (!lockedPlatform) return list;
    return list.filter((run) => {
      const channel = recipeById.get(run.recipeId)?.channel ?? '';
      return channelToPlatform(channel) === lockedPlatform;
    });
  }, [runsData, lockedPlatform, recipeById]);

  const [selectedId, setSelectedId] = useState<string | null>(initialRunId ?? null);
  const [caption, setCaption] = useState('');
  const [imageBrief, setImageBrief] = useState('');
  const [commentDrafts, setCommentDrafts] = useState('');
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingComments, setGeneratingComments] = useState(false);
  const [generatingPixel, setGeneratingPixel] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [queuePosts, setQueuePosts] = useState<QueuePost[]>([]);
  const [activeQueueIndex, setActiveQueueIndex] = useState(0);
  const [runRating, setRunRating] = useState<'like' | 'dislike' | null>(null);
  const [genBrief, setGenBrief] = useState<GenerationBrief>(emptyGenerationBrief());
  const autoGenerateFired = useRef(false);
  const notesRef = useRef<RunNotes>({
    imageBrief: '',
    comments: '',
    brief: emptyGenerationBrief(),
  });
  const hydratedRunId = useRef<string | null>(null);

  useEffect(() => {
    if (initialRunId) {
      setSelectedId(initialRunId);
      autoGenerateFired.current = false;
    }
  }, [initialRunId]);

  const selected: CreativeRun | null = useMemo(() => {
    if (!selectedId) return runs[0] ?? null;
    return runs.find((r) => r.id === selectedId) ?? runs[0] ?? null;
  }, [runs, selectedId]);

  const selectedRecipe = selected ? recipeById.get(selected.recipeId) : undefined;
  const accent = platformAccent(selectedRecipe?.channel);
  const isLinkedIn =
    (selectedRecipe?.channel ?? '').trim().toLowerCase() === 'linkedin';

  // Hydrate composer only when switching posts — keep generated copy on screen across note saves.
  useEffect(() => {
    if (!selected) return;
    if (hydratedRunId.current === selected.id) return;
    hydratedRunId.current = selected.id;

    const notes = parseRunNotes(selected.localExecutorNotes);
    notesRef.current = notes;
    setCommentDrafts(notes.comments);
    setGenBrief(
      notes.brief.topic.trim()
        ? notes.brief
        : briefFromRecipe(selectedRecipe?.goal, selectedRecipe?.title),
    );
    setGeneratedImageUrl(null);
    setRunRating(null);

    const posts = parseQueuePosts(selected.resultSummary);
    if (posts.length >= 2) {
      setQueuePosts(posts);
      setActiveQueueIndex(0);
      setCaption(posts[0].copy);
      setImageBrief(notes.imageBrief.trim() || posts[0].visualSuggestion);
    } else {
      setQueuePosts([]);
      setActiveQueueIndex(0);
      setCaption(selected.resultSummary ?? '');
      setImageBrief(notes.imageBrief);
    }
  }, [selected, selectedRecipe?.goal, selectedRecipe?.title]);

  // If backend fills resultSummary after mount (e.g. createRun), adopt it once when caption empty.
  useEffect(() => {
    if (!selected?.resultSummary?.trim() || generatingCaption) return;
    if (caption.trim()) return;
    const posts = parseQueuePosts(selected.resultSummary);
    if (posts.length >= 2) {
      setQueuePosts(posts);
      setActiveQueueIndex(0);
      setCaption(posts[0].copy);
      if (!imageBrief.trim() && posts[0].visualSuggestion) {
        setImageBrief(posts[0].visualSuggestion);
      }
    } else {
      setCaption(selected.resultSummary);
    }
  }, [selected?.id, selected?.resultSummary, generatingCaption, caption, imageBrief]);

  const persistNotes = async (
    runId: string,
    next: { imageBrief?: string; comments?: string; brief?: GenerationBrief },
  ) => {
    const merged: RunNotes = {
      imageBrief: next.imageBrief ?? notesRef.current.imageBrief,
      comments: next.comments ?? notesRef.current.comments,
      brief: next.brief ?? notesRef.current.brief,
    };
    notesRef.current = merged;
    const serialized = serializeRunNotes(merged);
    return updateRun.mutateAsync({
      runId,
      input: { localExecutorNotes: serialized },
    });
  };

  const persistGenBrief = async (next: GenerationBrief) => {
    setGenBrief(next);
    if (!selected) return;
    try {
      await persistNotes(selected.id, { brief: next });
    } catch {
      /* keep local */
    }
  };

  const selectRun = (runId: string) => {
    if (runId !== selectedId) hydratedRunId.current = null;
    setSelectedId(runId);
    onRunSelected?.(runId);
  };

  const runVertex = async (prompt: string, title: string) => {
    if (!tenantId) throw new Error(t('marketing.desk.tenantRequired'));
    const thread = await createThread.mutateAsync({ title });
    const result = await syncThreadChat(thread.id, { content: prompt }, tenantId);
    return result.content?.trim() ?? '';
  };

  const onSelectQueueDay = async (index: number) => {
    const post = queuePosts[index];
    if (!selected || !post) return;
    setActiveQueueIndex(index);
    setCaption(post.copy);
    if (post.visualSuggestion.trim()) {
      setImageBrief(post.visualSuggestion);
      try {
        await persistNotes(selected.id, { imageBrief: post.visualSuggestion });
      } catch {
        /* keep local */
      }
    }
  };

  const onRateRun = async (rating: 'like' | 'dislike') => {
    if (!selected) return;
    try {
      await rateFeedback.mutateAsync({ targetId: selected.id, rating });
      setRunRating(rating);
      toast.success(
        rating === 'like'
          ? t('marketing.desk.feedbackLiked')
          : t('marketing.desk.feedbackDisliked'),
      );
    } catch (e) {
      toast.error((e as Error).message || t('marketing.desk.feedbackFailed'));
    }
  };

  const onGenerateCaption = async (run: CreativeRun) => {
    const recipe = recipeById.get(run.recipeId);
    const channel = recipe?.channel || 'LinkedIn';
    const brief = genBrief.topic.trim()
      ? genBrief
      : briefFromRecipe(recipe?.goal, recipe?.title);

    if (!brief.topic.trim()) {
      toast.error(t('marketing.social.topicRequired'));
      return;
    }

    const prompt = buildPromptFromGenerationBrief(channel, brief);

    setGeneratingCaption(true);
    selectRun(run.id);
    try {
      await persistNotes(run.id, { brief });
      await updateRun.mutateAsync({
        runId: run.id,
        input: { status: 'RUNNING_LOCALLY', sourcePrompt: prompt },
      });
      const text = await runVertex(
        buildCaptionGenerationPrompt(prompt, channel),
        `Caption · ${brief.topic}`,
      );
      if (!text) {
        toast.error(t('marketing.desk.emptyReply'));
        await updateRun.mutateAsync({
          runId: run.id,
          input: { status: 'READY_TO_RUN_LOCALLY' },
        });
        return;
      }

      const posts = parseQueuePosts(text);
      const stored =
        posts.length >= 2 ? formatQueuePostsAsMarkdown(posts) : text.replace(/```json|```/gi, '').trim();

      const updated = await updateRun.mutateAsync({
        runId: run.id,
        input: { resultSummary: stored, status: 'UPLOADED', sourcePrompt: prompt },
      });
      setRunRating(null);

      if (posts.length >= 2) {
        setQueuePosts(posts);
        setActiveQueueIndex(0);
        setCaption(posts[0].copy);
        setImageBrief(posts[0].visualSuggestion);
        await persistNotes(run.id, { imageBrief: posts[0].visualSuggestion, brief });
        toast.success(t('marketing.desk.queueGenerated', { count: posts.length }));
        setGeneratingCaption(false);
        if ((recipe?.channel ?? '').trim().toLowerCase() === 'linkedin') {
          await onGenerateComments(run, posts[0].copy);
        }
        return;
      }

      setQueuePosts([]);
      setCaption(updated.resultSummary ?? stored);
      toast.success(t('marketing.desk.captionGenerated'));

      setGeneratingCaption(false);
      const captionText = updated.resultSummary ?? stored;
      await onGenerateImageBrief(run, captionText);

      if ((recipe?.channel ?? '').trim().toLowerCase() === 'linkedin') {
        await onGenerateComments(run, captionText);
      }
    } catch (e) {
      toast.error((e as Error).message || t('marketing.desk.generateFailed'));
      try {
        await updateRun.mutateAsync({
          runId: run.id,
          input: { status: 'READY_TO_RUN_LOCALLY' },
        });
      } catch {
        /* ignore */
      }
    } finally {
      setGeneratingCaption(false);
      onClearAutoGenerate?.();
    }
  };

  const onGenerateImageBrief = async (run: CreativeRun, captionOverride?: string) => {
    const recipe = recipeById.get(run.recipeId);
    const topic = genBrief.topic.trim() || recipe?.goal || recipe?.title || 'Brand post';
    const channel = recipe?.channel || 'Instagram';
    const captionForImage =
      captionOverride ?? (caption || run.resultSummary || undefined);
    const prompt = buildBrandImagePromptRequest({
      channel,
      topic,
      caption: captionForImage,
      identity: identity ?? null,
    });

    setGeneratingImage(true);
    selectRun(run.id);
    try {
      const text = await runVertex(prompt, `Image · ${recipe?.title ?? run.id}`);
      if (!text) {
        toast.error(t('marketing.desk.emptyImageBrief'));
        return;
      }
      setImageBrief(text);
      await persistNotes(run.id, { imageBrief: text });
      toast.success(t('marketing.desk.imageBriefGenerated'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.desk.imageBriefFailed'));
    } finally {
      setGeneratingImage(false);
    }
  };

  const onGeneratePixelImage = async (run: CreativeRun) => {
    const fromNotes = parseRunNotes(run.localExecutorNotes).imageBrief.trim();
    const prompt = (imageBrief.trim() || fromNotes).slice(0, 2500);
    if (!prompt) {
      toast.error(t('marketing.desk.needImageBrief'));
      return;
    }
    setGeneratingPixel(true);
    try {
      const asset = await generateImage.mutateAsync({
        prompt,
        runId: run.id,
        label: `Nano Banana · ${displayRecipeTitle(recipeById.get(run.recipeId))}`,
      });
      const url = resolveCreativeAssetUrl(asset.url);
      setGeneratedImageUrl(url || null);
      toast.success(t('marketing.desk.pixelGenerated'));
    } catch (e) {
      // Stay on Create — never navigate away or remount the hub on image failure.
      toast.error((e as Error).message || t('marketing.desk.pixelFailed'));
    } finally {
      setGeneratingPixel(false);
    }
  };

  const onGenerateComments = async (run: CreativeRun, captionOverride?: string) => {
    const postCaption =
      (captionOverride ?? caption).trim() || run.resultSummary?.trim() || '';
    if (!postCaption) {
      toast.error(t('marketing.desk.needOutput'));
      return;
    }
    const recipe = recipeById.get(run.recipeId);
    const prompt = buildLinkedInCommentPrompt({
      postCaption,
      context: recipe?.goal,
    });

    setGeneratingComments(true);
    selectRun(run.id);
    try {
      const text = await runVertex(prompt, `LinkedIn comments · ${recipe?.title ?? run.id}`);
      if (!text) {
        toast.error(t('marketing.desk.emptyComments'));
        return;
      }
      setCommentDrafts(text);
      await persistNotes(run.id, { comments: text });
      toast.success(t('marketing.desk.commentsGenerated'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.desk.commentsFailed'));
    } finally {
      setGeneratingComments(false);
    }
  };

  useEffect(() => {
    if (!autoGenerate || autoGenerateFired.current || !selected || generatingCaption) return;
    if (selected.resultSummary?.trim()) {
      onClearAutoGenerate?.();
      return;
    }
    autoGenerateFired.current = true;
    void onGenerateCaption(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, selected?.id]);

  const persistCaption = async () => {
    if (!selected) return;
    let summary = caption;
    if (queuePosts.length >= 2) {
      const nextPosts = queuePosts.map((p, i) =>
        i === activeQueueIndex ? { ...p, copy: caption, visualSuggestion: imageBrief || p.visualSuggestion } : p,
      );
      setQueuePosts(nextPosts);
      summary = formatQueuePostsAsMarkdown(nextPosts);
    }
    await updateRun.mutateAsync({
      runId: selected.id,
      input: {
        resultSummary: summary,
        status: caption.trim() ? 'UPLOADED' : selected.status,
      },
    });
  };

  const onCopy = async (text: string, okKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t(okKey));
    } catch {
      toast.error(t('marketing.desk.copyFailed'));
    }
  };

  const onApprove = async () => {
    if (!selected) return;
    try {
      await updateRun.mutateAsync({
        runId: selected.id,
        input: {
          resultSummary: caption,
          localExecutorNotes: serializeRunNotes({
            imageBrief,
            comments: commentDrafts,
          }),
          status: 'APPROVED',
        },
      });
      toast.success(t('marketing.desk.approved'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.desk.approveFailed'));
    }
  };

  const onSaveToCalendar = async () => {
    if (!selected || !caption.trim()) {
      toast.error(t('marketing.desk.needOutput'));
      return;
    }
    const platform = channelToPlatform(selectedRecipe?.channel ?? lockedPlatform ?? 'Instagram');
    const cadence =
      platform === 'LINKEDIN' || platform === 'INSTAGRAM' || platform === 'X'
        ? getCadenceDays(platform, brandMemory?.contentMarkdown)
        : 7;
    try {
      await persistCaption();
      await createSocialPost.mutateAsync({
        platform,
        content: caption.trim(),
        scheduledDate: addDaysIso(new Date(), cadence),
      });
      toast.success(t('marketing.desk.calendarSaved'));
      if (onOpenCalendar) {
        onOpenCalendar(platform);
      } else {
        void navigate(`/marketing?tab=calendar&platform=${platform}`);
      }
    } catch (e) {
      toast.error((e as Error).message || t('marketing.desk.calendarFailed'));
    }
  };

  const busy = generatingCaption || generatingImage || generatingComments || generatingPixel;

  if (isLoading) return <ListSkeleton rows={6} />;
  if (isError) {
    return <ErrorState title={t('marketing.desk.errorTitle')} onRetry={() => void refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {!hideHero ? (
        <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <p className="typo-eyebrow-upper text-faint">{t('marketing.desk.heroEyebrow')}</p>
          <h2 className="mt-1 typo-card-title text-foreground text-xl md:text-2xl">
            {lockedPlatform
              ? t('marketing.desk.platformHeroTitle', {
                  platform: t(`marketing.social.platforms.${lockedPlatform}`),
                })
              : t('marketing.desk.heroTitle')}
          </h2>
          <p className="mt-1 max-w-2xl typo-body-sm text-muted-foreground">
            {t('marketing.desk.heroSubtitle')}
          </p>
          <div className="mt-4">
            <SocialPlatformActions
              projectId={projectId}
              tenantId={tenantId}
              lockedPlatform={lockedPlatform}
            />
          </div>
          {!identity ? (
            <p className="mt-3 typo-body-sm text-muted-foreground">
              {t('marketing.desk.brandHint')}{' '}
              {onOpenBrand ? (
                <button
                  type="button"
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={onOpenBrand}
                >
                  {t('marketing.desk.openBrand')}
                </button>
              ) : null}
            </p>
          ) : null}
        </section>
      ) : (
        <div>
          <SocialPlatformActions
            projectId={projectId}
            tenantId={tenantId}
            lockedPlatform={lockedPlatform}
          />
        </div>
      )}

      {runs.length === 0 ? (
        <EmptyState
          icon={<Sparkles />}
          title={t('marketing.desk.emptyTitle')}
          description={t('marketing.desk.emptyDescription')}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_280px]">
          {/* Queue */}
          <aside className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <p className="typo-body-sm font-medium text-foreground">{t('marketing.desk.queueTitle')}</p>
            </div>
            <ul className="max-h-[70vh] divide-y divide-border overflow-y-auto">
              {runs.map((run) => {
                const recipe = recipeById.get(run.recipeId);
                const active = selected?.id === run.id;
                const color = platformAccent(recipe?.channel);
                return (
                  <li key={run.id}>
                    <button
                      type="button"
                      onClick={() => selectRun(run.id)}
                      className={cn(
                        'flex w-full flex-col gap-1.5 px-3 py-3 text-left transition-colors',
                        active ? 'bg-muted/80' : 'hover:bg-muted/40',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                        <span className="typo-body-sm font-medium text-foreground line-clamp-1">
                          {displayRecipeTitle(recipe)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pl-4">
                        <span className="typo-eyebrow text-muted-foreground">
                          {recipe?.channel || '—'}
                        </span>
                        <StatusBadge
                          label={deskStatusLabel(run.status, t)}
                          tone={statusTone(run.status)}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Composer */}
          {selected ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 typo-eyebrow text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {selectedRecipe?.channel ?? 'Post'}
                    </span>
                    <StatusBadge
                      label={deskStatusLabel(selected.status, t)}
                      tone={statusTone(selected.status)}
                    />
                  </div>
                  <h3 className="mt-2 typo-card-title text-foreground">
                    {displayRecipeTitle(selectedRecipe)}
                  </h3>
                  {selectedRecipe?.goal &&
                  displayRecipeTitle(selectedRecipe) !== selectedRecipe.goal ? (
                    <p className="mt-1 typo-body-sm text-muted-foreground line-clamp-2">
                      {selectedRecipe.goal}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-3 md:p-4">
                <p className="typo-body-sm font-medium text-foreground">
                  {t('marketing.desk.customizeTitle')}
                </p>
                <p className="mt-0.5 typo-eyebrow text-muted-foreground">
                  {t('marketing.desk.customizeHint')}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="desk-topic">{t('marketing.social.fieldTopic')}</Label>
                    <Input
                      id="desk-topic"
                      value={genBrief.topic}
                      onChange={(e) => setGenBrief((b) => ({ ...b, topic: e.target.value }))}
                      onBlur={() => void persistGenBrief(genBrief)}
                      placeholder={t('marketing.social.topicPlaceholder')}
                      disabled={busy}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="desk-angle">{t('marketing.desk.fieldAngle')}</Label>
                    <Input
                      id="desk-angle"
                      value={genBrief.angle}
                      onChange={(e) => setGenBrief((b) => ({ ...b, angle: e.target.value }))}
                      onBlur={() => void persistGenBrief(genBrief)}
                      placeholder={t('marketing.desk.anglePlaceholder')}
                      disabled={busy}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="desk-audience">{t('marketing.desk.fieldAudience')}</Label>
                    <Input
                      id="desk-audience"
                      value={genBrief.audience}
                      onChange={(e) => setGenBrief((b) => ({ ...b, audience: e.target.value }))}
                      onBlur={() => void persistGenBrief(genBrief)}
                      placeholder={t('marketing.desk.audiencePlaceholder')}
                      disabled={busy}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="desk-cta">{t('marketing.desk.fieldCta')}</Label>
                    <Input
                      id="desk-cta"
                      value={genBrief.cta}
                      onChange={(e) => setGenBrief((b) => ({ ...b, cta: e.target.value }))}
                      onBlur={() => void persistGenBrief(genBrief)}
                      placeholder={t('marketing.desk.ctaPlaceholder')}
                      disabled={busy}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="desk-tone">{t('marketing.desk.fieldTone')}</Label>
                    <Input
                      id="desk-tone"
                      value={genBrief.tone}
                      onChange={(e) => setGenBrief((b) => ({ ...b, tone: e.target.value }))}
                      onBlur={() => void persistGenBrief(genBrief)}
                      placeholder={t('marketing.desk.tonePlaceholder')}
                      disabled={busy}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>{t('marketing.desk.fieldFormat')}</Label>
                    <Select
                      value={genBrief.format}
                      onValueChange={(value) => {
                        const next = {
                          ...genBrief,
                          format: value === 'week' ? ('week' as const) : ('single' as const),
                        };
                        void persistGenBrief(next);
                      }}
                      disabled={busy}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">{t('marketing.desk.formatSingle')}</SelectItem>
                        <SelectItem value="week">{t('marketing.desk.formatWeek')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-1 xl:grid-cols-2">
                <div className="flex flex-col gap-2">
                  {caption.trim() ? (
                    <p className="typo-eyebrow text-muted-foreground">
                      {t('marketing.desk.generatedStays')}
                    </p>
                  ) : null}
                  {queuePosts.length >= 2 ? (
                    <div className="mb-1 flex flex-col gap-2">
                      <Label>{t('marketing.desk.queueDays')}</Label>
                      <p className="typo-eyebrow text-muted-foreground">
                        {t('marketing.desk.queueDaysHint')}
                      </p>
                      <div className="flex flex-col gap-2">
                        {queuePosts.map((post, index) => {
                          const active = index === activeQueueIndex;
                          return (
                            <button
                              key={`${post.day}-${index}`}
                              type="button"
                              onClick={() => void onSelectQueueDay(index)}
                              className={cn(
                                'rounded-xl border px-3 py-2.5 text-left transition-colors',
                                active
                                  ? 'border-foreground/30 bg-muted/40'
                                  : 'border-border hover:bg-muted/20',
                              )}
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="typo-eyebrow font-medium text-foreground">
                                  {post.day}
                                </span>
                                <span className="typo-eyebrow text-muted-foreground">{post.type}</span>
                              </div>
                              <p className="mt-1 line-clamp-2 typo-body-sm text-muted-foreground">
                                {post.copy}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="desk-caption">{t('marketing.desk.caption')}</Label>
                    {generatingCaption ? (
                      <span className="inline-flex items-center gap-1.5 typo-eyebrow text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" />
                        {t('marketing.desk.writingCaption')}
                      </span>
                    ) : null}
                  </div>
                  <Textarea
                    id="desk-caption"
                    rows={10}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onBlur={() => {
                      if (selected && caption !== (selected.resultSummary ?? '')) {
                        void persistCaption().catch(() => undefined);
                      }
                    }}
                    placeholder={t('marketing.desk.captionPlaceholder')}
                    disabled={generatingCaption}
                    className="min-h-[200px] resize-y"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void onGenerateCaption(selected)}
                      disabled={busy}
                    >
                      {generatingCaption ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="size-3.5" />
                      )}
                      {caption.trim()
                        ? t('marketing.desk.rewriteCaption')
                        : t('marketing.desk.writeCaption')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!caption.trim()}
                      onClick={() => void onCopy(caption, 'marketing.desk.captionCopied')}
                    >
                      <Copy className="size-3.5" />
                      {t('marketing.desk.copyCaption')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={runRating === 'like' ? 'default' : 'outline'}
                      disabled={!caption.trim() || rateFeedback.isPending}
                      onClick={() => void onRateRun('like')}
                      aria-label={t('marketing.desk.feedbackLike')}
                    >
                      <ThumbsUp className="size-3.5" />
                      {t('marketing.desk.feedbackLike')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={runRating === 'dislike' ? 'default' : 'outline'}
                      disabled={!caption.trim() || rateFeedback.isPending}
                      onClick={() => void onRateRun('dislike')}
                      aria-label={t('marketing.desk.feedbackDislike')}
                    >
                      <ThumbsDown className="size-3.5" />
                      {t('marketing.desk.feedbackDislike')}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="desk-image">{t('marketing.desk.imageBrief')}</Label>
                    {generatingImage ? (
                      <span className="inline-flex items-center gap-1.5 typo-eyebrow text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" />
                        {t('marketing.desk.writingImage')}
                      </span>
                    ) : null}
                  </div>
                  <Textarea
                    id="desk-image"
                    rows={8}
                    value={imageBrief}
                    onChange={(e) => setImageBrief(e.target.value)}
                    onBlur={() => {
                      if (
                        selected &&
                        imageBrief !== parseRunNotes(selected.localExecutorNotes).imageBrief
                      ) {
                        void persistNotes(selected.id, { imageBrief }).catch(() => undefined);
                      }
                    }}
                    placeholder={t('marketing.desk.imageBriefPlaceholder')}
                    disabled={generatingImage}
                    className="min-h-[160px] resize-y"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => void onGenerateImageBrief(selected)}
                      disabled={busy}
                    >
                      {generatingImage ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="size-3.5" />
                      )}
                      {imageBrief.trim()
                        ? t('marketing.desk.rewriteImage')
                        : t('marketing.desk.writeImage')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void onGeneratePixelImage(selected)}
                      disabled={busy || !imageBrief.trim()}
                    >
                      {generatingPixel ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="size-3.5" />
                      )}
                      {t('marketing.desk.generatePixel')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!imageBrief.trim()}
                      onClick={() => void onCopy(imageBrief, 'marketing.desk.imageCopied')}
                    >
                      <Copy className="size-3.5" />
                      {t('marketing.desk.copyImage')}
                    </Button>
                  </div>
                  <p className="typo-eyebrow text-muted-foreground">
                    {t('marketing.desk.imageHintNano')}
                  </p>
                  {generatedImageUrl ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                      <img
                        src={generatedImageUrl}
                        alt=""
                        className="max-h-72 w-full object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              {isLinkedIn ? (
                <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-3 md:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="desk-comments">{t('marketing.desk.comments')}</Label>
                    {generatingComments ? (
                      <span className="inline-flex items-center gap-1.5 typo-eyebrow text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" />
                        {t('marketing.desk.writingComments')}
                      </span>
                    ) : null}
                  </div>
                  <p className="typo-eyebrow text-muted-foreground">
                    {t('marketing.desk.commentsHint')}
                  </p>
                  <Textarea
                    id="desk-comments"
                    rows={8}
                    value={commentDrafts}
                    onChange={(e) => setCommentDrafts(e.target.value)}
                    onBlur={() => {
                      if (
                        selected &&
                        commentDrafts !== parseRunNotes(selected.localExecutorNotes).comments
                      ) {
                        void persistNotes(selected.id, { comments: commentDrafts }).catch(
                          () => undefined,
                        );
                      }
                    }}
                    placeholder={t('marketing.desk.commentsPlaceholder')}
                    disabled={generatingComments}
                    className="min-h-[160px] resize-y"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void onGenerateComments(selected)}
                      disabled={busy || !caption.trim()}
                    >
                      {generatingComments ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <MessageSquare className="size-3.5" />
                      )}
                      {commentDrafts.trim()
                        ? t('marketing.desk.rewriteComments')
                        : t('marketing.desk.writeComments')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!commentDrafts.trim()}
                      onClick={() => void onCopy(commentDrafts, 'marketing.desk.commentsCopied')}
                    >
                      <Copy className="size-3.5" />
                      {t('marketing.desk.copyComments')}
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button type="button" onClick={() => void onApprove()} disabled={busy}>
                  <Check className="size-4" />
                  {t('marketing.desk.approve')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onSaveToCalendar()}
                  disabled={busy || !caption.trim()}
                >
                  <CalendarDays className="size-4" />
                  {t('marketing.desk.toCalendar')}
                </Button>
              </div>
            </div>
          ) : null}

          {/* Live preview */}
          {selected ? (
            <aside className="hidden xl:flex flex-col items-center gap-3">
              <p className="self-start typo-eyebrow-upper text-faint">
                {t('marketing.desk.preview')}
              </p>
              <div
                className="w-full max-w-[260px] overflow-hidden rounded-[1.75rem] border-[10px] border-foreground/90 bg-background shadow-floating"
                style={{ aspectRatio: '9 / 16' }}
              >
                <div className="flex h-full flex-col">
                  <div
                    className="relative flex aspect-square items-center justify-center bg-muted px-4 text-center"
                    style={{
                      backgroundImage: generatedImageUrl
                        ? undefined
                        : `linear-gradient(145deg, ${accent}33, transparent 60%)`,
                    }}
                  >
                    {!generatedImageUrl ? (
                      <p className="typo-eyebrow text-muted-foreground">
                        {imageBrief.trim()
                          ? t('marketing.desk.previewHasImage')
                          : t('marketing.desk.previewNoImage')}
                      </p>
                    ) : (
                      <img
                        src={generatedImageUrl}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 py-3">
                    <p className="typo-eyebrow font-medium text-foreground">
                      {selectedRecipe?.channel ?? 'Post'}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap typo-body-sm text-foreground">
                      {caption.trim() || t('marketing.desk.previewEmptyCaption')}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      )}
    </div>
  );
}
