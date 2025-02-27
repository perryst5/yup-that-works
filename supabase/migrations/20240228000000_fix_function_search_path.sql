-- Fix the function search path security issue by altering the function instead of dropping it

-- Update function with explicit search_path settings
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = '' -- Add explicit empty search path for security
AS $$
  SELECT coalesce(
    auth.uid()::text,
    current_setting('request.headers')::json->>'x-anon-id',
    'anonymous'
  );
$$;

-- Re-grant necessary permissions
GRANT EXECUTE ON FUNCTION get_current_user_id() TO anon, authenticated;
