import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BehaviourPlaybook } from '@ourturn/shared';
import { createThemedStyles, FONTS, RADIUS, SPACING } from '../../theme';

interface PlaybookGridProps {
  playbooks: BehaviourPlaybook[];
  onSelect: (playbook: BehaviourPlaybook) => void;
}

export function PlaybookGrid({ playbooks, onSelect }: PlaybookGridProps) {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('caregiverApp.toolkit.behaviours.playbooks.title')}
      </Text>
      <Text style={styles.subtitle}>
        {t('caregiverApp.toolkit.behaviours.playbooks.subtitle')}
      </Text>

      <View style={styles.grid}>
        {playbooks.map((playbook) => (
          <TouchableOpacity
            key={playbook.id}
            style={styles.card}
            onPress={() => onSelect(playbook)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{playbook.emoji}</Text>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {playbook.title}
            </Text>
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
    borderWidth: 1,
    borderColor: colors.border,
    padding: SPACING[5],
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.display,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginBottom: SPACING[4],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  card: {
    width: '47%',
    alignItems: 'center',
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    minHeight: 88,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
    marginBottom: SPACING[2],
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
}));
