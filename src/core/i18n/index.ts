import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../../locales/en.json';
import fr from '../../../locales/fr.json';

export const LOCALE_STORAGE_KEY = 'mesh_locale';

const initialLocale =
  (typeof window !== 'undefined' && window.localStorage.getItem(LOCALE_STORAGE_KEY)) ||
  'en';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: initialLocale,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLocale(locale: 'en' | 'fr') {
  void i18n.changeLanguage(locale);
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export default i18n;
