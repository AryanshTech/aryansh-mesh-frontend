import { Sheet, SheetContent } from '@/design-system/components/ui/sheet';
import { OverlayPortalTarget } from '@/shared/components/OverlayPortalTarget';
import { useRadixOpenGuard } from '@/shared/hooks/radix-dismiss-guard';
import { useStableWide } from '@/shared/hooks/use-is-wide';
import { cn } from '@/design-system/lib/utils';
import { X } from 'lucide-react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Rendered to the left of the drawer when on a wide screen as the inline split master pane. */
  master?: ReactNode;
  className?: string;
}

/**
 * Responsive detail drawer.
 *   < 1280px → shadcn Sheet from the right
 *   ≥ 1280px → inline split-pane (drawer pinned beside the list)
 */
export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  master,
  className,
}: DetailDrawerProps) {
  const isWide = useStableWide(open);
  const { createGuardedOnOpenChange, dismissGuardProps } = useRadixOpenGuard(open);
  const handleOpenChange = createGuardedOnOpenChange(onOpenChange);

  if (isWide && master !== undefined) {
    return (
      <div className={cn('flex w-full gap-6', className)}>
        <div className={cn('flex-1 min-w-0', open ? 'max-w-[calc(100%-460px)]' : '')}>
          {master}
        </div>
        {open ? (
          <aside className="relative w-[440px] shrink-0 overflow-visible rounded-xl border border-border bg-card shadow-card">
            <DrawerInner
              title={title}
              description={description}
              onClose={() => handleOpenChange(false)}
              footer={footer}
            >
              {children}
            </DrawerInner>
          </aside>
        ) : null}
      </div>
    );
  }

  return (
    <>
      {master}
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          showClose={false}
          className="w-full max-w-[440px] border-l border-border bg-card p-0"
          {...dismissGuardProps}
        >
          <DrawerInner
            title={title}
            description={description}
            onClose={() => handleOpenChange(false)}
            footer={footer}
          >
            {children}
          </DrawerInner>
        </SheetContent>
      </Sheet>
    </>
  );
}

function DrawerInner({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <OverlayPortalTarget className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-2 border-b border-border px-5 py-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 className="typo-card-title text-foreground truncate">{title}</h2>
          {description ? (
            <p className="typo-body-sm text-muted-foreground truncate">{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      {footer ? (
        <footer className="border-t border-border bg-card px-5 py-3">{footer}</footer>
      ) : null}
    </OverlayPortalTarget>
  );
}
