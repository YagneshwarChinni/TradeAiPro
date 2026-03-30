create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  provider text not null default 'email',
  role text not null default 'user' check (role in ('user', 'admin')),
  is_disabled boolean not null default false,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists is_disabled boolean not null default false;

create index if not exists profiles_email_idx on public.profiles(email);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Admin can view all profiles" on public.profiles;
create policy "Admin can view all profiles"
on public.profiles
for select
using (lower(auth.jwt() ->> 'email') = 'yagneshwarchinni@gmail.com');

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Admin can update all profiles" on public.profiles;
create policy "Admin can update all profiles"
on public.profiles
for update
using (lower(auth.jwt() ->> 'email') = 'yagneshwarchinni@gmail.com')
with check (lower(auth.jwt() ->> 'email') = 'yagneshwarchinni@gmail.com');
