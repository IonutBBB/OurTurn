import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { FONTS, RADIUS, SHADOWS, createThemedStyles } from '../theme';

type TrialFeature = 'tasks' | 'caregiver' | 'aiCoach' | 'safeZones' | 'reports' | 'journal' | 'insights' | 'wellbeing';

interface ContextualTrialPromptProps {
  feature: TrialFeature;
}

const ICONS: Record<TrialFeature, string> = {
  tasks: '\u2705',
  caregiver: '\u{1F46A}',
  aiCoach: '\u{1F4AC}',
  safeZones: '\u{1F4CD}',
  reports: '\u{1F4CB}',
  journal: '\u{1F4D3}',
  insights: '\u{1F4CA}',
  wellbeing: '\u{1F33F}',
};

/**
 * Contextual upgrade prompt for mobile — shown when a free-tier user hits a Plus feature limit.
 */
export function ContextualTrialPrompt({ feature }: ContextualTrialPromptProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{ICONS[feature]}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{t('subscription.contextualTrial.title')}</Text>
          <Text style={styles.description}>{t(`subscription.contextualTrial.${feature}`)}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.trialButton}
              onPress={() => router.push('/settings')}
              activeOpacity={0.7}
            >
              <Text style={styles.trialButtonText}>{t('subscription.contextualTrial.startTrial')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDismissed(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.laterText}>{t('subscription.contextualTrial.maybeLater')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.noCard}>{t('subscription.contextualTrial.noCardRequired')}</Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: colors.brand200,
    backgroundColor: colors.brand50,
    padding: 16,
    ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.brand100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trialButton: {
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  trialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textInverse,
  },
  laterText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },
  noCard: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginTop: 8,
  },
}));
