import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  CalendarDays,
  Check,
  Copy,
  Download,
  FolderInput,
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
  useUpdateCreativeAsset,
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
import {
  buildBrandImagePromptRequest,
  formatVisualKitForImagePrompt,
} from '@/modules/marketing/lib/brand-image-prompt';
import {
  formatBrandContextForPrompt,
  withBrandContext,
} from '@/modules/marketing/lib/brand-context';
import { buildRevisionPrompt } from '@/modules/marketing/lib/revise-prompt';
import { ReviseWithFeedback } from '@/modules/marketing/components/ReviseWithFeedback';
import { BrandAssetPicker } from '@/modules/marketing/components/BrandAssetPicker';
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
import { VideoPlanActions } from '@/modules/marketing/components/VideoPlanActions';
import { LinkedInPipelinePanel } from '@/modules/marketing/components/LinkedInPipelinePanel';
import { useBrandMemory, useSaveBrandMemory } from '@/modules/marketing/api/use-brand-memory';
import {
  addDaysIso,
  getCadenceDays,
  type ProfilePlatform,
} from '@/modules/marketing/lib/platform-profile';
import { resolveCreativeAssetUrl } from '@/modules/marketing/api/resolve-creative-asset-url';
import { downloadCreativeMedia } from '@/modules/marketing/lib/download-creative-media';
import { useContentFeedbackRating } from '@/modules/marketing/api/use-content-feedback';
import {
  buildCaptionGenerationPrompt,
  cleanSocialCaption,
  formatQueuePostsAsMarkdown,
  parseQueuePosts,
  type QueuePost,
} from '@/modules/marketing/lib/parse-social-output';
import {
  appendGenerationFeedbackToMemory,
  isStrongGenerationFeedback,
} from '@/modules/marketing/lib/generation-feedback';
import {
  downloadMarkdown,
  isVideoRecipe,
  isVideoRun,
  splitMarkdownSections,
} from '@/modules/marketing/lib/video-plan';
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
  const saveBrandMemory = useSaveBrandMemory(projectId, tenantId);
  const brandContext = useMemo(
    () =>
      formatBrandContextForPrompt({
        memoryMarkdown: brandMemory?.contentMarkdown,
        identity: identity ?? null,
      }),
    [brandMemory?.contentMarkdown, identity],
  );
  const updateRun = useUpdateCreativeRun(projectId, tenantId);
  const createThread = useCreateThread(projectId, tenantId);
  const createSocialPost = useCreateSocialPost(projectId, tenantId);
  const generateImage = useGenerateCreativeImage(projectId, tenantId);
  const updateAsset = useUpdateCreativeAsset(projectId, tenantId);
  const rateFeedback = useContentFeedbackRating(projectId, tenantId);

  const recipeById = useMemo(() => {
    const map = new Map<string, CreativeRecipe>();
    for (const r of recipesData ?? []) map.set(r.id, r);
    return map;
  }, [recipesData]);

  const [selectedId, setSelectedId] = useState<string | null>(initialRunId ?? null);
  const [caption, setCaption] = useState('');
  const [imageBrief, setImageBrief] = useState('');
  const [commentDrafts, setCommentDrafts] = useState('');
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingComments, setGeneratingComments] = useState(false);
  const [generatingPixel, setGeneratingPixel] = useState(false);
  const [brandRefIds, setBrandRefIds] = useState<string[]>([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedAssetId, setGeneratedAssetId] = useState<string | null>(null);
  const [generatedAssetLabel, setGeneratedAssetLabel] = useState<string | null>(null);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [savingImageToBrand, setSavingImageToBrand] = useState(false);
  const [queuePosts, setQueuePosts] = useState<QueuePost[]>([]);
  const [activeQueueIndex, setActiveQueueIndex] = useState(0);
  const [runRating, setRunRating] = useState<'like' | 'dislike' | null>(null);
  const [reviseCaptionOpen, setReviseCaptionOpen] = useState(false);
  const [genBrief, setGenBrief] = useState<GenerationBrief>(emptyGenerationBrief());
  const autoGenerateFired = useRef(false);
  const videoGenerateFired = useRef<string | null>(null);
  const notesRef = useRef<RunNotes>({
    imageBrief: '',
    comments: '',
    brief: emptyGenerationBrief(),
  });
  const hydratedRunId = useRef<string | null>(null);

  const runs = useMemo(() => {
    const list = [...(runsData ?? [])];
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    if (!lockedPlatform) return list;
    return list.filter((run) => {
      if (initialRunId && run.id === initialRunId) return true;
      if (selectedId && run.id === selectedId) return true;
      const recipe = recipeById.get(run.recipeId);
      if (isVideoRecipe(recipe) || isVideoRun(run, recipe)) return true;
      if (!recipe) return true;
      const channel = recipe.channel ?? '';
      return channelToPlatform(channel) === lockedPlatform;
    });
  }, [runsData, lockedPlatform, recipeById, initialRunId, selectedId]);

  useEffect(() => {
    if (initialRunId) {
      setSelectedId(initialRunId);
      autoGenerateFired.current = false;
      videoGenerateFired.current = null;
    }
  }, [initialRunId]);

  const selected: CreativeRun | null = useMemo(() => {
    if (!selectedId) return runs[0] ?? null;
    const inView = runs.find((r) => r.id === selectedId);
    if (inView) return inView;
    return (runsData ?? []).find((r) => r.id === selectedId) ?? runs[0] ?? null;
  }, [runs, selectedId, runsData]);

  const selectedRecipe = selected ? recipeById.get(selected.recipeId) : undefined;
  const accent = platformAccent(selectedRecipe?.channel);
  const isVideoPlan = isVideoRun(selected, selectedRecipe);
  const isLinkedIn =
    !isVideoPlan && (selectedRecipe?.channel ?? '').trim().toLowerCase() === 'linkedin';
  const videoSections = useMemo(
    () => (isVideoPlan ? splitMarkdownSections(caption) : []),
    [isVideoPlan, caption],
  );

  // Hydrate composer only when switching posts — keep generated copy on screen across note saves.
  useEffect(() => {
    if (!selected) return;
    if (hydratedRunId.current === selected.id) return;
    hydratedRunId.current = selected.id;

    const notes = parseRunNotes(selected.localExecutorNotes);
    notesRef.current = notes;
    setCommentDrafts(notes.comments);
    setGenBrief(
      notes.brief?.topic?.trim()
        ? notes.brief
        : briefFromRecipe(selectedRecipe?.goal, selectedRecipe?.title),
    );
    setGeneratedImageUrl(null);
    setGeneratedAssetId(null);
    setGeneratedAssetLabel(null);
    setRunRating(null);
    setReviseCaptionOpen(false);
    if (selected.resultSummary?.trim()) {
      videoGenerateFired.current = selected.id;
    } else if (videoGenerateFired.current === selected.id) {
      /* keep fired so we don't double-kick mid-request */
    } else {
      videoGenerateFired.current = null;
    }

    const posts = parseQueuePosts(selected.resultSummary);
    if (!isVideoRecipe(selectedRecipe) && posts.length >= 2) {
      setQueuePosts(posts);
      setActiveQueueIndex(0);
      setCaption(posts[0].copy);
      setImageBrief(notes.imageBrief.trim() || posts[0].visualSuggestion);
    } else {
      setQueuePosts([]);
      setActiveQueueIndex(0);
      setCaption(
        isVideoRun(selected, selectedRecipe)
          ? (selected.resultSummary ?? '')
          : cleanSocialCaption(selected.resultSummary ?? ''),
      );
      setImageBrief(notes.imageBrief);
    }
  }, [selected, selectedRecipe?.goal, selectedRecipe?.title, selectedRecipe]);

  // If backend fills resultSummary after mount (e.g. createRun), adopt it once when caption empty.
  useEffect(() => {
    if (!selected?.resultSummary?.trim() || generatingCaption) return;
    if (caption.trim()) return;
    const posts = parseQueuePosts(selected.resultSummary);
    if (posts.length >= 2) {
      setQueuePosts(posts);
      setActiveQueueIndex(0);
      setCaption(cleanSocialCaption(posts[0].copy));
      if (!imageBrief.trim() && posts[0].visualSuggestion) {
        setImageBrief(posts[0].visualSuggestion);
      }
    } else {
      setCaption(cleanSocialCaption(selected.resultSummary));
    }
  }, [selected?.id, selected?.resultSummary, generatingCaption, caption, imageBrief]);

  const persistNotes = async (
    runId: string,
    next: { imageBrief?: string; comments?: string; brief?: GenerationBrief },
  ) => {
    const merged: RunNotes = {
      imageBrief: next.imageBrief ?? notesRef.current.imageBrief,
      comments: next.comments ?? notesRef.current.comments,
      brief: next.brief ?? notesRef.current.brief ?? emptyGenerationBrief(),
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
      if (rating === 'dislike' && caption.trim()) {
        setReviseCaptionOpen(true);
      }
    } catch (e) {
      toast.error((e as Error).message || t('marketing.desk.feedbackFailed'));
    }
  };

  const persistStrongFeedback = async (feedback: string, surface: string, channel?: string) => {
    if (!isStrongGenerationFeedback(feedback)) return;
    try {
      const next = appendGenerationFeedbackToMemory(brandMemory?.contentMarkdown ?? '', {
        feedback,
        surface,
        channel,
      });
      if (next === (brandMemory?.contentMarkdown ?? '').trim()) return;
      await saveBrandMemory.mutateAsync(next);
      toast.success(t('marketing.revise.feedbackSaved'));
    } catch {
      /* non-blocking — revise still succeeded */
    }
  };

  const applyCaptionResult = async (
    run: CreativeRun,
    text: string,
    sourcePrompt: string,
    brief: GenerationBrief,
  ) => {
    const recipe = recipeById.get(run.recipeId);
    const posts = parseQueuePosts(text).map((p) => ({
      ...p,
      copy: cleanSocialCaption(p.copy),
    }));
    const single = cleanSocialCaption(text.replace(/```json|```/gi, '').trim());
    const stored =
      posts.length >= 2 ? formatQueuePostsAsMarkdown(posts) : single;

    const updated = await updateRun.mutateAsync({
      runId: run.id,
      input: { resultSummary: stored, status: 'UPLOADED', sourcePrompt },
    });
    setRunRating(null);

    if (posts.length >= 2) {
      setQueuePosts(posts);
      setActiveQueueIndex(0);
      setCaption(posts[0].copy);
      setImageBrief(posts[0].visualSuggestion);
      await persistNotes(run.id, { imageBrief: posts[0].visualSuggestion, brief });
      return { kind: 'queue' as const, captionText: posts[0].copy, recipe };
    }

    setQueuePosts([]);
    const captionText = cleanSocialCaption(updated.resultSummary ?? stored);
    setCaption(captionText);
    return { kind: 'single' as const, captionText, recipe };
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

    const prompt = withBrandContext(
      buildPromptFromGenerationBrief(channel, brief),
      brandContext,
    );

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

      const result = await applyCaptionResult(run, text, prompt, brief);
      if (result.kind === 'queue') {
        const posts = parseQueuePosts(text);
        toast.success(t('marketing.desk.queueGenerated', { count: posts.length }));
        setGeneratingCaption(false);
        if ((result.recipe?.channel ?? '').trim().toLowerCase() === 'linkedin') {
          await onGenerateComments(run, result.captionText);
        }
        return;
      }

      toast.success(t('marketing.desk.captionGenerated'));
      setGeneratingCaption(false);
      await onGenerateImageBrief(run, result.captionText);
      if ((result.recipe?.channel ?? '').trim().toLowerCase() === 'linkedin') {
        await onGenerateComments(run, result.captionText);
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

  const onReviseCaption = async (feedback: string) => {
    if (!selected) return;
    const recipe = recipeById.get(selected.recipeId);
    const channel = recipe?.channel || 'LinkedIn';
    const brief = genBrief.topic.trim()
      ? genBrief
      : briefFromRecipe(recipe?.goal, recipe?.title);
    const previous =
      queuePosts.length >= 2
        ? formatQueuePostsAsMarkdown(queuePosts)
        : caption.trim();
    if (!previous) {
      toast.error(t('marketing.revise.needDraft'));
      return;
    }

    const reviseCore = buildRevisionPrompt({
      deliverable: `${channel} post copy`,
      previousOutput: previous,
      feedback,
      taskReminder: brief.topic.trim()
        ? [
            `Topic: ${brief.topic}`,
            brief.angle && `Angle: ${brief.angle}`,
            brief.audience && `Audience: ${brief.audience}`,
            brief.cta && `CTA: ${brief.cta}`,
            brief.tone && `Tone: ${brief.tone}`,
          ]
            .filter(Boolean)
            .join('\n')
        : recipe?.goal,
      outputInstructions:
        queuePosts.length >= 2 || brief.format === 'week'
          ? [
              `Return a revised ${channel} Mon–Fri pack in ---POST--- format only.`,
              'Each block: Day, Type, Caption, Image.',
              'No JSON, no preamble.',
            ].join('\n')
          : `Return ONLY the revised ready-to-publish ${channel} post body. No preamble, no markdown titles, max 3 hashtags.`,
    });
    const prompt = withBrandContext(reviseCore, brandContext);

    setGeneratingCaption(true);
    selectRun(selected.id);
    try {
      await updateRun.mutateAsync({
        runId: selected.id,
        input: { status: 'RUNNING_LOCALLY', sourcePrompt: prompt },
      });
      const text = await runVertex(
        buildCaptionGenerationPrompt(prompt, channel),
        `Revise caption · ${brief.topic || recipe?.title || selected.id}`,
      );
      if (!text) {
        toast.error(t('marketing.desk.emptyReply'));
        await updateRun.mutateAsync({
          runId: selected.id,
          input: { status: 'READY_TO_RUN_LOCALLY' },
        });
        return;
      }
      await applyCaptionResult(selected, text, prompt, brief);
      toast.success(t('marketing.revise.success'));
      await persistStrongFeedback(feedback, 'caption', channel);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.revise.failed'));
      try {
        await updateRun.mutateAsync({
          runId: selected.id,
          input: { status: 'READY_TO_RUN_LOCALLY' },
        });
      } catch {
        /* ignore */
      }
    } finally {
      setGeneratingCaption(false);
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
      memoryMarkdown: brandMemory?.contentMarkdown,
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
    const visualKit = formatVisualKitForImagePrompt(identity);
    const base = (imageBrief.trim() || fromNotes).trim();
    const withKit = visualKit ? `${base}\n\n${visualKit}` : base;
    const prompt = withKit.slice(0, 2500);
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
        referenceAssetIds: brandRefIds.length ? brandRefIds : undefined,
      });
      const url = resolveCreativeAssetUrl(asset?.url);
      if (!url) {
        toast.error(t('marketing.desk.pixelFailed'));
        return;
      }
      setGeneratedImageUrl(url);
      setGeneratedAssetId(asset?.id ?? null);
      setGeneratedAssetLabel(asset?.label ?? null);
      toast.success(t('marketing.desk.pixelGenerated'));
    } catch (e) {
      // Stay on Create — never navigate away or remount the hub on image failure.
      const status = (e as { status?: number } | null)?.status;
      const msg = (e as Error)?.message?.trim();
      if (status === 404) {
        toast.error(t('marketing.desk.pixelUnavailable'));
      } else {
        toast.error(msg || t('marketing.desk.pixelFailed'));
      }
    } finally {
      setGeneratingPixel(false);
    }
  };

  const onDownloadGeneratedImage = async () => {
    if (!generatedImageUrl) return;
    setDownloadingImage(true);
    try {
      await downloadCreativeMedia(
        generatedImageUrl,
        generatedAssetLabel?.trim() || 'nano-banana-image',
      );
      toast.success(t('marketing.desk.imageDownloaded'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.desk.imageDownloadFailed'));
    } finally {
      setDownloadingImage(false);
    }
  };

  const onSaveGeneratedImageToBrand = async () => {
    if (!generatedAssetId) {
      toast.error(t('marketing.desk.imageSaveUnavailable'));
      return;
    }
    setSavingImageToBrand(true);
    try {
      await updateAsset.mutateAsync({
        assetId: generatedAssetId,
        input: {
          runId: null,
          metadata: { scope: 'brand', folderPath: '/Brand/Product' },
        },
      });
      toast.success(t('marketing.desk.imageSavedToBrand'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.desk.imageSaveFailed'));
    } finally {
      setSavingImageToBrand(false);
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
    const prompt = withBrandContext(
      buildLinkedInCommentPrompt({
        postCaption,
        context: recipe?.goal,
      }),
      brandContext,
    );

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

  const onReviseImageBrief = async (feedback: string) => {
    if (!selected || !imageBrief.trim()) {
      toast.error(t('marketing.revise.needDraft'));
      return;
    }
    const recipe = recipeById.get(selected.recipeId);
    const topic = genBrief.topic.trim() || recipe?.goal || recipe?.title || 'Brand post';
    const channel = recipe?.channel || 'Instagram';
    const prompt = withBrandContext(
      buildRevisionPrompt({
        deliverable: `${channel} image-generation prompt`,
        previousOutput: imageBrief.trim(),
        feedback,
        taskReminder: [
          `Topic: ${topic}`,
          caption.trim() && `Caption to support:\n${caption.trim()}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
        outputInstructions: [
          'Return ONLY one revised ready-to-paste image-generation prompt.',
          'Match brand visual style and colors. No preamble.',
        ].join('\n'),
      }),
      brandContext,
    );

    setGeneratingImage(true);
    selectRun(selected.id);
    try {
      const text = await runVertex(prompt, `Revise image · ${recipe?.title ?? selected.id}`);
      if (!text) {
        toast.error(t('marketing.desk.emptyImageBrief'));
        return;
      }
      setImageBrief(text);
      await persistNotes(selected.id, { imageBrief: text });
      toast.success(t('marketing.revise.success'));
      await persistStrongFeedback(feedback, 'image brief', recipe?.channel);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.revise.failed'));
    } finally {
      setGeneratingImage(false);
    }
  };

  const onReviseComments = async (feedback: string) => {
    if (!selected || !commentDrafts.trim()) {
      toast.error(t('marketing.revise.needDraft'));
      return;
    }
    const recipe = recipeById.get(selected.recipeId);
    const prompt = withBrandContext(
      buildRevisionPrompt({
        deliverable: 'LinkedIn comment drafts',
        previousOutput: commentDrafts.trim(),
        feedback,
        taskReminder: caption.trim()
          ? `Post context:\n${caption.trim()}`
          : recipe?.goal,
        outputInstructions: [
          'Return 4 revised short LinkedIn comment drafts, numbered 1–4.',
          'Professional, specific, on-brand. No hashtags. No preamble.',
        ].join('\n'),
      }),
      brandContext,
    );

    setGeneratingComments(true);
    selectRun(selected.id);
    try {
      const text = await runVertex(prompt, `Revise comments · ${recipe?.title ?? selected.id}`);
      if (!text) {
        toast.error(t('marketing.desk.emptyComments'));
        return;
      }
      setCommentDrafts(text);
      await persistNotes(selected.id, { comments: text });
      toast.success(t('marketing.revise.success'));
      await persistStrongFeedback(feedback, 'LinkedIn comments', recipe?.channel);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.revise.failed'));
    } finally {
      setGeneratingComments(false);
    }
  };

  const onReviseVideoPlan = async (feedback: string) => {
    if (!selected || !caption.trim()) {
      toast.error(t('marketing.revise.needDraft'));
      return;
    }
    const recipe = recipeById.get(selected.recipeId);
    const founders = /##\s+Founders video script/i.test(caption);
    const outputInstructions = founders
      ? [
          'Return a single revised markdown document with exactly these H2 sections:',
          '## Founders video script',
          '## Interstitial prompts',
          '## Remotion generation prompt',
          'No preamble. No code fence around the whole document.',
        ].join('\n')
      : [
          'Return a single revised markdown document with exactly these H2 sections:',
          '## Video script package',
          '## Remotion generation prompt',
          'No preamble. No code fence around the whole document.',
        ].join('\n');

    const prompt = withBrandContext(
      buildRevisionPrompt({
        deliverable: founders ? 'founders video markdown package' : 'product video markdown package',
        previousOutput: caption.trim(),
        feedback,
        taskReminder: recipe?.goal || recipe?.promptMarkdown?.slice(0, 1500),
        outputInstructions,
      }),
      brandContext,
    );

    setGeneratingCaption(true);
    selectRun(selected.id);
    try {
      await updateRun.mutateAsync({
        runId: selected.id,
        input: { status: 'RUNNING_LOCALLY', sourcePrompt: prompt },
      });
      const text = await runVertex(prompt, `Revise video · ${recipe?.title ?? selected.id}`);
      if (!text) {
        toast.error(t('marketing.desk.emptyReply'));
        await updateRun.mutateAsync({
          runId: selected.id,
          input: { status: 'READY_TO_RUN_LOCALLY' },
        });
        return;
      }
      const cleaned = text.replace(/^```(?:markdown|md)?\s*|\s*```$/gi, '').trim();
      setCaption(cleaned);
      setQueuePosts([]);
      await updateRun.mutateAsync({
        runId: selected.id,
        input: { resultSummary: cleaned, status: 'UPLOADED', sourcePrompt: prompt },
      });
      toast.success(t('marketing.revise.success'));
      await persistStrongFeedback(feedback, 'video plan', recipe?.channel);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.revise.failed'));
      try {
        await updateRun.mutateAsync({
          runId: selected.id,
          input: { status: 'READY_TO_RUN_LOCALLY' },
        });
      } catch {
        /* ignore */
      }
    } finally {
      setGeneratingCaption(false);
    }
  };

  const onGenerateVideoPlan = async (run: CreativeRun) => {
    const recipe = recipeById.get(run.recipeId);
    const base =
      (run.sourcePrompt || recipe?.promptMarkdown || '').trim() ||
      [
        'Plan a product / feature Remotion video for our brand.',
        '',
        `Goal: ${recipe?.goal || recipe?.title || 'Product video'}`,
        '',
        'Return a single markdown document with exactly these H2 sections:',
        '## Video script package',
        '## Remotion generation prompt',
      ].join('\n');
    const founders =
      /founders/i.test(base) ||
      /founder/i.test(recipe?.title ?? '') ||
      /founder/i.test(recipe?.channel ?? '');
    const reinforced = [
      base,
      '',
      'Output requirements (mandatory):',
      founders
        ? 'Return markdown with H2 sections exactly: ## Founders video script, ## Interstitial prompts, ## Remotion generation prompt'
        : 'Return markdown with H2 sections exactly: ## Video script package, ## Remotion generation prompt',
      'No preamble. No code fence around the whole document.',
      'Follow brand memory and visual identity. Do not invent another company.',
    ].join('\n');
    const prompt = withBrandContext(reinforced, brandContext);

    setGeneratingCaption(true);
    selectRun(run.id);
    try {
      await updateRun.mutateAsync({
        runId: run.id,
        input: { status: 'RUNNING_LOCALLY', sourcePrompt: prompt },
      });
      const text = await runVertex(
        prompt,
        `Video plan · ${recipe?.title ?? run.id}`,
      );
      if (!text) {
        toast.error(t('marketing.desk.emptyReply'));
        await updateRun.mutateAsync({
          runId: run.id,
          input: { status: 'READY_TO_RUN_LOCALLY' },
        });
        return;
      }
      const cleaned = text.replace(/^```(?:markdown|md)?\s*|\s*```$/gi, '').trim();
      setCaption(cleaned);
      setQueuePosts([]);
      await updateRun.mutateAsync({
        runId: run.id,
        input: { resultSummary: cleaned, status: 'UPLOADED', sourcePrompt: prompt },
      });
      toast.success(t('marketing.video.generated'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.video.generateFailed'));
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
    }
  };

  useEffect(() => {
    if (!autoGenerate || autoGenerateFired.current || !selected || generatingCaption) return;
    if (isVideoRecipe(recipeById.get(selected.recipeId))) {
      onClearAutoGenerate?.();
      return;
    }
    if (selected.resultSummary?.trim()) {
      onClearAutoGenerate?.();
      return;
    }
    autoGenerateFired.current = true;
    void onGenerateCaption(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, selected?.id]);

  // If createRun returned empty (or old backend), generate the video MD package on the desk.
  useEffect(() => {
    if (!selected || generatingCaption) return;
    const recipe = recipeById.get(selected.recipeId);
    if (!isVideoRecipe(recipe) && !isVideoRun(selected, recipe)) return;
    if (selected.resultSummary?.trim() || caption.trim()) return;
    if (videoGenerateFired.current === selected.id) return;
    videoGenerateFired.current = selected.id;
    void onGenerateVideoPlan(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, selected?.resultSummary, caption, recipeById]);

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
            brief: genBrief,
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
          <div className="mt-4 flex flex-col gap-3">
            <SocialPlatformActions
              projectId={projectId}
              tenantId={tenantId}
              lockedPlatform={lockedPlatform}
            />
            <VideoPlanActions
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
        <div className="flex flex-col gap-3">
          {lockedPlatform === 'LINKEDIN' ? (
            <LinkedInPipelinePanel
              projectId={projectId}
              tenantId={tenantId}
              onApplyDrafts={(captions) => {
                if (captions.length >= 2) {
                  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                  const posts = captions.slice(0, 5).map((copy, i) => ({
                    day: days[i] ?? `Day ${i + 1}`,
                    copy,
                    visualSuggestion: '',
                  }));
                  setQueuePosts(posts);
                  setActiveQueueIndex(0);
                  setCaption(posts[0]?.copy ?? '');
                  setGenBrief((b) => ({ ...b, format: 'week' }));
                } else if (captions[0]) {
                  setQueuePosts([]);
                  setCaption(captions[0]);
                }
              }}
            />
          ) : null}
          <SocialPlatformActions
            projectId={projectId}
            tenantId={tenantId}
            lockedPlatform={lockedPlatform}
          />
          <VideoPlanActions
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

              {isVideoPlan ? (
                <div className="flex flex-col gap-4">
                  <p className="typo-body-sm text-muted-foreground">{t('marketing.video.deskHint')}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => selected && void onGenerateVideoPlan(selected)}
                    >
                      {generatingCaption ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      {caption.trim()
                        ? t('marketing.video.regenerate')
                        : t('marketing.video.generate')}
                    </Button>
                    <ReviseWithFeedback
                      hasContent={Boolean(caption.trim())}
                      busy={generatingCaption}
                      disabled={busy && !generatingCaption}
                      onRevise={onReviseVideoPlan}
                      size="default"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!caption.trim()}
                      onClick={() => void onCopy(caption, 'marketing.video.copiedFull')}
                    >
                      <Copy className="size-4" />
                      {t('marketing.video.copyFull')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!caption.trim()}
                      onClick={() => {
                        const slug = (selectedRecipe?.title || 'video-plan')
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '');
                        downloadMarkdown(`${slug || 'video-plan'}.md`, caption);
                        toast.success(t('marketing.video.downloaded'));
                      }}
                    >
                      <Download className="size-4" />
                      {t('marketing.video.download')}
                    </Button>
                  </div>
                  {generatingCaption ? (
                    <span className="inline-flex items-center gap-1.5 typo-eyebrow text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" />
                      {t('marketing.video.writing')}
                    </span>
                  ) : null}
                  {videoSections.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {videoSections.map((section) => (
                        <div
                          key={section.heading}
                          className="rounded-xl border border-border bg-muted/20 p-3 md:p-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="typo-body-sm font-medium text-foreground">
                              {section.heading}
                            </h4>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={!section.body.trim()}
                              onClick={() =>
                                void onCopy(
                                  `## ${section.heading}\n\n${section.body}`,
                                  'marketing.video.copiedSection',
                                )
                              }
                            >
                              <Copy className="size-3.5" />
                              {t('marketing.video.copySection')}
                            </Button>
                          </div>
                          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap typo-body-sm text-muted-foreground">
                            {section.body || '—'}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Textarea
                      rows={16}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      onBlur={() => {
                        if (selected && caption !== (selected.resultSummary ?? '')) {
                          void persistCaption().catch(() => undefined);
                        }
                      }}
                      placeholder={t('marketing.video.packagePlaceholder')}
                      disabled={generatingCaption}
                      className="min-h-[320px] resize-y font-mono text-sm"
                    />
                  )}
                  {caption.trim() && videoSections.length > 0 ? (
                    <details className="rounded-xl border border-border p-3">
                      <summary className="cursor-pointer typo-body-sm font-medium">
                        {t('marketing.video.editFull')}
                      </summary>
                      <Textarea
                        rows={14}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        onBlur={() => {
                          if (selected && caption !== (selected.resultSummary ?? '')) {
                            void persistCaption().catch(() => undefined);
                          }
                        }}
                        disabled={generatingCaption}
                        className="mt-3 min-h-[280px] resize-y font-mono text-sm"
                      />
                    </details>
                  ) : null}
                  <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                    <Button
                      type="button"
                      onClick={() => void onApprove()}
                      disabled={busy || !caption.trim()}
                    >
                      <Check className="size-4" />
                      {t('marketing.desk.approve')}
                    </Button>
                  </div>
                </div>
              ) : (
              <>
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
                    <ReviseWithFeedback
                      hasContent={Boolean(caption.trim())}
                      busy={generatingCaption}
                      disabled={busy && !generatingCaption}
                      open={reviseCaptionOpen}
                      onOpenChange={setReviseCaptionOpen}
                      onRevise={onReviseCaption}
                    />
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
                  <BrandAssetPicker
                    projectId={projectId}
                    tenantId={tenantId}
                    selectedIds={brandRefIds}
                    onChange={setBrandRefIds}
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
                    <ReviseWithFeedback
                      hasContent={Boolean(imageBrief.trim())}
                      busy={generatingImage}
                      disabled={busy && !generatingImage}
                      onRevise={onReviseImageBrief}
                    />
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
                    <div className="flex flex-col gap-2">
                      <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                        <img
                          src={generatedImageUrl}
                          alt=""
                          className="max-h-72 w-full object-contain"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={downloadingImage}
                          onClick={() => void onDownloadGeneratedImage()}
                        >
                          {downloadingImage ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Download className="size-3.5" />
                          )}
                          {t('marketing.desk.downloadImage')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!generatedAssetId || savingImageToBrand}
                          onClick={() => void onSaveGeneratedImageToBrand()}
                        >
                          {savingImageToBrand ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <FolderInput className="size-3.5" />
                          )}
                          {t('marketing.desk.saveImageToBrand')}
                        </Button>
                      </div>
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
                    <ReviseWithFeedback
                      hasContent={Boolean(commentDrafts.trim())}
                      busy={generatingComments}
                      disabled={(busy && !generatingComments) || !caption.trim()}
                      onRevise={onReviseComments}
                    />
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
              </>
              )}
            </div>
          ) : null}

          {/* Live preview — social posts only */}
          {selected && !isVideoPlan ? (
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
