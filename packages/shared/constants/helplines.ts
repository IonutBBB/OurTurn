// Alzheimer's / Dementia Helpline Numbers by Country

export interface HelplineInfo {
  name: string;
  phone: string;
  website?: string;
}

export const DEMENTIA_HELPLINES: Record<string, HelplineInfo[]> = {
  // North America
  US: [
    { name: 'Alzheimer\'s Association 24/7 Helpline', phone: '1-800-272-3900', website: 'https://www.alz.org' },
    { name: 'Crisis Text Line', phone: 'Text HOME to 741741' },
  ],
  CA: [
    { name: 'Alzheimer Society of Canada', phone: '1-855-705-4636', website: 'https://alzheimer.ca' },
  ],

  // Europe
  GB: [
    { name: 'Alzheimer\'s Society Helpline', phone: '0333 150 3456', website: 'https://www.alzheimers.org.uk' },
    { name: 'Dementia UK Admiral Nurse Line', phone: '0800 888 6678' },
  ],
  DE: [
    { name: 'Deutsche Alzheimer Gesellschaft', phone: '030 259 37 95 14', website: 'https://www.deutsche-alzheimer.de' },
  ],
  FR: [
    { name: 'France Alzheimer', phone: '0 811 112 112', website: 'https://www.francealzheimer.org' },
  ],
  IT: [
    { name: 'Alzheimer Italia', phone: '02 809767', website: 'https://www.alzheimer.it' },
  ],
  ES: [
    { name: 'Confederación Española de Alzheimer', phone: '900 174 777', website: 'https://www.ceafa.es' },
  ],
  NL: [
    { name: 'Alzheimer Nederland', phone: '0800 5088', website: 'https://www.alzheimer-nederland.nl' },
  ],
  IE: [
    { name: 'The Alzheimer Society of Ireland', phone: '1800 341 341', website: 'https://alzheimer.ie' },
  ],
  AT: [
    { name: 'Alzheimer Austria', phone: '01 332 51 66', website: 'https://www.alzheimer-gesellschaft.at' },
  ],
  CH: [
    { name: 'Alzheimer Schweiz', phone: '058 058 80 00', website: 'https://www.alzheimer-schweiz.ch' },
  ],
  SE: [
    { name: 'Demensförbundet', phone: '08-658 99 20', website: 'https://www.demensforbundet.se' },
  ],
  RO: [
    { name: 'Asociația Alzheimer România', phone: '021 312 4090' },
  ],

  // Asia Pacific
  AU: [
    { name: 'Dementia Australia Helpline', phone: '1800 100 500', website: 'https://www.dementia.org.au' },
  ],
  NZ: [
    { name: 'Alzheimers New Zealand', phone: '0800 004 001', website: 'https://alzheimers.org.nz' },
  ],
  JP: [
    { name: '認知症の電話相談', phone: '0120-294-456' },
  ],
  IN: [
    { name: 'Alzheimer\'s & Related Disorders Society of India', phone: '+91-484-2665871', website: 'https://www.ardsi.org' },
  ],
  SG: [
    { name: 'Dementia Singapore', phone: '6377 0700', website: 'https://dementia.org.sg' },
  ],

  // Africa
  ZA: [
    { name: 'Alzheimer\'s South Africa', phone: '0860 102 681', website: 'https://alzheimers.org.za' },
  ],

  // Default fallback
  default: [
    { name: 'Alzheimer\'s Disease International', phone: '', website: 'https://www.alzint.org/resource/helplines/' },
  ],
};

/**
 * Get helpline info for a country
 */
export function getDementiaHelplines(countryCode: string): HelplineInfo[] {
  const upperCode = countryCode?.toUpperCase();
  return DEMENTIA_HELPLINES[upperCode] || DEMENTIA_HELPLINES.default;
}
