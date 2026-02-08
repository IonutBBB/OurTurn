import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_CODES } from '@ourturn/shared';

// Import English as bundled fallback
import en from '../locales/en.json';
import resourcesEn from '../locales/resources-en.json';

// Dynamic language maps — React Native bundles all at build time
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

const resourcesLocaleMap: Record<string, () => Record<string, unknown>> = {
  de: () => require('../locales/resources-de.json'),
  fr: () => require('../locales/resources-fr.json'),
  es: () => require('../locales/resources-es.json'),
  it: () => require('../locales/resources-it.json'),
  pt: () => require('../locales/resources-pt.json'),
  nl: () => require('../locales/resources-nl.json'),
  pl: () => require('../locales/resources-pl.json'),
  ro: () => require('../locales/resources-ro.json'),
  el: () => require('../locales/resources-el.json'),
  cs: () => require('../locales/resources-cs.json'),
  hu: () => require('../locales/resources-hu.json'),
  sv: () => require('../locales/resources-sv.json'),
  da: () => require('../locales/resources-da.json'),
  fi: () => require('../locales/resources-fi.json'),
  bg: () => require('../locales/resources-bg.json'),
  hr: () => require('../locales/resources-hr.json'),
  sk: () => require('../locales/resources-sk.json'),
  sl: () => require('../locales/resources-sl.json'),
  lt: () => require('../locales/resources-lt.json'),
  lv: () => require('../locales/resources-lv.json'),
  et: () => require('../locales/resources-et.json'),
  ga: () => require('../locales/resources-ga.json'),
  mt: () => require('../locales/resources-mt.json'),
};

const LANGUAGE_STORAGE_KEY = 'ourturn-language';

// Get device locale (e.g., 'en-US' -> 'en')
const locales = getLocales();
const deviceLanguage = locales[0]?.languageCode || 'en';

// Determine initial language
const initialLanguage = LANGUAGE_CODES.includes(deviceLanguage as any)
  ? deviceLanguage
  : 'en';

function loadLanguageResources(lang: string) {
  if (lang === 'en') return;
  const loader = localeMap[lang];
  if (loader) {
    try {
      i18n.addResourceBundle(lang, 'translation', loader(), true, true);
    } catch {
      // Translation file not yet generated
    }
  }
  const resourcesLoader = resourcesLocaleMap[lang];
  if (resourcesLoader) {
    try {
      i18n.addResourceBundle(lang, 'resources', resourcesLoader(), true, true);
    } catch {
      // Resources translation not yet generated
    }
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
  loadLanguageResources(lang);
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
