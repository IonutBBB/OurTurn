import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import i18n from '../../src/i18n';
import { supabase } from '@ourturn/supabase';
import { useAuthStore } from '../../src/stores/auth-store';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/theme';
import type { CarePlanTask, TaskCategory, DayOfWeek, MedicationItem } from '@ourturn/shared';
import { SHARED_ACTIVITY_DEFINITIONS, SHARED_ACTIVITY_CATEGORIES, getActivityDefinition, VALID_ACTIVITY_TYPES, getActivitiesForLocale, getCategoriesForLocale } from '@ourturn/shared';

const SCREEN_WIDTH = Dimensions.get('window').width;

const DAY_KEYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

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

export default function PlanScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.split('-')[0] || 'en';
  const { household, patient, user } = useAuthStore();

  const styles = useStyles();
  const colors = useColors();

  const CATEGORIES: { key: TaskCategory; icon: string; color: string; bg: string }[] = useMemo(() => [
    { key: 'medication', icon: '💊', color: colors.medication, bg: colors.medicationBg },
    { key: 'nutrition', icon: '🥗', color: colors.nutrition, bg: colors.nutritionBg },
    { key: 'physical', icon: '🚶', color: colors.physical, bg: colors.physicalBg },
    { key: 'cognitive', icon: '🧩', color: colors.cognitive, bg: colors.cognitiveBg },
    { key: 'social', icon: '💬', color: colors.social, bg: colors.socialBg },
    { key: 'health', icon: '❤️', color: colors.health, bg: colors.healthBg },
    { key: 'activity', icon: '🧠', color: '#6366F1', bg: '#EEF2FF' },
  ], [colors]);

  const getCategoryInfo = (key: string) => {
    return CATEGORIES.find((c) => c.key === key) || CATEGORIES[0];
  };

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
  const [formOneTimeDate, setFormOneTimeDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formPhotoUrl, setFormPhotoUrl] = useState<string | null>(null);
  const [formMedItems, setFormMedItems] = useState<MedicationItem[]>([]);
  const [formActivityType, setFormActivityType] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadingMedIndex, setUploadingMedIndex] = useState<number | null>(null);

  // Activity template picker
  const [showActivityPicker, setShowActivityPicker] = useState(false);

  // Completion tracking
  const [completions, setCompletions] = useState<Record<string, boolean>>({});

  // AI Suggest state
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<{ category: TaskCategory; title: string; hint_text: string; time: string; activity_type?: string | null; intervention_id?: string | null; evidence_source?: string | null }[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestCategory, setSuggestCategory] = useState<string>('');
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

  // Realtime subscription for care_plan_tasks changes (e.g. patient-created tasks)
  useEffect(() => {
    if (!household?.id) return;
    const channel = supabase
      .channel(`plan-tasks-${household.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'care_plan_tasks',
        filter: `household_id=eq.${household.id}`,
      }, () => { fetchTasks(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [household?.id, fetchTasks]);

  // Fetch today's completions
  const fetchCompletions = useCallback(async () => {
    if (!household?.id) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('task_completions')
      .select('task_id, completed')
      .eq('household_id', household.id)
      .eq('date', today);
    if (data) {
      const map: Record<string, boolean> = {};
      data.forEach((c) => { if (c.completed) map[c.task_id] = true; });
      setCompletions(map);
    }
  }, [household?.id]);

  useEffect(() => { fetchCompletions(); }, [fetchCompletions]);

  // Realtime subscription for task_completions
  useEffect(() => {
    if (!household?.id) return;
    const channel = supabase
      .channel(`plan-completions-${household.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_completions',
        filter: `household_id=eq.${household.id}`,
      }, () => { fetchCompletions(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [household?.id, fetchCompletions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
    fetchCompletions();
  }, [fetchTasks, fetchCompletions]);

  // Filter tasks for selected day
  const filteredTasks = tasks.filter((task) => {
    if (task.recurrence === 'daily') return true;
    if (task.recurrence === 'specific_days') {
      return task.recurrence_days?.some(d => d.toLowerCase() === selectedDay) ?? false;
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

  // Photo upload helper
  const pickAndUploadPhoto = async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) return null;

    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() || 'jpg';
    const path = `${household!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const response = await fetch(asset.uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from('task-photos')
      .upload(path, blob, { contentType: asset.mimeType || 'image/jpeg' });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from('task-photos').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleFormPhotoUpload = async () => {
    setIsUploadingPhoto(true);
    try {
      const url = await pickAndUploadPhoto();
      if (url) setFormPhotoUrl(url);
    } catch {
      Alert.alert(t('common.error'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleMedPhotoUpload = async (index: number) => {
    setUploadingMedIndex(index);
    try {
      const url = await pickAndUploadPhoto();
      if (url) {
        setFormMedItems((prev) => {
          const items = [...prev];
          items[index] = { ...items[index], photo_url: url };
          return items;
        });
      }
    } catch {
      Alert.alert(t('common.error'));
    } finally {
      setUploadingMedIndex(null);
    }
  };

  const resetForm = () => {
    setFormCategory('medication');
    setFormTitle('');
    setFormHint('');
    setFormTime('09:00');
    setFormRecurrence('daily');
    setFormDays([]);
    setFormOneTimeDate(new Date().toISOString().slice(0, 10));
    setFormPhotoUrl(null);
    setFormMedItems([]);
    setFormActivityType(null);
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
    setFormOneTimeDate(task.one_time_date || new Date().toISOString().slice(0, 10));
    setFormPhotoUrl(task.photo_url || null);
    setFormMedItems(task.medication_items || []);
    setFormActivityType(task.activity_type || null);
    setShowModal(true);
  };

  const handleSelectActivity = (activityType: string) => {
    const def = getActivityDefinition(activityType);
    if (!def) return;
    setShowActivityPicker(false);
    setFormCategory('activity');
    setFormTitle(t(def.titleKey));
    setFormHint(t(def.descriptionKey));
    setFormTime('10:00');
    setFormRecurrence('daily');
    setFormDays([]);
    setFormPhotoUrl(null);
    setFormMedItems([]);
    setFormActivityType(activityType);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !household?.id) return;

    setSaving(true);
    try {
      const medItems = formCategory === 'medication' && formMedItems.length > 0
        ? formMedItems.filter((m) => m.name.trim())
        : null;

      const oneTimeDate = formRecurrence === 'one_time' ? formOneTimeDate : null;

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
            one_time_date: oneTimeDate,
            photo_url: formPhotoUrl,
            medication_items: medItems,
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
                    one_time_date: oneTimeDate,
                    photo_url: formPhotoUrl,
                    medication_items: medItems,
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
            one_time_date: oneTimeDate,
            active: true,
            created_by: user?.id,
            photo_url: formPhotoUrl,
            medication_items: medItems,
            activity_type: formActivityType,
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
    const canRemoveFromDay = task.recurrence === 'daily' || task.recurrence === 'specific_days';

    if (canRemoveFromDay) {
      const allDays = DAY_KEYS as string[];
      const currentDays = task.recurrence === 'daily'
        ? allDays
        : (task.recurrence_days?.map(d => d.toLowerCase()) ?? []);
      const remainingDays = currentDays.filter(d => d !== selectedDay);

      if (remainingDays.length > 0) {
        const dayLabel = t(`caregiverApp.carePlan.days.${selectedDay}`);
        Alert.alert(
          t('caregiverApp.carePlan.removeFromDayConfirm', { day: dayLabel }),
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
                    .update({ recurrence: 'specific_days', recurrence_days: remainingDays })
                    .eq('id', task.id);

                  if (error) throw error;
                  setTasks((prev) => prev.map((t) =>
                    t.id === task.id ? { ...t, recurrence: 'specific_days' as const, recurrence_days: remainingDays } : t
                  ));
                } catch (err) {
                  if (__DEV__) console.error('Failed to remove task from day:', err);
                  Alert.alert(t('common.error'));
                }
              },
            },
          ]
        );
        return;
      }

      // Last day — confirm full deletion
      Alert.alert(
        t('caregiverApp.carePlan.deleteLastDayConfirm'),
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
      return;
    }

    // one_time tasks — delete entirely
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

  const handleGetSuggestions = useCallback(async (category?: string) => {
    if (!household?.id || !patient) return;
    setSuggestLoading(true);
    setSuggestedTasks([]);

    try {
      const geminiKey = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
      if (!geminiKey) throw new Error('Gemini API key not configured');

      // Get existing tasks to avoid duplicates
      const existingTitles = tasks.map(t => `${t.time}: ${t.title} (${t.category})`).join('\n') || 'No existing tasks yet.';

      // Determine language
      const locale = i18n.language;
      const langNames: Record<string, string> = {
        ro: 'Romanian', de: 'German', fr: 'French', es: 'Spanish', it: 'Italian',
        pt: 'Portuguese', nl: 'Dutch', pl: 'Polish', el: 'Greek', cs: 'Czech',
        hu: 'Hungarian', sv: 'Swedish', da: 'Danish', fi: 'Finnish', bg: 'Bulgarian',
        hr: 'Croatian', sk: 'Slovak', sl: 'Slovenian', lt: 'Lithuanian', lv: 'Latvian',
        et: 'Estonian', ga: 'Irish', mt: 'Maltese',
      };
      const targetLang = locale !== 'en' ? langNames[locale] || null : null;

      const categoryFocus = category
        ? `Focus ONLY on the "${category}" category.`
        : 'Include a variety of categories (physical, nutrition, cognitive, social, health).';

      const prompt = `You are a care task generator for a daily wellness app.
${targetLang ? `\n**YOU MUST WRITE ALL "title" AND "hint_text" VALUES IN ${targetLang.toUpperCase()}. DO NOT USE ENGLISH FOR THESE FIELDS.**\n` : ''}
Generate 6 personalized daily care task suggestions for ${patient.name}.
${categoryFocus}

RULES:
- Task titles: max 6 words${targetLang ? ` in ${targetLang}` : ''}
- hint_text: 2-3 warm, encouraging sentences${targetLang ? ` in ${targetLang}` : ''}
- NEVER use terms: "dementia", "cognitive decline", "brain training", "Alzheimer's"
- Frame everything as enjoyable activities
- Space tasks between 08:00 and 21:00 with 1.5h gaps
- Valid categories: medication, nutrition, physical, cognitive, social, health, activity
- For "activity" category tasks, include an "activity_type" field with one of: ${getActivitiesForLocale(locale).map(a => a.type).join(', ')}. These are mind games.
${category === 'activity' ? `- Since the focus is on mind games, ALL 6 suggestions MUST be mind games with category "activity" and a unique activity_type from the list above.` : '- Include at most 1-2 mind game suggestions per batch.'}

EXISTING PLAN (avoid duplicating):
${existingTitles}

Return ONLY a valid JSON array, no markdown.
Each task: { "category": "...", "title": "...", "hint_text": "...", "time": "HH:MM", "recurrence": "daily" }${targetLang ? `\n\nCRITICAL: "title" and "hint_text" MUST be in ${targetLang}. NOT in English.` : ''}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 4096, responseMimeType: 'application/json' },
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.text();
        if (__DEV__) console.error('Gemini API error:', response.status, errBody);
        throw new Error(`Gemini ${response.status}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (__DEV__) console.log('Gemini finishReason:', candidate?.finishReason);

      // Collect text from all parts
      const allText = (candidate?.content?.parts || [])
        .map((p: { text?: string }) => p.text || '')
        .join('');
      if (__DEV__) console.log('Gemini raw text (first 300):', allText.substring(0, 300));

      // Strip markdown fences, thinking blocks, and any non-JSON wrapper
      const cleanText = allText
        .replace(/```[\w]*\n?/g, '')
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .trim();
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON in response: ' + cleanText.substring(0, 200));

      const parsed = JSON.parse(jsonMatch[0]);
      const validCategories = ['medication', 'nutrition', 'physical', 'cognitive', 'social', 'health', 'activity'];
      const valid = parsed
        .filter((s: Record<string, string>) => {
          if (!s.title || !s.hint_text || !s.category) return false;
          if (!validCategories.includes(s.category)) return false;
          if (s.category === 'activity' && (!s.activity_type || !getActivitiesForLocale(locale).some(a => a.type === s.activity_type))) return false;
          return true;
        })
        .slice(0, 6);

      setSuggestedTasks(valid);
    } catch (err) {
      if (__DEV__) console.error('AI suggest-tasks failed:', err);
      setSuggestedTasks([]);
    } finally {
      setSuggestLoading(false);
    }
  }, [household?.id, patient, tasks]);

  const handleAddSuggestion = useCallback(async (suggestion: { category: TaskCategory; title: string; hint_text: string; time: string; activity_type?: string | null; intervention_id?: string | null; evidence_source?: string | null }) => {
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
          activity_type: suggestion.activity_type || null,
          intervention_id: suggestion.intervention_id || null,
          evidence_source: suggestion.evidence_source || null,
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
          return task.recurrence_days?.some(d => d.toLowerCase() === selectedDay) ?? false;
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
          photo_url: task.photo_url,
          medication_items: task.medication_items,
          activity_type: task.activity_type,
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
          <ActivityIndicator size="large" color={colors.brand600} />
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
              handleGetSuggestions(suggestCategory);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>✨</Text>
            <Text style={styles.actionButtonText}>{t('caregiverApp.carePlan.aiSuggest')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: '#6366F1' }]}
            onPress={() => setShowActivityPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>🧠</Text>
            <Text style={styles.actionButtonText}>{t('caregiverApp.carePlan.addActivity')}</Text>
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
        <View style={styles.daySelectorWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelector}
        >
          {DAY_KEYS.map((key) => {
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
        </View>

        {/* Task List */}
        <ScrollView
          style={styles.taskList}
          contentContainerStyle={styles.taskListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />
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
                        <Text style={styles.categoryIcon}>
                          {task.activity_type ? (getActivityDefinition(task.activity_type)?.emoji ?? category.icon) : category.icon}
                        </Text>
                        <Text style={[styles.categoryText, { color: category.color }]}>
                          {t(`categories.${task.category}`)}
                        </Text>
                      </View>
                      <View style={styles.taskHeaderRight}>
                        {selectedDay === getTodayDayOfWeek() && completions[task.id] && (
                          <View style={styles.completionBadge}>
                            <Text style={styles.completionCheck}>✓</Text>
                          </View>
                        )}
                        <Text style={styles.taskTime}>{formatTime(task.time)}</Text>
                      </View>
                    </View>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.patient_created && (
                      <View style={styles.patientBadge}>
                        <Text style={styles.patientBadgeText}>
                          {t('caregiverApp.carePlan.patientCreated', { name: patient?.name || '' })}
                        </Text>
                      </View>
                    )}
                    {task.hint_text && (
                      <Text style={styles.taskHint} numberOfLines={2}>
                        {task.hint_text}
                      </Text>
                    )}
                    {task.evidence_source && (
                      <Text style={styles.evidenceSourceText} numberOfLines={1}>
                        📖 {task.evidence_source}
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
                placeholderTextColor={colors.textMuted}
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
                placeholderTextColor={colors.textMuted}
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
                placeholderTextColor={colors.textMuted}
                keyboardType="numbers-and-punctuation"
              />

              {/* Task Photo */}
              <Text style={styles.fieldLabel}>{t('caregiverApp.carePlan.taskPhoto')}</Text>
              {formPhotoUrl ? (
                <View style={styles.photoPreviewRow}>
                  <Image source={{ uri: formPhotoUrl }} style={styles.photoPreview} />
                  <TouchableOpacity onPress={() => setFormPhotoUrl(null)} activeOpacity={0.7}>
                    <Text style={styles.removePhotoText}>{t('caregiverApp.carePlan.removePhoto')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleFormPhotoUpload}
                  disabled={isUploadingPhoto}
                  activeOpacity={0.7}
                >
                  {isUploadingPhoto ? (
                    <ActivityIndicator size="small" color={colors.brand600} />
                  ) : (
                    <Text style={styles.uploadButtonText}>{t('caregiverApp.carePlan.uploadPhoto')}</Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Medication Items (only for medication category) */}
              {formCategory === 'medication' && (
                <View>
                  <Text style={styles.fieldLabel}>{t('caregiverApp.carePlan.medicationItems')}</Text>
                  <Text style={styles.medHintText}>{t('caregiverApp.carePlan.medicationItemsHint')}</Text>

                  {formMedItems.map((med, index) => (
                    <View key={index} style={styles.medItemForm}>
                      <View style={styles.medItemHeader}>
                        <Text style={styles.medItemLabel}>
                          {t('caregiverApp.carePlan.medItemLabel', { number: index + 1 })}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setFormMedItems((prev) => prev.filter((_, i) => i !== index))}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.medItemRemoveText}>{t('caregiverApp.carePlan.removeMedication')}</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.medItemRow}>
                        <View style={styles.medItemPhotoCol}>
                          <Text style={styles.medFieldLabel}>{t('caregiverApp.carePlan.medPhotoLabel')}</Text>
                          {med.photo_url ? (
                            <View>
                              <Image source={{ uri: med.photo_url }} style={styles.medItemPhoto} />
                              <TouchableOpacity
                                style={styles.medItemPhotoRemove}
                                onPress={() => {
                                  const items = [...formMedItems];
                                  items[index] = { ...items[index], photo_url: null };
                                  setFormMedItems(items);
                                }}
                              >
                                <Text style={styles.medItemPhotoRemoveText}>x</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.medItemPhotoPlaceholder}
                              onPress={() => handleMedPhotoUpload(index)}
                              disabled={uploadingMedIndex === index}
                              activeOpacity={0.7}
                            >
                              {uploadingMedIndex === index ? (
                                <ActivityIndicator size="small" color={colors.textMuted} />
                              ) : (
                                <Text style={styles.medItemPhotoPlaceholderText}>+</Text>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={styles.medItemInputs}>
                          <Text style={styles.medFieldLabel}>{t('caregiverApp.carePlan.medName')}</Text>
                          <TextInput
                            style={styles.medItemInput}
                            value={med.name}
                            onChangeText={(text) => {
                              const items = [...formMedItems];
                              items[index] = { ...items[index], name: text };
                              setFormMedItems(items);
                            }}
                            placeholder={t('caregiverApp.carePlan.medNamePlaceholder')}
                            placeholderTextColor={colors.textMuted}
                          />
                          <Text style={[styles.medFieldLabel, { marginTop: 8 }]}>{t('caregiverApp.carePlan.medDosage')}</Text>
                          <TextInput
                            style={styles.medItemInput}
                            value={med.dosage}
                            onChangeText={(text) => {
                              const items = [...formMedItems];
                              items[index] = { ...items[index], dosage: text };
                              setFormMedItems(items);
                            }}
                            placeholder={t('caregiverApp.carePlan.medDosagePlaceholder')}
                            placeholderTextColor={colors.textMuted}
                          />
                        </View>
                      </View>
                    </View>
                  ))}

                  {formMedItems.length < 3 ? (
                    <TouchableOpacity
                      style={styles.addMedButton}
                      onPress={() => setFormMedItems((prev) => [...prev, { name: '', dosage: '', photo_url: null }])}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.addMedButtonText}>+ {t('caregiverApp.carePlan.addMedication')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.maxMedText}>{t('caregiverApp.carePlan.maxMedications')}</Text>
                  )}
                </View>
              )}

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
                  {DAY_KEYS.map((key) => (
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

              {/* Date picker for one-time tasks */}
              {formRecurrence === 'one_time' && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.fieldLabel}>{t('caregiverApp.carePlan.oneTimeDate')}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formOneTimeDate}
                    onChangeText={setFormOneTimeDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numbers-and-punctuation"
                  />
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
                    <ActivityIndicator color={colors.textInverse} size="small" />
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

            {/* Category filter + Refresh */}
            <View style={styles.suggestFilterRow}>
              <Text style={styles.suggestFilterLabel}>{t('caregiverApp.carePlan.aiSuggestFocusOn')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestFilterChips}
              >
                <TouchableOpacity
                  style={[
                    styles.suggestFilterChip,
                    suggestCategory === '' && styles.suggestFilterChipSelected,
                  ]}
                  onPress={() => setSuggestCategory('')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.suggestFilterChipText,
                      suggestCategory === '' && styles.suggestFilterChipTextSelected,
                    ]}
                  >
                    {t('caregiverApp.carePlan.allCategories')}
                  </Text>
                </TouchableOpacity>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.suggestFilterChip,
                      suggestCategory === cat.key && { backgroundColor: cat.bg, borderColor: cat.color },
                    ]}
                    onPress={() => setSuggestCategory(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestFilterChipIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.suggestFilterChipText,
                        suggestCategory === cat.key && { color: cat.color },
                      ]}
                    >
                      {t(`categories.${cat.key}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.suggestRefreshButton}
                onPress={() => handleGetSuggestions(suggestCategory)}
                disabled={suggestLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestRefreshText}>{t('caregiverApp.carePlan.aiSuggestRefresh')}</Text>
              </TouchableOpacity>
            </View>

            {suggestLoading ? (
              <View style={styles.suggestLoading}>
                <ActivityIndicator size="large" color={colors.brand600} />
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
                        {suggestion.evidence_source && (
                          <View style={styles.evidenceBadge}>
                            <Text style={styles.evidenceIcon}>📖</Text>
                            <Text style={styles.evidenceText}>{t('caregiverApp.carePlan.evidenceBased')}</Text>
                          </View>
                        )}
                        <View style={styles.suggestionFooter}>
                          <Text style={styles.taskTime}>{formatTime(suggestion.time)}</Text>
                          <TouchableOpacity
                            style={styles.addSuggestionButton}
                            onPress={() => handleAddSuggestion(suggestion)}
                            disabled={addingSuggestion === suggestion.title}
                            activeOpacity={0.7}
                          >
                            {addingSuggestion === suggestion.title ? (
                              <ActivityIndicator color={colors.textInverse} size="small" />
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
              {DAY_KEYS.filter(d => d !== selectedDay).map((key) => (
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
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('caregiverApp.carePlan.copyDay')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Activity Template Picker Modal */}
      <Modal
        visible={showActivityPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowActivityPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowActivityPicker(false)}
          />
          <View style={[styles.modalSheet, { maxHeight: '80%' }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('caregiverApp.carePlan.activityPicker.title')}</Text>
            <Text style={[styles.copyLabel, { marginBottom: 12 }]}>{t('caregiverApp.carePlan.activityPicker.subtitle')}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {getCategoriesForLocale(locale).map((cat) => {
                const activities = getActivitiesForLocale(locale).filter((a) => a.category === cat.category);
                return (
                  <View key={cat.category} style={{ marginBottom: 16 }}>
                    <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>
                      {cat.emoji} {t(cat.titleKey)} ({activities.length})
                    </Text>
                    {activities.map((activity) => (
                      <TouchableOpacity
                        key={activity.type}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 12,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                          marginBottom: 8,
                          backgroundColor: colors.card,
                        }}
                        onPress={() => handleSelectActivity(activity.type)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 28, marginRight: 12 }}>{activity.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontFamily: FONTS.bodySemiBold, color: colors.textPrimary }}>
                            {t(activity.titleKey)}
                          </Text>
                          <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: colors.textSecondary, marginTop: 2 }} numberOfLines={2}>
                            {t(activity.descriptionKey)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
    letterSpacing: -0.3,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // Day Selector
  daySelectorWrap: {
    flexShrink: 0,
  },
  daySelector: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  dayPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minWidth: 54,
    ...SHADOWS.sm,
  },
  dayPillSelected: {
    backgroundColor: colors.brand600,
    borderColor: colors.brand600,
  },
  dayPillToday: {
    borderColor: colors.brand400,
  },
  dayPillText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textSecondary,
  },
  dayPillTextSelected: {
    color: colors.textInverse,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand500,
    marginTop: 4,
  },
  todayDotSelected: {
    backgroundColor: colors.textInverse,
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
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 40,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Task Card
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: colors.border,
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
  taskHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completionBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionCheck: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
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
    color: colors.textSecondary,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  patientBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brand50,
    borderWidth: 1,
    borderColor: colors.brand200,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 4,
  },
  patientBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand600,
  },
  taskHint: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
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
    color: colors.textMuted,
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
    backgroundColor: colors.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  fabText: {
    fontSize: 28,
    color: colors.textInverse,
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
    backgroundColor: colors.card,
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
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    marginBottom: 20,
  },

  // Form fields
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.brand200,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
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
    borderColor: colors.border,
    gap: 6,
  },
  categorySelectorIcon: {
    fontSize: 16,
  },
  categorySelectorText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textSecondary,
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
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  recurrenceOptionSelected: {
    borderColor: colors.brand600,
    backgroundColor: colors.brand50,
  },
  recurrenceOptionText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: colors.textSecondary,
  },
  recurrenceOptionTextSelected: {
    color: colors.brand700,
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
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  dayPickerItemSelected: {
    borderColor: colors.brand600,
    backgroundColor: colors.brand600,
  },
  dayPickerText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textSecondary,
  },
  dayPickerTextSelected: {
    color: colors.textInverse,
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
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.brand600,
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
    color: colors.textInverse,
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
    borderColor: colors.brand200,
    backgroundColor: colors.brand50,
  },
  actionButtonIcon: {
    fontSize: 14,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand700,
  },

  // AI Suggest modal — filter row
  suggestFilterRow: {
    marginBottom: 16,
    gap: 8,
  },
  suggestFilterLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  suggestFilterChips: {
    gap: 6,
    paddingVertical: 2,
  },
  suggestFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  suggestFilterChipSelected: {
    backgroundColor: colors.brand50,
    borderColor: colors.brand600,
  },
  suggestFilterChipIcon: {
    fontSize: 12,
  },
  suggestFilterChipText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textSecondary,
  },
  suggestFilterChipTextSelected: {
    color: colors.brand700,
  },
  suggestRefreshButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.brand200,
    backgroundColor: colors.brand50,
    marginTop: 4,
  },
  suggestRefreshText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand700,
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
    color: colors.textMuted,
  },
  suggestEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  suggestEmptyText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },
  suggestionCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.brand600,
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
    color: colors.textInverse,
  },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  evidenceIcon: {
    fontSize: 11,
  },
  evidenceText: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: colors.brand600,
  },
  evidenceSourceText: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginBottom: 4,
  },

  // Copy Day modal
  copyLabel: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  copyBold: {
    fontWeight: '700',
    color: colors.textPrimary,
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
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  copyDayItemSelected: {
    borderColor: colors.brand600,
    backgroundColor: colors.brand600,
  },
  copyDayText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textSecondary,
  },
  copyDayTextSelected: {
    color: colors.textInverse,
  },
  copyCount: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginBottom: 16,
  },

  // Photo upload
  photoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoPreview: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removePhotoText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#dc2626',
  },
  uploadButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    color: colors.textSecondary,
  },

  // Medication items form
  medHintText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginBottom: 12,
  },
  medItemForm: {
    backgroundColor: colors.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  medItemPhotoCol: {
    flexShrink: 0,
  },
  medItemPhoto: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  medItemPhotoRemove: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medItemPhotoRemoveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  medItemPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medItemPhotoPlaceholderText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  medItemInputs: {
    flex: 1,
    gap: 6,
  },
  medItemInput: {
    borderWidth: 1,
    borderColor: colors.brand200,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    backgroundColor: colors.card,
  },
  medItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  medItemLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  medFieldLabel: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    color: colors.textMuted,
    marginBottom: 4,
  },
  medItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  medItemRemoveText: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: '#dc2626',
  },
  addMedButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.brand200,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  addMedButtonText: {
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand600,
  },
  maxMedText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginTop: 4,
  },
}));
