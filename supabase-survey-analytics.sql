-- ============================================================
-- Adams X Project — Survey Responses Analytics & Outreach Dashboard
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. View: All Survey Responses with Outreach Links ─────────
create or replace view public.v_survey_outreach as
select 
    id,
    created_at,
    coalesce(name, 'N/A') as name,
    whatsapp,
    coalesce(email, 'N/A') as email,
    country,
    status as employment_status,
    reason as reason_not_joined,
    spend_recency as last_spend_recency,
    open_response as what_needs_to_be_true,
    'https://wa.me/' || regexp_replace(whatsapp, '[^0-9]', '', 'g') as direct_whatsapp_link
from public.survey_responses
order by created_at desc;

-- ── 2. Quick Query: Read All Responses & What They Shared ──────
select 
    created_at::date as date,
    name,
    whatsapp,
    email,
    country,
    employment_status,
    reason_not_joined,
    what_needs_to_be_true,
    direct_whatsapp_link
from public.v_survey_outreach
order by created_at desc;


-- ── 3. Breakdown by Reason Not Joined ─────────────────────────
select 
    reason as reason_not_joined,
    count(*) as total_respondents,
    round(count(*) * 100.0 / sum(count(*)) over (), 1) || '%' as percentage
from public.survey_responses
group by reason
order by total_respondents desc;


-- ── 4. List All WhatsApp Contacts for Direct Messaging ────────
select 
    name,
    whatsapp,
    'https://wa.me/' || regexp_replace(whatsapp, '[^0-9]', '', 'g') as wa_link,
    open_response
from public.survey_responses
order by created_at desc;
