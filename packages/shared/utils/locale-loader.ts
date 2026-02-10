import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'locale-cache:';

/**
 * Fetch a locale JSON file from Supabase Storage with AsyncStorage caching.
 *
 * Flow:
 * 1. Check AsyncStorage for a cached version → return it immediately if found
 * 2. Fetch from Supabase Storage in the background
 * 3. If fetch succeeds, update cache and return fresh data
 * 4. If fetch fails and we have cache, return cached version
 * 5. If fetch fails and no cache, return null (caller falls back to English)
 */
export async function fetchAndCacheLocale(
  supabaseUrl: string,
  appName: string,
  lang: string,
  namespace = 'translation',
): Promise<Record<string, unknown> | null> {
  const fileName = namespace === 'translation' ? `${lang}.json` : `${namespace}-${lang}.json`;
  const storageUrl = `${supabaseUrl}/storage/v1/object/public/locales/${appName}/${fileName}`;
  const cacheKey = `${CACHE_KEY_PREFIX}${appName}:${namespace}:${lang}`;

  // 1. Try loading from cache first
  let cached: Record<string, unknown> | null = null;
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (raw) {
      cached = JSON.parse(raw);
    }
  } catch {
    // Cache read failed — continue to fetch
  }

  // 2. Fetch from Supabase Storage
  try {
    const response = await fetch(storageUrl);
    if (response.ok) {
      const data = await response.json();
      // Update cache in background (don't await)
      AsyncStorage.setItem(cacheKey, JSON.stringify(data)).catch(() => {});
      return data;
    }
    // Non-OK response — use cache if available
  } catch {
    // Network error — use cache if available
  }

  return cached;
}

/**
 * Load a locale from cache only (synchronous-ish for initial fast load).
 * Returns null if nothing is cached.
 */
export async function loadCachedLocale(
  appName: string,
  lang: string,
  namespace = 'translation',
): Promise<Record<string, unknown> | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}${appName}:${namespace}:${lang}`;
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Cache read failed
  }
  return null;
}
