import { RADIX_OPEN_GUARD_MS } from '@/shared/hooks/radix-dismiss-guard';

let lastSelectOpenStamp = 0;

export function stampSelectOpen() {
  lastSelectOpenStamp = performance.now();
}

export function shouldBlockSelectDismiss(): boolean {
  return (
    lastSelectOpenStamp > 0 &&
    performance.now() - lastSelectOpenStamp < RADIX_OPEN_GUARD_MS
  );
}
