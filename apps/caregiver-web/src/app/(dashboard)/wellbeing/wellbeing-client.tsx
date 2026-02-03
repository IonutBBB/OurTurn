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
          <p className="text-text-secondary">
            Hi {caregiverName}! Taking care of yourself is just as important as caring for your
            loved one.
          </p>
        </div>
        {showSuccess && (
          <span className="text-sm text-success-600 bg-success-50 px-3 py-1 rounded-full">
            Saved!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Check-in */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Selection */}
          <div className="bg-surface-card rounded-xl border border-surface-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
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
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-surface-border bg-white hover:border-brand-200'
                    }`}
                  >
                    <span className="text-3xl mb-1">{emoji}</span>
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? 'text-brand-700' : 'text-text-secondary'
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
          <div className="bg-surface-card rounded-xl border border-surface-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Self-Care Checklist
              </h2>
              <span className="text-sm text-text-muted">
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
                        ? 'border-success-300 bg-success-50'
                        : 'border-surface-border bg-white hover:border-brand-200'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isChecked
                          ? 'border-success-500 bg-success-500 text-white'
                          : 'border-text-muted'
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
                        isChecked ? 'text-success-700' : 'text-text-primary'
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
          <div className="bg-surface-card rounded-xl border border-surface-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              How are you coping? (Optional)
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write anything on your mind... This is just for you."
              className="w-full px-4 py-3 border border-surface-border rounded-lg bg-white text-text-primary placeholder-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* This Week Stats */}
          <div className="bg-surface-card rounded-xl border border-surface-border p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              This Week
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Average Mood</span>
                <span className="font-semibold text-text-primary">
                  {weeklyStats.averageMood}/5
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Good Self-Care Days</span>
                <span className="font-semibold text-text-primary">
                  {weeklyStats.selfCareDays} of {weeklyStats.loggedDays}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Days Logged</span>
                <span className="font-semibold text-text-primary">{weeklyStats.loggedDays}</span>
              </div>
            </div>
          </div>

          {/* Mood History */}
          <div className="bg-surface-card rounded-xl border border-surface-border p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Mood History
            </h3>
            {recentLogs.length === 0 ? (
              <p className="text-text-muted text-sm">
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
                      className="flex items-center justify-between py-2 border-b border-surface-border last:border-0"
                    >
                      <div>
                        <span className="font-medium text-text-primary">{dayName}</span>
                        <span className="text-text-muted text-sm ml-2">{dateStr}</span>
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
          <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
            <h3 className="text-lg font-semibold text-brand-800 mb-3">
              Need Support?
            </h3>
            <p className="text-brand-700 text-sm mb-4">
              Caregiving is challenging. It&apos;s okay to ask for help.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="https://www.alz.org/help-support/caregiving"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-brand-700 hover:text-brand-800 underline"
              >
                Alzheimer&apos;s Association Resources
              </a>
              <a
                href="https://www.caregiver.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-brand-700 hover:text-brand-800 underline"
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
