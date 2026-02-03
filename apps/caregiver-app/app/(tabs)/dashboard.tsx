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

const COLORS = {
  background: '#FAFAF8',
  card: '#FFFFFF',
  border: '#E7E5E4',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#A8A29E',
  brand50: '#F0FDFA',
  brand600: '#0D9488',
  brand700: '#0F766E',
  success: '#16A34A',
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

  const sleepEmojis: Record<number, string> = {
    1: '😩',
    2: '🙂',
    3: '😴',
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
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {t('caregiverApp.dashboard.greeting', {
              timeOfDay: getTimeOfDay(),
              name: caregiver?.name || 'there',
            })}
          </Text>
          {patient && (
            <Text style={styles.status}>
              {t('caregiverApp.dashboard.statusGood', { patientName: patient.name })} 💚
            </Text>
          )}
        </View>

        {/* Status Cards */}
        <View style={styles.cardsContainer}>
          {/* Today's Status Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('caregiverApp.dashboard.todaysStatus')}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.statsText}>
                {t('caregiverApp.dashboard.tasksCompleted', {
                  completed: taskStats.completed,
                  total: taskStats.total,
                })}
              </Text>
              {taskStats.total > 0 && (
                <View style={styles.progressBar}>
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('caregiverApp.dashboard.dailyCheckin')}</Text>
            <View style={styles.cardContent}>
              {checkin ? (
                <View style={styles.checkinContent}>
                  <View style={styles.checkinRow}>
                    <Text style={styles.checkinLabel}>Mood</Text>
                    <Text style={styles.checkinEmoji}>
                      {moodEmojis[checkin.mood] || '—'}
                    </Text>
                  </View>
                  <View style={styles.checkinRow}>
                    <Text style={styles.checkinLabel}>Sleep</Text>
                    <Text style={styles.checkinEmoji}>
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('caregiverApp.dashboard.location')}</Text>
            <View style={styles.cardContent}>
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Care Code</Text>
            <View style={styles.cardContent}>
              <Text style={styles.careCode}>
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
          <View style={[styles.card, styles.insightsCard]}>
            <Text style={styles.cardTitle}>{t('caregiverApp.dashboard.aiInsights')}</Text>
            <View style={styles.cardContent}>
              <View style={styles.insightItem}>
                <Text style={styles.insightIcon}>💡</Text>
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
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  status: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cardContent: {},
  statsText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.brand600,
    borderRadius: 4,
  },
  checkinContent: {
    gap: 12,
  },
  checkinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkinLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  checkinEmoji: {
    fontSize: 24,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationIcon: {
    fontSize: 24,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  locationTime: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  careCode: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.brand700,
    textAlign: 'center',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  careCodeHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  insightsCard: {
    backgroundColor: COLORS.brand50,
    borderColor: COLORS.brand600,
  },
  insightItem: {
    flexDirection: 'row',
    gap: 12,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
});
