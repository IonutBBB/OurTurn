/**
 * Medication names to scan for in AI output.
 * If the AI mentions any of these, the response is flagged.
 */

const DEMENTIA_MEDICATIONS = [
  'donepezil', 'aricept',
  'memantine', 'namenda', 'ebixa',
  'rivastigmine', 'exelon',
  'galantamine', 'razadyne', 'reminyl',
  'lecanemab', 'leqembi',
  'aducanumab', 'aduhelm',
  'donanemab',
];

const PSYCHIATRIC_MEDICATIONS = [
  'haloperidol', 'haldol',
  'risperidone', 'risperdal',
  'quetiapine', 'seroquel',
  'olanzapine', 'zyprexa',
  'aripiprazole', 'abilify',
  'lorazepam', 'ativan',
  'diazepam', 'valium',
  'alprazolam', 'xanax',
  'clonazepam', 'klonopin',
  'sertraline', 'zoloft',
  'citalopram', 'celexa',
  'escitalopram', 'lexapro',
  'fluoxetine', 'prozac',
  'paroxetine', 'paxil',
  'venlafaxine', 'effexor',
  'duloxetine', 'cymbalta',
  'mirtazapine', 'remeron',
  'trazodone', 'desyrel',
];

const SLEEP_AND_OTC = [
  'melatonin',
  'zolpidem', 'ambien',
  'eszopiclone', 'lunesta',
  'diphenhydramine', 'benadryl',
  'doxylamine',
  'ibuprofen', 'advil', 'motrin',
  'acetaminophen', 'tylenol', 'paracetamol',
  'aspirin',
  'naproxen', 'aleve',
];

const SUPPLEMENTS = [
  'ginkgo biloba',
  'omega-3',
  'vitamin e supplement',
  'coconut oil treatment',
  'turmeric supplement',
  'curcumin supplement',
  'phosphatidylserine',
  'huperzine',
];

const DRUG_CLASS_TERMS = [
  'cholinesterase inhibitor',
  'nmda antagonist',
  'antipsychotic',
  'benzodiazepine',
  'ssri',
  'snri',
  'sedative',
  'anxiolytic',
  'neuroleptic',
];

const ALL_MEDICATION_TERMS = [
  ...DEMENTIA_MEDICATIONS,
  ...PSYCHIATRIC_MEDICATIONS,
  ...SLEEP_AND_OTC,
  ...SUPPLEMENTS,
  ...DRUG_CLASS_TERMS,
];

/**
 * Scans text for any medication name mentions.
 * Returns an array of found medication terms.
 */
export function scanForMedications(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const term of ALL_MEDICATION_TERMS) {
    // Word boundary check: ensure the term isn't part of a larger word
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lower)) {
      found.push(term);
    }
  }

  return found;
}
