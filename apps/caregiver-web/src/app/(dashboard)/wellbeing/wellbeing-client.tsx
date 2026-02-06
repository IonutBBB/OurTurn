'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import type {
  CaregiverWellbeingLog,
  WellbeingMood,
  SelfCareChecklist,
} from '@ourturn/shared';
import {
  CAREGIVER_MOOD_LABELS,
  SELF_CARE_ITEMS,
} from '@ourturn/shared';

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
  const { t } = useTranslation();
  const supabase = createBrowserClient();
  const [todayLog, setTodayLog] = useState<CaregiverWellbeingLog | null>(initialLog || null);
  const [mood, setMood] = useState<WellbeingMood | null>(initialLog?.mood || null);
  const [selfCare, setSelfCare] = useState<SelfCareChecklist>(
    initialLog?.self_care_checklist || {}
  );
  const [notes, setNotes] = useState(initialLog?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Use ref to track todayLog without causing re-renders in useCallback
  const todayLogRef = useRef<CaregiverWellbeingLog | null>(todayLog);
  useEffect(() => {
    todayLogRef.current = todayLog;
  }, [todayLog]);

  const today = new Date().toISOString().split('T')[0];

  // Save changes - use ref for todayLog to avoid infinite loop
  const saveLog = useCallback(async () => {
    if (mood === null) return;

    setIsSaving(true);
    try {
      if (todayLogRef.current) {
        // Update existing
        const { data, error } = await supabase
          .from('caregiver_wellbeing_logs')
          .update({
            mood,
            self_care_checklist: selfCare,
            notes: notes || null,
          })
          .eq('id', todayLogRef.current.id)
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
      // Failed to save wellbeing log
    } finally {
      setIsSaving(false);
    }
  }, [mood, selfCare, notes, caregiverId, today, supabase]);

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

  // Burnout detection: mood <= 2 for 3+ consecutive days
  const showBurnoutWarning = (() => {
    if (recentLogs.length < 3) return false;
    const sortedLogs = [...recentLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const recentThree = sortedLogs.slice(0, 3);
    return recentThree.every((log) => log.mood !== null && log.mood <= 2);
  })();

  return (
    <div className="space-y-6">
      {/* Burnout Warning Banner */}
      {showBurnoutWarning && (
        <div className="bg-status-amber-bg border border-status-amber/30 rounded-[20px] p-5 flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">💛</span>
          <div className="flex-1">
            <h3 className="font-semibold text-status-amber mb-1">
              {t('caregiverApp.wellbeing.burnoutNotice')}
            </h3>
            <p className="text-sm text-text-secondary">
              {t('caregiverApp.wellbeing.burnoutWarning')}
            </p>
            <div className="flex gap-3 mt-3">
              <a href="/coach" className="btn-primary text-sm px-4 py-2">
                {t('caregiverApp.wellbeing.talkToCoach')}
              </a>
              <a href="#support-resources" className="btn-secondary text-sm px-4 py-2">
                {t('caregiverApp.wellbeing.supportResources')}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary">
            {t('caregiverApp.wellbeing.introMessage', { name: caregiverName })}
          </p>
        </div>
        {showSuccess && (
          <span className="text-sm text-status-success bg-status-success-bg px-3 py-1 rounded-full">
            {t('common.saved')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Check-in */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Selection */}
          <div className="card-paper p-6">
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              {t('caregiverApp.wellbeing.howAreYouFeeling')}
            </h2>
            <div className="flex flex-wrap gap-3">
              {([5, 4, 3, 2, 1] as WellbeingMood[]).map((value) => {
                const { emoji, label } = CAREGIVER_MOOD_LABELS[value];
                const isSelected = mood === value;
                return (
                  <button
                    key={value}
                    onClick={() => setMood(value)}
                    className={`flex flex-col items-center p-4 rounded-[20px] border-2 transition-all ${
                      isSelected
                        ? 'border-brand-600 dark:border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                        : 'border-surface-border bg-surface-card dark:bg-surface-elevated hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    <span className="text-3xl mb-1">{emoji}</span>
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-text-secondary'
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
          <div className="card-paper p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">
                {t('caregiverApp.wellbeing.selfCareChecklist')}
              </h2>
              <span className="text-sm text-text-muted">
                {t('caregiverApp.wellbeing.selfCareProgress', { done: checkedCount, total: SELF_CARE_ITEMS.length })}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SELF_CARE_ITEMS.map(({ key, label }) => {
                const isChecked = selfCare[key] || false;
                return (
                  <button
                    key={key}
                    onClick={() => toggleSelfCareItem(key)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                      isChecked
                        ? 'border-status-success bg-status-success-bg'
                        : 'border-surface-border bg-surface-card dark:bg-surface-elevated hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isChecked
                          ? 'border-status-success bg-status-success text-white'
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
                        isChecked ? 'text-status-success' : 'text-text-primary'
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
          <div className="card-paper p-6">
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              {t('caregiverApp.wellbeing.copingNotes')}
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('caregiverApp.wellbeing.copingPlaceholder')}
              className="input-warm w-full resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* This Week Stats */}
          <div className="card-paper p-6">
            <h3 className="text-lg font-display font-bold text-text-primary mb-4">
              {t('caregiverApp.wellbeing.thisWeek')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{t('caregiverApp.wellbeing.averageMood')}</span>
                <span className="font-semibold text-text-primary">
                  {weeklyStats.averageMood}/5
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{t('caregiverApp.wellbeing.goodSelfCareDays')}</span>
                <span className="font-semibold text-text-primary">
                  {t('caregiverApp.wellbeing.selfCareDaysOf', { done: weeklyStats.selfCareDays, total: weeklyStats.loggedDays })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{t('caregiverApp.wellbeing.daysLogged')}</span>
                <span className="font-semibold text-text-primary">{weeklyStats.loggedDays}</span>
              </div>
            </div>
          </div>

          {/* Mood History */}
          <div className="card-paper p-6">
            <h3 className="text-lg font-display font-bold text-text-primary mb-4">
              {t('caregiverApp.wellbeing.moodHistory')}
            </h3>
            {recentLogs.length === 0 ? (
              <p className="text-text-muted text-sm">
                {t('caregiverApp.wellbeing.moodHistoryEmpty')}
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
          <div id="support-resources" className="bg-brand-50 dark:bg-brand-900/30 rounded-[20px] border border-brand-200 dark:border-brand-800 p-6">
            <h3 className="text-lg font-semibold text-brand-800 dark:text-brand-200 mb-3">
              {t('caregiverApp.wellbeing.needSupport')}
            </h3>
            <p className="text-brand-700 dark:text-brand-300 text-sm mb-4">
              {t('caregiverApp.wellbeing.needSupportDesc')}
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="https://www.alz.org/help-support/caregiving"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-200 underline"
              >
                {t('caregiverApp.wellbeing.alzheimersResources')}
              </a>
              <a
                href="https://www.caregiver.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-200 underline"
              >
                {t('caregiverApp.wellbeing.familyCaregiverAlliance')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Inspirational Quote */}
      <div className="card-inset p-6 text-center">
        <p className="text-text-secondary italic text-sm leading-relaxed">
          {t('caregiverApp.wellbeing.selfCareReminder')}
        </p>
      </div>
    </div>
  );
}
