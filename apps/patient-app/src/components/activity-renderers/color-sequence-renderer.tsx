import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { ColorSequenceContent } from '../../data/bundled-activities';

// Colour definitions: index 0-3 maps to red, blue, green, yellow
const GAME_COLORS = [
  { base: '#E74C3C', light: '#FADBD8', labelKey: 'red' },
  { base: '#3498DB', light: '#D6EAF8', labelKey: 'blue' },
  { base: '#2ECC71', light: '#D5F5E3', labelKey: 'green' },
  { base: '#F1C40F', light: '#FEF9E7', labelKey: 'yellow' },
] as const;

type Phase = 'watching' | 'playing' | 'celebration';

const TOTAL_ROUNDS = 4;
const LIGHT_DURATION = 600;
const LIGHT_GAP = 300;

export default function ColorSequenceRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as ColorSequenceContent;

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('watching');
  const [litIndex, setLitIndex] = useState<number | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isMountedRef = useRef(true);

  // Cleanup all timers on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const safeTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      if (isMountedRef.current) {
        fn();
      }
    }, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  // Play the current sequence as a light-up animation
  const playSequence = useCallback((roundIndex: number) => {
    if (!data) return;
    const sequence = data.sequences[roundIndex];
    if (!sequence) return;

    setPhase('watching');
    setPlayerIndex(0);
    setFeedbackText('');

    // Clear any existing timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    sequence.forEach((colorIdx, step) => {
      const startDelay = step * (LIGHT_DURATION + LIGHT_GAP);

      // Light on
      safeTimeout(() => {
        setLitIndex(colorIdx);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, startDelay);

      // Light off
      safeTimeout(() => {
        setLitIndex(null);
      }, startDelay + LIGHT_DURATION);
    });

    // Transition to playing phase after full sequence plays
    const totalDuration = sequence.length * (LIGHT_DURATION + LIGHT_GAP);
    safeTimeout(() => {
      setPhase('playing');
    }, totalDuration);
  }, [data, safeTimeout]);

  // Start playing the first sequence on mount
  useEffect(() => {
    if (data) {
      playSequence(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonTap = useCallback(async (colorIdx: number) => {
    if (phase !== 'playing' || !data) return;

    const sequence = data.sequences[round];
    if (!sequence) return;

    const expected = sequence[playerIndex];

    if (colorIdx === expected) {
      // Correct tap
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Brief highlight
      setLitIndex(colorIdx);
      safeTimeout(() => setLitIndex(null), 200);

      const nextPlayerIndex = playerIndex + 1;

      if (nextPlayerIndex >= sequence.length) {
        // Completed this round
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const nextRound = round + 1;

        if (nextRound >= TOTAL_ROUNDS) {
          // All rounds complete
          setPhase('celebration');
          setFeedbackText(t('patientApp.stim.colorSequence.greatMemory'));
          safeTimeout(() => {
            onComplete({ activity: 'color_sequence', roundsCompleted: TOTAL_ROUNDS });
          }, 1500);
        } else {
          // Show brief celebration, then next round
          setFeedbackText(t('patientApp.stim.common.wellDone'));
          safeTimeout(() => {
            setRound(nextRound);
            playSequence(nextRound);
          }, 1200);
        }
      } else {
        setPlayerIndex(nextPlayerIndex);
      }
    } else {
      // Wrong tap: gentle encouragement, replay sequence
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setFeedbackText(t('patientApp.stim.common.tryAgain'));

      // After a brief pause, replay the sequence
      safeTimeout(() => {
        playSequence(round);
      }, 1200);
    }
  }, [phase, data, round, playerIndex, safeTimeout, playSequence, onComplete, t]);

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'color_sequence', roundsCompleted: round + 1 });
  }, [onComplete, round]);

  if (!data) return null;

  const currentSequence = data.sequences[round];
  const sequenceLength = currentSequence?.length ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎨</Text>

      <Text style={styles.instruction}>
        {t('patientApp.stim.colorSequence.instruction')}
      </Text>

      <Text style={styles.roundText}>
        {t('patientApp.stim.common.round', { current: round + 1, total: TOTAL_ROUNDS })}
      </Text>

      <Text style={styles.sequenceInfo}>
        {t('patientApp.stim.colorSequence.sequenceLength', { length: sequenceLength })}
      </Text>

      {/* Phase indicator */}
      <View style={styles.phaseContainer}>
        <Text style={[
          styles.phaseText,
          phase === 'watching' && styles.phaseWatching,
          phase === 'playing' && styles.phasePlaying,
          phase === 'celebration' && styles.phaseCelebration,
        ]}>
          {phase === 'watching' && t('patientApp.stim.colorSequence.watch')}
          {phase === 'playing' && t('patientApp.stim.colorSequence.yourTurn')}
          {phase === 'celebration' && t('patientApp.stim.common.wellDone')}
        </Text>
      </View>

      {/* 2x2 colour button grid */}
      <View style={styles.grid}>
        {GAME_COLORS.map((color, idx) => {
          const isLit = litIndex === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.colorButton,
                { backgroundColor: isLit ? color.light : color.base },
                isLit && styles.colorButtonLit,
              ]}
              onPress={() => handleButtonTap(idx)}
              activeOpacity={0.7}
              disabled={phase !== 'playing'}
              accessibilityLabel={color.labelKey}
              accessibilityRole="button"
            />
          );
        })}
      </View>

      {/* Feedback message */}
      {feedbackText !== '' && (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>{feedbackText}</Text>
        </View>
      )}

      {/* "I'm done!" button — always visible so the user can finish early */}
      <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
        <Text style={styles.doneButtonText}>
          {t('patientApp.stim.common.imDone')}
        </Text>
      </TouchableOpacity>

      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const BUTTON_SIZE = 120;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  instruction: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  roundText: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  sequenceInfo: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  phaseContainer: {
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  phaseText: {
    fontSize: 24,
    fontFamily: FONTS.display,
    textAlign: 'center',
  },
  phaseWatching: {
    color: COLORS.info,
  },
  phasePlaying: {
    color: COLORS.success,
  },
  phaseCelebration: {
    color: COLORS.amber,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: BUTTON_SIZE * 2 + 24,
    gap: 16,
    marginBottom: 24,
  },
  colorButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: RADIUS.xl,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  colorButtonLit: {
    borderWidth: 4,
    borderColor: COLORS.textPrimary,
  },
  feedbackCard: {
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: COLORS.success,
    marginBottom: 20,
  },
  feedbackText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.success,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
    marginBottom: 8,
  },
  doneButtonText: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
});
