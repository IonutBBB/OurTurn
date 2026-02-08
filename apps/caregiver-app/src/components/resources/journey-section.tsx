import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { JOURNEY_STEPS } from '@ourturn/shared';
import type { JourneyStepDefinition, JourneyProgress } from '@ourturn/shared';
import { JourneyStepCard } from './journey-step-card';
import { createThemedStyles, FONTS, SPACING } from '../../theme';

interface JourneySectionProps {
  progressMap: Record<string, JourneyProgress>;
  onSelectStep: (step: JourneyStepDefinition) => void;
}

const INITIAL_VISIBLE = 3;

export function JourneySection({ progressMap, onSelectStep }: JourneySectionProps) {
  const { t } = useTranslation('resources');
  const styles = useStyles();
  const [showAll, setShowAll] = useState(false);

  const visibleSteps = showAll ? JOURNEY_STEPS : JOURNEY_STEPS.slice(0, INITIAL_VISIBLE);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{t('journey.sectionTitle')}</Text>
      <Text style={styles.sectionSubLabel}>{t('journey.sectionSubtitle')}</Text>

      <View style={styles.stepList}>
        {visibleSteps.map((step) => (
          <JourneyStepCard
            key={step.slug}
            step={step}
            progress={progressMap[step.slug]}
            onPress={() => onSelectStep(step)}
          />
        ))}
      </View>

      {JOURNEY_STEPS.length > INITIAL_VISIBLE && (
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setShowAll(!showAll)}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleText}>
            {showAll ? t('journey.showLess') : t('journey.showAll')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    gap: SPACING[3],
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.displayMedium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  sectionSubLabel: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginBottom: SPACING[1],
  },
  stepList: {
    gap: SPACING[3],
  },
  toggleBtn: {
    alignItems: 'center',
    paddingVertical: SPACING[2],
  },
  toggleText: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: colors.brand600,
  },
}));
