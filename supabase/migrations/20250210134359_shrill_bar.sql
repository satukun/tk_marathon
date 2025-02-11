/*
  # Update message number constraint

  1. Changes
    - Update message_number constraint to allow up to 5 values
    - Update target_time constraint to match new format

  2. Data Validation
    - message_number must be between 1 and 5
    - target_time must match one of the three predefined ranges
*/

-- Drop existing constraint if exists
ALTER TABLE runners
DROP CONSTRAINT IF EXISTS valid_message_number;

-- Update message_number constraint
ALTER TABLE runners
ADD CONSTRAINT valid_message_number 
CHECK (message_number BETWEEN 1 AND 5);

-- Drop existing constraint if exists
ALTER TABLE runners
DROP CONSTRAINT IF EXISTS valid_target_time;

-- Update target_time constraint
ALTER TABLE runners
ADD CONSTRAINT valid_target_time 
CHECK (target_time IN (
  '02:00:00-03:30:00',
  '03:30:00-05:00:00',
  '05:00:00-06:00:00'
));