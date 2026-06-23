import { useEffect, useState } from 'react';

/**
 * View mode persisted per page in localStorage.
 * Keys are namespaced as `mesh_view_mode_{pageKey}`.
 */
export type ViewMode = 'card' | 'list';

export function useViewMode(pageKey: string, defaultMode: ViewMode = 'card') {
  const storageKey = `mesh_view_mode_${pageKey}`;
  const [mode, setModeState] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return defaultMode;
    const stored = window.localStorage.getItem(storageKey);
    return stored === 'list' || stored === 'card' ? stored : defaultMode;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, mode);
    } catch {
      /* ignore */
    }
  }, [mode, storageKey]);

  return [mode, setModeState] as const;
}
