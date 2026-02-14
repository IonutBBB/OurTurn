import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { SpotDifferenceContent } from '../../data/bundled-activities';

const TOTAL_DIFFERENCES = 3;

export default function SpotDifferenceRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as SpotDifferenceContent;
  const [foundPositions, setFoundPositions] = useState<Set<string>>(new Set());
  const [allFound, setAllFound] = useState(false);

  const makeKey = useCallback((row: number, col: number) => `${row}-${col}`, []);

  const isDifference = useCallback(
    (row: number, col: number): boolean => {
      if (!data?.differences) return false;
      return data.differences.some((d) => d.row === row && d.col === col);
    },
    [data],
  );

  const handleCellTap = useCallback(
    async (row: number, col: number) => {
      if (allFound) return;
      const key = makeKey(row, col);

      if (foundPositions.has(key)) return;

      if (isDifference(row, col)) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const next = new Set(foundPositions);
        next.add(key);
        setFoundPositions(next);

        if (next.size === TOTAL_DIFFERENCES) {
          setAllFound(true);
          setTimeout(() => onComplete({ activity: 'spot_the_difference' }), 1200);
        }
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [allFound, foundPositions, isDifference, makeKey, onComplete],
  );

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'spot_the_difference', found: foundPositions.size });
  }, [onComplete, foundPositions]);

  if (!data) return null;

  const foundCount = foundPositions.size;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔍</Text>
      <Text style={styles.instruction}>
        {t('patientApp.stim.spotDifference.instruction')}
      </Text>
      <Text style={styles.progress}>
        {t('patientApp.stim.spotDifference.differencesFound', {
          found: foundCount,
          total: TOTAL_DIFFERENCES,
        })}
      </Text>

      {/* Original grid */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {data.original.map((row, rowIdx) => (
            <View key={`orig-row-${rowIdx}`} style={styles.gridRow}>
              {row.map((emoji, colIdx) => (
                <View
                  key={`orig-${rowIdx}-${colIdx}`}
                  style={styles.cell}
                >
                  <Text style={styles.cellEmoji}>{emoji}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerArrow}>👇</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Modified grid — tappable */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {data.modified.map((row, rowIdx) => (
            <View key={`mod-row-${rowIdx}`} style={styles.gridRow}>
              {row.map((emoji, colIdx) => {
                const key = makeKey(rowIdx, colIdx);
                const isFound = foundPositions.has(key);

                return (
                  <TouchableOpacity
                    key={`mod-${rowIdx}-${colIdx}`}
                    style={[
                      styles.cell,
                      isFound && styles.cellFound,
                    ]}
                    onPress={() => handleCellTap(rowIdx, colIdx)}
                    activeOpacity={0.7}
                    disabled={isFound || allFound}
                  >
                    <Text style={styles.cellEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {allFound && (
        <Text style={styles.celebration}>
          {t('patientApp.stim.common.wellDone')}
        </Text>
      )}

      {!allFound && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>
            {t('patientApp.stim.common.imDone')}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
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
  progress: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  gridContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 12,
  },
  grid: {
    gap: 6,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  cell: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cellFound: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    borderWidth: 3,
  },
  cellEmoji: {
    fontSize: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
    paddingHorizontal: 24,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
  },
  dividerArrow: {
    fontSize: 24,
    marginHorizontal: 12,
  },
  celebration: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.success,
    marginTop: 20,
    marginBottom: 8,
  },
  doneButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
    marginTop: 20,
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
