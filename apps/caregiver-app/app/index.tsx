import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/auth-store';

export default function Index() {
  const { isAuthenticated, household } = useAuthStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // If authenticated but no household (hasn't completed onboarding), redirect to onboarding
  if (!household) {
    return <Redirect href="/onboarding" />;
  }

  // If authenticated and has household, redirect to tabs
  return <Redirect href="/(tabs)/dashboard" />;
}
