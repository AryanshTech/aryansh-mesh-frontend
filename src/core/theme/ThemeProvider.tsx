import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { THEME_STORAGE_KEY, type ResolvedTheme, type ThemeMode } from '@/core/theme/tokens';

const THEME_TRANSITION_MS = 200;

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

function applyThemeClass(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

function applyThemeClassWithTransition(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.add('theme-transition');
  applyThemeClass(resolved);
  window.setTimeout(() => {
    root.classList.remove('theme-transition');
  }, THEME_TRANSITION_MS);
}

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(readStoredMode()));
  const skipTransitionRef = useRef(true);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    const r = resolveTheme(mode);
    setResolved(r);
    if (skipTransitionRef.current) {
      skipTransitionRef.current = false;
      applyThemeClass(r);
      return;
    }
    applyThemeClassWithTransition(r);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const r = getSystemTheme();
      setResolved(r);
      applyThemeClassWithTransition(r);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function getThemeInitScript(): string {
  return `(function(){try{var m=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(d?"dark":"light");r.style.colorScheme=d?"dark":"light";}catch(e){document.documentElement.classList.add("light");}})();`;
}
