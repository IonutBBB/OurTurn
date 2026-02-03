// Emergency Numbers by Country

export interface EmergencyNumber {
  primary: string;
  secondary?: string;
  label: string;
}

export const EMERGENCY_NUMBERS: Record<string, EmergencyNumber> = {
  // Europe
  GB: { primary: '999', secondary: '111', label: 'Emergency' },
  DE: { primary: '112', label: 'Notruf' },
  FR: { primary: '112', secondary: '15', label: 'Urgences' },
  IT: { primary: '112', label: 'Emergenza' },
  ES: { primary: '112', label: 'Emergencia' },
  PT: { primary: '112', label: 'Emergência' },
  NL: { primary: '112', label: 'Noodgeval' },
  PL: { primary: '112', label: 'Pogotowie' },
  RO: { primary: '112', label: 'Urgență' },
  AT: { primary: '112', label: 'Notruf' },
  CH: { primary: '112', secondary: '144', label: 'Notfall' },
  BE: { primary: '112', label: 'Noodoproep' },
  SE: { primary: '112', label: 'Nödsamtal' },
  NO: { primary: '113', label: 'Nødnummer' },
  DK: { primary: '112', label: 'Nødopkald' },
  FI: { primary: '112', label: 'Hätänumero' },
  IE: { primary: '999', secondary: '112', label: 'Emergency' },
  GR: { primary: '112', label: 'Έκτακτη Ανάγκη' },
  CZ: { primary: '112', label: 'Tísňové volání' },
  HU: { primary: '112', label: 'Segélyhívó' },
  SK: { primary: '112', label: 'Tiesňové volanie' },
  HR: { primary: '112', label: 'Hitna pomoć' },
  SI: { primary: '112', label: 'Nujna pomoč' },
  BG: { primary: '112', label: 'Спешна помощ' },
  LT: { primary: '112', label: 'Pagalbos telefonas' },
  LV: { primary: '112', label: 'Ārkārtas palīdzība' },
  EE: { primary: '112', label: 'Hädaabi' },

  // North America
  US: { primary: '911', label: 'Emergency' },
  CA: { primary: '911', label: 'Emergency' },
  MX: { primary: '911', label: 'Emergencia' },

  // South America
  BR: { primary: '192', secondary: '190', label: 'Emergência' },
  AR: { primary: '107', secondary: '911', label: 'Emergencia' },
  CL: { primary: '131', label: 'Emergencia' },
  CO: { primary: '123', label: 'Emergencia' },
  PE: { primary: '105', label: 'Emergencia' },

  // Asia Pacific
  JP: { primary: '119', secondary: '110', label: '緊急' },
  KR: { primary: '119', label: '긴급' },
  CN: { primary: '120', secondary: '110', label: '急救' },
  IN: { primary: '112', label: 'Emergency' },
  AU: { primary: '000', label: 'Emergency' },
  NZ: { primary: '111', label: 'Emergency' },
  SG: { primary: '995', label: 'Emergency' },
  HK: { primary: '999', label: 'Emergency' },
  TW: { primary: '119', label: '緊急' },
  TH: { primary: '1669', label: 'ฉุกเฉิน' },
  MY: { primary: '999', label: 'Emergency' },
  PH: { primary: '911', label: 'Emergency' },
  ID: { primary: '118', secondary: '119', label: 'Darurat' },
  VN: { primary: '115', label: 'Cấp cứu' },

  // Middle East
  IL: { primary: '101', label: 'חירום' },
  AE: { primary: '999', label: 'Emergency' },
  SA: { primary: '997', label: 'طوارئ' },
  TR: { primary: '112', label: 'Acil' },

  // Africa
  ZA: { primary: '10111', secondary: '10177', label: 'Emergency' },
  EG: { primary: '123', label: 'طوارئ' },
  NG: { primary: '112', label: 'Emergency' },
  KE: { primary: '999', label: 'Emergency' },

  // Default (112 is the most widely used)
  default: { primary: '112', label: 'Emergency' },
};

/**
 * Get emergency number for a country
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'DE')
 * @returns Emergency number info
 */
export function getEmergencyNumber(countryCode: string): EmergencyNumber {
  const upperCode = countryCode?.toUpperCase();
  return EMERGENCY_NUMBERS[upperCode] || EMERGENCY_NUMBERS.default;
}

/**
 * Get the primary emergency number for a country
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Primary emergency number string
 */
export function getPrimaryEmergencyNumber(countryCode: string): string {
  return getEmergencyNumber(countryCode).primary;
}
