import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import type { CaregiverWellbeingLog } from '@ourturn/shared';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS } from '../../theme';

interface WeeklyStatsProps {
  recentLogs: CaregiverWellbeingLog[];
  apiBaseUrl: string;
}

interface InsightCard {
  category: string;
  text: string;
  suggestion: string;
}

export function WeeklyStats({ recentLogs, apiBaseUrl }: WeeklyStatsProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const colors = useColors();
  const [insights, setInsights] = useState<InsightCard[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = useMemo(() => {
    const recentWeek = recentLogs.slice(0, 7);
    const hasData = recentWeek.some(
      (l) => l.energy_level != null || l.stress_level != null || l.sleep_quality_rating != null
    );

    if (!hasData) return null;

    const energyLogs = recentWeek.filter((l) => l.energy_level != null);
    const stressLogs = recentWeek.filter((l) => l.stress_level != null);
    const sleepLogs = recentWeek.filter((l) => l.sleep_quality_rating != null);

    return {
      avgEnergy: energyLogs.length > 0
        ? (energyLogs.reduce((s, l) => s + (l.energy_level || 0), 0) / energyLogs.length).toFixed(1)
        : null,
      avgStress: stressLogs.length > 0
        ? (stressLogs.reduce((s, l) => s + (l.stress_level || 0), 0) / stressLogs.length).toFixed(1)
        : null,
      avgSleep: sleepLogs.length > 0
        ? (sleepLogs.reduce((s, l) => s + (l.sleep_quality_rating || 0), 0) / sleepLogs.length).toFixed(1)
        : null,
    };
  }, [recentLogs]);

  const generateDigest = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/ai/toolkit-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: i18n.language }),
      });

      if (res.status === 429) {
        Alert.alert(t('common.errorTitle'), t('common.error'));
        return;
      }
      if (!res.ok) throw new Error('Failed');

      const data = await res.json();
      setInsights(data.insights);
    } catch {
      Alert.alert(t('common.errorTitle'), t('common.error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t('caregiverApp.toolkit.weeklyStats.title')}</Text>
          <Text style={styles.subtitle}>{t('caregiverApp.toolkit.weeklyStats.subtitle')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.generateButton, (isGenerating || !stats) && styles.disabledButton]}
          onPress={generateDigest}
          disabled={isGenerating || !stats}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.textInverse} size="small" />
          ) : (
            <Text style={styles.generateButtonText}>
              {t('caregiverApp.toolkit.weeklyStats.generateDigest')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      {stats ? (
        <View style={styles.statsRow}>
          {stats.avgEnergy && (
            <View style={[styles.statCard, styles.energyCard]}>
              <Text style={[styles.statValue, styles.energyValue]}>{stats.avgEnergy}</Text>
              <Text style={[styles.statLabel, styles.energyLabel]}>
                {t('caregiverApp.toolkit.weeklyStats.avgEnergy')}
              </Text>
            </View>
          )}
          {stats.avgStress && (
            <View style={[styles.statCard, styles.stressCard]}>
              <Text style={[styles.statValue, styles.stressValue]}>{stats.avgStress}</Text>
              <Text style={[styles.statLabel, styles.stressLabel]}>
                {t('caregiverApp.toolkit.weeklyStats.avgStress')}
              </Text>
            </View>
          )}
          {stats.avgSleep && (
            <View style={[styles.statCard, styles.sleepCard]}>
              <Text style={[styles.statValue, styles.sleepValue]}>{stats.avgSleep}</Text>
              <Text style={[styles.statLabel, styles.sleepLabel]}>
                {t('caregiverApp.toolkit.weeklyStats.avgSleep')}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.noDataText}>
          {t('caregiverApp.toolkit.weeklyStats.noData')}
        </Text>
      )}

      {/* AI Insights */}
      {insights && insights.map((insight, i) => (
        <View key={i} style={styles.insightCard}>
          <Text style={styles.insightText}>{insight.text}</Text>
          <Text style={styles.insightSuggestion}>{insight.suggestion}</Text>
        </View>
      ))}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  generateButton: {
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    ...SHADOWS.sm,
  },
  generateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textInverse,
  },
  disabledButton: {
    opacity: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: 12,
    alignItems: 'center',
  },
  energyCard: {
    backgroundColor: '#dcfce7',
  },
  stressCard: {
    backgroundColor: colors.amberBg,
  },
  sleepCard: {
    backgroundColor: '#dbeafe',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
  },
  energyValue: {
    color: '#16a34a',
  },
  stressValue: {
    color: colors.amber,
  },
  sleepValue: {
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.body,
    marginTop: 2,
  },
  energyLabel: {
    color: '#15803d',
  },
  stressLabel: {
    color: colors.amber,
  },
  sleepLabel: {
    color: '#1d4ed8',
  },
  noDataText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  insightCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  insightText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  insightSuggestion: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    color: colors.brand600,
    marginTop: 8,
  },
}));
