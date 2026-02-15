# OurTurn Edge Functions

Supabase Edge Functions for server-side operations.

## Functions

### validate-care-code
Validates 6-digit care codes for patient app authentication. Returns JWT with household_id claim.

**Trigger:** Called by patient app on code entry

**Usage:**
```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/validate-care-code \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJ...",
  "householdId": "uuid",
  "patientName": "Maria",
  "patient": { ... },
  "household": { ... }
}
```

### send-safety-alert
Sends email notifications when location alerts are triggered.

**Trigger:** Database webhook on `location_alerts` INSERT

**Setup:**
1. Go to Supabase Dashboard → Database → Webhooks
2. Create new webhook:
   - Name: `send-safety-alert-email`
   - Table: `location_alerts`
   - Events: INSERT
   - HTTP Request:
     - Method: POST
     - URL: `https://<project-ref>.supabase.co/functions/v1/send-safety-alert`
     - Headers: `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`

### send-push-notification
Sends push notifications to caregivers via Expo Push Notification service when safety alerts are triggered.

**Trigger:** Database webhook on `location_alerts` INSERT

**Setup:**
1. Go to Supabase Dashboard → Database → Webhooks
2. Create new webhook:
   - Name: `send-push-notification`
   - Table: `location_alerts`
   - Events: INSERT
   - HTTP Request:
     - Method: POST
     - URL: `https://<project-ref>.supabase.co/functions/v1/send-push-notification`
     - Headers: `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`

**Note:** Device tokens are stored in `caregivers.device_tokens`.

### send-daily-summary
Sends daily summary emails to caregivers each evening.

**Trigger:** Cron schedule (pg_cron)

**Setup:**
```sql
SELECT cron.schedule(
  'send-daily-summary',
  '0 20 * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/send-daily-summary',
    headers := '{"Authorization": "Bearer <SUPABASE_SERVICE_ROLE_KEY>"}'::jsonb
  )
  $$
);
```

### transcribe-voice-note
Transcribes voice notes using Google Gemini 2.5 Flash audio transcription.

**Trigger:** Called after voice note upload

**Usage:**
```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/transcribe-voice-note \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "voiceNoteUrl": "https://...",
    "checkinId": "uuid",
    "householdId": "uuid"
  }'
```

### generate-daily-activities
Generates personalized brain wellness activities using Google Gemini AI.

**Trigger:** Cron schedule (pg_cron) - runs daily at 3 AM UTC

**Setup:**
```sql
SELECT cron.schedule(
  'generate-daily-activities',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/generate-daily-activities',
    headers := '{"Authorization": "Bearer <SUPABASE_SERVICE_ROLE_KEY>"}'::jsonb
  )
  $$
);
```

**Note:** Only generates activities for households with Plus subscription.

## Environment Variables

Set these in Supabase Dashboard → Settings → Edge Functions:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Auto-set by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (never expose client-side) |
| `SUPABASE_JWT_SECRET` | JWT secret for signing patient tokens |
| `RESEND_API_KEY` | API key from resend.com |
| `GOOGLE_AI_API_KEY` | Google AI API key for Gemini (AI + transcription) |

## Deployment

Deploy functions using the Supabase CLI:

```bash
# Deploy all functions
supabase functions deploy validate-care-code
supabase functions deploy send-safety-alert
supabase functions deploy send-push-notification
supabase functions deploy send-daily-summary
supabase functions deploy transcribe-voice-note
supabase functions deploy generate-daily-activities
supabase functions deploy send-task-reminders
supabase functions deploy generate-weekly-insights
supabase functions deploy notify-activity-completion

# Set secrets
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set GOOGLE_AI_API_KEY=AIza_xxxxx
```

## Testing Locally

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test care code validation
curl -X POST http://localhost:54321/functions/v1/validate-care-code \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'

# Test safety alert
curl -X POST http://localhost:54321/functions/v1/send-safety-alert \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"record": {"id": "test", "household_id": "uuid", "type": "take_me_home_tapped", "triggered_at": "2024-01-01T12:00:00Z"}}'
```

## Database Webhooks Summary

| Webhook | Table | Event | Function |
|---------|-------|-------|----------|
| `send-safety-alert-email` | `location_alerts` | INSERT | `send-safety-alert` |
| `send-push-notification` | `location_alerts` | INSERT | `send-push-notification` |
| `notify-activity-completion` | `activity_sessions` | UPDATE | `notify-activity-completion` |

### notify-activity-completion
Sends push notifications to caregivers when a patient completes a mind game activity.

**Trigger:** Database webhook on `activity_sessions` UPDATE

**Setup:**
1. Go to Supabase Dashboard → Database → Webhooks
2. Create new webhook:
   - Name: `notify-activity-completion`
   - Table: `activity_sessions`
   - Events: UPDATE
   - HTTP Request:
     - Method: POST
     - URL: `https://<project-ref>.supabase.co/functions/v1/notify-activity-completion`
     - Headers: `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`

**Note:** Only sends notifications when `completed_at` transitions from null to a value and `skipped` is false. Controlled by `activity_updates` preference in caregiver notification settings (default: enabled).

### send-task-reminders
Sends push notification reminders to patient devices for upcoming tasks.

**Trigger:** Cron schedule (pg_cron) - runs every 5 minutes

**Setup:**
```sql
SELECT cron.schedule(
  'send-task-reminders',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/send-task-reminders',
    headers := '{"Authorization": "Bearer <SUPABASE_SERVICE_ROLE_KEY>"}'::jsonb
  )
  $$
);
```

### generate-weekly-insights
Generates AI-powered weekly insights based on check-in data, task completions, and journal entries.

**Trigger:** Cron schedule (pg_cron) - runs every Sunday at midnight UTC

**Setup:**
```sql
SELECT cron.schedule(
  'generate-weekly-insights',
  '0 0 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/generate-weekly-insights',
    headers := '{"Authorization": "Bearer <SUPABASE_SERVICE_ROLE_KEY>"}'::jsonb
  )
  $$
);
```

**Note:** Only generates insights for households with Plus subscription.

## Cron Jobs Summary

| Job | Schedule | Function |
|-----|----------|----------|
| `send-daily-summary` | 0 20 * * * (8 PM UTC) | `send-daily-summary` |
| `generate-daily-activities` | 0 3 * * * (3 AM UTC) | `generate-daily-activities` |
| `send-task-reminders` | */5 * * * * (every 5 min) | `send-task-reminders` |
| `generate-weekly-insights` | 0 0 * * 0 (Sunday midnight) | `generate-weekly-insights` |
