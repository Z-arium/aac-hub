-- Accounts: profiles, per-user saved data, and self-service account deletion.
-- Paste into the Supabase SQL Editor (or run with the Supabase CLI) once.

-- Profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text check (char_length(display_name) <= 40),
  server text check (char_length(server) <= 40),
  main_character text check (char_length(main_character) <= 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are public" on public.profiles
  for select using (true);
create policy "Users insert their own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy "Users update their own profile" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Create a profile for every new user, named after their Discord name or email.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ), 40)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Saved data ------------------------------------------------------------------
-- One row per browser storage key (checklist progress, timer alerts, ...), so
-- what a user saves on one device follows them to the next.

create table public.user_storage (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  key text not null check (char_length(key) <= 100),
  value jsonb not null check (pg_column_size(value) <= 65536),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_storage enable row level security;

create policy "Users manage their own saved data" on public.user_storage
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Account deletion ------------------------------------------------------------
-- Deleting the auth user cascades to profiles and user_storage.

create function public.delete_my_account() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
