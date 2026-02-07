import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../theme';

interface InsightData {
  text: string;
  suggestion: string;
  category: 'positive' | 'attention' | 'suggestion';
}

interface ProactiveInsightCardProps {
  insight: InsightData | null;
  patientName: string;
  onDiscuss: (insightText: string) => void;
}

const borderColors = {
  positive: COLORS.success,
  attention: COLORS.amber,
  suggestion: COLORS.brand500,
};

export default function ProactiveInsightCard({
  insight,
  patientName,
  onDiscuss,
}: ProactiveInsightCardProps) {
  const { t } = useTranslation();

  if (!insight) {
    return (
      <View style={[styles.card, { borderLeftColor: COLORS.brand200 }]}>
        <Text style={styles.label}>{t('caregiverApp.coach.hub.insight.title')}</Text>
        <Text style={styles.fallback}>
          {t('caregiverApp.coach.hub.insight.fallback', { name: patientName })}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { borderLeftColor: borderColors[insight.category] }]}>
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.label}>{t('caregiverApp.coach.hub.insight.title')}</Text>
          <Text style={styles.insightText}>{insight.text}</Text>
          {insight.suggestion ? (
            <Text style={styles.suggestion}>{insight.suggestion}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.discussButton}
          onPress={() => onDiscuss(insight.text)}
        >
          <Text style={styles.discussText}>{t('caregiverApp.coach.hub.insight.discuss')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: SPACING[4],
    ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[3],
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontFamily: FONTS.displayMedium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    marginBottom: SPACING[1],
  },
  insightText: {
    fontSize: 15,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  suggestion: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING[1],
  },
  fallback: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  discussButton: {
    backgroundColor: COLORS.brand600,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.lg,
  },
  discussText: {
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
});
