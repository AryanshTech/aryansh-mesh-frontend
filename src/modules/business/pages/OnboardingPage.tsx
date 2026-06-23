import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Circle, Building2, Package, MapPin, Rocket } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { cn } from '@/design-system/lib/utils';

const steps = [
  {
    id: 1,
    icon: Building2,
    title: 'Complete your business profile',
    description: 'Add your business name, description, and brand color.',
    href: '/business/profile',
  },
  {
    id: 2,
    icon: Package,
    title: 'Add your first product or service',
    description: 'Create the products or services your customers can book.',
    href: '/business/products',
  },
  {
    id: 3,
    icon: MapPin,
    title: 'Add a location',
    description: 'Tell customers where you operate.',
    href: '/business/locations',
  },
  {
    id: 4,
    icon: Rocket,
    title: 'Publish your site',
    description: 'Make your business visible to the world.',
    href: '/business/publish',
  },
];

export default function OnboardingPage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <PageHeader
        title={t('onboarding.title')}
        description={t('onboarding.subtitle')}
      />
      <div className="flex flex-col gap-3 max-w-xl">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.id}
              to={step.href}
              className={cn(
                'group flex items-start gap-4 rounded-xl border border-border bg-card p-4',
                'transition-all duration-150 hover:border-hairline-strong hover:shadow-card',
              )}
            >
              <div className="mt-0.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
                <Circle className="size-5" />
              </div>
              <div className="flex flex-1 items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
                  <Icon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="typo-card-title text-foreground">{step.title}</p>
                  <p className="typo-body-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
