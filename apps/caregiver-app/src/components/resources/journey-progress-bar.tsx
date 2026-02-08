import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, useColors, FONTS, SPACING } from '../../theme';

interface JourneyProgressBarProps {
  completedCount: number;
  totalCount: number;
  stepStatuses: string[];
}

export function JourneyProgressBar({
  completedCount,
  totalCount,
  stepStatuses,
}: JourneyProgressBarProps) {
  const { t } = useTranslation('resources');
  const styles = useStyles();
  const colors = useColors();

  const getColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'in_progress':
        return colors.amber;
      default:
        return colors.border;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {stepStatuses.map((status, i) => (
          <View key={i} style={styles.dotGroup}>
            {i > 0 && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor:
                      stepStatuses[i - 1] === 'completed'
                        ? colors.success
                        : colors.border,
                  },
                ]}
              />
            )}
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    status === 'not_started' ? colors.card : getColor(status),
                  borderColor: getColor(status),
                },
              ]}
            />
          </View>
        ))}
      </View>
      <Text style={styles.label}>
        {t('journey.progressLabel', { completed: completedCount, total: totalCount })}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    alignItems: 'center',
    gap: SPACING[2],
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    width: 24,
    height: 2,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  label: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },
}));
