// Maps onboarding country values to ISO 3166-1 alpha-2 codes
// Onboarding stores inconsistent values (e.g. 'UK', 'Germany', 'US')
// Local support directory uses ISO codes (e.g. 'GB', 'DE', 'US')

const COUNTRY_CODE_MAP: Record<string, string> = {
  // English names → ISO
  'United Kingdom': 'GB',
  'UK': 'GB',
  'England': 'GB',
  'Germany': 'DE',
  'Austria': 'AT',
  'Switzerland': 'CH',
  'United States': 'US',
  'USA': 'US',
  'France': 'FR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Ireland': 'IE',
  'Canada': 'CA',
  'Australia': 'AU',
  // ISO codes map to themselves
  'GB': 'GB',
  'DE': 'DE',
  'AT': 'AT',
  'CH': 'CH',
  'US': 'US',
  'FR': 'FR',
  'IT': 'IT',
  'ES': 'ES',
  'NL': 'NL',
  'BE': 'BE',
  'IE': 'IE',
  'CA': 'CA',
  'AU': 'AU',
};

export function toISOCountryCode(country: string | null | undefined): string | null {
  if (!country) return null;
  return COUNTRY_CODE_MAP[country] ?? COUNTRY_CODE_MAP[country.toUpperCase()] ?? null;
}
