/*
  # Clean up runners table data
  
  1. Changes
    - 最新の10件を除く古いランナーデータを削除
    - 安全に実行可能な一時テーブルを使用した方式
*/

DO $$ 
BEGIN
  -- 最新の10件のIDを一時テーブルに保存
  CREATE TEMP TABLE latest_runners AS
  SELECT id 
  FROM runners 
  ORDER BY created_at DESC 
  LIMIT 10;

  -- 一時テーブルに含まれないレコードを削除
  DELETE FROM runners 
  WHERE id NOT IN (SELECT id FROM latest_runners);

  -- 一時テーブルを削除
  DROP TABLE latest_runners;
END $$;