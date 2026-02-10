import { landingT } from '@/lib/landing-t';

const t = (key: string) => landingT(`caregiverApp.landing.stats.${key}`);

const STATS = [
  { countKey: 'familiesCount', labelKey: 'familiesLabel' },
  { countKey: 'tasksCount', labelKey: 'tasksLabel' },
  { countKey: 'countriesCount', labelKey: 'countriesLabel' },
  { countKey: 'ratingCount', labelKey: 'ratingLabel' },
];

export function SocialProofBar() {
  return (
    <section className="py-12 bg-brand-50/40 dark:bg-brand-50/5 border-y border-surface-border/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.countKey}>
              <p className="text-3xl sm:text-4xl font-display font-bold text-gradient-warm">
                {t(stat.countKey)}
              </p>
              <p className="text-sm text-text-secondary mt-1">{t(stat.labelKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
