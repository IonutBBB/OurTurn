import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMovementPromptKeys } from '../../src/utils/activity-templates';
import { pickDaily } from '../../src/utils/daily-seed';
import { formatDateForDb } from '../../src/utils/time-of-day';
import { COLORS, FONTS, RADIUS } from '../../src/theme';

export default function ActivityMoveScreen() {
  const { t } = useTranslation();
  const [isDone, setIsDone] = useState(false);

  const today = formatDateForDb();
  const promptKeys = getMovementPromptKeys();
  const todaysPromptKey = pickDaily(promptKeys);

  useEffect(() => {
    const check = async () => {
      const done = await AsyncStorage.getItem(`activity_completed_move_${today}`);
      if (done === 'true') setIsDone(true);
    };
    check();
  }, [today]);

  const handleDidIt = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem(`activity_completed_move_${today}`, 'true');
    setIsDone(true);
  };

  const handleDone = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isDone) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.followUpCard}>
            <Text style={styles.followUpEmoji}>💪</Text>
            <Text style={styles.followUpText}>
              {t('patientApp.activities.move.followUp')}
            </Text>
            <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
              <Text style={styles.doneButtonText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🚶</Text>
          <Text style={styles.headerTitle}>{t('patientApp.activities.move.title')}</Text>
        </View>

        {/* Activity card */}
        <View style={styles.activityCard}>
          <Text style={styles.promptText}>
            {todaysPromptKey ? t(todaysPromptKey) : ''}
          </Text>

          <TouchableOpacity
            style={styles.didItButton}
            onPress={handleDidIt}
            activeOpacity={0.8}
          >
            <Text style={styles.didItButtonText}>
              {t('patientApp.activities.move.iDidIt')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip */}
        <TouchableOpacity style={styles.skipButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.skipText}>{t('patientApp.activity.skipForToday')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  headerEmoji: { fontSize: 56, marginBottom: 8 },
  headerTitle: { fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary },
  activityCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 36,
  },
  didItButton: {
    backgroundColor: COLORS.brand600,
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 16,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: COLORS.brand600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  didItButtonText: {
    fontSize: 24,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textInverse,
    letterSpacing: 0.3,
  },
  skipButton: { marginTop: 24, alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
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
