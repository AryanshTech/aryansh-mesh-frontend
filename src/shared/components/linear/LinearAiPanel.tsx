import { useState } from 'react';
import { ArrowUp, Sparkles, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { ScrollArea } from '@/design-system/components/ui/scroll-area';
import { LinearProgressBar } from '@/shared/components/linear/LinearProgressBar';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';

type LinearAiPanelProps = {
  projectName?: string;
  className?: string;
};

export function LinearAiPanel({ projectName, className }: LinearAiPanelProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          <span className={cn(typographyClasses.button, 'text-foreground')}>
            {t('linear.ai.engine')}
          </span>
        </div>
        <span className={cn('rounded border border-border bg-muted px-2 py-0.5', typographyClasses.mono, 'text-muted-foreground')}>
          GPT-4.0
        </span>
      </div>

      <ScrollArea className="flex-1 scrollbar-linear">
        <div className="space-y-6 p-4">
          <section>
            <p className={cn(typographyClasses.eyebrowUpper, 'mb-3 text-muted-foreground')}>
              {t('linear.ai.activeContexts')}
            </p>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className={typographyClasses.button}>
                  {projectName ?? t('linear.ai.defaultContext')}
                </p>
                <p className={cn('mt-1', typographyClasses.caption, 'text-muted-foreground')}>
                  {t('linear.ai.synthesizing')}
                </p>
                <LinearProgressBar label="" value={62} className="mt-3" />
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className={typographyClasses.button}>{t('linear.ai.toneAnalysis')}</p>
                <p className={cn('mt-1', typographyClasses.caption, 'text-muted-foreground')}>
                  {t('linear.ai.matchingVoice')}
                </p>
                <LinearProgressBar label="" value={45} className="mt-3" />
              </div>
            </div>
          </section>

          <section>
            <p className={cn(typographyClasses.eyebrowUpper, 'mb-3 text-muted-foreground')}>
              {t('linear.ai.recentThinking')}
            </p>
            <div className="rounded-lg border border-primary/20 bg-card p-4">
              <Sparkles className="mb-2 size-4 text-primary" />
              <p className={cn('italic', typographyClasses.bodySm, 'text-muted-foreground')}>
                {t('linear.ai.thinkingSnippet')}
              </p>
            </div>
          </section>
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('linear.ai.askPlaceholder')}
            className={cn('pr-10', typographyClasses.bodySm)}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-primary"
            aria-label={t('linear.ai.send')}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
