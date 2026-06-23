import { useEffect, useState } from 'react';

const WIDE_BREAKPOINT = 1280;

export function useIsWide() {
  const [isWide, setIsWide] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= WIDE_BREAKPOINT;
  });

  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= WIDE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isWide;
}
