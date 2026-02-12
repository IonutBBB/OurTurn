// Maps onboarding country values to ISO 3166-1 alpha-2 codes
// Onboarding stores inconsistent values (e.g. 'UK', 'Germany', 'US')
// Local support directory uses ISO codes (e.g. 'GB', 'DE', 'US')

const COUNTRY_CODE_MAP: Record<string, string> = {
  // English names → ISO (all EU member states + major non-EU)
  'Austria': 'AT',
  'Belgium': 'BE',
  'Bulgaria': 'BG',
  'Croatia': 'HR',
  'Cyprus': 'CY',
  'Czech Republic': 'CZ',
  'Denmark': 'DK',
  'Estonia': 'EE',
  'Finland': 'FI',
  'France': 'FR',
  'Germany': 'DE',
  'Greece': 'GR',
  'Hungary': 'HU',
  'Ireland': 'IE',
  'Italy': 'IT',
  'Latvia': 'LV',
  'Lithuania': 'LT',
  'Luxembourg': 'LU',
  'Malta': 'MT',
  'Netherlands': 'NL',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Romania': 'RO',
  'Slovakia': 'SK',
  'Slovenia': 'SI',
  'Spain': 'ES',
  'Sweden': 'SE',
  // Non-EU
  'United Kingdom': 'GB',
  'UK': 'GB',
  'England': 'GB',
  'Switzerland': 'CH',
  'Norway': 'NO',
  'United States': 'US',
  'USA': 'US',
  'Canada': 'CA',
  'Australia': 'AU',
  'New Zealand': 'NZ',
  'India': 'IN',
  'Japan': 'JP',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'South Korea': 'KR',
  // ISO codes map to themselves
  'AT': 'AT', 'BE': 'BE', 'BG': 'BG', 'HR': 'HR', 'CY': 'CY',
  'CZ': 'CZ', 'DK': 'DK', 'EE': 'EE', 'FI': 'FI', 'FR': 'FR',
  'DE': 'DE', 'GR': 'GR', 'HU': 'HU', 'IE': 'IE', 'IT': 'IT',
  'LV': 'LV', 'LT': 'LT', 'LU': 'LU', 'MT': 'MT', 'NL': 'NL',
  'PL': 'PL', 'PT': 'PT', 'RO': 'RO', 'SK': 'SK', 'SI': 'SI',
  'ES': 'ES', 'SE': 'SE', 'GB': 'GB', 'CH': 'CH', 'NO': 'NO',
  'US': 'US', 'CA': 'CA', 'AU': 'AU', 'NZ': 'NZ', 'IN': 'IN',
  'JP': 'JP', 'BR': 'BR', 'MX': 'MX', 'KR': 'KR',
};

export function toISOCountryCode(country: string | null | undefined): string | null {
  if (!country) return null;
  return COUNTRY_CODE_MAP[country] ?? COUNTRY_CODE_MAP[country.toUpperCase()] ?? null;
}
