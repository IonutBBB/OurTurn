import { createClient as createServerClient } from '@/lib/supabase/server';
import ToolkitClient from './toolkit-client';

export default async function WellbeingTabPage() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select('*')
    .eq('id', user?.id)
    .single();

  if (!caregiver) return null;

  const today = new Date().toISOString().split('T')[0];

  const [
    todayLogResult,
    recentLogsResult,
    helpRequestsResult,
    burnoutLogsResult,
  ] = await Promise.all([
    supabase
      .from('caregiver_wellbeing_logs')
      .select('*')
      .eq('caregiver_id', caregiver.id)
      .eq('date', today)
      .single(),
    (() => {
      const d = new Date();
      d.setDate(d.getDate() - 28);
      return supabase
        .from('caregiver_wellbeing_logs')
        .select('*')
        .eq('caregiver_id', caregiver.id)
        .gte('date', d.toISOString().split('T')[0])
        .order('date', { ascending: false });
    })(),
    supabase
      .from('caregiver_help_requests')
      .select('*')
      .eq('household_id', caregiver.household_id)
      .order('created_at', { ascending: false })
      .limit(10),
    (() => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return supabase
        .from('caregiver_wellbeing_logs')
        .select('date, stress_level, energy_level')
        .eq('caregiver_id', caregiver.id)
        .gte('date', d.toISOString().split('T')[0])
        .order('date', { ascending: false });
    })(),
  ]);

  const todayLog = todayLogResult.data;
  const recentLogs = recentLogsResult.data || [];
  const helpRequests = helpRequestsResult.data || [];

  const burnoutLogs = burnoutLogsResult.data || [];
  let consecutiveHighStress = 0;
  let consecutiveLowEnergy = 0;
  let showBurnoutWarning = false;

  for (const log of burnoutLogs) {
    if (log.stress_level !== null && log.stress_level >= 4) {
      consecutiveHighStress++;
    } else {
      consecutiveHighStress = 0;
    }
    if (log.energy_level !== null && log.energy_level <= 2) {
      consecutiveLowEnergy++;
    } else {
      consecutiveLowEnergy = 0;
    }
    if (consecutiveHighStress >= 3 || consecutiveLowEnergy >= 3) {
      showBurnoutWarning = true;
      break;
    }
  }

  const trend = recentLogs
    .map((l) => ({
      date: l.date,
      energy: l.energy_level,
      stress: l.stress_level,
      sleep: l.sleep_quality_rating,
    }))
    .reverse();

  return (
    <ToolkitClient
      caregiverId={caregiver.id}
      caregiverName={caregiver.name}
      householdId={caregiver.household_id}
      initialLog={todayLog}
      recentLogs={recentLogs}
      helpRequests={helpRequests}
      showBurnoutWarning={showBurnoutWarning}
      trend={trend}
    />
  );
}
