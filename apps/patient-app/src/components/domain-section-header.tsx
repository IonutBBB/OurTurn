import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS } from '../theme';

interface DomainSectionHeaderProps {
  emoji: string;
  titleKey: string;
  completedCount: number;
  totalCount: number;
}

function DomainSectionHeader({ emoji, titleKey, completedCount, totalCount }: DomainSectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>{t(titleKey)}</Text>
      </View>
      <Text style={styles.count}>
        {completedCount}/{totalCount}
      </Text>
    </View>
  );
}

export default memo(DomainSectionHeader);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 24, marginRight: 8 },
  title: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  count: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
});
