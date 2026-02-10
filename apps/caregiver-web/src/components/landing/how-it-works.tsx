import { landingT } from '@/lib/landing-t';

const t = (key: string) => landingT(`caregiverApp.landing.${key}`);

const STEPS = [
  { step: '01', titleKey: 'step1Title', descKey: 'step1Desc', icon: '\uD83C\uDFE0' },
  { step: '02', titleKey: 'step2Title', descKey: 'step2Desc', icon: '\uD83D\uDD11' },
  { step: '03', titleKey: 'step3Title', descKey: 'step3Desc', icon: '\uD83D\uDC9B' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-label mb-3">{t('howItWorks')}</p>
          <h2 className="heading-display text-3xl sm:text-4xl">
            {t('threeStepsPrefix')}{' '}
            <span className="heading-accent">{t('threeStepsAccent')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((item, i) => (
            <div key={i} className="relative">
              {/* Dashed connector line between steps (desktop only) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] border-t-2 border-dashed border-brand-200" />
              )}
              <div className="card-paper card-interactive p-8 h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{item.icon}</span>
                  <span className="font-display text-3xl font-bold text-gradient-warm">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold text-text-primary">
                  {t(item.titleKey)}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {t(item.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
