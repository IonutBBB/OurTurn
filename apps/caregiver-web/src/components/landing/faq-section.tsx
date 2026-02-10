'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FAQ_COUNT = 10;

export function FaqSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const lt = (key: string) => t(`caregiverApp.landing.faq.${key}`);

  return (
    <section id="faq" className="landing-section">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="heading-display text-3xl sm:text-4xl">{lt('title')}</h2>
          <p className="text-text-secondary text-lg mt-4">{lt('subtitle')}</p>
        </div>

        <div className="space-y-3">
          {Array.from({ length: FAQ_COUNT }, (_, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`card-paper overflow-hidden transition-all ${isOpen ? 'faq-open' : ''}`}
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-text-primary pr-4">
                    {lt(`q${i + 1}`)}
                  </span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 text-text-muted transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="faq-answer">
                  <div>
                    <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                      {lt(`a${i + 1}`)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
