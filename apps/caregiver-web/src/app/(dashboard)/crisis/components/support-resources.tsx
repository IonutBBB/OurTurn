'use client';

import { useTranslation } from 'react-i18next';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SupportResourcesProps {
  familyCaregivers: FamilyMember[];
}

export function SupportResources({ familyCaregivers }: SupportResourcesProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Family Contacts */}
      {familyCaregivers.length > 0 && (
        <div className="card-paper p-6">
          <h3 className="text-lg font-display font-bold text-text-primary mb-4">
            {t('caregiverApp.crisis.familyContacts')}
          </h3>
          <div className="space-y-3">
            {familyCaregivers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 card-inset rounded-2xl">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary text-sm">{member.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      member.role === 'primary'
                        ? 'bg-brand-100 text-brand-700 dark:bg-brand-800/50 dark:text-brand-200'
                        : 'bg-surface-border text-text-secondary'
                    }`}>
                      {member.role === 'primary'
                        ? t('common.primary')
                        : t('caregiverApp.family.familyMember')}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted truncate">{member.email}</p>
                </div>
                <a
                  href={`mailto:${member.email}`}
                  className="btn-secondary text-xs px-3 py-1 ml-2 shrink-0"
                >
                  {t('caregiverApp.crisis.email')}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
