import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { PhotoPairsContent } from '../../data/bundled-activities';

interface Card {
  id: number;
  pairId: number;
  emoji: string;
  labelKey: string;
  flipped: boolean;
  matched: boolean;
}

function createCards(pairs: PhotoPairsContent['pairs']): Card[] {
  const cards: Card[] = [];
  pairs.forEach((pair, i) => {
    cards.push({ id: i * 2, pairId: i, emoji: pair.emoji, labelKey: pair.labelKey, flipped: false, matched: false });
    cards.push({ id: i * 2 + 1, pairId: i, emoji: pair.emoji, labelKey: pair.labelKey, flipped: false, matched: false });
  });
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function PhotoPairsRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as PhotoPairsContent;
  const [cards, setCards] = useState<Card[]>(() => createCards(data?.pairs ?? []));
  const [firstFlipped, setFirstFlipped] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);

  if (!data) return null;

  const matchedCount = cards.filter((c) => c.matched).length / 2;
  const totalPairs = data.pairs.length;
  const allMatched = matchedCount === totalPairs;

  const handleTap = useCallback((cardId: number) => {
    if (checking) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const updated = cards.map((c) =>
      c.id === cardId ? { ...c, flipped: true } : c
    );
    setCards(updated);

    if (firstFlipped === null) {
      setFirstFlipped(cardId);
    } else {
      setChecking(true);
      const first = cards.find((c) => c.id === firstFlipped)!;
      const second = card;

      if (first.pairId === second.pairId) {
        // Match!
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const matched = updated.map((c) =>
          c.pairId === first.pairId ? { ...c, matched: true } : c
        );
        setCards(matched);
        setFirstFlipped(null);
        setChecking(false);

        // Check if all matched
        if (matched.filter((c) => c.matched).length === matched.length) {
          setTimeout(() => onComplete({ activity: 'photo_pairs' }), 800);
        }
      } else {
        // No match — flip back after delay
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstFlipped || c.id === cardId
                ? { ...c, flipped: false }
                : c
            )
          );
          setFirstFlipped(null);
          setChecking(false);
        }, 1000);
      }
    }
  }, [cards, firstFlipped, checking, onComplete]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🃏</Text>
      <Text style={styles.theme}>{t(data.themeKey)}</Text>
      <Text style={styles.progress}>
        {t('patientApp.stim.photoPairs.pairsFound', { found: matchedCount, total: totalPairs })}
      </Text>

      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.flipped || card.matched ? styles.cardFlipped : styles.cardHidden,
              card.matched && styles.cardMatched,
            ]}
            onPress={() => handleTap(card.id)}
            activeOpacity={0.8}
            disabled={card.flipped || card.matched || checking}
          >
            {card.flipped || card.matched ? (
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
            ) : (
              <Text style={styles.cardBack}>?</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {allMatched && (
        <Text style={styles.celebration}>{t('patientApp.stim.common.wellDone')}</Text>
      )}

      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  emoji: { fontSize: 48, marginBottom: 8 },
  theme: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary,
    marginBottom: 8,
  },
  progress: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 24,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 12, marginBottom: 24,
  },
  card: {
    width: 80, height: 80, borderRadius: RADIUS.lg,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
  },
  cardHidden: {
    backgroundColor: COLORS.brand200, borderColor: COLORS.brand400,
  },
  cardFlipped: {
    backgroundColor: COLORS.card, borderColor: COLORS.border,
  },
  cardMatched: {
    backgroundColor: COLORS.successBg, borderColor: COLORS.success,
  },
  cardEmoji: { fontSize: 36 },
  cardBack: {
    fontSize: 28, fontFamily: FONTS.display, color: COLORS.brand600,
  },
  celebration: {
    fontSize: 28, fontFamily: FONTS.display, color: COLORS.success, marginBottom: 16,
  },
  skipButton: { marginTop: 16, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
