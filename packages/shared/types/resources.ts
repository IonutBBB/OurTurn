// Resources tab types and constants

// ============================================================
// Journey Step types
// ============================================================

export type JourneyStepStatus = 'not_started' | 'in_progress' | 'completed';

export interface JourneyStepDefinition {
  slug: string;
  emoji: string;
  titleKey: string;
  subtitleKey: string;
  contentKey: string;
  checklistKeys: string[];
  timeEstimate: string;
  order: number;
}

export interface JourneyProgress {
  id: string;
  caregiver_id: string;
  household_id: string;
  step_slug: string;
  status: JourneyStepStatus;
  checklist_state: boolean[];
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JourneyProgressInsert {
  caregiver_id: string;
  household_id: string;
  step_slug: string;
  status?: JourneyStepStatus;
  checklist_state?: boolean[];
  notes?: string;
  completed_at?: string;
}

// ============================================================
// Article types
// ============================================================

export type ArticleCategory =
  | 'communication'
  | 'behaviors'
  | 'daily_living'
  | 'self_care'
  | 'safety';

export interface ArticleDefinition {
  slug: string;
  emoji: string;
  titleKey: string;
  summaryKey: string;
  contentKey: string;
  category: ArticleCategory;
  readingTimeMinutes: number;
  order: number;
}

// ============================================================
// Local Support types
// ============================================================

export type LocalSupportCategory =
  | 'helpline'
  | 'organization'
  | 'government'
  | 'respite'
  | 'financial';

export interface LocalSupportOrganization {
  id: string;
  country_code: string;
  category: LocalSupportCategory;
  name: string;
  description: string | null;
  phone: string | null;
  website_url: string | null;
  email: string | null;
  is_24_7: boolean;
  language: string;
  sort_order: number;
  created_at: string;
}

// ============================================================
// Constants
// ============================================================

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  'communication',
  'behaviors',
  'daily_living',
  'self_care',
  'safety',
];

export const JOURNEY_STEPS: JourneyStepDefinition[] = [
  {
    slug: 'understand-diagnosis',
    emoji: '🔍',
    titleKey: 'journey.steps.understandDiagnosis.title',
    subtitleKey: 'journey.steps.understandDiagnosis.subtitle',
    contentKey: 'journey.steps.understandDiagnosis.content',
    checklistKeys: [
      'journey.steps.understandDiagnosis.checklist.0',
      'journey.steps.understandDiagnosis.checklist.1',
      'journey.steps.understandDiagnosis.checklist.2',
    ],
    timeEstimate: '3 min',
    order: 1,
  },
  {
    slug: 'build-care-team',
    emoji: '🤝',
    titleKey: 'journey.steps.buildCareTeam.title',
    subtitleKey: 'journey.steps.buildCareTeam.subtitle',
    contentKey: 'journey.steps.buildCareTeam.content',
    checklistKeys: [
      'journey.steps.buildCareTeam.checklist.0',
      'journey.steps.buildCareTeam.checklist.1',
      'journey.steps.buildCareTeam.checklist.2',
    ],
    timeEstimate: '4 min',
    order: 2,
  },
  {
    slug: 'legal-financial',
    emoji: '📋',
    titleKey: 'journey.steps.legalFinancial.title',
    subtitleKey: 'journey.steps.legalFinancial.subtitle',
    contentKey: 'journey.steps.legalFinancial.content',
    checklistKeys: [
      'journey.steps.legalFinancial.checklist.0',
      'journey.steps.legalFinancial.checklist.1',
      'journey.steps.legalFinancial.checklist.2',
    ],
    timeEstimate: '4 min',
    order: 3,
  },
  {
    slug: 'home-safety',
    emoji: '🏠',
    titleKey: 'journey.steps.homeSafety.title',
    subtitleKey: 'journey.steps.homeSafety.subtitle',
    contentKey: 'journey.steps.homeSafety.content',
    checklistKeys: [
      'journey.steps.homeSafety.checklist.0',
      'journey.steps.homeSafety.checklist.1',
      'journey.steps.homeSafety.checklist.2',
    ],
    timeEstimate: '3 min',
    order: 4,
  },
  {
    slug: 'daily-routines',
    emoji: '📅',
    titleKey: 'journey.steps.dailyRoutines.title',
    subtitleKey: 'journey.steps.dailyRoutines.subtitle',
    contentKey: 'journey.steps.dailyRoutines.content',
    checklistKeys: [
      'journey.steps.dailyRoutines.checklist.0',
      'journey.steps.dailyRoutines.checklist.1',
      'journey.steps.dailyRoutines.checklist.2',
    ],
    timeEstimate: '3 min',
    order: 5,
  },
  {
    slug: 'communication-strategies',
    emoji: '💬',
    titleKey: 'journey.steps.communicationStrategies.title',
    subtitleKey: 'journey.steps.communicationStrategies.subtitle',
    contentKey: 'journey.steps.communicationStrategies.content',
    checklistKeys: [
      'journey.steps.communicationStrategies.checklist.0',
      'journey.steps.communicationStrategies.checklist.1',
      'journey.steps.communicationStrategies.checklist.2',
    ],
    timeEstimate: '3 min',
    order: 6,
  },
  {
    slug: 'self-care',
    emoji: '💚',
    titleKey: 'journey.steps.selfCare.title',
    subtitleKey: 'journey.steps.selfCare.subtitle',
    contentKey: 'journey.steps.selfCare.content',
    checklistKeys: [
      'journey.steps.selfCare.checklist.0',
      'journey.steps.selfCare.checklist.1',
      'journey.steps.selfCare.checklist.2',
    ],
    timeEstimate: '4 min',
    order: 7,
  },
  {
    slug: 'long-term-planning',
    emoji: '🗺️',
    titleKey: 'journey.steps.longTermPlanning.title',
    subtitleKey: 'journey.steps.longTermPlanning.subtitle',
    contentKey: 'journey.steps.longTermPlanning.content',
    checklistKeys: [
      'journey.steps.longTermPlanning.checklist.0',
      'journey.steps.longTermPlanning.checklist.1',
      'journey.steps.longTermPlanning.checklist.2',
    ],
    timeEstimate: '4 min',
    order: 8,
  },
];

export const ARTICLES: ArticleDefinition[] = [
  {
    slug: 'talking-with-empathy',
    emoji: '🗣️',
    titleKey: 'articles.talkingWithEmpathy.title',
    summaryKey: 'articles.talkingWithEmpathy.summary',
    contentKey: 'articles.talkingWithEmpathy.content',
    category: 'communication',
    readingTimeMinutes: 3,
    order: 1,
  },
  {
    slug: 'validation-over-correction',
    emoji: '💛',
    titleKey: 'articles.validationOverCorrection.title',
    summaryKey: 'articles.validationOverCorrection.summary',
    contentKey: 'articles.validationOverCorrection.content',
    category: 'communication',
    readingTimeMinutes: 3,
    order: 2,
  },
  {
    slug: 'nonverbal-connection',
    emoji: '🤲',
    titleKey: 'articles.nonverbalConnection.title',
    summaryKey: 'articles.nonverbalConnection.summary',
    contentKey: 'articles.nonverbalConnection.content',
    category: 'communication',
    readingTimeMinutes: 4,
    order: 3,
  },
  {
    slug: 'understanding-agitation',
    emoji: '🌊',
    titleKey: 'articles.understandingAgitation.title',
    summaryKey: 'articles.understandingAgitation.summary',
    contentKey: 'articles.understandingAgitation.content',
    category: 'behaviors',
    readingTimeMinutes: 3,
    order: 4,
  },
  {
    slug: 'sundowning-strategies',
    emoji: '🌅',
    titleKey: 'articles.sundowningStrategies.title',
    summaryKey: 'articles.sundowningStrategies.summary',
    contentKey: 'articles.sundowningStrategies.content',
    category: 'behaviors',
    readingTimeMinutes: 4,
    order: 5,
  },
  {
    slug: 'repetitive-behaviors',
    emoji: '🔄',
    titleKey: 'articles.repetitiveBehaviors.title',
    summaryKey: 'articles.repetitiveBehaviors.summary',
    contentKey: 'articles.repetitiveBehaviors.content',
    category: 'behaviors',
    readingTimeMinutes: 3,
    order: 6,
  },
  {
    slug: 'mealtime-tips',
    emoji: '🍽️',
    titleKey: 'articles.mealtimeTips.title',
    summaryKey: 'articles.mealtimeTips.summary',
    contentKey: 'articles.mealtimeTips.content',
    category: 'daily_living',
    readingTimeMinutes: 3,
    order: 7,
  },
  {
    slug: 'bathing-dressing',
    emoji: '🚿',
    titleKey: 'articles.bathingDressing.title',
    summaryKey: 'articles.bathingDressing.summary',
    contentKey: 'articles.bathingDressing.content',
    category: 'daily_living',
    readingTimeMinutes: 3,
    order: 8,
  },
  {
    slug: 'sleep-wellness',
    emoji: '😴',
    titleKey: 'articles.sleepWellness.title',
    summaryKey: 'articles.sleepWellness.summary',
    contentKey: 'articles.sleepWellness.content',
    category: 'daily_living',
    readingTimeMinutes: 4,
    order: 9,
  },
  {
    slug: 'caregiver-burnout',
    emoji: '🔥',
    titleKey: 'articles.caregiverBurnout.title',
    summaryKey: 'articles.caregiverBurnout.summary',
    contentKey: 'articles.caregiverBurnout.content',
    category: 'self_care',
    readingTimeMinutes: 3,
    order: 10,
  },
  {
    slug: 'asking-for-help',
    emoji: '🙋',
    titleKey: 'articles.askingForHelp.title',
    summaryKey: 'articles.askingForHelp.summary',
    contentKey: 'articles.askingForHelp.content',
    category: 'self_care',
    readingTimeMinutes: 3,
    order: 11,
  },
  {
    slug: 'emotional-resilience',
    emoji: '🌱',
    titleKey: 'articles.emotionalResilience.title',
    summaryKey: 'articles.emotionalResilience.summary',
    contentKey: 'articles.emotionalResilience.content',
    category: 'self_care',
    readingTimeMinutes: 4,
    order: 12,
  },
  {
    slug: 'wandering-prevention',
    emoji: '🚪',
    titleKey: 'articles.wanderingPrevention.title',
    summaryKey: 'articles.wanderingPrevention.summary',
    contentKey: 'articles.wanderingPrevention.content',
    category: 'safety',
    readingTimeMinutes: 3,
    order: 13,
  },
  {
    slug: 'fall-prevention',
    emoji: '⚠️',
    titleKey: 'articles.fallPrevention.title',
    summaryKey: 'articles.fallPrevention.summary',
    contentKey: 'articles.fallPrevention.content',
    category: 'safety',
    readingTimeMinutes: 4,
    order: 14,
  },
];
