-- Fix RPC exposure for password verification function

-- Make sure pgcrypto extension exists
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS verify_splash_password(text);
DROP FUNCTION IF EXISTS public.verify_splash_password(text);

-- Create a properly exposed function
CREATE OR REPLACE FUNCTION verify_splash_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log attempt for debugging
  RAISE NOTICE 'Verifying password';
  
  RETURN EXISTS (
    SELECT 1 
    FROM app_settings 
    WHERE splash_password_hash = crypt(password, splash_password_hash)
  );
END;
$$;

-- Make sure permissions are set correctly
-- This is critical for exposure through PostgREST
GRANT EXECUTE ON FUNCTION verify_splash_password(text) TO anon, authenticated;

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Create sample password if none exists
INSERT INTO public.app_settings (splash_password_hash)
SELECT crypt('password', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- Execute a query to ensure schema cache is refreshed
SELECT 1;
