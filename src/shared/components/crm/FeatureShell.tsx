import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent } from '@/design-system/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import { ComingSoonShell } from '@/shared/components/crm/ComingSoonShell';
import { usePermissions } from '@/core/permissions/use-permissions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/design-system/components/ui/tooltip';

interface FeatureListShellProps {
  titleKey: string;
  descriptionKey: string;
  comingSoonKey: string;
  emptyKey: string;
  createPath: string;
  columns: string[];
}

export function FeatureListShell({
  titleKey,
  descriptionKey,
  comingSoonKey,
  emptyKey,
  createPath,
  columns,
}: FeatureListShellProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEdit, isViewer } = usePermissions();

  const createButton = (
    <Button
      disabled={!canEdit}
      onClick={() => canEdit && navigate(createPath)}
    >
      <Plus />
      {t('common.create')}
    </Button>
  );

  return (
    <ComingSoonShell
      titleKey={titleKey}
      descriptionKey={descriptionKey}
      comingSoonKey={comingSoonKey}
      breadcrumbs={[{ label: t(titleKey) }]}
    >
      <div className="flex justify-end">
        {isViewer ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{createButton}</span>
              </TooltipTrigger>
              <TooltipContent>{t('common.readOnly')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          createButton
        )}
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>{t(col)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody />
          </Table>
          <Empty className="border-0 py-8">
            <EmptyHeader>
              <EmptyTitle>{t(emptyKey)}</EmptyTitle>
              <EmptyDescription>{t(comingSoonKey)}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    </ComingSoonShell>
  );
}

interface FeatureFormShellProps {
  titleKey: string;
  comingSoonKey: string;
  children?: ReactNode;
}

export function FeatureFormShell({
  titleKey,
  comingSoonKey,
  children,
}: FeatureFormShellProps) {
  const { t } = useTranslation();

  return (
    <ComingSoonShell
      titleKey={titleKey}
      comingSoonKey={comingSoonKey}
      breadcrumbs={[
        { label: t(titleKey.replace('.form', '.title')), href: '#' },
        { label: t(titleKey) },
      ]}
    >
      {children}
    </ComingSoonShell>
  );
}
