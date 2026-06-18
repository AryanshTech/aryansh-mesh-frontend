import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { SparklesIcon } from 'lucide-react';
import { useAuth } from '@/core/auth/auth-context';
import { t } from '@/core/i18n';
import { Button } from '@/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/design-system/components/ui/card';
import { Input } from '@/design-system/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/design-system/components/ui/field';
import { Alert, AlertDescription } from '@/design-system/components/ui/alert';

const FEATURE_KEYS = ['featureOnboarding', 'featureGtm', 'featureCrm'] as const;

export function LoginPage() {
  const { signIn, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) return null;
  if (isAuthenticated) return <Navigate to="/marketing" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between border-r border-border bg-card p-10 lg:flex">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SparklesIcon className="size-5" />
          </div>
          <span className="font-display text-lg">{t('app.name')}</span>
        </div>
        <div className="spotlight-card p-8">
          <blockquote className="space-y-2">
            <p className="font-display text-lg leading-relaxed">
              &ldquo;{t('auth.panelQuote')}&rdquo;
            </p>
            <footer className="text-sm text-muted-foreground">
              {t('auth.panelAttribution')}
            </footer>
          </blockquote>
        </div>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {FEATURE_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[var(--accent-blue)]" />
              {t(`auth.${key}`)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-sm border-border bg-card shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="font-display text-2xl">{t('auth.welcomeTitle')}</CardTitle>
            <CardDescription>{t('auth.welcomeSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Field>
                  <FieldLabel htmlFor="email">{t('auth.email')}</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-secondary"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">{t('auth.password')}</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-secondary"
                  />
                </Field>
                <Button type="submit" className="w-full rounded-full" disabled={submitting}>
                  {submitting ? t('auth.signingIn') : t('auth.signIn')}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
