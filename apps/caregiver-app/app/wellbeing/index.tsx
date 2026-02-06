import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/stores/auth-store';
import { supabase } from '@memoguard/supabase';
import type {
  CaregiverWellbeingLog,
  WellbeingMood,
  SelfCareChecklist,
} from '@memoguard/shared';
import {
  CAREGIVER_MOOD_LABELS,
  SELF_CARE_ITEMS,
} from '@memoguard/shared';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

export default function WellbeingScreen() {
  const { t } = useTranslation();
  const { caregiver } = useAuthStore();
  const [todayLog, setTodayLog] = useState<CaregiverWellbeingLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<CaregiverWellbeingLog[]>([]);
  const [mood, setMood] = useState<WellbeingMood | null>(null);
  const [selfCare, setSelfCare] = useState<SelfCareChecklist>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSaved, setShowSaved] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!caregiver?.id) return;

      try {
        // Get today's log
        const { data: todayData } = await supabase
          .from('caregiver_wellbeing_logs')
          .select('*')
          .eq('caregiver_id', caregiver.id)
          .eq('date', today)
          .single();

        if (todayData) {
          setTodayLog(todayData);
          setMood(todayData.mood);
          setSelfCare(todayData.self_care_checklist || {});
          setNotes(todayData.notes || '');
        }

        // Get recent logs
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: recent } = await supabase
          .from('caregiver_wellbeing_logs')
          .select('*')
          .eq('caregiver_id', caregiver.id)
          .gte('date', sevenDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: false });

        setRecentLogs(recent || []);
      } catch (err) {
        console.error('Failed to load wellbeing data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [caregiver?.id, today]);

  // Save changes
  const saveLog = useCallback(async () => {
    if (!caregiver?.id || mood === null) return;

    try {
      if (todayLog) {
        const { data, error } = await supabase
          .from('caregiver_wellbeing_logs')
          .update({
            mood,
            self_care_checklist: selfCare,
            notes: notes || null,
          })
          .eq('id', todayLog.id)
          .select()
          .single();

        if (error) throw error;
        setTodayLog(data);
      } else {
        const { data, error } = await supabase
          .from('caregiver_wellbeing_logs')
          .insert({
            caregiver_id: caregiver.id,
            date: today,
            mood,
            self_care_checklist: selfCare,
            notes: notes || null,
          })
          .select()
          .single();

        if (error) throw error;
        setTodayLog(data);
      }

      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save:', err);
    }
  }, [mood, selfCare, notes, todayLog, caregiver?.id, today]);

  // Auto-save
  useEffect(() => {
    if (mood !== null && !loading) {
      const timeout = setTimeout(saveLog, 1000);
      return () => clearTimeout(timeout);
    }
  }, [mood, selfCare, notes, saveLog, loading]);

  const handleMoodSelect = async (value: WellbeingMood) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMood(value);
  };

  const toggleSelfCareItem = async (key: keyof SelfCareChecklist) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelfCare((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const checkedCount = Object.values(selfCare).filter(Boolean).length;

  // Weekly stats
  const weeklyStats = {
    averageMood:
      recentLogs.length > 0
        ? (recentLogs.reduce((sum, log) => sum + (log.mood || 0), 0) / recentLogs.length).toFixed(1)
        : 'N/A',
    selfCareDays: recentLogs.filter((log) => {
      const checklist = log.self_care_checklist || {};
      return Object.values(checklist).filter(Boolean).length >= 3;
    }).length,
    loggedDays: recentLogs.length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Your Wellbeing</Text>
          {showSaved && <Text style={styles.savedText}>Saved!</Text>}
        </View>

        <Text style={styles.subtitle}>
          Taking care of yourself is just as important as caring for your loved one.
        </Text>

        {/* Mood Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <View style={styles.moodRow}>
            {([5, 4, 3, 2, 1] as WellbeingMood[]).map((value) => {
              const { emoji, label } = CAREGIVER_MOOD_LABELS[value];
              const isSelected = mood === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.moodButton, isSelected && styles.moodButtonSelected]}
                  onPress={() => handleMoodSelect(value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moodEmoji}>{emoji}</Text>
                  <Text
                    style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Self-Care Checklist */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Self-Care Checklist</Text>
            <Text style={styles.checkedCount}>{checkedCount}/{SELF_CARE_ITEMS.length}</Text>
          </View>
          <View style={styles.checklistContainer}>
            {SELF_CARE_ITEMS.map(({ key, label }) => {
              const isChecked = selfCare[key] || false;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.checklistItem, isChecked && styles.checklistItemChecked]}
                  onPress={() => toggleSelfCareItem(key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.checklistLabel, isChecked && styles.checklistLabelChecked]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you coping? (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Write anything on your mind..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Weekly Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyStats.averageMood}</Text>
              <Text style={styles.statLabel}>Avg Mood</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyStats.selfCareDays}</Text>
              <Text style={styles.statLabel}>Self-Care Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyStats.loggedDays}</Text>
              <Text style={styles.statLabel}>Days Logged</Text>
            </View>
          </View>
        </View>

        {/* Mood History */}
        {recentLogs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mood History</Text>
            <View style={styles.historyContainer}>
              {recentLogs.slice(0, 7).map((log) => {
                const moodInfo = log.mood ? CAREGIVER_MOOD_LABELS[log.mood] : null;
                const date = new Date(log.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <View key={log.id} style={styles.historyItem}>
                    <Text style={styles.historyDay}>{dayName}</Text>
                    {moodInfo && <Text style={styles.historyEmoji}>{moodInfo.emoji}</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Support Resources */}
        <View style={[styles.section, styles.supportCard]}>
          <Text style={styles.supportTitle}>Need Support?</Text>
          <Text style={styles.supportText}>
            Caregiving is challenging. It's okay to ask for help.
          </Text>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 18,
    color: COLORS.brand600,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  savedText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  checkedCount: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    ...SHADOWS.sm,
  },
  moodButtonSelected: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand50,
    ...SHADOWS.md,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: COLORS.brand700,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  checklistContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checklistItemChecked: {
    backgroundColor: COLORS.successBg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
  checklistLabel: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
  },
  checklistLabelChecked: {
    color: COLORS.success,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  notesInput: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.brand200,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.brand700,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  historyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  historyItem: {
    alignItems: 'center',
  },
  historyDay: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  historyEmoji: {
    fontSize: 24,
  },
  supportCard: {
    backgroundColor: COLORS.brand50,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.brand200,
    ...SHADOWS.sm,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand800,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.brand700,
    lineHeight: 20,
  },
});
