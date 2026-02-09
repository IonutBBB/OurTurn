import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { SortingContent, SortingItem } from '../../data/bundled-activities';

export default function SortingRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as SortingContent;
  const [sorted, setSorted] = useState<Record<number, 0 | 1>>({});
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  if (!data) return null;

  const unsortedItems = data.items.filter((_, i) => sorted[i] === undefined);
  const cat1Items = data.items.filter((_, i) => sorted[i] === 0);
  const cat2Items = data.items.filter((_, i) => sorted[i] === 1);
  const allSorted = Object.keys(sorted).length === data.items.length;

  const handleItemTap = async (itemIndex: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveItem(itemIndex);
  };

  const handleCategoryTap = async (category: 0 | 1) => {
    if (activeItem === null) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSorted((prev) => ({ ...prev, [activeItem]: category }));
    setActiveItem(null);
  };

  const handleFinish = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const correct = data.items.filter((item, i) => sorted[i] === item.category).length;
    setDone(true);
    onComplete(
      { correct, total: data.items.length, perfect: correct === data.items.length },
      { sortedItems: sorted }
    );
  };

  if (done) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        {t('patientApp.stim.sorting.instruction')}
      </Text>

      {/* Category zones */}
      <View style={styles.categoriesRow}>
        <TouchableOpacity
          style={[styles.categoryZone, styles.category1, activeItem !== null && styles.categoryActive]}
          onPress={() => handleCategoryTap(0)}
          activeOpacity={0.8}
          disabled={activeItem === null}
        >
          <Text style={styles.categoryEmoji}>{data.category1Emoji}</Text>
          <Text style={styles.categoryLabel}>{t(data.category1Key)}</Text>
          <View style={styles.categoryItems}>
            {cat1Items.map((item, i) => (
              <Text key={i} style={styles.sortedItemEmoji}>{item.emoji}</Text>
            ))}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryZone, styles.category2, activeItem !== null && styles.categoryActive]}
          onPress={() => handleCategoryTap(1)}
          activeOpacity={0.8}
          disabled={activeItem === null}
        >
          <Text style={styles.categoryEmoji}>{data.category2Emoji}</Text>
          <Text style={styles.categoryLabel}>{t(data.category2Key)}</Text>
          <View style={styles.categoryItems}>
            {cat2Items.map((item, i) => (
              <Text key={i} style={styles.sortedItemEmoji}>{item.emoji}</Text>
            ))}
          </View>
        </TouchableOpacity>
      </View>

      {/* Unsorted items */}
      {unsortedItems.length > 0 && (
        <View style={styles.itemsContainer}>
          <Text style={styles.tapHint}>
            {activeItem !== null
              ? t('patientApp.stim.sorting.tapCategory')
              : t('patientApp.stim.sorting.tapItem')}
          </Text>
          <View style={styles.itemsGrid}>
            {data.items.map((item, index) => {
              if (sorted[index] !== undefined) return null;
              const isActive = activeItem === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.itemCard, isActive && styles.itemCardActive]}
                  onPress={() => handleItemTap(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <Text style={styles.itemLabel}>{t(item.labelKey)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {allSorted && (
        <TouchableOpacity style={styles.doneButton} onPress={handleFinish} activeOpacity={0.8}>
          <Text style={styles.doneButtonText}>{t('patientApp.stim.common.imDone')}</Text>
        </TouchableOpacity>
      )}

      {!allSorted && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16 },
  instruction: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 20,
  },
  categoriesRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  categoryZone: {
    flex: 1, borderRadius: RADIUS.xl, padding: 16, minHeight: 120,
    borderWidth: 2, alignItems: 'center',
  },
  category1: { backgroundColor: '#EDF2F8', borderColor: COLORS.info },
  category2: { backgroundColor: '#FDF6EA', borderColor: COLORS.amber },
  categoryActive: { borderStyle: 'dashed' as const },
  categoryEmoji: { fontSize: 32, marginBottom: 4 },
  categoryLabel: { fontSize: 20, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary, textAlign: 'center' },
  categoryItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8, justifyContent: 'center' },
  sortedItemEmoji: { fontSize: 28 },
  itemsContainer: { marginBottom: 16 },
  tapHint: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted,
    textAlign: 'center', marginBottom: 12,
  },
  itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  itemCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    paddingVertical: 14, paddingHorizontal: 20, borderWidth: 2,
    borderColor: COLORS.border, alignItems: 'center', minWidth: 100, ...SHADOWS.sm,
  },
  itemCardActive: { borderColor: COLORS.brand600, backgroundColor: COLORS.brand50 },
  itemEmoji: { fontSize: 32, marginBottom: 4 },
  itemLabel: { fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.textPrimary },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: RADIUS.lg, alignSelf: 'center', marginTop: 16,
  },
  doneButtonText: { fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
