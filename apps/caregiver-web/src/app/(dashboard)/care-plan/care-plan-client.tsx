'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';

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
}

const CATEGORIES = [
  { key: 'medication', icon: '💊', color: 'bg-purple-100 text-purple-700' },
  { key: 'nutrition', icon: '🥗', color: 'bg-green-100 text-green-700' },
  { key: 'physical', icon: '🚶', color: 'bg-orange-100 text-orange-700' },
  { key: 'cognitive', icon: '🧩', color: 'bg-blue-100 text-blue-700' },
  { key: 'social', icon: '💬', color: 'bg-pink-100 text-pink-700' },
  { key: 'health', icon: '❤️', color: 'bg-red-100 text-red-700' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CarePlanClient({ householdId, patientName, initialTasks }: Props) {
  const { t } = useTranslation();
  const supabase = createBrowserClient();

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

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
      console.error('Failed to add task:', err);
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
      console.error('Failed to update task:', err);
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
      console.error('Failed to delete task:', err);
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
          count: 3,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestedTasks(data.suggestions || []);
    } catch (err) {
      console.error('Failed to get AI suggestions:', err);
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
      console.error('Failed to add suggested task:', err);
    } finally {
      setAddingSuggestion(null);
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
          <h1 className="text-2xl font-bold text-text-primary">
            {patientName}&apos;s Daily Plan
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {t('caregiverApp.carePlan.syncNote', { name: patientName })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowSuggestPanel(!showSuggestPanel);
              if (!showSuggestPanel && suggestedTasks.length === 0) {
                handleGetSuggestions();
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
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
            AI Suggest
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors"
          >
            + {t('caregiverApp.carePlan.addTask')}
          </button>
        </div>
      </div>

      {/* AI Suggest Panel */}
      {showSuggestPanel && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
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
                <h3 className="font-semibold text-text-primary">AI Task Suggestions</h3>
                <p className="text-sm text-text-muted">
                  Personalized suggestions based on {patientName}&apos;s profile
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuggestPanel(false)}
              className="text-gray-400 hover:text-gray-600"
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
            <label className="text-sm font-medium text-text-secondary">Focus on:</label>
            <select
              value={suggestCategory}
              onChange={(e) => setSuggestCategory(e.target.value)}
              className="px-3 py-1.5 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.icon} {t(`categories.${cat.key}`)}
                </option>
              ))}
            </select>
            <button
              onClick={handleGetSuggestions}
              disabled={suggestLoading}
              className="px-3 py-1.5 text-sm bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              {suggestLoading ? 'Generating...' : 'Refresh'}
            </button>
          </div>

          {/* Suggestions list */}
          {suggestLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-purple-600"
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
                <span className="text-purple-600 font-medium">
                  AI is thinking about {patientName}&apos;s routine...
                </span>
              </div>
            </div>
          ) : suggestedTasks.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <p>No suggestions available. Try refreshing or selecting a different category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedTasks.map((suggestion, index) => {
                const category = getCategoryInfo(suggestion.category);
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-purple-100 p-4 flex items-start justify-between gap-4"
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
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
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
                          Adding...
                        </>
                      ) : (
                        <>+ Add</>
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
        <div className="bg-surface-card rounded-xl border border-surface-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {editingTask ? 'Edit Task' : t('caregiverApp.carePlan.addTask')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('caregiverApp.carePlan.category')}
              </label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className="w-full px-4 py-2 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
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
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('caregiverApp.carePlan.time')}
              </label>
              <input
                type="time"
                value={newTask.time}
                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                className="w-full px-4 py-2 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('caregiverApp.carePlan.taskTitle')} *
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Morning medication"
                className="w-full px-4 py-2 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Instructions/Hint */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('caregiverApp.carePlan.hintLabel', { name: patientName })}
              </label>
              <textarea
                value={newTask.hint_text}
                onChange={(e) => setNewTask({ ...newTask, hint_text: e.target.value })}
                placeholder={t('caregiverApp.carePlan.hintPlaceholder')}
                rows={2}
                className="w-full px-4 py-2 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Recurrence */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
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
                          : 'bg-white text-text-secondary border-surface-border hover:border-brand-300'
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
              className="px-4 py-2 border border-surface-border rounded-lg text-text-primary hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={editingTask ? handleUpdateTask : handleAddTask}
              disabled={saving || !newTask.title.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? t('common.loading') : editingTask ? t('common.save') : t('caregiverApp.carePlan.addTask')}
            </button>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      {tasks.length === 0 ? (
        <div className="bg-surface-card rounded-xl border border-surface-border p-12 text-center">
          <p className="text-text-muted">{t('caregiverApp.carePlan.noTasks')}</p>
        </div>
      ) : (
        <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-surface-border">
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
                  <tr key={task.id} className="hover:bg-gray-50">
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
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
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
