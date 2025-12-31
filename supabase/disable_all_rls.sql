-- Disable Row Level Security on ALL tables to allow Custom Auth access
-- Since we are bypassing Supabase Auth, we must manage security at the application level
-- or use a custom RLS implementation (which is complex). For now, disabling RLS is the requested path.

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_income DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE member_revenue_shares DISABLE ROW LEVEL SECURITY;
