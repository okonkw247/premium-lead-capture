-- ============================================================
-- Adams X Project — MIGRATION: Segment C Price-Increase Urgency ($17 → $68)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS segment_c_urgency (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name          text NOT NULL,
    email               text NOT NULL UNIQUE,
    sequence_day        integer NOT NULL DEFAULT 0,
    enrolled_at         timestamptz NOT NULL DEFAULT now(),
    last_sent_at        timestamptz,
    purchased           boolean NOT NULL DEFAULT false,
    active              boolean NOT NULL DEFAULT true,
    price_increase_date timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
    created_at          timestamptz NOT NULL DEFAULT now()
);

-- Index for fast daily cron queries
CREATE INDEX IF NOT EXISTS idx_segment_c_drip
    ON segment_c_urgency (active, purchased, last_sent_at)
    WHERE active = true AND purchased = false;

-- Row Level Security (RLS)
ALTER TABLE segment_c_urgency ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_only_segment_c" ON segment_c_urgency;
CREATE POLICY "service_role_only_segment_c"
    ON segment_c_urgency FOR ALL
    USING (auth.role() = 'service_role');

-- Verification query
SELECT 'segment_c_urgency table created' AS status, count(*) AS initial_rows FROM segment_c_urgency;
