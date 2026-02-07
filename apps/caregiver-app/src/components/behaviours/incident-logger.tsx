import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BehaviourIncident, BehaviourType, TimeOfDay } from '@ourturn/shared';
import { BEHAVIOUR_TYPES, BEHAVIOUR_TRIGGERS } from '@ourturn/shared';
import { useAuthStore } from '../../stores/auth-store';
import { supabase } from '@ourturn/supabase';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme';

interface IncidentLoggerProps {
  prefillType?: string;
  onClose: () => void;
  onSaved: (incident: BehaviourIncident) => void;
}

export function IncidentLogger({ prefillType, onClose, onSaved }: IncidentLoggerProps) {
  const { t } = useTranslation();
  const { caregiver, household, patient } = useAuthStore();

  const [behaviourType, setBehaviourType] = useState<BehaviourType | ''>(
    (prefillType as BehaviourType) || ''
  );
  const [severity, setSeverity] = useState(3);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | ''>('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [whatHappened, setWhatHappened] = useState('');
  const [whatHelped, setWhatHelped] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSave = async () => {
    if (!behaviourType || !whatHappened.trim() || !caregiver || !household || !patient) return;
    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('behaviour_incidents')
        .insert({
          caregiver_id: caregiver.id,
          household_id: household.id,
          patient_id: patient.id,
          behaviour_type: behaviourType,
          severity,
          time_of_day: timeOfDay || null,
          duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
          possible_triggers: selectedTriggers,
          what_happened: whatHappened.trim(),
          what_helped: whatHelped.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      onSaved(data);
    } catch {
      Alert.alert(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const timeOptions: { value: TimeOfDay; label: string }[] = [
    { value: 'morning', label: t('caregiverApp.toolkit.behaviours.logger.morning') },
    { value: 'afternoon', label: t('caregiverApp.toolkit.behaviours.logger.afternoon') },
    { value: 'evening', label: t('caregiverApp.toolkit.behaviours.logger.evening') },
    { value: 'night', label: t('caregiverApp.toolkit.behaviours.logger.night') },
  ];

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {t('caregiverApp.toolkit.behaviours.logger.title')}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Behaviour Type */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('caregiverApp.toolkit.behaviours.logger.typeLabel')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {BEHAVIOUR_TYPES.map((bt) => (
                  <TouchableOpacity
                    key={bt.type}
                    style={[styles.chip, behaviourType === bt.type && styles.chipActive]}
                    onPress={() => setBehaviourType(bt.type)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipEmoji}>{bt.emoji}</Text>
                    <Text style={[styles.chipText, behaviourType === bt.type && styles.chipTextActive]}>
                      {bt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Severity */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('caregiverApp.toolkit.behaviours.logger.severity')}
            </Text>
            <View style={styles.severityRow}>
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.severityDot,
                    severity === level && (
                      level <= 2 ? styles.severityGreen :
                      level === 3 ? styles.severityAmber :
                      styles.severityRed
                    ),
                  ]}
                  onPress={() => setSeverity(level)}
                >
                  <Text style={[
                    styles.severityText,
                    severity === level && styles.severityTextActive,
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.severityLabels}>
              <Text style={styles.severityLabel}>{t('caregiverApp.toolkit.behaviours.logger.mild')}</Text>
              <Text style={styles.severityLabel}>{t('caregiverApp.toolkit.behaviours.logger.severe')}</Text>
            </View>
          </View>

          {/* Time of Day */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('caregiverApp.toolkit.behaviours.logger.timeOfDay')}
            </Text>
            <View style={styles.chipRow}>
              {timeOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, timeOfDay === opt.value && styles.chipActive]}
                  onPress={() => setTimeOfDay(timeOfDay === opt.value ? '' : opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, timeOfDay === opt.value && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('caregiverApp.toolkit.behaviours.logger.duration')}
            </Text>
            <TextInput
              style={styles.input}
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              placeholder={t('caregiverApp.toolkit.behaviours.logger.durationPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
            />
          </View>

          {/* Triggers */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('caregiverApp.toolkit.behaviours.logger.triggers')}
            </Text>
            <View style={styles.chipWrap}>
              {BEHAVIOUR_TRIGGERS.map((trigger) => (
                <TouchableOpacity
                  key={trigger}
                  style={[styles.chipSmall, selectedTriggers.includes(trigger) && styles.chipActive]}
                  onPress={() => toggleTrigger(trigger)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.chipSmallText,
                    selectedTriggers.includes(trigger) && styles.chipTextActive,
                  ]}>
                    {t(`caregiverApp.toolkit.behaviours.logger.trigger_${trigger}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* What happened */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('caregiverApp.toolkit.behaviours.logger.whatHappened')}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={whatHappened}
              onChangeText={setWhatHappened}
              placeholder={t('caregiverApp.toolkit.behaviours.logger.whatHappenedPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* What helped */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('caregiverApp.toolkit.behaviours.logger.whatHelped')}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={whatHelped}
              onChangeText={setWhatHelped}
              placeholder={t('caregiverApp.toolkit.behaviours.logger.whatHelpedPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Save */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, (!behaviourType || !whatHappened.trim()) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving || !behaviourType || !whatHappened.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.saveBtnText}>
              {isSaving ? t('common.saving') : t('caregiverApp.toolkit.behaviours.logger.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[6],
    paddingBottom: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.display,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING[5], gap: SPACING[5] },
  field: { gap: SPACING[2] },
  label: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING[4], paddingVertical: SPACING[3],
    fontSize: 16, fontFamily: FONTS.body, color: COLORS.textPrimary,
  },
  textArea: { minHeight: 80 },
  chipRow: { flexDirection: 'row', gap: SPACING[2] },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[2] },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING[1],
    paddingHorizontal: SPACING[3], paddingVertical: SPACING[2],
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  chipActive: { borderColor: COLORS.brand600, backgroundColor: COLORS.brand50 },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 14, fontFamily: FONTS.body, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.brand700, fontFamily: FONTS.bodyMedium, fontWeight: '500' },
  chipSmall: {
    paddingHorizontal: SPACING[3], paddingVertical: SPACING[1],
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  chipSmallText: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textSecondary },
  severityRow: { flexDirection: 'row', gap: SPACING[2] },
  severityDot: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  severityGreen: { borderColor: COLORS.success, backgroundColor: COLORS.success },
  severityAmber: { borderColor: COLORS.amber, backgroundColor: COLORS.amber },
  severityRed: { borderColor: COLORS.danger, backgroundColor: COLORS.danger },
  severityText: { fontSize: 14, fontFamily: FONTS.bodyBold, fontWeight: '700', color: COLORS.textMuted },
  severityTextActive: { color: COLORS.textInverse },
  severityLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  severityLabel: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted },
  footer: {
    paddingHorizontal: SPACING[5], paddingVertical: SPACING[4],
    borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.card,
  },
  saveBtn: {
    backgroundColor: COLORS.brand600, borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4], alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    fontSize: 16, fontFamily: FONTS.bodySemiBold, fontWeight: '600', color: COLORS.textInverse,
  },
});
