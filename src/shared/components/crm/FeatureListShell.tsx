import type { ReactNode } from 'react';
import { Card, CardContent } from '@/design-system/components/ui/card';
import { cn } from '@/design-system/lib/utils';

interface FeatureListShellProps {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function FeatureListShell({ children, footer, className }: FeatureListShellProps) {
  return (
    <Card className={cn('w-full min-w-0 overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="w-full min-w-0 overflow-x-auto">{children}</div>
        {footer ? <div className="border-t p-4">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
