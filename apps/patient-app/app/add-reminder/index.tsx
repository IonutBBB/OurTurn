import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/stores/auth-store';
import { createTask } from '@ourturn/supabase';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';
import type { TaskCategory, TaskRecurrence, DayOfWeek } from '@ourturn/shared';

type Step = 'what' | 'type' | 'time' | 'customTime' | 'often' | 'days' | 'date' | 'confirm' | 'done';

const PATIENT_CATEGORIES: { key: TaskCategory; icon: string; labelKey: string }[] = [
  { key: 'nutrition', icon: '🥗', labelKey: 'categories.nutrition' },
  { key: 'physical', icon: '🚶', labelKey: 'categories.physical' },
  { key: 'cognitive', icon: '🧩', labelKey: 'categories.cognitive' },
  { key: 'social', icon: '💬', labelKey: 'categories.social' },
  { key: 'health', icon: '❤️', labelKey: 'categories.health' },
];

const TIME_PRESETS = [
  { key: 'earlyMorning', time: '07:00', icon: '🌅' },
  { key: 'morning', time: '09:00', icon: '☀️' },
  { key: 'lateMorning', time: '11:00', icon: '🌤️' },
  { key: 'afternoon', time: '13:00', icon: '🌞' },
  { key: 'lateAfternoon', time: '15:00', icon: '🌇' },
  { key: 'evening', time: '18:00', icon: '🌆' },
  { key: 'night', time: '20:00', icon: '🌙' },
];

const CUSTOM_HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 to 22:00
const CUSTOM_MINUTES = [0, 15, 30, 45];

const DAY_KEYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** Build an array of selectable dates: today + next 6 days */
function buildDateOptions() {
  const options: { date: Date; labelKey: string; dateStr: string }[] = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);

    let labelKey: string;
    if (i === 0) labelKey = 'patientApp.addReminder.today';
    else if (i === 1) labelKey = 'patientApp.addReminder.tomorrow';
    else labelKey = '';

    options.push({
      date: d,
      labelKey,
      dateStr: d.toISOString().split('T')[0],
    });
  }
  return options;
}

export default function AddReminderScreen() {
  const { t } = useTranslation();
  const { session } = useAuthStore();

  const [step, setStep] = useState<Step>('what');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('health');
  const [time, setTime] = useState('09:00');
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('daily');
  const [recurrenceDays, setRecurrenceDays] = useState<DayOfWeek[]>([]);
  const [oneTimeDate, setOneTimeDate] = useState(new Date());
  const [saving, setSaving] = useState(false);

  const householdId = session?.householdId;

  const goBack = () => {
    const stepOrder: Step[] = ['what', 'type', 'time', 'often'];
    const currentIndex = stepOrder.indexOf(step);

    if (step === 'customTime') {
      setStep('time');
    } else if (step === 'days' || step === 'date') {
      setStep('often');
    } else if (step === 'confirm') {
      if (recurrence === 'specific_days') setStep('days');
      else if (recurrence === 'one_time') setStep('date');
      else setStep('often');
    } else if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    } else {
      router.back();
    }
  };

  const handleCategorySelect = async (cat: TaskCategory) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategory(cat);
    setTimeout(() => setStep('time'), 200);
  };

  const handleTimePreset = async (preset: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTime(preset);
    setTimeout(() => setStep('often'), 200);
  };

  const handleCustomTimeOpen = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Parse current time into hour/minute for the selector
    const [h, m] = time.split(':').map(Number);
    setSelectedHour(h);
    setSelectedMinute(m);
    setStep('customTime');
  };

  const handleCustomTimeDone = async () => {
    const h = selectedHour.toString().padStart(2, '0');
    const m = selectedMinute.toString().padStart(2, '0');
    setTime(`${h}:${m}`);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setStep('often'), 200);
  };

  const handleRecurrenceSelect = async (rec: 'once' | 'daily' | 'some') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (rec === 'daily') {
      setRecurrence('daily');
      setTimeout(() => setStep('confirm'), 200);
    } else if (rec === 'some') {
      setRecurrence('specific_days');
      setStep('days');
    } else {
      setRecurrence('one_time');
      setStep('date');
    }
  };

  const toggleDay = async (day: DayOfWeek) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDaysDone = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('confirm');
  };

  const handleDateSelect = async (date: Date) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOneTimeDate(date);
    setTimeout(() => setStep('confirm'), 200);
  };

  const handleSave = async () => {
    if (!householdId || !title.trim()) return;

    setSaving(true);
    try {
      const taskData = {
        category,
        title: title.trim(),
        time,
        recurrence,
        recurrence_days: recurrence === 'specific_days' ? recurrenceDays : [],
        one_time_date: recurrence === 'one_time' ? oneTimeDate.toISOString().split('T')[0] : undefined,
        patient_created: true,
      };

      await createTask(householdId, taskData);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('done');

      setTimeout(() => {
        router.back();
      }, 2500);
    } catch (err) {
      if (__DEV__) console.error('Failed to save reminder:', err);
      setSaving(false);

      // Show error — let user retry manually, don't auto-queue
      Alert.alert(
        t('common.errorTitle'),
        t('common.error'),
        [
          {
            text: t('common.tryAgain'),
            onPress: () => handleSave(),
          },
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
        ],
      );
    }
  };

  const formatTimeDisplay = (t: string) => {
    const [hours, minutes] = t.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCategoryIcon = (cat: TaskCategory) => {
    return PATIENT_CATEGORIES.find((c) => c.key === cat)?.icon || '📝';
  };

  const getRecurrenceLabel = () => {
    if (recurrence === 'daily') return t('patientApp.addReminder.everyDay');
    if (recurrence === 'specific_days') return recurrenceDays.map((d) => t(`patientApp.addReminder.${d}`)).join(', ');
    if (recurrence === 'one_time') return oneTimeDate.toLocaleDateString();
    return '';
  };

  const formatDayLabel = (date: Date) => {
    const dayNames = [
      t('patientApp.addReminder.sun'),
      t('patientApp.addReminder.mon'),
      t('patientApp.addReminder.tue'),
      t('patientApp.addReminder.wed'),
      t('patientApp.addReminder.thu'),
      t('patientApp.addReminder.fri'),
      t('patientApp.addReminder.sat'),
    ];
    return `${dayNames[date.getDay()]} ${date.getDate()}`;
  };

  // Done screen
  if (step === 'done') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centeredContent}>
          <View style={styles.doneCard}>
            <View style={styles.doneIconCircle}>
              <Text style={styles.doneIconText}>{'✓'}</Text>
            </View>
            <Text style={styles.doneTitle}>{t('patientApp.addReminder.saved')}</Text>
            <Text style={styles.doneMessage}>{t('patientApp.addReminder.savedMessage')}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={goBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('patientApp.addReminder.back')}
      >
        <Text style={styles.backButtonText}>{'←'} {t('patientApp.addReminder.back')}</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: What */}
        {step === 'what' && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle} accessibilityRole="header">
              {t('patientApp.addReminder.whatTitle')}
            </Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder={t('patientApp.addReminder.placeholder')}
              placeholderTextColor={COLORS.textMuted}
              autoFocus
              returnKeyType="done"
              maxLength={100}
            />
            <TouchableOpacity
              style={[styles.primaryButton, !title.trim() && styles.primaryButtonDisabled]}
              onPress={async () => {
                if (!title.trim()) return;
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setStep('type');
              }}
              disabled={!title.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{t('patientApp.addReminder.next')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Type */}
        {step === 'type' && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle} accessibilityRole="header">
              {t('patientApp.addReminder.whatType')}
            </Text>
            <View style={styles.categoryGrid}>
              {PATIENT_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryButton,
                    category === cat.key && styles.categoryButtonSelected,
                  ]}
                  onPress={() => handleCategorySelect(cat.key)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: category === cat.key }}
                >
                  <Text style={styles.categoryButtonIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat.key && styles.categoryButtonTextSelected,
                    ]}
                  >
                    {t(cat.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Time presets */}
        {step === 'time' && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle} accessibilityRole="header">
              {t('patientApp.addReminder.whatTime')}
            </Text>
            <View style={styles.optionsColumn}>
              {TIME_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.key}
                  style={styles.timeButton}
                  onPress={() => handleTimePreset(preset.time)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timeButtonIcon}>{preset.icon}</Text>
                  <Text style={styles.timeButtonText}>
                    {t(`patientApp.addReminder.${preset.key}`)}
                  </Text>
                  <Text style={styles.timeButtonTime}>{formatTimeDisplay(preset.time)}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.timeButton}
                onPress={handleCustomTimeOpen}
                activeOpacity={0.7}
              >
                <Text style={styles.timeButtonIcon}>{'🕐'}</Text>
                <Text style={styles.timeButtonText}>
                  {t('patientApp.addReminder.pickTime')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3b: Custom time (hour + minute buttons) */}
        {step === 'customTime' && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle} accessibilityRole="header">
              {t('patientApp.addReminder.pickHour')}
            </Text>
            <Text style={styles.selectedTimePreview}>
              {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
            </Text>
            <View style={styles.hourGrid}>
              {CUSTOM_HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.hourButton, selectedHour === h && styles.hourButtonSelected]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedHour(h);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.hourButtonText, selectedHour === h && styles.hourButtonTextSelected]}>
                    {h.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.minuteLabel}>
              {t('patientApp.addReminder.pickMinute')}
            </Text>
            <View style={styles.minuteRow}>
              {CUSTOM_MINUTES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.minuteButton, selectedMinute === m && styles.minuteButtonSelected]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedMinute(m);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.minuteButtonText, selectedMinute === m && styles.minuteButtonTextSelected]}>
                    :{m.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCustomTimeDone}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{t('patientApp.addReminder.next')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4: How Often */}
        {step === 'often' && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle} accessibilityRole="header">
              {t('patientApp.addReminder.howOften')}
            </Text>
            <View style={styles.optionsColumn}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleRecurrenceSelect('once')}
                activeOpacity={0.7}
              >
                <Text style={styles.optionButtonText}>{t('patientApp.addReminder.justOnce')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleRecurrenceSelect('daily')}
                activeOpacity={0.7}
              >
                <Text style={styles.optionButtonText}>{t('patientApp.addReminder.everyDay')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleRecurrenceSelect('some')}
                activeOpacity={0.7}
              >
                <Text style={styles.optionButtonText}>{t('patientApp.addReminder.someDays')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 4b: Which Days */}
        {step === 'days' && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle} accessibilityRole="header">
              {t('patientApp.addReminder.whichDays')}
            </Text>
            <View style={styles.daysGrid}>
              {DAY_KEYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    recurrenceDays.includes(day) && styles.dayButtonSelected,
                  ]}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: recurrenceDays.includes(day) }}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      recurrenceDays.includes(day) && styles.dayButtonTextSelected,
                    ]}
                  >
                    {t(`patientApp.addReminder.${day}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.primaryButton, recurrenceDays.length === 0 && styles.primaryButtonDisabled]}
              onPress={handleDaysDone}
              disabled={recurrenceDays.length === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{t('patientApp.addReminder.done')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4c: Date picker (button-based) */}
        {step === 'date' && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle} accessibilityRole="header">
              {t('patientApp.addReminder.whenDate')}
            </Text>
            <View style={styles.optionsColumn}>
              {buildDateOptions().map((opt) => (
                <TouchableOpacity
                  key={opt.dateStr}
                  style={[
                    styles.dateButton,
                    oneTimeDate.toISOString().split('T')[0] === opt.dateStr && styles.dateButtonSelected,
                  ]}
                  onPress={() => handleDateSelect(opt.date)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateButtonText,
                      oneTimeDate.toISOString().split('T')[0] === opt.dateStr && styles.dateButtonTextSelected,
                    ]}
                  >
                    {opt.labelKey ? t(opt.labelKey) : formatDayLabel(opt.date)}
                  </Text>
                  <Text
                    style={[
                      styles.dateButtonSub,
                      oneTimeDate.toISOString().split('T')[0] === opt.dateStr && styles.dateButtonTextSelected,
                    ]}
                  >
                    {opt.date.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 5: Confirmation */}
        {step === 'confirm' && (
          <View style={styles.stepCard}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>{getCategoryIcon(category)}</Text>
              <Text style={styles.summaryTitle}>{title}</Text>
              <Text style={styles.summaryDetail}>
                {'🕐'} {formatTimeDisplay(time)}
              </Text>
              <Text style={styles.summaryDetail}>
                {'🔄'} {getRecurrenceLabel()}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.textInverse} />
              ) : (
                <Text style={styles.primaryButtonText}>{t('patientApp.addReminder.save')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    paddingBottom: 40,
  },
  centeredContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButtonText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand600,
  },
  stepCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  stepTitle: {
    fontSize: 26,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 28,
  },
  titleInput: {
    fontSize: 24,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    borderWidth: 2,
    borderColor: COLORS.brand200,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 24,
    backgroundColor: COLORS.background,
  },
  primaryButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.xl,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    ...SHADOWS.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  categoryGrid: {
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    gap: 14,
    minHeight: 64,
  },
  categoryButtonSelected: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand50,
  },
  categoryButtonIcon: {
    fontSize: 28,
  },
  categoryButtonText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  categoryButtonTextSelected: {
    color: COLORS.brand600,
  },
  optionsColumn: {
    gap: 14,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    gap: 14,
    minHeight: 64,
  },
  timeButtonIcon: {
    fontSize: 28,
  },
  timeButtonText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  timeButtonTime: {
    fontSize: 20,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  selectedTimePreview: {
    fontSize: 36,
    fontFamily: FONTS.bodyBold,
    color: COLORS.brand600,
    textAlign: 'center',
    marginBottom: 20,
  },
  hourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 24,
  },
  hourButton: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourButtonSelected: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand600,
  },
  hourButtonText: {
    fontSize: 20,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  hourButtonTextSelected: {
    color: COLORS.textInverse,
  },
  minuteLabel: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  minuteRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 24,
  },
  minuteButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    minWidth: 70,
    alignItems: 'center',
  },
  minuteButtonSelected: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand600,
  },
  minuteButtonText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  minuteButtonTextSelected: {
    color: COLORS.textInverse,
  },
  optionButton: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    minHeight: 64,
    justifyContent: 'center',
  },
  optionButtonText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
    justifyContent: 'center',
  },
  dayButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    minWidth: 80,
    alignItems: 'center',
  },
  dayButtonSelected: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand600,
  },
  dayButtonText: {
    fontSize: 20,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  dayButtonTextSelected: {
    color: COLORS.textInverse,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    minHeight: 64,
  },
  dateButtonSelected: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand50,
  },
  dateButtonText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  dateButtonSub: {
    fontSize: 20,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  dateButtonTextSelected: {
    color: COLORS.brand600,
  },
  summaryCard: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  summaryIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  summaryDetail: {
    fontSize: 20,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  doneCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  doneIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  doneIconText: {
    fontSize: 36,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textInverse,
  },
  doneTitle: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  doneMessage: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
