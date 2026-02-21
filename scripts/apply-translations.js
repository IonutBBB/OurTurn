#!/usr/bin/env node
/**
 * Generic script to apply gameLabels translations from a JSON file
 * to all 3 locale files for a given language.
 *
 * Usage: node scripts/apply-translations.js <lang> <translations-json-file>
 * Example: node scripts/apply-translations.js de scripts/translations-de.json
 */
const fs = require('fs');
const path = require('path');

const lang = process.argv[2];
const translationsFile = process.argv[3];

if (!lang || !translationsFile) {
  console.error('Usage: node scripts/apply-translations.js <lang> <translations-json-file>');
  process.exit(1);
}

const translations = JSON.parse(fs.readFileSync(translationsFile, 'utf8'));

const files = [
  path.resolve(__dirname, `../apps/patient-app/locales/${lang}.json`),
  path.resolve(__dirname, `../apps/caregiver-app/locales/${lang}.json`),
  path.resolve(__dirname, `../apps/caregiver-web/public/locales/${lang}.json`),
];

let totalUpdated = 0;

for (const filePath of files) {
  console.log(`\nProcessing: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log('  WARNING: File not found, skipping.');
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!data.patientApp?.stim?.gameLabels) {
    console.log('  WARNING: gameLabels section not found, skipping.');
    continue;
  }

  let count = 0;
  const labels = data.patientApp.stim.gameLabels;

  for (const [key, value] of Object.entries(translations)) {
    if (key in labels) {
      labels[key] = value;
      count++;
    } else {
      console.log(`  WARNING: Key "${key}" not found in file.`);
    }
  }

  // Check for any keys we missed
  const missingKeys = Object.keys(labels).filter(k => !(k in translations));
  if (missingKeys.length > 0) {
    console.log(`  WARNING: ${missingKeys.length} keys in file not in translations:`);
    missingKeys.slice(0, 10).forEach(k => console.log(`    - ${k}: "${labels[k]}"`));
    if (missingKeys.length > 10) {
      console.log(`    ... and ${missingKeys.length - 10} more`);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`  Updated ${count} gameLabel entries.`);
  totalUpdated += count;
}

console.log(`\nDone! Total entries updated across all files: ${totalUpdated}`);
console.log(`Translation keys provided: ${Object.keys(translations).length}`);
