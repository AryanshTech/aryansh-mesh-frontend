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
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';
import { Link } from 'react-router-dom';

export interface BreadcrumbItemConfig {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemConfig[];
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList className="min-w-0 flex-wrap">
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
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex flex-col gap-1">
          <h1 className={cn('truncate', typographyClasses.pageTitle)}>{title}</h1>
          {description && (
            <p className={typographyClasses.pageSubtitle}>{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
