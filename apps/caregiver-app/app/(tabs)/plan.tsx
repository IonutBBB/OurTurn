import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { supabase } from '@ourturn/supabase';
import { useAuthStore } from '../../src/stores/auth-store';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/theme';
import type { CarePlanTask, TaskCategory, DayOfWeek } from '@ourturn/shared';

const SCREEN_WIDTH = Dimensions.get('window').width;

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const CATEGORIES: { key: TaskCategory; icon: string; color: string; bg: string }[] = [
  { key: 'medication', icon: '💊', color: COLORS.medication, bg: COLORS.medicationBg },
  { key: 'nutrition', icon: '🥗', color: COLORS.nutrition, bg: COLORS.nutritionBg },
  { key: 'physical', icon: '🚶', color: COLORS.physical, bg: COLORS.physicalBg },
  { key: 'cognitive', icon: '🧩', color: COLORS.cognitive, bg: COLORS.cognitiveBg },
  { key: 'social', icon: '💬', color: COLORS.social, bg: COLORS.socialBg },
  { key: 'health', icon: '❤️', color: COLORS.health, bg: COLORS.healthBg },
];

function getTodayDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay();
  const mapping: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return mapping[dayIndex];
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getCategoryInfo(key: string) {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[0];
}

export default function PlanScreen() {
  const { t } = useTranslation();
  const { household, patient, user } = useAuthStore();

  const [tasks, setTasks] = useState<CarePlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayDayOfWeek());
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<CarePlanTask | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formCategory, setFormCategory] = useState<TaskCategory>('medication');
  const [formTitle, setFormTitle] = useState('');
  const [formHint, setFormHint] = useState('');
  const [formTime, setFormTime] = useState('09:00');
  const [formRecurrence, setFormRecurrence] = useState<'daily' | 'specific_days' | 'one_time'>('daily');
  const [formDays, setFormDays] = useState<DayOfWeek[]>([]);

  // AI Suggest state
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<{ category: TaskCategory; title: string; hint_text: string; time: string }[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [addingSuggestion, setAddingSuggestion] = useState<string | null>(null);

  // Copy Day state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargetDays, setCopyTargetDays] = useState<DayOfWeek[]>([]);
  const [copying, setCopying] = useState(false);

  // Swipe-to-delete animation refs
  const swipeAnimations = useRef<Record<string, Animated.Value>>({});

  const fetchTasks = useCallback(async () => {
    if (!household?.id) return;

    try {
      const { data, error } = await supabase
        .from('care_plan_tasks')
        .select('*')
        .eq('household_id', household.id)
        .eq('active', true)
        .order('time', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      if (__DEV__) console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [household?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks for selected day
  const filteredTasks = tasks.filter((task) => {
    if (task.recurrence === 'daily') return true;
    if (task.recurrence === 'specific_days') {
      return task.recurrence_days?.includes(selectedDay);
    }
    if (task.recurrence === 'one_time') {
      // For one-time tasks, show them on the matching day of the week
      if (task.one_time_date) {
        const taskDate = new Date(task.one_time_date);
        const dayIndex = taskDate.getDay();
        const mapping: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        return mapping[dayIndex] === selectedDay;
      }
    }
    return false;
  });

  const resetForm = () => {
    setFormCategory('medication');
    setFormTitle('');
    setFormHint('');
    setFormTime('09:00');
    setFormRecurrence('daily');
    setFormDays([]);
    setEditingTask(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (task: CarePlanTask) => {
    setEditingTask(task);
    setFormCategory(task.category);
    setFormTitle(task.title);
    setFormHint(task.hint_text || '');
    setFormTime(task.time);
    setFormRecurrence(task.recurrence);
    setFormDays(task.recurrence_days || []);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !household?.id) return;

    setSaving(true);
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('care_plan_tasks')
          .update({
            category: formCategory,
            title: formTitle.trim(),
            hint_text: formHint.trim() || null,
            time: formTime,
            recurrence: formRecurrence,
            recurrence_days: formRecurrence === 'specific_days' ? formDays : [],
          })
          .eq('id', editingTask.id);

        if (error) throw error;

        setTasks((prev) =>
          prev
            .map((t) =>
              t.id === editingTask.id
                ? {
                    ...t,
                    category: formCategory,
                    title: formTitle.trim(),
                    hint_text: formHint.trim() || null,
                    time: formTime,
                    recurrence: formRecurrence,
                    recurrence_days: formRecurrence === 'specific_days' ? formDays : [],
                  }
                : t
            )
            .sort((a, b) => a.time.localeCompare(b.time))
        );
      } else {
        const { data, error } = await supabase
          .from('care_plan_tasks')
          .insert({
            household_id: household.id,
            category: formCategory,
            title: formTitle.trim(),
            hint_text: formHint.trim() || null,
            time: formTime,
            recurrence: formRecurrence,
            recurrence_days: formRecurrence === 'specific_days' ? formDays : [],
            active: true,
            created_by: user?.id,
          })
          .select()
          .single();

        if (error) throw error;

        setTasks((prev) => [...prev, data].sort((a, b) => a.time.localeCompare(b.time)));
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      if (__DEV__) console.error('Failed to save task:', err);
      Alert.alert(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (task: CarePlanTask) => {
    Alert.alert(
      t('caregiverApp.carePlan.deleteConfirm'),
      task.title,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('care_plan_tasks')
                .update({ active: false })
                .eq('id', task.id);

              if (error) throw error;
              setTasks((prev) => prev.filter((t) => t.id !== task.id));
            } catch (err) {
              if (__DEV__) console.error('Failed to delete task:', err);
              Alert.alert(t('common.error'));
            }
          },
        },
      ]
    );
  };

  const toggleDay = (day: DayOfWeek) => {
    setFormDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleGetSuggestions = useCallback(async () => {
    if (!household?.id) return;
    setSuggestLoading(true);
    setSuggestedTasks([]);

    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) throw new Error('API not configured');

      const response = await fetch(`${apiBaseUrl}/api/ai/suggest-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ householdId: household.id, count: 3 }),
      });

      if (!response.ok) throw new Error('Failed to fetch suggestions');

      const { suggestions } = await response.json();
      setSuggestedTasks(suggestions || []);
    } catch {
      // Fallback to local suggestions if API fails
      const existingCategories = new Set(tasks.map(t => t.category));
      const fallback: { category: TaskCategory; title: string; hint_text: string; time: string }[] = [];

      if (!existingCategories.has('physical')) {
        fallback.push({ category: 'physical', title: 'Morning walk', hint_text: 'A gentle 15-minute walk around the neighbourhood', time: '09:00' });
      }
      if (!existingCategories.has('cognitive')) {
        fallback.push({ category: 'cognitive', title: 'Word puzzle', hint_text: 'Complete a crossword or word search puzzle', time: '10:30' });
      }
      if (!existingCategories.has('social')) {
        fallback.push({ category: 'social', title: 'Call a friend or family member', hint_text: 'Have a chat with someone you enjoy talking to', time: '14:00' });
      }
      if (fallback.length === 0) {
        fallback.push(
          { category: 'physical', title: 'Afternoon stretching', hint_text: 'Gentle chair exercises for 10 minutes', time: '15:00' },
          { category: 'cognitive', title: 'Look through photo album', hint_text: 'Enjoy looking at familiar photos and memories', time: '16:00' },
        );
      }
      setSuggestedTasks(fallback.slice(0, 3));
    } finally {
      setSuggestLoading(false);
    }
  }, [household?.id, tasks]);

  const handleAddSuggestion = useCallback(async (suggestion: { category: TaskCategory; title: string; hint_text: string; time: string }) => {
    if (!household?.id) return;
    setAddingSuggestion(suggestion.title);

    try {
      const { data, error } = await supabase
        .from('care_plan_tasks')
        .insert({
          household_id: household.id,
          category: suggestion.category,
          title: suggestion.title,
          hint_text: suggestion.hint_text,
          time: suggestion.time,
          recurrence: 'daily',
          recurrence_days: [],
          active: true,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [...prev, data].sort((a, b) => a.time.localeCompare(b.time)));
      setSuggestedTasks(prev => prev.filter(s => s.title !== suggestion.title));
    } catch (err) {
      Alert.alert(t('common.error'));
    } finally {
      setAddingSuggestion(null);
    }
  }, [household?.id, user?.id]);

  const handleCopyDay = useCallback(async () => {
    if (!household?.id || copyTargetDays.length === 0) return;
    setCopying(true);

    try {
      // Get tasks for the selected source day
      const sourceTasks = tasks.filter(task => {
        if (task.recurrence === 'daily') return true;
        if (task.recurrence === 'specific_days') {
          return task.recurrence_days?.includes(selectedDay);
        }
        return false;
      });

      if (sourceTasks.length === 0) {
        Alert.alert(t('caregiverApp.carePlan.noTasks'));
        return;
      }

      const newTasks = copyTargetDays.flatMap(targetDay =>
        sourceTasks.map(task => ({
          household_id: household.id,
          category: task.category,
          title: task.title,
          hint_text: task.hint_text,
          time: task.time,
          recurrence: 'specific_days' as const,
          recurrence_days: [targetDay],
          active: true,
          created_by: user?.id,
        }))
      );

      const { data, error } = await supabase
        .from('care_plan_tasks')
        .insert(newTasks)
        .select();

      if (error) throw error;

      setTasks(prev => [...prev, ...(data || [])].sort((a, b) => a.time.localeCompare(b.time)));
      setShowCopyModal(false);
      setCopyTargetDays([]);
    } catch (err) {
      Alert.alert(t('common.error'));
    } finally {
      setCopying(false);
    }
  }, [household?.id, user?.id, selectedDay, tasks, copyTargetDays]);

  const toggleCopyTargetDay = (day: DayOfWeek) => {
    setCopyTargetDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand600} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {t('caregiverApp.carePlan.title', { name: patient?.name || '' })}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setShowSuggestModal(true);
              handleGetSuggestions();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>✨</Text>
            <Text style={styles.actionButtonText}>{t('caregiverApp.carePlan.aiSuggest')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowCopyModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>📋</Text>
            <Text style={styles.actionButtonText}>{t('caregiverApp.carePlan.copyDay')}</Text>
          </TouchableOpacity>
        </View>

        {/* Day Selector Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelector}
        >
          {DAYS.map(({ key }) => {
            const isSelected = selectedDay === key;
            const isToday = key === getTodayDayOfWeek();
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.dayPill,
                  isSelected && styles.dayPillSelected,
                  isToday && !isSelected && styles.dayPillToday,
                ]}
                onPress={() => setSelectedDay(key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    isSelected && styles.dayPillTextSelected,
                  ]}
                >
                  {t(`caregiverApp.carePlan.days.${key}`)}
                </Text>
                {isToday && (
                  <View
                    style={[
                      styles.todayDot,
                      isSelected && styles.todayDotSelected,
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Task List */}
        <ScrollView
          style={styles.taskList}
          contentContainerStyle={styles.taskListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand600} />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>{t('caregiverApp.carePlan.noTasks')}</Text>
            </View>
          ) : (
            filteredTasks.map((task) => {
              const category = getCategoryInfo(task.category);
              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => openEditModal(task)}
                  onLongPress={() => handleDelete(task)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.taskCategoryStripe, { backgroundColor: category.color }]} />
                  <View style={styles.taskContent}>
                    <View style={styles.taskHeader}>
                      <View style={[styles.categoryBadge, { backgroundColor: category.bg }]}>
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                        <Text style={[styles.categoryText, { color: category.color }]}>
                          {t(`categories.${task.category}`)}
                        </Text>
                      </View>
                      <Text style={styles.taskTime}>{formatTime(task.time)}</Text>
                    </View>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.hint_text && (
                      <Text style={styles.taskHint} numberOfLines={2}>
                        {task.hint_text}
                      </Text>
                    )}
                    <View style={styles.taskFooter}>
                      <Text style={styles.recurrenceText}>
                        {task.recurrence === 'daily' && t('caregiverApp.carePlan.daily')}
                        {task.recurrence === 'specific_days' && task.recurrence_days?.join(', ')}
                        {task.recurrence === 'one_time' && t('caregiverApp.carePlan.oneTime')}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDelete(task)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.deleteButton}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          {/* Bottom padding for FAB */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Modal (Bottom Sheet) */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>
                {editingTask ? t('common.edit') : t('caregiverApp.carePlan.addTask')}
              </Text>

              {/* Category Selection */}
              <Text style={styles.fieldLabel}>{t('caregiverApp.carePlan.category')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categorySelector}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categorySelectorItem,
                      formCategory === cat.key && {
                        backgroundColor: cat.bg,
                        borderColor: cat.color,
                      },
                    ]}
                    onPress={() => setFormCategory(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categorySelectorIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categorySelectorText,
                        formCategory === cat.key && { color: cat.color },
                      ]}
                    >
                      {t(`categories.${cat.key}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Title */}
              <Text style={styles.fieldLabel}>{t('caregiverApp.carePlan.taskTitle')} *</Text>
              <TextInput
                style={styles.textInput}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder={t('caregiverApp.carePlan.taskTitle')}
                placeholderTextColor={COLORS.textMuted}
              />

              {/* Hint */}
              <Text style={styles.fieldLabel}>
                {t('caregiverApp.carePlan.hintLabel', { name: patient?.name || '' })}
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formHint}
                onChangeText={setFormHint}
                placeholder={t('caregiverApp.carePlan.hintPlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={2}
              />

              {/* Time */}
              <Text style={styles.fieldLabel}>{t('caregiverApp.carePlan.time')}</Text>
              <TextInput
                style={styles.textInput}
                value={formTime}
                onChangeText={setFormTime}
                placeholder="09:00"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numbers-and-punctuation"
              />

              {/* Recurrence */}
              <Text style={styles.fieldLabel}>{t('caregiverApp.carePlan.recurrence')}</Text>
              <View style={styles.recurrenceOptions}>
                {(['daily', 'specific_days', 'one_time'] as const).map((rec) => (
                  <TouchableOpacity
                    key={rec}
                    style={[
                      styles.recurrenceOption,
                      formRecurrence === rec && styles.recurrenceOptionSelected,
                    ]}
                    onPress={() => setFormRecurrence(rec)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.recurrenceOptionText,
                        formRecurrence === rec && styles.recurrenceOptionTextSelected,
                      ]}
                    >
                      {rec === 'daily' && t('caregiverApp.carePlan.daily')}
                      {rec === 'specific_days' && t('caregiverApp.carePlan.specificDays')}
                      {rec === 'one_time' && t('caregiverApp.carePlan.oneTime')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Day selector for specific days */}
              {formRecurrence === 'specific_days' && (
                <View style={styles.dayPickerRow}>
                  {DAYS.map(({ key }) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.dayPickerItem,
                        formDays.includes(key) && styles.dayPickerItemSelected,
                      ]}
                      onPress={() => toggleDay(key)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayPickerText,
                          formDays.includes(key) && styles.dayPickerTextSelected,
                        ]}
                      >
                        {t(`caregiverApp.carePlan.days.${key}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, (!formTitle.trim() || saving) && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={!formTitle.trim() || saving}
                  activeOpacity={0.7}
                >
                  {saving ? (
                    <ActivityIndicator color={COLORS.textInverse} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingTask ? t('common.save') : t('caregiverApp.carePlan.addTask')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* AI Suggest Modal */}
      <Modal
        visible={showSuggestModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSuggestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowSuggestModal(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('caregiverApp.carePlan.aiSuggest')}</Text>

            {suggestLoading ? (
              <View style={styles.suggestLoading}>
                <ActivityIndicator size="large" color={COLORS.brand600} />
                <Text style={styles.suggestLoadingText}>{t('common.loading')}</Text>
              </View>
            ) : suggestedTasks.length === 0 ? (
              <View style={styles.suggestEmpty}>
                <Text style={styles.suggestEmptyText}>{t('caregiverApp.carePlan.noMoreSuggestions')}</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {suggestedTasks.map((suggestion, index) => {
                  const catInfo = getCategoryInfo(suggestion.category);
                  return (
                    <View key={index} style={styles.suggestionCard}>
                      <View style={[styles.taskCategoryStripe, { backgroundColor: catInfo.color }]} />
                      <View style={styles.suggestionContent}>
                        <View style={[styles.categoryBadge, { backgroundColor: catInfo.bg }]}>
                          <Text style={styles.categoryIcon}>{catInfo.icon}</Text>
                          <Text style={[styles.categoryText, { color: catInfo.color }]}>
                            {t(`categories.${suggestion.category}`)}
                          </Text>
                        </View>
                        <Text style={styles.taskTitle}>{suggestion.title}</Text>
                        <Text style={styles.taskHint}>{suggestion.hint_text}</Text>
                        <View style={styles.suggestionFooter}>
                          <Text style={styles.taskTime}>{formatTime(suggestion.time)}</Text>
                          <TouchableOpacity
                            style={styles.addSuggestionButton}
                            onPress={() => handleAddSuggestion(suggestion)}
                            disabled={addingSuggestion === suggestion.title}
                            activeOpacity={0.7}
                          >
                            {addingSuggestion === suggestion.title ? (
                              <ActivityIndicator color={COLORS.textInverse} size="small" />
                            ) : (
                              <Text style={styles.addSuggestionText}>{t('caregiverApp.carePlan.addTask')}</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Copy Day Modal */}
      <Modal
        visible={showCopyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCopyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCopyModal(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('caregiverApp.carePlan.copyDay')}</Text>

            <Text style={styles.copyLabel}>
              {t('caregiverApp.carePlan.copyFromTo', { day: t(`caregiverApp.carePlan.days.${selectedDay}`) })}
            </Text>

            <View style={styles.copyDayGrid}>
              {DAYS.filter(d => d.key !== selectedDay).map(({ key }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.copyDayItem,
                    copyTargetDays.includes(key) && styles.copyDayItemSelected,
                  ]}
                  onPress={() => toggleCopyTargetDay(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.copyDayText,
                    copyTargetDays.includes(key) && styles.copyDayTextSelected,
                  ]}>
                    {t(`caregiverApp.carePlan.days.${key}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.copyCount}>
              {t('caregiverApp.carePlan.copyCount', { taskCount: filteredTasks.length, dayCount: copyTargetDays.length })}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCopyModal(false);
                  setCopyTargetDays([]);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, (copyTargetDays.length === 0 || copying) && styles.saveButtonDisabled]}
                onPress={handleCopyDay}
                disabled={copyTargetDays.length === 0 || copying}
                activeOpacity={0.7}
              >
                {copying ? (
                  <ActivityIndicator color={COLORS.textInverse} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('caregiverApp.carePlan.copyDay')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // Day Selector
  daySelector: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  dayPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: 54,
    ...SHADOWS.sm,
  },
  dayPillSelected: {
    backgroundColor: COLORS.brand600,
    borderColor: COLORS.brand600,
  },
  dayPillToday: {
    borderColor: COLORS.brand400,
  },
  dayPillText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textSecondary,
  },
  dayPillTextSelected: {
    color: COLORS.textInverse,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.brand500,
    marginTop: 4,
  },
  todayDotSelected: {
    backgroundColor: COLORS.textInverse,
  },

  // Task List
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Empty State
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginTop: 20,
    ...SHADOWS.sm,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Task Card
  taskCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  taskCategoryStripe: {
    width: 4,
  },
  taskContent: {
    flex: 1,
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  taskTime: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textSecondary,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  taskHint: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recurrenceText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  deleteButton: {
    fontSize: 16,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  fabText: {
    fontSize: 28,
    color: COLORS.textInverse,
    fontWeight: '300',
    marginTop: -2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    padding: 24,
    maxHeight: '85%',
    ...SHADOWS.lg,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },

  // Form fields
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.brand200,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },

  // Category Selector in modal
  categorySelector: {
    gap: 8,
    paddingVertical: 4,
  },
  categorySelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 6,
  },
  categorySelectorIcon: {
    fontSize: 16,
  },
  categorySelectorText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textSecondary,
  },

  // Recurrence options
  recurrenceOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  recurrenceOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  recurrenceOptionSelected: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand50,
  },
  recurrenceOptionText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  recurrenceOptionTextSelected: {
    color: COLORS.brand700,
    fontWeight: '600',
  },

  // Day picker in modal
  dayPickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  dayPickerItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  dayPickerItemSelected: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand600,
  },
  dayPickerText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textSecondary,
  },
  dayPickerTextSelected: {
    color: COLORS.textInverse,
  },

  // Modal actions
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },

  // Action row (AI Suggest + Copy Day)
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.brand200,
    backgroundColor: COLORS.brand50,
  },
  actionButtonIcon: {
    fontSize: 14,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand700,
  },

  // AI Suggest modal
  suggestLoading: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  suggestLoadingText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  suggestEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  suggestEmptyText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  suggestionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  suggestionContent: {
    flex: 1,
    padding: 16,
  },
  suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addSuggestionButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSuggestionText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },

  // Copy Day modal
  copyLabel: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  copyBold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  copyDayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  copyDayItem: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  copyDayItemSelected: {
    borderColor: COLORS.brand600,
    backgroundColor: COLORS.brand600,
  },
  copyDayText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textSecondary,
  },
  copyDayTextSelected: {
    color: COLORS.textInverse,
  },
  copyCount: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
});
