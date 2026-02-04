import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';
import { supabase } from '@memoguard/supabase';
import { getProgressLabel, getLocationStatusLabel } from '@memoguard/shared';

// Design system colors - 2026 Edition
const COLORS = {
  background: '#FAFBFC',
  card: '#FFFFFF',
  cardElevated: 'rgba(255, 255, 255, 0.95)',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  brand50: '#ECFDF8',
  brand100: '#D1FAE9',
  brand400: '#2DD4BF',
  brand500: '#14B8A6',
  brand600: '#0A9488',
  brand700: '#0D7D73',
  success: '#10B981',
  successBg: '#ECFDF5',
};

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
      // Get today's tasks
      const today = new Date().toISOString().split('T')[0];

      const { data: completions } = await supabase
        .from('task_completions')
        .select('completed')
        .eq('date', today);

      if (completions) {
        const completed = completions.filter((c) => c.completed).length;
        setTaskStats({ completed, total: completions.length });
      }

      // Get today's check-in
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

  const moodEmojis: Record<number, string> = {
    1: '😟',
    2: '😟',
    3: '😐',
    4: '😊',
    5: '😊',
  };

  const moodLabels: Record<number, string> = {
    1: 'Not good',
    2: 'Not good',
    3: 'Okay',
    4: 'Good',
    5: 'Good',
  };

  const sleepEmojis: Record<number, string> = {
    1: '😩',
    2: '🙂',
    3: '😴',
  };

  const sleepLabels: Record<number, string> = {
    1: 'Poor sleep',
    2: 'Fair sleep',
    3: 'Good sleep',
  };

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
        {/* Header */}
        <View style={styles.header} accessible={true} accessibilityRole="header">
          <Text
            style={styles.greeting}
            accessibilityRole="header"
          >
            {t('caregiverApp.dashboard.greeting', {
              timeOfDay: getTimeOfDay(),
              name: caregiver?.name || 'there',
            })}
          </Text>
          {patient && (
            <Text
              style={styles.status}
              accessibilityLabel={`${patient.name} is doing well`}
            >
              {t('caregiverApp.dashboard.statusGood', { patientName: patient.name })} 💚
            </Text>
          )}
        </View>

        {/* Status Cards */}
        <View style={styles.cardsContainer}>
          {/* Today's Status Card */}
          <View
            style={styles.card}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`${t('caregiverApp.dashboard.todaysStatus')}: ${getProgressLabel(taskStats.completed, taskStats.total, 'tasks')}`}
          >
            <Text style={styles.cardTitle}>{t('caregiverApp.dashboard.todaysStatus')}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.statsText}>
                {t('caregiverApp.dashboard.tasksCompleted', {
                  completed: taskStats.completed,
                  total: taskStats.total,
                })}
              </Text>
              {taskStats.total > 0 && (
                <View
                  style={styles.progressBar}
                  accessibilityRole="progressbar"
                  accessibilityValue={{
                    min: 0,
                    max: taskStats.total,
                    now: taskStats.completed,
                  }}
                >
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(taskStats.completed / taskStats.total) * 100}%` },
                    ]}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Daily Check-in Card */}
          <View
            style={styles.card}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={
              checkin
                ? `${t('caregiverApp.dashboard.dailyCheckin')}: Mood is ${moodLabels[checkin.mood] || 'not recorded'}, Sleep was ${sleepLabels[checkin.sleep_quality] || 'not recorded'}`
                : `${t('caregiverApp.dashboard.dailyCheckin')}: ${t('caregiverApp.dashboard.noCheckinYet')}`
            }
          >
            <Text style={styles.cardTitle}>{t('caregiverApp.dashboard.dailyCheckin')}</Text>
            <View style={styles.cardContent}>
              {checkin ? (
                <View style={styles.checkinContent}>
                  <View style={styles.checkinRow}>
                    <Text style={styles.checkinLabel}>Mood</Text>
                    <Text
                      style={styles.checkinEmoji}
                      accessibilityLabel={moodLabels[checkin.mood] || 'Not recorded'}
                    >
                      {moodEmojis[checkin.mood] || '—'}
                    </Text>
                  </View>
                  <View style={styles.checkinRow}>
                    <Text style={styles.checkinLabel}>Sleep</Text>
                    <Text
                      style={styles.checkinEmoji}
                      accessibilityLabel={sleepLabels[checkin.sleep_quality] || 'Not recorded'}
                    >
                      {sleepEmojis[checkin.sleep_quality] || '—'}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noDataText}>
                  {t('caregiverApp.dashboard.noCheckinYet')}
                </Text>
              )}
            </View>
          </View>

          {/* Location Card */}
          <View
            style={styles.card}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={getLocationStatusLabel(
              patient?.name || 'Patient',
              'Home',
              'just now'
            )}
          >
            <Text style={styles.cardTitle}>{t('caregiverApp.dashboard.location')}</Text>
            <View style={styles.cardContent}>
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon} importantForAccessibility="no">📍</Text>
                <View>
                  <Text style={styles.locationText}>
                    {t('caregiverApp.dashboard.atHome', { name: patient?.name || 'Patient' })}
                  </Text>
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
            accessibilityLabel={`Care Code: ${household?.care_code ? household.care_code.split('').join(' ') : 'Not available'}. Share this code to connect the patient app.`}
          >
            <Text style={styles.cardTitle}>Care Code</Text>
            <View style={styles.cardContent}>
              <Text
                style={styles.careCode}
                accessibilityLabel={household?.care_code ? `Code: ${household.care_code.split('').join(' ')}` : 'Code not available'}
              >
                {household?.care_code
                  ? `${household.care_code.slice(0, 3)} ${household.care_code.slice(3)}`
                  : '--- ---'}
              </Text>
              <Text style={styles.careCodeHint}>
                Share this code to connect the patient app
              </Text>
            </View>
          </View>

          {/* AI Insights Card */}
          <View
            style={[styles.card, styles.insightsCard]}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`AI Insight: ${patient?.name || 'Your loved one'} completes more tasks on days with morning walks scheduled.`}
          >
            <Text style={styles.cardTitle}>{t('caregiverApp.dashboard.aiInsights')}</Text>
            <View style={styles.cardContent}>
              <View style={styles.insightItem}>
                <Text style={styles.insightIcon} importantForAccessibility="no">💡</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 28,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  status: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  cardContent: {},
  statsText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.brand50,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.brand600,
    borderRadius: 5,
  },
  checkinContent: {
    gap: 12,
  },
  checkinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 14,
  },
  checkinLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  checkinEmoji: {
    fontSize: 28,
  },
  noDataText: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  locationIcon: {
    fontSize: 28,
    backgroundColor: COLORS.successBg,
    padding: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  locationText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  locationTime: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  careCode: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.brand700,
    textAlign: 'center',
    letterSpacing: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: COLORS.brand50,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  careCodeHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  insightsCard: {
    backgroundColor: COLORS.brand50,
    borderColor: COLORS.brand400,
    borderWidth: 1.5,
  },
  insightItem: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 14,
  },
  insightIcon: {
    fontSize: 24,
    backgroundColor: COLORS.brand100,
    padding: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
});
