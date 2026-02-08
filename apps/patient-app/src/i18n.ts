import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_CODES } from '@ourturn/shared';

// Import English as bundled fallback
import en from '../locales/en.json';

// Dynamic language map — React Native bundles all at build time,
// but only the active language is loaded into memory.
const localeMap: Record<string, () => Record<string, unknown>> = {
  de: () => require('../locales/de.json'),
  fr: () => require('../locales/fr.json'),
  es: () => require('../locales/es.json'),
  it: () => require('../locales/it.json'),
  pt: () => require('../locales/pt.json'),
  nl: () => require('../locales/nl.json'),
  pl: () => require('../locales/pl.json'),
  ro: () => require('../locales/ro.json'),
  el: () => require('../locales/el.json'),
  cs: () => require('../locales/cs.json'),
  hu: () => require('../locales/hu.json'),
  sv: () => require('../locales/sv.json'),
  da: () => require('../locales/da.json'),
  fi: () => require('../locales/fi.json'),
  bg: () => require('../locales/bg.json'),
  hr: () => require('../locales/hr.json'),
  sk: () => require('../locales/sk.json'),
  sl: () => require('../locales/sl.json'),
  lt: () => require('../locales/lt.json'),
  lv: () => require('../locales/lv.json'),
  et: () => require('../locales/et.json'),
  ga: () => require('../locales/ga.json'),
  mt: () => require('../locales/mt.json'),
};

const LANGUAGE_STORAGE_KEY = 'ourturn-language-override';

// Get device locale (e.g., 'en-US' -> 'en')
const locales = getLocales();
const deviceLanguage = locales[0]?.languageCode || 'en';

// Determine initial language from device locale
const initialLanguage = LANGUAGE_CODES.includes(deviceLanguage as any)
  ? deviceLanguage
  : 'en';

function loadLanguageResources(lang: string) {
  if (lang === 'en') return;
  const loader = localeMap[lang];
  if (loader) {
    try {
      const resources = loader();
      i18n.addResourceBundle(lang, 'translation', resources, true, true);
    } catch {
      // Translation file not yet generated — fall back to English
    }
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
  loadLanguageResources(lang);
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
