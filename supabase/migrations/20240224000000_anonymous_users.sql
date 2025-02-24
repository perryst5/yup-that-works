create schema if not exists public;

-- Drop and recreate events table
drop table if exists responses;
drop table if exists events;

-- Function to get current user ID
create or replace function get_current_user_id()
returns text
language sql
stable
as $$
  select coalesce(
    auth.uid()::text,
    current_setting('request.headers')::json->>'x-anon-id',
    'anonymous'
  );
$$;

create table events (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    creator_id text not null default get_current_user_id(),
    title text not null,
    description text,
    dates text[] not null,
    times text[] not null
);

create table responses (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references events(id) on delete cascade,
    user_id text not null,  -- Store all IDs as text
    name text not null,
    availability jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table events enable row level security;
alter table responses enable row level security;

-- Simple RLS policies with text casting for auth.uid()
create policy "Anyone can create events"
    on events for insert
    to anon, authenticated
    with check (true);

create policy "Anyone can view events"
    on events for select
    to anon, authenticated
    using (true);

create policy "Creators can update their events"
    on events for update
    to anon, authenticated
    using (creator_id = get_current_user_id());

create policy "Anyone can create responses"
    on responses for insert
    to anon, authenticated
    with check (true);

create policy "Anyone can view responses"
    on responses for select
    to anon, authenticated
    using (true);

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on events to anon, authenticated;
grant all on responses to anon, authenticated;

-- Add migration stored procedure
create or replace function migrate_user_data(old_id text, new_id text)
returns void
language plpgsql
security definer
as $$
begin
  -- Update events
  update events
  set creator_id = new_id
  where creator_id = old_id;

  -- Update responses
  update responses
  set user_id = new_id
  where user_id = old_id;
end;
$$;

-- Grant execute permission
grant execute on function migrate_user_data(text, text) to authenticated;
