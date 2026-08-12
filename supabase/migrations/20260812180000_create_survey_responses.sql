-- Migration: create survey_responses table
-- Adams X Project — 6-question feedback survey

create table if not exists public.survey_responses (
    id             uuid primary key default gen_random_uuid(),
    created_at     timestamptz not null default now(),

    -- Q1: Contact info
    name           text not null,
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

-- Row Level Security
alter table public.survey_responses enable row level security;

-- Allow anon key to INSERT (used by the public survey form)
create policy "anon_insert_survey_responses"
    on public.survey_responses for insert
    to anon
    with check (true);

-- Only service_role can SELECT (for backend analytics)
create policy "service_role_select_survey_responses"
    on public.survey_responses for select
    using (auth.role() = 'service_role');
