import { useShellRightRail } from '@/shell/ShellRightRailContext';
import { cn } from '@/design-system/lib/utils';

type ShellRightRailProps = {
  className?: string;
  variant?: 'business' | 'marketing';
};

export function ShellRightRail({ className, variant = 'marketing' }: ShellRightRailProps) {
  const { content } = useShellRightRail();

  if (!content) {
    return null;
  }

  return (
    <aside
      className={cn(
        'z-40 hidden w-80 flex-col border-l border-border bg-background lg:flex',
        variant === 'business'
          ? 'fixed right-0 top-14 h-[calc(100vh-3.5rem)]'
          : 'absolute right-0 top-14 bottom-0',
        className,
      )}
    >
      {content}
    </aside>
  );
}
