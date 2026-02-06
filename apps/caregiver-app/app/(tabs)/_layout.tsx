import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, StyleSheet, View } from 'react-native';
import { ErrorBoundary } from '../../src/components/error-boundary';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
        <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <ErrorBoundary>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="📊"
              label={t('caregiverApp.tabs.dashboard')}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="📋"
              label={t('caregiverApp.tabs.plan')}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="📍"
              label={t('caregiverApp.tabs.location')}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="🤗"
              label={t('caregiverApp.tabs.coach')}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="☰"
              label={t('caregiverApp.tabs.more')}
              focused={focused}
            />
          ),
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
    paddingBottom: 6,
    height: 72,
    ...SHADOWS.sm,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minWidth: 56,
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  iconWrapFocused: {
    backgroundColor: COLORS.brand100,
    borderRadius: RADIUS.lg,
    width: 48,
    height: 32,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabIconFocused: {
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    letterSpacing: 0.2,
  },
  tabLabelFocused: {
    color: COLORS.brand700,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
});
