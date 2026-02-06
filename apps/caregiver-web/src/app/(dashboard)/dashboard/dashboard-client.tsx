'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';

interface JournalEntry {
  id: string;
  content: string;
  entry_type: string;
  created_at: string;
  author: { name: string } | { name: string }[] | null;
}

interface DashboardRealtimeProps {
  householdId: string;
  patientName: string;
  initialCompletedTasks: number;
  initialTotalTasks: number;
}

export function DashboardRealtime({
  householdId,
  patientName,
  initialCompletedTasks,
  initialTotalTasks,
}: DashboardRealtimeProps) {
  const supabase = createBrowserClient();
  const [completedTasks, setCompletedTasks] = useState(initialCompletedTasks);
  const [totalTasks, setTotalTasks] = useState(initialTotalTasks);

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_completions',
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          // Re-fetch completions on any change
          const today = new Date().toISOString().split('T')[0];
          supabase
            .from('task_completions')
            .select('*')
            .eq('household_id', householdId)
            .eq('date', today)
            .then(({ data }) => {
              if (data) {
                setTotalTasks(data.length);
                setCompletedTasks(data.filter((t) => t.completed).length);
              }
            });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'location_logs',
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          // Location updates trigger UI refresh via state
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, supabase]);

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="text-xs text-text-muted flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 bg-status-success rounded-full animate-warm-pulse" />
      Live &middot; {completedTasks}/{totalTasks} tasks
    </div>
  );
}

export function JournalCard({ householdId }: { householdId: string }) {
  const supabase = createBrowserClient();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data } = await supabase
        .from('care_journal_entries')
        .select('id, content, entry_type, created_at, author:caregivers!author_id(name)')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) setEntries(data);
      setLoading(false);
    };

    fetchEntries();
  }, [householdId, supabase]);

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('care_journal_entries')
        .insert({
          household_id: householdId,
          author_id: user?.id,
          content: noteContent.trim(),
          entry_type: 'note',
        })
        .select('id, content, entry_type, created_at, author:caregivers!author_id(name)')
        .single();

      if (error) throw error;

      setEntries((prev) => [data, ...prev].slice(0, 5));
      setNoteContent('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSaving(false);
    }
  };

  const entryTypeIcon: Record<string, string> = {
    note: '📝',
    observation: '👁️',
    milestone: '🌟',
    concern: '⚠️',
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="lg:col-span-5 card-paper p-6 animate-fade-in-up stagger-4">
      <div className="flex items-center justify-between mb-4">
        <p className="section-label">Care Journal</p>
        <Link
          href="/family"
          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          View all &rarr;
        </Link>
      </div>

      {/* Add note input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          placeholder="Add a quick note..."
          className="input-warm flex-1 text-sm py-2"
        />
        <button
          onClick={handleAddNote}
          disabled={!noteContent.trim() || saving}
          className="btn-primary text-sm px-3 py-2 disabled:opacity-50"
        >
          {saving ? '...' : 'Add'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-border" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-border rounded w-3/4" />
                <div className="h-2 bg-surface-border rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="card-inset flex flex-col items-center justify-center py-6 text-center">
          <span className="text-2xl mb-2 opacity-40">📔</span>
          <p className="text-sm text-text-muted">No journal entries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const authorData = Array.isArray(entry.author) ? entry.author[0] : entry.author;
            return (
              <div key={entry.id} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {entryTypeIcon[entry.entry_type] || '📝'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary line-clamp-2">{entry.content}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {authorData?.name || 'Unknown'} &middot; {formatRelativeTime(entry.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
