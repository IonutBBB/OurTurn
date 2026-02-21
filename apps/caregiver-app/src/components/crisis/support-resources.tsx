import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, FONTS, RADIUS, SHADOWS } from '../../theme';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SupportResourcesProps {
  familyCaregivers: FamilyMember[];
}

export function SupportResources({
  familyCaregivers,
}: SupportResourcesProps) {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <View style={styles.wrapper}>
      {/* Family Contacts */}
      {familyCaregivers.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {t('caregiverApp.crisis.familyContacts')}
          </Text>
          {familyCaregivers.map((member) => (
            <View key={member.id} style={styles.resourceItem}>
              <View style={styles.resourceInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.resourceName}>{member.name}</Text>
                  <View
                    style={[
                      styles.roleBadge,
                      member.role === 'primary' && styles.primaryBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleText,
                        member.role === 'primary' && styles.primaryRoleText,
                      ]}
                    >
                      {member.role === 'primary'
                        ? t('common.primary')
                        : t('caregiverApp.family.familyMember')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.emailText} numberOfLines={1}>
                  {member.email}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.websiteButton}
                onPress={() => Linking.openURL(`mailto:${member.email}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.websiteButtonText}>
                  {t('caregiverApp.crisis.email')}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  wrapper: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: colors.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  primaryBadge: {
    backgroundColor: colors.brand100,
  },
  roleText: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },
  primaryRoleText: {
    color: colors.brand700,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resourceInfo: {
    flex: 1,
    marginRight: 12,
  },
  resourceName: {
    fontSize: 15,
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
  },
  emailText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  websiteButton: {
    backgroundColor: colors.brand100,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  websiteButtonText: {
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand700,
  },
}));
