import { Button, type ButtonProps } from '@/design-system/components/ui/button';
import { cn } from '@/design-system/lib/utils';

export function ShellIconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'max-md:min-h-11 max-md:min-w-11 text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    />
  );
}
