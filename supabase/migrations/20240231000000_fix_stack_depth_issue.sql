-- Fix the stack depth limit issue by removing the recursive function call

-- Make sure pgcrypto extension is available in the database
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- First drop any existing functions
DROP FUNCTION IF EXISTS verify_splash_password(text);
DROP FUNCTION IF EXISTS public.verify_splash_password(text);

-- Create a single non-recursive function with a better implementation
-- Use temporary search_path to access crypt function
CREATE OR REPLACE FUNCTION public.verify_splash_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
-- Set search_path temporarily to include pgcrypto
SET search_path = 'public'
AS $$
DECLARE
    stored_hash text;
    result boolean;
BEGIN
    -- Get stored hash
    SELECT splash_password_hash INTO stored_hash
    FROM public.app_settings
    LIMIT 1;
    
    -- Do comparison with crypt function
    result := stored_hash = crypt(password, stored_hash);
    
    RETURN result;
END;
$$;

-- Set proper permissions
GRANT EXECUTE ON FUNCTION public.verify_splash_password(text) TO anon, authenticated;

-- Add a logging function to help debug
CREATE OR REPLACE FUNCTION log_auth_attempt(attempt text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public' 
AS $$
BEGIN
  -- You could log to a table here if needed
  RAISE NOTICE 'Auth attempt: %', attempt;
END;
$$;

GRANT EXECUTE ON FUNCTION log_auth_attempt(text) TO anon, authenticated;
