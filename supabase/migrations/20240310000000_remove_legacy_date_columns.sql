-- Migration to remove legacy date and time columns now that we use time_slots

-- First check if the legacy columns exist
DO $$
DECLARE
  dates_exists boolean;
  times_exists boolean;
BEGIN
  -- Check for dates column
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'dates'
  ) INTO dates_exists;
  
  -- Check for times column
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'times'
  ) INTO times_exists;

  -- If dates column exists, drop it
  IF dates_exists THEN
    EXECUTE 'ALTER TABLE public.events DROP COLUMN dates';
    RAISE NOTICE 'Dropped legacy dates column';
  ELSE
    RAISE NOTICE 'dates column does not exist, no action needed';
  END IF;

  -- If times column exists, drop it
  IF times_exists THEN
    EXECUTE 'ALTER TABLE public.events DROP COLUMN times';
    RAISE NOTICE 'Dropped legacy times column';
  ELSE
    RAISE NOTICE 'times column does not exist, no action needed';
  END IF;
END
$$;

-- Add migration comment to the time_slots column to document the change
COMMENT ON COLUMN public.events.time_slots IS 'JSON structure for event time slots. Replaced legacy dates and times columns. Format: {"date1": ["time1", "time2"], "date2": ["time1", "time2"]}';

-- Add comment to the events table
COMMENT ON TABLE public.events IS 'Stores event information with time slots structured as a JSON object mapping dates to arrays of times';
