import { readFile } from 'fs/promises';
import path from 'path';
import en from '../../locales/en.json';

type LocaleData = typeof en;

const localeCache = new Map<string, LocaleData>();

/**
 * Get translations for server components.
 * Reads the correct locale JSON based on the household's language.
 * Falls back to English if the locale file can't be loaded.
 */
export async function getServerTranslations(lang?: string | null): Promise<LocaleData> {
  if (!lang || lang === 'en') return en;

  // Check cache
  if (localeCache.has(lang)) return localeCache.get(lang)!;

  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', `${lang}.json`);
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as LocaleData;
    localeCache.set(lang, data);
    return data;
  } catch {
    return en;
  }
}
