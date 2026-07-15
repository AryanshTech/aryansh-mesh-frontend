import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import { cn } from '@/design-system/lib/utils';
import {
  useLinkedInPersonas,
  useLinkedInPipeline,
  type LinkedInDraft,
  type LinkedInProposedRule,
  type LinkedInTopic,
  type LinkedInTopicDevelopment,
} from '@/modules/marketing/api/use-linkedin';
import { useSaveLinkedInPersona } from '@/modules/marketing/api/use-linkedin';
import { LinkedInLearnRulesCard } from '@/modules/marketing/components/LinkedInLearnRulesCard';

interface Props {
  projectId: string;
  tenantId?: string;
  onApplyDrafts: (captions: string[]) => void;
}

type Stage = 'seed' | 'topics' | 'hooks' | 'drafts';

export function LinkedInPipelinePanel({ projectId, tenantId, onApplyDrafts }: Props) {
  const { t } = useTranslation();
  const { data: personas } = useLinkedInPersonas(projectId, tenantId);
  const pipeline = useLinkedInPipeline(projectId, tenantId);
  const savePersona = useSaveLinkedInPersona(projectId, tenantId);

  const defaultPersona = useMemo(
    () => personas?.find((p) => p.isDefault) ?? personas?.[0] ?? null,
    [personas],
  );

  const [personaId, setPersonaId] = useState<string | undefined>();
  const activePersonaId = personaId ?? defaultPersona?.id;
  const activePersona = personas?.find((p) => p.id === activePersonaId) ?? defaultPersona;

  const [stage, setStage] = useState<Stage>('seed');
  const [seedText, setSeedText] = useState('');
  const [runId, setRunId] = useState<string | undefined>();
  const [topics, setTopics] = useState<LinkedInTopic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [researchWarning, setResearchWarning] = useState<string | null>(null);
  const [developments, setDevelopments] = useState<LinkedInTopicDevelopment[]>([]);
  const [selectedHooks, setSelectedHooks] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<LinkedInDraft[]>([]);
  const [proposedRules, setProposedRules] = useState<LinkedInProposedRule[]>([]);
  const [originalForLearn, setOriginalForLearn] = useState('');

  const busy =
    pipeline.discover.isPending ||
    pipeline.develop.isPending ||
    pipeline.write.isPending ||
    pipeline.proposeRules.isPending;

  const onDiscover = async () => {
    if (!activePersonaId) {
      toast.error(t('marketing.linkedin.needPersona'));
      return;
    }
    try {
      const seeds = seedText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await pipeline.discover.mutateAsync({
        personaId: activePersonaId,
        seedIdeas: seeds,
        runId,
      });
      setRunId(res.runId);
      setTopics(res.topics ?? []);
      setSelectedTopicIds((res.topics ?? []).slice(0, 3).map((tpc) => tpc.id));
      setResearchWarning(res.researchWarning ?? null);
      setStage('topics');
    } catch (e) {
      toast.error((e as Error).message || t('marketing.linkedin.pipelineFailed'));
    }
  };

  const onDevelop = async () => {
    const picked = topics.filter((tpc) => selectedTopicIds.includes(tpc.id));
    if (!picked.length || !activePersonaId) return;
    try {
      const res = await pipeline.develop.mutateAsync({
        personaId: activePersonaId,
        runId,
        topics: picked.map((tpc) => ({
          id: tpc.id,
          title: tpc.title,
          angle: tpc.angle ?? undefined,
        })),
      });
      setRunId(res.runId);
      setDevelopments(res.developments ?? []);
      const hooks: Record<string, string> = {};
      for (const d of res.developments ?? []) {
        if (d.hooks?.[0]) hooks[d.topicId] = d.hooks[0].id;
      }
      setSelectedHooks(hooks);
      setStage('hooks');
    } catch (e) {
      toast.error((e as Error).message || t('marketing.linkedin.pipelineFailed'));
    }
  };

  const onWrite = async () => {
    if (!activePersonaId) return;
    const selections = developments
      .map((d) => {
        const hookId = selectedHooks[d.topicId];
        const hook = d.hooks.find((h) => h.id === hookId) ?? d.hooks[0];
        if (!hook) return null;
        const topic = topics.find((tpc) => tpc.id === d.topicId);
        return {
          topicId: d.topicId,
          topicTitle: d.title,
          angle: topic?.angle ?? undefined,
          hookId: hook.id,
          hookText: hook.text,
        };
      })
      .filter(Boolean) as Array<{
      topicId: string;
      topicTitle: string;
      angle?: string;
      hookId: string;
      hookText: string;
    }>;
    if (!selections.length) return;
    try {
      const res = await pipeline.write.mutateAsync({
        personaId: activePersonaId,
        runId,
        selections,
      });
      setRunId(res.runId);
      setDrafts(res.drafts ?? []);
      setOriginalForLearn((res.drafts ?? []).map((d) => d.caption).join('\n\n---\n\n'));
      setStage('drafts');
    } catch (e) {
      toast.error((e as Error).message || t('marketing.linkedin.pipelineFailed'));
    }
  };

  const onApply = () => {
    const captions = drafts.map((d) => d.caption).filter(Boolean);
    if (!captions.length) return;
    onApplyDrafts(captions);
    toast.success(t('marketing.linkedin.draftsApplied'));
  };

  const onProposeRules = async (editedText: string) => {
    if (!activePersonaId || !originalForLearn.trim()) return;
    try {
      const res = await pipeline.proposeRules.mutateAsync({
        personaId: activePersonaId,
        originalText: originalForLearn,
        editedText,
      });
      setProposedRules(res.rules ?? []);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.linkedin.rulesProposeFailed'));
    }
  };

  const onSaveRules = async (rules: LinkedInProposedRule[]) => {
    if (!activePersona) return;
    const enabled = rules.filter((r) => r.enabled).map((r) => `- ${r.rule}`);
    if (!enabled.length) return;
    const nextRules = [activePersona.contentRules?.trim(), ...enabled].filter(Boolean).join('\n');
    try {
      await savePersona.mutateAsync({
        personaId: activePersona.id,
        body: {
          name: activePersona.name,
          voiceTone: activePersona.voiceTone ?? '',
          coreProfile: activePersona.coreProfile ?? '',
          contentRules: nextRules,
          inspirationPosts: activePersona.inspirationPosts ?? [],
        },
      });
      toast.success(t('marketing.linkedin.rulesSaved'));
      setProposedRules([]);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.linkedin.rulesSaveFailed'));
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="typo-card-title text-foreground">{t('marketing.linkedin.pipelineTitle')}</h3>
          <p className="mt-1 typo-body-sm text-muted-foreground">
            {t('marketing.linkedin.pipelineSubtitle')}
          </p>
        </div>
        {(personas?.length ?? 0) > 0 ? (
          <select
            className="rounded-lg border border-border bg-background px-3 py-2 typo-body-sm"
            value={activePersonaId ?? ''}
            onChange={(e) => setPersonaId(e.target.value)}
          >
            {(personas ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.isDefault ? ` (${t('marketing.linkedin.defaultBadge')})` : ''}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <ol className="flex flex-wrap gap-2">
        {(['seed', 'topics', 'hooks', 'drafts'] as Stage[]).map((s, i) => (
          <li
            key={s}
            className={cn(
              'rounded-full px-2.5 py-1 typo-eyebrow',
              stage === s ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
            )}
          >
            {i + 1}. {t(`marketing.linkedin.stage.${s}`)}
          </li>
        ))}
      </ol>

      {stage === 'seed' ? (
        <div className="flex flex-col gap-3">
          <Label htmlFor="seed">{t('marketing.linkedin.seedLabel')}</Label>
          <Textarea
            id="seed"
            rows={4}
            value={seedText}
            onChange={(e) => setSeedText(e.target.value)}
            placeholder={t('marketing.linkedin.seedPlaceholder')}
          />
          <p className="typo-eyebrow text-muted-foreground">{t('marketing.linkedin.seedHint')}</p>
          <Button type="button" disabled={busy} onClick={() => void onDiscover()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {t('marketing.linkedin.startDiscover')}
          </Button>
        </div>
      ) : null}

      {stage === 'topics' ? (
        <div className="flex flex-col gap-3">
          {researchWarning ? (
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 typo-body-sm text-muted-foreground">
              {researchWarning}
            </p>
          ) : null}
          <ul className="divide-y divide-border rounded-xl border border-border">
            {topics.map((tpc) => {
              const checked = selectedTopicIds.includes(tpc.id);
              return (
                <li key={tpc.id}>
                  <label className="flex cursor-pointer gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedTopicIds((prev) =>
                          checked ? prev.filter((id) => id !== tpc.id) : [...prev, tpc.id],
                        )
                      }
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block typo-body-sm font-medium text-foreground">{tpc.title}</span>
                      {tpc.angle ? (
                        <span className="mt-0.5 block typo-eyebrow text-muted-foreground">{tpc.angle}</span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setStage('seed')}>
              {t('common.back')}
            </Button>
            <Button
              type="button"
              disabled={busy || !selectedTopicIds.length}
              onClick={() => void onDevelop()}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {t('marketing.linkedin.continueHooks')}
            </Button>
          </div>
        </div>
      ) : null}

      {stage === 'hooks' ? (
        <div className="flex flex-col gap-4">
          {developments.map((d) => (
            <div key={d.topicId} className="rounded-xl border border-border p-3">
              <p className="typo-body-sm font-medium text-foreground">{d.title}</p>
              {d.deepNotes ? (
                <p className="mt-1 typo-eyebrow text-muted-foreground whitespace-pre-wrap">{d.deepNotes}</p>
              ) : null}
              <div className="mt-3 flex flex-col gap-2">
                {d.hooks.map((h) => (
                  <label
                    key={h.id}
                    className={cn(
                      'flex cursor-pointer gap-2 rounded-lg border px-3 py-2 typo-body-sm',
                      selectedHooks[d.topicId] === h.id
                        ? 'border-foreground'
                        : 'border-border text-muted-foreground',
                    )}
                  >
                    <input
                      type="radio"
                      name={`hook-${d.topicId}`}
                      checked={selectedHooks[d.topicId] === h.id}
                      onChange={() =>
                        setSelectedHooks((prev) => ({ ...prev, [d.topicId]: h.id }))
                      }
                    />
                    <span>{h.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setStage('topics')}>
              {t('common.back')}
            </Button>
            <Button type="button" disabled={busy} onClick={() => void onWrite()}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {t('marketing.linkedin.writeDrafts')}
            </Button>
          </div>
        </div>
      ) : null}

      {stage === 'drafts' ? (
        <div className="flex flex-col gap-3">
          {drafts.map((d) => (
            <div key={d.id} className="rounded-xl border border-border p-3">
              <p className="typo-eyebrow text-muted-foreground">{d.topicTitle}</p>
              <Textarea
                className="mt-2"
                rows={8}
                value={d.caption}
                onChange={(e) =>
                  setDrafts((prev) =>
                    prev.map((item) =>
                      item.id === d.id ? { ...item, caption: e.target.value } : item,
                    ),
                  )
                }
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setStage('hooks')}>
              {t('common.back')}
            </Button>
            <Button type="button" onClick={onApply}>
              {t('marketing.linkedin.applyToDesk')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void onProposeRules(drafts.map((d) => d.caption).join('\n\n---\n\n'))
              }
            >
              {t('marketing.linkedin.learnFromEdits')}
            </Button>
          </div>
          {proposedRules.length ? (
            <LinkedInLearnRulesCard
              rules={proposedRules}
              onChange={setProposedRules}
              onSave={() => void onSaveRules(proposedRules)}
              saving={savePersona.isPending}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
