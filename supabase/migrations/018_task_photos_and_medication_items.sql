-- Migration: Add task photos and medication item grouping
-- Allows caregivers to attach photos to any task and group medications

-- Add photo_url column for any task category
ALTER TABLE care_plan_tasks ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT NULL;

-- Add medication_items JSONB column for grouped medications
-- Each item: { name: string, dosage: string, photo_url: string | null }
ALTER TABLE care_plan_tasks ADD COLUMN IF NOT EXISTS medication_items JSONB DEFAULT NULL;

-- Add check constraint: medication_items only when category is 'medication'
ALTER TABLE care_plan_tasks ADD CONSTRAINT medication_items_category_check
  CHECK (medication_items IS NULL OR category = 'medication');

-- Add check constraint: medication_items max 3 items
ALTER TABLE care_plan_tasks ADD CONSTRAINT medication_items_max_three
  CHECK (medication_items IS NULL OR jsonb_array_length(medication_items) <= 3);

-- Create storage bucket for task photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-photos', 'task-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Allow authenticated users to upload photos scoped to their household
CREATE POLICY "Authenticated users can upload task photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM households
    WHERE id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  )
);

-- RLS: Allow authenticated users to update their household's photos
CREATE POLICY "Authenticated users can update task photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'task-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM households
    WHERE id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  )
);

-- RLS: Allow authenticated users to delete their household's photos
CREATE POLICY "Authenticated users can delete task photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM households
    WHERE id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  )
);

-- RLS: Allow public read access (bucket is public)
CREATE POLICY "Public can read task photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'task-photos');
