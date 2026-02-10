/**
 * Upload locale JSON files to Supabase Storage for lazy-loading in mobile apps.
 *
 * Usage:
 *   npx tsx scripts/upload-locales.ts                     # upload all non-English locales
 *   npx tsx scripts/upload-locales.ts --app patient-app   # upload one app only
 *   npx tsx scripts/upload-locales.ts --dry-run           # list files without uploading
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env variables
 * (or reads from .env / apps/caregiver-web/.env).
 *
 * Uploads to the `locales` public bucket with paths like:
 *   patient-app/de.json
 *   caregiver-app/fr.json
 *   caregiver-app/resources-fr.json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

// ── ENV loading ────────────────────────────────────────────────────

function loadEnvVar(name: string, altNames: string[] = []): string {
  const allNames = [name, ...altNames];

  for (const n of allNames) {
    if (process.env[n]) return process.env[n]!;
  }

  // Try to read from .env files
  const envFiles = [
    path.join(ROOT, '.env'),
    path.join(ROOT, 'apps/caregiver-web/.env'),
    path.join(ROOT, 'apps/caregiver-web/.env.local'),
  ];

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf-8');
      for (const n of allNames) {
        const match = content.match(new RegExp(`^${n}=(.+)$`, 'm'));
        if (match) return match[1].trim();
      }
    }
  }

  throw new Error(
    `Missing ${name}. Set it as an env variable or in .env / apps/caregiver-web/.env`
  );
}

// ── Configuration ──────────────────────────────────────────────────

interface UploadSource {
  localesDir: string;
  /** Maps a locale filename to the Storage path (relative to bucket root) */
  files: () => { localPath: string; storagePath: string }[];
}

const APPS: Record<string, UploadSource> = {
  'patient-app': {
    localesDir: path.join(ROOT, 'apps/patient-app/locales'),
    files() {
      return getLocaleFiles(this.localesDir, /^(?!en\.json$)([a-z]{2})\.json$/, (lang) =>
        `patient-app/${lang}.json`
      );
    },
  },
  'caregiver-app': {
    localesDir: path.join(ROOT, 'apps/caregiver-app/locales'),
    files() {
      return [
        // Main translation files
        ...getLocaleFiles(this.localesDir, /^(?!en\.json$)([a-z]{2})\.json$/, (lang) =>
          `caregiver-app/${lang}.json`
        ),
        // Resources translation files
        ...getLocaleFiles(this.localesDir, /^resources-(?!en\.json$)([a-z]{2})\.json$/, (lang) =>
          `caregiver-app/resources-${lang}.json`
        ),
      ];
    },
  },
};

function getLocaleFiles(
  dir: string,
  pattern: RegExp,
  toStoragePath: (lang: string) => string,
): { localPath: string; storagePath: string }[] {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => pattern.test(f))
    .map((f) => {
      const match = f.match(pattern);
      const lang = match![1];
      return {
        localPath: path.join(dir, f),
        storagePath: toStoragePath(lang),
      };
    });
}

// ── CLI args ───────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}
const filterApp = getArg('--app');
const dryRun = args.includes('--dry-run');

// ── Upload logic ───────────────────────────────────────────────────

async function uploadFile(
  supabaseUrl: string,
  serviceRoleKey: string,
  bucket: string,
  storagePath: string,
  content: Buffer,
): Promise<boolean> {
  const url = `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    },
    body: content,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`  Failed (${response.status}): ${text}`);
    return false;
  }
  return true;
}

async function ensureBucket(
  supabaseUrl: string,
  serviceRoleKey: string,
  bucket: string,
): Promise<void> {
  // Check if bucket exists
  const listRes = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucket}`, {
    headers: { Authorization: `Bearer ${serviceRoleKey}` },
  });

  if (listRes.ok) return; // Bucket exists

  // Create bucket
  const createRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Failed to create bucket "${bucket}": ${text}`);
  }

  console.log(`Created public bucket: ${bucket}`);
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  const supabaseUrl = loadEnvVar('SUPABASE_URL', ['NEXT_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_URL']);
  const serviceRoleKey = loadEnvVar('SUPABASE_SERVICE_ROLE_KEY');
  const bucket = 'locales';

  const appNames = filterApp ? [filterApp] : Object.keys(APPS);

  // Validate app names
  for (const name of appNames) {
    if (!APPS[name]) {
      console.error(`Unknown app: ${name}. Available: ${Object.keys(APPS).join(', ')}`);
      process.exit(1);
    }
  }

  // Collect all files to upload
  const allFiles: { localPath: string; storagePath: string }[] = [];
  for (const name of appNames) {
    allFiles.push(...APPS[name].files());
  }

  if (allFiles.length === 0) {
    console.log('No locale files found to upload.');
    return;
  }

  console.log(`Found ${allFiles.length} locale files to upload.`);

  if (dryRun) {
    console.log('\nDry run — files that would be uploaded:');
    for (const f of allFiles) {
      const size = fs.statSync(f.localPath).size;
      console.log(`  ${f.storagePath} (${(size / 1024).toFixed(1)}KB)`);
    }
    return;
  }

  // Ensure bucket exists
  await ensureBucket(supabaseUrl, serviceRoleKey, bucket);

  // Upload files
  let uploaded = 0;
  let failed = 0;

  for (const file of allFiles) {
    const content = fs.readFileSync(file.localPath);
    process.stdout.write(`  Uploading ${file.storagePath}...`);

    const ok = await uploadFile(supabaseUrl, serviceRoleKey, bucket, file.storagePath, content);
    if (ok) {
      uploaded++;
      console.log(` done (${(content.length / 1024).toFixed(1)}KB)`);
    } else {
      failed++;
    }
  }

  console.log(`\nComplete: ${uploaded} uploaded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal error:', err.message || err);
  process.exit(1);
});
