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
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('family')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'family'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Family Members
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'journal'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Care Journal
        </button>
      </div>

      {/* Family Tab */}
      {activeTab === 'family' && (
        <div className="space-y-6">
          {/* Care Code Banner */}
          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Invite Family Members</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Share your Care Code to let other family members join your care circle.
                </p>
                <button
                  onClick={() => setShowCareCode(!showCareCode)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors font-medium"
                >
                  <span>{showCareCode ? 'Hide' : 'Show'} Care Code</span>
                </button>
              </div>
              {showCareCode && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-teal-300 dark:border-teal-700 px-6 py-4 flex items-center gap-4">
                  <span className="text-3xl font-mono font-bold text-teal-700 dark:text-teal-300 tracking-widest">
                    {careCode}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
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
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Family Members ({caregivers.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {caregivers.map((caregiver) => (
                <div key={caregiver.id} className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <span className="text-xl font-semibold text-teal-700 dark:text-teal-300">
                      {caregiver.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{caregiver.name}</span>
                      {caregiver.id === currentCaregiverId && (
                        <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                      {caregiver.role === 'primary' && (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {caregiver.relationship || 'Family member'} &middot; {caregiver.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
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
          <form onSubmit={handleSubmitEntry} className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <textarea
              value={newEntryContent}
              onChange={(e) => setNewEntryContent(e.target.value)}
              placeholder="Add a note, observation, or milestone..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                          ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
                className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>

          {/* Entries List */}
          <div className="space-y-4">
            {journalEntries.length === 0 ? (
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
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
                    className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{typeInfo.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {entry.author_name || 'Unknown'}
                          </span>
                          <span className="text-gray-400">&middot;</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(entry.created_at)}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                            {typeInfo.label}
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{entry.content}</p>
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
