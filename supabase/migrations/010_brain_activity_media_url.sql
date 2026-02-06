-- Add media_url column to brain_activities for photo and music links
ALTER TABLE brain_activities ADD COLUMN media_url TEXT;

-- Create patient-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-photos', 'patient-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload patient photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-photos');

-- Allow public read access for patient photos
CREATE POLICY "Public read access for patient photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'patient-photos');

-- Allow authenticated users to delete their own photos
CREATE POLICY "Authenticated users can delete patient photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patient-photos');
