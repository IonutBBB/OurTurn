import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';
import { COLORS, FONTS, SHADOWS } from '../../src/theme';

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
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Redirect to care code screen if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isInitialized, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
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
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 16,
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
