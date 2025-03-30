-- Force remove legacy date and time columns with better error reporting

-- 1. First verify the table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'events'
  ) THEN
    RAISE EXCEPTION 'Cannot drop columns: events table does not exist';
  END IF;
END$$;

-- 2. Drop dates column with explicit error handling
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.events DROP COLUMN IF EXISTS dates;
    RAISE NOTICE 'Successfully dropped dates column';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to drop dates column: %', SQLERRM;
  END;
END$$;

-- 3. Drop times column with explicit error handling
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.events DROP COLUMN IF EXISTS times;
    RAISE NOTICE 'Successfully dropped times column';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to drop times column: %', SQLERRM;
  END;
END$$;

-- 4. Verify columns are gone
DO $$
DECLARE
  dates_exists boolean;
  times_exists boolean;
BEGIN
  -- Check if dates still exists
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'dates'
  ) INTO dates_exists;
  
  -- Check if times still exists
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'times'
  ) INTO times_exists;

  -- Report results
  IF dates_exists OR times_exists THEN
    IF dates_exists THEN
      RAISE WARNING 'dates column still exists after migration';
    END IF;
    IF times_exists THEN
      RAISE WARNING 'times column still exists after migration';
    END IF;
  ELSE
    RAISE NOTICE 'All legacy columns successfully removed';
  END IF;
END$$;

-- 5. Re-apply the comments for documentation
COMMENT ON COLUMN public.events.time_slots IS 'JSON structure for event time slots. Replaced legacy dates and times columns. Format: {"date1": ["time1", "time2"], "date2": ["time1", "time2"]}';
COMMENT ON TABLE public.events IS 'Stores event information with time slots structured as a JSON object mapping dates to arrays of times';
