import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@memoguard/supabase';
import { useAuthStore } from '../../src/stores/auth-store';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

export default function SignupScreen() {
  const { t } = useTranslation();
  const { setSession } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError(t('caregiverApp.auth.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('caregiverApp.auth.passwordsNoMatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('caregiverApp.auth.passwordTooShort'));
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.session) {
        await setSession(data.session);
        router.replace('/onboarding');
      } else {
        // Email confirmation required
        setError(t('caregiverApp.auth.checkEmail'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and title */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>M</Text>
            </View>
            <Text style={styles.subtitle}>{t('caregiverApp.auth.getStarted')}</Text>
          </View>

          {/* Signup form */}
          <View style={styles.form}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('caregiverApp.auth.email')}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('caregiverApp.auth.password')}</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('caregiverApp.auth.confirmPassword')}</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textInverse} />
              ) : (
                <Text style={styles.buttonText}>{t('caregiverApp.auth.createAccount')}</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('caregiverApp.auth.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth buttons */}
            <TouchableOpacity
              style={styles.oauthButton}
              activeOpacity={0.8}
              onPress={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  const { error: oauthError } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      skipBrowserRedirect: true,
                    },
                  });
                  if (oauthError) setError(oauthError.message);
                } catch (err) {
                  setError(t('common.error'));
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Text style={styles.oauthButtonText}>
                {t('caregiverApp.auth.continueWithGoogle')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.oauthButton}
              activeOpacity={0.8}
              onPress={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  const { error: oauthError } = await supabase.auth.signInWithOAuth({
                    provider: 'apple',
                    options: {
                      skipBrowserRedirect: true,
                    },
                  });
                  if (oauthError) setError(oauthError.message);
                } catch (err) {
                  setError(t('common.error'));
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Text style={styles.oauthButtonText}>
                {t('caregiverApp.auth.continueWithApple')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('caregiverApp.auth.hasAccount')} </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>{t('caregiverApp.auth.login')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
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
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.md,
  },
  logoLetter: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textInverse,
  },
  subtitle: {
    fontSize: 22,
    fontFamily: FONTS.display,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  form: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  errorContainer: {
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.brand200,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.card,
  },
  button: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...SHADOWS.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  oauthButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.card,
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand600,
  },
});
