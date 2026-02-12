// Subscription Hook
// Manages subscriptions with region-based payment routing:
//   - EU users: Stripe Checkout (DMA-compliant, lower fees)
//   - Non-EU users: RevenueCat IAP (App Store / Play Store)

import { useState, useCallback, useMemo } from 'react';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import {
  initializeRevenueCat,
  loginRevenueCat,
  logoutRevenueCat,
  checkIsPlus,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  getExpirationDate,
  openStripeCheckout,
  openStripePortal,
  waitForSubscriptionActivation,
} from '../services/subscriptions';
import { isEUCountry } from '@ourturn/shared';
import { toISOCountryCode } from '../utils/country-code-map';

interface HouseholdInfo {
  id: string;
  country: string | null;
  subscription_status: string;
  subscription_platform?: string | null;
}

export interface UseSubscriptionReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  isPlus: boolean;
  isEUUser: boolean;
  expirationDate: Date | null;
  offerings: PurchasesOffering | null;
  error: string | null;

  // Actions
  initialize: (userId?: string) => Promise<void>;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  purchase: (pkg: PurchasesPackage, householdId: string) => Promise<boolean>;
  purchaseViaStripe: (householdId: string) => Promise<boolean>;
  manageSubscription: (householdId: string) => Promise<void>;
  restore: (householdId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useSubscription(household?: HouseholdInfo | null): UseSubscriptionReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlus, setIsPlus] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEUUser = useMemo(() => {
    if (!household?.country) return false;
    const isoCode = toISOCountryCode(household.country);
    return isEUCountry(isoCode);
  }, [household?.country]);

  // For EU users, derive Plus status from the DB (Stripe webhook updates it)
  const effectiveIsPlus = isEUUser
    ? household?.subscription_status === 'plus'
    : isPlus;

  // Initialize RevenueCat (non-EU only)
  const initialize = useCallback(async (userId?: string) => {
    if (isEUUser) {
      // EU users don't need RevenueCat — status comes from DB
      setIsInitialized(true);
      return;
    }

    setIsLoading(true);
    try {
      await initializeRevenueCat(userId);
      setIsInitialized(true);

      const plus = await checkIsPlus();
      setIsPlus(plus);

      const currentOfferings = await getOfferings();
      setOfferings(currentOfferings);

      const customerInfo = await getCustomerInfo();
      if (customerInfo) {
        setExpirationDate(getExpirationDate(customerInfo));
      }
    } catch (err: any) {
      if (__DEV__) console.error('Failed to initialize subscription:', err);
      setError(err.message || 'Failed to initialize');
    } finally {
      setIsLoading(false);
    }
  }, [isEUUser]);

  // Login to RevenueCat (non-EU only)
  const login = useCallback(async (userId: string) => {
    if (isEUUser) return;

    setIsLoading(true);
    setError(null);
    try {
      const customerInfo = await loginRevenueCat(userId);
      if (customerInfo) {
        const plus = customerInfo.entitlements.active['plus']?.isActive === true;
        setIsPlus(plus);
        setExpirationDate(getExpirationDate(customerInfo));
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, [isEUUser]);

  // Logout from RevenueCat (non-EU only)
  const logout = useCallback(async () => {
    if (isEUUser) return;

    setIsLoading(true);
    try {
      await logoutRevenueCat();
      setIsPlus(false);
      setExpirationDate(null);
    } catch (err: any) {
      if (__DEV__) console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isEUUser]);

  // Purchase via RevenueCat IAP (non-EU)
  const purchase = useCallback(async (pkg: PurchasesPackage, householdId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await purchasePackage(pkg, householdId);
      if (result.success && result.customerInfo) {
        const plus = result.customerInfo.entitlements.active['plus']?.isActive === true;
        setIsPlus(plus);
        setExpirationDate(getExpirationDate(result.customerInfo));
        return true;
      } else {
        if (result.error && result.error !== 'Purchase cancelled') {
          setError(result.error);
        }
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Purchase failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Purchase via Stripe Checkout (EU)
  const purchaseViaStripe = useCallback(async (householdId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await openStripeCheckout(householdId);

      if (result.status === 'success') {
        // Wait for webhook to update DB
        const activated = await waitForSubscriptionActivation(householdId);
        if (activated) {
          setIsPlus(true);
          return true;
        }
        // Webhook hasn't fired yet but checkout succeeded — will update on next refresh
        return true;
      }

      if (result.status === 'error' && result.error) {
        setError(result.error);
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manage existing subscription
  const manageSubscription = useCallback(async (householdId: string) => {
    const platform = household?.subscription_platform;

    // Stripe-subscribed users (EU or web-subscribed): open billing portal
    if (platform === 'web') {
      setIsLoading(true);
      setError(null);
      try {
        const result = await openStripePortal(householdId);
        if (result.status === 'error' && result.error) {
          setError(result.error);
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // IAP-subscribed users: nothing to do in-app — managed via store settings
    // The UI will show instructions instead of calling this function
  }, [household?.subscription_platform]);

  // Restore purchases (non-EU / RevenueCat only)
  const restore = useCallback(async (householdId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await restorePurchases(householdId);
      if (result.success) {
        setIsPlus(result.isPlus);
        const customerInfo = await getCustomerInfo();
        if (customerInfo) {
          setExpirationDate(getExpirationDate(customerInfo));
        }
        return result.isPlus;
      } else {
        if (result.error) {
          setError(result.error);
        }
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Restore failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh subscription status
  const refresh = useCallback(async () => {
    if (isEUUser) {
      // EU: status comes from DB, no RevenueCat to refresh
      return;
    }

    setIsLoading(true);
    try {
      const plus = await checkIsPlus();
      setIsPlus(plus);

      const customerInfo = await getCustomerInfo();
      if (customerInfo) {
        setExpirationDate(getExpirationDate(customerInfo));
      }

      const currentOfferings = await getOfferings();
      setOfferings(currentOfferings);
    } catch (err: any) {
      if (__DEV__) console.error('Refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isEUUser]);

  return {
    isInitialized: isEUUser ? true : isInitialized,
    isLoading,
    isPlus: effectiveIsPlus,
    isEUUser,
    expirationDate,
    offerings,
    error,
    initialize,
    login,
    logout,
    purchase,
    purchaseViaStripe,
    manageSubscription,
    restore,
    refresh,
  };
}
