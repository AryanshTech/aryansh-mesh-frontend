import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/design-system/components/ui/card';
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
    <Card variant="elevated" className={cn('w-full rounded-lg border-border shadow-whisper', className)}>
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-3xl font-semibold text-foreground">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-muted-foreground">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? <CardFooter className="flex-col gap-2 border-t border-border pt-6">{footer}</CardFooter> : null}
    </Card>
  );
}
