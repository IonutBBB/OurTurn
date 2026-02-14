import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { WordSearchContent } from '../../data/bundled-activities';

interface CellPos {
  row: number;
  col: number;
}

/** Return the cells occupied by a word in the grid. */
function wordCells(w: WordSearchContent['words'][number]): CellPos[] {
  const cells: CellPos[] = [];
  for (let i = 0; i < w.word.length; i++) {
    cells.push({
      row: w.direction === 'horizontal' ? w.start.row : w.start.row + i,
      col: w.direction === 'horizontal' ? w.start.col + i : w.start.col,
    });
  }
  return cells;
}

/** Check whether `selected` cells match the position of `wp` exactly. */
function selectionMatchesWord(
  selected: CellPos[],
  wp: WordSearchContent['words'][number],
): boolean {
  const cells = wordCells(wp);
  if (selected.length !== cells.length) return false;
  return selected.every(
    (s, i) => s.row === cells[i].row && s.col === cells[i].col,
  );
}

/**
 * Check whether the current selection is a valid prefix of any unfound word.
 * Returns true if at least one unfound word starts with the selected cell sequence.
 */
function selectionIsPrefix(
  selected: CellPos[],
  unfoundWords: WordSearchContent['words'],
): boolean {
  return unfoundWords.some((wp) => {
    const cells = wordCells(wp);
    if (selected.length > cells.length) return false;
    return selected.every(
      (s, i) => s.row === cells[i].row && s.col === cells[i].col,
    );
  });
}

export default function WordSearchRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as WordSearchContent;

  const [foundWords, setFoundWords] = useState<Set<string>>(() => new Set());
  const [selectedCells, setSelectedCells] = useState<CellPos[]>([]);

  if (!data) return null;

  const totalWords = data.words.length;
  const foundCount = foundWords.size;
  const allFound = foundCount === totalWords;

  /** Set of "row,col" keys for cells belonging to found words (for green highlight). */
  const foundCellKeys = new Set<string>();
  for (const wp of data.words) {
    if (foundWords.has(wp.word)) {
      for (const c of wordCells(wp)) {
        foundCellKeys.add(`${c.row},${c.col}`);
      }
    }
  }

  /** Set of "row,col" keys for currently selected cells (for blue highlight). */
  const selectedCellKeys = new Set<string>(
    selectedCells.map((c) => `${c.row},${c.col}`),
  );

  const unfoundWords = data.words.filter((wp) => !foundWords.has(wp.word));

  const handleCellTap = useCallback(
    async (row: number, col: number) => {
      if (allFound) return;

      // Don't allow tapping already-found cells
      if (foundCellKeys.has(`${row},${col}`)) return;

      const nextSelection = [...selectedCells, { row, col }];

      // Check if the full selection matches any unfound word
      const matchedWord = unfoundWords.find((wp) =>
        selectionMatchesWord(nextSelection, wp),
      );

      if (matchedWord) {
        // Word found!
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const next = new Set(foundWords);
        next.add(matchedWord.word);
        setFoundWords(next);
        setSelectedCells([]);

        // If all words are now found, complete after a brief celebration
        if (next.size === totalWords) {
          setTimeout(() => onComplete({ activity: 'word_search' }), 1200);
        }
        return;
      }

      // Check if selection is a valid prefix of any unfound word
      if (selectionIsPrefix(nextSelection, unfoundWords)) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedCells(nextSelection);
      } else {
        // Wrong path — clear selection with light haptic
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedCells([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCells, foundWords, allFound, totalWords, onComplete],
  );

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'word_search', wordsFound: foundCount });
  }, [onComplete, foundCount]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔍</Text>

      <Text style={styles.instruction}>
        {t('patientApp.stim.wordSearch.instruction')}
      </Text>

      {/* Theme */}
      <Text style={styles.theme}>{t(data.themeKey)}</Text>

      {/* Progress */}
      <Text style={styles.progress}>
        {t('patientApp.stim.wordSearch.wordsFound', {
          found: foundCount,
          total: totalWords,
        })}
      </Text>

      {/* Word list */}
      <View style={styles.wordList}>
        <Text style={styles.wordListLabel}>
          {t('patientApp.stim.wordSearch.wordsToFind')}
        </Text>
        <View style={styles.wordChips}>
          {data.words.map((wp) => {
            const isFound = foundWords.has(wp.word);
            return (
              <View
                key={wp.word}
                style={[styles.wordChip, isFound && styles.wordChipFound]}
              >
                <Text
                  style={[
                    styles.wordChipText,
                    isFound && styles.wordChipTextFound,
                  ]}
                >
                  {wp.word}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {data.grid.map((row, r) => (
          <View key={r} style={styles.gridRow}>
            {row.map((letter, c) => {
              const key = `${r},${c}`;
              const isFound = foundCellKeys.has(key);
              const isSelected = selectedCellKeys.has(key);

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.cell,
                    isFound && styles.cellFound,
                    isSelected && !isFound && styles.cellSelected,
                  ]}
                  onPress={() => handleCellTap(r, c)}
                  activeOpacity={0.7}
                  disabled={allFound}
                >
                  <Text
                    style={[
                      styles.cellText,
                      isFound && styles.cellTextFound,
                      isSelected && !isFound && styles.cellTextSelected,
                    ]}
                  >
                    {letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Celebration */}
      {allFound && (
        <Text style={styles.celebration}>
          {t('patientApp.stim.common.wellDone')}
        </Text>
      )}

      {/* "I'm done!" button */}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={handleDone}
        activeOpacity={0.8}
      >
        <Text style={styles.doneButtonText}>
          {t('patientApp.stim.common.imDone')}
        </Text>
      </TouchableOpacity>

      {/* Skip */}
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

const CELL_SIZE = 48;
const CELL_GAP = 6;

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
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  theme: {
    fontSize: 24,
    fontFamily: FONTS.display,
    color: COLORS.cognitive,
    marginBottom: 4,
  },
  progress: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 16,
  },

  // ── Word list ──────────────────────────────────────────────
  wordList: {
    alignItems: 'center',
    marginBottom: 20,
  },
  wordListLabel: {
    fontSize: 20,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  wordChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  wordChip: {
    backgroundColor: COLORS.cognitiveBg,
    borderRadius: RADIUS.md,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: COLORS.cognitive,
  },
  wordChipFound: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
  },
  wordChipText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.cognitive,
  },
  wordChipTextFound: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },

  // ── Grid ───────────────────────────────────────────────────
  grid: {
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: CELL_GAP,
    marginBottom: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cellFound: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
  },
  cellSelected: {
    backgroundColor: COLORS.cognitiveBg,
    borderColor: COLORS.cognitive,
  },
  cellText: {
    fontSize: 22,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
  },
  cellTextFound: {
    color: COLORS.success,
  },
  cellTextSelected: {
    color: COLORS.cognitive,
  },

  // ── Actions ────────────────────────────────────────────────
  celebration: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.success,
    marginBottom: 16,
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
