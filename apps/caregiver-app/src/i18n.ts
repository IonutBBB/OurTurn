import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_CODES } from '@ourturn/shared';
import { fetchAndCacheLocale, loadCachedLocale } from '@ourturn/shared/utils/locale-loader';

// Import English as bundled fallback
import en from '../locales/en.json';
import resourcesEn from '../locales/resources-en.json';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const APP_NAME = 'caregiver-app';
const LANGUAGE_STORAGE_KEY = 'ourturn-language';

// Get device locale (e.g., 'en-US' -> 'en')
const locales = getLocales();
const deviceLanguage = locales[0]?.languageCode || 'en';

// Determine initial language
const initialLanguage = LANGUAGE_CODES.includes(deviceLanguage as any)
  ? deviceLanguage
  : 'en';

/**
 * Load language resources from cache, then fetch latest from Supabase Storage.
 * Handles both 'translation' and 'resources' namespaces.
 * English is always bundled — this only handles non-English languages.
 */
async function loadLanguageResources(lang: string): Promise<void> {
  if (lang === 'en') return;

  // Load both namespaces in parallel
  const [cachedTranslation, cachedResources] = await Promise.all([
    loadCachedLocale(APP_NAME, lang, 'translation'),
    loadCachedLocale(APP_NAME, lang, 'resources'),
  ]);

  if (cachedTranslation) {
    i18n.addResourceBundle(lang, 'translation', cachedTranslation, true, true);
  }
  if (cachedResources) {
    i18n.addResourceBundle(lang, 'resources', cachedResources, true, true);
  }

  // Fetch latest from Supabase Storage in parallel
  const [freshTranslation, freshResources] = await Promise.all([
    fetchAndCacheLocale(SUPABASE_URL, APP_NAME, lang, 'translation'),
    fetchAndCacheLocale(SUPABASE_URL, APP_NAME, lang, 'resources'),
  ]);

  if (freshTranslation) {
    i18n.addResourceBundle(lang, 'translation', freshTranslation, true, true);
  }
  if (freshResources) {
    i18n.addResourceBundle(lang, 'resources', freshResources, true, true);
  }
}

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      en: { translation: en, resources: resourcesEn },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    supportedLngs: [...LANGUAGE_CODES],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load initial language resources if not English
if (initialLanguage !== 'en') {
  loadLanguageResources(initialLanguage);
}

export default i18n;

/**
 * Change the app language and persist to AsyncStorage.
 */
export const changeLanguage = async (lang: string) => {
  await loadLanguageResources(lang);
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
};

/**
 * Initialize language from stored preference.
 * Called on app startup after AsyncStorage is available.
 */
export const initLanguageFromStorage = async () => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && LANGUAGE_CODES.includes(stored as any)) {
      await changeLanguage(stored);
    }
  } catch {
    // Silently fall back
  }
};

/** Get current language */
export const getCurrentLanguage = () => i18n.language;

/** Get device locale */
export const getDeviceLocale = () => {
  const locales = getLocales();
  return locales[0]?.languageTag || 'en-US';
};
