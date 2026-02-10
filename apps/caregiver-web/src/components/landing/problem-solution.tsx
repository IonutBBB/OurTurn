import { landingT } from '@/lib/landing-t';

const t = (key: string) => landingT(`caregiverApp.landing.${key}`);

const PROBLEMS = [
  { titleKey: 'problem.item1Title', descKey: 'problem.item1Desc' },
  { titleKey: 'problem.item2Title', descKey: 'problem.item2Desc' },
  { titleKey: 'problem.item3Title', descKey: 'problem.item3Desc' },
  { titleKey: 'problem.item4Title', descKey: 'problem.item4Desc' },
];

const SOLUTIONS = [
  { titleKey: 'solution.item1Title', descKey: 'solution.item1Desc' },
  { titleKey: 'solution.item2Title', descKey: 'solution.item2Desc' },
  { titleKey: 'solution.item3Title', descKey: 'solution.item3Desc' },
  { titleKey: 'solution.item4Title', descKey: 'solution.item4Desc' },
];

export function ProblemSolution() {
  return (
    <section className="landing-section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-label mb-3">{t('problem.sectionTitle')}</p>
          <h2 className="heading-display text-3xl sm:text-4xl max-w-2xl mx-auto">
            {t('problem.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Problems */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-text-muted mb-4">
              The daily reality
            </h3>
            {PROBLEMS.map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-status-danger-bg/40 dark:bg-status-danger-bg/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-status-danger/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-status-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{t(item.titleKey)}</p>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">{t(item.descKey)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Solutions */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-text-muted mb-4">
              {t('solution.title')}
            </h3>
            {SOLUTIONS.map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-status-success-bg/40 dark:bg-status-success-bg/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-status-success/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-status-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{t(item.titleKey)}</p>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">{t(item.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
