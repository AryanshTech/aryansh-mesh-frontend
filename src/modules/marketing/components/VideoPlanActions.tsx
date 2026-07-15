import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Clapperboard, Sparkles } from 'lucide-react';
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
import { FormDialog, useFormDialogOpen } from '@/shared/components/FormDialog';
import { cn } from '@/design-system/lib/utils';
import {
  useCreateCreativeRecipe,
  useCreateCreativeRun,
} from '@/modules/marketing/api/use-creative';
import { useBrandMemory } from '@/modules/marketing/api/use-brand-memory';
import { useCurrentBrandIdentity } from '@/modules/marketing/api/use-brand-identity';
import {
  buildVideoPlanPrompt,
  videoPlanTitle,
  type VideoPlanAspect,
  type VideoPlanFormat,
  type VideoPlanScope,
} from '@/modules/marketing/lib/video-plan';

interface Props {
  projectId: string;
  tenantId?: string;
  className?: string;
  /** Keep navigation inside current social platform hub when set. */
  lockedPlatform?: string;
}

export function VideoPlanActions({ projectId, tenantId, className, lockedPlatform }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { scheduleOpen, triggerProps } = useFormDialogOpen();
  const createRecipe = useCreateCreativeRecipe(projectId, tenantId);
  const createRun = useCreateCreativeRun(projectId, tenantId);
  const { data: brandMemory } = useBrandMemory(projectId, tenantId);
  const { data: identity } = useCurrentBrandIdentity(projectId, tenantId);

  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<VideoPlanFormat>('product_reel');
  const [scope, setScope] = useState<VideoPlanScope>('whole_product');
  const [featureName, setFeatureName] = useState('');
  const [aspect, setAspect] = useState<VideoPlanAspect>('reel');
  const [brief, setBrief] = useState('');
  const [lengthSeconds, setLengthSeconds] = useState('');

  const busy = createRecipe.isPending || createRun.isPending;

  const reset = () => {
    setFormat('product_reel');
    setScope('whole_product');
    setFeatureName('');
    setAspect('reel');
    setBrief('');
    setLengthSeconds('');
  };

  const onGenerate = async () => {
    if (!brief.trim()) {
      toast.error(t('marketing.video.briefRequired'));
      return;
    }
    if (scope === 'feature' && !featureName.trim()) {
      toast.error(t('marketing.video.featureRequired'));
      return;
    }
    const parsedLength = lengthSeconds.trim()
      ? Number.parseInt(lengthSeconds.trim(), 10)
      : undefined;
    const input = {
      format,
      scope,
      featureName: featureName.trim() || undefined,
      aspect,
      brief: brief.trim(),
      lengthSeconds:
        parsedLength && Number.isFinite(parsedLength) && parsedLength > 0
          ? parsedLength
          : undefined,
    };

    try {
      const title = videoPlanTitle(input);
      const promptMarkdown = buildVideoPlanPrompt(input, {
        memoryMarkdown: brandMemory?.contentMarkdown,
        identity: identity ?? null,
      });
      const recipe = await createRecipe.mutateAsync({
        title,
        goal: brief.trim().slice(0, 200),
        channel: format === 'founders' ? 'Founders' : 'Video',
        assetType: 'VIDEO',
        toolType: 'remotion',
        promptMarkdown,
        expectedOutputs:
          format === 'founders'
            ? ['Founders script', 'Interstitial prompts', 'Remotion generation prompt']
            : ['Video script package', 'Remotion generation prompt'],
      });
      const run = await createRun.mutateAsync({ recipeId: recipe.id });
      setOpen(false);
      reset();
      toast.success(t('marketing.video.jobCreated'));
      const params = new URLSearchParams({
        tab: 'social',
        runId: run.id,
      });
      // Keep platform hub context, but desk now always shows video runs.
      if (lockedPlatform) params.set('platform', lockedPlatform);
      // If createRun left result empty, desk will auto-write the package.
      if (!run.resultSummary?.trim()) params.set('generate', '1');
      void navigate(`/marketing?${params.toString()}`);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.video.jobCreateFailed'));
    }
  };

  return (
    <>
      <div className={cn('flex flex-wrap gap-2', className)}>
        <Button
          type="button"
          variant="outline"
          size="default"
          className="h-11 gap-2 px-4"
          disabled={busy}
          {...triggerProps}
          onClick={() => scheduleOpen(() => setOpen(true))}
        >
          <Clapperboard className="size-4" />
          {t('marketing.video.cta')}
        </Button>
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
            <DialogTitle>{t('marketing.video.composeTitle')}</DialogTitle>
            <DialogDescription>{t('marketing.video.composeDescription')}</DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto py-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t('marketing.video.fieldFormat')}</Label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v === 'founders' ? 'founders' : 'product_reel')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product_reel">{t('marketing.video.formatProduct')}</SelectItem>
                  <SelectItem value="founders">{t('marketing.video.formatFounders')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>{t('marketing.video.fieldScope')}</Label>
                <Select
                  value={scope}
                  onValueChange={(v) =>
                    setScope(v === 'feature' ? 'feature' : 'whole_product')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whole_product">
                      {t('marketing.video.scopeWhole')}
                    </SelectItem>
                    <SelectItem value="feature">{t('marketing.video.scopeFeature')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t('marketing.video.fieldAspect')}</Label>
                <Select
                  value={aspect}
                  onValueChange={(v) => setAspect(v === 'landscape' ? 'landscape' : 'reel')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reel">{t('marketing.video.aspectReel')}</SelectItem>
                    <SelectItem value="landscape">
                      {t('marketing.video.aspectLandscape')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {scope === 'feature' ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vp-feature">{t('marketing.video.fieldFeature')}</Label>
                <Input
                  id="vp-feature"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  placeholder={t('marketing.video.featurePlaceholder')}
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vp-brief">{t('marketing.video.fieldBrief')}</Label>
              <Textarea
                id="vp-brief"
                rows={5}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={
                  format === 'founders'
                    ? t('marketing.video.briefPlaceholderFounders')
                    : t('marketing.video.briefPlaceholderProduct')
                }
                className="min-h-[120px] resize-y"
              />
            </div>

            <div className="flex flex-col gap-1.5 max-w-[160px]">
              <Label htmlFor="vp-length">{t('marketing.video.fieldLength')}</Label>
              <Input
                id="vp-length"
                type="number"
                min={15}
                max={120}
                value={lengthSeconds}
                onChange={(e) => setLengthSeconds(e.target.value)}
                placeholder={format === 'founders' ? '60' : '35'}
              />
              <p className="typo-eyebrow text-muted-foreground">{t('marketing.video.lengthHint')}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={() => void onGenerate()} disabled={busy}>
              <Sparkles className="size-4" />
              {busy ? t('common.loading') : t('marketing.video.generate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </>
  );
}
