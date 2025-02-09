/*
  # Update age_group column type

  1. Changes
    - Change age_group column type from text to integer
    - Remove CHECK constraint for age_group
    - Keep existing data by dropping and recreating the column

  2. Security
    - No changes to RLS policies
*/

-- First, drop the CHECK constraint
ALTER TABLE runners
DROP CONSTRAINT IF EXISTS valid_age_group;

-- Then, modify the age_group column
ALTER TABLE runners
ALTER COLUMN age_group TYPE integer USING (
  CASE
    WHEN age_group = '10-19' THEN 15
    WHEN age_group = '20-29' THEN 25
    WHEN age_group = '30-39' THEN 35
    WHEN age_group = '40-49' THEN 45
    WHEN age_group = '50-59' THEN 55
    WHEN age_group = '60-69' THEN 65
    WHEN age_group = '70-79' THEN 75
    WHEN age_group = '80-' THEN 85
    ELSE NULL
  END
);