-- 022_resources.sql
-- Resources tab: journey progress tracking + local support directory

-- ============================================================
-- 1. resource_journey_progress — tracks caregiver progress through post-diagnosis steps
-- ============================================================
CREATE TABLE resource_journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  step_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  checklist_state JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(caregiver_id, step_slug)
);

-- Auto-update updated_at
CREATE TRIGGER update_resource_journey_progress_updated_at
  BEFORE UPDATE ON resource_journey_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE resource_journey_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journey progress"
  ON resource_journey_progress FOR SELECT
  USING (caregiver_id = auth.uid());

CREATE POLICY "Users can insert own journey progress"
  ON resource_journey_progress FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Users can update own journey progress"
  ON resource_journey_progress FOR UPDATE
  USING (caregiver_id = auth.uid());

CREATE POLICY "Users can delete own journey progress"
  ON resource_journey_progress FOR DELETE
  USING (caregiver_id = auth.uid());

-- Index for quick lookups
CREATE INDEX idx_journey_progress_caregiver ON resource_journey_progress(caregiver_id);

-- ============================================================
-- 2. resource_local_support — country-specific support organizations
-- ============================================================
CREATE TABLE resource_local_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('helpline', 'organization', 'government', 'respite', 'financial')),
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  website_url TEXT,
  email TEXT,
  is_24_7 BOOLEAN NOT NULL DEFAULT false,
  language TEXT NOT NULL DEFAULT 'en',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: read-only for all authenticated users
ALTER TABLE resource_local_support ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read local support"
  ON resource_local_support FOR SELECT
  TO authenticated
  USING (true);

-- Index for country lookups
CREATE INDEX idx_local_support_country ON resource_local_support(country_code);

-- ============================================================
-- 3. Seed local support data for DE, AT, GB, CH
-- ============================================================
INSERT INTO resource_local_support (country_code, category, name, description, phone, website_url, email, is_24_7, language, sort_order) VALUES
-- Germany (DE)
('DE', 'helpline', 'Alzheimer Gesellschaft Beratungstelefon', 'National Alzheimer Society counseling hotline for families and caregivers', '030-259379514', 'https://www.deutsche-alzheimer.de', NULL, false, 'de', 1),
('DE', 'helpline', 'Telefonseelsorge', 'Free 24/7 emotional support and crisis counseling', '0800-1110111', 'https://www.telefonseelsorge.de', NULL, true, 'de', 2),
('DE', 'organization', 'Deutsche Alzheimer Gesellschaft', 'National Alzheimer association with local chapters, support groups, and educational resources', NULL, 'https://www.deutsche-alzheimer.de', 'info@deutsche-alzheimer.de', false, 'de', 3),
('DE', 'government', 'Pflegestützpunkte', 'Government-funded local care support centers offering free advice on benefits and care options', NULL, 'https://www.zqp.de/beratung-pflege/', NULL, false, 'de', 4),
('DE', 'respite', 'Verhinderungspflege', 'Statutory respite care benefit — up to 6 weeks replacement care per year', NULL, 'https://www.bundesgesundheitsministerium.de', NULL, false, 'de', 5),
('DE', 'financial', 'Pflegekasse', 'Long-term care insurance fund — applies for care levels (Pflegegrade) and benefits', NULL, 'https://www.bundesgesundheitsministerium.de/pflege', NULL, false, 'de', 6),

-- Austria (AT)
('AT', 'helpline', 'Alzheimer Austria Beratung', 'National Alzheimer hotline for families affected by dementia', '01-3321510', 'https://www.alzheimer-selbsthilfe.at', NULL, false, 'de', 1),
('AT', 'helpline', 'Telefonseelsorge Österreich', 'Free 24/7 emotional support line', '142', 'https://www.telefonseelsorge.at', NULL, true, 'de', 2),
('AT', 'organization', 'Alzheimer Austria', 'National association providing information, support groups, and advocacy for dementia families', NULL, 'https://www.alzheimer-selbsthilfe.at', 'alzheimer@alzheimer-selbsthilfe.at', false, 'de', 3),
('AT', 'government', 'Sozialministeriumservice', 'Federal social ministry service providing disability and care benefits information', NULL, 'https://www.sozialministeriumservice.at', NULL, false, 'de', 4),
('AT', 'respite', 'Kurzzeitpflege', 'Short-term residential respite care available through care homes', NULL, 'https://www.sozialministerium.at', NULL, false, 'de', 5),
('AT', 'financial', 'Pflegegeld', 'Austrian federal care allowance — seven levels based on care needs', NULL, 'https://www.sozialministerium.at/pflegegeld', NULL, false, 'de', 6),

-- United Kingdom (GB)
('GB', 'helpline', 'Alzheimer''s Society Helpline', 'Free dementia support line staffed by trained advisors', '0333-150-3456', 'https://www.alzheimers.org.uk', NULL, false, 'en', 1),
('GB', 'helpline', 'Dementia UK Admiral Nurse Line', 'Specialist dementia nurses available for complex care questions', '0800-888-6678', 'https://www.dementiauk.org', NULL, false, 'en', 2),
('GB', 'helpline', 'Samaritans', 'Free 24/7 emotional support for anyone in distress', '116 123', 'https://www.samaritans.org', NULL, true, 'en', 3),
('GB', 'organization', 'Alzheimer''s Society', 'UK''s leading dementia charity — local groups, online community, and practical resources', NULL, 'https://www.alzheimers.org.uk', 'helpline@alzheimers.org.uk', false, 'en', 4),
('GB', 'organization', 'Dementia UK', 'Specialist dementia nursing charity providing Admiral Nurses and expert guidance', NULL, 'https://www.dementiauk.org', 'info@dementiauk.org', false, 'en', 5),
('GB', 'government', 'NHS Dementia Guide', 'National Health Service information on diagnosis, treatment, and local services', NULL, 'https://www.nhs.uk/conditions/dementia/', NULL, false, 'en', 6),
('GB', 'respite', 'Carers UK', 'National charity supporting carers with breaks, advice, and local services', '0808-808-7777', 'https://www.carersuk.org', NULL, false, 'en', 7),
('GB', 'financial', 'Attendance Allowance', 'UK benefit for over-65s needing help with personal care due to disability', NULL, 'https://www.gov.uk/attendance-allowance', NULL, false, 'en', 8),

-- Switzerland (CH)
('CH', 'helpline', 'Alzheimer Schweiz Beratung', 'National Alzheimer hotline for dementia support and information', '024-426-06-06', 'https://www.alzheimer-schweiz.ch', NULL, false, 'de', 1),
('CH', 'helpline', 'Die Dargebotene Hand', 'Free 24/7 emotional support helpline', '143', 'https://www.143.ch', NULL, true, 'de', 2),
('CH', 'organization', 'Alzheimer Schweiz', 'National Alzheimer association with cantonal sections, support groups, and educational programs', NULL, 'https://www.alzheimer-schweiz.ch', 'info@alz.ch', false, 'de', 3),
('CH', 'government', 'Pro Senectute', 'Largest organization for senior services in Switzerland — consultation, activities, and home help', NULL, 'https://www.prosenectute.ch', NULL, false, 'de', 4),
('CH', 'respite', 'Entlastungsdienste', 'Respite services through Alzheimer Schweiz cantonal sections', NULL, 'https://www.alzheimer-schweiz.ch', NULL, false, 'de', 5),
('CH', 'financial', 'Hilflosenentschädigung', 'Swiss helplessness allowance for individuals needing regular assistance with daily activities', NULL, 'https://www.ahv-iv.ch', NULL, false, 'de', 6);
