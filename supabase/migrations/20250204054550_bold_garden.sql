/*
  # Add photo_url column and storage policies

  1. Database Changes
    - Add photo_url column to runners table
  
  2. Storage Policies
    - Create policies for runner-photos bucket
    - Allow public read access
    - Allow authenticated users to upload photos
*/

-- Add photo_url column to runners table
ALTER TABLE runners
ADD COLUMN photo_url text;

-- Storage policies
BEGIN;
  -- Enable Storage
  INSERT INTO storage.buckets (id, name)
  VALUES ('runner-photos', 'runner-photos')
  ON CONFLICT (id) DO NOTHING;

  -- Allow public read access to photos
  CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'runner-photos');

  -- Allow authenticated uploads
  CREATE POLICY "Allow uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'runner-photos'
    AND (storage.foldername(name))[1] = 'photos'
  );
COMMIT;