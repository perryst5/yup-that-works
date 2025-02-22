-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Drop existing objects if they exist
drop table if exists responses cascade;
drop table if exists events cascade;
drop table if exists app_settings cascade;
drop function if exists verify_splash_password(text);

-- Create base tables
create table app_settings (
    id uuid primary key default gen_random_uuid(),
    splash_password_hash text not null
);

create table events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    dates jsonb not null,
    creator_id uuid references auth.users(id),
    created_at timestamptz default now()
);

create table responses (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references events(id) on delete cascade,
    name text not null,
    selections text[] not null,
    created_at timestamptz default now()
);

-- Create password verification function
create function verify_splash_password(password text)
returns boolean
language plpgsql
security definer
as $$
declare
    stored_hash text;
begin
    select splash_password_hash into stored_hash
    from app_settings
    limit 1;
    return stored_hash = crypt(password, stored_hash);
end;
$$;

-- Set up permissions
grant usage on schema public to anon, authenticated;
grant execute on function verify_splash_password(text) to anon;
grant select on table app_settings to anon;
grant select, insert on events to anon, authenticated;
grant update, delete on events to authenticated;

-- Enable RLS
alter table events enable row level security;
alter table responses enable row level security;

-- Event policies
create policy "Allow event creation" on events
    for insert to public
    with check ((auth.uid() is null and creator_id is null) or (auth.uid() = creator_id));

create policy "Allow public read access" on events
    for select to public using (true);

create policy "Allow creators to update events" on events
    for update using (creator_id = auth.uid());

create policy "Allow creators to delete events" on events
    for delete using (creator_id = auth.uid());

-- Response policies
create policy "Allow public read access to responses" on responses
    for select to public using (true);

create policy "Allow public insert access to responses" on responses
    for insert to public with check (true);

-- Initial data
insert into app_settings (splash_password_hash) 
values (crypt('586steveisthecoolest', gen_salt('bf', 10)));
