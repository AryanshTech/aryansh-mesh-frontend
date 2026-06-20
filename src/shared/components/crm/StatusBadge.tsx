import { useTranslation } from 'react-i18next';
import { Badge } from '@/design-system/components/ui/badge';
import { cn } from '@/design-system/lib/utils';

export type ContentStatus = 'draft' | 'published' | 'archived' | 'suspended' | string;

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  published: 'default',
  archived: 'secondary',
  suspended: 'destructive',
};

interface StatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  const normalized = status.toLowerCase();
  const variant = STATUS_VARIANT[normalized] ?? 'secondary';
  const labelKey = `common.status.${normalized}`;
  const label = t(labelKey, { defaultValue: status });

  return (
    <Badge variant={variant} className={cn('capitalize', className)}>
      {label}
    </Badge>
  );
}
