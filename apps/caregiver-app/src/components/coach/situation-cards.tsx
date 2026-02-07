import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme';

const SITUATIONS = [
  'refusing_food',
  'refusing_medication',
  'agitated',
  'not_recognizing',
  'repetitive_questions',
  'sundowning',
  'wants_to_leave',
  'caregiver_overwhelmed',
] as const;

interface SituationCardsProps {
  onSelect: (situationKey: string) => void;
}

export default function SituationCards({ onSelect }: SituationCardsProps) {
  const { t } = useTranslation();

  return (
    <View>
      <Text style={styles.title}>{t('caregiverApp.coach.hub.rightNow.title')}</Text>
      <Text style={styles.subtitle}>{t('caregiverApp.coach.hub.rightNow.subtitle')}</Text>
      <View style={styles.grid}>
        {SITUATIONS.map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.card}
            onPress={() => onSelect(key)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardText}>
              {t(`caregiverApp.coach.hub.rightNow.${key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 11,
    fontFamily: FONTS.displayMedium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: SPACING[3],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.amber,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
  },
  cardText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
  },
});
