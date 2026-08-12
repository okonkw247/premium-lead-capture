-- ============================================================
-- Adams X Project — Survey Responses Supabase Table Setup
-- Run this ENTIRE script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Create table with all 6-question fields (name is optional/nullable)
create table if not exists public.survey_responses (
    id             uuid primary key default gen_random_uuid(),
    created_at     timestamptz not null default now(),

    -- Q1: Contact info
    name           text,
    whatsapp       text not null,
    email          text,

    -- Q2: Location
    country        text not null,

    -- Q3: Employment status
    status         text not null,

    -- Q4: Reason not joined
    reason         text not null,

    -- Q5: Spend recency
    spend_recency  text not null,

    -- Q6: Open response
    open_response  text not null
);

-- Ensure name is nullable if table already existed
alter table public.survey_responses alter column name drop not null;

-- ── Row Level Security ───────────────────────────────────────
alter table public.survey_responses enable row level security;

-- Allow anyone (anon key) to INSERT a response
drop policy if exists "anon_insert_survey_responses" on public.survey_responses;
create policy "anon_insert_survey_responses"
    on public.survey_responses for insert
    to anon
    with check (true);

-- Prevent public reads (service role can still read for analytics)
drop policy if exists "service_role_select_survey_responses" on public.survey_responses;
create policy "service_role_select_survey_responses"
    on public.survey_responses for select
    using (auth.role() = 'service_role');

-- ============================================================
-- Verification: Run SELECT to confirm table exists
-- ============================================================
select 'survey_responses table' as table_name, count(*) as rows from public.survey_responses;
