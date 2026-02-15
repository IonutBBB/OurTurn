import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { WhatChangedContent } from '../../data/bundled-activities';

type Phase = 'memorise' | 'changed' | 'feedback';

export default function WhatChangedRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as WhatChangedContent;

  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('memorise');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  if (!data?.rounds?.length) return null;

  const totalRounds = data.rounds.length;
  const current = data.rounds[roundIndex];

  // Display the original grid for 5 seconds, then swap
  useEffect(() => {
    if (phase !== 'memorise') return;

    const timer = setTimeout(() => {
      // Fade out then swap
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        setPhase('changed');
      }, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [phase, fadeAnim]);

  const displayGrid = phase === 'memorise'
    ? current.grid
    : current.grid.map((emoji, i) => (i === current.changedIndex ? current.newEmoji : emoji));

  const handleTap = useCallback(async (index: number) => {
    if (phase !== 'changed' || selectedIndex !== null) return;

    setSelectedIndex(index);
    const correct = index === current.changedIndex;
    setIsCorrect(correct);

    if (correct) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setPhase('feedback');

    setTimeout(() => {
      if (roundIndex + 1 >= totalRounds) {
        onComplete({ activity: 'what_changed', roundsCompleted: totalRounds });
      } else {
        setRoundIndex((prev) => prev + 1);
        setPhase('memorise');
        setSelectedIndex(null);
        setIsCorrect(false);
        fadeAnim.setValue(1);
      }
    }, 2000);
  }, [phase, selectedIndex, current, roundIndex, totalRounds, onComplete, fadeAnim]);

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'what_changed', roundsCompleted: roundIndex + 1 });
  }, [onComplete, roundIndex]);

  const getCellStyle = (index: number) => {
    if (phase === 'feedback' && index === current.changedIndex) {
      return { backgroundColor: COLORS.successBg, borderColor: COLORS.success };
    }
    if (phase === 'feedback' && index === selectedIndex && !isCorrect) {
      return { backgroundColor: COLORS.amberBg, borderColor: COLORS.amber };
    }
    return { backgroundColor: COLORS.card, borderColor: COLORS.border };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔄</Text>

      <Text style={styles.progress}>
        {t('patientApp.stim.common.round', { current: roundIndex + 1, total: totalRounds })}
      </Text>

      {phase === 'memorise' && (
        <Text style={styles.instruction}>
          {t('patientApp.stim.whatChanged.memorise')}
        </Text>
      )}

      {phase === 'changed' && (
        <Text style={styles.instruction}>
          {t('patientApp.stim.whatChanged.tapChanged')}
        </Text>
      )}

      {phase === 'feedback' && (
        <Text style={styles.instruction}>
          {isCorrect
            ? t('patientApp.stim.common.correct')
            : t('patientApp.stim.whatChanged.notQuite')}
        </Text>
      )}

      <Animated.View style={[styles.gridContainer, { opacity: fadeAnim }]}>
        <View style={styles.grid}>
          {displayGrid.map((emoji, index) => (
            <TouchableOpacity
              key={`${roundIndex}-${index}`}
              style={[styles.cell, getCellStyle(index)]}
              onPress={() => handleTap(index)}
              activeOpacity={0.8}
              disabled={phase !== 'changed'}
            >
              <Text style={styles.cellEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {phase === 'memorise' && (
        <View style={styles.timerBar}>
          <Text style={styles.timerText}>{t('patientApp.stim.whatChanged.lookCarefully')}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
        <Text style={styles.doneButtonText}>{t('patientApp.stim.common.imDone')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  emoji: { fontSize: 48, marginBottom: 12 },
  progress: {
    fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.textMuted,
    textAlign: 'center', marginBottom: 4,
  },
  instruction: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 20, paddingHorizontal: 8,
  },
  gridContainer: { width: '100%', marginBottom: 20 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12,
  },
  cell: {
    width: '30%', aspectRatio: 1, borderRadius: RADIUS.lg, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  cellEmoji: { fontSize: 40 },
  timerBar: {
    backgroundColor: COLORS.socialBg, borderRadius: RADIUS.lg,
    paddingVertical: 12, paddingHorizontal: 24, marginBottom: 20,
    borderWidth: 2, borderColor: COLORS.social, width: '100%',
  },
  timerText: {
    fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.social, textAlign: 'center',
  },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18,
    paddingHorizontal: 48, borderRadius: RADIUS.lg,
  },
  doneButtonText: {
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse,
  },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
