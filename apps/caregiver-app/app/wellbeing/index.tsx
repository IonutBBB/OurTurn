import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';
import { supabase } from '@ourturn/supabase';
import type {
  CaregiverWellbeingLog,
  SliderValue,
  HelpRequest,
} from '@ourturn/shared';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS } from '../../src/theme';

import { SliderCheckin } from '../../src/components/toolkit/slider-checkin';
import { QuickRelief } from '../../src/components/toolkit/quick-relief';
import { HelpRequestForm } from '../../src/components/toolkit/help-request-form';
import { WellbeingAgent } from '../../src/components/toolkit/wellbeing-agent';
import { DailyGoal } from '../../src/components/toolkit/daily-goal';
import { WeeklyStats } from '../../src/components/toolkit/weekly-stats';
import { SosButton } from '../../src/components/toolkit/sos-button';

const API_BASE_URL = process.env.EXPO_PUBLIC_WEB_URL || '';

export default function ToolkitScreen() {
  const { t } = useTranslation();
  const { caregiver } = useAuthStore();
  const styles = useStyles();
  const colors = useColors();

  const [todayLog, setTodayLog] = useState<CaregiverWellbeingLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<CaregiverWellbeingLog[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [showBurnout, setShowBurnout] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      if (!caregiver?.id) return;

      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const twentyEightDaysAgo = new Date();
        twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

        const [todayResult, recentResult, helpResult] = await Promise.all([
          supabase
            .from('caregiver_wellbeing_logs')
            .select('*')
            .eq('caregiver_id', caregiver.id)
            .eq('date', today)
            .single(),
          supabase
            .from('caregiver_wellbeing_logs')
            .select('*')
            .eq('caregiver_id', caregiver.id)
            .gte('date', twentyEightDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: false }),
          supabase
            .from('caregiver_help_requests')
            .select('*')
            .eq('household_id', caregiver.household_id)
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        if (todayResult.data) setTodayLog(todayResult.data);
        setRecentLogs(recentResult.data || []);
        setHelpRequests(helpResult.data || []);

        // Check burnout
        const burnoutLogs = (recentResult.data || [])
          .filter((l) => {
            const logDate = new Date(l.date);
            return logDate >= sevenDaysAgo;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let consecutiveHighStress = 0;
        let consecutiveLowEnergy = 0;
        for (const log of burnoutLogs) {
          if (log.stress_level !== null && log.stress_level >= 4) consecutiveHighStress++;
          else consecutiveHighStress = 0;
          if (log.energy_level !== null && log.energy_level <= 2) consecutiveLowEnergy++;
          else consecutiveLowEnergy = 0;
          if (consecutiveHighStress >= 3 || consecutiveLowEnergy >= 3) {
            setShowBurnout(true);
            break;
          }
        }
      } catch (err) {
        if (__DEV__) console.error('Failed to load toolkit data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [caregiver?.id, today]);

  const handleLogUpdated = useCallback((log: CaregiverWellbeingLog) => {
    setTodayLog(log);
  }, []);

  const handleExerciseComplete = useCallback(async (exerciseId: string) => {
    if (!caregiver?.id) return;
    try {
      const existingExercises = todayLog?.relief_exercises_used || [];
      const updated = [...new Set([...existingExercises, exerciseId])];

      await supabase
        .from('caregiver_wellbeing_logs')
        .upsert(
          {
            caregiver_id: caregiver.id,
            date: today,
            relief_exercises_used: updated,
          },
          { onConflict: 'caregiver_id,date' }
        );

      setTodayLog((prev) => prev ? { ...prev, relief_exercises_used: updated } : prev);
    } catch {
      // Silent
    }
  }, [caregiver?.id, today, todayLog]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand600} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>&#8249; {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('caregiverApp.toolkit.pageTitle')}</Text>
        </View>

        <Text style={styles.subtitle}>
          {t('caregiverApp.toolkit.introMessage', { name: caregiver?.name || '' })}
        </Text>

        {/* Burnout Warning */}
        {showBurnout && (
          <View style={styles.burnoutBanner}>
            <Text style={styles.burnoutEmoji}>{'\u{1F49B}'}</Text>
            <View style={styles.burnoutContent}>
              <Text style={styles.burnoutTitle}>{t('caregiverApp.toolkit.burnout.title')}</Text>
              <Text style={styles.burnoutMessage}>{t('caregiverApp.toolkit.burnout.message')}</Text>
            </View>
          </View>
        )}

        {/* Slider Check-in */}
        <SliderCheckin
          caregiverId={caregiver?.id || ''}
          initialLog={todayLog}
          onLogUpdated={handleLogUpdated}
        />

        <View style={styles.spacer} />

        {/* Wellbeing Companion */}
        <WellbeingAgent
          caregiverId={caregiver?.id || ''}
          caregiverName={caregiver?.name || ''}
          energy={todayLog?.energy_level as SliderValue | null}
          stress={todayLog?.stress_level as SliderValue | null}
          sleep={todayLog?.sleep_quality_rating as SliderValue | null}
          apiBaseUrl={API_BASE_URL}
        />

        <View style={styles.spacer} />

        {/* Quick Relief Station */}
        <QuickRelief
          stress={todayLog?.stress_level as SliderValue | null}
          energy={todayLog?.energy_level as SliderValue | null}
          sleep={todayLog?.sleep_quality_rating as SliderValue | null}
          onExerciseComplete={handleExerciseComplete}
        />

        <View style={styles.spacer} />

        {/* Daily Goal */}
        <DailyGoal
          caregiverId={caregiver?.id || ''}
          initialLog={todayLog}
          recentLogs={recentLogs}
        />

        <View style={styles.spacer} />

        {/* Ask for Help */}
        <HelpRequestForm
          caregiverId={caregiver?.id || ''}
          householdId={caregiver?.household_id || ''}
          initialRequests={helpRequests}
        />

        <View style={styles.spacer} />

        {/* Weekly Insights */}
        <WeeklyStats
          recentLogs={recentLogs}
          apiBaseUrl={API_BASE_URL}
        />

        <View style={styles.spacer} />

        {/* Support Resources */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>{t('caregiverApp.toolkit.support.title')}</Text>
          <Text style={styles.supportText}>{t('caregiverApp.toolkit.support.description')}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('caregiverApp.toolkit.footer')}</Text>
        </View>
      </ScrollView>

      {/* SOS Floating Button */}
      <SosButton householdId={caregiver?.household_id || ''} />
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 18,
    color: colors.brand600,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  spacer: {
    height: 20,
  },
  burnoutBanner: {
    flexDirection: 'row',
    backgroundColor: colors.amberBg,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.amber + '30',
    marginBottom: 20,
    gap: 12,
  },
  burnoutEmoji: {
    fontSize: 24,
  },
  burnoutContent: {
    flex: 1,
  },
  burnoutTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.amber,
    marginBottom: 4,
  },
  burnoutMessage: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  supportCard: {
    backgroundColor: colors.brand50,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.brand200,
    ...SHADOWS.sm,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand800,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.brand700,
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.brand50,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
}));
