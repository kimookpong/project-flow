-- Add password and last_login columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Comment on password storage
COMMENT ON COLUMN profiles.password IS 'Stores hashed password for custom auth';
