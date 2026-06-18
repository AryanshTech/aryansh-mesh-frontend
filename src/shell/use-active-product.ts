import { useLocation } from 'react-router-dom';

export type ActiveProduct = 'business' | 'marketing';

export function useActiveProduct(): ActiveProduct {
  const { pathname } = useLocation();
  if (pathname.startsWith('/marketing')) return 'marketing';
  return 'business';
}
