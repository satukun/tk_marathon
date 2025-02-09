/*
  # Fix Storage Policies

  1. Changes
    - Drop existing storage policies
    - Create new storage policies with proper permissions
    - Enable public access for photos
    - Allow anonymous uploads to the photos folder

  2. Security
    - Enable public read access to runner photos
    - Allow anonymous uploads to the photos folder
    - Restrict uploads to specific file types and paths
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('runner-photos', 'runner-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to photos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'runner-photos');

-- Allow anonymous uploads to photos folder
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'runner-photos'
  AND (storage.foldername(name))[1] = 'photos'
  AND (lower(storage.extension(name)) = 'jpg' OR lower(storage.extension(name)) = 'jpeg')
);

-- Allow anonymous updates
CREATE POLICY "Allow updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'runner-photos')
WITH CHECK (bucket_id = 'runner-photos');

-- Allow anonymous deletes
CREATE POLICY "Allow deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'runner-photos');