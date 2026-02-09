import { SUPPORTED_LANGUAGES } from '@ourturn/shared/constants/languages';

/**
 * Build a language instruction to append to AI system prompts.
 * Returns an empty string for English (default behavior).
 */
export function getLanguageInstruction(locale?: string): string {
  if (!locale || locale === 'en') return '';

  const language = SUPPORTED_LANGUAGES.find(l => l.code === locale);
  if (!language) return '';

  return `\n\nLANGUAGE REQUIREMENT (CRITICAL):
You MUST respond entirely in ${language.name} (${language.nativeName}). Every part of your response — including headings, suggestions, advice, and any structured content — must be in ${language.name}. Do NOT respond in English unless the user explicitly writes to you in English.`;
}
