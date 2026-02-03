import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';

// Design system colors
const COLORS = {
  background: '#FAFAF8',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  brand600: '#0D9488',
};

export default function TodayScreen() {
  const { t } = useTranslation();
  const { patient } = useAuthStore();

  // Get time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = patient?.name || '';

    if (hour >= 6 && hour < 12) {
      return { text: t('patientApp.checkin.greeting.morning', { name }), emoji: '☀️' };
    } else if (hour >= 12 && hour < 18) {
      return { text: t('patientApp.checkin.greeting.afternoon', { name }), emoji: '🌤️' };
    } else {
      return { text: t('patientApp.checkin.greeting.evening', { name }), emoji: '🌙' };
    }
  };

  const greeting = getGreeting();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            {greeting.text} {greeting.emoji}
          </Text>
        </View>

        {/* Placeholder content */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>📋</Text>
          <Text style={styles.placeholderText}>{t('patientApp.todaysPlan.title')}</Text>
          <Text style={styles.placeholderSubtext}>{t('patientApp.todaysPlan.noPlan')}</Text>
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
  greetingContainer: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  placeholderSubtext: {
    fontSize: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 28,
  },
});
