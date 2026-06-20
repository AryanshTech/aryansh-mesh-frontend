import { useEffect, useState } from 'react';

const MOBILE_NAV_QUERY = '(max-width: 767px)';

export function useIsMobileNav(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_NAV_QUERY).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_NAV_QUERY);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
