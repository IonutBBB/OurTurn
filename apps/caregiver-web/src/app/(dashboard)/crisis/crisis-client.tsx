'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from '@/components/toast';
import { getDementiaHelplines } from '@ourturn/shared/constants/helplines';

interface CrisisClientProps {
  caregiverId: string;
  householdId: string;
  country: string;
}

const DE_ESCALATION_STEPS = [
  { key: 'stayCalm', icon: '🧘' },
  { key: 'validateFeelings', icon: '💙' },
  { key: 'simplifyEnvironment', icon: '🔇' },
  { key: 'redirectAttention', icon: '🎵' },
  { key: 'useGentleTouch', icon: '🤝' },
  { key: 'giveSpace', icon: '🕐' },
];

export default function CrisisClient({
  caregiverId,
  householdId,
  country,
}: CrisisClientProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logNotes, setLogNotes] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);

  const helplines = getDementiaHelplines(country);

  const handleLogCrisis = async () => {
    if (!logNotes.trim()) return;
    setIsLogging(true);

    try {
      const { error } = await supabase
        .from('care_journal_entries')
        .insert({
          household_id: householdId,
          author_id: caregiverId,
          content: logNotes.trim(),
          entry_type: 'crisis',
        });

      if (error) throw error;

      setLogNotes('');
      setShowLogForm(false);
      showToast(t('caregiverApp.crisis.eventLogged'), 'success');
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="heading-display text-2xl">
          {t('caregiverApp.crisis.title').split(' ')[0]}{' '}
          <span className="heading-accent">{t('caregiverApp.crisis.title').split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">{t('caregiverApp.crisis.subtitle')}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Call Helpline */}
        {helplines.length > 0 && helplines[0].phone && (
          <a
            href={`tel:${helplines[0].phone.replace(/\s/g, '')}`}
            className="card-paper p-6 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-2xl">📞</span>
            </div>
            <div>
              <p className="font-display font-bold text-text-primary">{t('caregiverApp.crisis.callHelpline')}</p>
              <p className="text-sm text-text-muted">{helplines[0].name}</p>
              <p className="text-sm text-brand-600 dark:text-brand-400 font-semibold">{helplines[0].phone}</p>
            </div>
          </a>
        )}

        {/* Log Event */}
        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="card-paper p-6 flex items-center gap-4 hover:shadow-md transition-shadow group text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-status-amber-bg flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-2xl">📝</span>
          </div>
          <div>
            <p className="font-display font-bold text-text-primary">{t('caregiverApp.crisis.logEvent')}</p>
            <p className="text-sm text-text-muted">{t('caregiverApp.crisis.logEventDesc')}</p>
          </div>
        </button>
      </div>

      {/* Log Form */}
      {showLogForm && (
        <div className="card-paper p-6">
          <h2 className="font-display font-bold text-text-primary mb-3">{t('caregiverApp.crisis.logEvent')}</h2>
          <textarea
            value={logNotes}
            onChange={(e) => setLogNotes(e.target.value)}
            placeholder={t('caregiverApp.crisis.logPlaceholder')}
            className="input-warm w-full h-32 resize-none"
          />
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleLogCrisis}
              disabled={isLogging || !logNotes.trim()}
              className="btn-primary disabled:opacity-50"
            >
              {isLogging ? t('common.saving') : t('common.save')}
            </button>
            <button
              onClick={() => setShowLogForm(false)}
              className="btn-secondary"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* De-escalation Guide */}
      <div className="card-paper p-6">
        <h2 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.crisis.deEscalationGuide')}</h2>
        <div className="space-y-3">
          {DE_ESCALATION_STEPS.map((step) => {
            const isExpanded = expandedStep === step.key;
            return (
              <button
                key={step.key}
                onClick={() => setExpandedStep(isExpanded ? null : step.key)}
                className="w-full text-left"
              >
                <div className={`rounded-2xl border transition-all ${isExpanded ? 'border-brand-300 bg-brand-50/50 dark:bg-brand-900/20' : 'border-surface-border hover:border-brand-200'}`}>
                  <div className="flex items-center gap-3 p-4">
                    <span className="text-2xl">{step.icon}</span>
                    <span className="flex-1 font-medium text-text-primary">
                      {t(`caregiverApp.crisis.steps.${step.key}.title`)}
                    </span>
                    <svg
                      className={`w-5 h-5 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-sm text-text-secondary leading-relaxed pl-9">
                        {t(`caregiverApp.crisis.steps.${step.key}.detail`)}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Support Resources */}
      <div className="card-paper p-6">
        <h2 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.crisis.resources')}</h2>
        <div className="space-y-3">
          {helplines.map((helpline, index) => (
            <div key={index} className="flex items-center justify-between p-3 card-inset rounded-2xl">
              <div>
                <p className="font-medium text-text-primary">{helpline.name}</p>
                {helpline.phone && (
                  <p className="text-sm text-brand-600 dark:text-brand-400">{helpline.phone}</p>
                )}
              </div>
              <div className="flex gap-2">
                {helpline.phone && (
                  <a
                    href={`tel:${helpline.phone.replace(/\s/g, '')}`}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    {t('caregiverApp.crisis.call')}
                  </a>
                )}
                {helpline.website && (
                  <a
                    href={helpline.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    {t('caregiverApp.crisis.website')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
