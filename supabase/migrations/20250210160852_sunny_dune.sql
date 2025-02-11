/*
  # Fix target_time constraints

  1. Changes
    - Drop existing target_time constraint
    - Add new target_time constraint to accept 'fast', 'middle', 'late'
    - Update existing records to use new format
*/

-- Drop existing constraint
ALTER TABLE runners
DROP CONSTRAINT IF EXISTS valid_target_time;

-- Add new constraint
ALTER TABLE runners
ADD CONSTRAINT valid_target_time 
CHECK (target_time IN ('fast', 'middle', 'late'));

-- Update existing records to use new format
UPDATE runners
SET target_time = CASE target_time_number
  WHEN 1 THEN 'fast'
  WHEN 2 THEN 'middle'
  WHEN 3 THEN 'late'
  ELSE 'middle' -- デフォルト値
END
WHERE target_time NOT IN ('fast', 'middle', 'late');