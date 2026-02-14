'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PricingPlanToggleProps {
  labels: {
    monthly: string;
    annual: string;
    saveBadge: string;
    monthlyPrice: string;
    monthlyNote: string;
    annualPrice: string;
    annualNote: string;
    annualSavings: string;
    familyPlanNote: string;
    startTrialLabel: string;
    plusBadge: string;
    plusTitle: string;
  };
  features: string[];
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${className}`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export function PricingPlanToggle({ labels, features }: PricingPlanToggleProps) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="card-paper p-8 space-y-6 ring-2 ring-brand-500 relative">
      <span className="absolute -top-3 left-6 badge badge-brand text-xs">
        {labels.plusBadge}
      </span>
      <div>
        <h3 className="text-xl font-display font-bold text-text-primary">{labels.plusTitle}</h3>

        {/* Plan toggle */}
        <div className="flex items-center gap-2 mt-4 mb-2">
          <button
            onClick={() => setPlan('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              plan === 'monthly'
                ? 'bg-brand-600 text-white'
                : 'bg-surface-background text-text-secondary hover:bg-brand-50'
            }`}
          >
            {labels.monthly}
          </button>
          <button
            onClick={() => setPlan('annual')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              plan === 'annual'
                ? 'bg-brand-600 text-white'
                : 'bg-surface-background text-text-secondary hover:bg-brand-50'
            }`}
          >
            {labels.annual}
            <span className="ml-1.5 text-xs opacity-80">{labels.saveBadge}</span>
          </button>
        </div>

        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-display font-bold text-gradient-warm">
            {plan === 'annual' ? labels.annualPrice : labels.monthlyPrice}
          </span>
          <span className="text-sm text-text-muted">
            {plan === 'annual' ? labels.annualNote : labels.monthlyNote}
          </span>
        </div>
        {plan === 'annual' && (
          <p className="text-xs text-status-success mt-1">{labels.annualSavings}</p>
        )}
        <p className="text-xs text-text-muted mt-1">{labels.familyPlanNote}</p>
      </div>
      <ul className="space-y-3">
        {features.map((feat, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-text-secondary">
            <CheckIcon className="text-status-success" />
            {feat}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className="btn-primary text-sm w-full py-3 text-center block"
      >
        {labels.startTrialLabel}
      </Link>
    </div>
  );
}
