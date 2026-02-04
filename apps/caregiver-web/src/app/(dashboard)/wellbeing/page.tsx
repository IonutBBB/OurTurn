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
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Caregiver Wellbeing</h1>
        <div className="bg-surface-card rounded-xl border border-surface-border p-8 text-center">
          <p className="text-text-muted">Please complete onboarding first.</p>
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
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Caregiver Wellbeing</h1>
      <WellbeingClient
        caregiverId={caregiver.id}
        caregiverName={caregiver.name}
        initialLog={todayLog}
        recentLogs={recentLogs || []}
      />
    </div>
  );
}
