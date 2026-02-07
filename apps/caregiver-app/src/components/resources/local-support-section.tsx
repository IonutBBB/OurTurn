import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LocalSupportOrganization } from '@ourturn/shared';
import { LocalSupportCard } from './local-support-card';
import { COLORS, FONTS, SPACING } from '../../theme';

const CATEGORY_ORDER = ['helpline', 'organization', 'government', 'respite', 'financial'];

interface LocalSupportSectionProps {
  supportByCategory: Record<string, LocalSupportOrganization[]>;
  isEmpty: boolean;
}

export function LocalSupportSection({ supportByCategory, isEmpty }: LocalSupportSectionProps) {
  const { t } = useTranslation('resources');

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{t('localSupport.sectionTitle')}</Text>
      <Text style={styles.sectionSubLabel}>{t('localSupport.sectionSubtitle')}</Text>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('localSupport.emptyState')}</Text>
        </View>
      ) : (
        <>
          {CATEGORY_ORDER.map((category) => {
            const orgs = supportByCategory[category];
            if (!orgs || orgs.length === 0) return null;

            return (
              <View key={category} style={styles.categoryGroup}>
                <Text style={styles.categoryTitle}>
                  {t(`localSupport.categories.${category}`)}
                </Text>
                {orgs.map((org) => (
                  <LocalSupportCard key={org.id} org={org} />
                ))}
              </View>
            );
          })}

          <Text style={styles.disclaimer}>{t('localSupport.disclaimer')}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[3],
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.displayMedium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
  },
  sectionSubLabel: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: SPACING[1],
  },
  categoryGroup: {
    gap: SPACING[3],
  },
  categoryTitle: {
    fontSize: 15,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING[8],
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
