import { useEffect, useState } from 'react';
import { ShieldIcon, UsersIcon } from 'lucide-react';
import { platformTeamApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { LinearPageHeader, LinearStatCard } from '@/shared/components/linear';
import { formatDateTime, t } from '@/core/i18n';
import { Badge } from '@/design-system/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';

type PlatformTeamMember = {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  active: boolean;
};

export function AdminUsersPage() {
  const { getToken } = useAuth();
  const [members, setMembers] = useState<PlatformTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetchWithRetry(
        (token) => platformTeamApi.list(token),
        getToken
      );
      setMembers(res.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [getToken]);

  return (
    <CrmPageShell mode="constrained">
      <LinearPageHeader
        title={t('nav.marketingUsers')}
        description={t('admin.subtitle')}
      />
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <LinearStatCard
              label={t('admin.stats.team')}
              value={String(members.length)}
              icon={UsersIcon}
            />
            <LinearStatCard
              label={t('admin.stats.admins')}
              value={String(members.filter((m) => m.active).length)}
              icon={ShieldIcon}
            />
          </div>
          <Card className="overflow-hidden">
            <CardHeader dense className="border-b border-border">
              <CardTitle className={cn(typographyClasses.cardTitle, 'text-foreground')}>
                {t('admin.table.title')}
              </CardTitle>
            </CardHeader>
            <CardContent dense className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={typographyClasses.eyebrowUpper}>{t('admin.table.email')}</TableHead>
                  <TableHead className={typographyClasses.eyebrowUpper}>{t('admin.table.name')}</TableHead>
                  <TableHead className={typographyClasses.eyebrowUpper}>{t('admin.table.role')}</TableHead>
                  <TableHead className={typographyClasses.eyebrowUpper}>{t('admin.table.joined')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.uid}>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.displayName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">platform_team</Badge>
                    </TableCell>
                    <TableCell className="font-tabular">{formatDateTime(member.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </CardContent>
          </Card>
        </>
      )}
    </CrmPageShell>
  );
}
