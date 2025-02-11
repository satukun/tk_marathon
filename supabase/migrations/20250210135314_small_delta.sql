/*
  # Consolidate runner columns and constraints

  1. Changes
    - Ensure target_time_number and message_number columns exist
    - Update constraints for valid values
    - Clean up any duplicate constraints
    - Set default values for existing records

  2. Constraints
    - target_time_number: 1-3 (time ranges)
    - message_number: 1-5 (message types)
    - target_time format: HH:MM:SS-HH:MM:SS
*/

-- Drop existing constraints if they exist
ALTER TABLE runners
DROP CONSTRAINT IF EXISTS valid_target_time_number,
DROP CONSTRAINT IF EXISTS valid_message_number,
DROP CONSTRAINT IF EXISTS valid_target_time,
DROP CONSTRAINT IF EXISTS valid_message;

-- Ensure columns exist
ALTER TABLE runners
ADD COLUMN IF NOT EXISTS target_time_number integer,
ADD COLUMN IF NOT EXISTS message_number integer;

-- Add constraints
ALTER TABLE runners
ADD CONSTRAINT valid_target_time_number 
CHECK (target_time_number BETWEEN 1 AND 3);

ALTER TABLE runners
ADD CONSTRAINT valid_message_number 
CHECK (message_number BETWEEN 1 AND 5);

ALTER TABLE runners
ADD CONSTRAINT valid_target_time 
CHECK (target_time SIMILAR TO '[0-9]{2}:[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}:[0-9]{2}');

-- Update existing records with default values
UPDATE runners 
SET target_time_number = 2, -- デフォルトは中間の時間帯
    message_number = 1,     -- デフォルトは最初のメッセージ
    target_time = CASE 
      WHEN target_time_number = 1 THEN '02:00:00-03:30:00'
      WHEN target_time_number = 2 THEN '03:30:00-05:00:00'
      ELSE '05:00:00-06:00:00'
    END
WHERE target_time_number IS NULL 
   OR message_number IS NULL;