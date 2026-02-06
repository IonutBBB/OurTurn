import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { supabase } from '@ourturn/supabase';
import { useAuthStore } from '../../src/stores/auth-store';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

interface ReportStats {
  avgMood: number;
  avgSleep: number;
  checkinCount: number;
  overallCompletion: number;
  medAdherence: number;
  byCategory: Record<string, number>;
  notableObservations: string[];
  periodSummary: string;
}

interface SavedReport {
  id: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  content_json: any;
}

const PERIOD_OPTIONS = [
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
  { days: 30, label: '30 days' },
];

// Category labels are resolved via t() at render time
const CATEGORY_KEYS: Record<string, string> = {
  medication: 'caregiverApp.reports.categoryMedication',
  nutrition: 'caregiverApp.reports.categoryMeals',
  physical: 'caregiverApp.reports.categoryPhysical',
  cognitive: 'caregiverApp.reports.categoryCognitive',
  social: 'caregiverApp.reports.categorySocial',
  health: 'caregiverApp.reports.categoryHealth',
};

// Mood labels are resolved via t() at render time
const MOOD_LABEL_KEYS: Record<number, string> = {
  1: 'caregiverApp.reports.moodStruggling',
  2: 'caregiverApp.reports.moodLow',
  3: 'caregiverApp.reports.moodOkay',
  4: 'caregiverApp.reports.moodGood',
  5: 'caregiverApp.reports.moodGreat',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ReportsScreen() {
  const { t } = useTranslation();
  const { household, patient, caregiver } = useAuthStore();

  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [viewingReport, setViewingReport] = useState<SavedReport | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);

  // Load saved reports
  useEffect(() => {
    if (!household?.id) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('doctor_visit_reports')
          .select('*')
          .eq('household_id', household.id)
          .order('generated_at', { ascending: false })
          .limit(10);
        setReports(data || []);
      } catch (err) {
        // Table may not exist yet — that's OK
      } finally {
        setLoadingReports(false);
      }
    })();
  }, [household?.id]);

  const generateReport = useCallback(async () => {
    if (!household?.id || !caregiver?.id) return;
    setIsGenerating(true);

    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - selectedPeriod);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = today.toISOString().split('T')[0];

      // Fetch checkins
      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('household_id', household.id)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: false });

      // Fetch task completions
      const { data: completions } = await supabase
        .from('task_completions')
        .select('*, care_plan_tasks(category, title)')
        .eq('household_id', household.id)
        .gte('date', startStr)
        .lte('date', endStr);

      // Fetch active tasks
      const { data: tasks } = await supabase
        .from('care_plan_tasks')
        .select('*')
        .eq('household_id', household.id)
        .eq('active', true);

      // Fetch journal entries
      const { data: journal } = await supabase
        .from('care_journal_entries')
        .select('*')
        .eq('household_id', household.id)
        .gte('created_at', `${startStr}T00:00:00`)
        .lte('created_at', `${endStr}T23:59:59`)
        .order('created_at', { ascending: false });

      // Calculate stats
      const moodValues = (checkins || []).filter(c => c.mood).map(c => c.mood);
      const avgMood = moodValues.length > 0
        ? moodValues.reduce((a: number, b: number) => a + b, 0) / moodValues.length
        : 0;

      const sleepValues = (checkins || []).filter(c => c.sleep_quality).map(c => c.sleep_quality);
      const avgSleep = sleepValues.length > 0
        ? sleepValues.reduce((a: number, b: number) => a + b, 0) / sleepValues.length
        : 0;

      const daysInPeriod = selectedPeriod;
      const totalExpected = (tasks || []).length * daysInPeriod;
      const totalCompleted = (completions || []).filter(c => c.completed).length;
      const overallCompletion = totalExpected > 0
        ? Math.round((totalCompleted / totalExpected) * 100)
        : 0;

      // Medication adherence
      const medTasks = (tasks || []).filter(t => t.category === 'medication');
      const medCompletions = (completions || []).filter(
        c => (c.care_plan_tasks as any)?.category === 'medication' && c.completed
      ).length;
      const expectedMed = medTasks.length * daysInPeriod;
      const medAdherence = expectedMed > 0
        ? Math.round((medCompletions / expectedMed) * 100)
        : 0;

      // By category
      const byCategory: Record<string, number> = {};
      (tasks || []).forEach(task => {
        const catCompletions = (completions || []).filter(
          c => (c.care_plan_tasks as any)?.category === task.category && c.completed
        ).length;
        const catExpected = daysInPeriod;
        byCategory[task.category] = catExpected > 0
          ? Math.round((catCompletions / catExpected) * 100)
          : 0;
      });

      // Notable observations
      const notableObservations = (journal || [])
        .filter(e => e.entry_type === 'observation')
        .slice(0, 5)
        .map(e => e.content);

      const periodSummary = `Care summary for ${patient?.name || 'patient'} from ${formatDate(startStr)} to ${formatDate(endStr)}. Based on ${(checkins || []).length} daily check-ins.`;

      const reportStats: ReportStats = {
        avgMood: Math.round(avgMood * 10) / 10,
        avgSleep: Math.round(avgSleep * 10) / 10,
        checkinCount: (checkins || []).length,
        overallCompletion,
        medAdherence,
        byCategory,
        notableObservations,
        periodSummary,
      };

      setStats(reportStats);

      // Save to DB
      try {
        const { data: newReport } = await supabase
          .from('doctor_visit_reports')
          .insert({
            household_id: household.id,
            generated_by: caregiver.id,
            period_start: startStr,
            period_end: endStr,
            content_json: {
              period_summary: periodSummary,
              mood_trends: { average: reportStats.avgMood, trend: 'stable', notable_days: [] },
              sleep_patterns: {
                average_quality: reportStats.avgSleep,
                good_nights: sleepValues.filter(s => s >= 3).length,
                poor_nights: sleepValues.filter(s => s <= 1).length,
              },
              activity_completion: { overall_rate: overallCompletion, by_category: byCategory },
              medication_adherence: { rate: medAdherence, missed_count: expectedMed - medCompletions },
              notable_observations: notableObservations,
              caregiver_concerns: [],
            },
          })
          .select()
          .single();

        if (newReport) {
          setReports(prev => [newReport, ...prev]);
        }
      } catch {
        // Table may not exist — report still displays in-app
      }
    } catch (err) {
      Alert.alert(t('common.error'));
    } finally {
      setIsGenerating(false);
    }
  }, [household?.id, caregiver?.id, selectedPeriod, patient?.name]);

  const handleShareReport = useCallback(async () => {
    if (!stats) return;
    const text = [
      t('caregiverApp.reports.careSummary'),
      `${t('caregiverApp.reports.patient')}: ${patient?.name || 'N/A'}`,
      `${t('caregiverApp.reports.periodLabel')}: ${t('caregiverApp.reports.lastDays', { days: selectedPeriod })}`,
      '',
      `${t('caregiverApp.reports.checkinsRecorded')}: ${stats.checkinCount}`,
      `${t('caregiverApp.reports.averageMood')}: ${stats.avgMood}/5`,
      `${t('caregiverApp.reports.averageSleepQuality')}: ${stats.avgSleep}/3`,
      `${t('caregiverApp.reports.activityCompletionRate')}: ${stats.overallCompletion}%`,
      `${t('caregiverApp.reports.medicationAdherenceRate')}: ${stats.medAdherence}%`,
      '',
      Object.entries(stats.byCategory).map(([cat, rate]) =>
        `  ${CATEGORY_KEYS[cat] ? t(CATEGORY_KEYS[cat]) : cat}: ${rate}%`
      ).join('\n'),
      '',
      stats.notableObservations.length > 0
        ? `${t('caregiverApp.reports.observations')}:\n${stats.notableObservations.map(o => `  - ${o}`).join('\n')}`
        : '',
      '',
      t('caregiverApp.reports.disclaimer'),
    ].filter(Boolean).join('\n');

    await Share.share({ message: text, title: t('caregiverApp.reports.careSummary') });
  }, [stats, patient?.name, selectedPeriod]);

  const viewSavedReport = useCallback((report: SavedReport) => {
    const content = report.content_json;
    setStats({
      avgMood: content.mood_trends?.average || 0,
      avgSleep: content.sleep_patterns?.average_quality || 0,
      checkinCount: 0,
      overallCompletion: content.activity_completion?.overall_rate || 0,
      medAdherence: content.medication_adherence?.rate || 0,
      byCategory: content.activity_completion?.by_category || {},
      notableObservations: content.notable_observations || [],
      periodSummary: content.period_summary || '',
    });
    setViewingReport(report);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('caregiverApp.reports.title')}</Text>
        </View>

        {/* Period selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.reports.period')}</Text>
          <View style={styles.periodRow}>
            {PERIOD_OPTIONS.map(({ days, label }) => (
              <TouchableOpacity
                key={days}
                style={[styles.periodPill, selectedPeriod === days && styles.periodPillSelected]}
                onPress={() => setSelectedPeriod(days)}
                activeOpacity={0.7}
              >
                <Text style={[styles.periodText, selectedPeriod === days && styles.periodTextSelected]}>
                  {t('caregiverApp.reports.lastDays', { days })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={generateReport}
            disabled={isGenerating}
            activeOpacity={0.7}
          >
            {isGenerating ? (
              <ActivityIndicator color={COLORS.textInverse} size="small" />
            ) : (
              <Text style={styles.generateButtonText}>{t('caregiverApp.reports.generate')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Report Stats */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {viewingReport
                ? `${formatDate(viewingReport.period_start)} — ${formatDate(viewingReport.period_end)}`
                : t('caregiverApp.reports.lastDays', { days: selectedPeriod })}
            </Text>

            <Text style={styles.summaryText}>{stats.periodSummary}</Text>

            {/* Mood & Sleep cards */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t('caregiverApp.reports.moodTrends')}</Text>
                <Text style={styles.statValue}>{stats.avgMood}/5</Text>
                <Text style={styles.statCaption}>
                  {MOOD_LABEL_KEYS[Math.round(stats.avgMood)] ? t(MOOD_LABEL_KEYS[Math.round(stats.avgMood)]) : 'N/A'}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t('caregiverApp.reports.sleepPatterns')}</Text>
                <Text style={styles.statValue}>{stats.avgSleep}/3</Text>
                <Text style={styles.statCaption}>{t('caregiverApp.reports.avgQuality')}</Text>
              </View>
            </View>

            {/* Completion rates */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('caregiverApp.reports.activityCompletion')}</Text>
              <Text style={styles.bigStat}>{stats.overallCompletion}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stats.overallCompletion}%` }]} />
              </View>

              {Object.keys(stats.byCategory).length > 0 && (
                <View style={styles.categoryGrid}>
                  {Object.entries(stats.byCategory).map(([cat, rate]) => (
                    <View key={cat} style={styles.categoryStatItem}>
                      <Text style={styles.categoryStatLabel}>{CATEGORY_KEYS[cat] ? t(CATEGORY_KEYS[cat]) : cat}</Text>
                      <Text style={styles.categoryStatValue}>{rate}%</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Medication */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('caregiverApp.reports.medicationAdherence')}</Text>
              <Text style={styles.bigStat}>{stats.medAdherence}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stats.medAdherence}%` }]} />
              </View>
            </View>

            {/* Observations */}
            {stats.notableObservations.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('caregiverApp.reports.journalNotes')}</Text>
                {stats.notableObservations.map((obs, i) => (
                  <View key={i} style={styles.observationRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.observationText}>{obs}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Share */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShareReport} activeOpacity={0.7}>
              <Text style={styles.shareButtonText}>{t('caregiverApp.reports.print')}</Text>
            </TouchableOpacity>

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>{t('caregiverApp.reports.disclaimer')}</Text>
          </View>
        )}

        {/* Previous Reports */}
        {reports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('caregiverApp.reports.previousReports')}</Text>
            {reports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={[styles.reportItem, viewingReport?.id === report.id && styles.reportItemActive]}
                onPress={() => viewSavedReport(report)}
                activeOpacity={0.7}
              >
                <Text style={styles.reportItemDate}>
                  {formatDate(report.period_start)} — {formatDate(report.period_end)}
                </Text>
                <Text style={styles.reportItemGenerated}>
                  {t('caregiverApp.reports.generated', { date: formatDate(report.generated_at) })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingBottom: 40,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: COLORS.brand600,
    fontFamily: FONTS.bodyMedium,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Period selector
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  periodPillSelected: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand50,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  periodTextSelected: {
    color: COLORS.brand700,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },

  // Summary
  summaryText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.brand600,
  },
  statCaption: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Cards
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  bigStat: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.brand600,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.brand50,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.brand600,
    borderRadius: 4,
  },

  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryStatItem: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: '45%',
    flex: 1,
  },
  categoryStatLabel: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  categoryStatValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
  },

  // Observations
  observationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: COLORS.brand600,
    lineHeight: 20,
  },
  observationText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  // Share
  shareButton: {
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.brand600,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand600,
  },

  // Disclaimer
  disclaimer: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // Previous reports
  reportItem: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    ...SHADOWS.sm,
  },
  reportItemActive: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand50,
  },
  reportItemDate: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  reportItemGenerated: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
