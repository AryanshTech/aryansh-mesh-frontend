import { useCallback, useLayoutEffect, useRef } from 'react';

export const RADIX_OPEN_GUARD_MS = 500;

export function isSelectPopoverTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return Boolean(
    el?.closest(
      '[data-radix-select-viewport], [data-radix-select-content], [role="listbox"], [data-radix-popper-content-wrapper], [data-radix-select-trigger]',
    ),
  );
}

export function shouldBlockRadixDismiss(openedAt: number): boolean {
  return openedAt > 0 && performance.now() - openedAt < RADIX_OPEN_GUARD_MS;
}

export function useRadixOpenGuard(open: boolean) {
  const openedAtRef = useRef(0);
  const wasOpenRef = useRef(false);

  if (open && !wasOpenRef.current) {
    openedAtRef.current = performance.now();
  }
  wasOpenRef.current = open;

  useLayoutEffect(() => {
    if (open) {
      openedAtRef.current = performance.now();
    }
  }, [open]);

  const createGuardedOnOpenChange = useCallback(
    (onOpenChange: (next: boolean) => void) => (next: boolean) => {
      if (next) {
        openedAtRef.current = performance.now();
      }
      onOpenChange(next);
    },
    [],
  );

  const dismissGuardProps = {
    onPointerDownOutside: (e: Event) => {
      if (isSelectPopoverTarget(e.target)) {
        e.preventDefault();
        return;
      }
      if (shouldBlockRadixDismiss(openedAtRef.current)) {
        e.preventDefault();
      }
    },
    onInteractOutside: (e: Event) => {
      if (isSelectPopoverTarget(e.target)) {
        e.preventDefault();
        return;
      }
      if (shouldBlockRadixDismiss(openedAtRef.current)) {
        e.preventDefault();
      }
    },
    onFocusOutside: (e: Event) => {
      if (isSelectPopoverTarget(e.target)) {
        e.preventDefault();
        return;
      }
      if (shouldBlockRadixDismiss(openedAtRef.current)) {
        e.preventDefault();
      }
    },
  };

  const captureStampProps = {
    onPointerDownCapture: () => {
      openedAtRef.current = performance.now();
    },
  };

  return { createGuardedOnOpenChange, dismissGuardProps, captureStampProps };
}

/** Defer drawer open until after the opening click finishes (avoids Radix dismiss race). */
export function useDeferredOverlayOpen() {
  const scheduleOpen = (open: () => void) => {
    queueMicrotask(open);
  };

  return { scheduleOpen };
}
