import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Fraunces_500Medium,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { useAuthStore } from '../src/stores/auth-store';
import { useThemeStore } from '../src/stores/theme-store';
import { ErrorBoundary } from '../src/components/error-boundary';
import { ThemeContext, useResolveTheme, useColors, useResolvedTheme } from '../src/theme';

// Initialize i18n
import '../src/i18n';
import { initLanguageFromStorage } from '../src/i18n';
import { validateEnv } from '../src/utils/validate-env';

validateEnv();

function RootLayoutInner() {
  const colors = useColors();
  const resolvedTheme = useResolvedTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="behaviours" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="resources" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="coach-conversation" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="wellbeing" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="family" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="crisis" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const { isInitialized, initialize } = useAuthStore();
  const initTheme = useThemeStore((s) => s.initFromStorage);
  const themeReady = useThemeStore((s) => s.isInitialized);
  const themeValue = useResolveTheme();

  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    initialize();
    initTheme();
    initLanguageFromStorage();
    // Hide Android navigation bar so it doesn't cover tab buttons
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, [initialize, initTheme]);

  // Show loading screen while initializing auth state or loading fonts
  if (!isInitialized || !fontsLoaded || !themeReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B85A2F" />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={themeValue}>
        <SafeAreaProvider>
          <RootLayoutInner />
        </SafeAreaProvider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
});
