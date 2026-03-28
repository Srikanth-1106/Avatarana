-- Create cricket_teams table
CREATE TABLE IF NOT EXISTS cricket_teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  players INT NOT NULL DEFAULT 11,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  nrr NUMERIC NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up RLS
ALTER TABLE cricket_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON cricket_teams;
CREATE POLICY "Allow public read access" ON cricket_teams FOR SELECT USING (true);

-- Seed initial records with 0 points
INSERT INTO cricket_teams (name, zone, players, wins, losses, points, nrr) VALUES
('Mangalore Tigers', 'Mangalore', 11, 0, 0, 0, 0),
('Coastal Strikers', 'Mangalore', 11, 0, 0, 0, 0),
('Puttur Panthers', 'Puttur-Nidpalli', 11, 0, 0, 0, 0),
('Nidpalli Warriors', 'Puttur-Nidpalli', 11, 0, 0, 0, 0),
('Bayar Blaze', 'Bayar', 11, 0, 0, 0, 0),
('Bayar Hawks', 'Bayar', 11, 0, 0, 0, 0),
('Padre Eagles', 'Padre-Katukukke', 11, 0, 0, 0, 0),
('Katukukke Kings', 'Padre-Katukukke', 11, 0, 0, 0, 0),
('Agalpady Arrows', 'Agalpady', 11, 0, 0, 0, 0),
('Agalpady Nomads', 'Agalpady', 11, 0, 0, 0, 0),
('GUKM United', 'Gundyadka-Udupi-Karkala-Moodabidre', 11, 0, 0, 0, 0),
('Udupi Titans', 'Gundyadka-Udupi-Karkala-Moodabidre', 11, 0, 0, 0, 0),
('Kochi Kings', 'Kochi-Taire', 11, 0, 0, 0, 0),
('Taire Tigers', 'Kochi-Taire', 11, 0, 0, 0, 0),
('Bengaluru Royals', 'Bengaluru-Mysuru-Malenadu', 11, 0, 0, 0, 0),
('Mysuru Mavericks', 'Bengaluru-Mysuru-Malenadu', 11, 0, 0, 0, 0),
('Malenadu Rangers', 'Bengaluru-Mysuru-Malenadu', 11, 0, 0, 0, 0);

-- Trigger Realtime for live updates
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE cricket_teams;
