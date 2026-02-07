-- Add evidence-based intervention tracking columns to care_plan_tasks
-- These columns link AI-generated tasks to their clinical evidence source

ALTER TABLE care_plan_tasks ADD COLUMN IF NOT EXISTS intervention_id TEXT;
ALTER TABLE care_plan_tasks ADD COLUMN IF NOT EXISTS evidence_source TEXT;

COMMENT ON COLUMN care_plan_tasks.intervention_id IS 'Maps to an evidence-based intervention from the curated library';
COMMENT ON COLUMN care_plan_tasks.evidence_source IS 'Clinical citation for the intervention (e.g., FINGER Trial, Ngandu et al., 2015)';
