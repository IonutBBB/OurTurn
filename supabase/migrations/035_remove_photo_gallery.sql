-- Migration 035: Remove Photo Gallery feature
-- Photos can be uploaded in caregiver settings but patient app never displays them.
-- The media_url column on brain_activities is kept (used by music activities for YouTube links).

-- 1. Remove 'photo' from brain_activities.activity_type CHECK constraint
ALTER TABLE brain_activities DROP CONSTRAINT IF EXISTS brain_activities_activity_type_check;
ALTER TABLE brain_activities ADD CONSTRAINT brain_activities_activity_type_check
  CHECK (activity_type IN ('reminiscence', 'word_game', 'music', 'creative', 'orientation'));

-- 2. Delete any existing photo-type brain activities
DELETE FROM brain_activities WHERE activity_type = 'photo';

-- 3. Remove photos column from patients table
ALTER TABLE patients DROP COLUMN IF EXISTS photos;

-- 4. Clean biography.photos from existing patient records
UPDATE patients
  SET biography = biography - 'photos'
  WHERE biography IS NOT NULL AND biography ? 'photos';

-- 5. Drop storage policies for patient-photos bucket
DROP POLICY IF EXISTS "Authenticated users can upload patient photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for patient photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete patient photos" ON storage.objects;

-- 6. Delete all objects in patient-photos bucket then delete the bucket
DELETE FROM storage.objects WHERE bucket_id = 'patient-photos';
DELETE FROM storage.buckets WHERE id = 'patient-photos';
