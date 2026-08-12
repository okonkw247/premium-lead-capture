-- ============================================================
-- Adams X Project — Survey Responses Supabase Table Setup
-- Run this script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. SURVEY_RESPONSES TABLE
create table if not exists survey_responses (
    id            uuid primary key default gen_random_uuid(),
    created_at    timestamptz not null default now(),
    status        text not null,
    reason        text not null,
    spend_recency text not null,
    open_response text not null
);

-- 2. ROW LEVEL SECURITY (RLS)
alter table survey_responses enable row level security;

-- Allow anonymous public inserts (insert-only policy for anon role)
create policy "anon_insert_survey_responses"
    on survey_responses for insert
    to anon, authenticated, service_role
    with check (true);

-- Prevent public reads (service role can still select for backend analytics)
create policy "service_role_select_survey_responses"
    on survey_responses for select
    using (auth.role() = 'service_role');

-- ============================================================
-- Verification: Run SELECT to confirm table exists
-- ============================================================
select 'survey_responses table' as table_name, count(*) as rows from survey_responses;
