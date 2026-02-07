import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getDementiaHelplines } from '@ourturn/shared/constants/helplines';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SupportResourcesProps {
  country: string;
  familyCaregivers: FamilyMember[];
}

export function SupportResources({
  country,
  familyCaregivers,
}: SupportResourcesProps) {
  const { t } = useTranslation();
  const helplines = getDementiaHelplines(country);

  return (
    <View style={styles.wrapper}>
      {/* Helplines */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t('caregiverApp.crisis.helplines')}
        </Text>
        {helplines.length === 0 ? (
          <Text style={styles.emptyText}>
            {t('caregiverApp.crisis.noHelplineAvailable')}
          </Text>
        ) : (
          helplines.map((helpline, index) => (
            <View key={index} style={styles.resourceItem}>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceName} numberOfLines={1}>
                  {helpline.name}
                </Text>
                {helpline.phone ? (
                  <Text style={styles.resourcePhone}>{helpline.phone}</Text>
                ) : null}
              </View>
              <View style={styles.resourceActions}>
                {helpline.phone ? (
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() =>
                      Linking.openURL(
                        `tel:${helpline.phone.replace(/\s/g, '')}`
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.callButtonText}>
                      {t('caregiverApp.crisis.call')}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {helpline.website ? (
                  <TouchableOpacity
                    style={styles.websiteButton}
                    onPress={() => Linking.openURL(helpline.website!)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.websiteButtonText}>
                      {t('caregiverApp.crisis.website')}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))
        )}
      </View>

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

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.brand50,
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 8,
  },
  resourceInfo: {
    flex: 1,
    marginRight: 8,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },
  resourcePhone: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.brand600,
    marginTop: 2,
  },
  resourceActions: {
    flexDirection: 'row',
    gap: 6,
  },
  callButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  callButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  websiteButton: {
    backgroundColor: COLORS.brand100,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.brand200,
  },
  websiteButtonText: {
    color: COLORS.brand700,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  primaryBadge: {
    backgroundColor: COLORS.brand100,
  },
  roleText: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  primaryRoleText: {
    color: COLORS.brand700,
  },
  emailText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
