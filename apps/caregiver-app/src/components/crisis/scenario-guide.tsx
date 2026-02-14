import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { createThemedStyles, FONTS, RADIUS, SHADOWS } from '../../theme';
import type { CrisisScenario, CrisisStep } from './scenarios-data';

interface ScenarioGuideProps {
  scenario: CrisisScenario;
  patientName: string;
  calmingStrategies: string[] | null;
  onBack: () => void;
  onAlertFamily: () => void;
}

const STEP_TYPE_ICONS: Record<CrisisStep['type'], string> = {
  breathe: '🫁',
  assess: '🔍',
  do: '✋',
  escalate: '🚨',
};

export function ScenarioGuide({
  scenario,
  patientName,
  calmingStrategies,
  onBack,
  onAlertFamily,
}: ScenarioGuideProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [expandedStep, setExpandedStep] = useState(0);

  const handleToggleStep = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedStep(expandedStep === idx ? -1 : idx);
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>‹ {t('caregiverApp.crisis.scenarios.backToSituations')}</Text>
      </TouchableOpacity>

      {/* Scenario Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>{scenario.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{scenario.label}</Text>
          <Text style={styles.headerSteps}>{scenario.stepCountDescription}</Text>
        </View>
      </View>

      {/* Personalization Box (A6) */}
      {calmingStrategies && calmingStrategies.length > 0 ? (
        <View style={styles.personalizationBox}>
          <Text style={styles.personalizationLabel}>
            {t('caregiverApp.crisis.personalization.label', { name: patientName })}
          </Text>
          <Text style={styles.personalizationText}>
            {calmingStrategies.join(', ')}
          </Text>
        </View>
      ) : (
        <View style={styles.personalizationBoxEmpty}>
          <Text style={styles.personalizationEmptyText}>
            {t('caregiverApp.crisis.personalization.empty', { name: patientName })}
          </Text>
        </View>
      )}

      {/* Steps Accordion */}
      {scenario.steps.map((step, idx) => {
        const isOpen = expandedStep === idx;
        return (
          <View key={idx} style={styles.stepCard}>
            <TouchableOpacity
              style={styles.stepHeader}
              onPress={() => handleToggleStep(idx)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepIcon}>{STEP_TYPE_ICONS[step.type]}</Text>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepNumber}>
                  {t('caregiverApp.crisis.wizard.stepOf', { current: idx + 1, total: scenario.steps.length })}
                </Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {isOpen && (
              <View style={styles.stepBody}>
                <Text style={styles.stepInstruction}>{step.instruction}</Text>

                {step.tips && step.tips.length > 0 && (
                  <View style={styles.tipsList}>
                    {step.tips.map((tip, i) => (
                      <View key={i} style={styles.tipRow}>
                        <Text style={styles.tipBullet}>•</Text>
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {step.checklist && step.checklist.length > 0 && (
                  <View style={styles.checklistContainer}>
                    {step.checklist.map((item, i) => (
                      <View key={i} style={styles.checklistRow}>
                        <Text style={styles.checklistBox}>☐</Text>
                        <Text style={styles.checklistText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {step.type === 'do' && step.actionLabel?.includes('Alert') && (
                  <TouchableOpacity
                    style={styles.alertFamilyButton}
                    onPress={onAlertFamily}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.alertFamilyButtonText}>
                      {t('caregiverApp.crisis.actions.alertFamily')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}

    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    gap: 12,
  },
  backButton: {
    marginBottom: 4,
  },
  backText: {
    fontSize: 15,
    color: colors.brand600,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerEmoji: {
    fontSize: 36,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
  },
  headerSteps: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  personalizationBox: {
    backgroundColor: '#dcfce7',
    borderRadius: RADIUS.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: '#16a34a30',
  },
  personalizationLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONTS.bodySemiBold,
    color: '#16a34a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  personalizationText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  personalizationBoxEmpty: {
    backgroundColor: colors.background,
    borderRadius: RADIUS.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personalizationEmptyText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },
  stepCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  stepIcon: {
    fontSize: 20,
  },
  stepHeaderText: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 12,
    color: colors.textMuted,
  },
  stepBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  stepInstruction: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  tipsList: {
    marginTop: 12,
    gap: 6,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: colors.brand600,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  checklistContainer: {
    marginTop: 12,
    gap: 8,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checklistBox: {
    fontSize: 16,
    color: colors.textMuted,
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  alertFamilyButton: {
    marginTop: 10,
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    alignItems: 'center',
  },
  alertFamilyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textInverse,
  },
}));
