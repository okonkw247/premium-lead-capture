-- ============================================================
-- Adams X Project — Supabase Database Setup
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. LEADS TABLE (Starter Kit subscribers)
-- Stores every person who claims the free 7-Day Monk Mode Starter Kit.
-- drip_day tracks which email in the sequence they are on (0–7).
-- active = false after Day 7 is complete.
create table if not exists leads (
    id              uuid primary key default gen_random_uuid(),
    first_name      text not null,
    email           text not null unique,
    drip_day        integer not null default 0,
    active          boolean not null default true,
    purchased       boolean not null default false,
    downloaded      boolean not null default false,
    downloaded_at   timestamptz,
    bonus_claimed   boolean not null default false,
    bonus_claimed_at timestamptz,
    created_at      timestamptz not null default now()
);

-- Index for fast daily drip queries
create index if not exists idx_leads_drip
    on leads (active, drip_day)
    where active = true;

-- 2. WAITLIST TABLE (Comeback: Unrecognizable)
-- Stores everyone who wants to be notified at launch.
-- notified = false until the launch blast runs.
create table if not exists waitlist (
    id          uuid primary key default gen_random_uuid(),
    first_name  text not null,
    email       text not null unique,
    notified    boolean not null default false,
    created_at  timestamptz not null default now()
);

-- Index for fast blast queries
create index if not exists idx_waitlist_blast
    on waitlist (notified)
    where notified = false;

-- ============================================================
-- Row Level Security (RLS)
-- We use the service_role key in the backend so we bypass RLS.
-- Enable RLS anyway as a best-practice safety layer.
-- ============================================================
alter table leads   enable row level security;
alter table waitlist enable row level security;

-- Only the service role (backend) can read/write — no public access
drop policy if exists "service_role_only_leads" on leads;
create policy "service_role_only_leads"
    on leads for all
    using (auth.role() = 'service_role');

drop policy if exists "service_role_only_waitlist" on waitlist;
create policy "service_role_only_waitlist"
    on waitlist for all
    using (auth.role() = 'service_role');

-- ============================================================
-- Verification: Run these SELECTs to confirm tables exist
-- ============================================================
select 'leads table' as table_name, count(*) as rows from leads
union all
select 'waitlist table', count(*) from waitlist;
