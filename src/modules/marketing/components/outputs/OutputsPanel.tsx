import { useState } from 'react';
import { CopyIcon, Trash2Icon } from 'lucide-react';
import type { OutputResponse, OutputType } from '@/modules/marketing/types/api';
import { formatDate, t } from '@/core/i18n';
import { Badge, type BadgeProps } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Checkbox } from '@/design-system/components/ui/checkbox';
import { ScrollArea } from '@/design-system/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/design-system/components/ui/card';
import { toast } from 'sonner';

type FilterType = OutputType | 'ALL';

interface OutputsPanelProps {
  outputs: OutputResponse[];
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  selectedIds: Set<string>;
  onToggleSelect: (outputId: string) => void;
  onInsertLabel: (label: string) => void;
  onDelete: (outputId: string) => void;
  onExport: (format: 'CSV' | 'XLSX') => void;
  canWrite: boolean;
}

function outputTypeLabel(type: OutputType): string {
  return t(`outputTypes.${type}`);
}

function outputTypeBadgeVariant(type: OutputType): NonNullable<BadgeProps['variant']> {
  switch (type) {
    case 'GI':
      return 'outputGi';
    case 'SP':
      return 'outputSp';
    case 'LP':
      return 'outputLp';
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function OutputList({
  outputs,
  selectedIds,
  onToggleSelect,
  onInsertLabel,
  onDelete,
  canWrite,
}: Omit<OutputsPanelProps, 'filter' | 'onFilterChange' | 'onExport'>) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (outputs.length === 0) {
    return (
      <Empty className="py-8">
        <EmptyHeader>
          <EmptyTitle>{t('workspace.outputsLibrary')}</EmptyTitle>
          <EmptyDescription>{t('workspace.noOutputs')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {outputs.map((output) => (
        <Card key={output.outputId} className="py-3">
          <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 py-0">
            <div className="flex min-w-0 items-center gap-2">
              <Checkbox
                checked={selectedIds.has(output.outputId)}
                onCheckedChange={() => onToggleSelect(output.outputId)}
              />
              <Button
                type="button"
                variant="link"
                className="h-auto truncate p-0 text-sm font-mono text-primary"
                onClick={() => onInsertLabel(output.label)}
              >
                {output.label}
              </Button>
              <Badge
                variant={outputTypeBadgeVariant(output.type)}
                className="text-xs uppercase tracking-wider"
              >
                {outputTypeLabel(output.type)}
              </Badge>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setExpandedId(
                    expandedId === output.outputId ? null : output.outputId
                  )
                }
              >
                {expandedId === output.outputId ? '−' : '+'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await navigator.clipboard.writeText(output.content);
                  toast.success(t('workspace.copied'));
                }}
              >
                <CopyIcon />
              </Button>
              {canWrite && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(output.outputId)}
                >
                  <Trash2Icon />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 pt-2">
            <p className="text-xs text-muted-foreground">
              {formatDate(output.createdAt)}
            </p>
            {expandedId === output.outputId && (
              <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
                {output.content}
              </pre>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function OutputsPanel({
  outputs,
  filter,
  onFilterChange,
  selectedIds,
  onToggleSelect,
  onInsertLabel,
  onDelete,
  onExport,
  canWrite,
}: OutputsPanelProps) {
  const tabs: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: t('workspace.all') },
    { key: 'GI', label: t('outputTypes.GI') },
    { key: 'SP', label: t('outputTypes.SP') },
    { key: 'LP', label: t('outputTypes.LP') },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold">{t('workspace.outputsLibrary')}</h2>
      </div>

      <Tabs
        value={filter}
        onValueChange={(v) => onFilterChange(v as FilterType)}
        className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden"
      >
        <TabsList className="mx-4 mt-3 w-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          value={filter}
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4"
        >
          <ScrollArea className="min-h-0 flex-1">
            <OutputList
              outputs={outputs}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onInsertLabel={onInsertLabel}
              onDelete={onDelete}
              canWrite={canWrite}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="flex shrink-0 gap-2 border-t p-4">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onExport('XLSX')}
        >
          {t('workspace.exportXlsx')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onExport('CSV')}
        >
          {t('workspace.exportCsv')}
        </Button>
      </div>
    </div>
  );
}
