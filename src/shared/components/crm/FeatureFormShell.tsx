import type { ReactNode } from 'react';
import { Card, CardContent } from '@/design-system/components/ui/card';
import { cn } from '@/design-system/lib/utils';

interface FeatureFormShellProps {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function FeatureFormShell({ children, footer, className }: FeatureFormShellProps) {
  return (
    <div className={cn('flex w-full min-w-0 flex-col gap-4', className)}>
      <Card className="w-full min-w-0">
        <CardContent>{children}</CardContent>
      </Card>
      {footer ? (
        <div className="flex flex-wrap items-center justify-end gap-2">{footer}</div>
      ) : null}
    </div>
  );
}
