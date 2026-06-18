import type { ReactNode } from 'react';
import { typographyClasses } from '@/design-system/tokens/typography';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className={typographyClasses.pageTitle}>{title}</h1>
        {description && (
          <p className={typographyClasses.pageSubtitle}>{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
