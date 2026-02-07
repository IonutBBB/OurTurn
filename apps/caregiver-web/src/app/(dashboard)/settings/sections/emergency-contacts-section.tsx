'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast';
import type { Patient, EmergencyContact } from '@ourturn/shared';

interface EmergencyContactsSectionProps {
  patient: Patient;
}

export default function EmergencyContactsSection({ patient }: EmergencyContactsSectionProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const [contacts, setContacts] = useState<EmergencyContact[]>(patient.emergency_contacts || []);
  const [newContact, setNewContact] = useState<EmergencyContact>({ name: '', phone: '', relationship: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      setContacts([...contacts, { ...newContact }]);
      setNewContact({ name: '', phone: '', relationship: '' });
    }
  };

  const handleRemoveContact = (index: number) => {
    if (!confirm(t('caregiverApp.settings.removeContactConfirm'))) return;
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          emergency_contacts: contacts,
          emergency_number: contacts.length > 0 ? contacts[0].phone : null,
        })
        .eq('id', patient.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card-paper p-6">
      <h2 className="text-lg font-display font-bold text-text-primary mb-2">
        {t('caregiverApp.settings.emergencyContacts')}
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        {t('caregiverApp.settings.emergencyContactsDesc')}
      </p>

      {/* Existing contacts list */}
      {contacts.length > 0 ? (
        <div className="space-y-3 mb-4">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-surface-background rounded-2xl"
            >
              <div>
                <p className="font-medium text-text-primary">{contact.name}</p>
                <p className="text-sm text-text-secondary">
                  {contact.phone} {contact.relationship && `\u2022 ${contact.relationship}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveContact(index)}
                className="text-status-danger hover:opacity-80 text-sm"
              >
                {t('common.remove')}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-status-amber bg-status-amber-bg p-3 rounded-2xl mb-4">
          {t('caregiverApp.settings.noContactsYet')}
        </p>
      )}

      {/* Add new contact form */}
      <div className="border border-surface-border rounded-2xl p-4 space-y-4 mb-4">
        <h3 className="text-sm font-medium font-display text-text-primary">
          {t('caregiverApp.settings.addContact')}
        </h3>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t('caregiverApp.settings.contactName')} *
          </label>
          <input
            type="text"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            className="input-warm w-full"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t('caregiverApp.settings.contactPhone')} *
          </label>
          <input
            type="tel"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            className="input-warm w-full"
            placeholder="+1 555 123 4567"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t('caregiverApp.settings.contactRelationship')}
          </label>
          <input
            type="text"
            value={newContact.relationship}
            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
            className="input-warm w-full"
            placeholder={t('caregiverApp.settings.contactRelationshipPlaceholder')}
          />
        </div>
        <button
          type="button"
          onClick={handleAddContact}
          disabled={!newContact.name || !newContact.phone}
          className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + {t('caregiverApp.settings.addContact')}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary disabled:opacity-50"
        >
          {isSaving ? t('caregiverApp.settings.savingContacts') : t('caregiverApp.settings.saveContacts')}
        </button>
        {saved && (
          <span className="text-sm text-status-success">{t('common.saved')}</span>
        )}
      </div>
    </div>
  );
}
