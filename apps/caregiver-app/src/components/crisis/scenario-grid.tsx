import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, FONTS, RADIUS, SHADOWS } from '../../theme';
import type { CrisisScenario } from './scenarios-data';

interface ScenarioGridProps {
  scenarios: CrisisScenario[];
  onSelectScenario: (id: string) => void;
}

export function ScenarioGrid({ scenarios, onSelectScenario }: ScenarioGridProps) {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('caregiverApp.crisis.scenarios.title')}</Text>
      <Text style={styles.subtitle}>{t('caregiverApp.crisis.scenarios.subtitle')}</Text>

      <View style={styles.grid}>
        {scenarios.map((scenario) => (
          <TouchableOpacity
            key={scenario.id}
            style={styles.card}
            onPress={() => onSelectScenario(scenario.id)}
            activeOpacity={0.7}
          >
            {scenario.urgency === 'critical' && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>
                  {t('caregiverApp.crisis.scenarios.urgent')}
                </Text>
              </View>
            )}
            <View style={styles.cardContent}>
              <Text style={styles.cardEmoji}>{scenario.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>{scenario.label}</Text>
                <Text style={styles.cardSteps}>{scenario.stepCountDescription}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  grid: {
    gap: 10,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
  },
  cardSteps: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  urgentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.danger + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONTS.bodySemiBold,
    color: colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
}));
