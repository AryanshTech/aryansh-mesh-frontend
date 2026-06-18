import type { ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';
import { AppHeader } from './app-header';
import { PageHeader } from './page-header';

interface PageShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  scrollable?: boolean;
}

export function PageShell({
  children,
  title,
  description,
  headerActions,
  scrollable = false,
}: PageShellProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <AppHeader actions={!title ? headerActions : undefined} />
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0',
          scrollable ? 'overflow-y-auto' : 'overflow-hidden'
        )}
      >
        {title && (
          <PageHeader
            title={title}
            description={description}
            actions={headerActions}
          />
        )}
        {children}
      </div>
    </div>
  );
}
