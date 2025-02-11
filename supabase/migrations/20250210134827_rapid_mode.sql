/*
  # Add new columns for target time and message numbers

  1. Changes
    - Add target_time_number column (integer)
    - Add message_number column (integer)
    - Add constraints to ensure valid values

  2. Constraints
    - target_time_number must be between 1 and 3
    - message_number must be between 1 and 5
*/

-- Add new columns
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

-- Update existing records (if any) with default values
UPDATE runners 
SET target_time_number = 2, -- デフォルトは中間の時間帯
    message_number = 1      -- デフォルトは最初のメッセージ
WHERE target_time_number IS NULL 
   OR message_number IS NULL;