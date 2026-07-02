import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Sparkles,
  Palette,
  Brain,
  Eye,
  FlaskConical,
  CalendarDays,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { Card } from '@/design-system/components/ui/card';
import { cn } from '@/design-system/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentBrandIdentity, useGenerateBrandIdentity } from '@/modules/marketing/api/use-brand-identity';
import { useBrandMemory } from '@/modules/marketing/api/use-brand-memory';
import { useBrandPerceptionPreview, useGenerateBrandPerception } from '@/modules/marketing/api/use-brand-perception';
import { useCreativeRecipes, useCreativeAssets } from '@/modules/marketing/api/use-creative';
import { useSocialPosts } from '@/modules/marketing/api/use-social-posts';
import { useThreads } from '@/modules/marketing/api/use-threads';

interface Props {
  projectId: string;
  tenantId?: string;
  onOpenTab?: (tab: string) => void;
}

interface ContentTypeCard {
  id: string;
  icon: typeof Palette;
  titleKey: string;
  descKey: string;
  savedKey: string;
  emptyKey: string;
  saved: boolean;
  count?: number;
  href?: string;
  tab?: string;
  iconBg: string;
  iconColor: string;
}

export function BrandContentStudio({ projectId, tenantId, onOpenTab }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: identity } = useCurrentBrandIdentity(projectId, tenantId);
  const { data: memory } = useBrandMemory(projectId, tenantId);
  const { data: perception } = useBrandPerceptionPreview(projectId, tenantId);
  const { data: recipes } = useCreativeRecipes(projectId, tenantId);
  const { data: assets } = useCreativeAssets(projectId, tenantId);
  const { data: posts } = useSocialPosts(projectId, tenantId);
  const { data: threads } = useThreads(projectId, tenantId);

  const generateIdentity = useGenerateBrandIdentity(projectId, tenantId);
  const generatePerception = useGenerateBrandPerception(projectId, tenantId);

  const buildingFoundation = generateIdentity.isPending || generatePerception.isPending;

  const cards: ContentTypeCard[] = [
    {
      id: 'identity',
      icon: Palette,
      titleKey: 'marketing.studio.types.identity.title',
      descKey: 'marketing.studio.types.identity.description',
      savedKey: 'marketing.studio.status.saved',
      emptyKey: 'marketing.studio.status.notYet',
      saved: Boolean(identity),
      tab: 'brand-identity',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      id: 'memory',
      icon: Brain,
      titleKey: 'marketing.studio.types.memory.title',
      descKey: 'marketing.studio.types.memory.description',
      savedKey: 'marketing.studio.status.saved',
      emptyKey: 'marketing.studio.status.notYet',
      saved: Boolean(memory?.contentMarkdown?.trim()),
      href: `/marketing/projects/${projectId}/brand-memory`,
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400',
    },
    {
      id: 'perception',
      icon: Eye,
      titleKey: 'marketing.studio.types.perception.title',
      descKey: 'marketing.studio.types.perception.description',
      savedKey: 'marketing.studio.status.saved',
      emptyKey: 'marketing.studio.status.notYet',
      saved: Boolean(perception?.contentMarkdown?.trim()),
      tab: 'brand-perception',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
    },
    {
      id: 'recipes',
      icon: FlaskConical,
      titleKey: 'marketing.studio.types.recipes.title',
      descKey: 'marketing.studio.types.recipes.description',
      savedKey: 'marketing.studio.status.count',
      emptyKey: 'marketing.studio.status.notYet',
      saved: (recipes?.length ?? 0) > 0,
      count: recipes?.length ?? 0,
      tab: 'recipes',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
    },
    {
      id: 'social',
      icon: CalendarDays,
      titleKey: 'marketing.studio.types.social.title',
      descKey: 'marketing.studio.types.social.description',
      savedKey: 'marketing.studio.status.count',
      emptyKey: 'marketing.studio.status.notYet',
      saved: (posts?.items.length ?? 0) > 0,
      count: posts?.items.length ?? 0,
      href: `/marketing/projects/${projectId}/social`,
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-400',
    },
    {
      id: 'assets',
      icon: ImageIcon,
      titleKey: 'marketing.studio.types.assets.title',
      descKey: 'marketing.studio.types.assets.description',
      savedKey: 'marketing.studio.status.count',
      emptyKey: 'marketing.studio.status.notYet',
      saved: (assets?.length ?? 0) > 0,
      count: assets?.length ?? 0,
      tab: 'assets',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'threads',
      icon: MessageSquare,
      titleKey: 'marketing.studio.types.threads.title',
      descKey: 'marketing.studio.types.threads.description',
      savedKey: 'marketing.studio.status.count',
      emptyKey: 'marketing.studio.status.notYet',
      saved: (threads?.items.length ?? 0) > 0,
      count: threads?.items.length ?? 0,
      href: `/marketing/projects/${projectId}`,
      iconBg: 'bg-sky-500/10',
      iconColor: 'text-sky-400',
    },
  ];

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
    } catch (e) {
      toast.error((e as Error).message || t('marketing.studio.foundationFailed'));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2 max-w-xl">
            <p className="typo-eyebrow-upper text-faint">{t('marketing.studio.eyebrow')}</p>
            <h2 className="typo-display-md text-foreground">{t('marketing.studio.title')}</h2>
            <p className="typo-body-sm text-muted-foreground">{t('marketing.studio.subtitle')}</p>
          </div>
          <Button
            onClick={() => void onBuildFoundation()}
            disabled={buildingFoundation}
            className="shrink-0 self-start"
          >
            <Sparkles className="size-4" />
            {buildingFoundation ? t('common.loading') : t('marketing.studio.generateFoundation')}
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-4">
          {(['step1', 'step2', 'step3', 'step4'] as const).map((step) => (
            <p key={step} className="typo-body-sm text-muted-foreground">
              {t(`marketing.studio.pipeline.${step}`)}
            </p>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const statusLabel = card.saved
            ? card.count !== undefined
              ? t(card.savedKey, { count: card.count })
              : t(card.savedKey)
            : t(card.emptyKey);

          const inner = (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className={cn('grid size-9 place-items-center rounded-lg', card.iconBg)}>
                  <Icon className={cn('size-4', card.iconColor)} />
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 typo-eyebrow',
                    card.saved
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {card.saved && <CheckCircle2 className="size-3" />}
                  {statusLabel}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="typo-card-title text-foreground">{t(card.titleKey)}</p>
                <p className="typo-body-sm text-muted-foreground line-clamp-2">{t(card.descKey)}</p>
              </div>
              {card.href || card.tab ? (
                <span className="inline-flex items-center gap-1 typo-body-sm text-primary mt-auto">
                  {t('marketing.studio.open')}
                  <ArrowRight className="size-3.5" />
                </span>
              ) : null}
            </>
          );

          if (card.href) {
            return (
              <Link
                key={card.id}
                to={card.href}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-hairline-strong hover:shadow-card min-h-[148px]"
              >
                {inner}
              </Link>
            );
          }

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onOpenTab?.(card.tab!)}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-hairline-strong hover:shadow-card min-h-[148px] text-left w-full"
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
