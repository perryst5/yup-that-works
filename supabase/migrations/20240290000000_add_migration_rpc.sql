-- Create RPC function to handle user data migration without RLS issues

CREATE OR REPLACE FUNCTION migrate_events(old_id text, new_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Bypass RLS
AS $$
DECLARE
  events_count int := 0;
  events_migrated jsonb;
BEGIN
  -- Find all events created by the old ID
  SELECT COUNT(*) INTO events_count
  FROM events
  WHERE creator_id = old_id;
  
  -- Update the creator_id for all events
  WITH updated_events AS (
    UPDATE events
    SET creator_id = new_id
    WHERE creator_id = old_id
    RETURNING id, title
  )
  SELECT jsonb_agg(row_to_json(updated_events))
  INTO events_migrated
  FROM updated_events;
  
  -- Return information about the migration
  RETURN jsonb_build_object(
    'success', true,
    'count', events_count,
    'events', COALESCE(events_migrated, '[]'::jsonb),
    'old_id', old_id,
    'new_id', new_id
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION migrate_events(text, text) TO anon, authenticated;
