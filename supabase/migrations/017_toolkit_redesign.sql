-- Caregiver Toolkit Redesign: behaviour management, care network, enhanced wellbeing
-- Adds 4-tab support system with behaviour playbooks, incident tracking,
-- care team coordination, and relief activity logging

-- ============================================================
-- 1. Alter caregiver_wellbeing_logs — add mood_notes
-- ============================================================
ALTER TABLE caregiver_wellbeing_logs
  ADD COLUMN IF NOT EXISTS mood_notes TEXT;

-- ============================================================
-- 2. Behaviour incidents table
-- ============================================================
CREATE TABLE IF NOT EXISTS behaviour_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  behaviour_type TEXT NOT NULL CHECK (behaviour_type IN (
    'agitation', 'wandering', 'sundowning', 'repetitive_questions',
    'refusing_care', 'sleep_disruption', 'aggression', 'shadowing'
  )),
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
  duration_minutes INTEGER,
  possible_triggers TEXT[],
  what_happened TEXT NOT NULL,
  what_helped TEXT,
  location TEXT,
  logged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_behaviour_incidents_household ON behaviour_incidents(household_id);
CREATE INDEX idx_behaviour_incidents_caregiver ON behaviour_incidents(caregiver_id);
CREATE INDEX idx_behaviour_incidents_type ON behaviour_incidents(behaviour_type);
CREATE INDEX idx_behaviour_incidents_logged ON behaviour_incidents(logged_at DESC);

ALTER TABLE behaviour_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can read household behaviour incidents"
  ON behaviour_incidents FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM caregivers WHERE id = auth.uid()
    )
  );

CREATE POLICY "Caregivers can create behaviour incidents"
  ON behaviour_incidents FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can update own behaviour incidents"
  ON behaviour_incidents FOR UPDATE
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can delete own behaviour incidents"
  ON behaviour_incidents FOR DELETE
  USING (caregiver_id = auth.uid());

-- ============================================================
-- 3. Behaviour playbooks table (content in DB for i18n)
-- ============================================================
CREATE TABLE IF NOT EXISTS behaviour_playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  behaviour_type TEXT NOT NULL,
  emoji TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  right_now JSONB NOT NULL,
  understand_why JSONB NOT NULL,
  prevent JSONB NOT NULL,
  when_to_call_doctor JSONB NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(behaviour_type, language)
);

ALTER TABLE behaviour_playbooks ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read playbooks (they are content, not user data)
CREATE POLICY "Authenticated users can read playbooks"
  ON behaviour_playbooks FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- 4. Relief activities table
-- ============================================================
CREATE TABLE IF NOT EXISTS relief_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'box-breathing', '54321-grounding', 'gratitude-moment',
    'progressive-muscle-relaxation', 'mindful-break',
    'breathing-478', 'permission-slip', 'quick-walk'
  )),
  duration_seconds INTEGER,
  mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 5),
  mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 5),
  completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_relief_activities_caregiver ON relief_activities(caregiver_id);
CREATE INDEX idx_relief_activities_completed ON relief_activities(completed_at DESC);

ALTER TABLE relief_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can read own relief activities"
  ON relief_activities FOR SELECT
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can create own relief activities"
  ON relief_activities FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

-- ============================================================
-- 5. Care team members table
-- ============================================================
CREATE TABLE IF NOT EXISTS care_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  can_help_with TEXT[],
  availability_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_care_team_household ON care_team_members(household_id);

ALTER TABLE care_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can read household care team"
  ON care_team_members FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM caregivers WHERE id = auth.uid()
    )
  );

CREATE POLICY "Caregivers can add care team members"
  ON care_team_members FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM caregivers WHERE id = auth.uid()
    )
  );

CREATE POLICY "Caregivers can update household care team"
  ON care_team_members FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM caregivers WHERE id = auth.uid()
    )
  );

CREATE POLICY "Caregivers can remove household care team members"
  ON care_team_members FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM caregivers WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 6. Seed behaviour playbooks (English)
-- ============================================================
INSERT INTO behaviour_playbooks (behaviour_type, emoji, title, description, right_now, understand_why, prevent, when_to_call_doctor, language)
VALUES
  (
    'agitation',
    '😤',
    'Agitation & Restlessness',
    'When your loved one becomes visibly upset, paces, or cannot settle down.',
    '[
      {"step": "Lower your voice and speak slowly — your calm is contagious"},
      {"step": "Remove extra noise or stimulation (turn off TV, dim lights)"},
      {"step": "Offer a simple choice: ''Would you like water or tea?''"},
      {"step": "Try gentle touch on the hand or arm (if welcome)"},
      {"step": "Suggest a familiar activity: looking at photos, folding towels, listening to music"}
    ]'::jsonb,
    '["Overstimulation from too much noise, activity, or unfamiliar people", "Unmet physical needs — hunger, thirst, need for the bathroom, pain", "Frustration from inability to communicate what they need", "Feeling out of control or confused about what is happening", "Side effects from medication changes"]'::jsonb,
    '["Keep daily routines consistent — same wake time, meals, activities", "Watch for early signs: fidgeting, pacing, tone of voice changing", "Ensure basic needs are met before they escalate (bathroom, snack, comfort)", "Limit visitors to 1-2 at a time and keep visits short", "Create a calm-down kit: favorite blanket, music playlist, photo album"]'::jsonb,
    '["Agitation is sudden and out of character — may indicate pain, infection (especially UTI), or medication issue", "Physical aggression that puts anyone at risk of injury", "Agitation lasts more than an hour despite all calming strategies", "You notice new symptoms alongside agitation: fever, confusion beyond baseline, falls"]'::jsonb,
    'en'
  ),
  (
    'wandering',
    '🚶',
    'Wandering & Exit-Seeking',
    'When your loved one tries to leave home or gets disoriented about where they are.',
    '[
      {"step": "Stay calm — do not physically block or grab them"},
      {"step": "Walk alongside them and match their pace"},
      {"step": "Gently redirect: ''Let''s walk this way together''"},
      {"step": "Offer a reason to come back: ''Your tea is ready'' or ''Let me show you something''"},
      {"step": "If outside, guide them home using familiar landmarks"}
    ]'::jsonb,
    '["They may be looking for something familiar — a former home, workplace, or person", "Restlessness or excess energy with no outlet", "Confusion about time — believing they need to ''go to work'' or ''pick up the children''", "Feeling trapped or bored in their current environment", "Following a lifelong habit (daily walks, commute)"]'::jsonb,
    '["Ensure all exits have alerts or door sensors (check Location tab)", "Set up safe zones in the app so you get notified immediately", "Provide supervised walking opportunities daily", "Put up stop signs or ''Do Not Enter'' signs on exit doors", "Keep keys, shoes, and coats out of sight", "Consider a GPS tracker or ensure the patient app location is active"]'::jsonb,
    '["They go missing and cannot be found within 15 minutes — call emergency services", "Wandering at night becomes frequent (may indicate sleep disorder)", "They become aggressive when redirected from leaving", "Wandering is new behavior and came on suddenly"]'::jsonb,
    'en'
  ),
  (
    'sundowning',
    '🌅',
    'Sundowning',
    'Increased confusion, anxiety, or agitation in the late afternoon and evening.',
    '[
      {"step": "Turn on warm, bright lights before sunset — prevent the dimming transition"},
      {"step": "Reduce stimulation: quieter environment, calmer activities"},
      {"step": "Offer a light snack — low blood sugar can worsen symptoms"},
      {"step": "Play familiar, calming music from their era"},
      {"step": "Speak in short, reassuring sentences: ''You are safe. I am here.''"}
    ]'::jsonb,
    '["Internal clock disruption — the brain struggle to regulate circadian rhythms", "End-of-day fatigue makes it harder to cope with confusion", "Decreasing light triggers anxiety (shadows, unfamiliar-looking rooms)", "Accumulated stress from navigating the day", "Less structure in the evening compared to a busy daytime routine"]'::jsonb,
    '["Schedule most demanding activities for the morning", "Keep afternoons calm with gentle walks or music", "Ensure bright, even lighting from 3 PM onward (no dark corners)", "Serve dinner earlier and keep evenings simple and predictable", "Create an evening routine: snack, music, gentle activity, then bed", "Limit caffeine after noon and daytime napping after 2 PM"]'::jsonb,
    '["Sundowning episodes become significantly worse over a short period", "Your loved one becomes a danger to themselves during episodes", "Sleep is severely disrupted (they are up most of the night)", "You suspect a medication may be contributing — never adjust doses without medical guidance"]'::jsonb,
    'en'
  ),
  (
    'repetitive_questions',
    '🔄',
    'Repetitive Questions',
    'When your loved one asks the same question or tells the same story repeatedly.',
    '[
      {"step": "Answer calmly each time — to them, it is the first time asking"},
      {"step": "Address the emotion behind the question, not just the words"},
      {"step": "Try writing the answer on a whiteboard or note card they can see"},
      {"step": "Gently redirect to an activity after answering"},
      {"step": "If you feel frustrated, take a breath — this is the disease, not them"}
    ]'::jsonb,
    '["Short-term memory loss means they genuinely do not remember asking", "The question often reflects an underlying worry or need for reassurance", "''When is lunch?'' might mean ''I am hungry now'' or ''I feel uncertain''", "Repetition can increase when they feel anxious, bored, or understimulated", "Changes in routine can trigger more repetitive questioning"]'::jsonb,
    '["Address underlying needs proactively (regular meals, bathroom, reassurance)", "Keep a visible daily schedule on the wall or fridge", "Create answer cards for the most common questions", "Maintain predictable routines so fewer things feel uncertain", "Provide engaging activities to reduce boredom-driven repetition"]'::jsonb,
    '["Repetitive behavior suddenly increases — may indicate pain, infection, or medication issue", "They become distressed when you cannot answer to their satisfaction", "You find yourself unable to cope — caregiver burnout from repetition is real and valid"]'::jsonb,
    'en'
  ),
  (
    'refusing_care',
    '🚫',
    'Refusing Care',
    'When your loved one resists bathing, dressing, eating, or taking medication.',
    '[
      {"step": "Do not force — step back and try again in 15-20 minutes"},
      {"step": "Simplify the request: break it into one small step at a time"},
      {"step": "Offer choices: ''Would you like the blue shirt or the green one?''"},
      {"step": "Make it social, not clinical: ''Let''s freshen up together before tea''"},
      {"step": "Use their preferred caregiver if possible — sometimes it is about who, not what"}
    ]'::jsonb,
    '["They may feel a loss of control and autonomy", "The task may cause pain, discomfort, or embarrassment they cannot express", "They may not understand what you are asking (communication barriers)", "Past negative experiences associated with the activity", "The approach may feel rushed or forceful"]'::jsonb,
    '["Offer choices whenever possible — even small ones restore dignity", "Match the approach to their best time of day (mornings are usually best)", "Break tasks into tiny steps rather than asking for the whole thing at once", "Use familiar products: same soap, same toothbrush, same routine", "Play their favorite music during care tasks to set a positive mood", "Allow more time — rushing is the number one trigger for refusal"]'::jsonb,
    '["They are refusing all food and water for more than 24 hours", "Medication refusal could have serious medical consequences", "They become aggressive during care and someone is at risk of injury", "You suspect pain is the cause of refusal (watch for grimacing, guarding)"]'::jsonb,
    'en'
  ),
  (
    'sleep_disruption',
    '😴',
    'Sleep Disruption',
    'When your loved one has trouble sleeping, wakes frequently, or reverses day/night patterns.',
    '[
      {"step": "If they wake at night, speak softly and reassure them: ''It is nighttime. You are safe.''"},
      {"step": "Offer warm milk or chamomile tea (avoid caffeine)"},
      {"step": "Keep the room dark and at a comfortable temperature"},
      {"step": "Do not argue about the time — redirect gently"},
      {"step": "Sit quietly with them until they feel calm enough to rest"}
    ]'::jsonb,
    '["Damage to the brain''s sleep-wake center (suprachiasmatic nucleus)", "Daytime napping too much or too late, making nighttime sleep difficult", "Physical discomfort: pain, needing the bathroom, temperature", "Medications (some can cause insomnia or vivid dreams)", "Less physical activity during the day means less sleep pressure at night"]'::jsonb,
    '["Maintain consistent wake and sleep times every day", "Ensure bright light exposure during the day (especially morning)", "Limit naps to 20-30 minutes before 2 PM", "Include physical activity in the daily routine (walking, gentle exercises)", "Create a calming bedtime routine: warm drink, soft music, low lights", "Avoid screens and stimulation 1-2 hours before bedtime"]'::jsonb,
    '["Sleep disruption is new and sudden — rule out pain, infection, medication side effects", "Night wandering puts them at risk of falls or leaving the home", "Both of you are sleep-deprived for more than a week — you need support", "They are excessively drowsy during the day (medication side effect?)"]'::jsonb,
    'en'
  ),
  (
    'aggression',
    '⚠️',
    'Aggression & Hitting',
    'When your loved one becomes physically or verbally aggressive.',
    '[
      {"step": "Your safety comes first — step back to a safe distance"},
      {"step": "Do NOT restrain them unless someone is in immediate danger"},
      {"step": "Stay calm and speak softly: ''I can see you are upset. I am sorry.''"},
      {"step": "Do not argue, correct, or explain — this escalates aggression"},
      {"step": "Remove yourself if needed. Come back when they have calmed."},
      {"step": "After the episode, do not reference it — they likely will not remember"}
    ]'::jsonb,
    '["They are frightened and reacting in fight-or-flight mode", "Pain they cannot express verbally", "Feeling invaded: personal space, being touched unexpectedly, rushed care", "Overstimulation: too many people, noise, or demands", "Misinterpreting what is happening (paranoia, hallucinations in some types)"]'::jsonb,
    '["Watch for early warning signs: clenched jaw, raised voice, pushing away", "Approach from the front, at eye level, with a calm expression", "Avoid surprising them or approaching from behind", "Never rush personal care — it is the most common trigger", "Use gentle, slow movements and narrate what you are doing", "Ensure the environment feels safe, predictable, and non-threatening"]'::jsonb,
    '["Aggression is new and sudden — may indicate delirium, infection, or medication reaction", "Someone has been hurt or is at risk of being hurt", "Aggression is frequent and nothing works to prevent it", "They have access to objects that could cause harm", "You feel unsafe in your own home — this is serious and you deserve help"]'::jsonb,
    'en'
  ),
  (
    'shadowing',
    '👤',
    'Shadowing & Clinging',
    'When your loved one follows you everywhere and becomes anxious when you leave the room.',
    '[
      {"step": "Reassure them: ''I am just going to the kitchen. I will be right back.''"},
      {"step": "Let them come with you if it is safe — resistance increases anxiety"},
      {"step": "Give them a task near you: folding clothes, sorting items"},
      {"step": "Leave a personal item with them (your sweater, a photo) as a comfort object"},
      {"step": "Try audio connection: call out to them from the next room so they hear your voice"}
    ]'::jsonb,
    '["They have lost the ability to remember that you will come back", "Anxiety and fear of being alone or abandoned", "You are their anchor — the one person who makes the world make sense", "Changes in environment or routine increase their need for closeness", "They may be in a phase where attachment behavior intensifies"]'::jsonb,
    '["Establish a routine so they know what comes next (reduces uncertainty)", "Give them purposeful activities to do independently for short periods", "Use a timer or music to mark your absence: ''When this song ends, I will be back''", "Arrange regular respite so you can have breaks without guilt", "Accept that some shadowing is normal — it is their way of feeling safe"]'::jsonb,
    '["Shadowing is accompanied by severe distress that nothing soothes", "You cannot leave the room at all without a crisis — you need respite support", "New clinginess may indicate they are experiencing something frightening (hallucinations, paranoia)", "Your own mental health is suffering from the constant proximity"]'::jsonb,
    'en'
  )
ON CONFLICT (behaviour_type, language) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  right_now = EXCLUDED.right_now,
  understand_why = EXCLUDED.understand_why,
  prevent = EXCLUDED.prevent,
  when_to_call_doctor = EXCLUDED.when_to_call_doctor,
  updated_at = now();

-- ============================================================
-- 7. Update GDPR deletion functions to include new tables
-- ============================================================
CREATE OR REPLACE FUNCTION delete_household_data(p_household_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM behaviour_incidents WHERE household_id = p_household_id;
  DELETE FROM care_team_members WHERE household_id = p_household_id;
  DELETE FROM relief_activities WHERE caregiver_id IN (
    SELECT id FROM caregivers WHERE household_id = p_household_id
  );
  DELETE FROM ai_daily_tips WHERE caregiver_id IN (
    SELECT id FROM caregivers WHERE household_id = p_household_id
  );
  DELETE FROM caregiver_help_requests WHERE household_id = p_household_id;
  DELETE FROM ai_conversations WHERE household_id = p_household_id;
  DELETE FROM caregiver_wellbeing_logs WHERE caregiver_id = p_user_id;
  DELETE FROM weekly_insights WHERE household_id = p_household_id;
  DELETE FROM doctor_visit_reports WHERE household_id = p_household_id;
  DELETE FROM brain_activities WHERE household_id = p_household_id;
  DELETE FROM location_alerts WHERE household_id = p_household_id;
  DELETE FROM safe_zones WHERE household_id = p_household_id;
  DELETE FROM location_logs WHERE household_id = p_household_id;
  DELETE FROM care_journal_entries WHERE household_id = p_household_id;
  DELETE FROM daily_checkins WHERE household_id = p_household_id;
  DELETE FROM task_completions WHERE household_id = p_household_id;
  DELETE FROM care_plan_tasks WHERE household_id = p_household_id;
  DELETE FROM caregivers WHERE id = p_user_id;
  DELETE FROM patients WHERE household_id = p_household_id;
  DELETE FROM households WHERE id = p_household_id;
END;
$$;

CREATE OR REPLACE FUNCTION delete_caregiver_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM behaviour_incidents WHERE caregiver_id = p_user_id;
  DELETE FROM relief_activities WHERE caregiver_id = p_user_id;
  DELETE FROM ai_daily_tips WHERE caregiver_id = p_user_id;
  DELETE FROM caregiver_help_requests WHERE requester_id = p_user_id;
  DELETE FROM ai_conversations WHERE caregiver_id = p_user_id;
  DELETE FROM caregiver_wellbeing_logs WHERE caregiver_id = p_user_id;
  DELETE FROM caregivers WHERE id = p_user_id;
END;
$$;
