-- Fix the crypt function issue by using a different approach

-- Ensure pgcrypto extension is created
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS verify_splash_password(text);
DROP FUNCTION IF EXISTS public.verify_splash_password(text);

-- Create a more reliable verification function using proper schema references
CREATE OR REPLACE FUNCTION public.verify_splash_password(password text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Use pgcrypto without explicit schema qualification to let PostgreSQL resolve it
  SELECT EXISTS (
    SELECT 1 
    FROM public.app_settings 
    WHERE public.app_settings.splash_password_hash = 
          crypt(password, public.app_settings.splash_password_hash)
  );
$$;

-- Set proper permissions
GRANT EXECUTE ON FUNCTION public.verify_splash_password(text) TO anon, authenticated;
