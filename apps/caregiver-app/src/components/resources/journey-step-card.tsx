import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { JourneyStepDefinition, JourneyProgress } from '@ourturn/shared';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS, SPACING } from '../../theme';

interface JourneyStepCardProps {
  step: JourneyStepDefinition;
  progress?: JourneyProgress;
  onPress: () => void;
}

export function JourneyStepCard({ step, progress, onPress }: JourneyStepCardProps) {
  const { t } = useTranslation('resources');
  const styles = useStyles();
  const colors = useColors();
  const status = progress?.status ?? 'not_started';

  const accentColor =
    status === 'completed'
      ? colors.success
      : status === 'in_progress'
        ? colors.amber
        : colors.border;

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

const useStyles = createThemedStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
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
    color: colors.textMuted,
  },
  checklistPreview: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: colors.success,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
  },
}));
