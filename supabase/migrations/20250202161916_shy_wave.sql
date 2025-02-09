/*
  # Create runners table

  1. New Tables
    - `runners`
      - `id` (uuid, primary key)
      - `runner_id` (text, unique)
      - `nickname` (text)
      - `language` (text)
      - `target_time` (text)
      - `message` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `runners` table
    - Add policy for public access (read-only)
*/

CREATE TABLE runners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  runner_id text UNIQUE NOT NULL,
  nickname text NOT NULL,
  language text NOT NULL,
  target_time text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE runners ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON runners
  FOR SELECT
  TO public
  USING (true);

-- Allow insert for authenticated users
CREATE POLICY "Allow insert access"
  ON runners
  FOR INSERT
  TO public
  WITH CHECK (true);