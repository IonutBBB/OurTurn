-- Crisis Hub Rebuild
-- Adds calming_strategies to patients and expands behaviour_type to include hallucinations and fall

-- 1. Add calming_strategies column to patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS calming_strategies TEXT[];

-- 2. Expand behaviour_incidents behaviour_type CHECK constraint
ALTER TABLE behaviour_incidents DROP CONSTRAINT IF EXISTS behaviour_incidents_behaviour_type_check;
ALTER TABLE behaviour_incidents ADD CONSTRAINT behaviour_incidents_behaviour_type_check
  CHECK (behaviour_type IN (
    'agitation', 'wandering', 'sundowning', 'repetitive_questions',
    'refusing_care', 'sleep_disruption', 'aggression', 'shadowing',
    'hallucinations', 'fall'
  ));

-- 3. Expand behaviour_playbooks behaviour_type CHECK constraint
ALTER TABLE behaviour_playbooks DROP CONSTRAINT IF EXISTS behaviour_playbooks_behaviour_type_check;
ALTER TABLE behaviour_playbooks ADD CONSTRAINT behaviour_playbooks_behaviour_type_check
  CHECK (behaviour_type IN (
    'agitation', 'wandering', 'sundowning', 'repetitive_questions',
    'refusing_care', 'sleep_disruption', 'aggression', 'shadowing',
    'hallucinations', 'fall'
  ));

-- 4. Seed behaviour_playbooks for hallucinations and fall
INSERT INTO behaviour_playbooks (behaviour_type, emoji, title, description, right_now, understand_why, prevent, when_to_call_doctor, language)
VALUES
(
  'hallucinations',
  '👁️',
  'Hallucinations',
  'Seeing, hearing, or sensing things that are not there.',
  '[{"step":"Stay calm — do not argue or try to convince them it is not real."},{"step":"Acknowledge their feelings: \"I can see that is upsetting you.\""},{"step":"Gently redirect attention to something tangible — a familiar object, music, or a simple activity."},{"step":"Check environment for shadows, reflections, or background noise that may trigger misperception."},{"step":"If they are frightened, offer reassurance and your physical presence."}]',
  '["Visual hallucinations are common in Lewy body dementia and later-stage Alzheimer''s.","Infections (UTI), dehydration, or medication side effects can also cause them.","Poor lighting and mirrors/reflective surfaces can trigger visual misperceptions."]',
  '["Keep rooms well-lit, especially at dusk and dawn.","Cover or remove mirrors if they cause confusion.","Review medications with the doctor — some can increase hallucinations.","Maintain consistent daily routines."]',
  '["Hallucinations are new or suddenly worse.","They cause significant distress or dangerous behaviour.","Accompanied by fever, confusion, or change in consciousness.","You suspect a medication side effect."]',
  'en'
),
(
  'fall',
  '🤕',
  'Fall or Injury',
  'Has fallen or been found on the floor.',
  '[{"step":"Stay calm. Do NOT rush to lift them — assess first."},{"step":"Ask: \"Does anything hurt?\" Check for obvious injuries (head, hip, wrist)."},{"step":"If they cannot get up or have head/hip pain, call emergency services."},{"step":"If no apparent injury, help them up slowly using a sturdy chair for support."},{"step":"Monitor for 24-48 hours for delayed symptoms (dizziness, confusion, bruising)."}]',
  '["Falls are the leading cause of injury in people with dementia.","Balance, coordination, and spatial awareness decline with disease progression.","Medications (especially sedatives and blood pressure drugs) increase fall risk.","Environmental hazards: loose rugs, poor lighting, clutter."]',
  '["Remove trip hazards (loose rugs, trailing cables, clutter).","Install grab bars in bathroom and handrails on stairs.","Ensure good lighting, especially at night (motion-sensor nightlights).","Encourage supportive footwear — avoid slippers and socks on hard floors.","Consider a falls risk assessment with their doctor."]',
  '["Any head injury, even if they seem fine.","Unable to bear weight or move a limb.","Confusion that is worse than their baseline.","Repeated falls in a short period.","Visible swelling, deformity, or significant bruising."]',
  'en'
)
ON CONFLICT (behaviour_type, language) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  right_now = EXCLUDED.right_now,
  understand_why = EXCLUDED.understand_why,
  prevent = EXCLUDED.prevent,
  when_to_call_doctor = EXCLUDED.when_to_call_doctor;
