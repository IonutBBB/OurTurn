import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, FONTS, RADIUS, SHADOWS, SPACING } from '../../theme';

const WORKFLOWS = [
  { key: 'plan_tomorrow', emoji: '\u{1F4C5}' },
  { key: 'doctor_visit', emoji: '\u{1FA7A}' },
  { key: 'review_week', emoji: '\u{1F4C8}' },
  { key: 'adjust_plan', emoji: '\u2699\uFE0F' },
] as const;

interface WorkflowCardsProps {
  onSelect: (workflowKey: string) => void;
}

export default function WorkflowCards({ onSelect }: WorkflowCardsProps) {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <View>
      <Text style={styles.title}>{t('caregiverApp.coach.hub.planPrepare.title')}</Text>
      <Text style={styles.subtitle}>{t('caregiverApp.coach.hub.planPrepare.subtitle')}</Text>
      <View style={styles.grid}>
        {WORKFLOWS.map(({ key, emoji }) => (
          <TouchableOpacity
            key={key}
            style={styles.card}
            onPress={() => onSelect(key)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.cardTitle}>
              {t(`caregiverApp.coach.hub.planPrepare.${key}`)}
            </Text>
            <Text style={styles.cardDesc}>
              {t(`caregiverApp.coach.hub.planPrepare.${key}_desc`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  title: {
    fontSize: 11,
    fontFamily: FONTS.displayMedium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginBottom: SPACING[3],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  card: {
    width: '48%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADIUS.md,
    padding: SPACING[4],
    ...SHADOWS.sm,
  },
  emoji: {
    fontSize: 20,
    marginBottom: SPACING[1],
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: FONTS.bodyMedium,
    color: colors.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
}));
