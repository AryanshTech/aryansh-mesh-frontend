import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FlaskConical, PenLine, Play, UserRound } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { cn } from '@/design-system/lib/utils';
import { platformColors } from '@/design-system/tokens/platformColors';
import {
  useCreativeRecipes,
  useCreateCreativeRun,
  type CreativeRecipe,
} from '@/modules/marketing/api/use-creative';
import { PlatformProfilePanel } from '@/modules/marketing/components/PlatformProfilePanel';
import { MarketingDeskTab } from '@/modules/marketing/components/MarketingDeskTab';
import type { ProfilePlatform } from '@/modules/marketing/lib/platform-profile';
import { displayRecipeTitle } from '@/modules/marketing/lib/social-content';

interface Props {
  projectId: string;
  tenantId?: string;
  platform: ProfilePlatform;
  initialRunId?: string;
  autoGenerate?: boolean;
  onRunSelected?: (runId: string) => void;
  onStartRecipeRun?: (runId: string) => void;
  onClearAutoGenerate?: () => void;
  onOpenBrand?: () => void;
  onOpenCalendar?: (platform?: string) => void;
}

type HubSection = 'profile' | 'create' | 'recipes';

function channelMatches(recipe: CreativeRecipe, platform: ProfilePlatform): boolean {
  const c = recipe.channel.trim().toLowerCase();
  if (platform === 'LINKEDIN') return c.includes('linkedin');
  if (platform === 'INSTAGRAM') return c.includes('instagram');
  if (platform === 'X') return c === 'x' || c.includes('twitter');
  return false;
}

export function SocialHubTab({
  projectId,
  tenantId,
  platform,
  initialRunId,
  autoGenerate,
  onRunSelected,
  onStartRecipeRun,
  onClearAutoGenerate,
  onOpenBrand,
  onOpenCalendar,
}: Props) {
  const { t } = useTranslation();
  const { data: recipesData } = useCreativeRecipes(projectId, tenantId);
  const createRun = useCreateCreativeRun(projectId, tenantId);
  const [section, setSection] = useState<HubSection>(
    initialRunId || autoGenerate ? 'create' : 'profile',
  );

  // Keep Create open when a run is selected / generating — don't bounce to Profile.
  useEffect(() => {
    if (initialRunId || autoGenerate) setSection('create');
  }, [initialRunId, autoGenerate]);

  const recipes = useMemo(
    () => (recipesData ?? []).filter((r) => channelMatches(r, platform)),
    [recipesData, platform],
  );

  const accent = platformColors[platform];

  const onStartRecipe = async (recipe: CreativeRecipe) => {
    try {
      const run = await createRun.mutateAsync({ recipeId: recipe.id });
      toast.success(t('marketing.desk.jobCreated'));
      setSection('create');
      onStartRecipeRun?.(run.id);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.desk.jobCreateFailed'));
    }
  };

  const sections: Array<{ id: HubSection; icon: typeof UserRound; label: string }> = [
    { id: 'profile', icon: UserRound, label: t('marketing.socialHub.sectionProfile') },
    { id: 'create', icon: PenLine, label: t('marketing.socialHub.sectionCreate') },
    { id: 'recipes', icon: FlaskConical, label: t('marketing.socialHub.sectionRecipes') },
  ];

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 typo-eyebrow text-white"
            style={{ backgroundColor: accent }}
          >
            {t(`marketing.social.platforms.${platform}`)}
          </span>
        </div>
        <h2 className="mt-2 typo-card-title text-foreground text-xl md:text-2xl">
          {t('marketing.socialHub.title', {
            platform: t(`marketing.social.platforms.${platform}`),
          })}
        </h2>
        <p className="mt-1 max-w-2xl typo-body-sm text-muted-foreground">
          {t('marketing.socialHub.subtitle')}
        </p>

        <div
          className="mt-4 flex flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1"
          role="tablist"
        >
          {sections.map(({ id, icon: Icon, label }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSection(id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 typo-body-sm transition-colors',
                  active
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {section === 'profile' ? (
        <PlatformProfilePanel projectId={projectId} tenantId={tenantId} platform={platform} />
      ) : null}

      {section === 'recipes' ? (
        <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <h3 className="typo-card-title text-foreground">{t('marketing.socialHub.recipes')}</h3>
          <p className="mt-1 typo-body-sm text-muted-foreground">
            {t('marketing.socialHub.recipesHint')}
          </p>
          {recipes.length === 0 ? (
            <p className="mt-4 typo-body-sm text-muted-foreground">
              {t('marketing.socialHub.recipesEmpty')}
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
              {recipes.map((recipe) => (
                <li
                  key={recipe.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="typo-body-sm font-medium text-foreground">
                      {displayRecipeTitle(recipe)}
                    </p>
                    {recipe.goal && displayRecipeTitle(recipe) !== recipe.goal ? (
                      <p className="mt-0.5 typo-eyebrow text-muted-foreground line-clamp-2">
                        {recipe.goal}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={createRun.isPending}
                    onClick={() => void onStartRecipe(recipe)}
                  >
                    <Play className="size-3.5" />
                    {t('marketing.socialHub.runRecipe')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {section === 'create' ? (
        <MarketingDeskTab
          projectId={projectId}
          tenantId={tenantId}
          lockedPlatform={platform}
          hideHero
          initialRunId={initialRunId}
          autoGenerate={autoGenerate}
          onRunSelected={onRunSelected}
          onClearAutoGenerate={onClearAutoGenerate}
          onOpenBrand={onOpenBrand}
          onOpenCalendar={onOpenCalendar}
        />
      ) : null}
    </div>
  );
}
