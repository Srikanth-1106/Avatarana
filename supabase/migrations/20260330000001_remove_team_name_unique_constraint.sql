-- Remove the unique constraint on team_name in the registrations table
-- This allows different teams across different sports or zones to share the same name if needed
ALTER TABLE registrations 
DROP CONSTRAINT IF EXISTS registrations_team_name_key;

-- Since the user mentioned "duplicate key value violates unique constraint 'registrations_team_name_key'", 
-- dropping this constraint will allow non-unique team names. 

NOTIFY pgrst, 'reload schema';
