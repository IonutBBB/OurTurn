/**
 * Sound Identification — describe a sound, patient picks the answer.
 * Since we can't bundle real audio files easily, we use emoji + text description
 * as a "what makes this sound?" quiz.
 */

import type { DifficultyLevel } from '@ourturn/shared';

export interface SoundIdContent {
  soundDescriptionKey: string;
  emoji: string;
  options: { labelKey: string; emoji: string }[];
  correctIndex: number;
}

const gentle: SoundIdContent[] = [
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.woof',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.dog', emoji: '🐕' },
      { labelKey: 'patientApp.stim.soundId.answers.cat', emoji: '🐈' },
      { labelKey: 'patientApp.stim.soundId.answers.bird', emoji: '🐦' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.meow',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.horse', emoji: '🐴' },
      { labelKey: 'patientApp.stim.soundId.answers.cat', emoji: '🐈' },
      { labelKey: 'patientApp.stim.soundId.answers.cow', emoji: '🐄' },
    ],
    correctIndex: 1,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.ringRing',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.television', emoji: '📺' },
      { labelKey: 'patientApp.stim.soundId.answers.radio', emoji: '📻' },
      { labelKey: 'patientApp.stim.soundId.answers.telephone', emoji: '📞' },
    ],
    correctIndex: 2,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.tickTock',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.clock', emoji: '⏰' },
      { labelKey: 'patientApp.stim.soundId.answers.bell', emoji: '🔔' },
      { labelKey: 'patientApp.stim.soundId.answers.drum', emoji: '🥁' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.whistleKettle',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.kettle', emoji: '🫖' },
      { labelKey: 'patientApp.stim.soundId.answers.microwave', emoji: '🔲' },
      { labelKey: 'patientApp.stim.soundId.answers.doorbell', emoji: '🚪' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.cockadoodledoo',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.duck', emoji: '🦆' },
      { labelKey: 'patientApp.stim.soundId.answers.rooster', emoji: '🐓' },
      { labelKey: 'patientApp.stim.soundId.answers.owl', emoji: '🦉' },
    ],
    correctIndex: 1,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.dingDong',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.doorbell', emoji: '🚪' },
      { labelKey: 'patientApp.stim.soundId.answers.telephone', emoji: '📞' },
      { labelKey: 'patientApp.stim.soundId.answers.alarm', emoji: '🚨' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.moo',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.sheep', emoji: '🐑' },
      { labelKey: 'patientApp.stim.soundId.answers.pig', emoji: '🐷' },
      { labelKey: 'patientApp.stim.soundId.answers.cow', emoji: '🐄' },
    ],
    correctIndex: 2,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.splashSplash',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.rain', emoji: '🌧️' },
      { labelKey: 'patientApp.stim.soundId.answers.wind', emoji: '💨' },
      { labelKey: 'patientApp.stim.soundId.answers.thunder', emoji: '⛈️' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.choochoo',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.car', emoji: '🚗' },
      { labelKey: 'patientApp.stim.soundId.answers.train', emoji: '🚂' },
      { labelKey: 'patientApp.stim.soundId.answers.aeroplane', emoji: '✈️' },
    ],
    correctIndex: 1,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.tweetTweet',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.bird', emoji: '🐦' },
      { labelKey: 'patientApp.stim.soundId.answers.frog', emoji: '🐸' },
      { labelKey: 'patientApp.stim.soundId.answers.cricket', emoji: '🦗' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.neenaw',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.fireTruck', emoji: '🚒' },
      { labelKey: 'patientApp.stim.soundId.answers.bicycle', emoji: '🚲' },
      { labelKey: 'patientApp.stim.soundId.answers.bus', emoji: '🚌' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.baaaBaaa',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.goat', emoji: '🐐' },
      { labelKey: 'patientApp.stim.soundId.answers.sheep', emoji: '🐑' },
      { labelKey: 'patientApp.stim.soundId.answers.pig', emoji: '🐷' },
    ],
    correctIndex: 1,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.whoosh',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.wind', emoji: '💨' },
      { labelKey: 'patientApp.stim.soundId.answers.sea', emoji: '🌊' },
      { labelKey: 'patientApp.stim.soundId.answers.river', emoji: '🏞️' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.ribbit',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.snake', emoji: '🐍' },
      { labelKey: 'patientApp.stim.soundId.answers.frog', emoji: '🐸' },
      { labelKey: 'patientApp.stim.soundId.answers.fish', emoji: '🐟' },
    ],
    correctIndex: 1,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.crunchCrunch',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.eatingApple', emoji: '🍎' },
      { labelKey: 'patientApp.stim.soundId.answers.drinkingWater', emoji: '💧' },
      { labelKey: 'patientApp.stim.soundId.answers.blowingNose', emoji: '🤧' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.clangClang',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.churchBell', emoji: '⛪' },
      { labelKey: 'patientApp.stim.soundId.answers.clock', emoji: '⏰' },
      { labelKey: 'patientApp.stim.soundId.answers.whistle', emoji: '📯' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.buzzBuzz',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.bee', emoji: '🐝' },
      { labelKey: 'patientApp.stim.soundId.answers.butterfly', emoji: '🦋' },
      { labelKey: 'patientApp.stim.soundId.answers.ladybird', emoji: '🐞' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.oinkOink',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.pig', emoji: '🐷' },
      { labelKey: 'patientApp.stim.soundId.answers.dog', emoji: '🐕' },
      { labelKey: 'patientApp.stim.soundId.answers.horse', emoji: '🐴' },
    ],
    correctIndex: 0,
  },
  {
    soundDescriptionKey: 'patientApp.stim.soundId.sounds.hootHoot',
    emoji: '🔊',
    options: [
      { labelKey: 'patientApp.stim.soundId.answers.pigeon', emoji: '🕊️' },
      { labelKey: 'patientApp.stim.soundId.answers.eagle', emoji: '🦅' },
      { labelKey: 'patientApp.stim.soundId.answers.owl', emoji: '🦉' },
    ],
    correctIndex: 2,
  },
];

const moderate = gentle;
const challenging = gentle;

export const SOUND_ID_CONTENT: Record<DifficultyLevel, SoundIdContent[]> = {
  gentle,
  moderate,
  challenging,
};
