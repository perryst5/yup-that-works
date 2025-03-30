-- Fix the RPC function to ensure proper parameter handling

-- Drop any existing functions
DROP FUNCTION IF EXISTS verify_splash_password(text);
DROP FUNCTION IF EXISTS public.verify_splash_password(text);

-- Create the function with schema-qualified crypt function
CREATE OR REPLACE FUNCTION public.verify_splash_password("password" text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM public.app_settings 
        WHERE splash_password_hash = public.crypt("password", splash_password_hash)
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.verify_splash_password(text) TO anon, authenticated;

-- Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';
