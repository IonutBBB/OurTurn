import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { WordScrambleContent } from '../../data/bundled-activities';

/**
 * Word Scramble Renderer
 *
 * Shows scrambled letters as tappable buttons. The player taps letters
 * to fill blank slots and spell the word. Tap a filled slot to return
 * the letter. Hint reveals the first letter. No failure states — only
 * positive reinforcement.
 */

interface SlotEntry {
  letter: string;
  sourceIndex: number; // which scrambled-letter button it came from
}

export default function WordScrambleRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as WordScrambleContent;

  const [wordIndex, setWordIndex] = useState(0);
  const [slots, setSlots] = useState<(SlotEntry | null)[]>([]);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [hintRevealed, setHintRevealed] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  if (!data || !data.words || data.words.length === 0) return null;

  const totalWords = data.words.length;
  const currentWord = data.words[wordIndex];
  const wordLength = currentWord.word.length;

  // Initialise slots for the current word if needed
  if (slots.length !== wordLength) {
    const initial: (SlotEntry | null)[] = Array(wordLength).fill(null);
    setSlots(initial);
    setUsedIndices(new Set());
    setHintRevealed(false);
    setCelebrating(false);
  }

  const scrambledLetters = currentWord.scrambled.split('');

  // Check if the filled slots spell the correct word
  const filledWord = slots.map((s) => s?.letter ?? '').join('');
  const isComplete = filledWord.length === wordLength && !slots.includes(null);
  const isCorrect = filledWord === currentWord.word;

  // Handle tapping a scrambled letter
  const handleLetterTap = useCallback(
    async (letter: string, sourceIndex: number) => {
      if (celebrating) return;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Find the first empty slot
      const emptyIdx = slots.findIndex((s) => s === null);
      if (emptyIdx === -1) return; // all slots full

      const newSlots = [...slots];
      newSlots[emptyIdx] = { letter, sourceIndex };
      setSlots(newSlots);

      const newUsed = new Set(usedIndices);
      newUsed.add(sourceIndex);
      setUsedIndices(newUsed);

      // Check completion
      const newFilledWord = newSlots.map((s) => s?.letter ?? '').join('');
      const nowComplete = !newSlots.includes(null);
      if (nowComplete && newFilledWord === currentWord.word) {
        setCelebrating(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Auto-advance after a short pause
        setTimeout(() => {
          if (wordIndex + 1 < totalWords) {
            setWordIndex(wordIndex + 1);
            // Reset will happen via the length check above
            setSlots([]);
            setUsedIndices(new Set());
            setHintRevealed(false);
            setCelebrating(false);
          } else {
            onComplete({ activity: 'word_scramble' });
          }
        }, 1200);
      }
    },
    [slots, usedIndices, celebrating, currentWord.word, wordIndex, totalWords, onComplete],
  );

  // Handle tapping a filled slot to return the letter
  const handleSlotTap = useCallback(
    async (slotIndex: number) => {
      if (celebrating) return;

      const entry = slots[slotIndex];
      if (!entry) return;

      // Don't allow removing hint-locked first letter
      if (hintRevealed && slotIndex === 0) return;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newSlots = [...slots];
      newSlots[slotIndex] = null;
      setSlots(newSlots);

      const newUsed = new Set(usedIndices);
      newUsed.delete(entry.sourceIndex);
      setUsedIndices(newUsed);
    },
    [slots, usedIndices, celebrating, hintRevealed],
  );

  // Hint: reveal the first letter
  const handleHint = useCallback(async () => {
    if (hintRevealed || celebrating) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const firstLetter = currentWord.word[0];
    // Find this letter in the scrambled array (first unused occurrence)
    const sourceIndex = scrambledLetters.findIndex(
      (l, i) => l === firstLetter && !usedIndices.has(i),
    );

    if (sourceIndex === -1) {
      // Letter already placed — just mark hint as revealed
      setHintRevealed(true);
      return;
    }

    // If slot 0 already has a different letter, return it first
    const newSlots = [...slots];
    const newUsed = new Set(usedIndices);

    if (newSlots[0] !== null) {
      const existing = newSlots[0];
      newUsed.delete(existing.sourceIndex);
    }

    newSlots[0] = { letter: firstLetter, sourceIndex };
    newUsed.add(sourceIndex);

    setSlots(newSlots);
    setUsedIndices(newUsed);
    setHintRevealed(true);

    // Check completion after hint
    const newFilledWord = newSlots.map((s) => s?.letter ?? '').join('');
    const nowComplete = !newSlots.includes(null);
    if (nowComplete && newFilledWord === currentWord.word) {
      setCelebrating(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        if (wordIndex + 1 < totalWords) {
          setWordIndex(wordIndex + 1);
          setSlots([]);
          setUsedIndices(new Set());
          setHintRevealed(false);
          setCelebrating(false);
        } else {
          onComplete({ activity: 'word_scramble' });
        }
      }, 1200);
    }
  }, [
    hintRevealed, celebrating, currentWord.word, scrambledLetters,
    usedIndices, slots, wordIndex, totalWords, onComplete,
  ]);

  // "I'm done" finishes early
  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'word_scramble' });
  }, [onComplete]);

  return (
    <View style={styles.container}>
      {/* Emoji hint */}
      <Text style={styles.emoji}>{currentWord.emoji}</Text>

      {/* Theme + progress */}
      <Text style={styles.theme}>{t(data.themeKey)}</Text>
      <Text style={styles.progress}>
        {t('patientApp.stim.wordScramble.wordOf', {
          current: wordIndex + 1,
          total: totalWords,
        })}
      </Text>

      {/* Instruction */}
      <Text style={styles.instruction}>
        {t('patientApp.stim.wordScramble.instruction')}
      </Text>

      {/* Answer slots */}
      <View style={styles.slotsRow}>
        {slots.map((entry, idx) => {
          const isHintLocked = hintRevealed && idx === 0 && entry !== null;

          return (
            <TouchableOpacity
              key={`slot-${idx}`}
              style={[
                styles.slot,
                entry ? styles.slotFilled : styles.slotEmpty,
                isHintLocked && styles.slotHintLocked,
                celebrating && isComplete && isCorrect && styles.slotCorrect,
              ]}
              onPress={() => handleSlotTap(idx)}
              activeOpacity={0.7}
              disabled={!entry || celebrating || isHintLocked}
            >
              <Text
                style={[
                  styles.slotLetter,
                  celebrating && isCorrect && styles.slotLetterCorrect,
                ]}
              >
                {entry?.letter ?? ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Celebration message */}
      {celebrating && isCorrect && (
        <Text style={styles.celebration}>
          {t('patientApp.stim.common.wellDone')}
        </Text>
      )}

      {/* Scrambled letters */}
      {!celebrating && (
        <View style={styles.lettersRow}>
          {scrambledLetters.map((letter, idx) => {
            const isUsed = usedIndices.has(idx);

            return (
              <TouchableOpacity
                key={`letter-${idx}`}
                style={[
                  styles.letterButton,
                  isUsed && styles.letterButtonUsed,
                ]}
                onPress={() => handleLetterTap(letter, idx)}
                activeOpacity={0.7}
                disabled={isUsed}
              >
                <Text
                  style={[
                    styles.letterText,
                    isUsed && styles.letterTextUsed,
                  ]}
                >
                  {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Hint button */}
      {!celebrating && !hintRevealed && (
        <TouchableOpacity
          style={styles.hintButton}
          onPress={handleHint}
          activeOpacity={0.7}
        >
          <Text style={styles.hintButtonText}>
            {t('patientApp.stim.wordScramble.hintButton')}
          </Text>
        </TouchableOpacity>
      )}

      {/* I'm done button */}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={handleDone}
        activeOpacity={0.8}
      >
        <Text style={styles.doneButtonText}>
          {t('patientApp.stim.common.imDone')}
        </Text>
      </TouchableOpacity>

      {/* Skip button */}
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
  emoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  theme: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  progress: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 22,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  // Answer slots row
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  slot: {
    width: 52,
    height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotEmpty: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  slotFilled: {
    backgroundColor: COLORS.cognitiveBg,
    borderColor: COLORS.cognitive,
  },
  slotHintLocked: {
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.info,
  },
  slotCorrect: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
  },
  slotLetter: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.cognitive,
  },
  slotLetterCorrect: {
    color: COLORS.success,
  },

  // Celebration
  celebration: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Scrambled letter buttons
  lettersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  letterButton: {
    width: 52,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.brand100,
    borderWidth: 2,
    borderColor: COLORS.brand400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterButtonUsed: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  letterText: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.brand700,
  },
  letterTextUsed: {
    color: COLORS.border,
  },

  // Hint
  hintButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.infoBg,
    borderWidth: 1,
    borderColor: COLORS.info,
    marginBottom: 20,
  },
  hintButtonText: {
    fontSize: 20,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.info,
  },

  // I'm done
  doneButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
    marginBottom: 4,
  },
  doneButtonText: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },

  // Skip
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
