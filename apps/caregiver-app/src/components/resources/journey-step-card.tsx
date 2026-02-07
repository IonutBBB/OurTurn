import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { JourneyStepDefinition, JourneyProgress } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../theme';

interface JourneyStepCardProps {
  step: JourneyStepDefinition;
  progress?: JourneyProgress;
  onPress: () => void;
}

export function JourneyStepCard({ step, progress, onPress }: JourneyStepCardProps) {
  const { t } = useTranslation('resources');
  const status = progress?.status ?? 'not_started';

  const accentColor =
    status === 'completed'
      ? COLORS.success
      : status === 'in_progress'
        ? COLORS.amber
        : COLORS.border;

  const checklist = progress?.checklist_state ?? [];
  const checkedCount = checklist.filter(Boolean).length;
  const totalChecklist = step.checklistKeys.length;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Text style={styles.emoji}>{step.emoji}</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{t(step.titleKey)}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {t(step.subtitleKey)}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.time}>{step.timeEstimate}</Text>
            {checkedCount > 0 && (
              <Text style={styles.checklistPreview}>
                {t('journey.checklistProgress', { done: checkedCount, total: totalChecklist })}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderRadius: RADIUS.md,
    padding: SPACING[4],
    ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  emoji: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  checklistPreview: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.success,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textMuted,
  },
});
