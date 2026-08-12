-- ============================================================
-- Adams X Project — MIGRATION: Two-Segment Email Automation
-- Run this in: Supabase Dashboard → SQL Editor
-- Run ONCE before deploying the new code.
-- ============================================================

-- ── 1. EXTEND WAITLIST TABLE (Segment A) ───────────────────
-- These are the people on adamsxproject.com.ng/waitlist

ALTER TABLE waitlist
  ADD COLUMN IF NOT EXISTS segment       text        NOT NULL DEFAULT 'A',
  ADD COLUMN IF NOT EXISTS sequence_day  integer     NOT NULL DEFAULT -1,
  ADD COLUMN IF NOT EXISTS last_sent_at  timestamptz,
  ADD COLUMN IF NOT EXISTS enrolled_at   timestamptz,
  ADD COLUMN IF NOT EXISTS replied       boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS purchased     boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS active        boolean     NOT NULL DEFAULT true;

-- Index for fast drip queries on waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_drip
  ON waitlist (active, purchased, last_sent_at)
  WHERE active = true AND purchased = false;

-- ── 2. EXTEND LEADS TABLE (Segment B) ──────────────────────
-- Monk Mode free kit subscribers not on the waitlist

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS segment       text        NOT NULL DEFAULT 'B',
  ADD COLUMN IF NOT EXISTS sequence_day  integer     NOT NULL DEFAULT -1,
  ADD COLUMN IF NOT EXISTS last_sent_at  timestamptz,
  ADD COLUMN IF NOT EXISTS enrolled_at   timestamptz,
  ADD COLUMN IF NOT EXISTS replied       boolean     NOT NULL DEFAULT false;

-- Index for fast drip queries on leads
CREATE INDEX IF NOT EXISTS idx_leads_drip_v2
  ON leads (active, purchased, last_sent_at)
  WHERE active = true AND purchased = false;

-- ── 3. PURCHASED SUBSCRIBERS TABLE (Post-Purchase Sequence) ─
-- Created when a Whop purchase is confirmed

CREATE TABLE IF NOT EXISTS purchased_subscribers (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    text        NOT NULL,
  email         text        NOT NULL UNIQUE,
  sequence_day  integer     NOT NULL DEFAULT 0,
  last_sent_at  timestamptz,
  enrolled_at   timestamptz NOT NULL DEFAULT now(),
  active        boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast post-purchase drip queries
CREATE INDEX IF NOT EXISTS idx_purchased_drip
  ON purchased_subscribers (active, last_sent_at)
  WHERE active = true;

-- RLS on purchased_subscribers
ALTER TABLE purchased_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_only_purchased" ON purchased_subscribers;
CREATE POLICY "service_role_only_purchased"
  ON purchased_subscribers FOR ALL
  USING (auth.role() = 'service_role');

-- ── 4. VERIFICATION ─────────────────────────────────────────
SELECT 'waitlist columns' AS check_name,
       column_name, data_type
FROM   information_schema.columns
WHERE  table_name = 'waitlist'
  AND  column_name IN ('segment','sequence_day','last_sent_at','enrolled_at','replied','purchased','active')
UNION ALL
SELECT 'leads columns',
       column_name, data_type
FROM   information_schema.columns
WHERE  table_name = 'leads'
  AND  column_name IN ('segment','sequence_day','last_sent_at','enrolled_at','replied')
UNION ALL
SELECT 'purchased_subscribers table',
       column_name, data_type
FROM   information_schema.columns
WHERE  table_name = 'purchased_subscribers'
ORDER BY check_name, column_name;
