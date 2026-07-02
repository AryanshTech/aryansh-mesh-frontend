import { useCallback, useContext, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import {
  Dialog,
  DialogOpenStampContext,
  useGuardedDialogOpenChange,
} from '@/design-system/components/ui/dialog';
import { RADIX_OPEN_GUARD_MS } from '@/shared/hooks/radix-dismiss-guard';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface FormDialogScopeProps {
  children: ReactNode;
  className?: string;
}

function stampOpenGuard(stampRef: RefObject<number>) {
  stampRef.current = performance.now();
}

/**
 * Wraps a page/section so any pointerdown on dialog trigger buttons stamps
 * before the click opens the dialog. Use at layout level for FormDialog consumers.
 */
export function FormDialogScope({ children, className }: FormDialogScopeProps) {
  const stampRef = useRef(0);

  return (
    <DialogOpenStampContext value={stampRef}>
      <div
        onPointerDownCapture={() => stampOpenGuard(stampRef)}
        className={className}
      >
        {children}
      </div>
    </DialogOpenStampContext>
  );
}

/**
 * Stamp + defer open past the current pointer gesture (prevents Radix dismiss race).
 */
export function useFormDialogOpen() {
  const stampRef = useContext(DialogOpenStampContext);

  const scheduleOpen = useCallback(
    (open: () => void) => {
      if (stampRef) stampOpenGuard(stampRef);
      queueMicrotask(open);
    },
    [stampRef],
  );

  const triggerProps = useMemo(
    () =>
      ({
        'data-form-dialog-trigger': true,
        onPointerDown: () => {
          if (stampRef) stampOpenGuard(stampRef);
        },
      }) as const,
    [stampRef],
  );

  return { scheduleOpen, triggerProps };
}

/**
 * Dialog with dismiss-race protection.
 *
 * Stamps performance.now() on trigger pointerdown — before the click
 * chain, before React state updates, before Radix mounts the overlay.
 * The stamp is shared via context so DialogContent's onPointerDownOutside /
 * onInteractOutside handlers can block the spurious dismiss that fires from
 * the same click's mouseup landing on the freshly-mounted overlay.
 *
 * When used inside FormDialogScope, the scope's stamp covers trigger buttons.
 * Standalone usage falls back to a local capture wrapper around the Dialog.
 */
export function FormDialog({ open, onOpenChange, children }: FormDialogProps) {
  const scopeStampRef = useContext(DialogOpenStampContext);
  const localStampRef = useRef(0);
  const stampRef = scopeStampRef ?? localStampRef;
  const guardedOnOpenChange = useGuardedDialogOpenChange(open, onOpenChange, stampRef);

  const dialog = (
    <Dialog open={open} onOpenChange={guardedOnOpenChange}>
      {children}
    </Dialog>
  );

  if (scopeStampRef) {
    return (
      <DialogOpenStampContext value={stampRef}>
        {dialog}
      </DialogOpenStampContext>
    );
  }

  return (
    <DialogOpenStampContext value={stampRef}>
      <div
        onPointerDownCapture={() => stampOpenGuard(localStampRef)}
        className="contents"
      >
        {dialog}
      </div>
    </DialogOpenStampContext>
  );
}

export { RADIX_OPEN_GUARD_MS };
