-- Ensure pgcrypto extension is created
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fix the function to use fully qualified table names
CREATE OR REPLACE FUNCTION public.verify_splash_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' -- Empty search path for security
AS $$
DECLARE
    stored_hash text;
BEGIN
    -- Use fully qualified table name
    SELECT splash_password_hash INTO stored_hash
    FROM public.app_settings
    LIMIT 1;
    
    -- Compare using pgcrypto's crypt function
    RETURN stored_hash = public.crypt(password, stored_hash);
END;
$$;

-- Make sure permissions are properly set
GRANT EXECUTE ON FUNCTION public.verify_splash_password(text) TO anon, authenticated;

-- To avoid schema resolution issues, create a wrapper function 
-- with a more permissive search path
CREATE OR REPLACE FUNCTION verify_splash_password(password text) 
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT public.verify_splash_password(password);
$$;

GRANT EXECUTE ON FUNCTION verify_splash_password(text) TO anon, authenticated;
