import { Suspense } from 'react';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { DashboardRealtime, JournalCard } from './dashboard-client';
import { getServerTranslations } from '@/lib/server-i18n';

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
  const patient = Array.isArray(household?.patients) ? household?.patients?.[0] : household?.patients;

  const translations = await getServerTranslations(household?.language);
  const t = translations.caregiverApp;

  const today = new Date();
  const timeOfDay = today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening';
  const greeting = timeOfDay === 'morning' ? t.dashboard.greetingMorning : timeOfDay === 'afternoon' ? t.dashboard.greetingAfternoon : t.dashboard.greetingEvening;

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

  // 3-level scale matching patient app options: bad / okay / good
  const scaleLevels = [
    { color: '#B8463A', bg: '#FAF0EE' }, // bad
    { color: '#C4882C', bg: '#FDF6EA' }, // okay
    { color: '#4A7C59', bg: '#EFF5F0' }, // good
  ];

  // Map mood 1-5 → scale index 0-2 (bad/okay/good)
  const moodToLevel: Record<number, number> = { 1: 0, 2: 0, 3: 1, 4: 2, 5: 2 };
  const moodLabels: Record<number, string> = {
    1: t.dashboard.moodStruggling, 2: t.dashboard.moodLow, 3: t.dashboard.moodOkay,
    4: t.dashboard.moodGood, 5: t.dashboard.moodGreat,
  };

  // Map sleep 1-3 → scale index 0-2
  const sleepToLevel: Record<number, number> = { 1: 0, 2: 1, 3: 2 };
  const sleepLabels: Record<number, string> = {
    1: t.dashboard.sleepPoor, 2: t.dashboard.sleepFair, 3: t.dashboard.sleepWell,
  };

  // Fetch latest weekly insights
  const { data: weeklyInsight } = await supabase
    .from('weekly_insights')
    .select('insights')
    .eq('household_id', household?.id)
    .order('week_start', { ascending: false })
    .limit(1)
    .single();

  const insights = (weeklyInsight?.insights as { insight: string; suggestion: string; category: string }[] | null) || [];

  // Fetch patient device status
  const lastSeenAt = patient?.last_seen_at ? new Date(patient.last_seen_at) : null;
  const offlineThresholdMs = (household?.offline_alert_minutes || 30) * 60 * 1000;
  const isDeviceOnline = lastSeenAt ? (Date.now() - lastSeenAt.getTime()) < offlineThresholdMs : false;

  // Fetch today's location alerts count
  const { count: alertsToday } = await supabase
    .from('location_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', household?.id)
    .gte('triggered_at', `${todayStr}T00:00:00`);

  // Count completed activities today (legacy brain_activities + new stim activity_sessions)
  const [{ data: brainActivity }, { count: stimCount }] = await Promise.all([
    supabase
      .from('brain_activities')
      .select('id')
      .eq('household_id', household?.id)
      .eq('date', todayStr)
      .eq('completed', true)
      .limit(1),
    supabase
      .from('activity_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', household?.id)
      .eq('date', todayStr)
      .not('completed_at', 'is', null)
      .eq('skipped', false),
  ]);

  const activitiesCompleted = ((brainActivity?.length || 0) > 0 ? 1 : 0) + (stimCount || 0);

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="page-enter space-y-8">
      {/* Greeting */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="heading-display text-3xl">
            {greeting},{' '}
            <span className="heading-accent">{caregiver?.name || t.dashboard.there}</span>
          </h1>
          {patient && (
            <p className="text-text-secondary flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-2 h-2 bg-status-success rounded-full animate-warm-pulse" />
              {t.dashboard.statusGood.replace('{{patientName}}', patient.name)}
            </p>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1">
          <p className="text-sm text-text-muted">
            {new Date().toLocaleDateString(household?.language || 'en', { weekday: 'long', month: 'long', day: 'numeric' })}
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
            <p className="section-label">{t.dashboard.todaysProgress}</p>
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
              <p className="text-sm text-text-secondary mt-1">{t.dashboard.tasksCompletedLabel}</p>
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
          <p className="section-label">{t.dashboard.dailyCheckin}</p>
          {checkin ? (
            <div className="space-y-4">
              {/* Mood scale */}
              {(() => {
                const level = moodToLevel[checkin.mood] ?? 1;
                const { color } = scaleLevels[level];
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{t.dashboard.mood}</p>
                      <p className="text-sm font-semibold" style={{ color }}>{moodLabels[checkin.mood]}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {scaleLevels.map((s, i) => (
                        <div
                          key={i}
                          className="flex-1 h-2.5 rounded-full transition-all"
                          style={{
                            backgroundColor: i <= level ? color : 'var(--surface-border)',
                            opacity: i <= level ? 1 : 0.4,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
              {/* Sleep scale */}
              {(() => {
                const level = sleepToLevel[checkin.sleep_quality] ?? 1;
                const { color } = scaleLevels[level];
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{t.dashboard.sleep}</p>
                      <p className="text-sm font-semibold" style={{ color }}>{sleepLabels[checkin.sleep_quality]}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {scaleLevels.map((s, i) => (
                        <div
                          key={i}
                          className="flex-1 h-2.5 rounded-full transition-all"
                          style={{
                            backgroundColor: i <= level ? color : 'var(--surface-border)',
                            opacity: i <= level ? 1 : 0.4,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
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
              <p className="text-sm text-text-muted">{t.dashboard.noCheckinYet}</p>
            </div>
          )}
        </div>

        {/* Location card */}
        <div className="lg:col-span-4 card-paper p-6 animate-fade-in-up stagger-3">
          <p className="section-label mb-4">{t.dashboard.location}</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-status-success-bg flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary text-sm">
                {t.dashboard.atHome.replace('{{name}}', patient?.name || t.dashboard.patient)}
              </p>
              <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-status-success rounded-full animate-warm-pulse" />
                {t.dashboard.updatedJustNow}
              </p>
            </div>
          </div>
        </div>

        {/* Device Status card */}
        <div className="lg:col-span-8 card-paper p-6 animate-fade-in-up stagger-4">
          <p className="section-label mb-4">{t.dashboard.deviceStatus}</p>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDeviceOnline ? 'bg-status-success-bg' : 'bg-status-danger-bg'}`}>
              <span className="text-2xl">{isDeviceOnline ? '📱' : '📵'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary text-sm flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isDeviceOnline ? 'bg-status-success animate-warm-pulse' : 'bg-status-danger'}`} />
                {isDeviceOnline ? t.dashboard.deviceOnline : t.dashboard.deviceOffline}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {lastSeenAt
                  ? t.dashboard.lastSeenAt.replace('{{time}}', lastSeenAt.toLocaleTimeString(household?.language || 'en', { hour: 'numeric', minute: '2-digit' }))
                  : t.dashboard.lastSeenNever}
              </p>
            </div>
          </div>
          {/* Engagement summary */}
          <div className="border-t border-surface-border pt-4">
            <p className="section-label mb-3">{t.dashboard.engagementSummary}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="card-inset p-3 text-center">
                <p className="text-lg font-bold font-display text-brand-600">{progressPercent}%</p>
                <p className="text-xs text-text-muted">{t.dashboard.tasksCompletedLabel}</p>
              </div>
              <div className="card-inset p-3 text-center">
                <p className="text-lg font-bold font-display text-brand-600">{checkin ? '✅' : '—'}</p>
                <p className="text-xs text-text-muted">{checkin ? t.dashboard.checkedIn : t.dashboard.notCheckedIn}</p>
              </div>
              <div className="card-inset p-3 text-center">
                <p className="text-lg font-bold font-display text-brand-600">{activitiesCompleted > 0 ? activitiesCompleted : '—'}</p>
                <p className="text-xs text-text-muted">{t.dashboard.brainActivity}</p>
              </div>
              <div className="card-inset p-3 text-center">
                <p className="text-lg font-bold font-display text-brand-600">{alertsToday || 0}</p>
                <p className="text-xs text-text-muted">{t.dashboard.alertsToday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Care Journal card */}
        {household?.id && <JournalCard householdId={household.id} />}

        {/* AI Insights card */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-[20px] p-6 border border-brand-200 dark:border-brand-200/30 bg-gradient-to-br from-brand-50 to-surface-card dark:from-brand-50/10 dark:to-surface-card animate-fade-in-up stagger-5">
          <div className="absolute top-0 right-0 w-28 h-28 bg-brand-200/20 dark:bg-brand-200/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <p className="section-label text-brand-700 dark:text-brand-400 mb-4 flex items-center gap-1.5">
            <span className="text-sm">✨</span> {t.dashboard.aiInsights}
          </p>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.slice(0, 3).map((item, idx) => (
                <div key={idx} className="card-inset p-4 flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">
                    {item.category === 'positive' ? '💡' : item.category === 'attention' ? '⚠️' : '💬'}
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{item.insight}</p>
                    {item.suggestion && (
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">{item.suggestion}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-inset p-4 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">💡</span>
              <div>
                <p className="font-semibold text-text-primary text-sm">{t.dashboard.insightsComingSoon}</p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {t.dashboard.insightsComingSoonDesc}
                </p>
              </div>
            </div>
          )}
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
