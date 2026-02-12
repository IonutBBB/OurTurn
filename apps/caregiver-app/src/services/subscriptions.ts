// Subscription Service
// Manages mobile app subscriptions:
//   - EU users: Stripe Checkout via in-app browser (DMA-compliant)
//   - Non-EU users: RevenueCat IAP (App Store / Play Store)

import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@ourturn/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';

// RevenueCat API keys from environment
const REVENUECAT_APPLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY || '';
const REVENUECAT_GOOGLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY || '';

// Entitlement ID that grants Plus features
const PLUS_ENTITLEMENT_ID = 'plus';

export interface SubscriptionState {
  isInitialized: boolean;
  isPlus: boolean;
  activeSubscription: string | null;
  expirationDate: Date | null;
  offerings: PurchasesOffering | null;
}

/**
 * Initialize RevenueCat with the appropriate API key
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  const apiKey = Platform.OS === 'ios' ? REVENUECAT_APPLE_API_KEY : REVENUECAT_GOOGLE_API_KEY;

  if (!apiKey) {
    if (__DEV__) console.warn('RevenueCat API key not configured for', Platform.OS);
    return;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    await Purchases.configure({
      apiKey,
      appUserID: userId || null, // null = anonymous, will be updated on login
    });

    if (__DEV__) console.log('RevenueCat initialized successfully');
  } catch (error) {
    if (__DEV__) console.error('Failed to initialize RevenueCat:', error);
  }
}

/**
 * Log in user to RevenueCat (call after Supabase auth)
 */
export async function loginRevenueCat(userId: string): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (error) {
    if (__DEV__) console.error('Failed to log in to RevenueCat:', error);
    return null;
  }
}

/**
 * Log out from RevenueCat
 */
export async function logoutRevenueCat(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (error) {
    if (__DEV__) console.error('Failed to log out from RevenueCat:', error);
  }
}

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    if (__DEV__) console.error('Failed to get customer info:', error);
    return null;
  }
}

/**
 * Check if user has Plus subscription
 */
export async function checkIsPlus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[PLUS_ENTITLEMENT_ID]?.isActive === true;
  } catch (error) {
    if (__DEV__) console.error('Failed to check subscription status:', error);
    return false;
  }
}

/**
 * Get available offerings (subscription options)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    if (__DEV__) console.error('Failed to get offerings:', error);
    return null;
  }
}

/**
 * Purchase a package (subscription)
 */
export async function purchasePackage(
  pkg: PurchasesPackage,
  householdId: string
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    // Check if Plus entitlement is now active
    const isPlus = customerInfo.entitlements.active[PLUS_ENTITLEMENT_ID]?.isActive === true;

    if (isPlus) {
      // Sync subscription status to Supabase
      await syncSubscriptionToSupabase(householdId, 'plus', Platform.OS);
    }

    return { success: true, customerInfo };
  } catch (error: any) {
    // Check if user cancelled
    if (error.userCancelled) {
      return { success: false, error: 'Purchase cancelled' };
    }

    if (__DEV__) console.error('Purchase failed:', error);
    return { success: false, error: error.message || 'Purchase failed' };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(
  householdId: string
): Promise<{ success: boolean; isPlus: boolean; error?: string }> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPlus = customerInfo.entitlements.active[PLUS_ENTITLEMENT_ID]?.isActive === true;

    if (isPlus) {
      // Sync subscription status to Supabase
      await syncSubscriptionToSupabase(householdId, 'plus', Platform.OS);
    }

    return { success: true, isPlus };
  } catch (error: any) {
    if (__DEV__) console.error('Restore purchases failed:', error);
    return { success: false, isPlus: false, error: error.message || 'Restore failed' };
  }
}

/**
 * Sync subscription status to Supabase
 */
export async function syncSubscriptionToSupabase(
  householdId: string,
  status: 'free' | 'plus' | 'cancelled',
  platform: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('households')
      .update({
        subscription_status: status,
        subscription_platform: platform,
      })
      .eq('id', householdId);

    if (error) {
      if (__DEV__) console.error('Failed to sync subscription to Supabase:', error);
    } else {
      if (__DEV__) console.log('Subscription synced to Supabase:', status, platform);
    }
  } catch (error) {
    if (__DEV__) console.error('Error syncing subscription:', error);
  }
}

/**
 * Set up listener for subscription status changes
 */
export function setupPurchaseListener(
  householdId: string,
  onStatusChange: (isPlus: boolean) => void
): () => void {
  const listener = async (customerInfo: CustomerInfo) => {
    const isPlus = customerInfo.entitlements.active[PLUS_ENTITLEMENT_ID]?.isActive === true;

    // Sync to Supabase
    const status = isPlus ? 'plus' : 'free';
    await syncSubscriptionToSupabase(householdId, status, Platform.OS);

    // Notify callback
    onStatusChange(isPlus);
  };

  Purchases.addCustomerInfoUpdateListener(listener);

  // Return cleanup function
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

/**
 * Get subscription expiration date
 */
export function getExpirationDate(customerInfo: CustomerInfo): Date | null {
  const entitlement = customerInfo.entitlements.active[PLUS_ENTITLEMENT_ID];
  if (entitlement?.expirationDate) {
    return new Date(entitlement.expirationDate);
  }
  return null;
}

/**
 * Format price for display
 */
export function formatPrice(pkg: PurchasesPackage): string {
  return pkg.product.priceString;
}

/**
 * Get package type label
 */
export function getPackageLabel(pkg: PurchasesPackage): string {
  switch (pkg.packageType) {
    case 'MONTHLY':
      return 'Monthly';
    case 'ANNUAL':
      return 'Annual';
    case 'WEEKLY':
      return 'Weekly';
    case 'LIFETIME':
      return 'Lifetime';
    default:
      return pkg.identifier;
  }
}

// ─── Stripe (EU users) ─────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No active session');
  }
  return session.access_token;
}

/**
 * Open Stripe Checkout in an in-app browser (EU users).
 * Returns 'success' | 'cancelled' | 'error'.
 */
export async function openStripeCheckout(
  householdId: string
): Promise<{ status: 'success' | 'cancelled' | 'error'; error?: string }> {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}/api/stripe/mobile-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { status: 'error', error: data.error || 'Checkout failed' };
    }

    if (!data.sessionUrl) {
      return { status: 'error', error: 'No checkout URL received' };
    }

    // Open Stripe Checkout in the system browser, listen for redirect back
    const result = await WebBrowser.openAuthSessionAsync(
      data.sessionUrl,
      'ourturn-caregiver://stripe-callback'
    );

    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const callbackStatus = url.searchParams.get('status');
      if (callbackStatus === 'success') {
        return { status: 'success' };
      }
      return { status: 'cancelled' };
    }

    // User dismissed the browser
    return { status: 'cancelled' };
  } catch (error: any) {
    if (__DEV__) console.error('Stripe checkout failed:', error);
    return { status: 'error', error: error.message || 'Checkout failed' };
  }
}

/**
 * Open Stripe Billing Portal in an in-app browser (EU users / web-subscribed).
 */
export async function openStripePortal(
  householdId: string
): Promise<{ status: 'success' | 'error'; error?: string }> {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}/api/stripe/mobile-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { status: 'error', error: data.error || 'Portal failed' };
    }

    if (!data.portalUrl) {
      return { status: 'error', error: 'No portal URL received' };
    }

    await WebBrowser.openAuthSessionAsync(
      data.portalUrl,
      'ourturn-caregiver://stripe-callback'
    );

    return { status: 'success' };
  } catch (error: any) {
    if (__DEV__) console.error('Stripe portal failed:', error);
    return { status: 'error', error: error.message || 'Portal failed' };
  }
}

/**
 * Poll Supabase until subscription_status === 'plus' (handles webhook race condition).
 * Times out after 15 seconds.
 */
export async function waitForSubscriptionActivation(
  householdId: string,
  timeoutMs = 15000,
  intervalMs = 2000
): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const { data } = await supabase
      .from('households')
      .select('subscription_status')
      .eq('id', householdId)
      .single();

    if (data?.subscription_status === 'plus') {
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  return false;
}
