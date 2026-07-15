import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Copy, FileUp, Globe, Info, Loader2, Undo2 } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import { FormDialog } from '@/shared/components/FormDialog';
import {
  useBrandMemory,
  useSaveBrandMemory,
  useSetCurrentBrandMemory,
} from '@/modules/marketing/api/use-brand-memory';
import {
  useSaveBrandIdentity,
  type BrandIdentityInput,
} from '@/modules/marketing/api/use-brand-identity';
import { useCreateThread } from '@/modules/marketing/api/use-threads';
import { syncThreadChat } from '@/modules/marketing/api/stream-thread-chat';
import { BRAND_KIT_MD_PROMPT } from '@/modules/marketing/lib/brand-kit-prompt';
import { mergePreservingPlatformProfiles } from '@/modules/marketing/lib/platform-profile';

interface Props {
  projectId: string;
  tenantId?: string;
}

function parseIdentityJson(text: string): BrandIdentityInput | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const raw = JSON.parse(match[0]) as Record<string, unknown>;
    return {
      colors: (raw.colors as BrandIdentityInput['colors']) ?? {},
      typography: (raw.typography as BrandIdentityInput['typography']) ?? {},
      visualStyle: String(raw.visualStyle ?? ''),
      motionStyle: String(raw.motionStyle ?? ''),
      voiceTone: String(raw.voiceTone ?? ''),
      mission: String(raw.mission ?? ''),
      vision: String(raw.vision ?? ''),
      values: Array.isArray(raw.values) ? raw.values.map(String) : [],
      audience: String(raw.audience ?? ''),
      contentPillars: Array.isArray(raw.contentPillars)
        ? raw.contentPillars.map(String)
        : [],
      doRules: Array.isArray(raw.doRules) ? raw.doRules.map(String) : [],
      dontRules: Array.isArray(raw.dontRules) ? raw.dontRules.map(String) : [],
      sourceMarkdown: String(raw.sourceMarkdown ?? ''),
    };
  } catch {
    return null;
  }
}

const IDENTITY_SCHEMA = `Return ONLY valid JSON with keys:
colors: { primary, secondary, accent, background, surface, text, mutedText } (hex where possible),
typography: { heading, body, caption, rules },
visualStyle, motionStyle, voiceTone, mission, vision,
values: string[], audience, contentPillars: string[],
doRules: string[], dontRules: string[], sourceMarkdown: string`;

export function BrandIngestPanel({ projectId, tenantId }: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [busy, setBusy] = useState<'md' | 'web' | 'revert' | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [revertMemoryId, setRevertMemoryId] = useState<string | null>(null);
  const [revertVersion, setRevertVersion] = useState<number | null>(null);

  const { data: currentMemory } = useBrandMemory(projectId, tenantId);
  const saveMemory = useSaveBrandMemory(projectId, tenantId);
  const setCurrentMemory = useSetCurrentBrandMemory(projectId, tenantId);
  const saveIdentity = useSaveBrandIdentity(projectId, tenantId);
  const createThread = useCreateThread(projectId, tenantId);

  const runVertex = async (prompt: string, title: string) => {
    if (!tenantId) throw new Error(t('marketing.desk.tenantRequired'));
    const thread = await createThread.mutateAsync({ title });
    const result = await syncThreadChat(thread.id, { content: prompt }, tenantId);
    return result.content?.trim() ?? '';
  };

  const onCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(BRAND_KIT_MD_PROMPT);
      toast.success(t('marketing.brand.kitPromptCopied'));
    } catch {
      toast.error(t('marketing.desk.copyFailed'));
    }
  };

  const offerRevert = (previousId: string | undefined, previousVersion: number | undefined) => {
    if (!previousId) {
      setRevertMemoryId(null);
      setRevertVersion(null);
      return;
    }
    setRevertMemoryId(previousId);
    setRevertVersion(previousVersion ?? null);
    toast.success(t('marketing.brand.ingestMdDone'), {
      description: t('marketing.brand.ingestKeepProfiles'),
      action: {
        label: t('marketing.brand.ingestRevert'),
        onClick: () => {
          void onRevert(previousId);
        },
      },
      duration: 12000,
    });
  };

  const onRevert = async (memoryId?: string) => {
    const id = memoryId ?? revertMemoryId;
    if (!id) return;
    setBusy('revert');
    try {
      await setCurrentMemory.mutateAsync(id);
      setRevertMemoryId(null);
      setRevertVersion(null);
      toast.success(t('marketing.brand.ingestReverted'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brand.ingestRevertFailed'));
    } finally {
      setBusy(null);
    }
  };

  const onImportMd = async (file: File) => {
    setBusy('md');
    try {
      const text = await file.text();
      if (!text.trim()) {
        toast.error(t('marketing.brand.ingestEmptyFile'));
        return;
      }
      const previousId = currentMemory?.id;
      const previousVersion = currentMemory?.version;
      const merged = mergePreservingPlatformProfiles(
        text,
        currentMemory?.contentMarkdown ?? '',
      );
      await saveMemory.mutateAsync(merged);
      const prompt = [
        'Extract a structured brand identity from this markdown brand kit / memory.',
        IDENTITY_SCHEMA,
        '',
        'Markdown:',
        merged.slice(0, 12000),
      ].join('\n');
      const reply = await runVertex(prompt, t('marketing.brand.ingestMdTitle'));
      const parsed = parseIdentityJson(reply);
      if (!parsed) {
        toast.success(t('marketing.brand.ingestMdMemoryOnly'), {
          description: t('marketing.brand.ingestKeepProfiles'),
          action: previousId
            ? {
                label: t('marketing.brand.ingestRevert'),
                onClick: () => {
                  void onRevert(previousId);
                },
              }
            : undefined,
          duration: 12000,
        });
        if (previousId) {
          setRevertMemoryId(previousId);
          setRevertVersion(previousVersion ?? null);
        }
        return;
      }
      parsed.sourceMarkdown = merged.slice(0, 8000);
      await saveIdentity.mutateAsync(parsed);
      offerRevert(previousId, previousVersion);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brand.ingestFailed'));
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onIngestWebsite = async () => {
    const url = websiteUrl.trim();
    if (!url) {
      toast.error(t('marketing.brand.ingestUrlRequired'));
      return;
    }
    setBusy('web');
    try {
      const previousId = currentMemory?.id;
      const previousVersion = currentMemory?.version;
      const prompt = [
        'You are a brand designer. Infer visual + verbal brand identity from this website / landing page.',
        `Website URL: ${url}`,
        'Use what you know about the site’s UI: colors, typography feel, tone, audience, mission.',
        'If unsure, propose a coherent premium kit grounded in the URL domain/name.',
        IDENTITY_SCHEMA,
      ].join('\n');
      const reply = await runVertex(prompt, t('marketing.brand.ingestWebTitle'));
      const parsed = parseIdentityJson(reply);
      if (!parsed) {
        toast.error(t('marketing.brand.ingestParseFailed'));
        return;
      }
      parsed.sourceMarkdown = `Ingested from website: ${url}\n\n${reply.slice(0, 4000)}`;
      await saveIdentity.mutateAsync(parsed);
      const memoryNote = [
        '## Website ingest',
        '',
        `_Source: ${url}_`,
        '',
        parsed.mission || '',
        '',
        parsed.visualStyle || '',
      ].join('\n');
      const existing = currentMemory?.contentMarkdown?.trim() ?? '';
      const toSave = existing ? `${existing}\n\n${memoryNote}` : memoryNote;
      await saveMemory.mutateAsync(toSave);
      offerRevert(previousId, previousVersion);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.brand.ingestFailed'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <p className="typo-eyebrow-upper text-faint">{t('marketing.brand.ingestEyebrow')}</p>
      <h3 className="mt-1 typo-card-title text-foreground">{t('marketing.brand.ingestTitle')}</h3>
      <p className="mt-1 max-w-2xl typo-body-sm text-muted-foreground">
        {t('marketing.brand.ingestSubtitle')}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-center gap-1.5">
            <Label>{t('marketing.brand.ingestMdLabel')}</Label>
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t('marketing.brand.kitPromptAria')}
              title={t('marketing.brand.kitPromptAria')}
              onClick={() => setPromptOpen(true)}
            >
              <Info className="size-4" />
            </button>
          </div>
          <p className="typo-eyebrow text-muted-foreground">{t('marketing.brand.ingestMdHint')}</p>
          <input
            ref={fileRef}
            type="file"
            accept=".md,text/markdown,text/plain"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onImportMd(file);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => fileRef.current?.click()}
            >
              {busy === 'md' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileUp className="size-4" />
              )}
              {busy === 'md' ? t('common.loading') : t('marketing.brand.ingestMdButton')}
            </Button>
            {revertMemoryId ? (
              <Button
                type="button"
                variant="secondary"
                disabled={busy !== null}
                onClick={() => void onRevert()}
              >
                {busy === 'revert' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Undo2 className="size-4" />
                )}
                {revertVersion != null
                  ? t('marketing.brand.ingestRevertTo', { version: revertVersion })
                  : t('marketing.brand.ingestRevert')}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <Label htmlFor="brand-web-url">{t('marketing.brand.ingestWebLabel')}</Label>
          <p className="typo-eyebrow text-muted-foreground">{t('marketing.brand.ingestWebHint')}</p>
          <Input
            id="brand-web-url"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://…"
            disabled={busy !== null}
          />
          <Button
            type="button"
            disabled={busy !== null}
            onClick={() => void onIngestWebsite()}
          >
            {busy === 'web' ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
            {busy === 'web' ? t('common.loading') : t('marketing.brand.ingestWebButton')}
          </Button>
        </div>
      </div>

      <FormDialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle>{t('marketing.brand.kitPromptTitle')}</DialogTitle>
            <DialogDescription>{t('marketing.brand.kitPromptDescription')}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <pre className="whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/30 p-4 typo-body-sm text-foreground">
              {BRAND_KIT_MD_PROMPT}
            </pre>
          </div>
          <DialogFooter className="shrink-0 border-t border-border px-6 py-4 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setPromptOpen(false)}>
              {t('common.close')}
            </Button>
            <Button type="button" onClick={() => void onCopyPrompt()}>
              <Copy className="size-4" />
              {t('marketing.brand.kitPromptCopy')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </section>
  );
}
