import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState } from '@/shared/components/ErrorState';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Card } from '@/design-system/components/ui/card';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import {
  useBusinessProfile,
  useUpdateBusinessProfile,
  type BusinessProfileInput,
} from '@/modules/business/api/hooks/use-business-profile';

const EMPTY_DRAFT: BusinessProfileInput & { allowedWebsiteOriginsText: string } = {
  legalName: '',
  tagline: '',
  description: '',
  email: '',
  phone: '',
  websiteUrl: '',
  allowedWebsiteOriginsText: '',
};

function parseOrigins(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function BusinessProfilePage() {
  const { t } = useTranslation();
  const { hasTenant } = useTenantPath();
  const { data, isLoading, isError, refetch, isFetching } = useBusinessProfile();
  const updateMutation = useUpdateBusinessProfile();

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const showSkeleton = !hasTenant || isLoading || (isFetching && !data);

  useEffect(() => {
    if (data) {
      setDraft({
        legalName: data.legalName ?? '',
        tagline: data.tagline ?? '',
        description: data.description ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        websiteUrl: data.websiteUrl ?? '',
        allowedWebsiteOriginsText: data.allowedWebsiteOrigins?.join('\n') ?? '',
      });
    }
  }, [data]);

  const onSave = async () => {
    if (!draft.legalName?.trim()) {
      toast.error(t('business.errorNameRequired'));
      return;
    }
    try {
      await updateMutation.mutateAsync({
        legalName: draft.legalName.trim(),
        tagline: draft.tagline?.trim() || undefined,
        description: draft.description?.trim() || undefined,
        email: draft.email?.trim() || undefined,
        phone: draft.phone?.trim() || undefined,
        websiteUrl: draft.websiteUrl?.trim() || undefined,
        allowedWebsiteOrigins: parseOrigins(draft.allowedWebsiteOriginsText),
      });
      toast.success(t('business.updated'));
    } catch (e) {
      toast.error((e as Error).message || t('business.saveFailed'));
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('business.title')}
        description={t('business.subtitle')}
        actions={
          <Button onClick={() => void onSave()} disabled={updateMutation.isPending || showSkeleton}>
            {updateMutation.isPending ? t('common.loading') : t('common.save')}
          </Button>
        }
      />
      {isError ? (
        <ErrorState title={t('business.errorTitle')} onRetry={() => void refetch()} />
      ) : showSkeleton ? (
        <Card className="flex flex-col gap-4 max-w-2xl p-6">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </Card>
      ) : (
        <Card className="flex flex-col gap-4 max-w-2xl p-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bp-legal">{t('business.fieldLegalName')} *</Label>
            <Input
              id="bp-legal"
              value={draft.legalName ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, legalName: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bp-tagline">{t('business.fieldTagline')}</Label>
            <Input
              id="bp-tagline"
              value={draft.tagline ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bp-desc">{t('business.fieldDescription')}</Label>
            <Textarea
              id="bp-desc"
              rows={4}
              value={draft.description ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bp-email">{t('business.fieldEmail')}</Label>
              <Input
                id="bp-email"
                type="email"
                value={draft.email ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bp-phone">{t('business.fieldPhone')}</Label>
              <Input
                id="bp-phone"
                value={draft.phone ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bp-web">{t('business.fieldWebsiteUrl')}</Label>
            <Input
              id="bp-web"
              value={draft.websiteUrl ?? ''}
              placeholder="https://example.com"
              onChange={(e) => setDraft((d) => ({ ...d, websiteUrl: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bp-cors">{t('business.fieldAllowedWebsiteOrigins')}</Label>
            <Textarea
              id="bp-cors"
              rows={4}
              value={draft.allowedWebsiteOriginsText}
              placeholder={t('business.fieldAllowedWebsiteOriginsPlaceholder')}
              onChange={(e) => setDraft((d) => ({ ...d, allowedWebsiteOriginsText: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">{t('business.fieldAllowedWebsiteOriginsHint')}</p>
          </div>
        </Card>
      )}
    </PageShell>
  );
}
