import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Plus, Star, Trash2 } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import { cn } from '@/design-system/lib/utils';
import {
  useDeleteLinkedInPersona,
  useLinkedInPersonas,
  useSaveLinkedInPersona,
  useSetDefaultLinkedInPersona,
  type LinkedInInspirationPost,
  type LinkedInPersona,
} from '@/modules/marketing/api/use-linkedin';

interface Props {
  projectId: string;
  tenantId?: string;
}

type KnowledgeTab = 'voice' | 'rules' | 'inspiration' | 'core';

export function LinkedInTrainPanel({ projectId, tenantId }: Props) {
  const { t } = useTranslation();
  const { data: personas, isLoading } = useLinkedInPersonas(projectId, tenantId);
  const savePersona = useSaveLinkedInPersona(projectId, tenantId);
  const setDefault = useSetDefaultLinkedInPersona(projectId, tenantId);
  const deletePersona = useDeleteLinkedInPersona(projectId, tenantId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<KnowledgeTab>('voice');
  const [name, setName] = useState('');
  const [voiceTone, setVoiceTone] = useState('');
  const [contentRules, setContentRules] = useState('');
  const [coreProfile, setCoreProfile] = useState('');
  const [inspiration, setInspiration] = useState<LinkedInInspirationPost[]>([]);
  const [inspText, setInspText] = useState('');
  const [inspWhy, setInspWhy] = useState('');
  const [inspLikes, setInspLikes] = useState('');

  const selected = useMemo(() => {
    const list = personas ?? [];
    if (!list.length) return null;
    return list.find((p) => p.id === selectedId) ?? list.find((p) => p.isDefault) ?? list[0];
  }, [personas, selectedId]);

  useEffect(() => {
    if (!selected) return;
    setSelectedId(selected.id);
    setName(selected.name ?? '');
    setVoiceTone(selected.voiceTone ?? '');
    setContentRules(selected.contentRules ?? '');
    setCoreProfile(selected.coreProfile ?? '');
    setInspiration(selected.inspirationPosts ?? []);
  }, [selected?.id]);

  const hydrateFrom = (p: LinkedInPersona) => {
    setSelectedId(p.id);
    setName(p.name ?? '');
    setVoiceTone(p.voiceTone ?? '');
    setContentRules(p.contentRules ?? '');
    setCoreProfile(p.coreProfile ?? '');
    setInspiration(p.inspirationPosts ?? []);
  };

  const onSave = async () => {
    if (!name.trim()) {
      toast.error(t('marketing.linkedin.personaNameRequired'));
      return;
    }
    try {
      const saved = await savePersona.mutateAsync({
        personaId: selected?.id,
        body: {
          name: name.trim(),
          voiceTone,
          contentRules,
          coreProfile,
          inspirationPosts: inspiration,
        },
      });
      hydrateFrom(saved);
      toast.success(t('marketing.linkedin.personaSaved'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.linkedin.personaSaveFailed'));
    }
  };

  const onCreate = async () => {
    try {
      const saved = await savePersona.mutateAsync({
        body: {
          name: t('marketing.linkedin.newPersonaName'),
          voiceTone: '',
          contentRules: '',
          coreProfile: '',
          inspirationPosts: [],
        },
      });
      hydrateFrom(saved);
      toast.success(t('marketing.linkedin.personaCreated'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.linkedin.personaSaveFailed'));
    }
  };

  const onAddInspiration = () => {
    if (!inspText.trim()) return;
    setInspiration((prev) => [
      {
        text: inspText.trim(),
        whyItWorks: inspWhy.trim() || null,
        likes: inspLikes.trim() ? Number(inspLikes) : null,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setInspText('');
    setInspWhy('');
    setInspLikes('');
  };

  const tabs: Array<{ id: KnowledgeTab; label: string }> = [
    { id: 'voice', label: t('marketing.linkedin.tabVoice') },
    { id: 'rules', label: t('marketing.linkedin.tabRules') },
    { id: 'inspiration', label: t('marketing.linkedin.tabInspiration') },
    { id: 'core', label: t('marketing.linkedin.tabCore') },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="typo-card-title text-foreground">{t('marketing.linkedin.trainTitle')}</h3>
            <p className="mt-1 typo-body-sm text-muted-foreground">
              {t('marketing.linkedin.trainSubtitle')}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void onCreate()}>
            <Plus className="size-3.5" />
            {t('marketing.linkedin.newPersona')}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(personas ?? []).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => hydrateFrom(p)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 typo-body-sm transition-colors',
                selected?.id === p.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {p.isDefault ? <Star className="size-3.5" /> : null}
              {p.name}
            </button>
          ))}
        </div>
      </section>

      {selected ? (
        <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="persona-name">{t('marketing.linkedin.personaName')}</Label>
            <Input id="persona-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="mt-4 flex flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 typo-body-sm transition-colors',
                  tab === item.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {tab === 'voice' ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="voice">{t('marketing.linkedin.tabVoice')}</Label>
                <Textarea
                  id="voice"
                  rows={10}
                  value={voiceTone}
                  onChange={(e) => setVoiceTone(e.target.value)}
                  placeholder={t('marketing.linkedin.voicePlaceholder')}
                />
              </div>
            ) : null}
            {tab === 'rules' ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rules">{t('marketing.linkedin.tabRules')}</Label>
                <Textarea
                  id="rules"
                  rows={10}
                  value={contentRules}
                  onChange={(e) => setContentRules(e.target.value)}
                  placeholder={t('marketing.linkedin.rulesPlaceholder')}
                />
              </div>
            ) : null}
            {tab === 'core' ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="core">{t('marketing.linkedin.tabCore')}</Label>
                <Textarea
                  id="core"
                  rows={10}
                  value={coreProfile}
                  onChange={(e) => setCoreProfile(e.target.value)}
                  placeholder={t('marketing.linkedin.corePlaceholder')}
                />
              </div>
            ) : null}
            {tab === 'inspiration' ? (
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="insp-text">{t('marketing.linkedin.inspirationPost')}</Label>
                  <Textarea
                    id="insp-text"
                    rows={4}
                    value={inspText}
                    onChange={(e) => setInspText(e.target.value)}
                  />
                  <Label htmlFor="insp-why">{t('marketing.linkedin.inspirationWhy')}</Label>
                  <Input id="insp-why" value={inspWhy} onChange={(e) => setInspWhy(e.target.value)} />
                  <Label htmlFor="insp-likes">{t('marketing.linkedin.inspirationLikes')}</Label>
                  <Input
                    id="insp-likes"
                    type="number"
                    value={inspLikes}
                    onChange={(e) => setInspLikes(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={onAddInspiration}>
                    <Plus className="size-3.5" />
                    {t('marketing.linkedin.addInspiration')}
                  </Button>
                </div>
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {inspiration.length === 0 ? (
                    <li className="px-4 py-3 typo-body-sm text-muted-foreground">
                      {t('marketing.linkedin.inspirationEmpty')}
                    </li>
                  ) : (
                    inspiration.map((item, idx) => (
                      <li key={`${idx}-${item.text.slice(0, 24)}`} className="flex gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-wrap typo-body-sm text-foreground">{item.text}</p>
                          {item.whyItWorks ? (
                            <p className="mt-1 typo-eyebrow text-muted-foreground">{item.whyItWorks}</p>
                          ) : null}
                          {item.likes != null ? (
                            <p className="mt-1 typo-eyebrow text-muted-foreground">
                              {t('marketing.linkedin.likesCount', { count: item.likes })}
                            </p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => setInspiration((prev) => prev.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" disabled={savePersona.isPending} onClick={() => void onSave()}>
              {savePersona.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('common.save')}
            </Button>
            {!selected.isDefault ? (
              <Button
                type="button"
                variant="outline"
                disabled={setDefault.isPending}
                onClick={() =>
                  void setDefault.mutateAsync(selected.id).then(() =>
                    toast.success(t('marketing.linkedin.personaDefaulted')),
                  )
                }
              >
                <Star className="size-3.5" />
                {t('marketing.linkedin.setDefault')}
              </Button>
            ) : null}
            {(personas?.length ?? 0) > 1 ? (
              <Button
                type="button"
                variant="destructive"
                disabled={deletePersona.isPending}
                onClick={() =>
                  void deletePersona.mutateAsync(selected.id).then(() => {
                    setSelectedId(null);
                    toast.success(t('marketing.linkedin.personaDeleted'));
                  })
                }
              >
                <Trash2 className="size-3.5" />
                {t('common.delete')}
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
