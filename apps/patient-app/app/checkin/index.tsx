import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/stores/auth-store';
import { supabase } from '@ourturn/supabase';
import { queueCheckin } from '../../src/utils/offline-cache';
import { COLORS, FONTS, RADIUS } from '../../src/theme';

type MoodValue = 1 | 2 | 3 | 4 | 5;
type SleepValue = 1 | 2 | 3;

const MOOD_OPTIONS: { value: MoodValue; color: string; bg: string; labelKey: string }[] = [
  { value: 5, color: '#4A7C59', bg: '#EFF5F0', labelKey: 'moodGood' },
  { value: 3, color: '#C4882C', bg: '#FDF6EA', labelKey: 'moodOkay' },
  { value: 1, color: '#B8463A', bg: '#FAF0EE', labelKey: 'moodBad' },
];

const SLEEP_OPTIONS: { value: SleepValue; color: string; bg: string; labelKey: string }[] = [
  { value: 3, color: '#4A7C59', bg: '#EFF5F0', labelKey: 'sleepGood' },
  { value: 2, color: '#C4882C', bg: '#FDF6EA', labelKey: 'sleepOkay' },
  { value: 1, color: '#B8463A', bg: '#FAF0EE', labelKey: 'sleepBad' },
];

export default function CheckinScreen() {
  const { t } = useTranslation();
  const { patient, household } = useAuthStore();
  const [mood, setMood] = useState<MoodValue | null>(null);
  const [sleep, setSleep] = useState<SleepValue | null>(null);
  const [step, setStep] = useState<'mood' | 'sleep' | 'done'>('mood');
  const [loading, setLoading] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  // Check if already checked in today
  useEffect(() => {
    const checkExisting = async () => {
      if (!household?.id) return;

      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('household_id', household.id)
        .eq('date', today)
        .single();

      if (data) {
        setAlreadyDone(true);
      }
    };

    checkExisting();
  }, [household?.id]);

  const handleMoodSelect = async (value: MoodValue) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMood(value);
    setTimeout(() => setStep('sleep'), 300);
  };

  const handleSleepSelect = async (value: SleepValue) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSleep(value);
    // Submit directly after sleep selection
    submitCheckin(value);
  };

  const submitCheckin = async (sleepValue: SleepValue) => {
    if (!household?.id || !mood) return;

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      const { error } = await supabase.from('daily_checkins').insert({
        household_id: household.id,
        date: today,
        mood,
        sleep_quality: sleepValue,
        submitted_at: new Date().toISOString(),
      });

      if (error) throw error;

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('done');

      // Return to Today screen after delay
      setTimeout(() => {
        router.back();
      }, 2500);
    } catch (err) {
      if (__DEV__) console.error('Failed to submit check-in:', err);
      // Queue for offline sync so patient's check-in isn't lost
      await queueCheckin({
        householdId: household.id,
        date: today,
        mood,
        sleepQuality: sleepValue,
        submittedAt: new Date().toISOString(),
      });
      // Still show success to the patient — data is safely queued
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('done');
      setTimeout(() => router.back(), 2500);
      return;
    } finally {
      setLoading(false);
    }
  };

  if (alreadyDone) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.doneCard}>
            <View style={styles.doneIconCircle}>
              <Text style={styles.doneIconText}>{'✓'}</Text>
            </View>
            <Text style={styles.doneText}>{t('patientApp.checkin.alreadyDone')}</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'done') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.doneCard}>
            <View style={styles.doneIconCircle}>
              <Text style={styles.doneIconText}>{'✓'}</Text>
            </View>
            <Text style={styles.thankYouText}>{t('patientApp.checkin.thankYou')}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={COLORS.brand600} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Greeting */}
        <Text style={styles.greeting}>
          {t(`patientApp.checkin.greeting.${getTimeOfDay()}`, {
            name: patient?.name || '',
          })}
        </Text>

        {/* Mood Step */}
        {step === 'mood' && (
          <View style={styles.questionCard} accessible={false}>
            <Text
              style={styles.question}
              accessibilityRole="header"
            >
              {t('patientApp.checkin.moodQuestion')}
            </Text>
            <View
              style={styles.optionsColumn}
              accessibilityRole="radiogroup"
              accessibilityLabel={t('patientApp.checkin.moodQuestion')}
            >
              {MOOD_OPTIONS.map((option) => {
                const isSelected = mood === option.value;
                const label = t(`patientApp.checkin.${option.labelKey}`);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButtonWide,
                      { backgroundColor: option.bg, borderColor: option.color },
                      isSelected && { backgroundColor: option.color },
                    ]}
                    onPress={() => handleMoodSelect(option.value)}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityLabel={`${label}${isSelected ? ', selected' : ''}`}
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Text
                      style={[
                        styles.optionLabelWide,
                        { color: option.color },
                        isSelected && { color: COLORS.textInverse },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Sleep Step */}
        {step === 'sleep' && (
          <View style={styles.questionCard} accessible={false}>
            <Text
              style={styles.question}
              accessibilityRole="header"
            >
              {t('patientApp.checkin.sleepQuestion')}
            </Text>
            <View
              style={styles.optionsColumn}
              accessibilityRole="radiogroup"
              accessibilityLabel={t('patientApp.checkin.sleepQuestion')}
            >
              {SLEEP_OPTIONS.map((option) => {
                const isSelected = sleep === option.value;
                const label = t(`patientApp.checkin.${option.labelKey}`);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButtonWide,
                      { backgroundColor: option.bg, borderColor: option.color },
                      isSelected && { backgroundColor: option.color },
                    ]}
                    onPress={() => handleSleepSelect(option.value)}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityLabel={`${label}${isSelected ? ', selected' : ''}`}
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Text
                      style={[
                        styles.optionLabelWide,
                        { color: option.color },
                        isSelected && { color: COLORS.textInverse },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 40,
  },
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  question: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsColumn: {
    gap: 16,
    width: '100%',
  },
  optionButtonWide: {
    paddingVertical: 22,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
  },
  optionLabelWide: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
  },
  doneCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  doneIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  doneIconText: {
    fontSize: 36,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textInverse,
  },
  doneText: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  thankYouText: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    backgroundColor: COLORS.brand600,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  backButtonText: {
    fontSize: 20,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
});
