-- Enable Row Level Security on app_settings table
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow select access to anon users (for splash password verification)
CREATE POLICY "Allow reading app_settings for anyone" 
ON public.app_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Create policy to restrict modifications to service role only
CREATE POLICY "Only service role can modify app settings"
ON public.app_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
