'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import type { CaregiverWellbeingLog } from '@ourturn/shared';

interface DailyGoalProps {
  caregiverId: string;
  initialLog: CaregiverWellbeingLog | null;
  recentLogs: CaregiverWellbeingLog[];
}

export function DailyGoal({ caregiverId, initialLog, recentLogs }: DailyGoalProps) {
  const { t } = useTranslation();
  const supabase = createBrowserClient();
  const today = new Date().toISOString().split('T')[0];

  const [goal, setGoal] = useState(initialLog?.daily_goal || '');
  const [goalCompleted, setGoalCompleted] = useState(initialLog?.goal_completed || false);
  const logRef = useRef(initialLog);

  useEffect(() => { logRef.current = initialLog; }, [initialLog]);

  // Last 7 days goal completion dots
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = recentLogs.find((l) => l.date === dateStr);
    return {
      date: dateStr,
      day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      hasGoal: !!log?.daily_goal,
      completed: !!log?.goal_completed,
    };
  });

  const save = useCallback(async (newGoal: string, completed: boolean) => {
    try {
      await supabase
        .from('caregiver_wellbeing_logs')
        .upsert(
          {
            caregiver_id: caregiverId,
            date: today,
            daily_goal: newGoal || null,
            goal_completed: completed,
          },
          { onConflict: 'caregiver_id,date' }
        );
    } catch {
      // Silent fail for auto-save
    }
  }, [caregiverId, today, supabase]);

  // Debounced auto-save for goal text
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (goal !== (initialLog?.daily_goal || '')) {
        save(goal, goalCompleted);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [goal, goalCompleted, save, initialLog?.daily_goal]);

  const toggleComplete = () => {
    const newCompleted = !goalCompleted;
    setGoalCompleted(newCompleted);
    save(goal, newCompleted);
  };

  return (
    <div className="card-paper p-5">
      <h3 className="text-sm font-display font-bold text-text-primary mb-3">
        {t('caregiverApp.toolkit.goal.title')}
      </h3>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder={t('caregiverApp.toolkit.goal.placeholder')}
          className="input-warm flex-1 text-sm py-2"
        />
        {goal && (
          <button
            onClick={toggleComplete}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              goalCompleted
                ? 'bg-status-success text-white'
                : 'bg-surface-border/50 text-text-muted hover:bg-brand-50 hover:text-brand-600'
            }`}
          >
            {goalCompleted ? '✓' : t('caregiverApp.toolkit.goal.done')}
          </button>
        )}
      </div>

      {/* Weekly completion dots */}
      <div>
        <p className="text-xs text-text-muted mb-2">{t('caregiverApp.toolkit.goal.weekLabel')}</p>
        <div className="flex gap-2">
          {last7Days.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <div
                className={`w-5 h-5 rounded-full ${
                  day.completed
                    ? 'bg-status-success'
                    : day.hasGoal
                      ? 'bg-status-amber/40'
                      : 'bg-surface-border'
                }`}
              />
              <span className="text-[10px] text-text-muted">{day.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
