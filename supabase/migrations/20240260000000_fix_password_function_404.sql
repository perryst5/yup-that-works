-- Fix the missing RPC function for password verification

-- Restart PostgREST to clear schema cache
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE application_name = 'postgrest';

-- Force a schema refresh
NOTIFY pgrst, 'reload schema';

-- Make sure pgcrypto extension exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop any existing versions of the function to start fresh
DROP FUNCTION IF EXISTS verify_splash_password(text);
DROP FUNCTION IF EXISTS public.verify_splash_password(text);

-- Create a new, very simple function with the exact parameter name
CREATE OR REPLACE FUNCTION public.verify_splash_password(password text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Simple SQL version to avoid recursion issues
  SELECT EXISTS (
    SELECT 1 
    FROM public.app_settings 
    WHERE splash_password_hash = crypt(password, splash_password_hash)
  );
$$;

-- Grant permissions to both anon and authenticated users
GRANT EXECUTE ON FUNCTION public.verify_splash_password(text) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_splash_password(text) TO authenticated;

-- Create sample password for testing if none exists
INSERT INTO public.app_settings (splash_password_hash)
SELECT crypt('password', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- Force PostgREST to reload schemas
NOTIFY pgrst, 'reload schema';
