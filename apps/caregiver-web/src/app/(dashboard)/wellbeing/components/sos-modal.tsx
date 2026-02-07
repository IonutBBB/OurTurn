'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface SosModalProps {
  caregiverId: string;
  householdId: string;
  patientId: string;
  onClose: () => void;
}

export function SosModal({ caregiverId, householdId, patientId, onClose }: SosModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    firstButtonRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus trap within modal
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const handleCalmDown = () => {
    onClose();
    // Navigate to box breathing exercise - the QuickRelief component handles it
    // We scroll to the relief section on the wellbeing tab
    router.push('/wellbeing');
    setTimeout(() => {
      document.getElementById('quick-relief')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBehaviourNow = () => {
    onClose();
    router.push('/coach/behaviours?log=true');
  };

  const handleCallForHelp = () => {
    onClose();
    router.push('/crisis');
  };

  const handleNeedBreak = () => {
    onClose();
    router.push('/wellbeing');
    setTimeout(() => {
      document.getElementById('help-request')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('caregiverApp.toolkit.sos.title')}
    >
      <div
        ref={modalRef}
        className="bg-surface-card rounded-3xl shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-text-primary">
            {t('caregiverApp.toolkit.sos.title')}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-border/50 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            aria-label={t('common.cancel')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-text-secondary mb-5">
          {t('caregiverApp.toolkit.sos.subtitle')}
        </p>

        <div className="space-y-3">
          <button
            ref={firstButtonRef}
            onClick={handleCalmDown}
            className="w-full h-[72px] flex items-center gap-4 px-5 rounded-2xl border-2 border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors text-left"
          >
            <span className="text-2xl">🫁</span>
            <div>
              <span className="font-semibold text-text-primary">{t('caregiverApp.toolkit.sos.calmDown')}</span>
              <p className="text-xs text-text-muted">{t('caregiverApp.toolkit.sos.calmDownDesc')}</p>
            </div>
          </button>

          <button
            onClick={handleBehaviourNow}
            className="w-full h-[72px] flex items-center gap-4 px-5 rounded-2xl border-2 border-status-amber/30 bg-status-amber-bg/50 hover:bg-status-amber-bg transition-colors text-left"
          >
            <span className="text-2xl">📋</span>
            <div>
              <span className="font-semibold text-text-primary">{t('caregiverApp.toolkit.sos.behaviourNow')}</span>
              <p className="text-xs text-text-muted">{t('caregiverApp.toolkit.sos.behaviourNowDesc')}</p>
            </div>
          </button>

          <button
            onClick={handleCallForHelp}
            className="w-full h-[72px] flex items-center gap-4 px-5 rounded-2xl border-2 border-status-danger/30 bg-status-danger/5 hover:bg-status-danger/10 transition-colors text-left"
          >
            <span className="text-2xl">📞</span>
            <div>
              <span className="font-semibold text-text-primary">{t('caregiverApp.toolkit.sos.callHelp')}</span>
              <p className="text-xs text-text-muted">{t('caregiverApp.toolkit.sos.callHelpDesc')}</p>
            </div>
          </button>

          <button
            onClick={handleNeedBreak}
            className="w-full h-[72px] flex items-center gap-4 px-5 rounded-2xl border-2 border-surface-border bg-surface-elevated/50 hover:bg-surface-elevated transition-colors text-left"
          >
            <span className="text-2xl">🆘</span>
            <div>
              <span className="font-semibold text-text-primary">{t('caregiverApp.toolkit.sos.needBreak')}</span>
              <p className="text-xs text-text-muted">{t('caregiverApp.toolkit.sos.needBreakDesc')}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
