import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { PatternSequenceContent } from '../../data/bundled-activities';

type RoundState = 'playing' | 'correct' | 'tryAgain';

export default function PatternSequenceRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as PatternSequenceContent;

  const [roundIndex, setRoundIndex] = useState(0);
  const [roundState, setRoundState] = useState<RoundState>('playing');
  const [revealedEmoji, setRevealedEmoji] = useState<string | null>(null);

  const handleOptionPress = useCallback(
    async (optionIndex: number) => {
      if (!data || roundState !== 'playing') return;

      const round = data.rounds[roundIndex];
      if (optionIndex === round.correctIndex) {
        // Correct answer
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRevealedEmoji(round.options[round.correctIndex]);
        setRoundState('correct');
      } else {
        // Wrong answer — gentle encouragement, no failure
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setRoundState('tryAgain');

        // Reset to playing after a brief pause so they can try again
        setTimeout(() => {
          setRoundState('playing');
        }, 1200);
      }
    },
    [data, roundIndex, roundState],
  );

  const handleNext = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (roundIndex + 1 >= data.rounds.length) {
      // All rounds done
      onComplete({ activity: 'pattern_sequence' });
    } else {
      setRoundIndex((prev) => prev + 1);
      setRoundState('playing');
      setRevealedEmoji(null);
    }
  }, [roundIndex, data, onComplete]);

  if (!data) return null;

  const totalRounds = data.rounds.length;
  const round = data.rounds[roundIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.headerEmoji}>🧩</Text>

      <Text style={styles.instruction}>
        {t('patientApp.stim.patternSequence.instruction')}
      </Text>

      <Text style={styles.roundLabel}>
        {t('patientApp.stim.common.round', {
          current: roundIndex + 1,
          total: totalRounds,
        })}
      </Text>

      {/* Sequence row */}
      <View style={styles.sequenceRow}>
        {round.sequence.map((item, idx) => {
          // Replace the "?" with the revealed emoji on correct answer
          const isQuestionMark = item === '?';
          const displayItem =
            isQuestionMark && revealedEmoji ? revealedEmoji : item;
          const isRevealed = isQuestionMark && revealedEmoji !== null;

          return (
            <View
              key={`${roundIndex}-${idx}`}
              style={[
                styles.sequenceItem,
                isQuestionMark && !isRevealed && styles.sequenceQuestionMark,
                isRevealed && styles.sequenceRevealed,
              ]}
            >
              <Text
                style={[
                  styles.sequenceEmoji,
                  isQuestionMark && !isRevealed && styles.questionMarkText,
                ]}
              >
                {displayItem}
              </Text>
            </View>
          );
        })}
      </View>

      {/* What comes next? */}
      <Text style={styles.whatsNext}>
        {t('patientApp.stim.patternSequence.whatsNext')}
      </Text>

      {/* Option buttons */}
      <View style={styles.optionsRow}>
        {round.options.map((option, idx) => {
          const isCorrectOption = idx === round.correctIndex;
          const showAsCorrect = roundState === 'correct' && isCorrectOption;

          return (
            <TouchableOpacity
              key={`${roundIndex}-opt-${idx}`}
              style={[
                styles.optionButton,
                showAsCorrect && styles.optionCorrect,
              ]}
              onPress={() => handleOptionPress(idx)}
              activeOpacity={0.8}
              disabled={roundState !== 'playing'}
            >
              <Text style={styles.optionEmoji}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback messages */}
      {roundState === 'correct' && (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>
            {t('patientApp.stim.common.correct')}
          </Text>
        </View>
      )}

      {roundState === 'tryAgain' && (
        <View style={styles.tryAgainCard}>
          <Text style={styles.tryAgainText}>
            {t('patientApp.stim.common.tryAgain')}
          </Text>
        </View>
      )}

      {/* Next round / I'm done button */}
      {roundState === 'correct' && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>
            {roundIndex + 1 >= totalRounds
              ? t('patientApp.stim.common.wellDone')
              : t('patientApp.stim.common.imDone')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Skip button — always visible */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={onSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  instruction: {
    fontSize: 22,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  roundLabel: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  sequenceItem: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sequenceQuestionMark: {
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.info,
    borderStyle: 'dashed',
  },
  sequenceRevealed: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
  },
  sequenceEmoji: {
    fontSize: 28,
  },
  questionMarkText: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.info,
  },
  whatsNext: {
    fontSize: 24,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  optionButton: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.brand300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCorrect: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
  },
  optionEmoji: {
    fontSize: 40,
  },
  feedbackCard: {
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: COLORS.success,
    marginBottom: 20,
    width: '100%',
  },
  feedbackText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.success,
    textAlign: 'center',
  },
  tryAgainCard: {
    backgroundColor: COLORS.amberBg,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: COLORS.amber,
    marginBottom: 20,
    width: '100%',
  },
  tryAgainText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.amber,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  skipButton: {
    marginTop: 24,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
});
