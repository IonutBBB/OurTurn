import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_CODES } from '@ourturn/shared';
import { fetchAndCacheLocale, loadCachedLocale } from '@ourturn/shared/utils/locale-loader';

// Import English as bundled fallback
import en from '../locales/en.json';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const APP_NAME = 'patient-app';
const LANGUAGE_STORAGE_KEY = 'ourturn-language-override';

// Get device locale (e.g., 'en-US' -> 'en')
const locales = getLocales();
const deviceLanguage = locales[0]?.languageCode || 'en';

// Determine initial language from device locale
const initialLanguage = LANGUAGE_CODES.includes(deviceLanguage as any)
  ? deviceLanguage
  : 'en';

/**
 * Load language resources from cache, then fetch latest from Supabase Storage.
 * English is always bundled — this only handles non-English languages.
 */
async function loadLanguageResources(lang: string): Promise<void> {
  if (lang === 'en') return;

  // First, try loading from cache for instant display
  const cached = await loadCachedLocale(APP_NAME, lang);
  if (cached) {
    i18n.addResourceBundle(lang, 'translation', cached, true, true);
  }

  // Then fetch latest from Supabase Storage (updates cache if successful)
  const fresh = await fetchAndCacheLocale(SUPABASE_URL, APP_NAME, lang);
  if (fresh) {
    i18n.addResourceBundle(lang, 'translation', fresh, true, true);
  }
}

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      en: { translation: en },
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
 * Change the app language.
 * If `persist` is true (default), saves the override to AsyncStorage.
 */
export const changeLanguage = async (lang: string, persist = true) => {
  await loadLanguageResources(lang);
  await i18n.changeLanguage(lang);
  if (persist) {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }
};

/**
 * Initialize language from stored override or household setting.
 * Called after auth store loads household data.
 */
export const initLanguageFromHousehold = async (householdLanguage?: string | null) => {
  try {
    // 1. Check for manual override
    const override = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (override && LANGUAGE_CODES.includes(override as any)) {
      await changeLanguage(override, false);
      return;
    }

    // 2. Use household language
    if (householdLanguage && LANGUAGE_CODES.includes(householdLanguage as any)) {
      await changeLanguage(householdLanguage, false);
      return;
    }

    // 3. Device locale (already set as initial) — nothing to do
  } catch {
    // Silently fall back to current language
  }
};

/** Clear the manual language override */
export const clearLanguageOverride = async () => {
  await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
};

/** Get current language */
export const getCurrentLanguage = () => i18n.language;

/** Get device locale tag */
export const getDeviceLocale = () => {
  const locales = getLocales();
  return locales[0]?.languageTag || 'en-US';
};
