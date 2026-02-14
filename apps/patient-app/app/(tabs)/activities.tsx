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
  getReminiscencePrompts,
  getMusicItems,
} from '../../src/utils/activity-templates';
import {
  getTimeOfDay,
  getBackgroundGradient,
  formatDateForDb,
} from '../../src/utils/time-of-day';
import { selectDailyActivities } from '../../src/utils/daily-activity-selection';
import {
  ACTIVITY_REGISTRY,
  COGNITIVE_DOMAINS,
  getActivitiesByDomain,
} from '../../src/utils/activity-registry';
import { supabase } from '@ourturn/supabase';
import { getCachedActivity, cacheActivity } from '../../src/utils/offline-cache';
import type { BrainActivity, ActivityDefinition, CognitiveDomain } from '@ourturn/shared';
import { COLORS, FONTS, GRADIENT_TEXT_COLOR } from '../../src/theme';

const ACTIVITY_TYPE_ICONS: Record<string, string> = {
  reminiscence: '💭',
  photo: '📷',
  word_game: '🔤',
  music: '🎵',
  creative: '🎨',
  orientation: '📅',
};

export default function ActivitiesScreen() {
  const { t } = useTranslation();
  const { patient, session } = useAuthStore();
  const [brainActivity, setBrainActivity] = useState<BrainActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

  const timeOfDay = getTimeOfDay();
  const gradient = getBackgroundGradient(timeOfDay);
  const gradientTextColor = GRADIENT_TEXT_COLOR[timeOfDay];
  const today = formatDateForDb();
  const householdId = session?.householdId;

  // Check which activities are completed today (both legacy and new)
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

  // Fetch brain activity
  const fetchData = useCallback(async () => {
    if (!householdId) return;

    try {
      const { data } = await supabase
        .from('brain_activities')
        .select('*')
        .eq('household_id', householdId)
        .eq('date', today)
        .single();

      setBrainActivity(data || null);
      if (data) {
        await cacheActivity(today, data);
      }
    } catch {
      const cached = await getCachedActivity(today);
      if (cached) {
        setBrainActivity(cached);
      }
    }

    await checkCompletions();
  }, [householdId, today, checkCompletions]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchData();
      setIsLoading(false);
    };
    load();
  }, [fetchData]);

  // Re-check completions when tab gains focus
  useFocusEffect(
    useCallback(() => {
      checkCompletions();
    }, [checkCompletions])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  // Determine legacy activity availability
  const biography = patient?.biography;
  const photos = patient?.photos;
  const reminiscencePrompts = getReminiscencePrompts(biography, photos);
  const musicItems = getMusicItems(biography);
  const hasRemember = reminiscencePrompts.length > 0;
  const hasListen = musicItems.length > 0;
  const hasBiography = !!(biography && (biography.key_events?.length || biography.important_people?.length || biography.childhood_location || biography.career));

  // Today's selected activities
  const todaysActivities = selectDailyActivities({
    brainActivity,
    hasBiography,
    completedTypes: completedActivities,
  });

  const brainActivityIcon = brainActivity
    ? ACTIVITY_TYPE_ICONS[brainActivity.activity_type] || '🧩'
    : '🧩';

  // Helper to get route for an activity def
  const navigateTo = (def: ActivityDefinition) => {
    router.push(def.route as `/${string}`);
  };

  // Check if a legacy activity is available (has content)
  const isLegacyAvailable = (type: string): boolean => {
    if (type === 'brain_activity') return !!brainActivity;
    if (type === 'remember') return hasRemember;
    if (type === 'listen') return hasListen;
    return true; // move, create always available
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

          {/* ── Today's Activities ─────────────────────────── */}
          <Text style={styles.sectionTitle}>
            {t('patientApp.activities.todaysActivities')}
          </Text>

          {todaysActivities.map((def) => {
            const isCompleted = completedActivities.has(def.type) || (def.type === 'brain_activity' && brainActivity?.completed);
            const emoji = def.type === 'brain_activity' ? brainActivityIcon : def.emoji;

            return (
              <ActivityCard
                key={def.type}
                emoji={emoji}
                title={t(def.titleKey)}
                description={t(def.descriptionKey)}
                onPress={() => navigateTo(def)}
                backgroundColor={def.backgroundColor}
                borderColor={def.borderColor}
                completed={!!isCompleted}
                badge={!isCompleted && def.type === 'brain_activity' ? t('patientApp.todaysPlan.nowBadge') : undefined}
              />
            );
          })}

          {/* ── Explore More ──────────────────────────────── */}
          <Text style={[styles.sectionTitle, styles.exploreTitle]}>
            {t('patientApp.activities.exploreMore')}
          </Text>

          {COGNITIVE_DOMAINS.map(({ domain, emoji: domainEmoji, titleKey }) => {
            const activities = getActivitiesByDomain(domain);
            // Filter out unavailable legacy activities
            const available = activities.filter((a) =>
              a.legacy ? isLegacyAvailable(a.type) : true
            );
            if (available.length === 0) return null;

            const completedCount = available.filter((a) =>
              completedActivities.has(a.type) || (a.type === 'brain_activity' && brainActivity?.completed)
            ).length;

            return (
              <View key={domain}>
                <DomainSectionHeader
                  emoji={domainEmoji}
                  titleKey={titleKey}
                  completedCount={completedCount}
                  totalCount={available.length}
                />
                {available.map((def) => {
                  const isCompleted = completedActivities.has(def.type) || (def.type === 'brain_activity' && brainActivity?.completed);
                  const emoji = def.type === 'brain_activity' ? brainActivityIcon : def.emoji;

                  return (
                    <ActivityCard
                      key={def.type}
                      emoji={emoji}
                      title={t(def.titleKey)}
                      description={t(def.descriptionKey)}
                      onPress={() => navigateTo(def)}
                      backgroundColor={def.backgroundColor}
                      borderColor={def.borderColor}
                      completed={!!isCompleted}
                      domainBadge={t(titleKey)}
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
