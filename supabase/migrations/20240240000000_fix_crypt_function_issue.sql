-- Fix the crypt function issue by using a different approach

-- Ensure pgcrypto extension is created (may have been created in a different schema)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS verify_splash_password(text);
DROP FUNCTION IF EXISTS public.verify_splash_password(text);

-- Create a more reliable verification function using direct schema qualification
-- and avoid search_path issues altogether
CREATE OR REPLACE FUNCTION public.verify_splash_password(password text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Use direct SQL comparison with explicit schema qualifiers
  SELECT EXISTS (
    SELECT 1 
    FROM public.app_settings 
    WHERE public.app_settings.splash_password_hash = 
          public.crypt(password, public.app_settings.splash_password_hash)
  );
$$;

-- Set proper permissions
GRANT EXECUTE ON FUNCTION public.verify_splash_password(text) TO anon, authenticated;
