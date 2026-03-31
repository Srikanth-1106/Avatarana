-- Create event_results table for storing point allocations per event
CREATE TABLE IF NOT EXISTS event_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('Group', 'Individual')),
  zone TEXT NOT NULL,
  position INT NOT NULL CHECK (position IN (1, 2, 3)),
  points INT NOT NULL DEFAULT 0,
  participant_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, zone, position)
);

-- Set up RLS
ALTER TABLE event_results ENABLE ROW LEVEL SECURITY;

-- Allow public read
DROP POLICY IF EXISTS "Allow public read access" ON event_results;
CREATE POLICY "Allow public read access" ON event_results FOR SELECT USING (true);

-- Allow insert for all (admin will handle auth at app level)
DROP POLICY IF EXISTS "Allow insert for all" ON event_results;
CREATE POLICY "Allow insert for all" ON event_results FOR INSERT WITH CHECK (true);

-- Allow update for all
DROP POLICY IF EXISTS "Allow update for all" ON event_results;
CREATE POLICY "Allow update for all" ON event_results FOR UPDATE USING (true);

-- Allow delete for all
DROP POLICY IF EXISTS "Allow delete for all" ON event_results;
CREATE POLICY "Allow delete for all" ON event_results FOR DELETE USING (true);

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
