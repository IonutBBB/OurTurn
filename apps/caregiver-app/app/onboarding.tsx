import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@ourturn/supabase';
import { useAuthStore } from '../src/stores/auth-store';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS } from '../src/theme';

const TOTAL_STEPS = 6;

const RELATIONSHIP_OPTIONS = [
  'mother', 'father', 'spouse', 'grandmother', 'grandfather',
  'sibling', 'friend', 'other',
];

const CONTACT_RELATIONSHIP_OPTIONS = [
  'spouse', 'partner', 'son', 'daughter', 'mother', 'father',
  'sibling', 'grandmother', 'grandfather', 'friend', 'neighbour', 'carer', 'other',
];

const COUNTRY_OPTIONS = [
  'US', 'UK', 'Canada', 'Australia', 'Germany', 'France',
  'Spain', 'Italy', 'Netherlands', 'India', 'Brazil',
  'Japan', 'South Korea', 'New Zealand', 'Ireland',
];

const DEMENTIA_TYPE_OPTIONS = [
  'alzheimers', 'vascular', 'lewy_body', 'frontotemporal',
  'mixed', 'other', 'not_sure',
];

interface OnboardingData {
  caregiverName: string;
  relationship: string;
  country: string;
  patientName: string;
  dateOfBirth: string;
  dementiaType: string;
  homeAddress: string;
  childhoodLocation: string;
  career: string;
  hobbies: string;
  favoriteMusic: string;
  favoriteFoods: string;
  importantPeople: string;
  keyEvents: string;
  wakeTime: string;
  sleepTime: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  typicalDay: string;
  emergencyContacts: Array<{ name: string; phone: string; relationship: string }>;
  careCode: string;
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { user, loadCaregiverData } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const styles = useStyles();
  const colors = useColors();

  const [data, setData] = useState<OnboardingData>({
    caregiverName: '',
    relationship: '',
    country: '',
    patientName: '',
    dateOfBirth: '',
    dementiaType: '',
    homeAddress: '',
    childhoodLocation: '',
    career: '',
    hobbies: '',
    favoriteMusic: '',
    favoriteFoods: '',
    importantPeople: '',
    keyEvents: '',
    wakeTime: '07:00',
    sleepTime: '22:00',
    breakfastTime: '08:00',
    lunchTime: '12:00',
    dinnerTime: '18:00',
    typicalDay: '',
    emergencyContacts: [],
    careCode: '',
  });

  // Emergency contact form state
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    setError(null);

    // Validate required fields per step
    if (currentStep === 1 && !data.caregiverName) {
      setError(t('caregiverApp.onboarding.fillRequired'));
      return;
    }
    if (currentStep === 2 && !data.patientName) {
      setError(t('caregiverApp.onboarding.fillRequired'));
      return;
    }

    // Step 5: Create household and patient in database
    if (currentStep === 5) {
      setLoading(true);
      try {
        const careCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Create household
        const { data: household, error: householdError } = await supabase
          .from('households')
          .insert({
            care_code: careCode,
            country: data.country || null,
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
            name: data.patientName,
            date_of_birth: data.dateOfBirth || null,
            dementia_type: data.dementiaType || null,
            home_address_formatted: data.homeAddress || null,
            wake_time: data.wakeTime,
            sleep_time: data.sleepTime,
            biography: {
              childhood_location: data.childhoodLocation,
              career: data.career,
              hobbies: data.hobbies,
              favorite_music: data.favoriteMusic,
              favorite_foods: data.favoriteFoods,
              important_people: data.importantPeople,
              key_events: data.keyEvents,
            },
            emergency_number: data.emergencyContacts[0]?.phone || null,
            emergency_contacts: data.emergencyContacts,
          });

        if (patientError) throw patientError;

        // Create caregiver
        const { error: caregiverError } = await supabase
          .from('caregivers')
          .upsert({
            id: user?.id,
            household_id: household.id,
            name: data.caregiverName,
            email: user?.email,
            relationship: data.relationship || 'other',
            role: 'primary',
          });

        if (caregiverError) throw caregiverError;

        // Create default tasks based on routine
        const defaultTasks = [
          { time: data.wakeTime, category: 'health', title: t('caregiverApp.onboarding.defaultTasks.morningMedication') },
          { time: data.breakfastTime, category: 'nutrition', title: t('caregiverApp.onboarding.defaultTasks.breakfast') },
          { time: data.lunchTime, category: 'nutrition', title: t('caregiverApp.onboarding.defaultTasks.lunch') },
          { time: data.dinnerTime, category: 'nutrition', title: t('caregiverApp.onboarding.defaultTasks.dinner') },
          { time: data.sleepTime, category: 'medication', title: t('caregiverApp.onboarding.defaultTasks.eveningMedication') },
        ];

        for (const task of defaultTasks) {
          await supabase.from('care_plan_tasks').insert({
            household_id: household.id,
            category: task.category,
            title: task.title,
            time: task.time,
            recurrence: 'daily',
            active: true,
            created_by: user?.id,
          });
        }

        updateData({ careCode });
        await loadCaregiverData();
        setCurrentStep(6);
      } catch (err) {
        if (__DEV__) console.error('Onboarding error:', err);
        setError(t('caregiverApp.onboarding.setupFailed'));
      } finally {
        setLoading(false);
      }
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinish = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/dashboard');
  };

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      updateData({
        emergencyContacts: [...data.emergencyContacts, { ...newContact }],
      });
      setNewContact({ name: '', phone: '', relationship: '' });
    }
  };

  const removeContact = (index: number) => {
    updateData({
      emergencyContacts: data.emergencyContacts.filter((_, i) => i !== index),
    });
  };

  const copyCode = async () => {
    if (data.careCode) {
      await Clipboard.setStringAsync(data.careCode);
      setCopied(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedCode = data.careCode
    ? `${data.careCode.slice(0, 3)} ${data.careCode.slice(3)}`
    : '--- ---';

  const stepTitles = [
    t('caregiverApp.onboarding.step1Title'),
    t('caregiverApp.onboarding.step2Title'),
    t('caregiverApp.onboarding.step3Title'),
    t('caregiverApp.onboarding.step4Title'),
    t('caregiverApp.onboarding.step5Title'),
    t('caregiverApp.onboarding.step6Title'),
  ];

  const renderDropdown = (
    value: string,
    options: string[],
    onSelect: (v: string) => void,
    placeholder: string,
    labelFn?: (v: string) => string,
  ) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.chip, value === option && styles.chipSelected]}
          onPress={() => onSelect(option)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, value === option && styles.chipTextSelected]}>
            {labelFn ? labelFn(option) : option}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTimeInput = (label: string, value: string, field: keyof OnboardingData) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(v) => updateData({ [field]: v })}
        placeholder={t('common.placeholders.timeFormat')}
        placeholderTextColor={colors.textMuted}
        keyboardType="numbers-and-punctuation"
      />
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      // Step 1: About You
      case 1:
        return (
          <View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('caregiverApp.onboarding.yourNameRequired')}</Text>
              <TextInput
                style={styles.input}
                value={data.caregiverName}
                onChangeText={(v) => updateData({ caregiverName: v })}
                placeholder={t('caregiverApp.onboarding.yourName')}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('caregiverApp.onboarding.relationship')}</Text>
              {renderDropdown(data.relationship, RELATIONSHIP_OPTIONS, (v) => updateData({ relationship: v }), 'Select')}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('caregiverApp.onboarding.country')}</Text>
              {renderDropdown(data.country, COUNTRY_OPTIONS, (v) => updateData({ country: v }), 'Select')}
            </View>
          </View>
        );

      // Step 2: About Loved One
      case 2:
        return (
          <View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('caregiverApp.onboarding.lovedOneNameRequired')}</Text>
              <TextInput
                style={styles.input}
                value={data.patientName}
                onChangeText={(v) => updateData({ patientName: v })}
                placeholder={t('caregiverApp.onboarding.theirName')}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('caregiverApp.onboarding.dateOfBirth')}</Text>
              <TextInput
                style={styles.input}
                value={data.dateOfBirth}
                onChangeText={(v) => updateData({ dateOfBirth: v })}
                placeholder={t('common.placeholders.dateFormat')}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('caregiverApp.onboarding.dementiaType')}</Text>
              {renderDropdown(data.dementiaType, DEMENTIA_TYPE_OPTIONS, (v) => updateData({ dementiaType: v }), 'Select',
                (v) => v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('caregiverApp.onboarding.homeAddress')}</Text>
              <TextInput
                style={styles.input}
                value={data.homeAddress}
                onChangeText={(v) => updateData({ homeAddress: v })}
                placeholder={t('caregiverApp.onboarding.homeAddressPlaceholder')}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        );

      // Step 3: Life Story
      case 3:
        return (
          <View>
            {[
              { key: 'childhoodLocation', label: t('caregiverApp.onboarding.childhoodLocation') },
              { key: 'career', label: t('caregiverApp.onboarding.career') },
              { key: 'hobbies', label: t('caregiverApp.onboarding.hobbies') },
              { key: 'favoriteMusic', label: t('caregiverApp.onboarding.favoriteMusic') },
              { key: 'favoriteFoods', label: t('caregiverApp.onboarding.favoriteFoods') },
              { key: 'importantPeople', label: t('caregiverApp.onboarding.importantPeople') },
              { key: 'keyEvents', label: t('caregiverApp.onboarding.keyEvents') },
            ].map(({ key, label }) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={data[key as keyof OnboardingData] as string}
                  onChangeText={(v) => updateData({ [key]: v })}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={2}
                />
              </View>
            ))}
          </View>
        );

      // Step 4: Daily Routine
      case 4:
        return (
          <View>
            {renderTimeInput(t('caregiverApp.onboarding.wakeTime'), data.wakeTime, 'wakeTime')}
            {renderTimeInput(t('caregiverApp.onboarding.sleepTime'), data.sleepTime, 'sleepTime')}
            {renderTimeInput(t('caregiverApp.onboarding.breakfastTime'), data.breakfastTime, 'breakfastTime')}
            {renderTimeInput(t('caregiverApp.onboarding.lunchTime'), data.lunchTime, 'lunchTime')}
            {renderTimeInput(t('caregiverApp.onboarding.dinnerTime'), data.dinnerTime, 'dinnerTime')}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('caregiverApp.onboarding.typicalDay')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={data.typicalDay}
                onChangeText={(v) => updateData({ typicalDay: v })}
                placeholder={t('caregiverApp.onboarding.typicalDayPlaceholder')}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        );

      // Step 5: Safety (Emergency Contacts)
      case 5:
        return (
          <View>
            <Text style={styles.hintText}>
              {t('caregiverApp.onboarding.emergencyContactsHint')}
            </Text>

            {data.emergencyContacts.map((contact, index) => (
              <View key={index} style={styles.contactCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>
                    {contact.phone} {contact.relationship ? `• ${t(`relationships.${contact.relationship}`, { defaultValue: contact.relationship })}` : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeContact(index)}>
                  <Text style={styles.removeText}>{t('caregiverApp.onboarding.remove')}</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addContactCard}>
              <Text style={[styles.label, { marginBottom: 12 }]}>{t('caregiverApp.onboarding.addContact')}</Text>
              <TextInput
                style={styles.input}
                value={newContact.name}
                onChangeText={(v) => setNewContact({ ...newContact, name: v })}
                placeholder={t('caregiverApp.onboarding.contactNameRequired')}
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                value={newContact.phone}
                onChangeText={(v) => setNewContact({ ...newContact, phone: v })}
                placeholder={t('caregiverApp.onboarding.phoneRequired')}
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
              <Text style={[styles.label, { marginTop: 10, marginBottom: 4 }]}>{t('caregiverApp.onboarding.relationshipOptional')}</Text>
              {renderDropdown(
                newContact.relationship,
                CONTACT_RELATIONSHIP_OPTIONS,
                (v) => setNewContact({ ...newContact, relationship: v }),
                '',
                (v) => t(`relationships.${v}`, { defaultValue: v }),
              )}
              <TouchableOpacity
                style={[styles.addButton, (!newContact.name || !newContact.phone) && styles.addButtonDisabled]}
                onPress={addContact}
                disabled={!newContact.name || !newContact.phone}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>{t('caregiverApp.onboarding.addContactButton')}</Text>
              </TouchableOpacity>
            </View>

            {data.emergencyContacts.length === 0 && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  {t('caregiverApp.onboarding.emergencyContactWarning')}
                </Text>
              </View>
            )}
          </View>
        );

      // Step 6: Care Code
      case 6:
        return (
          <View style={{ alignItems: 'center' }}>
            <View style={styles.celebrationIcon}>
              <Text style={{ fontSize: 40 }}>🎉</Text>
            </View>

            <Text style={styles.allSetTitle}>{t('caregiverApp.onboarding.allSet')}</Text>
            <Text style={styles.allSetSubtitle}>
              {t('caregiverApp.onboarding.careCodeInstructions')}
            </Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>{t('caregiverApp.onboarding.careCodeLabel')}</Text>
              <Text style={styles.codeValue}>{formattedCode}</Text>
            </View>

            <TouchableOpacity style={styles.copyButton} onPress={copyCode} activeOpacity={0.7}>
              <Text style={styles.copyButtonText}>
                {copied ? `✓ ${t('caregiverApp.onboarding.copied')}` : `📋 ${t('caregiverApp.onboarding.copyCode')}`}
              </Text>
            </TouchableOpacity>

            <View style={styles.nextStepsCard}>
              <Text style={styles.nextStepsTitle}>{t('caregiverApp.onboarding.nextSteps')}</Text>
              <Text style={styles.nextStepsItem}>
                {t('caregiverApp.onboarding.nextStep1', { name: data.patientName })}
              </Text>
              <Text style={styles.nextStepsItem}>
                {t('caregiverApp.onboarding.nextStep2')}
              </Text>
              <Text style={styles.nextStepsItem}>
                {t('caregiverApp.onboarding.nextStep3', { name: data.patientName })}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
          <Text style={styles.stepCounter}>
            {t('caregiverApp.onboarding.stepOf', { current: currentStep, total: TOTAL_STEPS })}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(currentStep / TOTAL_STEPS) * 100}%` },
            ]}
          />
        </View>

        {/* Step title */}
        <Text style={styles.stepTitle}>{stepTitles[currentStep - 1]}</Text>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Step content */}
        <View style={styles.form}>
          {renderStep()}
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          {currentStep > 1 && currentStep < 6 ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
              <Text style={styles.backButtonText}>{t('caregiverApp.onboarding.back')}</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {currentStep < 6 ? (
            <TouchableOpacity
              style={[styles.nextButton, loading && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.nextButtonText}>{t('caregiverApp.onboarding.next')}</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={handleFinish} activeOpacity={0.8}>
              <Text style={styles.nextButtonText}>{t('caregiverApp.onboarding.finish')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...SHADOWS.md,
  },
  logoLetter: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textInverse,
  },
  stepCounter: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand600,
    borderRadius: 3,
  },
  stepTitle: {
    fontSize: 22,
    fontFamily: FONTS.display,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...SHADOWS.sm,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.brand200,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    backgroundColor: colors.card,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  chipSelected: {
    borderColor: colors.brand600,
    backgroundColor: colors.brand50,
  },
  chipText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.brand700,
    fontFamily: FONTS.bodySemiBold,
  },
  hintText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.background,
    borderRadius: RADIUS.lg,
    marginBottom: 8,
  },
  contactName: {
    fontSize: 15,
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
  },
  contactPhone: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.danger,
  },
  addContactCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginTop: 8,
  },
  addButton: {
    backgroundColor: colors.brand50,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.brand200,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand700,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: RADIUS.lg,
    marginTop: 12,
  },
  warningText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#92400E',
  },
  celebrationIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  allSetTitle: {
    fontSize: 22,
    fontFamily: FONTS.display,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  allSetSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  codeBox: {
    backgroundColor: colors.brand50,
    borderWidth: 2,
    borderColor: colors.brand200,
    borderRadius: RADIUS['2xl'],
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand700,
    letterSpacing: 2,
    marginBottom: 8,
  },
  codeValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.brand700,
    letterSpacing: 6,
  },
  copyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.brand200,
    marginBottom: 24,
  },
  copyButtonText: {
    fontSize: 15,
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand700,
  },
  nextStepsCard: {
    backgroundColor: colors.background,
    borderRadius: RADIUS.lg,
    padding: 16,
    width: '100%',
  },
  nextStepsTitle: {
    fontSize: 15,
    fontFamily: FONTS.display,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  nextStepsItem: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bodySemiBold,
    color: colors.textSecondary,
  },
  nextButton: {
    backgroundColor: colors.brand600,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bodySemiBold,
    color: colors.textInverse,
  },
}));
