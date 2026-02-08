import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../../src/components/error-boundary';
import { FONTS, RADIUS, SHADOWS, createThemedStyles, useColors } from '../../src/theme';

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  const styles = useStyles();
  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
        <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const colors = useColors();

  return (
    <ErrorBoundary>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { paddingBottom: Math.max(insets.bottom, 6), height: 72 + Math.max(insets.bottom - 6, 0) }],
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

const useStyles = createThemedStyles((colors) => ({
  tabBar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
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
    backgroundColor: colors.brand100,
    borderRadius: RADIUS.lg,
    width: 48,
    height: 32,
  },
  tabIcon: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 28,
  },
  tabIconFocused: {
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    letterSpacing: 0.2,
  },
  tabLabelFocused: {
    color: colors.brand700,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
}));
