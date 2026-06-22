import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/design-system/components/ui/card';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';

type AuthFormCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthFormCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthFormCardProps) {
  return (
    <Card variant="elevated" className={cn('w-full min-w-0 border-border shadow-whisper', className)}>
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className={layout.auth.title}>{title}</CardTitle>
        {description ? (
          <CardDescription className={layout.auth.subtitle}>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="w-full min-w-0">{children}</CardContent>
      {footer ? <CardFooter className="flex-col gap-2 border-t border-border pt-6">{footer}</CardFooter> : null}
    </Card>
  );
}
