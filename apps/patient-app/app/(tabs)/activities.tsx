import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../src/stores/auth-store';
import ActivityCard from '../../src/components/activity-card';
import DomainSectionHeader from '../../src/components/domain-section-header';
import {
  getTimeOfDay,
  getBackgroundGradient,
  formatDateForDb,
} from '../../src/utils/time-of-day';
import { selectDailyActivities } from '../../src/utils/daily-activity-selection';
import {
  ACTIVITY_REGISTRY,
  ACTIVITY_CATEGORIES,
  getActivitiesByCategory,
} from '../../src/utils/activity-registry';
import type { ActivityDefinition } from '@ourturn/shared';
import { COLORS, FONTS, GRADIENT_TEXT_COLOR } from '../../src/theme';

export default function ActivitiesScreen() {
  const { t } = useTranslation();
  const { session } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

  const timeOfDay = getTimeOfDay();
  const gradient = getBackgroundGradient(timeOfDay);
  const gradientTextColor = GRADIENT_TEXT_COLOR[timeOfDay];
  const today = formatDateForDb();

  // Check which activities are completed today
  const checkCompletions = useCallback(async () => {
    const allTypes = ACTIVITY_REGISTRY.map((a) => a.type);
    const keys = allTypes.map((type) => `activity_completed_${type}_${today}`);
    const results = await AsyncStorage.multiGet(keys);
    const completed = new Set<string>();
    for (const [key, value] of results) {
      if (value === 'true') {
        const type = key.replace('activity_completed_', '').replace(`_${today}`, '');
        completed.add(type);
      }
    }
    setCompletedActivities(completed);
  }, [today]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await checkCompletions();
      setIsLoading(false);
    };
    load();
  }, [checkCompletions]);

  // Re-check completions when tab gains focus
  useFocusEffect(
    useCallback(() => {
      checkCompletions();
    }, [checkCompletions])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await checkCompletions();
    setIsRefreshing(false);
  }, [checkCompletions]);

  // Today's selected activities
  const todaysActivities = selectDailyActivities({
    completedTypes: completedActivities,
  });

  // Helper to get route for an activity def
  const navigateTo = (def: ActivityDefinition) => {
    router.push(def.route as `/${string}`);
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, styles.centered]}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel={t('common.loading')}
        accessibilityState={{ busy: true }}
      >
        <ActivityIndicator size="large" color={COLORS.brand600} />
      </View>
    );
  }

  return (
    <LinearGradient colors={[gradient.start, gradient.end]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.brand600}
            />
          }
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text
              style={[styles.title, { color: gradientTextColor }]}
              accessibilityRole="header"
            >
              {t('patientApp.activities.title')}
            </Text>
            <Text style={[styles.subtitle, { color: gradientTextColor }]}>
              {t('patientApp.activities.subtitle')}
            </Text>
          </View>

          {/* Today's Activities */}
          <Text style={styles.sectionTitle}>
            {t('patientApp.activities.todaysActivities')}
          </Text>

          {todaysActivities.map((def) => {
            const isCompleted = completedActivities.has(def.type);

            return (
              <ActivityCard
                key={def.type}
                emoji={def.emoji}
                title={t(def.titleKey)}
                description={t(def.descriptionKey)}
                onPress={() => navigateTo(def)}
                backgroundColor={def.backgroundColor}
                borderColor={def.borderColor}
                completed={!!isCompleted}
              />
            );
          })}

          {/* Explore More — grouped by category */}
          <Text style={[styles.sectionTitle, styles.exploreTitle]}>
            {t('patientApp.activities.exploreMore')}
          </Text>

          {ACTIVITY_CATEGORIES.map(({ category, emoji: catEmoji, titleKey }) => {
            const activities = getActivitiesByCategory(category);
            if (activities.length === 0) return null;

            const completedCount = activities.filter((a) =>
              completedActivities.has(a.type)
            ).length;

            return (
              <View key={category}>
                <DomainSectionHeader
                  emoji={catEmoji}
                  titleKey={titleKey}
                  completedCount={completedCount}
                  totalCount={activities.length}
                />
                {activities.map((def) => {
                  const isCompleted = completedActivities.has(def.type);

                  return (
                    <ActivityCard
                      key={def.type}
                      emoji={def.emoji}
                      title={t(def.titleKey)}
                      description={t(def.descriptionKey)}
                      onPress={() => navigateTo(def)}
                      backgroundColor={def.backgroundColor}
                      borderColor={def.borderColor}
                      completed={!!isCompleted}
                    />
                  );
                })}
              </View>
            );
          })}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 22,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 38,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  exploreTitle: {
    marginTop: 32,
  },
  bottomPadding: {
    height: 120,
  },
});
