import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

export default function ReportsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('caregiverApp.reports.title')}</Text>
        </View>

        {/* Info card */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📄</Text>
          <Text style={styles.cardTitle}>{t('caregiverApp.reports.title')}</Text>
          <Text style={styles.cardDescription}>
            {t('caregiverApp.reports.disclaimer')}
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>{t('caregiverApp.reports.moodTrends')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>{t('caregiverApp.reports.sleepPatterns')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>{t('caregiverApp.reports.activityCompletion')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>{t('caregiverApp.reports.medicationAdherence')}</Text>
            </View>
          </View>

          <Text style={styles.webNote}>
            {t('caregiverApp.reports.webNote')}
          </Text>

          <TouchableOpacity
            style={styles.webButton}
            activeOpacity={0.7}
            onPress={() => {
              // Deep link to web app reports page
              Linking.openURL('https://app.memoguard.com/reports');
            }}
          >
            <Text style={styles.webButtonText}>{t('caregiverApp.reports.openInWebApp')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: COLORS.brand600,
    fontFamily: FONTS.bodyMedium,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: COLORS.brand600,
    marginRight: 8,
    lineHeight: 20,
  },
  featureText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  webNote: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  webButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 24,
    ...SHADOWS.sm,
  },
  webButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
});
