import { useEffect, useRef, useState } from 'react';

const WIDE_QUERY = '(min-width: 1280px)';

export function useIsWide() {
  const [isWide, setIsWide] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(WIDE_QUERY).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(WIDE_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsWide(event.matches);
    setIsWide(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return isWide;
}

/** Locks wide/narrow layout while `locked` is true to avoid mode flips when drawers open. */
export function useStableWide(locked: boolean): boolean {
  const isWide = useIsWide();
  const stableRef = useRef(isWide);

  if (!locked) {
    stableRef.current = isWide;
  }

  return stableRef.current;
}
