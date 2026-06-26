import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Sparkles, FlaskConical, Copy } from 'lucide-react';
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
  type CreativeRecipe,
  type CreativeRecipeInput,
  type LocalPackageInput,
  type AssetType,
} from '@/modules/marketing/api/use-creative';

interface Props {
  projectId: string;
  tenantId?: string;
}

const ASSET_TYPES: AssetType[] = ['IMAGE', 'VIDEO', 'REMOTION_PROJECT', 'PROMPT_PACK', 'OTHER'];

const NEW_RECIPE: CreativeRecipeInput = {
  title: '',
  goal: '',
  channel: '',
  assetType: 'IMAGE',
  toolType: '',
  promptMarkdown: '',
};

const NEW_PACKAGE: LocalPackageInput = {
  goal: '',
  channel: '',
  assetType: 'IMAGE',
  toolType: '',
};

export function CreativeRecipesTab({ projectId, tenantId }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useCreativeRecipes(projectId, tenantId);
  const createMutation = useCreateCreativeRecipe(projectId, tenantId);
  const generateMutation = useGenerateLocalPackage(projectId, tenantId);

  const [selected, setSelected] = useState<CreativeRecipe | null>(null);
  const [draftRecipe, setDraftRecipe] = useState<CreativeRecipeInput | null>(null);
  const [draftPackage, setDraftPackage] = useState<LocalPackageInput | null>(null);

  const recipes = data ?? [];

  const onCreate = async () => {
    if (!draftRecipe) return;
    if (!draftRecipe.title.trim()) { toast.error(t('common.errorRequired')); return; }
    try {
      await createMutation.mutateAsync(draftRecipe);
      toast.success(t('marketing.recipes.created'));
      setDraftRecipe(null);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.recipes.saveFailed'));
    }
  };

  const onGenerate = async () => {
    if (!draftPackage) return;
    if (!draftPackage.goal.trim()) { toast.error(t('common.errorRequired')); return; }
    try {
      await generateMutation.mutateAsync(draftPackage);
      toast.success(t('marketing.recipes.generated'));
      setDraftPackage(null);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.recipes.generateFailed'));
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

  const master = (
    <div className="flex flex-col gap-4">
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDraftPackage({ ...NEW_PACKAGE })}>
                <Sparkles className="size-4" />{t('marketing.recipes.generate')}
              </Button>
              <Button onClick={() => setDraftRecipe({ ...NEW_RECIPE })}>
                <Plus className="size-4" />{t('marketing.recipes.create')}
              </Button>
            </div>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('marketing.recipes.columnTitle')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('marketing.recipes.columnChannel')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('marketing.recipes.columnAssetType')}</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={cn(
                    'cursor-pointer border-b border-border last:border-b-0 transition-colors',
                    selected?.id === r.id ? 'bg-primary/5' : 'hover:bg-muted/30',
                  )}
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.title}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.channel}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.assetType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => setDraftPackage({ ...NEW_PACKAGE })}>
          <Sparkles className="size-4" />{t('marketing.recipes.generate')}
        </Button>
        <Button onClick={() => setDraftRecipe({ ...NEW_RECIPE })}>
          <Plus className="size-4" />{t('marketing.recipes.create')}
        </Button>
      </div>

      {master}

      {/* Recipe detail drawer */}
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => (o ? null : setSelected(null))}
        title={selected?.title ?? ''}
        master={<div />}
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelected(null)}>{t('common.close')}</Button>
          </div>
        }
      >
        {selected ? (
          <div className="flex flex-col gap-4">
            <Card className="p-4 flex flex-col gap-2">
              <p className="typo-eyebrow-upper text-faint">{t('marketing.recipes.fieldGoal')}</p>
              <p className="typo-body-sm text-foreground">{selected.goal}</p>
            </Card>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="typo-eyebrow-upper text-faint">{t('marketing.recipes.fieldPrompt')}</p>
                <Button size="sm" variant="ghost" onClick={() => void copyText(selected.promptMarkdown, 'marketing.recipes.fieldPrompt')}>
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
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="typo-eyebrow-upper text-faint">{t('marketing.recipes.setupCommands')}</p>
                  <Button size="sm" variant="ghost" onClick={() => void copyText(selected.setupCommands.join('\n'), 'marketing.recipes.setupCommands')}>
                    <Copy className="size-3.5" />
                  </Button>
                </div>
                <Card className="p-3">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-foreground">{selected.setupCommands.join('\n')}</pre>
                </Card>
              </div>
            ) : null}
            {selected.runCommands.length > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="typo-eyebrow-upper text-faint">{t('marketing.recipes.runCommands')}</p>
                  <Button size="sm" variant="ghost" onClick={() => void copyText(selected.runCommands.join('\n'), 'marketing.recipes.runCommands')}>
                    <Copy className="size-3.5" />
                  </Button>
                </div>
                <Card className="p-3">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-foreground">{selected.runCommands.join('\n')}</pre>
                </Card>
              </div>
            ) : null}
            {selected.expectedOutputs.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="typo-eyebrow-upper text-faint">{t('marketing.recipes.expectedOutputs')}</p>
                <Card className="p-3">
                  <ul className="list-disc list-inside text-sm text-foreground">
                    {selected.expectedOutputs.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </Card>
              </div>
            ) : null}
          </div>
        ) : null}
      </DetailDrawer>

      {/* Create recipe drawer */}
      <DetailDrawer
        open={!!draftRecipe}
        onOpenChange={(o) => (o ? null : setDraftRecipe(null))}
        title={t('marketing.recipes.create')}
        master={<div />}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setDraftRecipe(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => void onCreate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        }
      >
        {draftRecipe ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="r-title">{t('marketing.recipes.fieldTitle')} *</Label>
              <Input id="r-title" value={draftRecipe.title} onChange={(e) => setDraftRecipe({ ...draftRecipe, title: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="r-goal">{t('marketing.recipes.fieldGoal')}</Label>
              <Textarea id="r-goal" rows={3} value={draftRecipe.goal} onChange={(e) => setDraftRecipe({ ...draftRecipe, goal: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="r-channel">{t('marketing.recipes.fieldChannel')}</Label>
                <Input id="r-channel" value={draftRecipe.channel} onChange={(e) => setDraftRecipe({ ...draftRecipe, channel: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="r-tool">{t('marketing.recipes.fieldToolType')}</Label>
                <Input id="r-tool" value={draftRecipe.toolType} onChange={(e) => setDraftRecipe({ ...draftRecipe, toolType: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="r-asset-type">{t('marketing.recipes.fieldAssetType')}</Label>
              <Select value={draftRecipe.assetType} onValueChange={(v) => setDraftRecipe({ ...draftRecipe, assetType: v as AssetType })}>
                <SelectTrigger id="r-asset-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="r-prompt">{t('marketing.recipes.fieldPrompt')}</Label>
              <Textarea id="r-prompt" rows={6} className="font-mono text-xs" value={draftRecipe.promptMarkdown ?? ''} onChange={(e) => setDraftRecipe({ ...draftRecipe, promptMarkdown: e.target.value })} />
            </div>
          </div>
        ) : null}
      </DetailDrawer>

      {/* Local package drawer */}
      <DetailDrawer
        open={!!draftPackage}
        onOpenChange={(o) => (o ? null : setDraftPackage(null))}
        title={t('marketing.recipes.generate')}
        master={<div />}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setDraftPackage(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => void onGenerate()} disabled={generateMutation.isPending}>
              <Sparkles className="size-4" />
              {generateMutation.isPending ? t('common.loading') : t('marketing.recipes.generate')}
            </Button>
          </div>
        }
      >
        {draftPackage ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-goal">{t('marketing.recipes.fieldGoal')} *</Label>
              <Textarea id="p-goal" rows={3} value={draftPackage.goal} onChange={(e) => setDraftPackage({ ...draftPackage, goal: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-channel">{t('marketing.recipes.fieldChannel')}</Label>
                <Input id="p-channel" value={draftPackage.channel} onChange={(e) => setDraftPackage({ ...draftPackage, channel: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-tool">{t('marketing.recipes.fieldToolType')}</Label>
                <Input id="p-tool" value={draftPackage.toolType} onChange={(e) => setDraftPackage({ ...draftPackage, toolType: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-asset-type">{t('marketing.recipes.fieldAssetType')}</Label>
              <Select value={draftPackage.assetType} onValueChange={(v) => setDraftPackage({ ...draftPackage, assetType: v as AssetType })}>
                <SelectTrigger id="p-asset-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
