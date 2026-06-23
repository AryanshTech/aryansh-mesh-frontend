/**
 * ThemeProvider — Dark Precision only. No light mode in v1.
 * Forces `dark` class on html element for any third-party libs that gate on it.
 */
import { useEffect, type ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  }, []);
  return <>{children}</>;
}
