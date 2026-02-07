'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from '@/components/toast';
import type { CareTeamMember } from '@ourturn/shared';
import { CARE_HELP_CATEGORIES } from '@ourturn/shared';

interface CareTeamMapProps {
  householdId: string;
  caregiverId: string;
  teamMembers: CareTeamMember[];
  onTeamUpdated: (members: CareTeamMember[]) => void;
}

export function CareTeamMap({ householdId, caregiverId, teamMembers, onTeamUpdated }: CareTeamMapProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [canHelpWith, setCanHelpWith] = useState<string[]>([]);
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setRelationship('');
    setPhone('');
    setEmail('');
    setCanHelpWith([]);
    setAvailabilityNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (member: CareTeamMember) => {
    setName(member.name);
    setRelationship(member.relationship || '');
    setPhone(member.phone || '');
    setEmail(member.email || '');
    setCanHelpWith(member.can_help_with || []);
    setAvailabilityNotes(member.availability_notes || '');
    setEditingId(member.id);
    setShowForm(true);
  };

  const toggleHelp = (category: string) => {
    setCanHelpWith((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('care_team_members')
          .update({
            name: name.trim(),
            relationship: relationship.trim() || null,
            phone: phone.trim() || null,
            email: email.trim() || null,
            can_help_with: canHelpWith,
            availability_notes: availabilityNotes.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        onTeamUpdated(teamMembers.map((m) => (m.id === editingId ? data : m)));
      } else {
        const { data, error } = await supabase
          .from('care_team_members')
          .insert({
            household_id: householdId,
            added_by: caregiverId,
            name: name.trim(),
            relationship: relationship.trim() || null,
            phone: phone.trim() || null,
            email: email.trim() || null,
            can_help_with: canHelpWith,
            availability_notes: availabilityNotes.trim() || null,
          })
          .select()
          .single();

        if (error) throw error;
        onTeamUpdated([data, ...teamMembers]);
      }
      resetForm();
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('care_team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      onTeamUpdated(teamMembers.filter((m) => m.id !== memberId));
    } catch {
      showToast(t('common.error'), 'error');
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="card-paper p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-display font-bold text-text-primary">
            {t('caregiverApp.toolkit.network.team.title')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('caregiverApp.toolkit.network.team.subtitle')}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary px-4 py-2 text-sm"
        >
          {t('caregiverApp.toolkit.network.team.addMember')}
        </button>
      </div>

      {/* Team Grid */}
      {teamMembers.length === 0 && !showForm ? (
        <p className="text-sm text-text-muted text-center py-6">
          {t('caregiverApp.toolkit.network.team.noMembers')}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-2xl border border-surface-border bg-surface-elevated/50"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-brand-700 dark:text-brand-400">
                    {getInitials(member.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-text-primary truncate">{member.name}</h4>
                  {member.relationship && (
                    <p className="text-xs text-text-muted">{member.relationship}</p>
                  )}
                </div>
              </div>

              {(member.can_help_with || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {(member.can_help_with || []).map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400">
                      {t(`caregiverApp.toolkit.network.team.help_${tag}`)}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-3">
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="text-xs px-2 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 hover:bg-brand-100 transition-colors"
                  >
                    📞 {t('caregiverApp.toolkit.network.team.call')}
                  </a>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="text-xs px-2 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 hover:bg-brand-100 transition-colors"
                  >
                    ✉️ {t('caregiverApp.toolkit.network.team.email')}
                  </a>
                )}
                <button
                  onClick={() => startEdit(member)}
                  className="text-xs text-text-muted hover:text-text-secondary ml-auto"
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="text-xs text-status-danger hover:text-status-danger/80"
                >
                  {t('common.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="p-5 rounded-2xl border-2 border-brand-200 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-900/10 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">
            {editingId
              ? t('caregiverApp.toolkit.network.team.editMember')
              : t('caregiverApp.toolkit.network.team.addMember')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('caregiverApp.toolkit.network.team.namePlaceholder')}
              className="input-warm"
            />
            <input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder={t('caregiverApp.toolkit.network.team.relationshipPlaceholder')}
              className="input-warm"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('caregiverApp.toolkit.network.team.phonePlaceholder')}
              className="input-warm"
              type="tel"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('caregiverApp.toolkit.network.team.emailPlaceholder')}
              className="input-warm"
              type="email"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-2">
              {t('caregiverApp.toolkit.network.team.canHelpWith')}
            </label>
            <div className="flex flex-wrap gap-2">
              {CARE_HELP_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleHelp(cat)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    canHelpWith.includes(cat)
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30 text-brand-700'
                      : 'border-surface-border text-text-secondary hover:border-brand-300'
                  }`}
                >
                  {t(`caregiverApp.toolkit.network.team.help_${cat}`)}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={availabilityNotes}
            onChange={(e) => setAvailabilityNotes(e.target.value)}
            placeholder={t('caregiverApp.toolkit.network.team.availabilityPlaceholder')}
            className="input-warm w-full resize-none text-sm"
            rows={2}
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              {isSaving ? t('common.saving') : t('common.save')}
            </button>
            <button
              onClick={resetForm}
              className="btn-secondary px-4 py-2 text-sm"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
