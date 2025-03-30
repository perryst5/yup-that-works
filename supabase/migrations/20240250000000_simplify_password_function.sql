-- Simplify the password verification function to avoid parameter issues

-- Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop any existing functions to start fresh
DROP FUNCTION IF EXISTS verify_splash_password(text);
DROP FUNCTION IF EXISTS public.verify_splash_password(text);

-- Create a simple, clear function with standard parameter naming
CREATE OR REPLACE FUNCTION public.verify_splash_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM app_settings 
    WHERE splash_password_hash = crypt(password, splash_password_hash)
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.verify_splash_password(text) TO anon, authenticated;

-- Force PostgREST to refresh schema cache
NOTIFY pgrst, 'reload schema';
