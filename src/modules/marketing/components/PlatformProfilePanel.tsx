import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { Label } from '@/design-system/components/ui/label';
import { Input } from '@/design-system/components/ui/input';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { useBrandMemory, useSaveBrandMemory } from '@/modules/marketing/api/use-brand-memory';
import { useCurrentBrandIdentity } from '@/modules/marketing/api/use-brand-identity';
import { useCreateThread } from '@/modules/marketing/api/use-threads';
import { syncThreadChat } from '@/modules/marketing/api/stream-thread-chat';
import { ReviseWithFeedback } from '@/modules/marketing/components/ReviseWithFeedback';
import {
  buildRevisionPrompt,
  formatProfileDraftForRevision,
} from '@/modules/marketing/lib/revise-prompt';
import {
  formatBrandContextForPrompt,
  withBrandContext,
} from '@/modules/marketing/lib/brand-context';
import {
  appendGenerationFeedbackToMemory,
  isStrongGenerationFeedback,
} from '@/modules/marketing/lib/generation-feedback';
import { LinkedInConnectCard } from '@/modules/marketing/components/LinkedInConnectCard';
import {
  buildPlatformProfilePrompt,
  parsePlatformProfile,
  parsePlatformProfileReply,
  upsertPlatformProfile,
  type PlatformProfile,
  type ProfilePlatform,
} from '@/modules/marketing/lib/platform-profile';

interface Props {
  projectId: string;
  tenantId?: string;
  platform: ProfilePlatform;
}

const EMPTY: PlatformProfile = { field1: '', field2: '', field3: '', cadenceDays: 7 };

function profileOutputInstructions(platform: ProfilePlatform): string {
  const label =
    platform === 'LINKEDIN' ? 'LinkedIn' : platform === 'INSTAGRAM' ? 'Instagram' : 'X';
  return [
    `Return revised ${label} profile copy in exactly this format:`,
    'FIELD1: ...',
    'FIELD2: ...',
    'FIELD3: ...',
    'No preamble. Stay on this brand only.',
  ].join('\n');
}

export function PlatformProfilePanel({ projectId, tenantId, platform }: Props) {
  const { t } = useTranslation();
  const { data: memory, isLoading, isError, refetch } = useBrandMemory(projectId, tenantId);
  const { data: identity } = useCurrentBrandIdentity(projectId, tenantId);
  const saveMemory = useSaveBrandMemory(projectId, tenantId);
  const createThread = useCreateThread(projectId, tenantId);

  const [draft, setDraft] = useState<PlatformProfile>(EMPTY);
  const [generating, setGenerating] = useState(false);
  /** Keep AI/edits on screen until save — don't let memory refetch wipe them. */
  const localEditsRef = useRef(false);

  useEffect(() => {
    localEditsRef.current = false;
    setDraft(parsePlatformProfile(platform, memory?.contentMarkdown));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- platform switch only
  }, [platform]);

  useEffect(() => {
    if (localEditsRef.current) return;
    setDraft(parsePlatformProfile(platform, memory?.contentMarkdown));
  }, [memory?.contentMarkdown, memory?.id, platform]);

  const updateDraft = (
    patch: Partial<PlatformProfile> | ((d: PlatformProfile) => PlatformProfile),
  ) => {
    localEditsRef.current = true;
    setDraft((d) => (typeof patch === 'function' ? patch(d) : { ...d, ...patch }));
  };

  const hasDraft = Boolean(draft.field1.trim() || draft.field2.trim() || draft.field3.trim());

  const onSave = async () => {
    try {
      const next = upsertPlatformProfile(platform, memory?.contentMarkdown ?? '', draft);
      await saveMemory.mutateAsync(next);
      localEditsRef.current = false;
      setDraft(parsePlatformProfile(platform, next));
      toast.success(t('marketing.brand.profileSaved'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brand.profileSaveFailed'));
    }
  };

  const runProfilePrompt = async (prompt: string, successKey: string) => {
    if (!tenantId) {
      toast.error(t('marketing.desk.tenantRequired'));
      return;
    }
    setGenerating(true);
    try {
      const thread = await createThread.mutateAsync({
        title: t('marketing.brand.profileGenerateTitle', {
          platform: t(`marketing.social.platforms.${platform}`),
        }),
      });
      const result = await syncThreadChat(thread.id, { content: prompt }, tenantId);
      const parsed = parsePlatformProfileReply(result.content?.trim() ?? '');
      if (!parsed.field1 && !parsed.field2) {
        toast.error(t('marketing.brand.profileEmpty'));
        return;
      }
      localEditsRef.current = true;
      setDraft((d) => ({ ...d, ...parsed }));
      toast.success(t(successKey));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brand.profileGenerateFailed'));
    } finally {
      setGenerating(false);
    }
  };

  const onGenerate = async () => {
    const memoryMd = memory?.contentMarkdown?.trim() ?? '';
    if (!memoryMd) {
      toast.error(t('marketing.brand.profileNeedMemory'));
      return;
    }
    const prompt = buildPlatformProfilePrompt(platform, {
      mission: identity?.mission,
      vision: identity?.vision,
      audience: identity?.audience,
      voiceTone: identity?.voiceTone,
      pillars: identity?.contentPillars,
      visualStyle: identity?.visualStyle,
      brandMemoryMarkdown: memoryMd,
    });
    await runProfilePrompt(prompt, 'marketing.brand.profileGenerated');
  };

  const onRevise = async (feedback: string) => {
    const memoryMd = memory?.contentMarkdown?.trim() ?? '';
    if (!memoryMd) {
      toast.error(t('marketing.brand.profileNeedMemory'));
      return;
    }
    if (!hasDraft) {
      toast.error(t('marketing.revise.needDraft'));
      return;
    }
    const brandContext = formatBrandContextForPrompt({
      memoryMarkdown: memoryMd,
      identity: identity ?? null,
    });
    const prompt = withBrandContext(
      buildRevisionPrompt({
        deliverable: `${t(`marketing.social.platforms.${platform}`)} profile copy`,
        previousOutput: formatProfileDraftForRevision(draft),
        feedback,
        outputInstructions: profileOutputInstructions(platform),
      }),
      brandContext,
    );
    await runProfilePrompt(prompt, 'marketing.revise.success');
    if (isStrongGenerationFeedback(feedback)) {
      try {
        const next = appendGenerationFeedbackToMemory(memoryMd, {
          feedback,
          surface: 'profile',
          channel: t(`marketing.social.platforms.${platform}`),
        });
        if (next !== memoryMd.trim()) {
          await saveMemory.mutateAsync(next);
          toast.success(t('marketing.revise.feedbackSaved'));
        }
      } catch {
        /* non-blocking */
      }
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (isError) {
    return (
      <ErrorState title={t('marketing.brandMemory.loadFailed')} onRetry={() => void refetch()} />
    );
  }

  const labels = {
    LINKEDIN: {
      f1: t('marketing.brand.linkedinHeadline'),
      f2: t('marketing.brand.linkedinAbout'),
      f3: t('marketing.brand.linkedinTagline'),
      p1: t('marketing.brand.linkedinHeadlinePlaceholder'),
      p2: t('marketing.brand.linkedinAboutPlaceholder'),
      p3: t('marketing.brand.linkedinTaglinePlaceholder'),
    },
    INSTAGRAM: {
      f1: t('marketing.brand.igName'),
      f2: t('marketing.brand.igBio'),
      f3: t('marketing.brand.igHighlights'),
      p1: t('marketing.brand.igNamePlaceholder'),
      p2: t('marketing.brand.igBioPlaceholder'),
      p3: t('marketing.brand.igHighlightsPlaceholder'),
    },
    X: {
      f1: t('marketing.brand.xName'),
      f2: t('marketing.brand.xBio'),
      f3: t('marketing.brand.xPinned'),
      p1: t('marketing.brand.xNamePlaceholder'),
      p2: t('marketing.brand.xBioPlaceholder'),
      p3: t('marketing.brand.xPinnedPlaceholder'),
    },
  }[platform];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <p className="typo-eyebrow-upper text-faint">{t('marketing.brand.profileEyebrow')}</p>
      <h3 className="mt-1 typo-card-title text-foreground">
        {t('marketing.brand.profileTitle', {
          platform: t(`marketing.social.platforms.${platform}`),
        })}
      </h3>
      <p className="mt-1 max-w-2xl typo-body-sm text-muted-foreground">
        {t('marketing.brand.profileSubtitle')}
      </p>

      {platform === 'LINKEDIN' ? (
        <div className="mt-4">
          <LinkedInConnectCard projectId={projectId} tenantId={tenantId} />
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`pp-f1-${platform}`}>{labels.f1}</Label>
          <Input
            id={`pp-f1-${platform}`}
            value={draft.field1}
            onChange={(e) => updateDraft({ field1: e.target.value })}
            placeholder={labels.p1}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`pp-f2-${platform}`}>{labels.f2}</Label>
          <Textarea
            id={`pp-f2-${platform}`}
            rows={8}
            value={draft.field2}
            onChange={(e) => updateDraft({ field2: e.target.value })}
            placeholder={labels.p2}
            className="min-h-[160px] resize-y"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`pp-f3-${platform}`}>{labels.f3}</Label>
          <Input
            id={`pp-f3-${platform}`}
            value={draft.field3}
            onChange={(e) => updateDraft({ field3: e.target.value })}
            placeholder={labels.p3}
          />
        </div>
        <div className="flex flex-col gap-1.5 max-w-[160px]">
          <Label htmlFor={`pp-cadence-${platform}`}>{t('marketing.brand.cadenceDays')}</Label>
          <Input
            id={`pp-cadence-${platform}`}
            type="number"
            min={1}
            max={90}
            value={draft.cadenceDays}
            onChange={(e) =>
              updateDraft({
                cadenceDays: Math.max(1, Number.parseInt(e.target.value, 10) || 7),
              })
            }
          />
          <p className="typo-eyebrow text-muted-foreground">{t('marketing.brand.cadenceHint')}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => void onGenerate()}
          disabled={generating || saveMemory.isPending}
        >
          {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {generating ? t('common.loading') : t('marketing.brand.profileGenerate')}
        </Button>
        <ReviseWithFeedback
          hasContent={hasDraft}
          busy={generating}
          disabled={saveMemory.isPending}
          onRevise={onRevise}
          size="default"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => void onSave()}
          disabled={generating || saveMemory.isPending}
        >
          <Save className="size-4" />
          {saveMemory.isPending ? t('common.loading') : t('marketing.brand.profileSave')}
        </Button>
      </div>
    </div>
  );
}
