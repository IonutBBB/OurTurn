import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';

interface CrisisEntry {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
}

interface CrisisHistoryProps {
  entries: CrisisEntry[];
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function CrisisHistory({ entries }: CrisisHistoryProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {t('caregiverApp.crisis.history.title')}
        </Text>
        <TouchableOpacity onPress={() => router.push('/family?tab=journal')}>
          <Text style={styles.viewAllLink}>
            {t('caregiverApp.crisis.history.viewAllInJournal')}
          </Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <Text style={styles.emptyText}>
          {t('caregiverApp.crisis.history.noEvents')}
        </Text>
      ) : (
        entries.slice(0, 10).map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.authorName}>{entry.author_name}</Text>
              <Text style={styles.entryDate}>
                {formatDate(entry.created_at)}
              </Text>
            </View>
            <Text style={styles.entryContent} numberOfLines={3}>
              {entry.content}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand600,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  entryCard: {
    backgroundColor: COLORS.brand50,
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textMuted,
  },
  entryDate: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  entryContent: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
