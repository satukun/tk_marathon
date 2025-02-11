/*
  # Revert changes to original state

  1. Changes
    - Drop all new columns and constraints
    - Restore original target_time format
*/

-- Drop new columns
ALTER TABLE runners
DROP COLUMN IF EXISTS target_time_number,
DROP COLUMN IF EXISTS message_number,
DROP COLUMN IF EXISTS target_time_label,
DROP COLUMN IF EXISTS upper_phrase,
DROP COLUMN IF EXISTS lower_phrase;

-- Drop existing constraints
ALTER TABLE runners
DROP CONSTRAINT IF EXISTS valid_target_time,
DROP CONSTRAINT IF EXISTS valid_message,
DROP CONSTRAINT IF EXISTS valid_target_time_number,
DROP CONSTRAINT IF EXISTS valid_message_number,
DROP CONSTRAINT IF EXISTS valid_phrases;

-- Add back original target_time constraint
ALTER TABLE runners
ADD CONSTRAINT valid_target_time 
CHECK (target_time ~ '^\d{2}:\d{2}:\d{2}$');

-- Update existing records to use original format
UPDATE runners
SET target_time = '04:00:00'
WHERE target_time NOT SIMILAR TO '\d{2}:\d{2}:\d{2}';