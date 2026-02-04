'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type {
  CaregiverWellbeingLog,
  WellbeingMood,
  SelfCareChecklist,
} from '@memoguard/shared';
import {
  CAREGIVER_MOOD_LABELS,
  SELF_CARE_ITEMS,
} from '@memoguard/shared';

interface WellbeingClientProps {
  caregiverId: string;
  caregiverName: string;
  initialLog?: CaregiverWellbeingLog | null;
  recentLogs: CaregiverWellbeingLog[];
}

export default function WellbeingClient({
  caregiverId,
  caregiverName,
  initialLog,
  recentLogs,
}: WellbeingClientProps) {
  const supabase = createBrowserClient();
  const [todayLog, setTodayLog] = useState<CaregiverWellbeingLog | null>(initialLog || null);
  const [mood, setMood] = useState<WellbeingMood | null>(initialLog?.mood || null);
  const [selfCare, setSelfCare] = useState<SelfCareChecklist>(
    initialLog?.self_care_checklist || {}
  );
  const [notes, setNotes] = useState(initialLog?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Save changes
  const saveLog = useCallback(async () => {
    if (mood === null) return;

    setIsSaving(true);
    try {
      if (todayLog) {
        // Update existing
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
        // Insert new
        const { data, error } = await supabase
          .from('caregiver_wellbeing_logs')
          .insert({
            caregiver_id: caregiverId,
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

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save wellbeing log:', err);
    } finally {
      setIsSaving(false);
    }
  }, [mood, selfCare, notes, todayLog, caregiverId, today, supabase]);

  // Auto-save when data changes
  useEffect(() => {
    if (mood !== null) {
      const timeout = setTimeout(saveLog, 1000);
      return () => clearTimeout(timeout);
    }
  }, [mood, selfCare, notes, saveLog]);

  const toggleSelfCareItem = (key: keyof SelfCareChecklist) => {
    setSelfCare((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Calculate weekly stats
  const weeklyStats = {
    averageMood:
      recentLogs.length > 0
        ? (
            recentLogs.reduce((sum, log) => sum + (log.mood || 0), 0) / recentLogs.length
          ).toFixed(1)
        : 'N/A',
    selfCareDays: recentLogs.filter((log) => {
      const checklist = log.self_care_checklist || {};
      return Object.values(checklist).filter(Boolean).length >= 3;
    }).length,
    loggedDays: recentLogs.length,
  };

  const checkedCount = Object.values(selfCare).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-300">
            Hi {caregiverName}! Taking care of yourself is just as important as caring for your
            loved one.
          </p>
        </div>
        {showSuccess && (
          <span className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
            Saved!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Check-in */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Selection */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              How are you feeling today?
            </h2>
            <div className="flex flex-wrap gap-3">
              {([5, 4, 3, 2, 1] as WellbeingMood[]).map((value) => {
                const { emoji, label } = CAREGIVER_MOOD_LABELS[value];
                const isSelected = mood === value;
                return (
                  <button
                    key={value}
                    onClick={() => setMood(value)}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-teal-300 dark:hover:border-teal-700'
                    }`}
                  >
                    <span className="text-3xl mb-1">{emoji}</span>
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? 'text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Self-Care Checklist */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Self-Care Checklist
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {checkedCount} of {SELF_CARE_ITEMS.length} done
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SELF_CARE_ITEMS.map(({ key, label }) => {
                const isChecked = selfCare[key] || false;
                return (
                  <button
                    key={key}
                    onClick={() => toggleSelfCareItem(key)}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
                      isChecked
                        ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/30'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-teal-300 dark:hover:border-teal-700'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isChecked
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-400 dark:border-gray-500'
                      }`}
                    >
                      {isChecked && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      className={`font-medium ${
                        isChecked ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              How are you coping? (Optional)
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write anything on your mind... This is just for you."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* This Week Stats */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              This Week
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Average Mood</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {weeklyStats.averageMood}/5
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Good Self-Care Days</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {weeklyStats.selfCareDays} of {weeklyStats.loggedDays}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Days Logged</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{weeklyStats.loggedDays}</span>
              </div>
            </div>
          </div>

          {/* Mood History */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Mood History
            </h3>
            {recentLogs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Start tracking your mood to see your history here.
              </p>
            ) : (
              <div className="space-y-3">
                {recentLogs.slice(0, 7).map((log) => {
                  const moodInfo = log.mood ? CAREGIVER_MOOD_LABELS[log.mood] : null;
                  const date = new Date(log.date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dateStr = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{dayName}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">{dateStr}</span>
                      </div>
                      {moodInfo && (
                        <span className="text-lg" title={moodInfo.label}>
                          {moodInfo.emoji}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Support Resources */}
          <div className="bg-teal-50 dark:bg-teal-900/30 rounded-xl border border-teal-200 dark:border-teal-800 p-6">
            <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 mb-3">
              Need Support?
            </h3>
            <p className="text-teal-700 dark:text-teal-300 text-sm mb-4">
              Caregiving is challenging. It&apos;s okay to ask for help.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="https://www.alz.org/help-support/caregiving"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 underline"
              >
                Alzheimer&apos;s Association Resources
              </a>
              <a
                href="https://www.caregiver.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 underline"
              >
                Family Caregiver Alliance
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
