import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LocalSupportOrganization } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../theme';

interface LocalSupportCardProps {
  org: LocalSupportOrganization;
}

export function LocalSupportCard({ org }: LocalSupportCardProps) {
  const { t } = useTranslation('resources');

  const handleCall = () => {
    if (org.phone) {
      Linking.openURL(`tel:${org.phone.replace(/\s/g, '')}`);
    }
  };

  const handleWebsite = () => {
    if (org.website_url) {
      Linking.openURL(org.website_url);
    }
  };

  const handleEmail = () => {
    if (org.email) {
      Linking.openURL(`mailto:${org.email}`);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{org.name}</Text>
        {org.is_24_7 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('localSupport.available247')}</Text>
          </View>
        )}
      </View>

      {org.description && (
        <Text style={styles.description}>{org.description}</Text>
      )}

      <View style={styles.actions}>
        {org.phone && (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <Text style={styles.callBtnText}>{t('localSupport.call')}</Text>
            <Text style={styles.phoneNumber}>{org.phone}</Text>
          </TouchableOpacity>
        )}

        {org.website_url && (
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={handleWebsite}
            activeOpacity={0.7}
          >
            <Text style={styles.outlineBtnText}>{t('localSupport.visitWebsite')}</Text>
          </TouchableOpacity>
        )}

        {org.email && (
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={handleEmail}
            activeOpacity={0.7}
          >
            <Text style={styles.outlineBtnText}>{t('localSupport.sendEmail')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING[4],
    gap: SPACING[3],
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.success,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actions: {
    gap: SPACING[2],
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.md,
    minHeight: 56,
    paddingHorizontal: SPACING[4],
    gap: SPACING[2],
  },
  callBtnText: {
    fontSize: 16,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  phoneNumber: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textInverse,
  },
  outlineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.brand500,
    borderRadius: RADIUS.md,
    minHeight: 48,
    paddingHorizontal: SPACING[4],
  },
  outlineBtnText: {
    fontSize: 15,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.brand600,
  },
});
