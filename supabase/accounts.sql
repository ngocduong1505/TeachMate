-- Tài khoản giáo viên: lưu giáo án và hồ sơ lớp theo từng người. Chạy trong Supabase SQL Editor.
-- (Tùy chọn) Authentication > Providers > Email > tắt "Confirm email" nếu muốn đăng ký xong dùng được ngay.

create table if not exists public.plans (
  id         uuid primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type       text not null,
  title      text not null,
  form       jsonb not null,
  request    jsonb not null,
  plan       jsonb not null,
  favorite   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists plans_user_updated_idx on public.plans (user_id, updated_at desc);

create table if not exists public.class_profiles (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  school_year text not null,
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, school_year)
);

alter table public.plans enable row level security;
alter table public.class_profiles enable row level security;

drop policy if exists "own plans" on public.plans;
create policy "own plans" on public.plans for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own class profiles" on public.class_profiles;
create policy "own class profiles" on public.class_profiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on public.plans to authenticated;
grant select, insert, update, delete on public.class_profiles to authenticated;
