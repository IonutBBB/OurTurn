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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useTranslation } from 'react-i18next';
import { supabase } from '@memoguard/supabase';
import { useAuthStore } from '../../src/stores/auth-store';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { setSession } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('caregiverApp.auth.enterEmailAndPassword'));
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.session) {
        await setSession(data.session);
        router.replace('/');
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
            <Text style={styles.subtitle}>{t('caregiverApp.auth.welcomeBack')}</Text>
          </View>

          {/* Login form */}
          <View style={styles.form}>
            {error && (
              <View
                style={styles.errorContainer}
                accessible={true}
                accessibilityRole="alert"
                accessibilityLiveRegion="assertive"
              >
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text
                style={styles.label}
                nativeID="email-label"
              >
                {t('caregiverApp.auth.email')}
              </Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel={t('caregiverApp.auth.email')}
                accessibilityLabelledBy="email-label"
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={styles.label}
                nativeID="password-label"
              >
                {t('caregiverApp.auth.password')}
              </Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                autoCapitalize="none"
                accessibilityLabel={t('caregiverApp.auth.password')}
                accessibilityLabelledBy="password-label"
                textContentType="password"
                autoComplete="password"
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              accessibilityRole="link"
              accessibilityLabel={t('caregiverApp.auth.forgotPassword')}
              onPress={async () => {
                if (!email) {
                  setError(t('caregiverApp.auth.enterEmailFirst'));
                  return;
                }
                setLoading(true);
                setError(null);
                try {
                  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
                  if (resetError) {
                    setError(resetError.message);
                  } else {
                    setError(null);
                    Alert.alert(
                      t('caregiverApp.auth.resetEmailSent'),
                      t('caregiverApp.auth.resetEmailSentDesc')
                    );
                  }
                } catch {
                  setError(t('common.error'));
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Text style={styles.forgotPasswordText}>
                {t('caregiverApp.auth.forgotPassword')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('caregiverApp.auth.login')}
              accessibilityState={{
                disabled: loading,
                busy: loading,
              }}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textInverse} accessibilityLabel={t('caregiverApp.auth.signingIn')} />
              ) : (
                <Text style={styles.buttonText}>{t('caregiverApp.auth.login')}</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={styles.divider}
              accessible={true}
              accessibilityRole="none"
              accessibilityLabel={t('caregiverApp.auth.orContinueWith')}
            >
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('caregiverApp.auth.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth buttons */}
            <TouchableOpacity
              style={styles.oauthButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('caregiverApp.auth.continueWithGoogle')}
              onPress={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  const redirectUrl = makeRedirectUri({ scheme: 'memoguard-caregiver' });
                  const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: redirectUrl,
                      skipBrowserRedirect: true,
                    },
                  });
                  if (oauthError) { setError(oauthError.message); return; }
                  if (data?.url) {
                    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
                    if (result.type === 'success' && result.url) {
                      const params = new URL(result.url);
                      const accessToken = params.searchParams.get('access_token') || params.hash?.match(/access_token=([^&]*)/)?.[1];
                      const refreshToken = params.searchParams.get('refresh_token') || params.hash?.match(/refresh_token=([^&]*)/)?.[1];
                      if (accessToken && refreshToken) {
                        const { data: sessionData } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
                        if (sessionData.session) {
                          await setSession(sessionData.session);
                          router.replace('/');
                        }
                      }
                    }
                  }
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
              accessibilityRole="button"
              accessibilityLabel={t('caregiverApp.auth.continueWithApple')}
              onPress={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  const redirectUrl = makeRedirectUri({ scheme: 'memoguard-caregiver' });
                  const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                    provider: 'apple',
                    options: {
                      redirectTo: redirectUrl,
                      skipBrowserRedirect: true,
                    },
                  });
                  if (oauthError) { setError(oauthError.message); return; }
                  if (data?.url) {
                    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
                    if (result.type === 'success' && result.url) {
                      const params = new URL(result.url);
                      const accessToken = params.searchParams.get('access_token') || params.hash?.match(/access_token=([^&]*)/)?.[1];
                      const refreshToken = params.searchParams.get('refresh_token') || params.hash?.match(/refresh_token=([^&]*)/)?.[1];
                      if (accessToken && refreshToken) {
                        const { data: sessionData } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
                        if (sessionData.session) {
                          await setSession(sessionData.session);
                          router.replace('/');
                        }
                      }
                    }
                  }
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

          {/* Sign up link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('caregiverApp.auth.noAccount')} </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>{t('caregiverApp.auth.signup')}</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.brand600,
  },
  button: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
