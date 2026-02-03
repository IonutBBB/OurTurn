import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Design system colors
const COLORS = {
  background: '#FAFAF8',
  card: '#FFFFFF',
  border: '#E7E5E4',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  brand600: '#0D9488',
  danger: '#DC2626',
};

export default function HelpScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{t('patientApp.help.title')} 💙</Text>

        {/* Call Someone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('patientApp.help.callSomeone')}</Text>

          {/* Placeholder contact buttons */}
          <TouchableOpacity style={styles.contactButton} activeOpacity={0.7}>
            <Text style={styles.contactIcon}>📞</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Family Contact</Text>
              <Text style={styles.contactRelation}>Caregiver</Text>
            </View>
          </TouchableOpacity>

          {/* Emergency button */}
          <TouchableOpacity style={styles.emergencyButton} activeOpacity={0.7}>
            <Text style={styles.emergencyIcon}>🚨</Text>
            <Text style={styles.emergencyText}>{t('patientApp.help.emergency')} (112)</Text>
          </TouchableOpacity>
        </View>

        {/* Get Home Safely Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('patientApp.help.getHomeSafely')}</Text>

          <TouchableOpacity style={styles.takeMeHomeButton} activeOpacity={0.8}>
            <Text style={styles.takeMeHomeIcon}>🏠</Text>
            <Text style={styles.takeMeHomeText}>{t('patientApp.help.takeMeHome')}</Text>
            <Text style={styles.takeMeHomeSubtext}>{t('patientApp.help.takeMeHomeDesc')}</Text>
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
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 64,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  contactRelation: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    padding: 16,
    minHeight: 64,
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  emergencyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  takeMeHomeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand600,
    borderRadius: 12,
    padding: 20,
    minHeight: 80,
  },
  takeMeHomeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  takeMeHomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  takeMeHomeSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
});
