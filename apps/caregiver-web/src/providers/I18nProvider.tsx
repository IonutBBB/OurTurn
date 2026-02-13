'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { createBrowserClient } from '@/lib/supabase';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
    syncLanguageFromHousehold();
  }, []);

  // Keep <html lang="..."> in sync with the current i18n language
  useEffect(() => {
    if (!isInitialized) return;

    const updateHtmlLang = (lang: string) => {
      document.documentElement.lang = lang;
    };

    // Set initial value
    updateHtmlLang(i18n.language);

    // Listen for language changes
    i18n.on('languageChanged', updateHtmlLang);
    return () => {
      i18n.off('languageChanged', updateHtmlLang);
    };
  }, [isInitialized]);

  if (!isInitialized) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

/**
 * On app load, read the household's saved language from Supabase
 * and apply it if it differs from the current i18n language.
 * This ensures the user's language preference persists across
 * sessions, devices, and cleared localStorage.
 */
async function syncLanguageFromHousehold() {
  try {
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Not logged in — nothing to sync

    const { data: caregiver } = await supabase
      .from('caregivers')
      .select('household_id')
      .eq('id', user.id)
      .single();

    if (!caregiver?.household_id) return; // No household yet (onboarding)

    const { data: household } = await supabase
      .from('households')
      .select('language')
      .eq('id', caregiver.household_id)
      .single();

    const savedLang = household?.language;
    if (savedLang && savedLang !== i18n.language) {
      await i18n.changeLanguage(savedLang);
    }
  } catch {
    // Silently fail — fallback language (English or localStorage) is fine
  }
}
