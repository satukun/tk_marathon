/*
  # Update runners table for messages and target time number

  1. Changes
    - Add target_time_number column (integer)
    - Update valid_target_time constraint
    - Update message constraints

  2. Data Validation
    - target_time_number must be between 1 and 3
    - message must be one of the predefined values
*/

-- Add target_time_number column
ALTER TABLE runners
ADD COLUMN target_time_number integer;

-- Add check constraint for target_time_number
ALTER TABLE runners
ADD CONSTRAINT valid_target_time_number 
CHECK (target_time_number BETWEEN 1 AND 3);

-- Update message constraint
ALTER TABLE runners
ADD CONSTRAINT valid_message
CHECK (message IN (
  '初挑戦！完走するぞ！',
  '自己ベストを更新するぞ！',
  '東京の街を走ることを楽しみます',
  '他の国のランナーたちと交流しながら走るのが楽しみです',
  '走ることを通じて社会に貢献したい'
));