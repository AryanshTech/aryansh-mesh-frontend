import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Sparkles, PenLine, CalendarDays } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import { FormDialog } from '@/shared/components/FormDialog';
import { cn } from '@/design-system/lib/utils';
import { platformColors } from '@/design-system/tokens/platformColors';
import {
  useCreateCreativeRecipe,
  useCreateCreativeRun,
} from '@/modules/marketing/api/use-creative';
import {
  buildSocialAiPrompt,
  buildThreadTitle,
  type SocialComposeBrief,
} from '@/modules/marketing/lib/social-content';
import type { GenerationFormat } from '@/modules/marketing/lib/run-notes';
import type { SocialPlatform } from '@/modules/marketing/api/use-social-posts';

const QUICK_PLATFORMS: SocialPlatform[] = ['LINKEDIN', 'INSTAGRAM', 'X'];

function platformToChannel(platform: SocialPlatform): string {
  if (platform === 'INSTAGRAM') return 'Instagram';
  if (platform === 'LINKEDIN') return 'LinkedIn';
  if (platform === 'X') return 'X';
  return platform.replace(/_/g, ' ');
}

interface Props {
  projectId: string;
  tenantId?: string;
  className?: string;
  lockedPlatform?: SocialPlatform;
}

export function SocialPlatformActions({
  projectId,
  tenantId,
  className,
  lockedPlatform,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createRecipe = useCreateCreativeRecipe(projectId, tenantId);
  const createRun = useCreateCreativeRun(projectId, tenantId);

  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<SocialPlatform>(lockedPlatform ?? 'LINKEDIN');
  const [topic, setTopic] = useState('');
  const [angle, setAngle] = useState('');
  const [brief, setBrief] = useState('');
  const [audience, setAudience] = useState('');
  const [cta, setCta] = useState('');
  const [tone, setTone] = useState('');
  const [format, setFormat] = useState<GenerationFormat>('single');

  const busy = createRecipe.isPending || createRun.isPending;
  const platforms = lockedPlatform ? [lockedPlatform] : QUICK_PLATFORMS;

  const reset = () => {
    setTopic('');
    setAngle('');
    setBrief('');
    setAudience('');
    setCta('');
    setTone('');
    setFormat('single');
  };

  const openForPlatform = (next: SocialPlatform) => {
    setPlatform(next);
    reset();
    setOpen(true);
  };

  const composeBrief = (): SocialComposeBrief | null => {
    if (!topic.trim()) {
      toast.error(t('marketing.social.topicRequired'));
      return null;
    }
    return {
      platform,
      topic: topic.trim(),
      angle: angle.trim() || undefined,
      brief: brief.trim() || undefined,
      audience: audience.trim() || undefined,
      cta: cta.trim() || undefined,
      tone: tone.trim() || undefined,
      format,
    };
  };

  const onDraftManually = () => {
    const input = composeBrief();
    if (!input) return;

    const params = new URLSearchParams({
      tab: 'calendar',
      compose: '1',
      platform: input.platform,
      topic: input.topic,
    });
    if (input.brief) params.set('brief', input.brief);

    setOpen(false);
    reset();
    void navigate(`/marketing?${params.toString()}`);
  };

  const onGenerateWithAi = async () => {
    const input = composeBrief();
    if (!input) return;

    try {
      const goalParts = [input.topic.trim()];
      if (input.angle?.trim()) goalParts.push(input.angle.trim());
      if (input.brief?.trim()) goalParts.push(input.brief.trim());
      const goal = goalParts.join(' — ');
      const recipe = await createRecipe.mutateAsync({
        title: buildThreadTitle(input.platform, input.topic),
        goal,
        channel: platformToChannel(input.platform),
        assetType: 'PROMPT_PACK',
        toolType: 'vertex',
        promptMarkdown: buildSocialAiPrompt(input),
        expectedOutputs:
          input.format === 'week'
            ? ['Mon–Fri post queue']
            : ['Ready-to-publish post copy'],
      });
      const run = await createRun.mutateAsync({ recipeId: recipe.id });
      setOpen(false);
      reset();
      toast.success(t('marketing.desk.jobCreated'));
      void navigate(
        `/marketing?tab=social&platform=${input.platform}&runId=${encodeURIComponent(run.id)}&generate=1`,
      );
    } catch (e) {
      toast.error((e as Error).message || t('marketing.desk.jobCreateFailed'));
    }
  };

  return (
    <>
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => {
            const color = platformColors[p];
            return (
              <Button
                key={p}
                type="button"
                variant="outline"
                size="default"
                className="h-11 gap-2 px-4"
                style={{ borderColor: `${color}55`, color }}
                onClick={() => openForPlatform(p)}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                {lockedPlatform
                  ? t('marketing.desk.generateJob')
                  : t(`marketing.social.platforms.${p}`)}
              </Button>
            );
          })}
        </div>
      </div>

      <FormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t('marketing.social.composeTitle', {
                platform: t(`marketing.social.platforms.${platform}`),
              })}
            </DialogTitle>
            <DialogDescription>{t('marketing.desk.composeDescription')}</DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sp-topic">{t('marketing.social.fieldTopic')}</Label>
              <Input
                id="sp-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t('marketing.social.topicPlaceholder')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sp-angle">{t('marketing.desk.fieldAngle')}</Label>
              <Input
                id="sp-angle"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                placeholder={t('marketing.desk.anglePlaceholder')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sp-brief">{t('marketing.social.fieldBrief')}</Label>
              <Textarea
                id="sp-brief"
                rows={3}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={t('marketing.social.briefPlaceholder')}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sp-audience">{t('marketing.desk.fieldAudience')}</Label>
                <Input
                  id="sp-audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder={t('marketing.desk.audiencePlaceholder')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sp-cta">{t('marketing.desk.fieldCta')}</Label>
                <Input
                  id="sp-cta"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder={t('marketing.desk.ctaPlaceholder')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sp-tone">{t('marketing.desk.fieldTone')}</Label>
                <Input
                  id="sp-tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder={t('marketing.desk.tonePlaceholder')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t('marketing.desk.fieldFormat')}</Label>
                <Select
                  value={format}
                  onValueChange={(v) => setFormat(v === 'week' ? 'week' : 'single')}
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

          <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
            <Button type="button" onClick={() => void onGenerateWithAi()} disabled={busy}>
              <Sparkles className="size-4" />
              {busy ? t('common.loading') : t('marketing.desk.generateJob')}
            </Button>
            <Button type="button" variant="outline" onClick={onDraftManually} disabled={busy}>
              <PenLine className="size-4" />
              {t('marketing.social.draftManually')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOpen(false);
                reset();
                void navigate(`/marketing?tab=calendar&platform=${platform}`);
              }}
              disabled={busy}
            >
              <CalendarDays className="size-4" />
              {t('marketing.desk.linkedinOpenCalendar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </>
  );
}
