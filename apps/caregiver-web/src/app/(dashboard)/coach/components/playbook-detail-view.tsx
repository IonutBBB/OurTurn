'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { BehaviourPlaybook } from '@ourturn/shared';

interface PlaybookDetailViewProps {
  playbook: BehaviourPlaybook;
  onClose: () => void;
  onLogIncident: (behaviourType: string) => void;
}

type SectionKey = 'right_now' | 'understand_why' | 'prevent' | 'when_to_call_doctor';

export function PlaybookDetailView({ playbook, onClose, onLogIncident }: PlaybookDetailViewProps) {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<SectionKey>('right_now');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const sections: { key: SectionKey; title: string; icon: string }[] = [
    { key: 'right_now', title: t('caregiverApp.toolkit.behaviours.playbooks.rightNow'), icon: '⚡' },
    { key: 'understand_why', title: t('caregiverApp.toolkit.behaviours.playbooks.understandWhy'), icon: '🧠' },
    { key: 'prevent', title: t('caregiverApp.toolkit.behaviours.playbooks.prevent'), icon: '🛡️' },
    { key: 'when_to_call_doctor', title: t('caregiverApp.toolkit.behaviours.playbooks.whenToCallDoctor'), icon: '🏥' },
  ];

  const renderContent = (key: SectionKey) => {
    if (key === 'right_now') {
      const steps = playbook.right_now as { step: string }[];
      return (
        <ol className="space-y-3">
          {steps.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-sm text-text-primary leading-relaxed">{item.step}</span>
            </li>
          ))}
        </ol>
      );
    }

    const items = playbook[key] as string[];
    return (
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 items-start text-sm text-text-primary leading-relaxed">
            <span className="text-text-muted mt-1 flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={playbook.title}
    >
      <div
        className="bg-surface-card rounded-3xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-card rounded-t-3xl border-b border-surface-border p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{playbook.emoji}</span>
            <div>
              <h2 className="text-lg font-display font-bold text-text-primary">{t(`caregiverApp.toolkit.behaviours.types.${playbook.behaviour_type}`, playbook.title)}</h2>
              <p className="text-sm text-text-secondary">{playbook.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-border/50 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
            aria-label={t('common.back')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Accordion Sections */}
        <div className="p-6 space-y-3">
          {sections.map((section) => {
            const isOpen = openSection === section.key;
            return (
              <div key={section.key} className="rounded-2xl border border-surface-border overflow-hidden">
                <button
                  onClick={() => setOpenSection(isOpen ? (null as unknown as SectionKey) : section.key)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-elevated/50 transition-colors text-left"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-2">
                    <span>{section.icon}</span>
                    <span className="font-semibold text-text-primary">{section.title}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1">
                    {renderContent(section.key)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Log Incident Button */}
        <div className="p-6 pt-0">
          <button
            onClick={() => onLogIncident(playbook.behaviour_type)}
            className="w-full btn-primary py-3 text-sm font-medium"
          >
            {t('caregiverApp.toolkit.behaviours.logger.logIncident')}
          </button>
        </div>
      </div>
    </div>
  );
}
