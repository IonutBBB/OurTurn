/**
 * LOCALIZED CRISIS RESOURCES
 * Resources must be maintained and verified quarterly.
 * Resources are displayed based on user's country setting.
 */

export interface CrisisResourceEntry {
  number: string | null;
  label: string;
}

export interface CountryCrisisResources {
  emergency: CrisisResourceEntry;
  crisisLine: CrisisResourceEntry;
  crisisText?: CrisisResourceEntry;
  elderAbuse?: CrisisResourceEntry;
  caregiverSupport: CrisisResourceEntry;
  alzheimerAssociation?: CrisisResourceEntry;
  alzheimerSociety?: CrisisResourceEntry;
  poisonControl?: CrisisResourceEntry;
}

export const CRISIS_RESOURCES: Record<string, CountryCrisisResources> = {
  DE: {
    emergency: { number: '112', label: 'Notruf' },
    crisisLine: { number: '0800 111 0 111', label: 'Telefonseelsorge (24/7, kostenlos)' },
    elderAbuse: { number: '0800 111 0 111', label: 'Telefonseelsorge' },
    caregiverSupport: { number: '030 20179131', label: 'Pflegetelefon (Mo-Do 9-18)' },
    alzheimerAssociation: { number: '030 259 37 95 14', label: 'Deutsche Alzheimer Gesellschaft' },
    poisonControl: { number: '030 19240', label: 'Giftnotruf Berlin' },
  },
  US: {
    emergency: { number: '911', label: 'Emergency Services' },
    crisisLine: { number: '988', label: 'Suicide & Crisis Lifeline (24/7)' },
    crisisText: { number: '741741', label: 'Crisis Text Line (text HOME)' },
    elderAbuse: { number: '1-800-677-1116', label: 'Eldercare Locator' },
    caregiverSupport: { number: '1-800-272-3900', label: "Alzheimer's Association 24/7 Helpline" },
    poisonControl: { number: '1-800-222-1222', label: 'Poison Control' },
  },
  GB: {
    emergency: { number: '999', label: 'Emergency Services' },
    crisisLine: { number: '116 123', label: 'Samaritans (24/7, free)' },
    crisisText: { number: '85258', label: 'Shout Crisis Text Line (text SHOUT)' },
    elderAbuse: { number: '0808 808 8141', label: 'Action on Elder Abuse' },
    caregiverSupport: { number: '0333 150 3456', label: 'Dementia UK Helpline' },
    alzheimerSociety: { number: '0333 150 3456', label: "Alzheimer's Society Helpline" },
  },
  RO: {
    emergency: { number: '112', label: 'Servicii de Urgenta' },
    crisisLine: { number: '0800 801 200', label: 'Telefonul Sufletului (24/7, gratuit)' },
    caregiverSupport: { number: '021 316 0126', label: 'Asociatia Alzheimer Romania' },
  },
  DEFAULT: {
    emergency: { number: '112', label: 'Emergency Services' },
    crisisLine: { number: null, label: 'Contact your local crisis service' },
    caregiverSupport: { number: null, label: "Contact your local Alzheimer's association" },
  },
};

export function getResourcesForCountry(countryCode: string): CountryCrisisResources {
  return CRISIS_RESOURCES[countryCode.toUpperCase()] || CRISIS_RESOURCES.DEFAULT;
}
