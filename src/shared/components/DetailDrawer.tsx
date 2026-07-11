import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/design-system/components/ui/sheet';
import { Button } from '@/design-system/components/ui/button';
import { OverlayPortalTarget } from '@/shared/components/OverlayPortalTarget';
import { useRadixOpenGuard } from '@/shared/hooks/radix-dismiss-guard';
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
  /** Rendered as the underlying content. The drawer slides in over it (non-modal). */
  master?: ReactNode;
  className?: string;
}

/**
 * Detail drawer — a shadcn Sheet that slides in from the right over the master content.
 * Non-modal, so the master pane stays interactive and its layout is never squeezed.
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
  const { t } = useTranslation();
  const { createGuardedOnOpenChange, dismissGuardProps, captureStampProps } = useRadixOpenGuard(open);
  const handleOpenChange = createGuardedOnOpenChange(onOpenChange);

  return (
    <div {...captureStampProps} className={className}>
      {master}
      <Sheet open={open} onOpenChange={handleOpenChange} modal={false}>
        <SheetContent
          side="right"
          showClose={false}
          className={cn(
            'flex w-full max-w-[440px] flex-col gap-0 border-l border-border bg-card p-0',
          )}
          {...dismissGuardProps}
        >
          <OverlayPortalTarget className="flex h-full flex-col">
            <SheetHeader className="flex-row items-start justify-between gap-2 space-y-0 border-b border-border px-5 py-4 text-left">
              <div className="flex min-w-0 flex-col gap-0.5">
                <SheetTitle className="truncate">{title}</SheetTitle>
                {description ? (
                  <SheetDescription className="truncate">{description}</SheetDescription>
                ) : null}
              </div>
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t('common.close')}
                  className="size-7 shrink-0"
                >
                  <X className="size-4" />
                </Button>
              </SheetClose>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer ? (
              <SheetFooter className="border-t border-border bg-card px-5 py-3 sm:justify-end">
                {footer}
              </SheetFooter>
            ) : null}
          </OverlayPortalTarget>
        </SheetContent>
      </Sheet>
    </div>
  );
}
