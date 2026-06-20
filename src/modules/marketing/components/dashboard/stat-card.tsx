import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { typographyClasses } from '@/design-system/tokens/typography';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  action?: ReactNode;
}

export function StatCard({ title, value, description, icon: Icon, action }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={typographyClasses.bodySm}>{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="font-tabular text-3xl font-semibold text-foreground">{value}</div>
            {description ? (
              <p className={`mt-1 text-muted-foreground ${typographyClasses.bodySm}`}>{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
