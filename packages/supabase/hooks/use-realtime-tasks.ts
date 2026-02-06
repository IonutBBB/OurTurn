import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../client';
import type { TaskCompletion, CarePlanTask, DayOfWeek } from '@ourturn/shared';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface TaskWithCompletion extends CarePlanTask {
  completion?: TaskCompletion | null;
}

interface UseRealtimeTasksOptions {
  householdId: string | null | undefined;
  date: string; // YYYY-MM-DD format
  dayOfWeek: DayOfWeek; // 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'
  enabled?: boolean;
}

interface UseRealtimeTasksReturn {
  tasks: TaskWithCompletion[];
  completions: TaskCompletion[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Check if a task should appear on a given day
 */
function isTaskForDay(task: CarePlanTask, dayOfWeek: DayOfWeek, today: string): boolean {
  if (task.recurrence === 'daily') return true;
  if (task.recurrence === 'specific_days' && task.recurrence_days?.includes(dayOfWeek)) return true;
  if (task.recurrence === 'one_time' && task.one_time_date === today) return true;
  return false;
}

/**
 * Hook for subscribing to real-time task and completion updates
 * Used in both patient app (Today's Plan) and caregiver apps (Dashboard)
 */
export function useRealtimeTasks({
  householdId,
  date,
  dayOfWeek,
  enabled = true,
}: UseRealtimeTasksOptions): UseRealtimeTasksReturn {
  const [tasks, setTasks] = useState<CarePlanTask[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!householdId || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch tasks for the day - match the logic in getTodaysTasks
      const { data: fetchedTasks, error: tasksError } = await supabase
        .from('care_plan_tasks')
        .select('*')
        .eq('household_id', householdId)
        .eq('active', true)
        .or(
          `recurrence.eq.daily,and(recurrence.eq.specific_days,recurrence_days.cs.{${dayOfWeek}}),and(recurrence.eq.one_time,one_time_date.eq.${date})`
        )
        .order('time', { ascending: true });

      if (tasksError) throw tasksError;
      setTasks(fetchedTasks || []);

      // Fetch completions for today
      const { data: fetchedCompletions, error: completionsError } = await supabase
        .from('task_completions')
        .select('*')
        .eq('household_id', householdId)
        .eq('date', date);

      if (completionsError) throw completionsError;
      setCompletions(fetchedCompletions || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setIsLoading(false);
    }
  }, [householdId, date, dayOfWeek, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!householdId || !enabled) return;

    let tasksChannel: RealtimeChannel | null = null;
    let completionsChannel: RealtimeChannel | null = null;

    // Subscribe to task changes (for care plan edits)
    tasksChannel = supabase
      .channel(`tasks:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_plan_tasks',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as CarePlanTask;
            // Only add if it's for the current day
            if (isTaskForDay(newTask, dayOfWeek, date)) {
              setTasks((prev: CarePlanTask[]) =>
                [...prev, newTask].sort((a: CarePlanTask, b: CarePlanTask) => a.time.localeCompare(b.time))
              );
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as CarePlanTask;
            setTasks((prev: CarePlanTask[]) => {
              // Remove if no longer active or not for today
              if (!updatedTask.active || !isTaskForDay(updatedTask, dayOfWeek, date)) {
                return prev.filter((t: CarePlanTask) => t.id !== updatedTask.id);
              }
              // Update existing or add if newly added to today
              const exists = prev.find((t: CarePlanTask) => t.id === updatedTask.id);
              if (exists) {
                return prev
                  .map((t: CarePlanTask) => (t.id === updatedTask.id ? updatedTask : t))
                  .sort((a: CarePlanTask, b: CarePlanTask) => a.time.localeCompare(b.time));
              }
              return [...prev, updatedTask].sort((a: CarePlanTask, b: CarePlanTask) => a.time.localeCompare(b.time));
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedTask = payload.old as CarePlanTask;
            setTasks((prev: CarePlanTask[]) => prev.filter((t: CarePlanTask) => t.id !== deletedTask.id));
          }
        }
      )
      .subscribe();

    // Subscribe to completion changes
    completionsChannel = supabase
      .channel(`completions:${householdId}:${date}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_completions',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          // Only process completions for today
          const completion = (payload.new || payload.old) as TaskCompletion;
          if (completion.date !== date) return;

          if (payload.eventType === 'INSERT') {
            setCompletions((prev: TaskCompletion[]) => {
              // Avoid duplicates
              if (prev.find((c: TaskCompletion) => c.id === completion.id)) return prev;
              return [...prev, completion];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as TaskCompletion;
            setCompletions((prev: TaskCompletion[]) =>
              prev.map((c: TaskCompletion) => (c.id === updated.id ? updated : c))
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as TaskCompletion;
            setCompletions((prev: TaskCompletion[]) => prev.filter((c: TaskCompletion) => c.id !== deleted.id));
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      if (tasksChannel) {
        supabase.removeChannel(tasksChannel);
      }
      if (completionsChannel) {
        supabase.removeChannel(completionsChannel);
      }
    };
  }, [householdId, date, dayOfWeek, enabled]);

  // Combine tasks with their completions
  const tasksWithCompletions: TaskWithCompletion[] = tasks.map((task: CarePlanTask) => ({
    ...task,
    completion: completions.find((c: TaskCompletion) => c.task_id === task.id),
  }));

  return {
    tasks: tasksWithCompletions,
    completions,
    isLoading,
    error,
    refetch: fetchData,
  };
}
