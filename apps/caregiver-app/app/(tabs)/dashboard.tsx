import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth-store';
import { supabase } from '@ourturn/supabase';
import { getProgressLabel, getLocationStatusLabel } from '@ourturn/shared';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/theme';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { caregiver, household, patient, loadCaregiverData } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
  const [checkin, setCheckin] = useState<any>(null);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [journalNote, setJournalNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [alertsToday, setAlertsToday] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const styles = useStyles();
  const colors = useColors();

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const loadDashboardData = async () => {
    if (!household?.id) return;
    setLoadError(false);
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

      // Load journal entries
      const { data: journalData } = await supabase
        .from('care_journal_entries')
        .select('id, content, entry_type, created_at, author:caregivers!author_id(name)')
        .eq('household_id', household.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (journalData) setJournalEntries(journalData);

      // Load alerts today
      const { count } = await supabase
        .from('location_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('household_id', household.id)
        .gte('triggered_at', `${today}T00:00:00`);

      setAlertsToday(count || 0);
    } catch (error) {
      if (__DEV__) console.error('Failed to load dashboard data:', error);
      setLoadError(true);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [household?.id]);

  // Realtime subscription for task_completions
  useEffect(() => {
    if (!household?.id) return;
    const channel = supabase
      .channel('dashboard-completions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_completions',
        filter: `household_id=eq.${household.id}`,
      }, () => {
        const today = new Date().toISOString().split('T')[0];
        supabase
          .from('task_completions')
          .select('completed')
          .eq('household_id', household.id)
          .eq('date', today)
          .then(({ data }) => {
            if (data) {
              const completed = data.filter((c) => c.completed).length;
              setTaskStats({ completed, total: data.length });
            }
          });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [household?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCaregiverData();
    await loadDashboardData();
    setRefreshing(false);
  };

  const scaleLevels = [
    { color: '#B8463A' }, // bad
    { color: '#C4882C' }, // okay
    { color: '#4A7C59' }, // good
  ];
  const moodToLevel: Record<number, number> = { 1: 0, 2: 0, 3: 1, 4: 2, 5: 2 };
  const moodLabels: Record<number, string> = {
    1: t('caregiverApp.dashboard.moodStruggling'), 2: t('caregiverApp.dashboard.moodLow'),
    3: t('caregiverApp.dashboard.moodOkay'), 4: t('caregiverApp.dashboard.moodGood'),
    5: t('caregiverApp.dashboard.moodGreat'),
  };
  const sleepToLevel: Record<number, number> = { 1: 0, 2: 1, 3: 2 };
  const sleepLabels: Record<number, string> = {
    1: t('caregiverApp.dashboard.sleepPoor'), 2: t('caregiverApp.dashboard.sleepFair'),
    3: t('caregiverApp.dashboard.sleepWell'),
  };

  const handleAddJournalNote = useCallback(async () => {
    if (!journalNote.trim() || !household?.id) return;
    setSavingNote(true);
    try {
      const { data, error } = await supabase
        .from('care_journal_entries')
        .insert({
          household_id: household.id,
          author_id: caregiver?.id,
          content: journalNote.trim(),
          entry_type: 'note',
        })
        .select('id, content, entry_type, created_at, author:caregivers!author_id(name)')
        .single();

      if (error) throw error;
      setJournalEntries(prev => [data, ...prev].slice(0, 5));
      setJournalNote('');
    } catch (err) {
      if (__DEV__) console.error('Failed to add note:', err);
    } finally {
      setSavingNote(false);
    }
  }, [journalNote, household?.id, caregiver?.id]);

  const entryTypeIcon: Record<string, string> = {
    note: '📝',
    observation: '👁️',
    milestone: '🌟',
    concern: '⚠️',
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return t('caregiverApp.dashboard.minutesAgo', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('caregiverApp.dashboard.hoursAgo', { count: hours });
    const days = Math.floor(hours / 24);
    return t('caregiverApp.dashboard.daysAgo', { count: days });
  };

  const progressPercent = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  // Device status
  const lastSeenAt = patient?.last_seen_at ? new Date(patient.last_seen_at) : null;
  const offlineThresholdMs = (household?.offline_alert_minutes || 30) * 60 * 1000;
  const isDeviceOnline = lastSeenAt ? (Date.now() - lastSeenAt.getTime()) < offlineThresholdMs : false;

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
            tintColor={colors.brand600}
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
                <Text style={styles.status} accessibilityLabel={t('caregiverApp.dashboard.statusGood', { patientName: patient.name })}>
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

        {/* Error Banner */}
        {loadError && (
          <TouchableOpacity style={styles.errorBanner} onPress={loadDashboardData} activeOpacity={0.7}>
            <Text style={styles.errorBannerText}>{t('common.error')}</Text>
            <Text style={styles.errorBannerRetry}>{t('common.tryAgain')}</Text>
          </TouchableOpacity>
        )}

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
                <Text style={styles.progressCaption}>{t('caregiverApp.dashboard.tasksCompletedLabel')}</Text>
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
                ? `${t('caregiverApp.dashboard.dailyCheckin')}: ${t('caregiverApp.dashboard.mood')} ${moodLabels[checkin.mood] || '—'}`
                : `${t('caregiverApp.dashboard.dailyCheckin')}: ${t('caregiverApp.dashboard.noCheckinYet')}`
            }
          >
            <Text style={styles.sectionLabel}>{t('caregiverApp.dashboard.dailyCheckin')}</Text>
            {checkin ? (
              <View style={styles.checkinScales}>
                {/* Mood scale */}
                <View style={styles.scaleRow}>
                  <View style={styles.scaleHeader}>
                    <Text style={styles.scaleLabel}>{t('caregiverApp.dashboard.mood')}</Text>
                    <Text style={[styles.scaleValue, { color: scaleLevels[moodToLevel[checkin.mood] ?? 1].color }]}>
                      {moodLabels[checkin.mood] || '—'}
                    </Text>
                  </View>
                  <View style={styles.scaleBar}>
                    {scaleLevels.map((s, i) => (
                      <View
                        key={i}
                        style={[
                          styles.scaleSegment,
                          {
                            backgroundColor: i <= (moodToLevel[checkin.mood] ?? 1)
                              ? scaleLevels[moodToLevel[checkin.mood] ?? 1].color
                              : colors.border,
                            opacity: i <= (moodToLevel[checkin.mood] ?? 1) ? 1 : 0.4,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
                {/* Sleep scale */}
                <View style={styles.scaleRow}>
                  <View style={styles.scaleHeader}>
                    <Text style={styles.scaleLabel}>{t('caregiverApp.dashboard.sleep')}</Text>
                    <Text style={[styles.scaleValue, { color: scaleLevels[sleepToLevel[checkin.sleep_quality] ?? 1].color }]}>
                      {sleepLabels[checkin.sleep_quality] || '—'}
                    </Text>
                  </View>
                  <View style={styles.scaleBar}>
                    {scaleLevels.map((s, i) => (
                      <View
                        key={i}
                        style={[
                          styles.scaleSegment,
                          {
                            backgroundColor: i <= (sleepToLevel[checkin.sleep_quality] ?? 1)
                              ? scaleLevels[sleepToLevel[checkin.sleep_quality] ?? 1].color
                              : colors.border,
                            opacity: i <= (sleepToLevel[checkin.sleep_quality] ?? 1) ? 1 : 0.4,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
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

          {/* Device Status + Engagement Card */}
          <View style={styles.card} accessible={true} accessibilityRole="summary">
            <Text style={styles.sectionLabel}>{t('caregiverApp.dashboard.deviceStatus')}</Text>
            <View style={styles.deviceRow}>
              <View style={[styles.deviceIconWrap, isDeviceOnline ? styles.deviceOnlineBg : styles.deviceOfflineBg]}>
                <Text style={styles.deviceIcon}>{isDeviceOnline ? '📱' : '📵'}</Text>
              </View>
              <View style={styles.deviceInfo}>
                <View style={styles.deviceStatusRow}>
                  <View style={[styles.deviceDot, isDeviceOnline ? styles.dotOnline : styles.dotOffline]} />
                  <Text style={styles.deviceStatusText}>
                    {isDeviceOnline ? t('caregiverApp.dashboard.deviceOnline') : t('caregiverApp.dashboard.deviceOffline')}
                  </Text>
                </View>
                <Text style={styles.deviceLastSeen}>
                  {lastSeenAt
                    ? t('caregiverApp.dashboard.lastSeenAt', { time: lastSeenAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) })
                    : t('caregiverApp.dashboard.lastSeenNever')}
                </Text>
              </View>
            </View>

            {/* Engagement Summary */}
            <View style={styles.engagementDivider} />
            <Text style={styles.sectionLabel}>{t('caregiverApp.dashboard.engagementSummary')}</Text>
            <View style={styles.engagementGrid}>
              <View style={styles.engagementBox}>
                <Text style={styles.engagementValue}>{checkin ? '✅' : '—'}</Text>
                <Text style={styles.engagementLabel}>{checkin ? t('caregiverApp.dashboard.checkedIn') : t('caregiverApp.dashboard.notCheckedIn')}</Text>
              </View>
              <View style={styles.engagementBox}>
                <Text style={styles.engagementValue}>{alertsToday}</Text>
                <Text style={styles.engagementLabel}>{t('caregiverApp.dashboard.alertsToday')}</Text>
              </View>
            </View>
          </View>

          {/* AI Insights Card */}
          <View
            style={[styles.card, styles.insightsCard]}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`${t('caregiverApp.dashboard.aiInsights')}: ${t('caregiverApp.dashboard.insightText', { name: patient?.name || 'Your loved one' })}`}
          >
            <View style={styles.insightHeader}>
              <Text style={styles.insightHeaderIcon}>✨</Text>
              <Text style={styles.sectionLabelBrand}>{t('caregiverApp.dashboard.aiInsights')}</Text>
            </View>
            <View style={styles.insightBox}>
              <Text style={styles.insightIcon} importantForAccessibility="no">💡</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{t('caregiverApp.dashboard.morningActivityPattern')}</Text>
                <Text style={styles.insightText}>
                  {t('caregiverApp.dashboard.insightText', { name: patient?.name || 'Your loved one' })}
                </Text>
              </View>
            </View>
          </View>

          {/* Care Journal Card */}
          <View style={styles.card}>
            <View style={styles.journalHeader}>
              <Text style={styles.sectionLabel}>{t('caregiverApp.family.journal')}</Text>
            </View>

            {/* Quick note input */}
            <View style={styles.journalInputRow}>
              <TextInput
                style={styles.journalInput}
                value={journalNote}
                onChangeText={setJournalNote}
                placeholder={t('caregiverApp.family.addNote')}
                placeholderTextColor={colors.textMuted}
                returnKeyType="send"
                onSubmitEditing={handleAddJournalNote}
              />
              <TouchableOpacity
                style={[styles.journalAddButton, (!journalNote.trim() || savingNote) && styles.journalAddButtonDisabled]}
                onPress={handleAddJournalNote}
                disabled={!journalNote.trim() || savingNote}
                activeOpacity={0.7}
              >
                {savingNote ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={styles.journalAddButtonText}>+</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Journal entries */}
            {journalEntries.length === 0 ? (
              <View style={styles.journalEmpty}>
                <Text style={styles.journalEmptyIcon}>📔</Text>
                <Text style={styles.journalEmptyText}>{t('caregiverApp.dashboard.noJournalEntries')}</Text>
              </View>
            ) : (
              journalEntries.map((entry) => {
                const authorData = Array.isArray(entry.author) ? entry.author[0] : entry.author;
                return (
                  <View key={entry.id} style={styles.journalEntry}>
                    <Text style={styles.journalEntryIcon}>
                      {entryTypeIcon[entry.entry_type] || '📝'}
                    </Text>
                    <View style={styles.journalEntryContent}>
                      <Text style={styles.journalEntryText} numberOfLines={2}>
                        {entry.content}
                      </Text>
                      <Text style={styles.journalEntryMeta}>
                        {authorData?.name || t('caregiverApp.dashboard.unknown')} · {formatRelativeTime(entry.created_at)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  status: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dateChip: {
    backgroundColor: colors.brand50,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.brand200,
  },
  dateText: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand700,
    letterSpacing: 0.3,
  },

  // Error banner
  errorBanner: {
    backgroundColor: colors.dangerBg,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: colors.danger,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.danger,
    flex: 1,
  },
  errorBannerRetry: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: colors.danger,
    marginLeft: SPACING[3],
  },

  // Cards
  cardsContainer: {
    gap: SPACING[4],
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: colors.border,
    ...SHADOWS.sm,
  },
  cardAccent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brand500,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.displayMedium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING[4],
  },
  sectionLabelBrand: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.displayMedium,
    color: colors.brand700,
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
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  progressSmall: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.textMuted,
  },
  progressCaption: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ringWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: colors.brand200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    fontSize: 14,
    fontFamily: FONTS.display,
    fontWeight: '700',
    color: colors.brand600,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.brand50,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand600,
    borderRadius: 4,
  },

  // Check-in scales
  checkinScales: {
    gap: SPACING[4],
  },
  scaleRow: {
    gap: SPACING[2],
  },
  scaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scaleLabel: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scaleValue: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
  },
  scaleBar: {
    flexDirection: 'row',
    gap: 6,
  },
  scaleSegment: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING[6],
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
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
    backgroundColor: colors.successBg,
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
    color: colors.textPrimary,
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
    backgroundColor: colors.success,
  },
  locationTime: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },

  // Device Status
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  deviceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceOnlineBg: {
    backgroundColor: colors.successBg,
  },
  deviceOfflineBg: {
    backgroundColor: colors.dangerBg,
  },
  deviceIcon: {
    fontSize: 24,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: colors.success,
  },
  dotOffline: {
    backgroundColor: colors.danger,
  },
  deviceStatusText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
  },
  deviceLastSeen: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Engagement Summary
  engagementDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: SPACING[4],
  },
  engagementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  engagementBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  engagementValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.brand600,
    marginBottom: 2,
  },
  engagementLabel: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // AI Insights
  insightsCard: {
    backgroundColor: colors.brand50,
    borderColor: colors.brand200,
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
    backgroundColor: colors.card,
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
    marginBottom: 3,
  },
  insightText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  // Care Journal
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journalInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING[4],
  },
  journalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.brand200,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  journalAddButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.brand600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalAddButtonDisabled: {
    opacity: 0.4,
  },
  journalAddButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.textInverse,
    marginTop: -1,
  },
  journalEmpty: {
    alignItems: 'center',
    paddingVertical: SPACING[5],
  },
  journalEmptyIcon: {
    fontSize: 24,
    opacity: 0.4,
    marginBottom: SPACING[2],
  },
  journalEmptyText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },
  journalEntry: {
    flexDirection: 'row',
    gap: SPACING[3],
    paddingVertical: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  journalEntryIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  journalEntryContent: {
    flex: 1,
  },
  journalEntryText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  journalEntryMeta: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginTop: 2,
  },
}));
