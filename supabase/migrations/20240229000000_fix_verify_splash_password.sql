-- Fix the function search path security issue for verify_splash_password

-- Drop existing function
DROP FUNCTION IF EXISTS verify_splash_password(text);

-- Recreate function with explicit search_path setting
CREATE OR REPLACE FUNCTION verify_splash_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' -- Add explicit empty search path for security
AS $$
DECLARE
    stored_hash text;
BEGIN
    SELECT splash_password_hash INTO stored_hash
    FROM public.app_settings
    LIMIT 1;
    RETURN stored_hash = crypt(password, stored_hash);
END;
$$;

-- Re-grant necessary permissions
GRANT EXECUTE ON FUNCTION verify_splash_password(text) TO anon, authenticated;
