'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast';
import type { AiDailyTip, TipCategory } from '@ourturn/shared';

interface DailyTipProps {
  initialTip: AiDailyTip | null;
}

const CATEGORY_ICONS: Record<TipCategory, string> = {
  respite: '☕',
  delegation: '🤝',
  exercise: '🏃',
  insight: '💡',
  self_care: '💜',
};

export function DailyTip({ initialTip }: DailyTipProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [tip, setTip] = useState<AiDailyTip | null>(initialTip);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/ai/daily-tip', { method: 'POST' });
      if (res.status === 429) {
        showToast(t('caregiverApp.toolkit.tip.limitReached'), 'error');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch tip');
      const data = await res.json();
      setTip(data.tip);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const dismiss = async () => {
    if (!tip) return;
    // Optimistic dismiss
    setTip((prev) => prev ? { ...prev, dismissed: true } : null);
  };

  if (!tip || tip.dismissed) {
    return (
      <div className="card-paper p-5">
        <h3 className="text-sm font-display font-bold text-text-primary mb-2">
          {t('caregiverApp.toolkit.tip.title')}
        </h3>
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
        >
          {isRefreshing ? t('common.loading') : t('caregiverApp.toolkit.tip.refresh')}
        </button>
      </div>
    );
  }

  const icon = CATEGORY_ICONS[tip.tip_category as TipCategory] || '💡';

  return (
    <div className="card-paper p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <h3 className="text-sm font-display font-bold text-text-primary mb-1">
            {t('caregiverApp.toolkit.tip.title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {tip.tip_text}
          </p>
          <div className="flex gap-3 mt-3">
            <button
              onClick={refresh}
              disabled={isRefreshing}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
            >
              {isRefreshing ? t('common.loading') : t('caregiverApp.toolkit.tip.refresh')}
            </button>
            <button
              onClick={dismiss}
              className="text-xs text-text-muted hover:text-text-secondary"
            >
              {t('caregiverApp.toolkit.tip.dismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
