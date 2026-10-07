-- Chạy trong Supabase Dashboard > SQL Editor.
create table if not exists public.usage_logs (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  plan_type   text not null,          -- lesson | corner | outdoor | weekly
  age_group   text,
  domain      text,
  theme       text,
  activity    text,
  action      text not null,          -- generate | revise
  status      text not null,          -- success | cached | rate_limited | error
  cached      boolean not null default false,
  error       text,
  duration_ms integer,
  client_hash text                    -- SHA-256 của IP (không lưu IP gốc)
);

create index if not exists usage_logs_created_at_idx on public.usage_logs (created_at desc);

-- Bật RLS; publishable key (role anon) chỉ được INSERT, không được đọc/sửa/xóa.
-- Xem log qua Dashboard (service_role) hoặc SQL Editor.
alter table public.usage_logs enable row level security;

drop policy if exists "anon can insert usage logs" on public.usage_logs;
create policy "anon can insert usage logs"
  on public.usage_logs for insert
  to anon
  with check (true);
grant insert on public.usage_logs to anon;
grant usage, select on sequence public.usage_logs_id_seq to anon;

-- ===== Quản trị =====
-- Admin đăng nhập bằng Supabase Auth (Dashboard > Authentication > Users > Add user, email + mật khẩu).
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $fn$
  select exists (select 1 from public.admin_users where lower(email) = lower(auth.jwt() ->> 'email'));
$fn$;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admins read usage logs" on public.usage_logs;
create policy "admins read usage logs" on public.usage_logs for select to authenticated using (public.is_admin());

drop policy if exists "admins manage admin_users" on public.admin_users;
create policy "admins manage admin_users" on public.admin_users for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select, insert, delete on public.admin_users to authenticated;
grant select on public.usage_logs to authenticated;

-- Thêm quản trị viên đầu tiên (thay email bằng email của user đã tạo ở Authentication):
-- insert into public.admin_users (email) values ('ban@example.com');
