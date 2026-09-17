-- ============================================================
-- Adams X Project — MIGRATION: Segment D — Comeback Blueprint Funnel
-- Run this in: Supabase Dashboard → SQL Editor
-- Run ONCE before deploying the Blueprint funnel code.
-- ============================================================

-- ── 1. BLUEPRINT LEADS TABLE (Segment D) ────────────────────
-- Stores every person who registers for the free Comeback Blueprint.
-- Completely isolated from existing leads/waitlist tables.
-- sequence_day tracks which email they have LAST RECEIVED:
--   0 = Email 1 (Blueprint delivery) sent — cron picks up from here.
--   1 = Email 2 sent ... 7 = Email 8 sent → deactivate.
-- enrolled_at is the exact timestamp of registration (used for
-- relative-day calculations, not just sequence_day counters).

CREATE TABLE IF NOT EXISTS blueprint_leads (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    text        NOT NULL,
  email         text        NOT NULL UNIQUE,  -- normalized to lowercase on insert
  sequence_day  integer     NOT NULL DEFAULT 0,
  last_sent_at  timestamptz,
  enrolled_at   timestamptz NOT NULL DEFAULT now(),
  active        boolean     NOT NULL DEFAULT true,
  purchased     boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast drip queries
CREATE INDEX IF NOT EXISTS idx_blueprint_leads_drip
  ON blueprint_leads (active, purchased, last_sent_at)
  WHERE active = true AND purchased = false;

-- ── 2. ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE blueprint_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_only_blueprint" ON blueprint_leads;
CREATE POLICY "service_role_only_blueprint"
  ON blueprint_leads FOR ALL
  USING (auth.role() = 'service_role');

-- ── 3. SEGMENT C — DEACTIVATION ──────────────────────────────
-- Block any new enrollments by setting a sentinel. Existing rows will be
-- handled individually by the correction email cron (segment-c-correction.js).
-- We do NOT delete existing rows — we preserve the historical data.
-- The segment_c_urgency cron will be replaced with the correction-email cron.

-- ── 4. VERIFICATION ──────────────────────────────────────────
SELECT 'blueprint_leads' AS table_name, count(*) AS rows FROM blueprint_leads
UNION ALL
SELECT 'leads', count(*) FROM leads
UNION ALL
SELECT 'waitlist', count(*) FROM waitlist
UNION ALL
SELECT 'purchased_subscribers', count(*) FROM purchased_subscribers;

-- ── 5. SCHEMA CHECK ──────────────────────────────────────────
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'blueprint_leads'
ORDER BY ordinal_position;
