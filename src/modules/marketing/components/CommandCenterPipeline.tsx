import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { cn } from '@/design-system/lib/utils';
import { useCurrentBrandIdentity, useGenerateBrandIdentity } from '@/modules/marketing/api/use-brand-identity';
import { useBrandMemory } from '@/modules/marketing/api/use-brand-memory';
import { useBrandPerceptionPreview, useGenerateBrandPerception } from '@/modules/marketing/api/use-brand-perception';
import { useCreativeRecipes, useCreativeRuns, useCreativeAssets } from '@/modules/marketing/api/use-creative';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

export type CommandCenterTab =
  | 'desk'
  | 'foundation'
  | 'voice'
  | 'perception'
  | 'create'
  | 'execute'
  | 'library';

interface Props {
  projectId: string;
  tenantId?: string;
  activeTab: CommandCenterTab;
  onOpenTab: (tab: CommandCenterTab) => void;
}

interface Step {
  id: CommandCenterTab;
  labelKey: string;
  done: boolean;
}

export function CommandCenterPipeline({ projectId, tenantId, activeTab, onOpenTab }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: identity } = useCurrentBrandIdentity(projectId, tenantId);
  const { data: memory } = useBrandMemory(projectId, tenantId);
  const { data: perception } = useBrandPerceptionPreview(projectId, tenantId);
  const { data: recipes } = useCreativeRecipes(projectId, tenantId);
  const { data: runs } = useCreativeRuns(projectId, tenantId);
  const { data: assets } = useCreativeAssets(projectId, tenantId);

  const generateIdentity = useGenerateBrandIdentity(projectId, tenantId);
  const generatePerception = useGenerateBrandPerception(projectId, tenantId);
  const building = generateIdentity.isPending || generatePerception.isPending;

  const steps: Step[] = [
    {
      id: 'desk',
      labelKey: 'marketing.pipeline.steps.desk',
      done: (runs?.length ?? 0) > 0,
    },
    {
      id: 'foundation',
      labelKey: 'marketing.pipeline.steps.foundation',
      done: Boolean(identity),
    },
    {
      id: 'voice',
      labelKey: 'marketing.pipeline.steps.voice',
      done: Boolean(memory?.contentMarkdown?.trim()),
    },
    {
      id: 'perception',
      labelKey: 'marketing.pipeline.steps.perception',
      done: Boolean(perception?.contentMarkdown?.trim()),
    },
    {
      id: 'create',
      labelKey: 'marketing.pipeline.steps.create',
      done: (recipes?.length ?? 0) > 0,
    },
    {
      id: 'execute',
      labelKey: 'marketing.pipeline.steps.execute',
      done: (runs?.length ?? 0) > 0,
    },
    {
      id: 'library',
      labelKey: 'marketing.pipeline.steps.library',
      done: (assets?.length ?? 0) > 0,
    },
  ];

  // Daily home is Desk; otherwise first incomplete setup step.
  const nextStep =
    (runs?.length ?? 0) === 0
      ? steps[0]
      : (steps.slice(1).find((s) => !s.done) ?? steps[0]);

  const onBuildFoundation = async () => {
    try {
      await generateIdentity.mutateAsync();
      await generatePerception.mutateAsync();
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['marketing', 'brand-identity'] }),
        qc.invalidateQueries({ queryKey: ['marketing', 'brand-memory'] }),
        qc.invalidateQueries({ queryKey: ['marketing', 'brand-perception'] }),
      ]);
      toast.success(t('marketing.studio.foundationDone'));
      onOpenTab('foundation');
    } catch (e) {
      toast.error((e as Error).message || t('marketing.studio.foundationFailed'));
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="typo-eyebrow-upper text-faint">{t('marketing.pipeline.eyebrow')}</p>
          <p className="typo-body-sm text-muted-foreground">{t('marketing.pipeline.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!identity ? (
            <Button size="sm" onClick={() => void onBuildFoundation()} disabled={building}>
              <Sparkles className="size-3.5" />
              {building ? t('common.loading') : t('marketing.studio.generateFoundation')}
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={() => onOpenTab(nextStep.id)}>
            {t('marketing.pipeline.nextAction', { step: t(nextStep.labelKey) })}
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const active = activeTab === step.id;
          return (
            <li key={step.id} className="flex items-center gap-2">
              {index > 0 ? <span className="hidden text-muted-foreground sm:inline">→</span> : null}
              <button
                type="button"
                onClick={() => onOpenTab(step.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 typo-body-sm transition-colors',
                  active
                    ? 'border-primary/40 bg-primary/5 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-hairline-strong hover:text-foreground',
                )}
              >
                {step.done ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <Circle className="size-3.5" />
                )}
                {t(step.labelKey)}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
