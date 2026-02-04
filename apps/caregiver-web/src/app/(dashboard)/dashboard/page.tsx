import { createClient as createServerClient } from '@/lib/supabase/server';

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

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header - Modern 2026 style */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Good {timeOfDay}, {caregiver?.name || 'there'}
        </h1>
        {patient && (
          <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {patient.name}&apos;s day is going well
          </p>
        )}
      </div>

      {/* Bento Grid - 2026 Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Today's Status Card - Featured */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 lg:col-span-2 shadow-lg dark:shadow-black/20 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Today&apos;s Progress
            </h2>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              {progressPercent}% Complete
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  {completedTasks}
                  <span className="text-xl text-gray-400 dark:text-gray-500 font-normal"> / {totalTasks}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tasks completed today</p>
              </div>
              <div className="text-5xl opacity-20">📋</div>
            </div>
            {totalTasks > 0 && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-teal-500 to-teal-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Daily Check-in Card */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg dark:shadow-black/20 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Daily Check-In
          </h2>
          {checkin ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Mood</span>
                <span className="text-3xl">{moodEmojis[checkin.mood] || '—'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Sleep</span>
                <span className="text-3xl">{sleepEmojis[checkin.sleep_quality] || '—'}</span>
              </div>
              {checkin.voice_note_transcript && (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                  &quot;{checkin.voice_note_transcript.slice(0, 80)}...&quot;
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="text-4xl mb-3 opacity-50">💭</span>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No check-in yet today</p>
            </div>
          )}
        </div>

        {/* Location Card */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg dark:shadow-black/20 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Location
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {patient?.name || 'Patient'} is at home
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Updated just now
              </p>
            </div>
          </div>
        </div>

        {/* AI Insights Card - Gradient accent */}
        <div className="relative overflow-hidden rounded-2xl p-6 lg:col-span-2 shadow-lg border border-teal-200 dark:border-teal-800 hover:shadow-xl transition-shadow bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/20 dark:to-[#1E1E1E]">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-radial from-teal-400 to-transparent" />
          <h2 className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="text-sm">✨</span> AI Insights
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-teal-100 dark:border-teal-800">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">💡</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Morning Activity Pattern</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {patient?.name || 'Your loved one'} completes more tasks on days with a morning walk scheduled.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Care Code Card */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg dark:shadow-black/20 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Care Code
          </h2>
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-1 px-4 py-3 bg-teal-50 dark:bg-teal-900/30 rounded-xl">
              {(household?.care_code || '------').split('').map((char: string, i: number) => (
                <span
                  key={i}
                  className={`text-2xl font-mono font-bold text-teal-700 dark:text-teal-400 ${i === 2 ? 'ml-2' : ''}`}
                >
                  {char}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Share this code to connect the patient app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
