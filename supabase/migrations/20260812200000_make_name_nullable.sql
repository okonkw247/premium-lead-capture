-- Migration: make name column optional in survey_responses
alter table public.survey_responses alter column name drop not null;
