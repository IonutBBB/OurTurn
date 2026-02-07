'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import type { CaregiverWellbeingLog, SliderValue, HelpRequest as HelpRequestType } from '@ourturn/shared';

import { SliderCheckin } from './components/slider-checkin';
import { QuickRelief } from './components/quick-relief';
import { HelpRequest } from './components/help-request';
import { WellbeingAgent } from './components/wellbeing-agent';
import { DailyGoal } from './components/daily-goal';
import { WeeklyInsights } from './components/weekly-insights';
import { BurnoutBanner } from './components/burnout-banner';
import { NeedSupport } from './components/need-support';

interface ToolkitClientProps {
  caregiverId: string;
  caregiverName: string;
  householdId: string;
  initialLog: CaregiverWellbeingLog | null;
  recentLogs: CaregiverWellbeingLog[];
  helpRequests: HelpRequestType[];
  showBurnoutWarning: boolean;
  trend: { date: string; energy: number | null; stress: number | null; sleep: number | null }[];
}

export default function ToolkitClient({
  caregiverId,
  caregiverName,
  householdId,
  initialLog,
  recentLogs,
  helpRequests,
  showBurnoutWarning,
  trend,
}: ToolkitClientProps) {
  const { t } = useTranslation();
  const supabase = createBrowserClient();
  const today = new Date().toISOString().split('T')[0];

  const [currentLog, setCurrentLog] = useState<CaregiverWellbeingLog | null>(initialLog);

  const handleLogUpdated = useCallback((log: CaregiverWellbeingLog) => {
    setCurrentLog(log);
  }, []);

  const handleExerciseComplete = useCallback(async (exerciseId: string) => {
    try {
      const existingExercises = currentLog?.relief_exercises_used || [];
      const updated = [...new Set([...existingExercises, exerciseId])];

      await supabase
        .from('caregiver_wellbeing_logs')
        .upsert(
          {
            caregiver_id: caregiverId,
            date: today,
            relief_exercises_used: updated,
          },
          { onConflict: 'caregiver_id,date' }
        );

      setCurrentLog((prev) => prev ? { ...prev, relief_exercises_used: updated } : prev);
    } catch {
      // Silent — exercise already logged in player
    }
  }, [caregiverId, today, currentLog, supabase]);

  return (
    <div className="space-y-6">
      {/* Burnout Warning Banner */}
      <BurnoutBanner visible={showBurnoutWarning} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-text-secondary">
          {t('caregiverApp.toolkit.introMessage', { name: caregiverName })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slider Check-in */}
          <SliderCheckin
            caregiverId={caregiverId}
            initialLog={currentLog}
            recentLogs={recentLogs}
            onLogUpdated={handleLogUpdated}
          />

          {/* Quick Relief Station */}
          <div id="quick-relief">
          <QuickRelief
            stress={currentLog?.stress_level as SliderValue | null}
            energy={currentLog?.energy_level as SliderValue | null}
            sleep={currentLog?.sleep_quality_rating as SliderValue | null}
            onExerciseComplete={handleExerciseComplete}
          />
          </div>

          {/* Ask for Help */}
          <div id="help-request">
          <HelpRequest
            caregiverId={caregiverId}
            householdId={householdId}
            initialRequests={helpRequests}
          />
          </div>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          {/* Daily Goal */}
          <DailyGoal
            caregiverId={caregiverId}
            initialLog={currentLog}
            recentLogs={recentLogs}
          />

          {/* Weekly Insights */}
          <WeeklyInsights trend={trend} />

          {/* Wellbeing Companion */}
          <WellbeingAgent
            caregiverId={caregiverId}
            caregiverName={caregiverName}
            energy={currentLog?.energy_level as SliderValue | null}
            stress={currentLog?.stress_level as SliderValue | null}
            sleep={currentLog?.sleep_quality_rating as SliderValue | null}
          />

          {/* Need Support Card */}
          <NeedSupport />
        </div>
      </div>

      {/* Footer quote */}
      <div className="card-inset p-6 text-center">
        <p className="text-text-secondary italic text-sm leading-relaxed">
          {t('caregiverApp.toolkit.footer')}
        </p>
      </div>
    </div>
  );
}
