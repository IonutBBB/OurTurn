import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../src/stores/auth-store';
import { useVoiceRecording } from '../../src/hooks/use-voice-recording';
import { getReminiscencePrompts, type ActivityPrompt } from '../../src/utils/activity-templates';
import { pickDaily } from '../../src/utils/daily-seed';
import { formatDateForDb } from '../../src/utils/time-of-day';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

export default function ActivityRememberScreen() {
  const { t } = useTranslation();
  const { patient } = useAuthStore();
  const [responseMode, setResponseMode] = useState<'prompt' | 'voice' | 'text' | 'done'>('prompt');
  const [textResponse, setTextResponse] = useState('');
  const [saving, setSaving] = useState(false);

  const today = formatDateForDb();

  const {
    isRecording,
    isPlaying,
    formattedDuration,
    recordingUri,
    error: voiceError,
    startRecordingAsync,
    stopRecordingAsync,
    playRecordingAsync,
    stopPlaybackAsync,
    reset: resetVoice,
  } = useVoiceRecording();

  // Pick today's reminiscence prompt deterministically
  const prompts = getReminiscencePrompts(patient?.biography, patient?.photos);
  const todaysPrompt = pickDaily(prompts);

  // Check if already completed
  useEffect(() => {
    const check = async () => {
      const done = await AsyncStorage.getItem(`activity_completed_remember_${today}`);
      if (done === 'true') {
        setResponseMode('done');
      }
    };
    check();
  }, [today]);

  const getPromptText = (prompt: ActivityPrompt | null): string => {
    if (!prompt) return '';
    if (prompt.personName) {
      return t('patientApp.activities.remember.personPrompt', {
        name: prompt.personName,
        relationship: prompt.personRelationship || '',
      });
    }
    if (prompt.promptKey && prompt.promptText) {
      return t(prompt.promptKey, { text: prompt.promptText });
    }
    if (prompt.photoUrl) {
      return t('patientApp.activities.remember.photoPrompt');
    }
    return '';
  };

  const markComplete = async () => {
    await AsyncStorage.setItem(`activity_completed_remember_${today}`, 'true');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setResponseMode('done');
  };

  const handleStartVoice = async () => {
    setResponseMode('voice');
    const success = await startRecordingAsync();
    if (!success) {
      setResponseMode('prompt');
    }
  };

  const handleStopRecording = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await stopRecordingAsync();
  };

  const handleSubmitVoice = async () => {
    setSaving(true);
    await markComplete();
    setSaving(false);
  };

  const handleSubmitText = async () => {
    if (!textResponse.trim()) return;
    setSaving(true);
    await markComplete();
    setSaving(false);
  };

  const handleSkip = () => {
    router.back();
  };

  const handleDone = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!todaysPrompt) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>💭</Text>
            <Text style={styles.emptyTitle}>{t('patientApp.activities.remember.noPrompts')}</Text>
            <TouchableOpacity style={styles.doneButton} onPress={() => router.back()} activeOpacity={0.8}>
              <Text style={styles.doneButtonText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Done / follow-up
  if (responseMode === 'done') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.followUpCard}>
            <Text style={styles.followUpEmoji}>💙</Text>
            <Text style={styles.followUpText}>
              {t('patientApp.activities.remember.followUp')}
            </Text>
            <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
              <Text style={styles.doneButtonText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const promptText = getPromptText(todaysPrompt);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>💭</Text>
            <Text style={styles.headerTitle}>{t('patientApp.activities.remember.title')}</Text>
          </View>

          {/* Activity card */}
          <View style={styles.activityCard}>
            {/* Photo if available */}
            {todaysPrompt.photoUrl && (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: todaysPrompt.photoUrl }}
                  style={styles.photo}
                  resizeMode="cover"
                  accessibilityLabel={t('patientApp.activity.photoMemory')}
                />
              </View>
            )}

            <Text style={styles.promptText}>{promptText}</Text>

            {/* Prompt state — choose response type */}
            {responseMode === 'prompt' && (
              <View style={styles.chooseContainer}>
                <TouchableOpacity
                  style={styles.responseOption}
                  onPress={handleStartVoice}
                  activeOpacity={0.8}
                >
                  <Text style={styles.responseOptionEmoji}>🎤</Text>
                  <Text style={styles.responseOptionText}>
                    {t('patientApp.activity.tapToSpeak')}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.orText}>{t('common.or')}</Text>

                <TouchableOpacity
                  style={styles.textOptionButton}
                  onPress={() => setResponseMode('text')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.textOptionText}>
                    {t('patientApp.activity.typeInstead')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Voice recording */}
            {responseMode === 'voice' && (
              <View style={styles.voiceContainer}>
                {isRecording ? (
                  <>
                    <View style={styles.recordingIndicator}>
                      <View style={styles.recordingDot} />
                      <Text style={styles.recordingTime}>{formattedDuration}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.stopButton}
                      onPress={handleStopRecording}
                      activeOpacity={0.8}
                    >
                      <View style={styles.stopIcon} />
                    </TouchableOpacity>
                    <Text style={styles.recordingHint}>{t('patientApp.activity.tapToStop')}</Text>
                  </>
                ) : recordingUri ? (
                  <>
                    <View style={styles.playbackContainer}>
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={isPlaying ? stopPlaybackAsync : playRecordingAsync}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
                      </TouchableOpacity>
                      <Text style={styles.durationText}>{formattedDuration}</Text>
                    </View>
                    <View style={styles.voiceActions}>
                      <TouchableOpacity
                        style={styles.redoButton}
                        onPress={() => { resetVoice(); handleStartVoice(); }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.redoButtonText}>{t('patientApp.activity.recordAgain')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.submitButton, saving && styles.submitButtonDisabled]}
                        onPress={handleSubmitVoice}
                        disabled={saving}
                        activeOpacity={0.8}
                      >
                        {saving ? (
                          <ActivityIndicator color={COLORS.textInverse} />
                        ) : (
                          <Text style={styles.submitButtonText}>{t('common.done')}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.voiceButton}
                    onPress={handleStartVoice}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.voiceButtonEmoji}>🎤</Text>
                    <Text style={styles.voiceButtonText}>{t('patientApp.activity.tapToSpeak')}</Text>
                  </TouchableOpacity>
                )}
                {voiceError && <Text style={styles.errorText}>{voiceError}</Text>}
              </View>
            )}

            {/* Text input */}
            {responseMode === 'text' && (
              <View style={styles.textContainer}>
                <TextInput
                  style={styles.textInput}
                  value={textResponse}
                  onChangeText={setTextResponse}
                  placeholder={t('patientApp.activity.typeHere')}
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  maxLength={500}
                  autoFocus
                />
                <View style={styles.textActions}>
                  <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => { setResponseMode('voice'); handleStartVoice(); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.switchButtonEmoji}>🎤</Text>
                    <Text style={styles.switchButtonText}>{t('patientApp.activity.speakInstead')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitButton, (!textResponse.trim() || saving) && styles.submitButtonDisabled]}
                    onPress={handleSubmitText}
                    disabled={!textResponse.trim() || saving}
                    activeOpacity={0.8}
                  >
                    {saving ? (
                      <ActivityIndicator color={COLORS.textInverse} />
                    ) : (
                      <Text style={styles.submitButtonText}>{t('common.done')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Skip */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>{t('patientApp.activity.skipForToday')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary },
  activityCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoContainer: { alignItems: 'center', marginBottom: 20 },
  photo: { width: 300, height: 300, borderRadius: 20, borderWidth: 2, borderColor: COLORS.border },
  promptText: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 32,
  },
  chooseContainer: { alignItems: 'center' },
  responseOption: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: COLORS.brand50, borderWidth: 3, borderColor: COLORS.brand600,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  responseOptionEmoji: { fontSize: 48, marginBottom: 8 },
  responseOptionText: { fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.brand700 },
  orText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted, marginVertical: 16 },
  textOptionButton: {
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  textOptionText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textSecondary },
  voiceContainer: { alignItems: 'center' },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  recordingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.danger, marginRight: 8 },
  recordingTime: { fontSize: 32, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary },
  stopButton: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.danger,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  stopIcon: { width: 24, height: 24, backgroundColor: COLORS.textInverse, borderRadius: 4 },
  recordingHint: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
  playbackContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  playButton: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.brand100,
    alignItems: 'center', justifyContent: 'center',
  },
  playIcon: { fontSize: 28 },
  durationText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary },
  voiceActions: { flexDirection: 'row', gap: 12 },
  redoButton: {
    paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  redoButtonText: { fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary },
  submitButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center', minWidth: 100,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { fontSize: 20, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  voiceButton: {
    width: 180, height: 180, borderRadius: 90, backgroundColor: COLORS.brand50,
    borderWidth: 3, borderColor: COLORS.brand600, alignItems: 'center', justifyContent: 'center',
  },
  voiceButtonEmoji: { fontSize: 48, marginBottom: 8 },
  voiceButtonText: { fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.brand700 },
  errorText: { marginTop: 12, fontSize: 20, fontFamily: FONTS.body, color: COLORS.danger, textAlign: 'center' },
  textContainer: { width: '100%' },
  textInput: {
    backgroundColor: COLORS.background, borderRadius: 16, padding: 16,
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textPrimary,
    minHeight: 120, textAlignVertical: 'top', marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  textActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16 },
  switchButtonEmoji: { fontSize: 20, marginRight: 8 },
  switchButtonText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textSecondary },
  skipButton: { marginTop: 24, alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
  emptyCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS['2xl'], padding: 40,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary, textAlign: 'center', marginBottom: 24 },
  followUpCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS['2xl'], padding: 40,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  followUpEmoji: { fontSize: 64, marginBottom: 24 },
  followUpText: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 32, marginBottom: 32,
  },
  doneButton: { backgroundColor: COLORS.brand600, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 16 },
  doneButtonText: { fontSize: 20, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
});
