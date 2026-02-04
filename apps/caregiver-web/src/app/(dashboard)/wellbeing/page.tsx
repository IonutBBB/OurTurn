import { createClient as createServerClient } from '@/lib/supabase/server';
import WellbeingClient from './wellbeing-client';

export default async function WellbeingPage() {
  const supabase = await createServerClient();

  // Get user
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select('*')
    .eq('id', user?.id)
    .single();

  if (!caregiver) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Caregiver Wellbeing</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your mood and practice self-care</p>
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] shadow-lg dark:shadow-black/20 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💙</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Complete Setup First</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Set up your profile to start tracking your wellbeing and get personalized self-care reminders.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-500 dark:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/25 dark:shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-600/30 dark:hover:shadow-teal-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            Start Onboarding
          </a>
        </div>
      </div>
    );
  }

  // Get today's log
  const today = new Date().toISOString().split('T')[0];
  const { data: todayLog } = await supabase
    .from('caregiver_wellbeing_logs')
    .select('*')
    .eq('caregiver_id', caregiver.id)
    .eq('date', today)
    .single();

  // Get recent logs (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: recentLogs } = await supabase
    .from('caregiver_wellbeing_logs')
    .select('*')
    .eq('caregiver_id', caregiver.id)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Caregiver Wellbeing</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Track your mood and practice self-care</p>
      </div>
      <WellbeingClient
        caregiverId={caregiver.id}
        caregiverName={caregiver.name}
        initialLog={todayLog}
        recentLogs={recentLogs || []}
      />
    </div>
  );
}
