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
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
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
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new contact form */}
      <div className="border border-surface-border rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-text-primary">
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
            className="w-full px-4 py-2 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
            className="w-full px-4 py-2 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
            className="w-full px-4 py-2 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Daughter, neighbor, doctor..."
          />
        </div>

        <button
          type="button"
          onClick={addContact}
          disabled={!newContact.name || !newContact.phone}
          className="w-full py-2 px-4 border border-brand-600 text-brand-600 rounded-lg hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + {t('caregiverApp.onboarding.addContact')}
        </button>
      </div>

      {data.emergencyContacts.length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          We recommend adding at least one emergency contact.
        </p>
      )}
    </div>
  );
}
