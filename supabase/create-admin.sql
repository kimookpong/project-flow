-- =============================================
-- Create Admin User for ProjectFlow
-- Run this in Supabase SQL Editor
-- =============================================

-- Step 1: Create the admin user
-- Using Supabase's auth.users table structure
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) 
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@projectflow.com',
  crypt('admin1234', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User"}',
  NULL,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@projectflow.com'
);

-- Step 2: Create the admin identity (required for email login)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.id::text,
  NOW(),
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'admin@projectflow.com'
AND NOT EXISTS (
  SELECT 1 FROM auth.identities i WHERE i.user_id = u.id AND i.provider = 'email'
);

-- Step 3: Create the profile
INSERT INTO public.profiles (id, full_name, job_title, avatar_url, created_at, updated_at)
SELECT 
  id,
  'Admin User',
  'System Administrator',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@projectflow.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Admin User',
  job_title = 'System Administrator';

-- Verify the user was created
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@projectflow.com';
