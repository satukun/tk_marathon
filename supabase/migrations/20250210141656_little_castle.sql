-- Add target_time_label column
ALTER TABLE runners
ADD COLUMN target_time_label text;

-- Update target_time_label based on target_time_number
UPDATE runners
SET target_time_label = CASE target_time_number
  WHEN 1 THEN '2時間台～3時間30分'
  WHEN 2 THEN '3時間30分～5時間'
  WHEN 3 THEN '5時間～6時間'
  ELSE '3時間30分～5時間' -- デフォルト値
END;

-- Add trigger to automatically update target_time_label
CREATE OR REPLACE FUNCTION update_target_time_label()
RETURNS TRIGGER AS $$
BEGIN
  NEW.target_time_label := CASE NEW.target_time_number
    WHEN 1 THEN '2時間台～3時間30分'
    WHEN 2 THEN '3時間30分～5時間'
    WHEN 3 THEN '5時間～6時間'
    ELSE '3時間30分～5時間'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_target_time_label
  BEFORE INSERT OR UPDATE ON runners
  FOR EACH ROW
  EXECUTE FUNCTION update_target_time_label();