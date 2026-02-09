/**
 * Generates activity prompts from patient biography data and static i18n keys.
 * Used by the Activities tab to create personalized reminiscence, movement,
 * and creative activity prompts.
 */

import type { PatientBiography } from '@ourturn/shared';

export interface ActivityPrompt {
  type: 'reminiscence' | 'music' | 'movement' | 'creative';
  promptKey?: string; // i18n key for static prompts
  promptText?: string; // dynamic text from biography
  photoUrl?: string; // optional photo
  personName?: string; // for important_people prompts
  personRelationship?: string;
}

/**
 * Build reminiscence prompts from biography data (key_events, important_people,
 * childhood_location, career, hobbies).
 */
export function getReminiscencePrompts(
  biography: PatientBiography | null | undefined,
  photos: string[] | null | undefined
): ActivityPrompt[] {
  const prompts: ActivityPrompt[] = [];

  if (!biography) return prompts;

  // Key events
  if (biography.key_events) {
    for (const event of biography.key_events) {
      if (event.description) {
        const yearSuffix = event.year ? ` (${event.year})` : '';
        prompts.push({
          type: 'reminiscence',
          promptKey: 'patientApp.activities.remember.eventPrompt',
          promptText: `${event.description}${yearSuffix}`,
        });
      }
    }
  }

  // Important people
  if (biography.important_people) {
    for (const person of biography.important_people) {
      if (person.name) {
        prompts.push({
          type: 'reminiscence',
          promptKey: 'patientApp.activities.remember.personPrompt',
          personName: person.name,
          personRelationship: person.relationship,
        });
      }
    }
  }

  // Childhood location
  if (biography.childhood_location) {
    prompts.push({
      type: 'reminiscence',
      promptKey: 'patientApp.activities.remember.childhoodPrompt',
      promptText: biography.childhood_location,
    });
  }

  // Career
  if (biography.career) {
    prompts.push({
      type: 'reminiscence',
      promptKey: 'patientApp.activities.remember.careerPrompt',
      promptText: biography.career,
    });
  }

  // Hobbies
  if (biography.hobbies) {
    for (const hobby of biography.hobbies) {
      prompts.push({
        type: 'reminiscence',
        promptKey: 'patientApp.activities.remember.hobbyPrompt',
        promptText: hobby,
      });
    }
  }

  // Photos — add them to random prompts or create standalone photo prompts
  if (photos && photos.length > 0) {
    for (const photoUrl of photos) {
      prompts.push({
        type: 'reminiscence',
        promptKey: 'patientApp.activities.remember.photoPrompt',
        photoUrl,
      });
    }
  }

  return prompts;
}

/**
 * Get music items from biography.
 */
export function getMusicItems(
  biography: PatientBiography | null | undefined
): string[] {
  return biography?.favorite_music || [];
}

/**
 * Static gentle movement prompt i18n keys.
 */
export function getMovementPromptKeys(): string[] {
  return [
    'patientApp.activities.move.prompt1',
    'patientApp.activities.move.prompt2',
    'patientApp.activities.move.prompt3',
    'patientApp.activities.move.prompt4',
    'patientApp.activities.move.prompt5',
  ];
}

/**
 * Static creative prompt i18n keys.
 */
export function getCreativePromptKeys(): string[] {
  return [
    'patientApp.activities.create.prompt1',
    'patientApp.activities.create.prompt2',
    'patientApp.activities.create.prompt3',
    'patientApp.activities.create.prompt4',
  ];
}
