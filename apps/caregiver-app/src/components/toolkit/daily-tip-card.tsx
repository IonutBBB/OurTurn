import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AiDailyTip, TipCategory } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';

interface DailyTipCardProps {
  initialTip: AiDailyTip | null;
  apiBaseUrl: string;
}

const CATEGORY_ICONS: Record<TipCategory, string> = {
  respite: '☕',
  delegation: '🤝',
  exercise: '🏃',
  insight: '💡',
  self_care: '💜',
};

export function DailyTipCard({ initialTip, apiBaseUrl }: DailyTipCardProps) {
  const { t } = useTranslation();
  const [tip, setTip] = useState<AiDailyTip | null>(initialTip);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/ai/daily-tip`, { method: 'POST' });
      if (res.status === 429) {
        Alert.alert('', t('caregiverApp.toolkit.tip.limitReached'));
        return;
      }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTip(data.tip);
    } catch {
      Alert.alert('', t('common.error'));
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!tip || tip.dismissed) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t('caregiverApp.toolkit.tip.title')}</Text>
        <TouchableOpacity onPress={refresh} disabled={isRefreshing}>
          <Text style={styles.refreshText}>
            {isRefreshing ? t('common.loading') : t('caregiverApp.toolkit.tip.refresh')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const icon = CATEGORY_ICONS[tip.tip_category as TipCategory] || '💡';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{t('caregiverApp.toolkit.tip.title')}</Text>
          <Text style={styles.tipText}>{tip.tip_text}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={refresh} disabled={isRefreshing}>
              <Text style={styles.refreshText}>
                {isRefreshing ? t('common.loading') : t('caregiverApp.toolkit.tip.refresh')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTip((prev) => prev ? { ...prev, dismissed: true } : null)}>
              <Text style={styles.dismissText}>{t('caregiverApp.toolkit.tip.dismiss')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.brand50,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.brand200,
    ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.brand800,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.brand700,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  refreshText: {
    fontSize: 12,
    color: COLORS.brand600,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  dismissText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
});
