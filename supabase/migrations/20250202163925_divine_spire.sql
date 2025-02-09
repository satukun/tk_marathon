/*
  # Add runner profile fields

  1. Changes
    - Add new columns to `runners` table:
      - `age_group` (text): 年齢層（例：'20-29', '30-39'）
      - `gender` (text): 性別（'male', 'female', 'other'）
      - `runner_name` (text): ランナーネーム

  2. Security
    - 既存のRLSポリシーは維持
*/

-- Add new columns to runners table
ALTER TABLE runners 
ADD COLUMN age_group text,
ADD COLUMN gender text,
ADD COLUMN runner_name text;

-- Add check constraint for age_group
ALTER TABLE runners
ADD CONSTRAINT valid_age_group CHECK (
  age_group IN ('10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-')
);

-- Add check constraint for gender
ALTER TABLE runners
ADD CONSTRAINT valid_gender CHECK (
  gender IN ('male', 'female', 'other')
);