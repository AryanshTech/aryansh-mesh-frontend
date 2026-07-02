import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Sparkles, PenLine } from 'lucide-react';
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
import { FormDialog } from '@/shared/components/FormDialog';
import { cn } from '@/design-system/lib/utils';
import { platformColors } from '@/design-system/tokens/platformColors';
import { useCreateThread } from '@/modules/marketing/api/use-threads';
import {
  buildSocialAiPrompt,
  buildThreadTitle,
  type SocialComposeBrief,
} from '@/modules/marketing/lib/social-content';
import type { SocialPlatform } from '@/modules/marketing/api/use-social-posts';

const QUICK_PLATFORMS: SocialPlatform[] = ['INSTAGRAM', 'LINKEDIN', 'X'];

interface Props {
  projectId: string;
  tenantId?: string;
  className?: string;
}

export function SocialPlatformActions({ projectId, tenantId, className }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createThread = useCreateThread(projectId, tenantId);

  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<SocialPlatform>('INSTAGRAM');
  const [topic, setTopic] = useState('');
  const [brief, setBrief] = useState('');

  const reset = () => {
    setTopic('');
    setBrief('');
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
    return { platform, topic: topic.trim(), brief: brief.trim() || undefined };
  };

  const onDraftManually = () => {
    const input = composeBrief();
    if (!input) return;

    const params = new URLSearchParams({
      compose: '1',
      platform: input.platform,
      topic: input.topic,
    });
    if (input.brief) params.set('brief', input.brief);

    setOpen(false);
    reset();
    void navigate(`/marketing/projects/${projectId}/social?${params.toString()}`);
  };

  const onGenerateWithAi = async () => {
    const input = composeBrief();
    if (!input) return;

    try {
      const thread = await createThread.mutateAsync({
        title: buildThreadTitle(input.platform, input.topic),
      });
      setOpen(false);
      reset();
      void navigate(`/marketing/projects/${projectId}/threads/${thread.id}`, {
        state: { initialPrompt: buildSocialAiPrompt(input) },
      });
    } catch (e) {
      toast.error((e as Error).message || t('marketing.threads.createFailed'));
    }
  };

  return (
    <>
      <div className={cn('flex flex-col gap-2', className)}>
        <p className="typo-eyebrow-upper text-faint">{t('marketing.social.createForPlatform')}</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PLATFORMS.map((p) => {
            const color = platformColors[p];
            return (
              <Button
                key={p}
                type="button"
                variant="outline"
                size="sm"
                style={{ borderColor: `${color}44`, color }}
                onClick={() => openForPlatform(p)}
              >
                {t(`marketing.social.platforms.${p}`)}
              </Button>
            );
          })}
        </div>
      </div>

      <FormDialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('marketing.social.composeTitle', {
                platform: t(`marketing.social.platforms.${platform}`),
              })}
            </DialogTitle>
            <DialogDescription>{t('marketing.social.composeDescription')}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
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
              <Label htmlFor="sp-brief">{t('marketing.social.fieldBrief')}</Label>
              <Textarea
                id="sp-brief"
                rows={3}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={t('marketing.social.briefPlaceholder')}
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
            <Button
              type="button"
              onClick={() => void onGenerateWithAi()}
              disabled={createThread.isPending}
            >
              <Sparkles className="size-4" />
              {createThread.isPending ? t('common.loading') : t('marketing.social.generateWithAi')}
            </Button>
            <Button type="button" variant="outline" onClick={onDraftManually}>
              <PenLine className="size-4" />
              {t('marketing.social.draftManually')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </>
  );
}
