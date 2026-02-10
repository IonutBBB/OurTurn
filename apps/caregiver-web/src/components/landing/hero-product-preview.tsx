'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const TASKS = [
  { time: '8:00 AM', icon: '\uD83D\uDC8A', key: 'exampleTask1' },
  { time: '9:30 AM', icon: '\uD83D\uDEB6', key: 'exampleTask2' },
  { time: '11:00 AM', icon: '\uD83E\uDDE9', key: 'exampleTask3' },
  { time: '12:30 PM', icon: '\uD83E\uDD57', key: 'exampleTask4' },
  { time: '3:00 PM', icon: '\uD83D\uDCAC', key: 'exampleTask5' },
];

export function HeroProductPreview() {
  const { t } = useTranslation();
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false, false]);

  useEffect(() => {
    const timers = [0, 1, 2].map((i) =>
      setTimeout(() => {
        setChecked((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 800 + i * 600),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const lt = (key: string) => t(`caregiverApp.landing.${key}`);

  return (
    <div className="relative card-paper p-6 sm:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">{lt('todaysPlanFor')}</p>
          <p className="text-xl font-display font-bold text-text-primary">
            {lt('exampleName')}
          </p>
        </div>
        <div className="badge badge-success">{lt('exampleProgress')}</div>
      </div>
      <div className="divider-wavy" />
      {TASKS.map((item, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-500 ${
            checked[i]
              ? 'bg-status-success-bg/60 dark:bg-status-success-bg'
              : 'bg-surface-background/80'
          }`}
        >
          <span className="text-xl flex-shrink-0">{item.icon}</span>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold transition-all duration-500 ${
                checked[i]
                  ? 'text-status-success line-through decoration-1'
                  : 'text-text-primary'
              }`}
            >
              {lt(item.key)}
            </p>
            <p className="text-xs text-text-muted">{item.time}</p>
          </div>
          {checked[i] && (
            <svg
              className="w-5 h-5 text-status-success flex-shrink-0 animate-scale-in"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
