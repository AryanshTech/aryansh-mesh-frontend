import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';

interface Props {
  to: string;
  label: string;
  className?: string;
}

export function MarketingBackLink({ to, label, className }: Props) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-1.5 typo-body-sm text-muted-foreground transition-colors hover:text-foreground',
        className,
      )}
    >
      <ArrowLeft className="size-3.5 shrink-0" />
      {label}
    </Link>
  );
}
