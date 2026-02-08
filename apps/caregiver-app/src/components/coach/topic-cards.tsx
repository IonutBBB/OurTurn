import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, FONTS, RADIUS, SPACING } from '../../theme';

const TOPICS = [
  'daily_routines',
  'communication',
  'behaviors',
  'activities',
  'nutrition',
  'safety',
  'sleep',
] as const;

interface TopicCardsProps {
  patientName: string;
  onSelect: (topicKey: string) => void;
}

export default function TopicCards({ patientName, onSelect }: TopicCardsProps) {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <View>
      <Text style={styles.title}>{t('caregiverApp.coach.hub.learn.title')}</Text>
      <Text style={styles.subtitle}>{t('caregiverApp.coach.hub.learn.subtitle', { name: patientName })}</Text>
      <View style={styles.grid}>
        {TOPICS.map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.card}
            onPress={() => onSelect(key)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardText}>
              {t(`caregiverApp.coach.hub.learn.${key}`)}
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand300,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
  },
  cardText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
  },
}));
