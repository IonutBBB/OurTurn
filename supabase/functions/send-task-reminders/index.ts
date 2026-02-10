// Send Task Reminders Edge Function
// Runs every 5 minutes to send push notifications for upcoming tasks to patient devices

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface CarePlanTask {
  id: string;
  household_id: string;
  title: string;
  hint_text: string | null;
  time: string;
  category: string;
  recurrence: string;
  recurrence_days: string[];
}

interface Patient {
  id: string;
  name: string;
  household_id: string;
  device_tokens: string[];
  wake_time: string;
  sleep_time: string;
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

// Category emoji mapping
const CATEGORY_EMOJI: Record<string, string> = {
  medication: '💊',
  nutrition: '🥗',
  physical: '🚶',
  cognitive: '🧩',
  social: '💬',
  health: '❤️',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Calculate time window (current time + 5 to 10 minutes)
    const reminderStart = new Date(now.getTime() + 5 * 60 * 1000);
    const reminderEnd = new Date(now.getTime() + 10 * 60 * 1000);
    const startTime = reminderStart.toTimeString().slice(0, 5);
    const endTime = reminderEnd.toTimeString().slice(0, 5);

    // Get day of week
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = daysOfWeek[now.getDay()];
    const todayDate = now.toISOString().split('T')[0];

    console.log(`Checking for tasks between ${startTime} and ${endTime} on ${today}`);

    // Get all active tasks in the reminder window
    const { data: tasks, error: tasksError } = await supabase
      .from('care_plan_tasks')
      .select('*')
      .eq('active', true)
      .gte('time', startTime)
      .lt('time', endTime);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw tasksError;
    }

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No tasks in reminder window', time: currentTime }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter tasks for today
    const todaysTasks = tasks.filter((task: CarePlanTask) => {
      if (task.recurrence === 'daily') return true;
      if (task.recurrence === 'specific_days') {
        return task.recurrence_days?.includes(today);
      }
      if (task.recurrence === 'one_time') {
        // Check one_time_date if it exists
        return true; // Would need to check one_time_date field
      }
      return false;
    });

    if (todaysTasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No tasks for today in window', time: currentTime }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group tasks by household
    const tasksByHousehold = new Map<string, CarePlanTask[]>();
    for (const task of todaysTasks) {
      const existing = tasksByHousehold.get(task.household_id) || [];
      existing.push(task);
      tasksByHousehold.set(task.household_id, existing);
    }

    let notificationsSent = 0;

    // Process each household
    for (const [householdId, householdTasks] of tasksByHousehold) {
      // Check if task already completed today
      const taskIds = householdTasks.map(t => t.id);
      const { data: completions } = await supabase
        .from('task_completions')
        .select('task_id')
        .in('task_id', taskIds)
        .eq('date', todayDate)
        .eq('completed', true);

      const completedTaskIds = new Set(completions?.map(c => c.task_id) || []);

      // Filter out completed tasks
      const pendingTasks = householdTasks.filter(t => !completedTaskIds.has(t.id));

      if (pendingTasks.length === 0) continue;

      // Get patient for this household
      const { data: patient } = await supabase
        .from('patients')
        .select('id, name, device_tokens, wake_time, sleep_time')
        .eq('household_id', householdId)
        .single();

      if (!patient || !patient.device_tokens || patient.device_tokens.length === 0) {
        console.log(`No device tokens for household ${householdId}`);
        continue;
      }

      // Check if patient is in wake hours
      if (!isWithinWakeHours(currentTime, patient.wake_time, patient.sleep_time)) {
        console.log(`Patient ${patient.name} is outside wake hours`);
        continue;
      }

      // Send notifications for each pending task
      for (const task of pendingTasks) {
        const emoji = CATEGORY_EMOJI[task.category] || '📋';
        const messages: ExpoPushMessage[] = patient.device_tokens.map((token: string) => ({
          to: token,
          title: `${emoji} ${task.title}`,
          body: task.hint_text || `It's time for: ${task.title}`,
          sound: 'default',
          channelId: 'task-reminders',
          data: {
            taskId: task.id,
            type: 'task_reminder',
          },
        }));

        // Send to Expo
        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(messages),
        });

        if (response.ok) {
          notificationsSent += messages.length;
          console.log(`Sent reminder for task "${task.title}" to ${patient.name}`);
        } else {
          console.error(`Failed to send notification:`, await response.text());
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        time: currentTime,
        tasksFound: todaysTasks.length,
        notificationsSent,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Task reminder error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send reminders' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function isWithinWakeHours(currentTime: string, wakeTime: string, sleepTime: string): boolean {
  // Default wake/sleep times if not set
  const wake = wakeTime || '08:00';
  const sleep = sleepTime || '21:00';

  // Simple comparison (assumes same day, doesn't handle midnight crossing)
  return currentTime >= wake && currentTime <= sleep;
}
