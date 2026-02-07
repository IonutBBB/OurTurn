'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { hasReachedTaskLimit } from '@ourturn/shared/utils/subscription';
import { UpgradeBanner } from '@/components/upgrade-gate';
import { FREE_LIMITS } from '@ourturn/shared/utils/subscription';
import { useToast } from '@/components/toast';

interface Task {
  id: string;
  household_id: string;
  category: string;
  title: string;
  hint_text: string | null;
  time: string;
  recurrence: string;
  recurrence_days: string[] | null;
  active: boolean;
  created_at: string;
}

interface SuggestedTask {
  category: string;
  title: string;
  hint_text: string;
  time: string;
  recurrence: 'daily' | 'specific_days' | 'one_time';
}

interface Props {
  householdId: string;
  patientName: string;
  initialTasks: Task[];
  subscriptionStatus: string;
}

const CATEGORIES = [
  { key: 'medication', icon: '💊', color: 'bg-category-medication-bg text-category-medication' },
  { key: 'nutrition', icon: '🥗', color: 'bg-category-nutrition-bg text-category-nutrition' },
  { key: 'physical', icon: '🚶', color: 'bg-category-physical-bg text-category-physical' },
  { key: 'cognitive', icon: '🧩', color: 'bg-category-cognitive-bg text-category-cognitive' },
  { key: 'social', icon: '💬', color: 'bg-category-social-bg text-category-social' },
  { key: 'health', icon: '❤️', color: 'bg-category-health-bg text-category-health' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CarePlanClient({ householdId, patientName, initialTasks, subscriptionStatus }: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showAddForm, setShowAddForm] = useState(false);

  const household = { subscription_status: subscriptionStatus as 'free' | 'plus' | 'cancelled' };
  const taskLimitReached = hasReachedTaskLimit(household, tasks.length);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  // Copy Day state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState('Mon');
  const [copyTargetDays, setCopyTargetDays] = useState<string[]>([]);
  const [copying, setCopying] = useState(false);

  // AI Suggest state
  const [showSuggestPanel, setShowSuggestPanel] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestCategory, setSuggestCategory] = useState<string>('');
  const [addingSuggestion, setAddingSuggestion] = useState<string | null>(null);

  // New task form state
  const [newTask, setNewTask] = useState({
    category: 'medication',
    title: '',
    hint_text: '',
    time: '09:00',
    recurrence: 'daily',
    recurrence_days: [] as string[],
  });

  const resetForm = () => {
    setNewTask({
      category: 'medication',
      title: '',
      hint_text: '',
      time: '09:00',
      recurrence: 'daily',
      recurrence_days: [],
    });
    setShowAddForm(false);
    setEditingTask(null);
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('care_plan_tasks')
        .insert({
          household_id: householdId,
          category: newTask.category,
          title: newTask.title.trim(),
          hint_text: newTask.hint_text.trim() || null,
          time: newTask.time,
          recurrence: newTask.recurrence,
          recurrence_days: newTask.recurrence === 'specific_days' ? newTask.recurrence_days : null,
          active: true,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTasks((prev) => [...prev, data].sort((a, b) => a.time.localeCompare(b.time)));
      resetForm();
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !newTask.title.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('care_plan_tasks')
        .update({
          category: newTask.category,
          title: newTask.title.trim(),
          hint_text: newTask.hint_text.trim() || null,
          time: newTask.time,
          recurrence: newTask.recurrence,
          recurrence_days: newTask.recurrence === 'specific_days' ? newTask.recurrence_days : null,
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      setTasks((prev) =>
        prev
          .map((t) =>
            t.id === editingTask.id
              ? {
                  ...t,
                  category: newTask.category,
                  title: newTask.title.trim(),
                  hint_text: newTask.hint_text.trim() || null,
                  time: newTask.time,
                  recurrence: newTask.recurrence,
                  recurrence_days:
                    newTask.recurrence === 'specific_days' ? newTask.recurrence_days : null,
                }
              : t
          )
          .sort((a, b) => a.time.localeCompare(b.time))
      );
      resetForm();
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm(t('caregiverApp.carePlan.deleteConfirm'))) return;

    try {
      const { error } = await supabase
        .from('care_plan_tasks')
        .update({ active: false })
        .eq('id', taskId);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      showToast(t('common.error'), 'error');
    }
  };

  // AI Suggest functions
  const handleGetSuggestions = async () => {
    setSuggestLoading(true);
    setSuggestedTasks([]);

    try {
      const response = await fetch('/api/ai/suggest-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          householdId,
          category: suggestCategory || undefined,
          count: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestedTasks(data.suggestions || []);
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleAddSuggestion = async (suggestion: SuggestedTask) => {
    setAddingSuggestion(suggestion.title);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('care_plan_tasks')
        .insert({
          household_id: householdId,
          category: suggestion.category,
          title: suggestion.title,
          hint_text: suggestion.hint_text,
          time: suggestion.time,
          recurrence: suggestion.recurrence,
          recurrence_days: null,
          active: true,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTasks((prev) => [...prev, data].sort((a, b) => a.time.localeCompare(b.time)));
      // Remove from suggestions
      setSuggestedTasks((prev) => prev.filter((s) => s.title !== suggestion.title));
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setAddingSuggestion(null);
    }
  };

  const handleCopyDay = async () => {
    if (copyTargetDays.length === 0) return;

    setCopying(true);
    try {
      const sourceTasks = tasks.filter((task) => {
        if (task.recurrence === 'daily') return true;
        if (task.recurrence === 'specific_days') {
          return task.recurrence_days?.includes(copySourceDay);
        }
        return false;
      });

      if (sourceTasks.length === 0) {
        alert(t('caregiverApp.carePlan.noTasksForDay'));
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const newTasks = copyTargetDays.flatMap((targetDay) =>
        sourceTasks.map((task) => ({
          household_id: householdId,
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

      setTasks((prev) => [...prev, ...(data || [])].sort((a, b) => a.time.localeCompare(b.time)));
      setShowCopyModal(false);
      setCopyTargetDays([]);
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setCopying(false);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      category: task.category,
      title: task.title,
      hint_text: task.hint_text || '',
      time: task.time,
      recurrence: task.recurrence,
      recurrence_days: task.recurrence_days || [],
    });
    setShowAddForm(true);
  };

  const getCategoryInfo = (key: string) => {
    return CATEGORIES.find((c) => c.key === key) || CATEGORIES[0];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">
            {t('caregiverApp.carePlan.title', { name: patientName })}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {t('caregiverApp.carePlan.syncNote', { name: patientName })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCopyModal(true)}
            className="px-4 py-2 border border-surface-border rounded-2xl text-text-primary hover:bg-brand-50 dark:hover:bg-surface-elevated transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
              <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
            </svg>
            {t('caregiverApp.carePlan.copyDay')}
          </button>
          <button
            onClick={() => {
              setShowSuggestPanel(!showSuggestPanel);
              if (!showSuggestPanel && suggestedTasks.length === 0) {
                handleGetSuggestions();
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-2xl transition-all flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
                clipRule="evenodd"
              />
              <path d="M5.26 17.242a.75.75 0 10-.897-1.203 5.243 5.243 0 00-2.05 5.022.75.75 0 00.625.627 5.243 5.243 0 005.022-2.051.75.75 0 10-1.202-.897 3.744 3.744 0 01-3.008 1.51c0-1.23.592-2.323 1.51-3.008z" />
            </svg>
            {t('caregiverApp.carePlan.aiSuggest')}
          </button>
          <button
            onClick={() => {
              if (taskLimitReached) return;
              resetForm();
              setShowAddForm(true);
            }}
            disabled={taskLimitReached}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + {t('caregiverApp.carePlan.addTask')}
          </button>
        </div>
      </div>

      {taskLimitReached && (
        <UpgradeBanner message={t('subscription.limits.taskLimitReached', { max: FREE_LIMITS.maxTasks })} />
      )}

      {/* AI Suggest Panel */}
      {showSuggestPanel && (
        <div className="card-accent p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">{t('caregiverApp.carePlan.aiSuggestTitle')}</h3>
                <p className="text-sm text-text-muted">
                  {t('caregiverApp.carePlan.aiSuggestDesc', { name: patientName })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuggestPanel(false)}
              className="text-text-muted hover:text-text-secondary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm font-medium text-text-secondary">{t('caregiverApp.carePlan.aiSuggestFocusOn')}</label>
            <select
              value={suggestCategory}
              onChange={(e) => setSuggestCategory(e.target.value)}
              className="px-3 py-1.5 text-sm border border-brand-200 dark:border-brand-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface-card text-text-primary"
            >
              <option value="">{t('caregiverApp.carePlan.aiSuggestAllCategories')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.icon} {t(`categories.${cat.key}`)}
                </option>
              ))}
            </select>
            <button
              onClick={handleGetSuggestions}
              disabled={suggestLoading}
              className="px-3 py-1.5 text-sm bg-surface-card border border-brand-200 dark:border-brand-700 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors disabled:opacity-50 text-text-primary"
            >
              {suggestLoading ? t('caregiverApp.carePlan.aiSuggestGenerating') : t('caregiverApp.carePlan.aiSuggestRefresh')}
            </button>
          </div>

          {/* Suggestions list */}
          {suggestLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-brand-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-brand-600 font-medium">
                  {t('caregiverApp.carePlan.aiSuggestThinking', { name: patientName })}
                </span>
              </div>
            </div>
          ) : suggestedTasks.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <p>{t('caregiverApp.carePlan.aiSuggestEmpty')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedTasks.map((suggestion, index) => {
                const category = getCategoryInfo(suggestion.category);
                return (
                  <div
                    key={index}
                    className="card-paper p-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${category.color}`}
                        >
                          {category.icon} {t(`categories.${suggestion.category}`)}
                        </span>
                        <span className="text-sm text-text-muted">
                          {formatTime(suggestion.time)}
                        </span>
                      </div>
                      <h4 className="font-medium text-text-primary mb-1">{suggestion.title}</h4>
                      <p className="text-sm text-text-secondary">{suggestion.hint_text}</p>
                    </div>
                    <button
                      onClick={() => handleAddSuggestion(suggestion)}
                      disabled={addingSuggestion === suggestion.title}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-2xl transition-colors disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                    >
                      {addingSuggestion === suggestion.title ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t('caregiverApp.carePlan.aiSuggestAdding')}
                        </>
                      ) : (
                        <>+ {t('caregiverApp.carePlan.aiSuggestAdd')}</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Task Form */}
      {showAddForm && (
        <div className="card-paper p-6 mb-6">
          <h2 className="text-lg font-display font-bold text-text-primary mb-4">
            {editingTask ? t('caregiverApp.carePlan.editTask') : t('caregiverApp.carePlan.addTask')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('caregiverApp.carePlan.category')}
              </label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className="input-warm w-full"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.icon} {t(`categories.${cat.key}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('caregiverApp.carePlan.time')}
              </label>
              <input
                type="time"
                value={newTask.time}
                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                className="input-warm w-full"
              />
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('caregiverApp.carePlan.taskTitle')} *
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder={t('caregiverApp.carePlan.taskPlaceholder')}
                className="input-warm w-full"
              />
            </div>

            {/* Instructions/Hint */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('caregiverApp.carePlan.hintLabel', { name: patientName })}
              </label>
              <textarea
                value={newTask.hint_text}
                onChange={(e) => setNewTask({ ...newTask, hint_text: e.target.value })}
                placeholder={t('caregiverApp.carePlan.hintPlaceholder')}
                rows={2}
                className="input-warm w-full"
              />
            </div>

            {/* Recurrence */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('caregiverApp.carePlan.recurrence')}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recurrence"
                    value="daily"
                    checked={newTask.recurrence === 'daily'}
                    onChange={(e) => setNewTask({ ...newTask, recurrence: e.target.value })}
                    className="text-brand-600"
                  />
                  <span className="text-sm">{t('caregiverApp.carePlan.daily')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recurrence"
                    value="specific_days"
                    checked={newTask.recurrence === 'specific_days'}
                    onChange={(e) => setNewTask({ ...newTask, recurrence: e.target.value })}
                    className="text-brand-600"
                  />
                  <span className="text-sm">{t('caregiverApp.carePlan.specificDays')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recurrence"
                    value="one_time"
                    checked={newTask.recurrence === 'one_time'}
                    onChange={(e) => setNewTask({ ...newTask, recurrence: e.target.value })}
                    className="text-brand-600"
                  />
                  <span className="text-sm">{t('caregiverApp.carePlan.oneTime')}</span>
                </label>
              </div>

              {/* Day selector for specific days */}
              {newTask.recurrence === 'specific_days' && (
                <div className="flex gap-2 mt-3">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const days = newTask.recurrence_days.includes(day)
                          ? newTask.recurrence_days.filter((d) => d !== day)
                          : [...newTask.recurrence_days, day];
                        setNewTask({ ...newTask, recurrence_days: days });
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        newTask.recurrence_days.includes(day)
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-surface-card dark:bg-surface-elevated text-text-secondary border-surface-border hover:border-brand-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-surface-border rounded-2xl text-text-primary hover:bg-brand-50 dark:hover:bg-surface-elevated transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={editingTask ? handleUpdateTask : handleAddTask}
              disabled={saving || !newTask.title.trim()}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? t('common.loading') : editingTask ? t('common.save') : t('caregiverApp.carePlan.addTask')}
            </button>
          </div>
        </div>
      )}

      {/* Copy Day Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-paper p-6 w-full max-w-md">
            <h2 className="text-xl font-display font-bold text-text-primary mb-4">
              {t('caregiverApp.carePlan.copyDay')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  {t('caregiverApp.carePlan.copyFrom')}
                </label>
                <div className="flex gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setCopySourceDay(day)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        copySourceDay === day
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-surface-card dark:bg-surface-elevated text-text-secondary border-surface-border hover:border-brand-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  {t('caregiverApp.carePlan.copyTo')}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.filter((d) => d !== copySourceDay).map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setCopyTargetDays((prev) =>
                          prev.includes(day)
                            ? prev.filter((d) => d !== day)
                            : [...prev, day]
                        );
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        copyTargetDays.includes(day)
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-surface-card dark:bg-surface-elevated text-text-secondary border-surface-border hover:border-brand-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowCopyModal(false);
                  setCopyTargetDays([]);
                }}
                className="btn-secondary flex-1"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleCopyDay}
                disabled={copying || copyTargetDays.length === 0}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {copying ? t('common.loading') : t('caregiverApp.carePlan.copyToDays', { count: copyTargetDays.length })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      {tasks.length === 0 ? (
        <div className="card-paper p-12 text-center">
          <p className="text-text-muted">{t('caregiverApp.carePlan.noTasks')}</p>
        </div>
      ) : (
        <div className="card-paper overflow-hidden">
          <table className="w-full">
            <thead className="card-inset rounded-2xl border-b border-surface-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  {t('caregiverApp.carePlan.time')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  {t('caregiverApp.carePlan.category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  {t('caregiverApp.carePlan.taskTitle')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  {t('caregiverApp.carePlan.instructions')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  {t('caregiverApp.carePlan.recurrence')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">
                  {t('caregiverApp.carePlan.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {tasks.map((task) => {
                const category = getCategoryInfo(task.category);
                return (
                  <tr key={task.id} className="hover:bg-brand-50 dark:hover:bg-surface-elevated">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-text-primary">{formatTime(task.time)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm ${category.color}`}>
                        {category.icon} {t(`categories.${task.category}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-primary">{task.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-secondary text-sm">
                        {task.hint_text || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-secondary text-sm">
                        {task.recurrence === 'daily' && t('caregiverApp.carePlan.daily')}
                        {task.recurrence === 'specific_days' && task.recurrence_days?.join(', ')}
                        {task.recurrence === 'one_time' && t('caregiverApp.carePlan.oneTime')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => startEditing(task)}
                        className="text-brand-600 hover:text-brand-700 text-sm font-medium mr-4"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-status-danger hover:text-status-danger text-sm font-medium"
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
