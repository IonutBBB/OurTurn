import { createServerClient } from '@/lib/supabase';

export default async function DashboardPage() {
  const supabase = await createServerClient();

  // Get user and household data
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select(`
      *,
      households (
        *,
        patients (*)
      )
    `)
    .eq('id', user?.id)
    .single();

  const household = caregiver?.households;
  const patient = household?.patients?.[0];

  // Get today's date
  const today = new Date();
  const timeOfDay = today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening';

  // Get today's tasks
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data: taskCompletions } = await supabase
    .from('task_completions')
    .select('*, care_plan_tasks(*)')
    .eq('care_plan_tasks.household_id', household?.id)
    .gte('date', startOfDay.split('T')[0])
    .lte('date', endOfDay.split('T')[0]);

  const completedTasks = taskCompletions?.filter(t => t.completed).length || 0;
  const totalTasks = taskCompletions?.length || 0;

  // Get today's check-in
  const { data: checkin } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('household_id', household?.id)
    .eq('date', startOfDay.split('T')[0])
    .single();

  const moodEmojis: Record<number, string> = {
    1: '😟',
    2: '😟',
    3: '😐',
    4: '😊',
    5: '😊',
  };

  const sleepEmojis: Record<number, string> = {
    1: '😩',
    2: '🙂',
    3: '😴',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          Good {timeOfDay}, {caregiver?.name || 'there'}
        </h1>
        {patient && (
          <p className="text-text-secondary mt-1">
            {patient.name}&apos;s day is going well 💚
          </p>
        )}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Status Card */}
        <div className="bg-surface-card rounded-xl border border-surface-border p-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
            Today&apos;s Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Tasks completed</span>
              <span className="font-semibold text-text-primary">
                {completedTasks} of {totalTasks}
              </span>
            </div>
            {totalTasks > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-brand-600 h-2 rounded-full transition-all"
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Daily Check-in Card */}
        <div className="bg-surface-card rounded-xl border border-surface-border p-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
            Daily Check-In
          </h2>
          {checkin ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Mood</span>
                <span className="text-2xl">{moodEmojis[checkin.mood] || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Sleep</span>
                <span className="text-2xl">{sleepEmojis[checkin.sleep_quality] || '—'}</span>
              </div>
              {checkin.voice_note_transcript && (
                <p className="text-sm text-text-secondary italic">
                  &quot;{checkin.voice_note_transcript.slice(0, 100)}...&quot;
                </p>
              )}
            </div>
          ) : (
            <p className="text-text-muted">No check-in submitted yet today</p>
          )}
        </div>

        {/* Location Card */}
        <div className="bg-surface-card rounded-xl border border-surface-border p-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
            Location
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <p className="font-medium text-text-primary">
                {patient?.name || 'Patient'} is at home
              </p>
              <p className="text-sm text-text-muted">Last updated: just now</p>
            </div>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="bg-surface-card rounded-xl border border-surface-border p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
            AI Insights
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-brand-50 rounded-lg">
              <span className="text-lg">💡</span>
              <p className="text-sm text-text-primary">
                {patient?.name || 'Your loved one'} completes more tasks on days with a morning walk scheduled.
                Consider adding physical activity to the daily routine.
              </p>
            </div>
          </div>
        </div>

        {/* Care Code Card */}
        <div className="bg-surface-card rounded-xl border border-surface-border p-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
            Care Code
          </h2>
          <div className="text-center">
            <p className="text-3xl font-mono font-bold text-brand-700 tracking-widest">
              {household?.care_code || '------'}
            </p>
            <p className="text-sm text-text-muted mt-2">
              Share this code to connect the patient app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
