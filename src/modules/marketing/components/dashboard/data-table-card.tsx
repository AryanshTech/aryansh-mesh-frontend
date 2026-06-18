import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/design-system/components/ui/card';
import { typographyClasses } from '@/design-system/tokens/typography';

interface DataTableCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DataTableCard({
  title,
  description,
  children,
}: DataTableCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={typographyClasses.sectionTitle}>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-b-xl border-t">{children}</div>
      </CardContent>
    </Card>
  );
}
