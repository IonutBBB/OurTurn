import en from '../../locales/en.json';

/**
 * Server-side i18n helper for landing page components.
 * Walks a dot-path on the bundled English JSON to return a string.
 * Falls back to the key itself if not found.
 */
export function landingT(key: string): string {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = en;

  for (const part of parts) {
    if (current == null || typeof current !== 'object') return key;
    current = current[part];
  }

  return typeof current === 'string' ? current : key;
}
