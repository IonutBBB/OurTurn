import { landingT } from '@/lib/landing-t';

const t = (key: string) => landingT(`caregiverApp.landing.twoApps.${key}`);

export function TwoAppsPreview() {
  return (
    <section className="landing-section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="heading-display text-3xl sm:text-4xl">
            {t('title')}
          </h2>
          <p className="text-text-secondary text-lg mt-4 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Patient app — phone frame */}
          <div className="text-center">
            <div className="phone-frame max-w-[220px] mx-auto mb-6">
              <div className="p-4 pt-8 space-y-4">
                {/* Simplified patient UI mockup */}
                <div className="text-center">
                  <p className="text-xs text-text-muted uppercase tracking-widest">Today</p>
                  <p className="text-sm font-display font-bold text-text-primary mt-1">Good morning</p>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: '\uD83D\uDC8A', label: 'Medication', done: true },
                    { icon: '\uD83D\uDEB6', label: 'Walk', done: true },
                    { icon: '\uD83E\uDDE9', label: 'Activity', done: false },
                  ].map((task, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-xl text-xs ${task.done ? 'bg-status-success-bg/60' : 'bg-surface-background/80'}`}>
                      <span>{task.icon}</span>
                      <span className={task.done ? 'line-through text-status-success' : 'text-text-primary font-medium'}>
                        {task.label}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Take me home button */}
                <div className="flex justify-center pt-2">
                  <div className="w-12 h-12 rounded-full bg-status-success/10 border-2 border-status-success flex items-center justify-center text-lg">
                    {'\uD83C\uDFE0'}
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-display font-bold text-text-primary">
              {t('patientLabel')}
            </h3>
            <p className="text-sm text-text-secondary mt-2 max-w-xs mx-auto">
              {t('patientDesc')}
            </p>
          </div>

          {/* Caregiver app — browser frame */}
          <div className="text-center">
            <div className="browser-frame max-w-md mx-auto mb-6">
              <div className="browser-frame-toolbar" />
              <div className="p-4 space-y-3">
                {/* Simplified dashboard mockup */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Tasks done', value: '3/5', color: 'var(--status-success)' },
                    { label: 'Location', value: 'Home', color: 'var(--status-info)' },
                    { label: 'Mood today', value: '\uD83D\uDE0A', color: 'var(--status-amber)' },
                    { label: 'Family', value: '4 members', color: 'var(--category-social)' },
                  ].map((card, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-background border border-surface-border/50 text-left">
                      <p className="text-[10px] text-text-muted uppercase tracking-wide">{card.label}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
                    </div>
                  ))}
                </div>
                <div className="h-2 rounded-full bg-surface-border overflow-hidden">
                  <div className="h-full rounded-full bg-brand-500 w-3/5" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-display font-bold text-text-primary">
              {t('caregiverLabel')}
            </h3>
            <p className="text-sm text-text-secondary mt-2 max-w-xs mx-auto">
              {t('caregiverDesc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
