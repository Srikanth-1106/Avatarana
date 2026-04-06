-- 1. Ensure table exists with all required columns
CREATE TABLE IF NOT EXISTS registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  phone TEXT, -- NULL allowed for children registering without phone numbers
  age INT NOT NULL,
  region TEXT NOT NULL,
  category TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}'::text[],
  team_name TEXT,
  team_members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Standardize column types (for existing tables)
ALTER TABLE registrations 
ALTER COLUMN team_members TYPE JSONB USING (CASE WHEN team_members IS NULL THEN '[]'::jsonb ELSE team_members::jsonb END),
ALTER COLUMN events TYPE TEXT[] USING (CASE WHEN events IS NULL THEN '{}'::text[] ELSE events::text[] END);

-- 3. Set default values
ALTER TABLE registrations 
ALTER COLUMN team_members SET DEFAULT '[]'::jsonb,
ALTER COLUMN events SET DEFAULT '{}'::text[];

-- 4. Set up RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Allow insert for all" ON registrations;
CREATE POLICY "Allow insert for all" ON registrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select for duplicate check" ON registrations;
CREATE POLICY "Allow public select for duplicate check" ON registrations FOR SELECT USING (true);

-- 6. Reload Schema Cache (CRITICAL)
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS dummy_reload TEXT;
ALTER TABLE registrations DROP COLUMN dummy_reload;
NOTIFY pgrst, 'reload schema';
