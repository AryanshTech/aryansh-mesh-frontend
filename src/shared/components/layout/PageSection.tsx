import type { ReactNode } from 'react';
import { Badge } from '@/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/design-system/components/ui/card';
import { cn } from '@/design-system/lib/utils';

type PageSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PageSection({
  eyebrow,
  title,
  description,
  children,
  className,
  contentClassName,
}: PageSectionProps) {
  return (
    <Card variant="elevated" className={cn('rounded-lg', className)}>
      <CardHeader>
        {eyebrow ? <Badge variant="eyebrow">{eyebrow}</Badge> : null}
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
