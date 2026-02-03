import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import locale files
import en from '../locales/en.json';

// Supported languages
const supportedLanguages = ['en'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      // Order of language detection
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      // Cache user language preference
      caches: ['localStorage'],
      // Look for 'lang' query parameter
      lookupQuerystring: 'lang',
      // LocalStorage key
      lookupLocalStorage: 'memoguard-language',
    },
  });

export default i18n;

// Helper to change language
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
};

// Get current language
export const getCurrentLanguage = () => i18n.language;

// Get browser language
export const getBrowserLanguage = () => {
  if (typeof navigator !== 'undefined') {
    return navigator.language.split('-')[0];
  }
  return 'en';
};
