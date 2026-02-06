import { createClient as createServerClient } from '@/lib/supabase/server';
import WellbeingClient from './wellbeing-client';
import en from '../../../../locales/en.json';

export default async function WellbeingPage() {
  const supabase = await createServerClient();

  // Get user
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select('*')
    .eq('id', user?.id)
    .single();

  const t = en.caregiverApp;

  if (!caregiver) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="heading-display text-2xl">
            Your <span className="heading-accent">Wellbeing</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">{t.wellbeing.pageSubtitle}</p>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">💙</span>
          </div>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">{t.wellbeing.completeSetupFirst}</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            {t.wellbeing.setupDesc}
          </p>
          <a href="/onboarding" className="btn-primary inline-flex items-center">
            {t.wellbeing.startOnboarding}
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
    <div className="page-enter space-y-6">
      <div>
        <h1 className="heading-display text-2xl">
          Your <span className="heading-accent">Wellbeing</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">{t.wellbeing.pageSubtitle}</p>
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
