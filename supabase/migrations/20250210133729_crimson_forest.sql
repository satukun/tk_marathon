/*
  # Update runners table for time selection and message number

  1. Changes
    - Add message_number column (integer)
    - Add check constraint for target_time
    - Add check constraint for message_number

  2. Data Validation
    - message_number must be between 1 and 3
    - target_time must be one of the predefined values
*/

-- Add message_number column
ALTER TABLE runners
ADD COLUMN message_number integer;

-- Add check constraints
ALTER TABLE runners
ADD CONSTRAINT valid_message_number 
CHECK (message_number BETWEEN 1 AND 3);

ALTER TABLE runners
ADD CONSTRAINT valid_target_time 
CHECK (target_time IN (
  '02:00:00-03:30:00',
  '03:30:00-05:00:00',
  '05:00:00-06:00:00'
));