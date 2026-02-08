import { useMemo } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, FONTS, RADIUS } from '../../theme';

interface CrisisEntry {
  id: string;
  content: string;
  created_at: string;
}

interface PatternInsightProps {
  entries: CrisisEntry[];
}

export function PatternInsight({ entries }: PatternInsightProps) {
  const { t } = useTranslation();
  const styles = useStyles();

  const insight = useMemo(() => {
    if (entries.length === 0) return null;

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = entries.filter(
      (e) => new Date(e.created_at) >= weekAgo
    );

    return {
      total: entries.length,
      thisWeekCount: thisWeek.length,
    };
  }, [entries]);

  if (!insight) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.text}>
          {t('caregiverApp.crisis.patterns.noEvents')}
        </Text>
      </View>
    );
  }

  if (insight.total < 3) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.text}>
          {t('caregiverApp.crisis.patterns.fewEvents', { count: insight.total })}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📊</Text>
      <View style={styles.textContainer}>
        <Text style={styles.label}>
          {t('caregiverApp.crisis.patterns.title')}
        </Text>
        <Text style={styles.text}>
          {t('caregiverApp.crisis.patterns.weekCount', {
            count: insight.thisWeekCount,
          })}
        </Text>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.amberBg,
    borderRadius: RADIUS.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.amber + '30',
  },
  icon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONTS.bodySemiBold,
    color: colors.amber,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    lineHeight: 19,
  },
}));
