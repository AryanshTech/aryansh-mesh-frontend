import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { setLocale, getLocale } from '@/core/i18n';
import { useAuth } from '@/core/auth/use-auth';
import { getAuthErrorKey, isPasswordResetUserNotFound } from '@/core/auth/auth-errors';

export function AccountPage() {
  const { t } = useTranslation();
  const { session, resetPassword } = useAuth();
  const locale = getLocale();
  const [sendingReset, setSendingReset] = useState(false);

  async function handleSendPasswordReset() {
    if (!session?.email) {
      return;
    }
    setSendingReset(true);
    try {
      await resetPassword(session.email);
      toast.success(t('auth.resetSentTitle'));
    } catch (error) {
      if (isPasswordResetUserNotFound(error)) {
        toast.success(t('auth.resetSentTitle'));
        return;
      }
      toast.error(t(getAuthErrorKey(error)));
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <CrmPageShell>
      <PageHeader title={t('pages.account')} />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t('account.profile')}</TabsTrigger>
          <TabsTrigger value="language">{t('account.language')}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('account.profile')}</CardTitle>
              <CardDescription>{t('account.profileDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('auth.email')}</Label>
                <Input value={session?.email ?? ''} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('account.password')}</Label>
                <p className="text-sm text-muted-foreground">{t('account.passwordHint')}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit"
                  disabled={!session?.email || sendingReset}
                  onClick={() => void handleSendPasswordReset()}
                >
                  {sendingReset ? t('common.loading') : t('account.sendPasswordReset')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{t('account.language')}</CardTitle>
              <CardDescription>{t('account.languageDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
              >
                {locale === 'en' ? t('topBar.french') : t('topBar.english')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CrmPageShell>
  );
}
