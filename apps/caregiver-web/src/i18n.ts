import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { LANGUAGE_CODES } from '@ourturn/shared';

// Import English as bundled fallback (always available instantly)
import en from '../locales/en.json';
import resourcesEn from '../../caregiver-app/locales/resources-en.json';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en, resources: resourcesEn },
    },
    fallbackLng: 'en',
    supportedLngs: [...LANGUAGE_CODES],
    ns: ['translation', 'resources'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'ourturn-language',
    },
    backend: {
      loadPath: (lngs: string[], namespaces: string[]) => {
        const lang = lngs[0];
        const ns = namespaces[0];
        // English is bundled, no need to fetch
        if (lang === 'en') return '';
        if (ns === 'resources') return `/locales/${lang}-resources.json`;
        return `/locales/${lang}.json`;
      },
    },
    // Only load from backend for non-English languages
    partialBundledLanguages: true,
  });

export default i18n;

/**
 * Change the app language.
 * Updates localStorage and optionally the household in Supabase.
 */
export const changeLanguage = (lang: string) => {
  return i18n.changeLanguage(lang);
};

/** Get current language */
export const getCurrentLanguage = () => i18n.language;

/** Get browser language */
export const getBrowserLanguage = () => {
  if (typeof navigator !== 'undefined') {
    return navigator.language.split('-')[0];
  }
  return 'en';
};
