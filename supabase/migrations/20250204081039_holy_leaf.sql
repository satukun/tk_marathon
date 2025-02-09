/*
  # Remove unused columns from runners table

  1. Changes
    - Remove columns:
      - age_group
      - gender  
      - runner_name
    
  2. Notes
    - This is a non-destructive operation that removes unused columns
    - Existing data in other columns is preserved
*/

-- Remove unused columns from runners table
ALTER TABLE runners 
DROP COLUMN IF EXISTS age_group,
DROP COLUMN IF EXISTS gender,
DROP COLUMN IF EXISTS runner_name;