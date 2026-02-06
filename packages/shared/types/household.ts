// Household types

export type SubscriptionStatus = 'free' | 'plus' | 'cancelled';
export type SubscriptionPlatform = 'web' | 'ios' | 'android';

export interface Household {
  id: string;
  care_code: string;
  timezone: string;
  language: string;
  country: string | null;
  subscription_status: SubscriptionStatus;
  subscription_platform: SubscriptionPlatform | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface HouseholdInsert {
  timezone?: string;
  language?: string;
  country?: string;
}

export interface HouseholdUpdate {
  timezone?: string;
  language?: string;
  country?: string;
  subscription_status?: SubscriptionStatus;
  subscription_platform?: SubscriptionPlatform;
  stripe_customer_id?: string;
}
