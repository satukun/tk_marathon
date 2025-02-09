/*
  # Add photo_url column to runners table

  1. Changes
    - Add photo_url column to runners table to store photo URLs
    - Column is nullable to maintain compatibility with existing records
*/

ALTER TABLE runners
ADD COLUMN IF NOT EXISTS photo_url text;