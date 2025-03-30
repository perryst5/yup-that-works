-- Completely recreate password function with proper exposure and fixups

-- 1. Create pgcrypto extension in public schema explicitly
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 2. Completely remove all existing password verification functions
DROP FUNCTION IF EXISTS verify_splash_password(text);
DROP FUNCTION IF EXISTS public.verify_splash_password(text);

-- 3. Create a simple, unqualified function (important for PostgREST exposure)
CREATE FUNCTION verify_splash_password(password text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM app_settings 
    WHERE splash_password_hash = crypt(password, splash_password_hash)
  );
$$;

-- 4. Grant proper permissions
GRANT EXECUTE ON FUNCTION verify_splash_password(text) TO anon;
GRANT EXECUTE ON FUNCTION verify_splash_password(text) TO authenticated;

-- 5. Create a test password for development
INSERT INTO public.app_settings (splash_password_hash)
SELECT crypt('password', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- 6. Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- 7. Apply the function to ensure it exists in PostgREST's schema cache
SELECT verify_splash_password('test');
