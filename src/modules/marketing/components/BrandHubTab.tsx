import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, Eye, Palette } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { BrandIdentityTab } from '@/modules/marketing/components/BrandIdentityTab';
import { BrandVoiceTab } from '@/modules/marketing/components/BrandVoiceTab';
import { BrandPerceptionTab } from '@/modules/marketing/components/BrandPerceptionTab';
import { BrandIngestPanel } from '@/modules/marketing/components/BrandIngestPanel';

interface Props {
  projectId: string;
  tenantId?: string;
  initialSection?: BrandSection;
}

export type BrandSection = 'look' | 'voice' | 'spy';

const SECTIONS: BrandSection[] = ['look', 'voice', 'spy'];

export function BrandHubTab({ projectId, tenantId, initialSection = 'voice' }: Props) {
  const { t } = useTranslation();
  const [section, setSection] = useState<BrandSection>(
    SECTIONS.includes(initialSection) ? initialSection : 'voice',
  );

  useEffect(() => {
    if (initialSection && SECTIONS.includes(initialSection)) {
      setSection(initialSection);
    }
  }, [initialSection]);

  const triggers = useMemo(
    () => [
      {
        value: 'voice' as const,
        icon: Brain,
        label: t('marketing.workspace.brandSections.voice'),
      },
      {
        value: 'look' as const,
        icon: Palette,
        label: t('marketing.workspace.brandSections.look'),
      },
      {
        value: 'spy' as const,
        icon: Eye,
        label: t('marketing.workspace.brandSections.spy'),
      },
    ],
    [t],
  );

  return (
    <div className="flex flex-col gap-5">
      <BrandIngestPanel projectId={projectId} tenantId={tenantId} />

      <div
        className="flex flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1"
        role="tablist"
        aria-label={t('marketing.workspace.tabs.brand')}
      >
        {triggers.map(({ value, icon: Icon, label }) => {
          const active = section === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSection(value)}
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

      {section === 'voice' ? (
        <BrandVoiceTab projectId={projectId} tenantId={tenantId} />
      ) : null}
      {section === 'look' ? (
        <BrandIdentityTab projectId={projectId} tenantId={tenantId} />
      ) : null}
      {section === 'spy' ? (
        <BrandPerceptionTab projectId={projectId} tenantId={tenantId} />
      ) : null}
    </div>
  );
}
