import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../../locales/en.json';
import fr from '../../../locales/fr.json';

const STORAGE_KEY = 'aryansh_mesh_locale';

export type Locale = 'en' | 'fr';

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'fr' ? 'fr' : 'en';
}

/** Resolve legacy flat keys from ported BM/MH components. */
function resolveTranslationKey(key: string): string {
  if (i18n.exists(key)) return key;
  const businessKey = `business.${key}`;
  if (i18n.exists(businessKey)) return businessKey;
  const marketingKey = `marketing.${key}`;
  if (i18n.exists(marketingKey)) return marketingKey;
  return key;
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: getStoredLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

const defaultT = i18n.t.bind(i18n);
i18n.t = ((...args: Parameters<typeof defaultT>) => {
  const [key, ...rest] = args;
  if (typeof key === 'string') {
    return defaultT(resolveTranslationKey(key), ...rest);
  }
  return defaultT(...args);
}) as typeof defaultT;

export { resolveTranslationKey };

export function setLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale);
  void i18n.changeLanguage(locale);
}

export function getLocale(): Locale {
  return i18n.language === 'fr' ? 'fr' : 'en';
}

export function t(key: string, params?: Record<string, string | number>): string {
  return i18n.t(key, params);
}

const localeTag: Record<'en' | 'fr', string> = { en: 'en-US', fr: 'fr-CA' };

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(localeTag[getLocale()]);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(localeTag[getLocale()]);
}

export default i18n;
