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
      <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
        <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isInitialized, patient, session } = useAuthStore();
  const [consentChecked, setConsentChecked] = useState(false);

  // Redirect to care code screen if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isInitialized, router]);

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
  const bottomPadding = Math.max(insets.bottom, 4);

  return (
    <ErrorBoundary>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { paddingBottom: bottomPadding }],
        tabBarShowLabel: false,
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
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#2D1F14',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minWidth: 90,
    flex: 1,
  },
  iconWrap: {
    width: 52,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  iconWrapFocused: {
    backgroundColor: COLORS.brand200,
    borderRadius: 16,
    width: 72,
    height: 44,
    borderWidth: 2,
    borderColor: COLORS.brand400,
  },
  tabEmoji: {
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 34,
  },
  tabEmojiActive: {
    transform: [{ scale: 1.15 }],
  },
  tabLabel: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: COLORS.brand600,
    fontFamily: FONTS.bodyBold,
  },
});
