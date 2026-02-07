'use client';

import { useTranslation } from 'react-i18next';
import type { LocalSupportOrganization } from '@ourturn/shared';

const CATEGORY_ORDER = ['helpline', 'organization', 'government', 'respite', 'financial'];

interface LocalSupportSectionProps {
  supportByCategory: Record<string, LocalSupportOrganization[]>;
  isEmpty: boolean;
}

export function LocalSupportSection({ supportByCategory, isEmpty }: LocalSupportSectionProps) {
  const { t } = useTranslation('resources');

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xs font-display font-medium uppercase tracking-widest text-text-muted">
          {t('localSupport.sectionTitle')}
        </h2>
        <p className="text-sm text-text-muted mt-1">{t('localSupport.sectionSubtitle')}</p>
      </div>

      {isEmpty ? (
        <div className="card-paper p-12 text-center">
          <p className="text-sm text-text-muted">{t('localSupport.emptyState')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORY_ORDER.map((category) => {
            const orgs = supportByCategory[category];
            if (!orgs || orgs.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-semibold text-text-primary">
                  {t(`localSupport.categories.${category}`)}
                </h3>
                {orgs.map((org) => (
                  <div key={org.id} className="card-paper p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-text-primary flex-1">{org.name}</h4>
                      {org.is_24_7 && (
                        <span className="text-xs font-semibold text-status-success bg-status-success/10 px-2 py-0.5 rounded">
                          {t('localSupport.available247')}
                        </span>
                      )}
                    </div>

                    {org.description && (
                      <p className="text-sm text-text-secondary leading-relaxed">{org.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {org.phone && (
                        <a
                          href={`tel:${org.phone.replace(/\s/g, '')}`}
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-status-success text-white text-sm font-semibold hover:bg-status-success/90 transition-colors"
                        >
                          {t('localSupport.call')} {org.phone}
                        </a>
                      )}

                      {org.website_url && (
                        <a
                          href={org.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-5 py-3 rounded-xl border border-brand-500 text-brand-600 text-sm font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                        >
                          {t('localSupport.visitWebsite')}
                        </a>
                      )}

                      {org.email && (
                        <a
                          href={`mailto:${org.email}`}
                          className="inline-flex items-center px-5 py-3 rounded-xl border border-brand-500 text-brand-600 text-sm font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                        >
                          {t('localSupport.sendEmail')}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          <p className="text-xs text-text-muted italic">{t('localSupport.disclaimer')}</p>
        </div>
      )}
    </section>
  );
}
