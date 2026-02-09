import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../src/stores/auth-store';
import { getMusicItems } from '../../src/utils/activity-templates';
import { formatDateForDb } from '../../src/utils/time-of-day';
import { COLORS, FONTS, RADIUS } from '../../src/theme';

export default function ActivityListenScreen() {
  const { t } = useTranslation();
  const { patient } = useAuthStore();
  const [isDone, setIsDone] = useState(false);

  const today = formatDateForDb();
  const musicItems = getMusicItems(patient?.biography);

  useEffect(() => {
    const check = async () => {
      const done = await AsyncStorage.getItem(`activity_completed_listen_${today}`);
      if (done === 'true') setIsDone(true);
    };
    check();
  }, [today]);

  const handleOpenMusic = async (song: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Open a YouTube Music search for the song
    const query = encodeURIComponent(song);
    const url = `https://music.youtube.com/search?q=${query}`;
    try {
      await Linking.openURL(url);
    } catch {
      // Fallback to web search
      await Linking.openURL(`https://www.google.com/search?q=${query}+music`);
    }
  };

  const handleEnjoyed = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem(`activity_completed_listen_${today}`, 'true');
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
            <Text style={styles.followUpEmoji}>🎵</Text>
            <Text style={styles.followUpText}>
              {t('patientApp.activities.listen.followUp')}
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
          <Text style={styles.headerEmoji}>🎵</Text>
          <Text style={styles.headerTitle}>{t('patientApp.activities.listen.title')}</Text>
        </View>

        {/* Music list */}
        {musicItems.map((song, index) => (
          <TouchableOpacity
            key={index}
            style={styles.songButton}
            onPress={() => handleOpenMusic(song)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${t('patientApp.activities.listen.openIn')}: ${song}`}
          >
            <Text style={styles.songEmoji}>🎵</Text>
            <View style={styles.songInfo}>
              <Text style={styles.songName}>{song}</Text>
              <Text style={styles.songAction}>{t('patientApp.activities.listen.openIn')}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Enjoyment confirmation */}
        <View style={styles.enjoyedContainer}>
          <Text style={styles.enjoyedQuestion}>
            {t('patientApp.activities.listen.enjoyed')}
          </Text>
          <TouchableOpacity
            style={styles.enjoyedButton}
            onPress={handleEnjoyed}
            activeOpacity={0.8}
          >
            <Text style={styles.enjoyedButtonText}>
              {t('patientApp.activities.listen.yesLoved')}
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
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary },
  songButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
  },
  songEmoji: { fontSize: 36, marginRight: 18 },
  songInfo: { flex: 1 },
  songName: {
    fontSize: 24,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  songAction: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.brand600,
    marginTop: 4,
  },
  enjoyedContainer: {
    alignItems: 'center',
    marginTop: 28,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  enjoyedQuestion: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  enjoyedButton: {
    backgroundColor: COLORS.brand600,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  enjoyedButtonText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
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
