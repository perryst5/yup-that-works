-- Create events table with time_slots as the primary data structure for dates/times

-- Create the events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    creator_id UUID REFERENCES auth.users(id),
    time_slots JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_locked BOOLEAN DEFAULT false
);

-- Add comment to explain the column purpose
COMMENT ON COLUMN public.events.time_slots IS 'JSON array of date and time slots for the event. Format: [{"date": "YYYY-MM-DD", "times": ["HH:MM", "HH:MM"]}]';

-- Add updated_at trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at' 
    AND tgrelid = 'public.events'::regclass
  ) THEN
    -- Create the function if it doesn't exist
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    -- Create the trigger
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

-- Enable RLS if not already enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Policy for viewing events
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Anyone can view events' 
    AND tablename = 'events'
  ) THEN
    CREATE POLICY "Anyone can view events" 
    ON public.events 
    FOR SELECT USING (true);
  END IF;

  -- Policy for creating events
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Authenticated users can create events' 
    AND tablename = 'events'
  ) THEN
    CREATE POLICY "Authenticated users can create events" 
    ON public.events 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
  END IF;

  -- Policy for updating events
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Creators can update their events' 
    AND tablename = 'events'
  ) THEN
    CREATE POLICY "Creators can update their events" 
    ON public.events 
    FOR UPDATE 
    TO authenticated 
    USING (creator_id = auth.uid())
    WITH CHECK (creator_id = auth.uid());
  END IF;
END
$$;

-- Set proper permissions
GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE ON public.events TO authenticated;
