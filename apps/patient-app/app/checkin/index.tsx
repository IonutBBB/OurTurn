import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  cancelAnimation,
} from 'react-native-reanimated';
import { useAuthStore } from '../../src/stores/auth-store';
import { useVoiceRecording } from '../../src/hooks/use-voice-recording';
import { supabase } from '@memoguard/supabase';
import { queueCheckin } from '../../src/utils/offline-cache';
import { getRecordingButtonLabel, getMoodSelectionLabel } from '@memoguard/shared';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

type MoodValue = 1 | 2 | 3 | 4 | 5;
type SleepValue = 1 | 2 | 3;

const MOOD_OPTIONS: { value: MoodValue; emoji: string; labelKey: string }[] = [
  { value: 5, emoji: '😊', labelKey: 'moodGood' },
  { value: 3, emoji: '😐', labelKey: 'moodOkay' },
  { value: 1, emoji: '😟', labelKey: 'moodBad' },
];

const SLEEP_OPTIONS: { value: SleepValue; emoji: string; labelKey: string }[] = [
  { value: 3, emoji: '😴', labelKey: 'sleepGood' },
  { value: 2, emoji: '🙂', labelKey: 'sleepOkay' },
  { value: 1, emoji: '😩', labelKey: 'sleepBad' },
];

export default function CheckinScreen() {
  const { t } = useTranslation();
  const { patient, household } = useAuthStore();
  const [mood, setMood] = useState<MoodValue | null>(null);
  const [sleep, setSleep] = useState<SleepValue | null>(null);
  const [step, setStep] = useState<'mood' | 'sleep' | 'voice' | 'done'>('mood');
  const [loading, setLoading] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  const {
    isRecording,
    isPlaying,
    isUploading,
    formattedDuration,
    recordingUri,
    error: recordingError,
    startRecordingAsync,
    stopRecordingAsync,
    playRecordingAsync,
    stopPlaybackAsync,
    uploadRecordingAsync,
    reset: resetRecording,
  } = useVoiceRecording();

  // Pulse animation for recording
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withTiming(1.1, { duration: 700 }),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withSpring(1);
    }
  }, [isRecording]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

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
    setTimeout(() => setStep('voice'), 300);
  };

  const handleVoiceButtonPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isRecording) {
      // Stop recording
      await stopRecordingAsync();
    } else if (recordingUri) {
      // Play recorded audio
      if (isPlaying) {
        await stopPlaybackAsync();
      } else {
        await playRecordingAsync();
      }
    } else {
      // Start recording
      await startRecordingAsync();
    }
  };

  const handleDiscardRecording = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetRecording();
  };

  const submitCheckin = async (voiceNoteUrl?: string) => {
    if (!household?.id || !mood || !sleep) return;

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {

      const { error } = await supabase.from('daily_checkins').insert({
        household_id: household.id,
        date: today,
        mood,
        sleep_quality: sleep,
        voice_note_url: voiceNoteUrl || null,
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
        sleepQuality: sleep,
        voiceNoteUrl: voiceNoteUrl || undefined,
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

  const handleSubmit = async () => {
    if (!household?.id) return;

    if (recordingUri) {
      // Upload voice note first
      const today = new Date().toISOString().split('T')[0];
      const voiceNoteUrl = await uploadRecordingAsync(household.id, today);
      await submitCheckin(voiceNoteUrl || undefined);
    } else {
      await submitCheckin();
    }
  };

  if (alreadyDone) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>✅</Text>
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
            <Text style={styles.doneEmoji}>💙</Text>
            <Text style={styles.thankYouText}>{t('patientApp.checkin.thankYou')}</Text>
          </View>
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
              style={styles.optionsRow}
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
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleMoodSelect(option.value)}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityLabel={getMoodSelectionLabel(option.emoji, label, isSelected)}
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Text style={styles.optionEmoji} importantForAccessibility="no">{option.emoji}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
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
              style={styles.optionsRow}
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
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleSleepSelect(option.value)}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityLabel={getMoodSelectionLabel(option.emoji, label, isSelected)}
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Text style={styles.optionEmoji} importantForAccessibility="no">{option.emoji}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
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

        {/* Voice Step */}
        {step === 'voice' && (
          <View style={styles.questionCard} accessible={false}>
            <Text
              style={styles.question}
              accessibilityRole="header"
            >
              {t('patientApp.checkin.voicePrompt')}
            </Text>

            {/* Voice recording button */}
            <Animated.View style={pulseStyle}>
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  isRecording && styles.voiceButtonRecording,
                  recordingUri && !isRecording && styles.voiceButtonDone,
                ]}
                onPress={handleVoiceButtonPress}
                activeOpacity={0.8}
                disabled={isUploading || loading}
                accessibilityRole="button"
                accessibilityLabel={getRecordingButtonLabel(
                  isRecording,
                  !!recordingUri,
                  isPlaying,
                  formattedDuration
                )}
                accessibilityState={{
                  disabled: isUploading || loading,
                  busy: isRecording,
                }}
                accessibilityLiveRegion="polite"
              >
                {isRecording ? (
                  <>
                    <Text style={styles.voiceIcon} importantForAccessibility="no">⏹</Text>
                    <Text style={styles.voiceText}>{t('patientApp.checkin.voiceStop')}</Text>
                    <Text style={styles.durationText}>{formattedDuration}</Text>
                  </>
                ) : recordingUri ? (
                  <>
                    <Text style={styles.voiceIcon} importantForAccessibility="no">{isPlaying ? '⏸' : '▶️'}</Text>
                    <Text style={styles.voiceTextDone}>
                      {isPlaying ? t('patientApp.checkin.voicePause') : t('patientApp.checkin.voicePlay')}
                    </Text>
                    <Text style={styles.durationText}>{formattedDuration}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.voiceIcon} importantForAccessibility="no">🎤</Text>
                    <Text style={styles.voiceText}>{t('patientApp.checkin.voiceTap')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Recording error */}
            {recordingError && (
              <Text style={styles.errorText}>{recordingError}</Text>
            )}

            {/* Discard button (only show when there's a recording) */}
            {recordingUri && !isRecording && (
              <TouchableOpacity
                style={styles.discardButton}
                onPress={handleDiscardRecording}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t('patientApp.checkin.voiceDiscard')}
                accessibilityHint={t('a11y.removesVoiceRecording')}
              >
                <Text style={styles.discardText}>{t('patientApp.checkin.voiceDiscard')}</Text>
              </TouchableOpacity>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isRecording && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || isRecording || isUploading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={
                recordingUri
                  ? t('patientApp.checkin.send')
                  : t('patientApp.checkin.skipVoice')
              }
              accessibilityState={{
                disabled: loading || isRecording || isUploading,
                busy: loading || isUploading,
              }}
            >
              {loading || isUploading ? (
                <ActivityIndicator
                  color={COLORS.textInverse}
                  accessibilityLabel={t('a11y.submittingCheckin')}
                />
              ) : (
                <Text style={styles.submitButtonText}>
                  {recordingUri ? t('patientApp.checkin.send') : t('patientApp.checkin.skipVoice')}
                </Text>
              )}
            </TouchableOpacity>
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  optionButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    minWidth: 100,
  },
  optionButtonSelected: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand50,
  },
  optionEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 20,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  optionLabelSelected: {
    color: COLORS.brand700,
    fontFamily: FONTS.bodySemiBold,
  },
  voiceButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.brand50,
    borderWidth: 3,
    borderColor: COLORS.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  voiceButtonRecording: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.danger,
  },
  voiceButtonDone: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
  },
  voiceIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  voiceText: {
    fontSize: 20,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.brand700,
  },
  voiceTextDone: {
    fontSize: 20,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.success,
  },
  durationText: {
    fontSize: 20,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  discardButton: {
    padding: 12,
    marginBottom: 8,
  },
  discardText: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.danger,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    minWidth: 200,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 20,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  doneCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  doneEmoji: {
    fontSize: 64,
    marginBottom: 24,
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
