'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import type {
  Caregiver,
  CareJournalEntry,
  JournalEntryType,
} from '@ourturn/shared';
import { hasReachedCaregiverLimit } from '@ourturn/shared/utils/subscription';
import { UpgradeBanner } from '@/components/upgrade-gate';
import { useToast } from '@/components/toast';

interface FamilyClientProps {
  householdId: string;
  careCode: string;
  currentCaregiverId: string;
  initialCaregivers: Caregiver[];
  initialJournalEntries: (CareJournalEntry & { author_name?: string })[];
  subscriptionStatus: string;
  initialTab?: 'family' | 'journal';
}

const ENTRY_TYPE_EMOJIS: Record<JournalEntryType, string> = {
  observation: '👀',
  note: '📝',
  milestone: '⭐',
};

const ENTRY_TYPE_KEYS: Record<JournalEntryType, string> = {
  observation: 'caregiverApp.family.observation',
  note: 'caregiverApp.family.note',
  milestone: 'caregiverApp.family.milestone',
};

export default function FamilyClient({
  householdId,
  careCode,
  currentCaregiverId,
  initialCaregivers,
  initialJournalEntries,
  subscriptionStatus,
  initialTab = 'family',
}: FamilyClientProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();
  const [caregivers, setCaregivers] = useState<Caregiver[]>(initialCaregivers);

  const household = { subscription_status: subscriptionStatus as 'free' | 'plus' | 'cancelled' };
  const caregiverLimitReached = hasReachedCaregiverLimit(household, caregivers.length);
  const [journalEntries, setJournalEntries] = useState<(CareJournalEntry & { author_name?: string })[]>(
    initialJournalEntries
  );
  const [activeTab, setActiveTab] = useState<'family' | 'journal'>(initialTab);
  const [showCareCode, setShowCareCode] = useState(false);

  // Journal entry form
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryType, setNewEntryType] = useState<JournalEntryType>('observation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit/delete state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editEntryType, setEditEntryType] = useState<JournalEntryType>('observation');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = () => setOpenMenuId(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [openMenuId]);

  // Subscribe to real-time updates
  useEffect(() => {
    const caregiverChannel = supabase
      .channel('caregivers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'caregivers',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCaregivers((prev) => [...prev, payload.new as Caregiver]);
          } else if (payload.eventType === 'UPDATE') {
            setCaregivers((prev) =>
              prev.map((c) => (c.id === (payload.new as Caregiver).id ? payload.new as Caregiver : c))
            );
          } else if (payload.eventType === 'DELETE') {
            setCaregivers((prev) => prev.filter((c) => c.id !== (payload.old as Caregiver).id));
          }
        }
      )
      .subscribe();

    const journalChannel = supabase
      .channel('journal-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_journal_entries',
          filter: `household_id=eq.${householdId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch with author name
            const { data } = await supabase
              .from('care_journal_entries')
              .select('*, caregivers!author_id(name)')
              .eq('id', (payload.new as CareJournalEntry).id)
              .single();

            if (data) {
              const entry = {
                ...data,
                author_name: (data.caregivers as any)?.name || 'Unknown',
              };
              delete (entry as any).caregivers;
              setJournalEntries((prev) => {
                if (prev.some((e) => e.id === entry.id)) return prev;
                return [entry, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as CareJournalEntry;
            setJournalEntries((prev) =>
              prev.map((e) =>
                e.id === updated.id ? { ...e, ...updated } : e
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string };
            setJournalEntries((prev) => prev.filter((e) => e.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(caregiverChannel);
      supabase.removeChannel(journalChannel);
    };
  }, [householdId, supabase]);

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('care_journal_entries')
        .insert({
          household_id: householdId,
          author_id: currentCaregiverId,
          content: newEntryContent.trim(),
          entry_type: newEntryType,
        })
        .select('*, caregivers!author_id(name)')
        .single();

      if (error) throw error;

      if (data) {
        const entry = {
          ...data,
          author_name: (data.caregivers as any)?.name || 'Unknown',
        };
        delete (entry as any).caregivers;
        setJournalEntries((prev) => [entry, ...prev]);
      }

      setNewEntryContent('');
      setNewEntryType('observation');
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (entry: CareJournalEntry & { author_name?: string }) => {
    setEditingEntryId(entry.id);
    setEditContent(entry.content);
    setEditEntryType(entry.entry_type as JournalEntryType);
    setOpenMenuId(null);
  };

  const cancelEditing = () => {
    setEditingEntryId(null);
    setEditContent('');
    setEditEntryType('observation');
  };

  const handleEditEntry = async () => {
    if (!editingEntryId || !editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('care_journal_entries')
        .update({ content: editContent.trim(), entry_type: editEntryType })
        .eq('id', editingEntryId);

      if (error) throw error;

      setJournalEntries((prev) =>
        prev.map((e) =>
          e.id === editingEntryId
            ? { ...e, content: editContent.trim(), entry_type: editEntryType }
            : e
        )
      );
      cancelEditing();
    } catch (err) {
      showToast(t('common.error'), 'error');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    setOpenMenuId(null);
    const confirmed = window.confirm(t('caregiverApp.family.deleteConfirmMessage'));
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('care_journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setJournalEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) {
      showToast(t('common.error'), 'error');
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(careCode);
    setShowCareCode(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return t('common.yesterday');
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-border">
        <button
          onClick={() => setActiveTab('family')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'family'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          {t('caregiverApp.family.familyMembers')}
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'journal'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          {t('caregiverApp.family.journal')}
        </button>
      </div>

      {/* Family Tab */}
      {activeTab === 'family' && (
        <div className="space-y-6">
          {/* Caregiver Limit Banner */}
          {caregiverLimitReached && (
            <UpgradeBanner message={t('subscription.limits.caregiverLimitReached')} />
          )}

          {/* Care Code Banner */}
          <div className="bg-brand-50 dark:bg-brand-900/20 rounded-[20px] border border-brand-200 dark:border-brand-800 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-text-primary mb-1">{t('caregiverApp.family.inviteMember')}</h3>
                <p className="text-sm text-text-secondary mb-4">
                  {caregiverLimitReached
                    ? t('subscription.limits.caregiverLimitReached')
                    : t('caregiverApp.family.inviteDesc')}
                </p>
                <button
                  onClick={() => setShowCareCode(!showCareCode)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <span>{showCareCode ? t('caregiverApp.family.hideCareCode') : t('caregiverApp.family.showCareCode')}</span>
                </button>
              </div>
              {showCareCode && (
                <div className="bg-surface-card dark:bg-surface-elevated rounded-2xl border border-brand-300 dark:border-brand-700 px-6 py-4 flex items-center gap-4">
                  <span className="text-3xl font-mono font-bold text-brand-700 dark:text-brand-300 tracking-widest">
                    {careCode}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                    title="Copy to clipboard"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Members List */}
          <div className="card-paper">
            <div className="p-4 border-b border-surface-border">
              <h3 className="font-semibold text-text-primary">
                {t('caregiverApp.family.familyMembersCount', { count: caregivers.length })}
              </h3>
            </div>
            <div className="divide-y divide-surface-border">
              {caregivers.map((caregiver) => (
                <div key={caregiver.id} className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-100 flex items-center justify-center">
                    <span className="text-xl font-semibold text-brand-700 dark:text-brand-600">
                      {caregiver.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">{caregiver.name}</span>
                      {caregiver.id === currentCaregiverId && (
                        <span className="text-xs bg-brand-100 dark:bg-brand-100 text-brand-700 dark:text-brand-600 px-2 py-0.5 rounded-full">
                          {t('common.you')}
                        </span>
                      )}
                      {caregiver.role === 'primary' && (
                        <span className="text-xs bg-status-amber-bg text-status-amber px-2 py-0.5 rounded-full">
                          {t('common.primary')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted">
                      {caregiver.relationship || t('caregiverApp.family.familyMember')} &middot; {caregiver.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      {caregiver.permissions?.can_edit_plan && (
                        <span title="Can edit care plan">📝</span>
                      )}
                      {caregiver.permissions?.receives_alerts && (
                        <span title="Receives alerts">🔔</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Journal Tab */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          {/* New Entry Form */}
          <form onSubmit={handleSubmitEntry} className="card-paper p-4">
            <textarea
              value={newEntryContent}
              onChange={(e) => setNewEntryContent(e.target.value)}
              placeholder={t('caregiverApp.family.journalPlaceholder')}
              className="input-warm w-full resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                {(Object.keys(ENTRY_TYPE_EMOJIS) as JournalEntryType[]).map((type) => {
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewEntryType(type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        newEntryType === type
                          ? 'bg-brand-500 dark:bg-brand-600 text-white border border-brand-600 dark:border-brand-500'
                          : 'bg-surface-card dark:bg-surface-card text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 border border-brand-200 dark:border-brand-800'
                      }`}
                    >
                      <span>{ENTRY_TYPE_EMOJIS[type]}</span>
                      <span>{t(ENTRY_TYPE_KEYS[type])}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="submit"
                disabled={!newEntryContent.trim() || isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('common.posting') : t('common.post')}
              </button>
            </div>
          </form>

          {/* Entries List */}
          <div className="space-y-4">
            {journalEntries.length === 0 ? (
              <div className="card-paper p-8 text-center">
                <p className="text-text-muted">
                  {t('caregiverApp.family.noJournalEntries')}
                </p>
              </div>
            ) : (
              journalEntries.map((entry) => {
                const entryType = entry.entry_type as JournalEntryType;
                const emoji = ENTRY_TYPE_EMOJIS[entryType] || '📝';
                const labelKey = ENTRY_TYPE_KEYS[entryType] || 'caregiverApp.family.note';
                const isEditing = editingEntryId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="card-paper p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{isEditing ? ENTRY_TYPE_EMOJIS[editEntryType] : emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-text-primary">
                            {entry.author_name || t('common.unknown')}
                          </span>
                          <span className="text-text-muted">&middot;</span>
                          <span className="text-sm text-text-muted">
                            {formatDate(entry.created_at)}
                          </span>
                          <span className="text-xs card-inset text-text-secondary px-2 py-0.5 rounded-full">
                            {isEditing ? t(ENTRY_TYPE_KEYS[editEntryType]) : t(labelKey)}
                          </span>
                          {entry.updated_at && entry.updated_at !== entry.created_at && !isEditing && (
                            <span className="text-xs text-text-muted italic">
                              {t('caregiverApp.family.edited')}
                            </span>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="input-warm w-full resize-none"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              {(Object.keys(ENTRY_TYPE_EMOJIS) as JournalEntryType[]).map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setEditEntryType(type)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    editEntryType === type
                                      ? 'bg-brand-500 dark:bg-brand-600 text-white border border-brand-600 dark:border-brand-500'
                                      : 'bg-surface-card dark:bg-surface-card text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 border border-brand-200 dark:border-brand-800'
                                  }`}
                                >
                                  <span>{ENTRY_TYPE_EMOJIS[type]}</span>
                                  <span>{t(ENTRY_TYPE_KEYS[type])}</span>
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleEditEntry}
                                disabled={!editContent.trim()}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                {t('common.save')}
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg border border-surface-border hover:bg-surface-card transition-colors"
                              >
                                {t('common.cancel')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-text-primary whitespace-pre-wrap">{entry.content}</p>
                        )}
                      </div>
                      {/* Kebab menu */}
                      {!isEditing && (
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === entry.id ? null : entry.id); }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-card transition-colors"
                            aria-label="Entry actions"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {openMenuId === entry.id && (
                            <div className="absolute right-0 top-8 z-10 w-36 bg-surface-card dark:bg-surface-elevated rounded-lg shadow-lg border border-surface-border py-1">
                              <button
                                onClick={() => startEditing(entry)}
                                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                              >
                                {t('common.edit')}
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="w-full text-left px-4 py-2 text-sm text-status-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                {t('common.delete')}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
