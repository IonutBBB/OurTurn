import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';
import { supabase } from '@memoguard/supabase';
import { getProgressLabel, getLocationStatusLabel } from '@memoguard/shared';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/theme';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { caregiver, household, patient, loadCaregiverData } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
  const [checkin, setCheckin] = useState<any>(null);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const loadDashboardData = async () => {
    if (!household?.id) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: completions } = await supabase
        .from('task_completions')
        .select('completed')
        .eq('date', today);

      if (completions) {
        const completed = completions.filter((c) => c.completed).length;
        setTaskStats({ completed, total: completions.length });
      }

      const { data: checkinData } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('household_id', household.id)
        .eq('date', today)
        .single();

      setCheckin(checkinData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [household?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCaregiverData();
    await loadDashboardData();
    setRefreshing(false);
  };

  const moodMap: Record<number, { emoji: string; label: string }> = {
    1: { emoji: '😟', label: 'Struggling' },
    2: { emoji: '😕', label: 'Low' },
    3: { emoji: '😐', label: 'Okay' },
    4: { emoji: '😊', label: 'Good' },
    5: { emoji: '😄', label: 'Great' },
  };

  const sleepMap: Record<number, { emoji: string; label: string }> = {
    1: { emoji: '😩', label: 'Poor' },
    2: { emoji: '🙂', label: 'Fair' },
    3: { emoji: '😴', label: 'Well' },
  };

  const progressPercent = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.brand600}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header} accessible={true} accessibilityRole="header">
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.greeting} accessibilityRole="header">
                {t('caregiverApp.dashboard.greeting', {
                  timeOfDay: getTimeOfDay(),
                  name: caregiver?.name || 'there',
                })}
              </Text>
              {patient && (
                <Text style={styles.status} accessibilityLabel={`${patient.name} is doing well`}>
                  {t('caregiverApp.dashboard.statusGood', { patientName: patient.name })} 💚
                </Text>
              )}
            </View>
            <View style={styles.dateChip}>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Cards ── */}
        <View style={styles.cardsContainer}>
          {/* Progress Card — Featured with accent border */}
          <View
            style={[styles.card, styles.cardAccent]}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`${t('caregiverApp.dashboard.todaysStatus')}: ${getProgressLabel(taskStats.completed, taskStats.total, 'tasks')}`}
          >
            <Text style={styles.sectionLabel}>{t('caregiverApp.dashboard.todaysStatus')}</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressNumbers}>
                <Text style={styles.progressBig}>
                  {taskStats.completed}
                  <Text style={styles.progressSmall}>/{taskStats.total}</Text>
                </Text>
                <Text style={styles.progressCaption}>tasks completed</Text>
              </View>
              {/* Mini progress ring */}
              <View style={styles.ringWrap}>
                <Text style={styles.ringText}>{progressPercent}%</Text>
              </View>
            </View>
            {taskStats.total > 0 && (
              <View
                style={styles.progressBar}
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: taskStats.total, now: taskStats.completed }}
              >
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
            )}
          </View>

          {/* Check-in Card */}
          <View
            style={styles.card}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={
              checkin
                ? `${t('caregiverApp.dashboard.dailyCheckin')}: Mood is ${moodMap[checkin.mood]?.label || 'not recorded'}`
                : `${t('caregiverApp.dashboard.dailyCheckin')}: ${t('caregiverApp.dashboard.noCheckinYet')}`
            }
          >
            <Text style={styles.sectionLabel}>{t('caregiverApp.dashboard.dailyCheckin')}</Text>
            {checkin ? (
              <View style={styles.checkinGrid}>
                <View style={styles.checkinBox}>
                  <Text style={styles.checkinEmoji}>{moodMap[checkin.mood]?.emoji || '—'}</Text>
                  <Text style={styles.checkinBoxLabel}>{moodMap[checkin.mood]?.label || 'Mood'}</Text>
                </View>
                <View style={styles.checkinBox}>
                  <Text style={styles.checkinEmoji}>{sleepMap[checkin.sleep_quality]?.emoji || '—'}</Text>
                  <Text style={styles.checkinBoxLabel}>{sleepMap[checkin.sleep_quality]?.label || 'Sleep'}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>💭</Text>
                <Text style={styles.emptyText}>{t('caregiverApp.dashboard.noCheckinYet')}</Text>
              </View>
            )}
          </View>

          {/* Location Card */}
          <View
            style={styles.card}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={getLocationStatusLabel(patient?.name || 'Patient', 'Home', 'just now')}
          >
            <Text style={styles.sectionLabel}>{t('caregiverApp.dashboard.location')}</Text>
            <View style={styles.locationRow}>
              <View style={styles.locationIconWrap}>
                <Text style={styles.locationIcon} importantForAccessibility="no">📍</Text>
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  {t('caregiverApp.dashboard.atHome', { name: patient?.name || 'Patient' })}
                </Text>
                <View style={styles.locationStatusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.locationTime}>
                    {t('caregiverApp.dashboard.lastUpdate', { time: 'just now' })}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Care Code Card */}
          <View
            style={styles.card}
            accessible={true}
            accessibilityLabel={`Care Code: ${household?.care_code ? household.care_code.split('').join(' ') : 'Not available'}`}
          >
            <Text style={styles.sectionLabel}>Care Code</Text>
            <View style={styles.codeBox}>
              <Text
                style={styles.careCode}
                accessibilityLabel={household?.care_code ? `Code: ${household.care_code.split('').join(' ')}` : 'Code not available'}
              >
                {household?.care_code
                  ? `${household.care_code.slice(0, 3)} ${household.care_code.slice(3)}`
                  : '--- ---'}
              </Text>
            </View>
            <Text style={styles.codeHint}>Share to connect patient app</Text>
          </View>

          {/* AI Insights Card */}
          <View
            style={[styles.card, styles.insightsCard]}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`AI Insight: ${patient?.name || 'Your loved one'} completes more tasks on days with morning walks scheduled.`}
          >
            <View style={styles.insightHeader}>
              <Text style={styles.insightHeaderIcon}>✨</Text>
              <Text style={styles.sectionLabelBrand}>{t('caregiverApp.dashboard.aiInsights')}</Text>
            </View>
            <View style={styles.insightBox}>
              <Text style={styles.insightIcon} importantForAccessibility="no">💡</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Morning Activity Pattern</Text>
                <Text style={styles.insightText}>
                  {patient?.name || 'Your loved one'} completes more tasks on days with morning walks scheduled.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[5],
    paddingBottom: 120,
  },

  // Header
  header: {
    marginBottom: SPACING[6],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  status: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  dateChip: {
    backgroundColor: COLORS.brand50,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.brand200,
  },
  dateText: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand700,
    letterSpacing: 0.3,
  },

  // Cards
  cardsContainer: {
    gap: SPACING[4],
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardAccent: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.brand500,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.displayMedium,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING[4],
  },
  sectionLabelBrand: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.displayMedium,
    color: COLORS.brand700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING[3],
  },
  progressNumbers: {},
  progressBig: {
    fontSize: 42,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  progressSmall: {
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  progressCaption: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ringWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: COLORS.brand200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    fontSize: 14,
    fontFamily: FONTS.display,
    fontWeight: '700',
    color: COLORS.brand600,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.brand50,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.brand600,
    borderRadius: 4,
  },

  // Check-in
  checkinGrid: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  checkinBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkinEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  checkinBoxLabel: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING[6],
  },
  emptyEmoji: {
    fontSize: 28,
    opacity: 0.4,
    marginBottom: SPACING[2],
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  locationIconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIcon: {
    fontSize: 24,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  locationStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  locationTime: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },

  // Care Code
  codeBox: {
    backgroundColor: COLORS.brand50,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.brand200,
  },
  careCode: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.brand700,
    letterSpacing: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeHint: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING[3],
  },

  // AI Insights
  insightsCard: {
    backgroundColor: COLORS.brand50,
    borderColor: COLORS.brand200,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING[3],
  },
  insightHeaderIcon: {
    fontSize: 14,
  },
  insightBox: {
    flexDirection: 'row',
    gap: SPACING[3],
    backgroundColor: COLORS.card,
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  insightText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
});
