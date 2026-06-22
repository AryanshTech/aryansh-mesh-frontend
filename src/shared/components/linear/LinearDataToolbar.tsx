import type { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs';
import { cn } from '@/design-system/lib/utils';
import { typographyClasses } from '@/design-system/tokens/typography';

type TabItem = {
  id: string;
  label: string;
};

type LinearDataToolbarProps = {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  trailing?: ReactNode;
  className?: string;
};

export function LinearDataToolbar({
  tabs,
  activeTab,
  onTabChange,
  trailing,
  className,
}: LinearDataToolbarProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 border-b border-border px-5 py-3', className)}>
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="h-auto gap-1 bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn('rounded-md border border-transparent px-3 py-1', typographyClasses.button, 'data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground')}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {trailing}
    </div>
  );
}
