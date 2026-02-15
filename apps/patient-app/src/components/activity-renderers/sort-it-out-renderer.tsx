import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { SortItOutContent } from '../../data/bundled-activities';

interface SortedItem {
  emoji: string;
  label: string;
}

export default function SortItOutRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as SortItOutContent;

  const [unsortedIndices, setUnsortedIndices] = useState<number[]>(() =>
    data ? shuffle([...Array(data.items.length).keys()]) : []
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [bucketA, setBucketA] = useState<SortedItem[]>([]);
  const [bucketB, setBucketB] = useState<SortedItem[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [allDone, setAllDone] = useState(false);

  if (!data) return null;

  const itemsLeft = unsortedIndices.length;

  const handleSelectItem = useCallback(async (itemIndex: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIndex((prev) => (prev === itemIndex ? null : itemIndex));
  }, []);

  const handlePlaceInBucket = useCallback(async (bucket: 0 | 1) => {
    if (selectedIndex === null || !data) return;

    const item = data.items[selectedIndex];
    const isCorrect = item.group === bucket;
    const flashKey = bucket === 0
      ? (isCorrect ? 'a-correct' : 'a-wrong')
      : (isCorrect ? 'b-correct' : 'b-wrong');

    setFlash(flashKey);

    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const sorted: SortedItem = { emoji: item.emoji, label: item.label };
      if (bucket === 0) setBucketA((prev) => [...prev, sorted]);
      else setBucketB((prev) => [...prev, sorted]);

      const remaining = unsortedIndices.filter((i) => i !== selectedIndex);
      setUnsortedIndices(remaining);
      setSelectedIndex(null);

      if (remaining.length === 0) setAllDone(true);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setSelectedIndex(null);
    }

    setTimeout(() => setFlash(null), 500);
  }, [selectedIndex, data, unsortedIndices]);

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'sort_it_out' });
  }, [onComplete]);

  return (
    <View style={styles.container}>
      {/* Scenario context */}
      <Text style={styles.scenario}>{t(data.scenarioKey)}</Text>

      {/* Two buckets */}
      <View style={styles.bucketsRow}>
        <TouchableOpacity
          style={[
            styles.bucket,
            flash === 'a-correct' && styles.bucketCorrect,
            flash === 'a-wrong' && styles.bucketWrong,
            selectedIndex !== null && styles.bucketActive,
          ]}
          onPress={() => handlePlaceInBucket(0)}
          activeOpacity={0.8}
          disabled={selectedIndex === null}
        >
          <Text style={styles.bucketEmoji}>{data.groupAEmoji}</Text>
          <Text style={styles.bucketLabel}>{data.groupA}</Text>
          {bucketA.length > 0 && (
            <View style={styles.sortedItems}>
              {bucketA.map((item, i) => (
                <Text key={i} style={styles.sortedEmoji}>{item.emoji}</Text>
              ))}
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.bucket,
            flash === 'b-correct' && styles.bucketCorrect,
            flash === 'b-wrong' && styles.bucketWrong,
            selectedIndex !== null && styles.bucketActive,
          ]}
          onPress={() => handlePlaceInBucket(1)}
          activeOpacity={0.8}
          disabled={selectedIndex === null}
        >
          <Text style={styles.bucketEmoji}>{data.groupBEmoji}</Text>
          <Text style={styles.bucketLabel}>{data.groupB}</Text>
          {bucketB.length > 0 && (
            <View style={styles.sortedItems}>
              {bucketB.map((item, i) => (
                <Text key={i} style={styles.sortedEmoji}>{item.emoji}</Text>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Progress */}
      {!allDone && (
        <Text style={styles.progress}>
          {t('patientApp.stim.categorySort.itemsLeft', { count: itemsLeft })}
        </Text>
      )}

      {/* Unsorted items */}
      {!allDone && (
        <View style={styles.itemsGrid}>
          {unsortedIndices.map((itemIndex) => {
            const item = data.items[itemIndex];
            const isSelected = selectedIndex === itemIndex;
            return (
              <TouchableOpacity
                key={itemIndex}
                style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                onPress={() => handleSelectItem(itemIndex)}
                activeOpacity={0.8}
              >
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Celebration */}
      {allDone && (
        <View style={styles.celebrationCard}>
          <Text style={styles.celebrationEmoji}>{'\uD83C\uDF1F'}</Text>
          <Text style={styles.celebrationText}>
            {t('patientApp.stim.sortItOut.allSorted')}
          </Text>
          <Text style={styles.wellDoneText}>
            {t('patientApp.stim.common.wellDone')}
          </Text>
        </View>
      )}

      {allDone && (
        <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
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

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  scenario: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary,
    textAlign: 'center', marginBottom: 20, paddingHorizontal: 8, lineHeight: 30,
  },
  bucketsRow: { flexDirection: 'row', width: '100%', gap: 12, marginBottom: 16 },
  bucket: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 2, borderColor: COLORS.border, paddingVertical: 14,
    paddingHorizontal: 8, alignItems: 'center', minHeight: 100,
  },
  bucketActive: { borderColor: COLORS.brand400, borderStyle: 'dashed' as const },
  bucketCorrect: { backgroundColor: COLORS.successBg, borderColor: COLORS.success },
  bucketWrong: { backgroundColor: COLORS.amberBg, borderColor: COLORS.amber },
  bucketEmoji: { fontSize: 36, marginBottom: 4 },
  bucketLabel: {
    fontSize: 20, fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, textAlign: 'center',
  },
  sortedItems: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginTop: 8,
  },
  sortedEmoji: { fontSize: 24 },
  progress: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 16 },
  itemsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 12, marginBottom: 24, width: '100%',
  },
  itemCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 2,
    borderColor: COLORS.border, paddingVertical: 12, paddingHorizontal: 14,
    alignItems: 'center', minWidth: 90,
  },
  itemCardSelected: { backgroundColor: COLORS.brand50, borderColor: COLORS.brand500, borderWidth: 3 },
  itemEmoji: { fontSize: 36, marginBottom: 4 },
  itemLabel: { fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.textPrimary, textAlign: 'center' },
  itemLabelSelected: { fontFamily: FONTS.bodyBold, color: COLORS.brand700 },
  celebrationCard: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS['2xl'], borderWidth: 2,
    borderColor: COLORS.success, paddingVertical: 24, paddingHorizontal: 32,
    alignItems: 'center', marginBottom: 24, width: '100%',
  },
  celebrationEmoji: { fontSize: 56, marginBottom: 8 },
  celebrationText: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.success, textAlign: 'center', marginBottom: 4,
  },
  wellDoneText: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.success, textAlign: 'center',
  },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18, paddingHorizontal: 48, borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
