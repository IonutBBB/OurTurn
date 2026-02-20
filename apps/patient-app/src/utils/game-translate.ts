/**
 * Translation helper for mind game labels.
 *
 * Games like odd-one-out, category-sort, etc. have short English labels
 * ("Apple", "Dog", "Frying Pan") stored in their data files. This helper
 * translates them via the `patientApp.stim.gameLabels` dictionary in
 * the locale files.
 *
 * Usage in a renderer:
 *   const gl = useGameLabel();
 *   <Text>{gl(item.label)}</Text>
 */
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/** Sanitise an English label into the i18n key used in gameLabels. */
export function labelToKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Returns a `gl()` function that translates a game label string.
 * Falls back to the original English label if no translation exists.
 */
export function useGameLabel() {
  const { t } = useTranslation();

  return useCallback(
    (label: string): string => {
      const key = `patientApp.stim.gameLabels.${labelToKey(label)}`;
      const translated = t(key, { defaultValue: label });
      return translated;
    },
    [t],
  );
}
