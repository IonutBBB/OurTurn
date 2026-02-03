import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import locale files
import en from '../locales/en.json';

// Get device locale (e.g., 'en-US' -> 'en')
const deviceLanguage = Localization.locale.split('-')[0];

// Supported languages
const supportedLanguages = ['en'];

// Determine initial language
const initialLanguage = supportedLanguages.includes(deviceLanguage)
  ? deviceLanguage
  : 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3', // Required for Android
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
export const getDeviceLocale = () => Localization.locale;
