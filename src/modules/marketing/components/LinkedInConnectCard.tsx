import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Link2, Loader2, Unlink } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import {
  useLinkedInOAuthActions,
  useLinkedInOAuthStatus,
} from '@/modules/marketing/api/use-linkedin';

interface Props {
  projectId: string;
  tenantId?: string;
}

export function LinkedInConnectCard({ projectId, tenantId }: Props) {
  const { t } = useTranslation();
  const { data: status, isLoading } = useLinkedInOAuthStatus(projectId, tenantId);
  const { start, disconnect } = useLinkedInOAuthActions(projectId, tenantId);

  const onConnect = async () => {
    try {
      const res = await start.mutateAsync();
      if (!res.authorizationUrl) {
        toast.error(t('marketing.linkedin.oauthNotConfigured'));
        return;
      }
      window.location.href = res.authorizationUrl;
    } catch (e) {
      toast.error((e as Error).message || t('marketing.linkedin.oauthStartFailed'));
    }
  };

  const onDisconnect = async () => {
    try {
      await disconnect.mutateAsync();
      toast.success(t('marketing.linkedin.oauthDisconnected'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.linkedin.oauthDisconnectFailed'));
    }
  };

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <h4 className="typo-card-title text-foreground">{t('marketing.linkedin.connectTitle')}</h4>
      <p className="mt-1 typo-body-sm text-muted-foreground">{t('marketing.linkedin.connectSubtitle')}</p>
      {isLoading ? (
        <p className="mt-3 inline-flex items-center gap-2 typo-body-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {t('common.loading')}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="typo-eyebrow text-muted-foreground">
            {!status?.enabled
              ? t('marketing.linkedin.oauthDisabled')
              : status.connected
                ? t('marketing.linkedin.oauthConnected', { urn: status.memberUrn ?? '—' })
                : t('marketing.linkedin.oauthNotConnected')}
          </span>
          {status?.enabled && !status.connected ? (
            <Button type="button" size="sm" disabled={start.isPending} onClick={() => void onConnect()}>
              {start.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Link2 className="size-3.5" />}
              {t('marketing.linkedin.connect')}
            </Button>
          ) : null}
          {status?.connected ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disconnect.isPending}
              onClick={() => void onDisconnect()}
            >
              <Unlink className="size-3.5" />
              {t('marketing.linkedin.disconnect')}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
