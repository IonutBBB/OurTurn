'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface CrisisEntry {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
}

interface CrisisHistoryProps {
  entries: CrisisEntry[];
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function CrisisHistory({ entries }: CrisisHistoryProps) {
  const { t } = useTranslation();

  return (
    <div className="card-paper p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold text-text-primary">
          {t('caregiverApp.crisis.history.title')}
        </h3>
        <Link
          href="/family?tab=journal"
          className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium"
        >
          {t('caregiverApp.crisis.history.viewAllInJournal')}
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-text-muted py-4 text-center">
          {t('caregiverApp.crisis.history.noEvents')}
        </p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {entries.slice(0, 10).map((entry) => (
            <div key={entry.id} className="p-3 card-inset rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-text-muted">
                  {entry.author_name}
                </span>
                <span className="text-xs text-text-muted">
                  {formatDate(entry.created_at)}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
