import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/design-system/components/ui/card';
import { Separator } from '@/design-system/components/ui/separator';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="pb-4">
        <CardTitle className={typographyClasses.sectionTitle}>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

interface FormSectionDividerProps {
  className?: string;
}

export function FormSectionDivider({ className }: FormSectionDividerProps) {
  return <Separator className={className} />;
}
