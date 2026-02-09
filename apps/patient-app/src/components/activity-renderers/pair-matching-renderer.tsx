import { useState, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { PairMatchingContent } from '../../data/bundled-activities';

interface Card {
  id: number;
  emoji: string;
  pairId: number;
}

export default function PairMatchingRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as PairMatchingContent;

  // Create shuffled card deck
  const cards = useMemo(() => {
    if (!data) return [];
    const deck: Card[] = [];
    data.pairs.forEach((emoji, pairId) => {
      deck.push({ id: pairId * 2, emoji, pairId });
      deck.push({ id: pairId * 2 + 1, emoji, pairId });
    });
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }, [data]);

  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const matchCount = useRef(0);

  if (!data) return null;

  const totalPairs = data.pairs.length;
  const allMatched = matched.size === cards.length;

  const handleCardTap = async (cardId: number) => {
    if (isChecking) return;
    if (flipped.has(cardId) || matched.has(cardId)) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newFlipped = new Set(flipped);
    newFlipped.add(cardId);
    setFlipped(newFlipped);

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      const [first, second] = newSelected;
      const card1 = cards.find((c) => c.id === first)!;
      const card2 = cards.find((c) => c.id === second)!;

      if (card1.pairId === card2.pairId) {
        // Match!
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        matchCount.current += 1;
        const newMatched = new Set(matched);
        newMatched.add(first);
        newMatched.add(second);
        setMatched(newMatched);
        setSelectedCards([]);
        setIsChecking(false);

        // Check if all done
        if (newMatched.size === cards.length) {
          setTimeout(() => {
            onComplete(
              { pairs: totalPairs, matchesFound: matchCount.current },
              { activity: 'pair_matching' }
            );
          }, 600);
        }
      } else {
        // No match — flip back after delay
        setTimeout(() => {
          const flipBack = new Set(newFlipped);
          flipBack.delete(first);
          flipBack.delete(second);
          setFlipped(flipBack);
          setSelectedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const numCols = cards.length <= 8 ? 2 : 3;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🃏</Text>
      <Text style={styles.instruction}>
        {t('patientApp.stim.pairMatching.instruction')}
      </Text>
      <Text style={styles.progress}>
        {t('patientApp.stim.pairMatching.pairsFound', {
          found: Math.floor(matched.size / 2),
          total: totalPairs,
        })}
      </Text>

      <View style={[styles.grid, { maxWidth: numCols * 110 }]}>
        {cards.map((card) => {
          const isFlipped = flipped.has(card.id) || matched.has(card.id);
          const isMatched = matched.has(card.id);

          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                isFlipped && styles.cardFlipped,
                isMatched && styles.cardMatched,
              ]}
              onPress={() => handleCardTap(card.id)}
              disabled={isFlipped || isMatched}
              activeOpacity={0.8}
            >
              <Text style={styles.cardContent}>
                {isFlipped ? card.emoji : '❓'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {allMatched && (
        <View style={styles.celebration}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationText}>{t('patientApp.stim.common.wellDone')}</Text>
        </View>
      )}

      {!allMatched && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  emoji: { fontSize: 48, marginBottom: 8 },
  instruction: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    textAlign: 'center', marginBottom: 8,
  },
  progress: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 20,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'center', marginBottom: 16,
  },
  card: {
    width: 90, height: 90, borderRadius: RADIUS.lg, backgroundColor: COLORS.brand100,
    borderWidth: 2, borderColor: COLORS.brand300, alignItems: 'center',
    justifyContent: 'center', ...SHADOWS.sm,
  },
  cardFlipped: { backgroundColor: COLORS.card, borderColor: COLORS.cognitive },
  cardMatched: { backgroundColor: COLORS.successBg, borderColor: COLORS.success, opacity: 0.8 },
  cardContent: { fontSize: 36 },
  celebration: { alignItems: 'center', marginTop: 8 },
  celebrationEmoji: { fontSize: 56, marginBottom: 8 },
  celebrationText: { fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
