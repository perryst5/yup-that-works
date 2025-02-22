create or replace function verify_splash_password(password text)
returns boolean
language plpgsql security definer
as $$
declare
    stored_hash text;
begin
    select splash_password_hash into stored_hash from app_settings limit 1;
    return crypt(password, stored_hash) = stored_hash;
end;
$$;
