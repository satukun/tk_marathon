-- Drop existing constraints
ALTER TABLE runners
DROP CONSTRAINT IF EXISTS valid_target_time,
DROP CONSTRAINT IF EXISTS valid_message,
DROP CONSTRAINT IF EXISTS valid_target_time_number,
DROP CONSTRAINT IF EXISTS valid_message_number;

-- Update target_time constraint to accept time category
ALTER TABLE runners
ADD CONSTRAINT valid_target_time 
CHECK (target_time IN ('fast', 'middle', 'late'));

-- Add constraints for numbers
ALTER TABLE runners
ADD CONSTRAINT valid_target_time_number 
CHECK (target_time_number BETWEEN 1 AND 3);

ALTER TABLE runners
ADD CONSTRAINT valid_message_number 
CHECK (message_number BETWEEN 1 AND 5);

-- Add constraints for phrases
ALTER TABLE runners
ADD CONSTRAINT valid_phrases
CHECK (
  upper_phrase IS NOT NULL 
  AND lower_phrase IS NOT NULL
  AND length(upper_phrase) > 0 
  AND length(lower_phrase) > 0
);