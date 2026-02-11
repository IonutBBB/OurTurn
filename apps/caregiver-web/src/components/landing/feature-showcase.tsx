import { landingT } from '@/lib/landing-t';

const t = (key: string) => landingT(`caregiverApp.landing.${key}`);

const FEATURES = [
  {
    icon: '\uD83D\uDCCB',
    titleKey: 'featureCarePlanTitle',
    descKey: 'featureCarePlanLongDesc',
    color: 'var(--brand-500)',
    mockup: 'timeline',
  },
  {
    icon: '\uD83D\uDCCD',
    titleKey: 'featureLocationTitle',
    descKey: 'featureLocationLongDesc',
    color: 'var(--status-info)',
    mockup: 'map',
  },
  {
    icon: '\uD83E\uDD16',
    titleKey: 'featureCoachTitle',
    descKey: 'featureCoachLongDesc',
    color: 'var(--category-cognitive)',
    mockup: 'chat',
  },
  {
    icon: '\uD83C\uDFE0',
    titleKey: 'featureHomeTitle',
    descKey: 'featureHomeLongDesc',
    color: 'var(--status-success)',
    mockup: 'button',
  },
  {
    icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67',
    titleKey: 'featureFamilyTitle',
    descKey: 'featureFamilyLongDesc',
    color: 'var(--category-social)',
    mockup: 'circle',
  },
  {
    icon: '\uD83D\uDC99',
    titleKey: 'featureWellbeingTitle',
    descKey: 'featureWellbeingLongDesc',
    color: 'var(--status-amber)',
    mockup: 'mood',
  },
];

function FeatureMockup({ type, color }: { type: string; color: string }) {
  const base = 'rounded-2xl border border-surface-border bg-surface-background p-6';

  switch (type) {
    case 'timeline':
      return (
        <div className={base}>
          <div className="space-y-3">
            {[0.9, 0.7, 0.5, 0.3].map((opacity, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: color, opacity }} />
                <div className="h-3 rounded-full flex-1" style={{ background: color, opacity: opacity * 0.2 }} />
                {i < 2 && (
                  <svg className="w-5 h-5" style={{ color }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    case 'map':
      return (
        <div className={base}>
          <div className="aspect-[4/3] rounded-xl bg-status-info-bg relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 60% 40%, ${color} 0%, transparent 70%)` }} />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 rounded-full" style={{ background: color }} />
              <div className="w-16 h-16 rounded-full border-2 border-dashed absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ borderColor: color, opacity: 0.4 }} />
            </div>
          </div>
        </div>
      );
    case 'chat':
      return (
        <div className={base}>
          <div className="space-y-3">
            <div className="chat-bubble-user text-xs max-w-[70%] ml-auto">
              {t('chatMockup.userMessage')}
            </div>
            <div className="chat-bubble-assistant text-xs max-w-[80%]">
              {t('chatMockup.aiResponse')}
            </div>
          </div>
        </div>
      );
    case 'button':
      return (
        <div className={`${base} flex items-center justify-center`}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl" style={{ background: `${color}20`, border: `3px solid ${color}` }}>
            {'\uD83C\uDFE0'}
          </div>
        </div>
      );
    case 'circle':
      return (
        <div className={base}>
          <div className="flex justify-center -space-x-3">
            {['#E0895A', '#4A7C59', '#4A6FA5', '#B85A6F', '#C4882C'].map((bg, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-surface-card flex items-center justify-center text-xs font-bold text-white" style={{ background: bg }}>
                {['S', 'M', 'J', 'A', 'K'][i]}
              </div>
            ))}
          </div>
        </div>
      );
    case 'mood':
      return (
        <div className={base}>
          <div className="flex justify-center gap-4 text-3xl">
            {['\uD83D\uDE0A', '\uD83D\uDE10', '\uD83D\uDE14', '\uD83D\uDE22'].map((emoji, i) => (
              <span key={i} className={i === 0 ? 'scale-125' : 'opacity-40'}>
                {emoji}
              </span>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function FeatureShowcase() {
  return (
    <section id="features" className="landing-section bg-brand-50/40 dark:bg-brand-50/5 relative overflow-hidden">
      {/* Static subtle blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg className="absolute -top-24 -right-24 w-[520px] h-[520px]" viewBox="0 0 520 520" fill="none">
          <path d="M260 20C340 10 430 60 470 140C510 220 490 310 440 380C390 450 310 490 230 480C150 470 80 420 40 350C0 280 -10 190 30 120C70 50 180 30 260 20Z" fill="var(--brand-200)" fillOpacity={0.08} />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="section-label mb-3">{t('featuresLabel')}</p>
          <h2 className="heading-display text-3xl sm:text-4xl">
            {t('featuresTitle')}{' '}
            <span className="heading-accent">{t('featuresTitleAccent')}</span>{' '}
            {t('featuresTitleSuffix')}
          </h2>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                i % 2 === 1 ? 'lg:direction-rtl' : ''
              }`}
            >
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="w-12 h-12 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-bold text-text-primary mb-3">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>
              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <FeatureMockup type={feature.mockup} color={feature.color} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
