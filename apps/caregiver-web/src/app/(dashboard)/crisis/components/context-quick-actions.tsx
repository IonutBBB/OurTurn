'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { getEmergencyNumber } from '@ourturn/shared/constants/emergency-numbers';

type Mode = 'in_person' | 'remote';

interface ContextQuickActionsProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  country: string;
  patientName: string;
  primaryCaregiver: { name: string; email: string } | null;
  onStartDeEscalation: () => void;
  onAlertFamily: () => void;
  onLogEvent: () => void;
  isAlertingFamily: boolean;
}

interface ActionItem {
  icon: string;
  titleKey: string;
  descKey: string;
  onClick?: () => void;
  href?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export function ContextQuickActions({
  mode,
  onModeChange,
  country,
  patientName,
  primaryCaregiver,
  onStartDeEscalation,
  onAlertFamily,
  onLogEvent,
  isAlertingFamily,
}: ContextQuickActionsProps) {
  const { t } = useTranslation();
  const emergency = getEmergencyNumber(country);

  const inPersonActions: ActionItem[] = [
    {
      icon: '🧘',
      titleKey: 'caregiverApp.crisis.actions.startDeEscalation',
      descKey: 'caregiverApp.crisis.actions.startDeEscalationDesc',
      onClick: onStartDeEscalation,
    },
    {
      icon: '🚨',
      titleKey: 'caregiverApp.crisis.actions.callEmergency',
      descKey: 'caregiverApp.crisis.actions.callEmergencyDesc',
      href: `tel:${emergency.primary}`,
      variant: 'danger',
    },
    {
      icon: '📢',
      titleKey: 'caregiverApp.crisis.actions.alertFamily',
      descKey: 'caregiverApp.crisis.actions.alertFamilyDesc',
      onClick: onAlertFamily,
      variant: 'warning',
      loading: isAlertingFamily,
    },
    {
      icon: '📝',
      titleKey: 'caregiverApp.crisis.actions.logEvent',
      descKey: 'caregiverApp.crisis.actions.logEventDesc',
      onClick: onLogEvent,
    },
  ];

  const remoteActions: ActionItem[] = [
    {
      icon: '👤',
      titleKey: 'caregiverApp.crisis.actions.contactPrimary',
      descKey: 'caregiverApp.crisis.actions.contactPrimaryDesc',
      href: primaryCaregiver ? `mailto:${primaryCaregiver.email}` : undefined,
      onClick: primaryCaregiver ? undefined : onAlertFamily,
    },
    {
      icon: '📍',
      titleKey: 'caregiverApp.crisis.actions.viewLocation',
      descKey: 'caregiverApp.crisis.actions.viewLocationDesc',
      href: '/location',
    },
    {
      icon: '🚨',
      titleKey: 'caregiverApp.crisis.actions.callEmergency',
      descKey: 'caregiverApp.crisis.actions.callEmergencyDesc',
      href: `tel:${emergency.primary}`,
      variant: 'danger',
    },
    {
      icon: '📢',
      titleKey: 'caregiverApp.crisis.actions.alertFamily',
      descKey: 'caregiverApp.crisis.actions.alertFamilyDesc',
      onClick: onAlertFamily,
      variant: 'warning',
      loading: isAlertingFamily,
    },
  ];

  const actions = mode === 'in_person' ? inPersonActions : remoteActions;

  return (
    <div className="card-paper p-6">
      {/* Mode Toggle */}
      <div className="mb-5">
        <p className="text-sm text-text-muted mb-2 font-medium">
          {t('caregiverApp.crisis.actions.modeLabel')}
        </p>
        <div className="inline-flex rounded-full bg-surface-border/50 p-1">
          <button
            onClick={() => onModeChange('in_person')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'in_person'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('caregiverApp.crisis.actions.withThem')}
          </button>
          <button
            onClick={() => onModeChange('remote')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'remote'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('caregiverApp.crisis.actions.remote')}
          </button>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => {
          const variantClasses =
            action.variant === 'danger'
              ? 'border-status-danger/20 hover:border-status-danger/40 hover:bg-status-danger-bg/50'
              : action.variant === 'warning'
                ? 'border-status-amber/20 hover:border-status-amber/40 hover:bg-status-amber-bg/50'
                : 'border-surface-border hover:border-brand-200 hover:bg-brand-50/30 dark:hover:bg-brand-900/10';

          const content = (
            <>
              <div className="w-12 h-12 rounded-2xl bg-surface-border/30 flex items-center justify-center mb-3">
                <span className="text-2xl">{action.icon}</span>
              </div>
              <p className="font-display font-bold text-text-primary text-sm">
                {t(action.titleKey)}
              </p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                {action.descKey.includes('{{name}}')
                  ? t(action.descKey, { name: patientName })
                  : t(action.descKey)}
              </p>
              {action.loading && (
                <div className="mt-2">
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </>
          );

          if (action.href && !action.href.startsWith('tel:') && !action.href.startsWith('mailto:')) {
            return (
              <Link
                key={action.titleKey}
                href={action.href}
                className={`p-4 rounded-2xl border transition-all text-left ${variantClasses}`}
              >
                {content}
              </Link>
            );
          }

          if (action.href) {
            return (
              <a
                key={action.titleKey}
                href={action.href}
                className={`p-4 rounded-2xl border transition-all text-left block ${variantClasses}`}
              >
                {content}
              </a>
            );
          }

          return (
            <button
              key={action.titleKey}
              onClick={action.onClick}
              disabled={action.loading}
              className={`p-4 rounded-2xl border transition-all text-left disabled:opacity-50 ${variantClasses}`}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
