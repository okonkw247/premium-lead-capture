-- Migration: ensure survey_responses has all required columns
-- This is a safety-net migration that adds missing columns
-- in case the table was created from an older schema (4-column version).
-- Using ADD COLUMN IF NOT EXISTS so it's safe to run multiple times.

-- Add contact columns if they don't exist yet
alter table public.survey_responses
    add column if not exists name           text,
    add column if not exists whatsapp       text,
    add column if not exists email          text,
    add column if not exists country        text;

-- For existing rows (if any), set placeholder values before adding NOT NULL
update public.survey_responses
    set name     = 'unknown'  where name     is null;
update public.survey_responses
    set whatsapp = 'unknown'  where whatsapp is null;
update public.survey_responses
    set country  = 'unknown'  where country  is null;

-- Now enforce NOT NULL on the required columns
alter table public.survey_responses
    alter column name     set not null,
    alter column whatsapp set not null,
    alter column country  set not null;
