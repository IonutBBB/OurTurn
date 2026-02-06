import { Suspense } from 'react';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { DashboardRealtime, JournalCard } from './dashboard-client';

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 bg-surface-border rounded-lg w-64" />
        <div className="h-4 bg-surface-border rounded w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 card-paper p-6 space-y-5">
          <div className="h-4 bg-surface-border rounded w-32" />
          <div className="h-16 bg-surface-border rounded" />
          <div className="h-2.5 bg-surface-border rounded-full" />
        </div>
        <div className="lg:col-span-5 card-paper p-6 space-y-4">
          <div className="h-4 bg-surface-border rounded w-24" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-surface-border rounded-2xl" />
            <div className="h-20 bg-surface-border rounded-2xl" />
          </div>
        </div>
        <div className="lg:col-span-4 card-paper p-6">
          <div className="h-4 bg-surface-border rounded w-20 mb-4" />
          <div className="h-12 bg-surface-border rounded-2xl" />
        </div>
        <div className="lg:col-span-3 card-paper p-6">
          <div className="h-4 bg-surface-border rounded w-20 mb-4" />
          <div className="h-12 bg-surface-border rounded-2xl" />
        </div>
        <div className="lg:col-span-5 card-paper p-6">
          <div className="h-4 bg-surface-border rounded w-24 mb-4" />
          <div className="space-y-3">
            <div className="h-10 bg-surface-border rounded" />
            <div className="h-10 bg-surface-border rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function DashboardContent() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select(`*, households (*, patients (*))`)
    .eq('id', user?.id)
    .single();

  const household = caregiver?.households;
  const patient = household?.patients?.[0];

  const today = new Date();
  const timeOfDay = today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening';
  const greeting = timeOfDay === 'morning' ? 'Good morning' : timeOfDay === 'afternoon' ? 'Good afternoon' : 'Good evening';

  const todayStr = new Date().toISOString().split('T')[0];

  const { data: taskCompletions } = await supabase
    .from('task_completions')
    .select('*')
    .eq('household_id', household?.id)
    .eq('date', todayStr);

  const completedTasks = taskCompletions?.filter(t => t.completed).length || 0;
  const totalTasks = taskCompletions?.length || 0;

  const { data: checkin } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('household_id', household?.id)
    .eq('date', todayStr)
    .single();

  const moodMap: Record<number, { emoji: string; label: string }> = {
    1: { emoji: '😟', label: 'Struggling' },
    2: { emoji: '😕', label: 'Low' },
    3: { emoji: '😐', label: 'Okay' },
    4: { emoji: '😊', label: 'Good' },
    5: { emoji: '😄', label: 'Great' },
  };

  const sleepMap: Record<number, { emoji: string; label: string }> = {
    1: { emoji: '😩', label: 'Poor' },
    2: { emoji: '🙂', label: 'Fair' },
    3: { emoji: '😴', label: 'Well' },
  };

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="page-enter space-y-8">
      {/* Greeting */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="heading-display text-3xl">
            {greeting},{' '}
            <span className="heading-accent">{caregiver?.name || 'there'}</span>
          </h1>
          {patient && (
            <p className="text-text-secondary flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-2 h-2 bg-status-success rounded-full animate-warm-pulse" />
              {patient.name}&apos;s day is going well
            </p>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1">
          <p className="text-sm text-text-muted">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {household?.id && (
            <DashboardRealtime
              householdId={household.id}
              patientName={patient?.name || ''}
              initialCompletedTasks={completedTasks}
              initialTotalTasks={totalTasks}
            />
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Progress card */}
        <div className="lg:col-span-7 card-paper card-accent p-6 space-y-5 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between">
            <p className="section-label">Today&apos;s Progress</p>
            <span className={`badge ${progressPercent >= 80 ? 'badge-success' : progressPercent >= 40 ? 'badge-warning' : 'badge-brand'}`}>
              {progressPercent}%
            </span>
          </div>

          <div className="flex items-end gap-6">
            <div>
              <p className="text-5xl font-display font-bold text-text-primary tracking-tight">
                {completedTasks}
                <span className="text-2xl text-text-muted font-normal">/{totalTasks}</span>
              </p>
              <p className="text-sm text-text-secondary mt-1">tasks completed</p>
            </div>

            <div className="relative w-20 h-20 flex-shrink-0 ml-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--surface-border)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke="var(--brand-500)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold font-display text-brand-600">
                {progressPercent}%
              </span>
            </div>
          </div>

          {totalTasks > 0 && (
            <div className="w-full bg-surface-background rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Check-in card */}
        <div className="lg:col-span-5 card-paper p-6 space-y-4 animate-fade-in-up stagger-2">
          <p className="section-label">Daily Check-in</p>
          {checkin ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="card-inset p-4 text-center">
                  <p className="text-3xl mb-1">{moodMap[checkin.mood]?.emoji || '—'}</p>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    {moodMap[checkin.mood]?.label || 'Mood'}
                  </p>
                </div>
                <div className="card-inset p-4 text-center">
                  <p className="text-3xl mb-1">{sleepMap[checkin.sleep_quality]?.emoji || '—'}</p>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    {sleepMap[checkin.sleep_quality]?.label || 'Sleep'}
                  </p>
                </div>
              </div>
              {checkin.voice_note_transcript && (
                <div className="card-inset p-3">
                  <p className="text-sm text-text-secondary italic leading-relaxed">
                    &quot;{checkin.voice_note_transcript.slice(0, 100)}...&quot;
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card-inset flex flex-col items-center justify-center py-8 text-center">
              <span className="text-3xl mb-2 opacity-40">💭</span>
              <p className="text-sm text-text-muted">No check-in yet today</p>
            </div>
          )}
        </div>

        {/* Location card */}
        <div className="lg:col-span-4 card-paper p-6 animate-fade-in-up stagger-3">
          <p className="section-label mb-4">Location</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-status-success-bg flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary text-sm">
                {patient?.name || 'Patient'} is at home
              </p>
              <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-status-success rounded-full animate-warm-pulse" />
                Updated just now
              </p>
            </div>
          </div>
        </div>

        {/* Care Code card */}
        <div className="lg:col-span-3 card-paper p-6 animate-fade-in-up stagger-4">
          <p className="section-label mb-4">Care Code</p>
          <div className="card-inset p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              {(household?.care_code || '------').split('').map((char: string, i: number) => (
                <span
                  key={i}
                  className={`text-xl font-mono font-bold text-brand-700 dark:text-brand-400 ${i === 2 ? 'ml-2' : ''}`}
                >
                  {char}
                </span>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">Share to connect patient app</p>
          </div>
        </div>

        {/* Care Journal card */}
        {household?.id && <JournalCard householdId={household.id} />}

        {/* AI Insights card */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-[20px] p-6 border border-brand-200 dark:border-brand-200/30 bg-gradient-to-br from-brand-50 to-surface-card dark:from-brand-50/10 dark:to-surface-card animate-fade-in-up stagger-5">
          <div className="absolute top-0 right-0 w-28 h-28 bg-brand-200/20 dark:bg-brand-200/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <p className="section-label text-brand-700 dark:text-brand-400 mb-4 flex items-center gap-1.5">
            <span className="text-sm">✨</span> AI Insights
          </p>
          <div className="card-inset p-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">💡</span>
            <div>
              <p className="font-semibold text-text-primary text-sm">Morning Activity Pattern</p>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {patient?.name || 'Your loved one'} completes more tasks on days with a morning walk scheduled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
