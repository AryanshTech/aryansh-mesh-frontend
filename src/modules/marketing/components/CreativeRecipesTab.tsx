import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Sparkles, FlaskConical, Copy, Play } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Card } from '@/design-system/components/ui/card';
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
import { cn } from '@/design-system/lib/utils';
import {
  useCreativeRecipes,
  useCreateCreativeRecipe,
  useGenerateLocalPackage,
  useCreateCreativeRun,
  type CreativeRecipe,
  type CreativeRecipeInput,
  type LocalPackageInput,
  type AssetType,
} from '@/modules/marketing/api/use-creative';
import { useDeferredOverlayOpen } from '@/shared/hooks/radix-dismiss-guard';

interface Props {
  projectId: string;
  tenantId?: string;
  onStartRun?: (runId: string) => void;
}

type PanelMode = 'view' | 'create' | 'generate';

const ASSET_TYPES: AssetType[] = ['IMAGE', 'VIDEO', 'REMOTION_PROJECT', 'PROMPT_PACK', 'OTHER'];

const CHANNELS = ['LinkedIn', 'Instagram', 'Website', 'Ads', 'YouTube', 'Email'] as const;

const TOOLS = [
  { value: 'vertex', labelKey: 'marketing.recipes.tools.vertex' },
  { value: 'remotion', labelKey: 'marketing.recipes.tools.remotion' },
  { value: 'local-claude', labelKey: 'marketing.recipes.tools.localClaude' },
] as const;

interface RecipeTemplate {
  id: string;
  titleKey: string;
  goal: string;
  channel: string;
  assetType: AssetType;
  toolType: string;
}

const TEMPLATES: RecipeTemplate[] = [
  {
    id: 'linkedin-week',
    titleKey: 'marketing.recipes.templates.linkedinWeek',
    goal: 'Write a Mon–Fri LinkedIn queue: hook, how-to, hot take, customer story, and CTA — on-brand and specific.',
    channel: 'LinkedIn',
    assetType: 'PROMPT_PACK',
    toolType: 'vertex',
  },
  {
    id: 'product-demo',
    titleKey: 'marketing.recipes.templates.productDemo',
    goal: 'Script a 60-second product demo video that shows the workflow, not just the output.',
    channel: 'YouTube',
    assetType: 'VIDEO',
    toolType: 'remotion',
  },
  {
    id: 'competitor-gap',
    titleKey: 'marketing.recipes.templates.competitorGap',
    goal: 'Draft a positioning post that owns a gap competitors leave open, with proof and a clear CTA.',
    channel: 'LinkedIn',
    assetType: 'PROMPT_PACK',
    toolType: 'vertex',
  },
];

const NEW_RECIPE: CreativeRecipeInput = {
  title: '',
  goal: '',
  channel: 'LinkedIn',
  assetType: 'PROMPT_PACK',
  toolType: 'vertex',
  promptMarkdown: '',
};

const NEW_PACKAGE: LocalPackageInput = {
  goal: '',
  channel: 'LinkedIn',
  assetType: 'PROMPT_PACK',
  toolType: 'vertex',
};

export function CreativeRecipesTab({ projectId, tenantId, onStartRun }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useCreativeRecipes(projectId, tenantId);
  const createMutation = useCreateCreativeRecipe(projectId, tenantId);
  const generateMutation = useGenerateLocalPackage(projectId, tenantId);
  const startRunMutation = useCreateCreativeRun(projectId, tenantId);
  const { scheduleOpen } = useDeferredOverlayOpen();

  const [panelMode, setPanelMode] = useState<PanelMode | null>(null);
  const [selected, setSelected] = useState<CreativeRecipe | null>(null);
  const [draftRecipe, setDraftRecipe] = useState<CreativeRecipeInput | null>(null);
  const [draftPackage, setDraftPackage] = useState<LocalPackageInput | null>(null);
  const [startingRunId, setStartingRunId] = useState<string | null>(null);

  const recipes = data ?? [];
  const drawerOpen = panelMode !== null;

  const closePanel = () => {
    setPanelMode(null);
    setSelected(null);
    setDraftRecipe(null);
    setDraftPackage(null);
  };

  const openCreate = () => {
    scheduleOpen(() => {
      setSelected(null);
      setDraftPackage(null);
      setDraftRecipe({ ...NEW_RECIPE });
      setPanelMode('create');
    });
  };

  const openGenerate = (template?: RecipeTemplate) => {
    scheduleOpen(() => {
      setSelected(null);
      setDraftRecipe(null);
      setDraftPackage(
        template
          ? {
              goal: template.goal,
              channel: template.channel,
              assetType: template.assetType,
              toolType: template.toolType,
            }
          : { ...NEW_PACKAGE },
      );
      setPanelMode('generate');
    });
  };

  const openRecipe = (recipe: CreativeRecipe) => {
    setDraftRecipe(null);
    setDraftPackage(null);
    setSelected(recipe);
    setPanelMode('view');
  };

  const onCreate = async () => {
    if (!draftRecipe) return;
    if (!draftRecipe.title.trim()) {
      toast.error(t('marketing.recipes.titleRequired'));
      return;
    }
    try {
      const created = await createMutation.mutateAsync(draftRecipe);
      toast.success(t('marketing.recipes.created'));
      setDraftRecipe(null);
      setDraftPackage(null);
      setSelected(created);
      setPanelMode('view');
    } catch (e) {
      toast.error((e as Error).message || t('marketing.recipes.saveFailed'));
    }
  };

  const onGenerate = async () => {
    if (!draftPackage) return;
    if (!draftPackage.goal.trim()) {
      toast.error(t('marketing.recipes.goalRequired'));
      return;
    }
    try {
      const created = await generateMutation.mutateAsync(draftPackage);
      toast.success(t('marketing.recipes.generated'));
      setDraftRecipe(null);
      setDraftPackage(null);
      setSelected(created);
      setPanelMode('view');
    } catch (e) {
      toast.error((e as Error).message || t('marketing.recipes.generateFailed'));
    }
  };

  const handleStartRun = async (recipe: CreativeRecipe) => {
    setStartingRunId(recipe.id);
    try {
      const run = await startRunMutation.mutateAsync({ recipeId: recipe.id });
      toast.success(t('marketing.runs.created'));
      closePanel();
      onStartRun?.(run.id);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.runs.saveFailed'));
    } finally {
      setStartingRunId(null);
    }
  };

  const copyText = async (text: string, labelKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('marketing.recipes.copied', { label: t(labelKey) }));
    } catch {
      toast.error(t('marketing.recipes.copyFailed'));
    }
  };

  const drawerTitle =
    panelMode === 'create'
      ? t('marketing.recipes.create')
      : panelMode === 'generate'
        ? t('marketing.recipes.generate')
        : selected?.title ?? '';

  const listContent = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="typo-body-sm text-muted-foreground max-w-xl">
          {t('marketing.recipes.intro')}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={openCreate}>
            <Plus className="size-4" />
            {t('marketing.recipes.create')}
          </Button>
          <Button onClick={() => openGenerate()}>
            <Sparkles className="size-4" />
            {t('marketing.recipes.generate')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => openGenerate(template)}
            className="rounded-lg border border-border bg-card p-3 text-left hover:border-hairline-strong transition-colors"
          >
            <p className="typo-card-title text-foreground">{t(template.titleKey)}</p>
            <p className="typo-body-sm text-muted-foreground mt-1 line-clamp-2">{template.goal}</p>
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState title={t('marketing.recipes.errorTitle')} onRetry={() => void refetch()} />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={<FlaskConical />}
          title={t('marketing.recipes.emptyTitle')}
          description={t('marketing.recipes.emptyDescription')}
          action={
            <Button onClick={() => openGenerate()}>
              <Sparkles className="size-4" />
              {t('marketing.recipes.generate')}
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">
                  {t('marketing.recipes.columnTitle')}
                </th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">
                  {t('marketing.recipes.columnChannel')}
                </th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">
                  {t('marketing.recipes.columnAssetType')}
                </th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => openRecipe(r)}
                  className={cn(
                    'cursor-pointer border-b border-border last:border-b-0 transition-colors',
                    selected?.id === r.id && panelMode === 'view'
                      ? 'bg-primary/5'
                      : 'hover:bg-muted/30',
                  )}
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.title}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.channel}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {t(`marketing.assets.types.${r.assetType}`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );

  return (
    <DetailDrawer
      open={drawerOpen}
      onOpenChange={(open) => {
        if (!open) closePanel();
      }}
      title={drawerTitle}
      master={listContent}
      footer={
        panelMode === 'create' ? (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={closePanel}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => void onCreate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        ) : panelMode === 'generate' ? (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={closePanel}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => void onGenerate()} disabled={generateMutation.isPending}>
              <Sparkles className="size-4" />
              {generateMutation.isPending ? t('common.loading') : t('marketing.recipes.generate')}
            </Button>
          </div>
        ) : selected ? (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={closePanel}>
              {t('common.close')}
            </Button>
            <Button
              onClick={() => void handleStartRun(selected)}
              disabled={startRunMutation.isPending && startingRunId === selected.id}
            >
              <Play className="size-4" />
              {startRunMutation.isPending && startingRunId === selected.id
                ? t('marketing.runs.generating')
                : t('marketing.recipes.startRun')}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button variant="outline" onClick={closePanel}>
              {t('common.close')}
            </Button>
          </div>
        )
      }
    >
      {panelMode === 'create' && draftRecipe ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-title">{t('marketing.recipes.fieldTitle')} *</Label>
            <Input
              id="r-title"
              value={draftRecipe.title}
              onChange={(e) => setDraftRecipe({ ...draftRecipe, title: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-goal">{t('marketing.recipes.fieldGoal')}</Label>
            <Textarea
              id="r-goal"
              rows={3}
              value={draftRecipe.goal}
              onChange={(e) => setDraftRecipe({ ...draftRecipe, goal: e.target.value })}
            />
          </div>
          <PackageFields
            channel={draftRecipe.channel}
            toolType={draftRecipe.toolType}
            assetType={draftRecipe.assetType}
            onChannel={(channel) => setDraftRecipe({ ...draftRecipe, channel })}
            onTool={(toolType) => setDraftRecipe({ ...draftRecipe, toolType })}
            onAsset={(assetType) => setDraftRecipe({ ...draftRecipe, assetType })}
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-prompt">{t('marketing.recipes.fieldPrompt')}</Label>
            <Textarea
              id="r-prompt"
              rows={6}
              className="font-mono text-xs"
              value={draftRecipe.promptMarkdown ?? ''}
              onChange={(e) => setDraftRecipe({ ...draftRecipe, promptMarkdown: e.target.value })}
            />
          </div>
        </div>
      ) : panelMode === 'generate' && draftPackage ? (
        <div className="flex flex-col gap-4">
          <p className="typo-body-sm text-muted-foreground">{t('marketing.recipes.generateHint')}</p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-goal">{t('marketing.recipes.fieldGoal')} *</Label>
            <Textarea
              id="p-goal"
              rows={4}
              value={draftPackage.goal}
              onChange={(e) => setDraftPackage({ ...draftPackage, goal: e.target.value })}
              placeholder={t('marketing.recipes.goalPlaceholder')}
            />
          </div>
          <PackageFields
            channel={draftPackage.channel}
            toolType={draftPackage.toolType}
            assetType={draftPackage.assetType}
            onChannel={(channel) => setDraftPackage({ ...draftPackage, channel })}
            onTool={(toolType) => setDraftPackage({ ...draftPackage, toolType })}
            onAsset={(assetType) => setDraftPackage({ ...draftPackage, assetType })}
          />
        </div>
      ) : panelMode === 'view' && selected ? (
        <div className="flex flex-col gap-4">
          <Card className="p-4 flex flex-col gap-2">
            <p className="typo-eyebrow-upper text-faint">{t('marketing.recipes.fieldGoal')}</p>
            <p className="typo-body-sm text-foreground">{selected.goal}</p>
          </Card>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="typo-eyebrow-upper text-faint">{t('marketing.recipes.fieldPrompt')}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void copyText(selected.promptMarkdown, 'marketing.recipes.fieldPrompt')}
              >
                <Copy className="size-3.5" />
              </Button>
            </div>
            <Card className="p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-xs text-foreground leading-relaxed">
                {selected.promptMarkdown}
              </pre>
            </Card>
          </div>
          {selected.setupCommands.length > 0 ? (
            <CommandBlock
              titleKey="marketing.recipes.setupCommands"
              lines={selected.setupCommands}
              onCopy={() => void copyText(selected.setupCommands.join('\n'), 'marketing.recipes.setupCommands')}
            />
          ) : null}
          {selected.runCommands.length > 0 ? (
            <CommandBlock
              titleKey="marketing.recipes.runCommands"
              lines={selected.runCommands}
              onCopy={() => void copyText(selected.runCommands.join('\n'), 'marketing.recipes.runCommands')}
            />
          ) : null}
          {selected.expectedOutputs.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="typo-eyebrow-upper text-faint">{t('marketing.recipes.expectedOutputs')}</p>
              <Card className="p-3">
                <ul className="list-disc list-inside text-sm text-foreground">
                  {selected.expectedOutputs.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </Card>
            </div>
          ) : null}
        </div>
      ) : null}
    </DetailDrawer>
  );
}

function PackageFields({
  channel,
  toolType,
  assetType,
  onChannel,
  onTool,
  onAsset,
}: {
  channel: string;
  toolType: string;
  assetType: AssetType;
  onChannel: (v: string) => void;
  onTool: (v: string) => void;
  onAsset: (v: AssetType) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Label>{t('marketing.recipes.fieldChannel')}</Label>
        <Select value={channel || CHANNELS[0]} onValueChange={onChannel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHANNELS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
            {channel && !(CHANNELS as readonly string[]).includes(channel) ? (
              <SelectItem value={channel}>{channel}</SelectItem>
            ) : null}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>{t('marketing.recipes.fieldToolType')}</Label>
        <Select value={toolType || 'vertex'} onValueChange={onTool}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOOLS.map((tool) => (
              <SelectItem key={tool.value} value={tool.value}>
                {t(tool.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>{t('marketing.recipes.fieldAssetType')}</Label>
        <Select value={assetType} onValueChange={(v) => onAsset(v as AssetType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSET_TYPES.map((a) => (
              <SelectItem key={a} value={a}>
                {t(`marketing.assets.types.${a}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function CommandBlock({
  titleKey,
  lines,
  onCopy,
}: {
  titleKey: string;
  lines: string[];
  onCopy: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="typo-eyebrow-upper text-faint">{t(titleKey)}</p>
        <Button size="sm" variant="ghost" onClick={onCopy}>
          <Copy className="size-3.5" />
        </Button>
      </div>
      <Card className="p-3">
        <pre className="whitespace-pre-wrap font-mono text-xs text-foreground">{lines.join('\n')}</pre>
      </Card>
    </div>
  );
}
