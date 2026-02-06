import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth-store';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/theme';

export default function MoreScreen() {
  const { t } = useTranslation();
  const { logout, caregiver } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const menuItems = [
    { icon: '👨‍👩‍👧', label: t('caregiverApp.nav.family'), onPress: () => router.push('/family') },
    { icon: '💙', label: t('caregiverApp.nav.wellbeing'), onPress: () => router.push('/wellbeing') },
    { icon: '📄', label: t('caregiverApp.nav.reports'), onPress: () => router.push('/reports') },
    { icon: '⚙️', label: t('caregiverApp.nav.settings'), onPress: () => router.push('/settings') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('caregiverApp.tabs.more')}</Text>

        {/* User info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {caregiver?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{caregiver?.name || 'Caregiver'}</Text>
            <Text style={styles.userEmail}>{caregiver?.email || ''}</Text>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 24,
  },
  userCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.brand400,
    ...SHADOWS.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.brand600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 24,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  logoutButton: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.danger,
  },
});
