// Subscription Hook
// React hook for managing RevenueCat subscriptions in the caregiver app

import { useState, useEffect, useCallback } from 'react';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import {
  initializeRevenueCat,
  loginRevenueCat,
  logoutRevenueCat,
  checkIsPlus,
  getOfferings,
  purchasePackage,
  restorePurchases,
  setupPurchaseListener,
  getCustomerInfo,
  getExpirationDate,
} from '../services/subscriptions';

export interface UseSubscriptionReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  isPlus: boolean;
  expirationDate: Date | null;
  offerings: PurchasesOffering | null;
  error: string | null;

  // Actions
  initialize: (userId?: string) => Promise<void>;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  purchase: (pkg: PurchasesPackage, householdId: string) => Promise<boolean>;
  restore: (householdId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlus, setIsPlus] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize RevenueCat
  const initialize = useCallback(async (userId?: string) => {
    setIsLoading(true);
    try {
      await initializeRevenueCat(userId);
      setIsInitialized(true);

      // Get initial subscription status
      const plus = await checkIsPlus();
      setIsPlus(plus);

      // Get offerings
      const currentOfferings = await getOfferings();
      setOfferings(currentOfferings);

      // Get expiration date
      const customerInfo = await getCustomerInfo();
      if (customerInfo) {
        setExpirationDate(getExpirationDate(customerInfo));
      }
    } catch (err: any) {
      console.error('Failed to initialize subscription:', err);
      setError(err.message || 'Failed to initialize');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login to RevenueCat
  const login = useCallback(async (userId: string) => {
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
  }, []);

  // Logout from RevenueCat
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutRevenueCat();
      setIsPlus(false);
      setExpirationDate(null);
    } catch (err: any) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Purchase a package
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

  // Restore purchases
  const restore = useCallback(async (householdId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await restorePurchases(householdId);
      if (result.success) {
        setIsPlus(result.isPlus);
        // Refresh customer info for expiration date
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
      console.error('Refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isInitialized,
    isLoading,
    isPlus,
    expirationDate,
    offerings,
    error,
    initialize,
    login,
    logout,
    purchase,
    restore,
    refresh,
  };
}
