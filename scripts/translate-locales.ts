/**
 * AI-powered locale translation script using Google Gemini.
 *
 * Usage:
 *   npx tsx scripts/translate-locales.ts                          # all apps, all languages
 *   npx tsx scripts/translate-locales.ts --app patient-app        # one app, all languages
 *   npx tsx scripts/translate-locales.ts --lang de                # all apps, one language
 *   npx tsx scripts/translate-locales.ts --app patient-app --lang de  # one app, one language
 *   npx tsx scripts/translate-locales.ts --missing-only           # only generate missing files
 *
 * Requires GOOGLE_AI_API_KEY env variable (or .env.local in caregiver-web).
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ── Configuration ──────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');

const LANGUAGE_NAMES: Record<string, string> = {
  de: 'German', fr: 'French', es: 'Spanish', it: 'Italian',
  pt: 'Portuguese', nl: 'Dutch', pl: 'Polish', ro: 'Romanian',
  el: 'Greek', cs: 'Czech', hu: 'Hungarian', sv: 'Swedish',
  da: 'Danish', fi: 'Finnish', bg: 'Bulgarian', hr: 'Croatian',
  sk: 'Slovak', sl: 'Slovenian', lt: 'Lithuanian', lv: 'Latvian',
  et: 'Estonian', ga: 'Irish', mt: 'Maltese',
};

const TARGET_LANGS = Object.keys(LANGUAGE_NAMES);

interface CopyTarget {
  outputDir: string;
  filePattern: (lang: string) => string;
}

interface SourceConfig {
  englishPath: string;
  outputDir: string;
  filePattern: (lang: string) => string;
  copyTo?: CopyTarget[];
}

interface AppConfig {
  name: string;
  sources: SourceConfig[];
}

const APPS: AppConfig[] = [
  {
    name: 'patient-app',
    sources: [{
      englishPath: path.join(ROOT, 'apps/patient-app/locales/en.json'),
      outputDir: path.join(ROOT, 'apps/patient-app/locales'),
      filePattern: (lang) => `${lang}.json`,
    }],
  },
  {
    name: 'caregiver-app',
    sources: [
      {
        englishPath: path.join(ROOT, 'apps/caregiver-app/locales/en.json'),
        outputDir: path.join(ROOT, 'apps/caregiver-app/locales'),
        filePattern: (lang) => `${lang}.json`,
      },
      {
        englishPath: path.join(ROOT, 'apps/caregiver-app/locales/resources-en.json'),
        outputDir: path.join(ROOT, 'apps/caregiver-app/locales'),
        filePattern: (lang) => `resources-${lang}.json`,
        // Same content is needed by caregiver-web — copy instead of re-translating
        copyTo: [{
          outputDir: path.join(ROOT, 'apps/caregiver-web/public/locales'),
          filePattern: (lang) => `${lang}-resources.json`,
        }],
      },
    ],
  },
  {
    name: 'caregiver-web',
    sources: [
      {
        englishPath: path.join(ROOT, 'apps/caregiver-web/locales/en.json'),
        outputDir: path.join(ROOT, 'apps/caregiver-web/public/locales'),
        filePattern: (lang) => `${lang}.json`,
      },
    ],
  },
];

// ── CLI args ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}
const filterApp = getArg('--app');
const filterLang = getArg('--lang');
const missingOnly = args.includes('--missing-only');

// ── Gemini setup ────────────────────────────────────────────────────

function loadApiKey(): string {
  if (process.env.GOOGLE_AI_API_KEY) return process.env.GOOGLE_AI_API_KEY;

  // Try to read from caregiver-web .env.local or .env
  for (const envFile of ['.env.local', '.env']) {
    const envPath = path.join(ROOT, 'apps/caregiver-web', envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/^GOOGLE_AI_API_KEY=(.+)$/m);
      if (match) return match[1].trim();
    }
  }

  throw new Error('GOOGLE_AI_API_KEY not found. Set it as env variable or in apps/caregiver-web/.env.local');
}

const genAI = new GoogleGenerativeAI(loadApiKey());

const SYSTEM_PROMPT = `You are a professional translator for a dementia daily care app called "OurTurn".

CRITICAL RULES:
1. Preserve ALL JSON keys exactly as they are — only translate the values.
2. Preserve ALL {{interpolation}} placeholders exactly (e.g. {{name}}, {{count}}).
3. Keep "OurTurn" untranslated everywhere — it is a brand name.
4. Use a warm, empathetic, supportive tone appropriate for families caring for someone with dementia.
5. NEVER use medical/diagnostic language. This is a wellness app, not a medical device.
6. Return ONLY valid JSON — no markdown, no code fences, no explanations.
7. The JSON structure must be identical to the input (same nesting, same keys).`;

// ── Translation logic ───────────────────────────────────────────────

const MAX_CHUNK_CHARS = 8000; // max JSON chars per API call

/**
 * Flatten a nested object into dot-separated key paths.
 * { a: { b: "c" } } -> { "a.b": "c" }
 * Only flattens objects, not arrays.
 */
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

/**
 * Unflatten dot-separated keys back into a nested object.
 * { "a.b": "c" } -> { a: { b: "c" } }
 */
function unflattenObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = obj[key];
  }
  return result;
}

/**
 * Split a flat object into chunks by JSON size.
 */
function chunkFlatObject(flat: Record<string, unknown>): Record<string, unknown>[] {
  const chunks: Record<string, unknown>[] = [];
  let current: Record<string, unknown> = {};
  let currentSize = 2;

  for (const key of Object.keys(flat)) {
    const entrySize = JSON.stringify({ [key]: flat[key] }).length;
    if (currentSize + entrySize > MAX_CHUNK_CHARS && Object.keys(current).length > 0) {
      chunks.push(current);
      current = {};
      currentSize = 2;
    }
    current[key] = flat[key];
    currentSize += entrySize;
  }

  if (Object.keys(current).length > 0) {
    chunks.push(current);
  }
  return chunks;
}

function validateKeys(original: Record<string, unknown>, translated: Record<string, unknown>): string[] {
  const errors: string[] = [];
  for (const key of Object.keys(original)) {
    if (!(key in translated)) {
      errors.push(`Missing key: ${key}`);
    }
  }
  return errors;
}

async function translateChunk(
  chunk: Record<string, unknown>,
  lang: string,
  langName: string,
  retries = 2,
): Promise<Record<string, unknown>> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Translate this JSON from English to ${langName} (${lang}).

${JSON.stringify(chunk, null, 2)}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 65536,
          responseMimeType: 'application/json',
        },
      });

      let text = result.response.text().trim();
      // Fix invalid JSON escapes produced by Gemini.
      // Valid JSON escapes: \" \\ \/ \b \f \n \r \t \uXXXX
      // Gemini sometimes outputs \' \x \a \e \0 etc. — strip the bad backslash.
      text = text.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      text = text.replace(/\\(?!["\\/bfnrtu])/g, '');
      const parsed = JSON.parse(text);

      // Validate key structure
      const errors = validateKeys(chunk, parsed);
      if (errors.length > 0) {
        console.warn(`  ⚠ Key mismatch (attempt ${attempt + 1}): ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? ` ... and ${errors.length - 3} more` : ''}`);
        if (attempt < retries) continue;
        // On final attempt, merge missing keys with English fallback
        const merged = { ...chunk };
        for (const key of Object.keys(parsed)) {
          if (key in merged) merged[key] = parsed[key];
        }
        return merged;
      }

      return parsed;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`  ⚠ API error (attempt ${attempt + 1}): ${errMsg}`);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }

  throw new Error('Unreachable');
}

async function translateFile(
  englishPath: string,
  outputPath: string,
  lang: string,
  langName: string,
): Promise<void> {
  const englishJson = JSON.parse(fs.readFileSync(englishPath, 'utf-8'));
  const totalSize = JSON.stringify(englishJson).length;

  if (totalSize <= MAX_CHUNK_CHARS) {
    // Small file — single API call
    const keyCount = Object.keys(englishJson).length;
    console.log(`  Translating ${keyCount} keys (${(totalSize / 1024).toFixed(1)}KB)...`);
    const translated = await translateChunk(englishJson, lang, langName);
    fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2) + '\n', 'utf-8');
  } else {
    // Large file — flatten, chunk by size, translate, unflatten
    const flat = flattenObject(englishJson);
    const flatKeys = Object.keys(flat);
    const chunks = chunkFlatObject(flat);
    console.log(`  Translating ${flatKeys.length} strings in ${chunks.length} chunks (${(totalSize / 1024).toFixed(1)}KB total)...`);

    let mergedFlat: Record<string, unknown> = {};
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkSize = JSON.stringify(chunk).length;
      const keyCount = Object.keys(chunk).length;
      console.log(`    Chunk ${i + 1}/${chunks.length}: ${keyCount} strings (${(chunkSize / 1024).toFixed(1)}KB)...`);
      const translated = await translateChunk(chunk, lang, langName);
      mergedFlat = { ...mergedFlat, ...translated };

      // Rate limit: wait between chunks
      if (i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // Unflatten back to nested structure
    const result = unflattenObject(mergedFlat);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n', 'utf-8');
  }
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const apps = filterApp ? APPS.filter(a => a.name === filterApp) : APPS;
  const langs = filterLang ? [filterLang] : TARGET_LANGS;

  if (apps.length === 0) {
    console.error(`Unknown app: ${filterApp}. Available: ${APPS.map(a => a.name).join(', ')}`);
    process.exit(1);
  }

  if (filterLang && !LANGUAGE_NAMES[filterLang]) {
    console.error(`Unknown language: ${filterLang}. Available: ${TARGET_LANGS.join(', ')}`);
    process.exit(1);
  }

  let totalFiles = 0;
  let skipped = 0;

  for (const app of apps) {
    console.log(`\n📦 ${app.name}`);

    for (const source of app.sources) {
      if (!fs.existsSync(source.englishPath)) {
        console.warn(`  ⚠ English source not found: ${source.englishPath}`);
        continue;
      }

      // Ensure output directory exists
      fs.mkdirSync(source.outputDir, { recursive: true });

      const sourceBasename = path.basename(source.englishPath);
      console.log(`\n  📄 Source: ${sourceBasename}`);

      for (const lang of langs) {
        const outputPath = path.join(source.outputDir, source.filePattern(lang));

        if (missingOnly && fs.existsSync(outputPath)) {
          skipped++;
          continue;
        }

        console.log(`\n  🌐 ${LANGUAGE_NAMES[lang]} (${lang}) -> ${path.basename(outputPath)}`);

        try {
          await translateFile(source.englishPath, outputPath, lang, LANGUAGE_NAMES[lang]);
          totalFiles++;
          console.log(`  ✅ Done`);

          // Copy to additional destinations if configured
          if (source.copyTo) {
            for (const target of source.copyTo) {
              fs.mkdirSync(target.outputDir, { recursive: true });
              const copyPath = path.join(target.outputDir, target.filePattern(lang));
              fs.copyFileSync(outputPath, copyPath);
              totalFiles++;
              console.log(`  📋 Copied -> ${path.basename(copyPath)}`);
            }
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error(`  ❌ Failed: ${errMsg}`);
        }

        // Rate limit between language translations
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  console.log(`\n🏁 Complete! ${totalFiles} files translated${skipped ? `, ${skipped} skipped (already exist)` : ''}.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
