import { Fragment } from 'react';
import type { ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/design-system/components/ui/breadcrumb';
import { typographyClasses, mutedBodySm } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';
import { Link } from 'react-router-dom';

export interface BreadcrumbItemConfig {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  /** Kept for breadcrumbs/context; hidden when hideTitle is true (shell owns h1). */
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemConfig[];
  action?: ReactNode;
  /** Default true — page title renders in ShellHeader only. */
  hideTitle?: boolean;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  hideTitle = true,
}: PageHeaderProps) {
  return (
    <div className="flex w-full max-w-full flex-col gap-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList className="min-w-0 flex-wrap text-xs text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <Fragment key={`${item.label}-${index}`}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      {(title && !hideTitle) || description || action ? (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-1 flex-col gap-1 sm:min-w-0">
            {title && !hideTitle ? (
              <h2 className={cn('truncate', typographyClasses.headline)}>{title}</h2>
            ) : null}
            {description ? (
              <p className={cn('max-w-prose', mutedBodySm)}>{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
