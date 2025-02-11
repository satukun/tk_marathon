/*
  # SQL Queries for Runners

  1. 目的
    - ランナーの検索と集計のためのビューとファンクションを作成
    - 目標タイムと意気込みの分布を確認するためのクエリを提供

  2. 内容
    - ランナー検索ビュー
    - 目標タイム分布集計ビュー
    - 意気込み分布集計ビュー
*/

-- ランナー検索ビュー
CREATE OR REPLACE VIEW runner_details AS
SELECT 
  runner_id,
  nickname,
  language,
  target_time,
  target_time_number,
  message,
  message_number,
  created_at,
  CASE target_time_number
    WHEN 1 THEN '2時間台～3時間30分'
    WHEN 2 THEN '3時間30分～5時間'
    WHEN 3 THEN '5時間～'
  END as target_time_range
FROM runners;

-- 目標タイム分布集計ビュー
CREATE OR REPLACE VIEW target_time_distribution AS
SELECT 
  target_time_number,
  CASE target_time_number
    WHEN 1 THEN '2時間台～3時間30分'
    WHEN 2 THEN '3時間30分～5時間'
    WHEN 3 THEN '5時間～'
  END as time_range,
  COUNT(*) as runner_count,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM runners) * 100, 2) as percentage
FROM runners
GROUP BY target_time_number
ORDER BY target_time_number;

-- 意気込み分布集計ビュー
CREATE OR REPLACE VIEW message_distribution AS
SELECT 
  message_number,
  message,
  COUNT(*) as runner_count,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM runners) * 100, 2) as percentage
FROM runners
GROUP BY message_number, message
ORDER BY message_number;

-- ランナー検索関数
CREATE OR REPLACE FUNCTION search_runners(
  search_term text,
  time_range_filter integer DEFAULT NULL,
  message_type_filter integer DEFAULT NULL
)
RETURNS TABLE (
  runner_id text,
  nickname text,
  target_time_range text,
  message text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.runner_id,
    r.nickname,
    CASE r.target_time_number
      WHEN 1 THEN '2時間台～3時間30分'
      WHEN 2 THEN '3時間30分～5時間'
      WHEN 3 THEN '5時間～'
    END as target_time_range,
    r.message,
    r.created_at
  FROM runners r
  WHERE 
    (search_term IS NULL OR 
     r.runner_id ILIKE '%' || search_term || '%' OR 
     r.nickname ILIKE '%' || search_term || '%')
    AND (time_range_filter IS NULL OR r.target_time_number = time_range_filter)
    AND (message_type_filter IS NULL OR r.message_number = message_type_filter)
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql;