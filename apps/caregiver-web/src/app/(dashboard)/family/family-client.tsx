'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type {
  Caregiver,
  CareJournalEntry,
  JournalEntryType,
} from '@memoguard/shared';

interface FamilyClientProps {
  householdId: string;
  careCode: string;
  currentCaregiverId: string;
  initialCaregivers: Caregiver[];
  initialJournalEntries: (CareJournalEntry & { author_name?: string })[];
}

const ENTRY_TYPE_LABELS: Record<JournalEntryType, { emoji: string; label: string }> = {
  observation: { emoji: '👀', label: 'Observation' },
  note: { emoji: '📝', label: 'Note' },
  milestone: { emoji: '⭐', label: 'Milestone' },
};

export default function FamilyClient({
  householdId,
  careCode,
  currentCaregiverId,
  initialCaregivers,
  initialJournalEntries,
}: FamilyClientProps) {
  const supabase = createBrowserClient();
  const [caregivers, setCaregivers] = useState<Caregiver[]>(initialCaregivers);
  const [journalEntries, setJournalEntries] = useState<(CareJournalEntry & { author_name?: string })[]>(
    initialJournalEntries
  );
  const [activeTab, setActiveTab] = useState<'family' | 'journal'>('family');
  const [showCareCode, setShowCareCode] = useState(false);

  // Journal entry form
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryType, setNewEntryType] = useState<JournalEntryType>('observation');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          event: 'INSERT',
          schema: 'public',
          table: 'care_journal_entries',
          filter: `household_id=eq.${householdId}`,
        },
        async (payload) => {
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
            setJournalEntries((prev) => [entry, ...prev]);
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
      const { error } = await supabase.from('care_journal_entries').insert({
        household_id: householdId,
        author_id: currentCaregiverId,
        content: newEntryContent.trim(),
        entry_type: newEntryType,
      });

      if (error) throw error;

      setNewEntryContent('');
      setNewEntryType('observation');
    } catch (err) {
      console.error('Failed to add journal entry:', err);
    } finally {
      setIsSubmitting(false);
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
      return 'Yesterday';
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
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Family Members
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'journal'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Care Journal
        </button>
      </div>

      {/* Family Tab */}
      {activeTab === 'family' && (
        <div className="space-y-6">
          {/* Care Code Banner */}
          <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-brand-800 mb-1">Invite Family Members</h3>
                <p className="text-sm text-brand-700 mb-4">
                  Share your Care Code to let other family members join your care circle.
                </p>
                <button
                  onClick={() => setShowCareCode(!showCareCode)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                  <span>{showCareCode ? 'Hide' : 'Show'} Care Code</span>
                </button>
              </div>
              {showCareCode && (
                <div className="bg-white rounded-lg border border-brand-300 px-6 py-4 flex items-center gap-4">
                  <span className="text-3xl font-mono font-bold text-brand-700 tracking-widest">
                    {careCode}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-brand-600 hover:text-brand-700"
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
          <div className="bg-surface-card rounded-xl border border-surface-border">
            <div className="p-4 border-b border-surface-border">
              <h3 className="font-semibold text-text-primary">
                Family Members ({caregivers.length})
              </h3>
            </div>
            <div className="divide-y divide-surface-border">
              {caregivers.map((caregiver) => (
                <div key={caregiver.id} className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-xl font-semibold text-brand-700">
                      {caregiver.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">{caregiver.name}</span>
                      {caregiver.id === currentCaregiverId && (
                        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                      {caregiver.role === 'primary' && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">
                      {caregiver.relationship || 'Family member'} &middot; {caregiver.email}
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
          <form onSubmit={handleSubmitEntry} className="bg-surface-card rounded-xl border border-surface-border p-4">
            <textarea
              value={newEntryContent}
              onChange={(e) => setNewEntryContent(e.target.value)}
              placeholder="Add a note, observation, or milestone..."
              className="w-full px-4 py-3 border border-surface-border rounded-lg bg-white text-text-primary placeholder-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                {(Object.keys(ENTRY_TYPE_LABELS) as JournalEntryType[]).map((type) => {
                  const { emoji, label } = ENTRY_TYPE_LABELS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewEntryType(type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                        newEntryType === type
                          ? 'bg-brand-100 text-brand-700 border border-brand-300'
                          : 'bg-surface-raised text-text-secondary hover:bg-surface-border'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="submit"
                disabled={!newEntryContent.trim() || isSubmitting}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>

          {/* Entries List */}
          <div className="space-y-4">
            {journalEntries.length === 0 ? (
              <div className="bg-surface-card rounded-xl border border-surface-border p-8 text-center">
                <p className="text-text-muted">
                  No journal entries yet. Start documenting your care journey!
                </p>
              </div>
            ) : (
              journalEntries.map((entry) => {
                const typeInfo = ENTRY_TYPE_LABELS[entry.entry_type as JournalEntryType] || {
                  emoji: '📝',
                  label: 'Note',
                };
                return (
                  <div
                    key={entry.id}
                    className="bg-surface-card rounded-xl border border-surface-border p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{typeInfo.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-text-primary">
                            {entry.author_name || 'Unknown'}
                          </span>
                          <span className="text-text-muted">&middot;</span>
                          <span className="text-sm text-text-muted">
                            {formatDate(entry.created_at)}
                          </span>
                          <span className="text-xs bg-surface-raised text-text-secondary px-2 py-0.5 rounded-full">
                            {typeInfo.label}
                          </span>
                        </div>
                        <p className="text-text-primary whitespace-pre-wrap">{entry.content}</p>
                      </div>
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
