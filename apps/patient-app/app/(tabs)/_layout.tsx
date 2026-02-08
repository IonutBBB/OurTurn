import { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';
import { ErrorBoundary } from '../../src/components/error-boundary';
import { getConsents } from '@ourturn/supabase';
import { COLORS, FONTS } from '../../src/theme';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isInitialized, patient, session } = useAuthStore();
  const [consentChecked, setConsentChecked] = useState(false);

  const complexity = patient?.app_complexity || 'full';

  // Redirect to care code screen if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Redirect to essential mode if set
  useEffect(() => {
    if (isInitialized && isAuthenticated && complexity === 'essential') {
      router.replace('/essential-mode');
    }
  }, [isInitialized, isAuthenticated, complexity, router]);

  // Check if patient has given consent; redirect to consent flow if not
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !session?.householdId || consentChecked) return;

    const checkConsent = async () => {
      try {
        const records = await getConsents(session.householdId);
        const patientConsents = records.filter(
          (r) => r.granted_by_type === 'patient'
        );
        if (patientConsents.length === 0) {
          router.push('/consent');
        }
      } catch {
        // If we can't check consent (e.g. offline), let them through
      } finally {
        setConsentChecked(true);
      }
    };

    checkConsent();
  }, [isInitialized, isAuthenticated, session?.householdId, consentChecked, router]);

  const insets = useSafeAreaInsets();

  return (
    <ErrorBoundary>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }],
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.brand600,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="📋"
              label={t('patientApp.tabs.today')}
              focused={focused}
            />
          ),
          tabBarAccessibilityLabel: t('patientApp.tabs.today'),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="🆘"
              label={t('patientApp.tabs.help')}
              focused={focused}
            />
          ),
          tabBarAccessibilityLabel: t('patientApp.tabs.help'),
        }}
      />
    </Tabs>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    height: undefined,
    minHeight: 70,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  tabEmojiActive: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 20,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.brand600,
  },
});
