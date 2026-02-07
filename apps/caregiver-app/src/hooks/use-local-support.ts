import { useState, useEffect } from 'react';
import { supabase } from '@ourturn/supabase';
import { useAuthStore } from '../stores/auth-store';
import { toISOCountryCode } from '../utils/country-code-map';
import type { LocalSupportOrganization, LocalSupportCategory } from '@ourturn/shared';

interface UseLocalSupportResult {
  supportByCategory: Record<string, LocalSupportOrganization[]>;
  isLoading: boolean;
  isEmpty: boolean;
  countryCode: string | null;
}

export function useLocalSupport(): UseLocalSupportResult {
  const { household } = useAuthStore();
  const [supportByCategory, setSupportByCategory] = useState<
    Record<string, LocalSupportOrganization[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const countryCode = toISOCountryCode(household?.country);

  useEffect(() => {
    if (!countryCode) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from('resource_local_support')
        .select('*')
        .eq('country_code', countryCode)
        .order('sort_order');

      if (data) {
        const grouped: Record<string, LocalSupportOrganization[]> = {};
        for (const org of data as LocalSupportOrganization[]) {
          if (!grouped[org.category]) {
            grouped[org.category] = [];
          }
          grouped[org.category].push(org);
        }
        setSupportByCategory(grouped);
      }
      setIsLoading(false);
    };

    load();
  }, [countryCode]);

  const isEmpty = Object.keys(supportByCategory).length === 0 && !isLoading;

  return { supportByCategory, isLoading, isEmpty, countryCode };
}
