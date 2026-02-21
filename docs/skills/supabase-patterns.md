# Skill: Supabase Patterns for OurTurn

## Overview

OurTurn uses Supabase as its complete backend: Postgres database, authentication, real-time subscriptions, file storage, and Edge Functions. This skill covers the patterns to follow.

## Authentication Architecture

### Two Auth Flows

**1. Caregiver Auth (standard Supabase Auth)**
- Email + password signup/login
- OAuth: Google, Apple
- Session managed by Supabase Auth SDK
- Used by both caregiver mobile and web apps
- `auth.users` table stores caregiver accounts
- After auth, query `caregivers` table for profile data

**2. Patient Auth (Care Code — custom)**
- Patient NEVER creates a Supabase auth account
- Patient enters 6-digit Care Code in app
- App calls Edge Function `validate-care-code`
- Edge Function verifies code → returns a signed JWT with `household_id` claim
- Patient app stores this JWT in `expo-secure-store`
- All patient API calls include this JWT
- RLS policies check `household_id` from JWT

```sql
-- Edge Function: validate-care-code
-- Input: { code: "847291" }
-- Verify code exists and is active
SELECT id, care_code FROM households WHERE care_code = $1;
-- If found: generate JWT with household_id claim
-- Return: { token: "eyJ...", household_id: "uuid" }
```

### Care Code Generation

```sql
-- Auto-generate unique 6-digit code on household creation
CREATE OR REPLACE FUNCTION generate_care_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM households WHERE care_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  NEW.care_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_care_code
  BEFORE INSERT ON households
  FOR EACH ROW
  EXECUTE FUNCTION generate_care_code();
```

### Care Code Regeneration

When caregiver regenerates the code:
1. Generate new 6-digit code
2. Invalidate old code (old patient JWTs stop working)
3. Patient app detects auth failure → shows Care Code entry screen again

## Row Level Security (RLS) Patterns

ENABLE RLS ON ALL TABLES. No exceptions.

### Pattern 1: Caregiver Access (via Supabase Auth)

```sql
-- Caregivers can only access their household's data
CREATE POLICY "caregivers_own_household" ON care_plan_tasks
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM caregivers
      WHERE id = auth.uid()
    )
  );
```

### Pattern 2: Patient Access (via Care Code JWT)

```sql
-- Patient devices access data via household_id in JWT
CREATE POLICY "patient_device_read" ON care_plan_tasks
  FOR SELECT
  USING (
    household_id = (current_setting('request.jwt.claims', true)::json->>'household_id')::uuid
  );

-- Patient can write to specific tables (completions, check-ins, location)
CREATE POLICY "patient_device_write_completions" ON task_completions
  FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM care_plan_tasks
      WHERE household_id = (current_setting('request.jwt.claims', true)::json->>'household_id')::uuid
    )
  );
```

### Pattern 3: Role-Based Caregiver Access

```sql
-- Only primary caregivers can edit the care plan
CREATE POLICY "primary_caregiver_edit" ON care_plan_tasks
  FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM caregivers
      WHERE id = auth.uid() AND role = 'primary'
    )
  );

-- All caregivers can read
CREATE POLICY "all_caregivers_read" ON care_plan_tasks
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM caregivers
      WHERE id = auth.uid()
    )
  );
```

## Real-Time Subscriptions

### What to Subscribe To

| Table | Who subscribes | Why |
|---|---|---|
| `task_completions` | Caregiver apps | See when patient marks tasks done |
| `daily_checkins` | Caregiver apps | See check-in results immediately |
| `care_plan_tasks` | Patient app | See when caregiver edits the plan |
| `location_logs` | Caregiver apps | Update map position |
| `location_alerts` | Caregiver apps | Receive safety alerts |
| `care_journal_entries` | Caregiver apps | See new family notes |

### Subscription Pattern (Client)

```typescript
// packages/supabase/realtime.ts
import { supabase } from './client';

export function subscribeToTaskCompletions(
  householdId: string,
  onUpdate: (completion: TaskCompletion) => void
) {
  return supabase
    .channel(`completions:${householdId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'task_completions',
        filter: `household_id=eq.${householdId}`,
      },
      (payload) => onUpdate(payload.new as TaskCompletion)
    )
    .subscribe();
}

// Usage in React component
useEffect(() => {
  const channel = subscribeToTaskCompletions(householdId, (completion) => {
    // Update local state
  });
  return () => { supabase.removeChannel(channel); };
}, [householdId]);
```

### Custom React Hooks Pattern

```typescript
// packages/supabase/hooks/use-realtime-completions.ts
export function useRealtimeCompletions(householdId: string) {
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);

  useEffect(() => {
    // Initial fetch
    fetchTodaysCompletions(householdId).then(setCompletions);

    // Subscribe to changes
    const channel = subscribeToTaskCompletions(householdId, (newCompletion) => {
      setCompletions(prev => [...prev, newCompletion]);
    });

    return () => { supabase.removeChannel(channel); };
  }, [householdId]);

  return completions;
}
```

## Edge Functions Pattern

Edge Functions are Deno-based serverless functions. Use them for:
- AI API calls (Gemini) — keep API keys server-side
- Push notification sending
- Scheduled tasks (cron)
- Care Code validation
- Complex data aggregation (reports)

### Complete Edge Functions List (13 functions)

| Function | Purpose | Trigger |
|---|---|---|
| `aggregate-daily-metrics` | Compute daily summary metrics per household | Cron |
| `check-device-connectivity` | Monitor patient device online/offline status | Cron |
| `check-safe-zone-violation` | Evaluate location against safe zones | DB webhook |
| `escalate-alerts` | Escalate unacknowledged alerts to secondary contacts | Cron |
| `generate-daily-activities` | AI-generate personalized patient activities | Cron (3am UTC) |
| `generate-weekly-insights` | AI-generate weekly care insights | Cron (Sunday midnight) |
| `send-daily-summary` | Evening summary email to caregivers | Cron |
| `send-help-request-notification` | Notify family when caregiver requests help | DB webhook |
| `send-push-notification` | Generic push notification dispatcher | Called by other functions |
| `send-safety-alert` | Push + email for safety events | DB webhook |
| `send-task-reminders` | Patient task reminder push notifications | Cron |
| `transcribe-voice-note` | Gemini 2.5 Flash speech-to-text for voice notes | DB webhook |
| `validate-care-code` | Verify 6-digit code and issue patient JWT | API call |

### Edge Function Template

```typescript
// supabase/functions/function-name/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get request body
    const { someParam } = await req.json();

    // Your logic here...

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Database Webhook → Edge Function Pattern

For automated responses to data changes (e.g., location alert → push notification):

1. Create a database webhook in Supabase Dashboard → Database → Webhooks
2. Trigger: INSERT on `location_alerts`
3. Target: Edge Function URL
4. The Edge Function receives the new row and sends notifications

### Cron (Scheduled) Edge Functions

Use `pg_cron` or Supabase's built-in cron scheduler:

```sql
-- Generate brain activities daily at 3am UTC
SELECT cron.schedule(
  'generate-daily-activities',
  '0 3 * * *',
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/generate-daily-activities',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
  )$$
);
```

## File Storage Pattern

### Buckets

| Bucket | Purpose | Access |
|---|---|---|
| `photos` | Family photos uploaded by caregiver | Authenticated caregivers + patient device |
| `voice-notes` | Patient voice recordings | Authenticated caregivers + patient device |
| `reports` | Generated PDF reports | Authenticated caregivers only |

### Upload Pattern (React Native)

```typescript
// Record voice note → upload to Supabase Storage
const uploadVoiceNote = async (uri: string, householdId: string) => {
  const fileName = `${householdId}/${Date.now()}.m4a`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('voice-notes')
    .upload(fileName, blob, { contentType: 'audio/m4a' });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('voice-notes')
    .getPublicUrl(fileName);

  return publicUrl;
};
```

## Queries Pattern

### Structure

```
packages/supabase/
├── client.ts              ← Initialize Supabase client
├── types.ts               ← Auto-generated database types
├── queries/
│   ├── households.ts      ← Household CRUD + care code
│   ├── tasks.ts           ← Care plan tasks + completions
│   ├── checkins.ts        ← Daily check-ins
│   ├── location.ts        ← Location logs, safe zones, alerts
│   ├── caregivers.ts      ← Caregiver profiles, invites
│   ├── journal.ts         ← Care journal entries
│   ├── activities.ts      ← Brain wellness activities
│   ├── wellbeing.ts       ← Caregiver wellbeing logs
│   └── conversations.ts   ← AI coach conversations
├── hooks/                 ← React hooks wrapping queries + realtime
│   ├── use-todays-tasks.ts
│   ├── use-realtime-completions.ts
│   ├── use-patient-location.ts
│   └── ...
└── realtime.ts            ← Realtime subscription functions
```

### Query Function Pattern

```typescript
// packages/supabase/queries/tasks.ts
import { supabase } from '../client';
import type { CarePlanTask, TaskCompletion } from '@ourturn/shared';

export async function getTodaysTasks(householdId: string, dayOfWeek: string): Promise<CarePlanTask[]> {
  const { data, error } = await supabase
    .from('care_plan_tasks')
    .select('*')
    .eq('household_id', householdId)
    .eq('active', true)
    .or(`recurrence.eq.daily,recurrence_days.cs.{${dayOfWeek}}`)
    .order('time', { ascending: true });

  if (error) throw error;
  return data;
}

export async function completeTask(taskId: string, householdId: string): Promise<TaskCompletion> {
  const { data, error } = await supabase
    .from('task_completions')
    .insert({
      task_id: taskId,
      household_id: householdId,
      date: new Date().toISOString().split('T')[0],
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

## Migration Best Practices

- One migration file per logical change
- Name format: `001_initial_schema.sql`, `002_add_brain_activities.sql`
- Always include both UP and DOWN (even if down is just a comment)
- Test migrations locally before applying to production: `supabase db reset`
- Use `supabase db diff` to generate migrations from Dashboard changes

## Environment Variables

```env
# .env.local (each app)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Only in Edge Functions, NEVER in client apps

# Additional
GOOGLE_AI_API_KEY=...             # Only in Edge Functions + Next.js server
RESEND_API_KEY=re_...             # Only in Edge Functions
GOOGLE_MAPS_API_KEY=AIza...       # Client apps (restricted)
EXPO_PUSH_TOKEN=...               # Edge Functions
```

**CRITICAL: Never expose `SUPABASE_SERVICE_ROLE_KEY` or `GOOGLE_AI_API_KEY` in client-side code. These ONLY go in Edge Functions / server-side.**

### Migration Count

Migrations are numbered sequentially: `001_initial_schema.sql` through `034_feedback.sql` (34 total). Always use the next available number when adding a new migration.
