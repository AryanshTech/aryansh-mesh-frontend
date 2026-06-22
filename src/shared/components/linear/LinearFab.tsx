import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { cn } from '@/design-system/lib/utils';

type LinearFabProps = {
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
};

export function LinearFab({ onClick, ariaLabel, className }: LinearFabProps) {
  return (
    <Button
      type="button"
      size="icon"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'fixed bottom-8 right-8 z-40 size-12 rounded-full shadow-floating',
        className,
      )}
    >
      <Sparkles className="size-5" />
    </Button>
  );
}
