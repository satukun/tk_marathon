/*
  # Add phrase columns for runners

  1. New Columns
    - `upper_phrase` (text) - 上部のフレーズ
    - `lower_phrase` (text) - 下部のフレーズ

  2. Changes
    - runners テーブルに upper_phrase と lower_phrase カラムを追加
*/

-- Add upper_phrase and lower_phrase columns
ALTER TABLE runners
ADD COLUMN upper_phrase text,
ADD COLUMN lower_phrase text;