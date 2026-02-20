import { supabase } from '../client';
import type {
  CarePlanTask,
  CarePlanTaskInsert,
  CarePlanTaskUpdate,
  TaskCompletion,
  TaskCompletionInsert,
  DayOfWeek,
} from '@ourturn/shared';

/**
 * Get today's tasks for a household
 * Returns active tasks that should appear today based on recurrence
 */
export async function getTodaysTasks(
  householdId: string,
  dayOfWeek: DayOfWeek
): Promise<CarePlanTask[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('care_plan_tasks')
    .select('*')
    .eq('household_id', householdId)
    .eq('active', true)
    .or(
      `recurrence.eq.daily,and(recurrence.eq.specific_days,recurrence_days.cs.{${dayOfWeek}}),and(recurrence.eq.one_time,one_time_date.eq.${today})`
    )
    .order('time', { ascending: true });

  if (error) throw error;

  return data;
}

/**
 * Get all active tasks for a household (for weekly view)
 */
export async function getWeekTasks(householdId: string): Promise<CarePlanTask[]> {
  const { data, error } = await supabase
    .from('care_plan_tasks')
    .select('*')
    .eq('household_id', householdId)
    .eq('active', true)
    .order('time', { ascending: true });

  if (error) throw error;

  return data;
}

/**
 * Create a new task
 */
export async function createTask(
  householdId: string,
  task: Omit<CarePlanTaskInsert, 'household_id'>
): Promise<CarePlanTask> {
  const { data, error } = await supabase
    .from('care_plan_tasks')
    .insert({
      household_id: householdId,
      category: task.category,
      title: task.title,
      hint_text: task.hint_text,
      time: task.time,
      recurrence: task.recurrence || 'daily',
      recurrence_days: task.recurrence_days || [],
      active: task.active ?? true,
      one_time_date: task.one_time_date,
      photo_url: task.photo_url ?? null,
      medication_items: task.medication_items ?? null,
      activity_type: task.activity_type ?? null,
      patient_created: task.patient_created ?? false,
      created_by: task.created_by,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Update an existing task
 */
export async function updateTask(
  taskId: string,
  updates: CarePlanTaskUpdate
): Promise<CarePlanTask> {
  const { data, error } = await supabase
    .from('care_plan_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Soft delete a task (set active = false)
 */
export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('care_plan_tasks')
    .update({ active: false })
    .eq('id', taskId);

  if (error) throw error;
}

/**
 * Hard delete a task (permanently remove)
 */
export async function hardDeleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('care_plan_tasks').delete().eq('id', taskId);

  if (error) throw error;
}

/**
 * Get today's completions for a household
 */
export async function getTodaysCompletions(
  householdId: string,
  date: string
): Promise<TaskCompletion[]> {
  const { data, error } = await supabase
    .from('task_completions')
    .select('*')
    .eq('household_id', householdId)
    .eq('date', date);

  if (error) throw error;

  return data;
}

/**
 * Complete a task
 */
export async function completeTask(
  taskId: string,
  householdId: string,
  date: string
): Promise<TaskCompletion> {
  const { data, error } = await supabase
    .from('task_completions')
    .upsert(
      {
        task_id: taskId,
        household_id: householdId,
        date,
        completed: true,
        completed_at: new Date().toISOString(),
        skipped: false,
      },
      { onConflict: 'task_id,date' }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Uncomplete a task (remove completion record)
 */
export async function uncompleteTask(taskId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('task_completions')
    .delete()
    .eq('task_id', taskId)
    .eq('date', date);

  if (error) throw error;
}

/**
 * Skip a task
 */
export async function skipTask(
  taskId: string,
  householdId: string,
  date: string
): Promise<TaskCompletion> {
  const { data, error } = await supabase
    .from('task_completions')
    .upsert(
      {
        task_id: taskId,
        household_id: householdId,
        date,
        completed: false,
        skipped: true,
      },
      { onConflict: 'task_id,date' }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get completion history for a task
 */
export async function getTaskCompletionHistory(
  taskId: string,
  days: number = 30
): Promise<TaskCompletion[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('task_completions')
    .select('*')
    .eq('task_id', taskId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) throw error;

  return data;
}

/**
 * Copy tasks from one day to another
 */
export async function copyDayTasks(
  householdId: string,
  sourceTasks: CarePlanTask[],
  targetDays: DayOfWeek[]
): Promise<CarePlanTask[]> {
  const newTasks: CarePlanTaskInsert[] = sourceTasks.map((task) => ({
    household_id: householdId,
    category: task.category,
    title: task.title,
    hint_text: task.hint_text ?? undefined,
    time: task.time,
    recurrence: 'specific_days' as const,
    recurrence_days: targetDays,
    active: true,
    photo_url: task.photo_url ?? undefined,
    medication_items: task.medication_items ?? undefined,
    activity_type: task.activity_type ?? null,
    created_by: task.created_by ?? undefined,
  }));

  const { data, error } = await supabase
    .from('care_plan_tasks')
    .insert(newTasks)
    .select();

  if (error) throw error;

  return data;
}
