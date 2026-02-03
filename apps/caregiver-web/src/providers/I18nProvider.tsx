'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // i18n is already initialized in the import
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    // Show nothing while i18n initializes (prevents hydration mismatch)
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
