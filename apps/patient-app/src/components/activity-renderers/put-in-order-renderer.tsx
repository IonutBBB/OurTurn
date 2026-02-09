import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { PutInOrderContent } from '../../data/bundled-activities';

export default function PutInOrderRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as PutInOrderContent;
  const [order, setOrder] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);

  if (!data) return null;

  const handleTapStep = async (stepIndex: number) => {
    if (revealed) return;
    if (order.includes(stepIndex)) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newOrder = [...order, stepIndex];
    setOrder(newOrder);

    // Auto-reveal when all steps assigned
    if (newOrder.length === data.steps.length) {
      setTimeout(() => setRevealed(true), 400);
    }
  };

  const handleUndo = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOrder((prev) => prev.slice(0, -1));
  };

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const correct = order.every(
      (stepIdx, position) => data.steps[stepIdx].correctPosition === position + 1
    );
    onComplete(
      { correct, order: order.map((i) => data.steps[i].correctPosition) },
      { task: data.titleKey }
    );
  };

  const getStepNumber = (stepIndex: number): number | null => {
    const pos = order.indexOf(stepIndex);
    return pos >= 0 ? pos + 1 : null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{data.emoji}</Text>
      <Text style={styles.title}>{t(data.titleKey)}</Text>
      <Text style={styles.instruction}>
        {t('patientApp.stim.putInOrder.instruction')}
      </Text>

      <View style={styles.stepsContainer}>
        {data.steps.map((step, index) => {
          const number = getStepNumber(index);
          const assigned = number !== null;
          const correctPos = step.correctPosition;
          const isCorrect = revealed && number === correctPos;
          const isWrong = revealed && assigned && number !== correctPos;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepCard,
                assigned && styles.stepCardAssigned,
                isCorrect && styles.stepCardCorrect,
                isWrong && styles.stepCardWrong,
              ]}
              onPress={() => handleTapStep(index)}
              disabled={assigned || revealed}
              activeOpacity={0.8}
            >
              {assigned && (
                <View style={[
                  styles.numberBadge,
                  isCorrect && styles.numberBadgeCorrect,
                  isWrong && styles.numberBadgeWrong,
                ]}>
                  <Text style={styles.numberText}>
                    {revealed ? correctPos : number}
                  </Text>
                </View>
              )}
              <Text style={styles.stepText}>{t(step.labelKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!revealed && order.length > 0 && (
        <TouchableOpacity style={styles.undoButton} onPress={handleUndo} activeOpacity={0.8}>
          <Text style={styles.undoText}>{t('patientApp.stim.putInOrder.undo')}</Text>
        </TouchableOpacity>
      )}

      {revealed && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>🎉</Text>
          <Text style={styles.resultText}>{t('patientApp.stim.common.wellDone')}</Text>
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
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 26, fontFamily: FONTS.display, color: COLORS.textPrimary, marginBottom: 8 },
  instruction: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 24,
  },
  stepsContainer: { width: '100%', gap: 10, marginBottom: 16 },
  stepCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg, paddingVertical: 16, paddingHorizontal: 20,
    borderWidth: 2, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  stepCardAssigned: { borderColor: COLORS.cognitive, backgroundColor: COLORS.cognitiveBg },
  stepCardCorrect: { borderColor: COLORS.success, backgroundColor: COLORS.successBg },
  stepCardWrong: { borderColor: COLORS.amber, backgroundColor: COLORS.amberBg },
  numberBadge: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.cognitive,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  numberBadgeCorrect: { backgroundColor: COLORS.success },
  numberBadgeWrong: { backgroundColor: COLORS.amber },
  numberText: { fontSize: 20, fontFamily: FONTS.bodyBold, color: COLORS.textInverse },
  stepText: { fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textPrimary, flex: 1 },
  undoButton: {
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  undoText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textSecondary },
  resultContainer: { alignItems: 'center', marginTop: 8 },
  resultEmoji: { fontSize: 48, marginBottom: 8 },
  resultText: { fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary, marginBottom: 16 },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
