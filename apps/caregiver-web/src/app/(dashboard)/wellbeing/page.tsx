import { createClient as createServerClient } from '@/lib/supabase/server';
import ToolkitClient from './toolkit-client';
import en from '../../../../locales/en.json';

export default async function ToolkitPage() {
  const supabase = await createServerClient();
  const t = en.caregiverApp;

  // Get user
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select('*')
    .eq('id', user?.id)
    .single();

  if (!caregiver) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="heading-display text-2xl">
            Caregiver <span className="heading-accent">Toolkit</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">{t.toolkit.pageSubtitle}</p>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🧰</span>
          </div>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">{t.toolkit.completeSetupFirst}</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            {t.toolkit.setupDesc}
          </p>
          <a href="/onboarding" className="btn-primary inline-flex items-center">
            {t.toolkit.startOnboarding}
          </a>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  // Fetch all data in parallel
  const [
    todayLogResult,
    recentLogsResult,
    todayTipResult,
    helpRequestsResult,
    burnoutLogsResult,
  ] = await Promise.all([
    // Today's log
    supabase
      .from('caregiver_wellbeing_logs')
      .select('*')
      .eq('caregiver_id', caregiver.id)
      .eq('date', today)
      .single(),
    // 28-day history (for trends)
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
    // Today's AI tip
    supabase
      .from('ai_daily_tips')
      .select('*')
      .eq('caregiver_id', caregiver.id)
      .eq('date', today)
      .single(),
    // Recent help requests
    supabase
      .from('caregiver_help_requests')
      .select('*')
      .eq('household_id', caregiver.household_id)
      .order('created_at', { ascending: false })
      .limit(10),
    // Recent logs for burnout check (7 days)
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
  const todayTip = todayTipResult.data;
  const helpRequests = helpRequestsResult.data || [];

  // Check burnout: stress >= 4 for 3+ days OR energy <= 2 for 3+ days
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

  // Build trend data (chronological order)
  const trend = recentLogs
    .map((l) => ({
      date: l.date,
      energy: l.energy_level,
      stress: l.stress_level,
      sleep: l.sleep_quality_rating,
    }))
    .reverse();

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="heading-display text-2xl">
          Caregiver <span className="heading-accent">Toolkit</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">{t.toolkit.pageSubtitle}</p>
      </div>
      <ToolkitClient
        caregiverId={caregiver.id}
        caregiverName={caregiver.name}
        householdId={caregiver.household_id}
        initialLog={todayLog}
        recentLogs={recentLogs}
        initialTip={todayTip}
        helpRequests={helpRequests}
        showBurnoutWarning={showBurnoutWarning}
        trend={trend}
      />
    </div>
  );
}
