import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import LargeNumpad from '../large-numpad';
import type { ActivityRendererProps } from './types';
import type { PriceGuessingContent } from '../../data/bundled-activities';

export default function PriceGuessingRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);
  const data = content as PriceGuessingContent;

  if (!data) return null;

  const handleGuess = async () => {
    if (!guess) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRevealed(true);
  };

  const guessNum = parseFloat(guess) || 0;
  const diff = Math.abs(guessNum - data.actualPrice);
  const closeEnough = diff <= data.actualPrice * 0.25; // within 25%

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(
      { guess: guessNum, actual: data.actualPrice, difference: diff, close: closeEnough },
      { item: data.itemKey }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.itemEmoji}>{data.emoji}</Text>
      <Text style={styles.itemName}>{t(data.itemKey)}</Text>
      <Text style={styles.instruction}>
        {t('patientApp.stim.priceGuessing.howMuch')}
      </Text>

      {!revealed ? (
        <>
          <LargeNumpad
            value={guess}
            onValueChange={setGuess}
            currency={data.currency}
          />
          <TouchableOpacity
            style={[styles.guessButton, !guess && styles.guessButtonDisabled]}
            onPress={handleGuess}
            disabled={!guess}
            activeOpacity={0.8}
          >
            <Text style={styles.guessButtonText}>
              {t('patientApp.stim.priceGuessing.makeGuess')}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{closeEnough ? '🎉' : '💡'}</Text>
          <Text style={styles.yourGuess}>
            {t('patientApp.stim.priceGuessing.youGuessed', { price: `${data.currency}${guess}` })}
          </Text>
          <View style={styles.actualPriceCard}>
            <Text style={styles.actualLabel}>
              {t('patientApp.stim.priceGuessing.actualPrice')}
            </Text>
            <Text style={styles.actualPrice}>
              {data.currency}{data.actualPrice.toFixed(2)}
            </Text>
          </View>
          <Text style={styles.feedback}>
            {closeEnough
              ? t('patientApp.stim.priceGuessing.veryClose')
              : t('patientApp.stim.priceGuessing.goodTry')}
          </Text>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
            <Text style={styles.doneButtonText}>{t('patientApp.stim.common.greatJob')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!revealed && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  itemEmoji: { fontSize: 64, marginBottom: 12 },
  itemName: {
    fontSize: 26, fontFamily: FONTS.display, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 8,
  },
  instruction: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textSecondary,
    marginBottom: 24,
  },
  guessButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: RADIUS.lg, marginTop: 8,
  },
  guessButtonDisabled: { opacity: 0.5 },
  guessButtonText: { fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  resultContainer: { alignItems: 'center', width: '100%' },
  resultEmoji: { fontSize: 56, marginBottom: 12 },
  yourGuess: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textSecondary,
    marginBottom: 16,
  },
  actualPriceCard: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS.xl,
    paddingVertical: 16, paddingHorizontal: 32, borderWidth: 2,
    borderColor: COLORS.success, marginBottom: 16, alignItems: 'center',
  },
  actualLabel: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.success },
  actualPrice: { fontSize: 36, fontFamily: FONTS.display, color: COLORS.success },
  feedback: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 24,
  },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
