/**
 * Art Discussion — famous artworks with discussion prompts.
 * Uses emoji representation since we don't bundle actual artwork images.
 */

import type { DifficultyLevel } from '@ourturn/shared';

export interface ArtDiscussionContent {
  titleKey: string;
  artistKey: string;
  descriptionKey: string;
  emoji: string;
  questionKeys: string[];
}

const artworks: ArtDiscussionContent[] = [
  {
    titleKey: 'patientApp.stim.art.works.starryNight.title',
    artistKey: 'patientApp.stim.art.works.starryNight.artist',
    descriptionKey: 'patientApp.stim.art.works.starryNight.description',
    emoji: '🌌',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.howDoesItMakeYouFeel',
      'patientApp.stim.art.questions.doesItRemindYou',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.waterLilies.title',
    artistKey: 'patientApp.stim.art.works.waterLilies.artist',
    descriptionKey: 'patientApp.stim.art.works.waterLilies.description',
    emoji: '🪷',
    questionKeys: [
      'patientApp.stim.art.questions.whatColours',
      'patientApp.stim.art.questions.favouriteGarden',
      'patientApp.stim.art.questions.doesItRemindYou',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.sunflowers.title',
    artistKey: 'patientApp.stim.art.works.sunflowers.artist',
    descriptionKey: 'patientApp.stim.art.works.sunflowers.description',
    emoji: '🌻',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.favouriteFlower',
      'patientApp.stim.art.questions.wouldYouHangIt',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.girlPearl.title',
    artistKey: 'patientApp.stim.art.works.girlPearl.artist',
    descriptionKey: 'patientApp.stim.art.works.girlPearl.description',
    emoji: '👩',
    questionKeys: [
      'patientApp.stim.art.questions.whatIsSheLooking',
      'patientApp.stim.art.questions.howDoesItMakeYouFeel',
      'patientApp.stim.art.questions.whatIsHerStory',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.theScream.title',
    artistKey: 'patientApp.stim.art.works.theScream.artist',
    descriptionKey: 'patientApp.stim.art.works.theScream.description',
    emoji: '😱',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.howDoesItMakeYouFeel',
      'patientApp.stim.art.questions.whatColours',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.greatWave.title',
    artistKey: 'patientApp.stim.art.works.greatWave.artist',
    descriptionKey: 'patientApp.stim.art.works.greatWave.description',
    emoji: '🌊',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.beachMemory',
      'patientApp.stim.art.questions.whatColours',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.monaLisa.title',
    artistKey: 'patientApp.stim.art.works.monaLisa.artist',
    descriptionKey: 'patientApp.stim.art.works.monaLisa.description',
    emoji: '🖼️',
    questionKeys: [
      'patientApp.stim.art.questions.whyIsSheSmiling',
      'patientApp.stim.art.questions.doesItRemindYou',
      'patientApp.stim.art.questions.wouldYouHangIt',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.poppy.title',
    artistKey: 'patientApp.stim.art.works.poppy.artist',
    descriptionKey: 'patientApp.stim.art.works.poppy.description',
    emoji: '🌺',
    questionKeys: [
      'patientApp.stim.art.questions.whatColours',
      'patientApp.stim.art.questions.walkInNature',
      'patientApp.stim.art.questions.howDoesItMakeYouFeel',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.balletDancers.title',
    artistKey: 'patientApp.stim.art.works.balletDancers.artist',
    descriptionKey: 'patientApp.stim.art.works.balletDancers.description',
    emoji: '🩰',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.everDanced',
      'patientApp.stim.art.questions.howDoesItMakeYouFeel',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.nightCafe.title',
    artistKey: 'patientApp.stim.art.works.nightCafe.artist',
    descriptionKey: 'patientApp.stim.art.works.nightCafe.description',
    emoji: '🏪',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.favouriteCafe',
      'patientApp.stim.art.questions.whatColours',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.haystacks.title',
    artistKey: 'patientApp.stim.art.works.haystacks.artist',
    descriptionKey: 'patientApp.stim.art.works.haystacks.description',
    emoji: '🌾',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.countrysideMemory',
      'patientApp.stim.art.questions.whatColours',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.umbrellas.title',
    artistKey: 'patientApp.stim.art.works.umbrellas.artist',
    descriptionKey: 'patientApp.stim.art.works.umbrellas.description',
    emoji: '☂️',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.rainyDayMemory',
      'patientApp.stim.art.questions.whatColours',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.bridge.title',
    artistKey: 'patientApp.stim.art.works.bridge.artist',
    descriptionKey: 'patientApp.stim.art.works.bridge.description',
    emoji: '🌉',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.howDoesItMakeYouFeel',
      'patientApp.stim.art.questions.doesItRemindYou',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.irises.title',
    artistKey: 'patientApp.stim.art.works.irises.artist',
    descriptionKey: 'patientApp.stim.art.works.irises.description',
    emoji: '💜',
    questionKeys: [
      'patientApp.stim.art.questions.whatColours',
      'patientApp.stim.art.questions.favouriteFlower',
      'patientApp.stim.art.questions.howDoesItMakeYouFeel',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.persistence.title',
    artistKey: 'patientApp.stim.art.works.persistence.artist',
    descriptionKey: 'patientApp.stim.art.works.persistence.description',
    emoji: '⏰',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.howDoesItMakeYouFeel',
      'patientApp.stim.art.questions.whatIsHappening',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.luncheon.title',
    artistKey: 'patientApp.stim.art.works.luncheon.artist',
    descriptionKey: 'patientApp.stim.art.works.luncheon.description',
    emoji: '🍽️',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.favouriteMeal',
      'patientApp.stim.art.questions.whatIsHappening',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.boating.title',
    artistKey: 'patientApp.stim.art.works.boating.artist',
    descriptionKey: 'patientApp.stim.art.works.boating.description',
    emoji: '⛵',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.boatingMemory',
      'patientApp.stim.art.questions.howDoesItMakeYouFeel',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.impression.title',
    artistKey: 'patientApp.stim.art.works.impression.artist',
    descriptionKey: 'patientApp.stim.art.works.impression.description',
    emoji: '🌅',
    questionKeys: [
      'patientApp.stim.art.questions.whatColours',
      'patientApp.stim.art.questions.sunriseOrSunset',
      'patientApp.stim.art.questions.howDoesItMakeYouFeel',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.cottages.title',
    artistKey: 'patientApp.stim.art.works.cottages.artist',
    descriptionKey: 'patientApp.stim.art.works.cottages.description',
    emoji: '🏡',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.countrysideMemory',
      'patientApp.stim.art.questions.wouldYouLiveThere',
    ],
  },
  {
    titleKey: 'patientApp.stim.art.works.snowScene.title',
    artistKey: 'patientApp.stim.art.works.snowScene.artist',
    descriptionKey: 'patientApp.stim.art.works.snowScene.description',
    emoji: '❄️',
    questionKeys: [
      'patientApp.stim.art.questions.whatDoYouSee',
      'patientApp.stim.art.questions.winterMemory',
      'patientApp.stim.art.questions.whatColours',
    ],
  },
];

export const ART_DISCUSSION_CONTENT: Record<DifficultyLevel, ArtDiscussionContent[]> = {
  gentle: artworks,
  moderate: artworks,
  challenging: artworks,
};
