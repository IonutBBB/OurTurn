import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@memoguard/supabase';
import { useAuthStore } from '../src/stores/auth-store';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../src/theme';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { user, loadCaregiverData } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [caregiverName, setCaregiverName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleComplete = async () => {
    if (!caregiverName || !patientName) {
      setError(t('caregiverApp.onboarding.fillRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate care code
      const careCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Create household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          care_code: careCode,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
        .select()
        .single();

      if (householdError) throw householdError;

      // Create patient
      const { error: patientError } = await supabase
        .from('patients')
        .insert({
          household_id: household.id,
          name: patientName,
        });

      if (patientError) throw patientError;

      // Create/update caregiver
      const { error: caregiverError } = await supabase
        .from('caregivers')
        .upsert({
          id: user?.id,
          household_id: household.id,
          name: caregiverName,
          email: user?.email,
          relationship_to_patient: relationship || 'other',
          role: 'primary',
        });

      if (caregiverError) throw caregiverError;

      // Reload caregiver data
      await loadCaregiverData();

      // Navigate to dashboard
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : t('caregiverApp.onboarding.setupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>M</Text>
          </View>
          <Text style={styles.stepText}>{t('caregiverApp.onboarding.quickSetup')}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('caregiverApp.onboarding.yourNameRequired')}</Text>
            <TextInput
              style={styles.input}
              value={caregiverName}
              onChangeText={setCaregiverName}
              placeholder={t('caregiverApp.onboarding.yourName')}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('caregiverApp.onboarding.lovedOneNameRequired')}</Text>
            <TextInput
              style={styles.input}
              value={patientName}
              onChangeText={setPatientName}
              placeholder={t('caregiverApp.onboarding.theirName')}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('caregiverApp.onboarding.relationship')}</Text>
            <TextInput
              style={styles.input}
              value={relationship}
              onChangeText={setRelationship}
              placeholder={t('caregiverApp.onboarding.relationshipPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <Text style={styles.buttonText}>{t('caregiverApp.onboarding.finish')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          {t('caregiverApp.onboarding.settingsHint')}
        </Text>
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
  stepText: {
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
    marginBottom: 20,
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
  hint: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
});
