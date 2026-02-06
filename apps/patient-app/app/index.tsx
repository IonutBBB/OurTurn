import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../src/stores/auth-store';
import { getHouseholdByCareCode } from '@memoguard/supabase';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../src/theme';

export default function CareCodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();

  // 6 separate digit refs for auto-focus
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to tabs
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/today');
    }
  }, [isAuthenticated, router]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue.length > 1) {
      // Handle paste - distribute digits across inputs
      const pastedDigits = numericValue.slice(0, 6).split('');
      const newDigits = [...digits];
      pastedDigits.forEach((digit, i) => {
        if (index + i < 6) {
          newDigits[index + i] = digit;
        }
      });
      setDigits(newDigits);

      // Focus the next empty input or the last one
      const nextEmptyIndex = newDigits.findIndex((d) => d === '');
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
    } else {
      // Single digit input
      const newDigits = [...digits];
      newDigits[index] = numericValue;
      setDigits(newDigits);

      // Auto-focus next input
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Clear error when user types
    if (error) setError(null);
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
    }
  };

  const handleConnect = async () => {
    const code = digits.join('');

    if (code.length !== 6) {
      setError(t('patientApp.careCode.invalidCode'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const household = await getHouseholdByCareCode(code);

      if (!household) {
        setError(t('patientApp.careCode.invalidCode'));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsLoading(false);
        return;
      }

      // Store session and navigate
      await login(household, code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/today');
    } catch (err) {
      console.error('Failed to validate care code:', err);
      setError(t('common.error'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const isCodeComplete = digits.every((d) => d !== '');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>MemoGuard</Text>
            <Text style={styles.logoHeart}>💙</Text>
          </View>

          {/* Welcome text */}
          <Text style={styles.welcome}>{t('patientApp.careCode.welcome')}</Text>
          <Text style={styles.instruction}>{t('patientApp.careCode.enterCode')}</Text>

          {/* Digit inputs */}
          <View style={styles.digitContainer}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.digitInput,
                  digit && styles.digitInputFilled,
                  error && styles.digitInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleDigitChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
                autoFocus={index === 0}
                accessibilityLabel={`Digit ${index + 1} of 6`}
              />
            ))}
          </View>

          {/* Helper text */}
          <Text style={styles.helperText}>{t('patientApp.careCode.helperText')}</Text>

          {/* Error message */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Connect button */}
          <TouchableOpacity
            style={[styles.button, (!isCodeComplete || isLoading) && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={!isCodeComplete || isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? t('patientApp.careCode.connecting') : t('patientApp.careCode.connect')}
          >
            {isLoading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color={COLORS.textInverse} size="small" />
                <Text style={styles.buttonText}>{t('patientApp.careCode.connecting')}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{t('patientApp.careCode.connect')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 36,
    fontFamily: FONTS.display,
    color: COLORS.brand600,
  },
  logoHeart: {
    fontSize: 32,
    marginLeft: 8,
  },
  welcome: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  digitContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  digitInput: {
    width: 56,
    height: 64,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    fontSize: 28,
    fontFamily: FONTS.bodySemiBold,
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  digitInputFilled: {
    borderColor: COLORS.brand600,
  },
  digitInputError: {
    borderColor: COLORS.amber,
  },
  helperText: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.amber,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
    height: 64,
    backgroundColor: COLORS.brand600,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textInverse,
  },
});
