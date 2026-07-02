import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Sparkles, Save, Palette } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Button } from '@/design-system/components/ui/button';
import { Card } from '@/design-system/components/ui/card';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import { StatusBadge } from '@/shared/components/StatusBadge';
import {
  useCurrentBrandIdentity,
  useSaveBrandIdentity,
  useGenerateBrandIdentity,
  type BrandIdentity,
  type BrandIdentityInput,
} from '@/modules/marketing/api/use-brand-identity';

interface Props {
  projectId: string;
  tenantId?: string;
}

const EMPTY_DRAFT: BrandIdentityInput = {
  colors: { primary: '', secondary: '', accent: '', background: '', surface: '', text: '', mutedText: '' },
  typography: { heading: '', body: '', caption: '', rules: '' },
  visualStyle: '',
  motionStyle: '',
  voiceTone: '',
  mission: '',
  vision: '',
  values: [],
  audience: '',
  contentPillars: [],
  doRules: [],
  dontRules: [],
};

function toDraft(i: BrandIdentity): BrandIdentityInput {
  return {
    colors: { ...i.colors },
    typography: { ...i.typography },
    visualStyle: i.visualStyle ?? '',
    motionStyle: i.motionStyle ?? '',
    voiceTone: i.voiceTone ?? '',
    mission: i.mission ?? '',
    vision: i.vision ?? '',
    values: i.values ?? [],
    audience: i.audience ?? '',
    contentPillars: i.contentPillars ?? [],
    doRules: i.doRules ?? [],
    dontRules: i.dontRules ?? [],
    evidenceLinks: i.evidenceLinks ?? [],
    sourceMarkdown: i.sourceMarkdown ?? '',
  };
}

function csvToArray(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

function linesToArray(s: string): string[] {
  return s.split('\n').map((x) => x.trim()).filter(Boolean);
}

function BrandIdentityForm({
  draft,
  onChange,
}: {
  draft: BrandIdentityInput;
  onChange: (next: BrandIdentityInput) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <Card className="p-6 flex flex-col gap-5">
        <p className="typo-card-title text-foreground">{t('marketing.brandIdentity.fieldColors')}</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {(['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'mutedText'] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label htmlFor={`color-${key}`}>{t(`marketing.brandIdentity.colors.${key}`)}</Label>
              <div className="flex items-center gap-2">
                <span
                  className="size-7 rounded-md border border-border shrink-0"
                  style={{ background: draft.colors?.[key] || 'transparent' }}
                />
                <Input
                  id={`color-${key}`}
                  value={draft.colors?.[key] ?? ''}
                  onChange={(e) => onChange({ ...draft, colors: { ...draft.colors, [key]: e.target.value } })}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 flex flex-col gap-5">
        <p className="typo-card-title text-foreground">{t('marketing.brandIdentity.fieldTypography')}</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(['heading', 'body', 'caption', 'rules'] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label htmlFor={`type-${key}`}>{t(`marketing.brandIdentity.typography.${key}`)}</Label>
              <Input
                id={`type-${key}`}
                value={draft.typography?.[key] ?? ''}
                onChange={(e) => onChange({ ...draft, typography: { ...draft.typography, [key]: e.target.value } })}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-visualStyle">{t('marketing.brandIdentity.fieldVisualStyle')}</Label>
            <Textarea id="bi-visualStyle" rows={2} value={draft.visualStyle ?? ''} onChange={(e) => onChange({ ...draft, visualStyle: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-motionStyle">{t('marketing.brandIdentity.fieldMotionStyle')}</Label>
            <Textarea id="bi-motionStyle" rows={2} value={draft.motionStyle ?? ''} onChange={(e) => onChange({ ...draft, motionStyle: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-voiceTone">{t('marketing.brandIdentity.fieldVoiceTone')}</Label>
            <Input id="bi-voiceTone" value={draft.voiceTone ?? ''} onChange={(e) => onChange({ ...draft, voiceTone: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-audience">{t('marketing.brandIdentity.fieldAudience')}</Label>
            <Input id="bi-audience" value={draft.audience ?? ''} onChange={(e) => onChange({ ...draft, audience: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-mission">{t('marketing.brandIdentity.fieldMission')}</Label>
            <Textarea id="bi-mission" rows={2} value={draft.mission ?? ''} onChange={(e) => onChange({ ...draft, mission: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-vision">{t('marketing.brandIdentity.fieldVision')}</Label>
            <Textarea id="bi-vision" rows={2} value={draft.vision ?? ''} onChange={(e) => onChange({ ...draft, vision: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-values">{t('marketing.brandIdentity.fieldValues')}</Label>
            <Input id="bi-values" value={(draft.values ?? []).join(', ')} onChange={(e) => onChange({ ...draft, values: csvToArray(e.target.value) })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-pillars">{t('marketing.brandIdentity.fieldContentPillars')}</Label>
            <Input id="bi-pillars" value={(draft.contentPillars ?? []).join(', ')} onChange={(e) => onChange({ ...draft, contentPillars: csvToArray(e.target.value) })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-do">{t('marketing.brandIdentity.fieldDoRules')}</Label>
            <Textarea id="bi-do" rows={3} value={(draft.doRules ?? []).join('\n')} onChange={(e) => onChange({ ...draft, doRules: linesToArray(e.target.value) })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-dont">{t('marketing.brandIdentity.fieldDontRules')}</Label>
            <Textarea id="bi-dont" rows={3} value={(draft.dontRules ?? []).join('\n')} onChange={(e) => onChange({ ...draft, dontRules: linesToArray(e.target.value) })} />
          </div>
        </div>
      </Card>
    </>
  );
}

export function BrandIdentityTab({ projectId, tenantId }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useCurrentBrandIdentity(projectId, tenantId);
  const saveMutation = useSaveBrandIdentity(projectId, tenantId);
  const generateMutation = useGenerateBrandIdentity(projectId, tenantId);

  const [draft, setDraft] = useState<BrandIdentityInput>(EMPTY_DRAFT);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (data) {
      setDraft(toDraft(data));
      setShowManual(true);
    }
  }, [data]);

  const onSave = async () => {
    try {
      await saveMutation.mutateAsync(draft);
      toast.success(t('marketing.brandIdentity.saved'));
      setShowManual(true);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brandIdentity.saveFailed'));
    }
  };

  const onGenerate = async () => {
    try {
      await generateMutation.mutateAsync();
      toast.success(t('marketing.brandIdentity.generated'));
      setShowManual(true);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brandIdentity.generateFailed'));
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (isError) return <ErrorState title={t('marketing.brandIdentity.errorTitle')} onRetry={() => void refetch()} />;

  if (!data && !showManual) {
    return (
      <EmptyState
        icon={<Palette />}
        title={t('marketing.brandIdentity.emptyTitle')}
        description={t('marketing.brandIdentity.emptyDescription')}
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => void onGenerate()} disabled={generateMutation.isPending}>
              <Sparkles className="size-4" />
              {generateMutation.isPending ? t('common.loading') : t('marketing.brandIdentity.generate')}
            </Button>
            <Button variant="outline" onClick={() => setShowManual(true)}>
              {t('marketing.brandIdentity.createManual')}
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {data ? (
            <>
              <StatusBadge label={`v${data.version}`} tone="info" />
              <span className="typo-body-sm text-muted-foreground">{t('marketing.brandIdentity.currentVersion')}</span>
            </>
          ) : (
            <span className="typo-body-sm text-muted-foreground">{t('marketing.brandIdentity.draftLabel')}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void onGenerate()} disabled={generateMutation.isPending}>
            <Sparkles className="size-4" />
            {generateMutation.isPending ? t('common.loading') : t('marketing.brandIdentity.generate')}
          </Button>
          <Button onClick={() => void onSave()} disabled={saveMutation.isPending}>
            <Save className="size-4" />
            {saveMutation.isPending ? t('common.loading') : t('marketing.brandIdentity.save')}
          </Button>
        </div>
      </div>

      <BrandIdentityForm draft={draft} onChange={setDraft} />
    </div>
  );
}
