'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OnboardingData } from '../page';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function Step5Safety({ data, updateData }: Props) {
  const { t } = useTranslation();
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      updateData({
        emergencyContacts: [...data.emergencyContacts, { ...newContact }],
      });
      setNewContact({ name: '', phone: '', relationship: '' });
    }
  };

  const removeContact = (index: number) => {
    updateData({
      emergencyContacts: data.emergencyContacts.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-text-secondary text-sm mb-4">
        Add emergency contacts that will appear in the patient app&apos;s Help tab.
      </p>

      {/* Existing contacts */}
      {data.emergencyContacts.length > 0 && (
        <div className="space-y-3">
          {data.emergencyContacts.map((contact, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-surface-background rounded-2xl"
            >
              <div>
                <p className="font-medium text-text-primary">{contact.name}</p>
                <p className="text-sm text-text-secondary">
                  {contact.phone} {contact.relationship && `• ${contact.relationship}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeContact(index)}
                className="text-status-danger hover:opacity-80 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new contact form */}
      <div className="border border-surface-border rounded-2xl p-4 space-y-4">
        <h3 className="text-sm font-medium font-display text-text-primary">
          {t('caregiverApp.onboarding.addContact')}
        </h3>

        <div>
          <label htmlFor="contactName" className="block text-sm text-text-secondary mb-1">
            {t('caregiverApp.onboarding.contactName')} *
          </label>
          <input
            id="contactName"
            type="text"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            className="input-warm w-full"
            placeholder="Name"
          />
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm text-text-secondary mb-1">
            {t('caregiverApp.onboarding.contactPhone')} *
          </label>
          <input
            id="contactPhone"
            type="tel"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            className="input-warm w-full"
            placeholder="+1 555 123 4567"
          />
        </div>

        <div>
          <label htmlFor="contactRelationship" className="block text-sm text-text-secondary mb-1">
            {t('caregiverApp.onboarding.contactRelationship')}
          </label>
          <input
            id="contactRelationship"
            type="text"
            value={newContact.relationship}
            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
            className="input-warm w-full"
            placeholder="Daughter, neighbor, doctor..."
          />
        </div>

        <button
          type="button"
          onClick={addContact}
          disabled={!newContact.name || !newContact.phone}
          className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + {t('caregiverApp.onboarding.addContact')}
        </button>
      </div>

      {data.emergencyContacts.length === 0 && (
        <p className="text-sm text-status-amber bg-status-amber-bg p-3 rounded-2xl">
          We recommend adding at least one emergency contact.
        </p>
      )}
    </div>
  );
}
