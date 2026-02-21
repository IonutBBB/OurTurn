// Subscription feature gating utilities

import type { Household, SubscriptionPlan, SubscriptionStatus } from '../types/household';
import { EU_MEMBER_CODES } from '../constants/languages';

export const PRICING = {
  monthly: { price: '£12.99', interval: 'month' },
  annual: { price: '£99.99', interval: 'year', savingsPercent: 36 },
} as const;

export const FREE_LIMITS = {
  maxTasks: 10,
  maxCaregivers: 1,
  aiMessages: 3,
} as const;

type FeatureKey =
  | 'unlimitedTasks'
  | 'aiCoach'
  | 'brainActivities'
  | 'safeZones'
  | 'multiCaregiver'
  | 'journal'
  | 'insights'
  | 'reports'
  | 'wellbeing'
  | 'priority';

const PLUS_FEATURES: Set<FeatureKey> = new Set([
  'unlimitedTasks',
  'aiCoach',
  'brainActivities',
  'safeZones',
  'multiCaregiver',
  'journal',
  'insights',
  'reports',
  'wellbeing',
  'priority',
]);

/**
 * Check if a household is on the free tier
 */
export function isFreeTier(household: Pick<Household, 'subscription_status'>): boolean {
  return household.subscription_status === 'free' || household.subscription_status === 'cancelled';
}

/**
 * Check if a household has an active paid subscription (including past_due grace period)
 */
export function isPlusTier(household: Pick<Household, 'subscription_status'>): boolean {
  return household.subscription_status === 'plus' || household.subscription_status === 'past_due';
}

/**
 * Check if a household can use a specific feature
 */
export function canUseFeature(
  household: Pick<Household, 'subscription_status'>,
  feature: FeatureKey
): boolean {
  if (!isFreeTier(household)) {
    return true;
  }

  // Free tier can't access plus-only features
  return !PLUS_FEATURES.has(feature);
}

/**
 * Check if a household has reached the free task limit
 */
export function hasReachedTaskLimit(
  household: Pick<Household, 'subscription_status'>,
  currentTaskCount: number
): boolean {
  if (!isFreeTier(household)) {
    return false;
  }

  return currentTaskCount >= FREE_LIMITS.maxTasks;
}

/**
 * Check if a household has reached the free caregiver limit
 */
export function hasReachedCaregiverLimit(
  household: Pick<Household, 'subscription_status'>,
  currentCaregiverCount: number
): boolean {
  if (!isFreeTier(household)) {
    return false;
  }

  return currentCaregiverCount >= FREE_LIMITS.maxCaregivers;
}

/**
 * Check if a household has reached the free AI message limit
 */
export function hasReachedAIMessageLimit(
  household: Pick<Household, 'subscription_status'>,
  currentMessageCount: number
): boolean {
  if (!isFreeTier(household)) {
    return false;
  }

  return currentMessageCount >= FREE_LIMITS.aiMessages;
}

/**
 * Check if a country code belongs to an EU member state.
 * Used for DMA-compliant payment routing (Stripe in EU, RevenueCat elsewhere).
 */
export function isEUCountry(countryCode: string | null | undefined): boolean {
  if (!countryCode) return false;
  return EU_MEMBER_CODES.has(countryCode.toUpperCase());
}
