import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocale, setLocale as persistLocale, type Locale } from '@/core/i18n';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next);
  }, []);

  const marketingT = useCallback(
    (key: string, params?: Record<string, string | number>) => t(key, params),
    [t],
  );

  return (
    <LocaleContext.Provider
      value={{ locale: (i18n.language as Locale) ?? getLocale(), setLocale, t: marketingT }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
