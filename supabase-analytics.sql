-- ============================================================
-- Adams X Project — Supabase Table Setup for Dopamine Audits
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists audit_logs (
    id              uuid primary key default gen_random_uuid(),
    work_hours      integer not null,
    screen_time     integer not null,
    exercise_days   integer not null,
    calculated_score integer not null,
    created_at      timestamptz not null default now()
);

-- Enable RLS
alter table audit_logs enable row level security;

-- Only service role can read/write
drop policy if exists "service_role_only_audit_logs" on audit_logs;
create policy "service_role_only_audit_logs"
    on audit_logs for all
    using (auth.role() = 'service_role');
