import { AlertCircle } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
      <AlertCircle className="size-6 text-destructive" />
      <div className="flex flex-col gap-1">
        <p className="typo-card-title text-foreground">{title}</p>
        {message ? (
          <p className="typo-body-sm text-muted-foreground">{message}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
