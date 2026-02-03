import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

// Import locale files
import en from '../locales/en.json';

// Get device locale (e.g., 'en-US' -> 'en')
const locales = getLocales();
const deviceLanguage = locales[0]?.languageCode || 'en';

// Supported languages
const supportedLanguages = ['en'];

// Determine initial language
const initialLanguage = supportedLanguages.includes(deviceLanguage)
  ? deviceLanguage
  : 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      en: { translation: en },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Prevent issues with React Native
    },
  });

export default i18n;

// Helper to change language
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
};

// Get current language
export const getCurrentLanguage = () => i18n.language;

// Get device locale
export const getDeviceLocale = () => {
  const locales = getLocales();
  return locales[0]?.languageTag || 'en-US';
};
