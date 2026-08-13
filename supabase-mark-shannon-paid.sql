-- ============================================================
-- Adams X Project — Mark Shannon as PAID Customer
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Step 1: Find Shannon's record ─────────────────────────────
SELECT 'leads' AS source, id, first_name, email, purchased, active
FROM leads
WHERE email = 'shannonworks75@gmail.com'
UNION ALL
SELECT 'waitlist' AS source, id, first_name, email, purchased, active
FROM waitlist
WHERE email = 'shannonworks75@gmail.com';


-- ── Step 2: Mark Shannon as purchased ─────────────────────────
UPDATE leads
SET purchased = true
WHERE email = 'shannonworks75@gmail.com';

UPDATE waitlist
SET purchased = true
WHERE email = 'shannonworks75@gmail.com';


-- ── Step 3: Enroll Shannon into purchased_subscribers ─────────
INSERT INTO purchased_subscribers (first_name, email, sequence_day, last_sent_at, enrolled_at, active)
SELECT
    first_name,
    email,
    0,
    now(),
    now(),
    true
FROM leads
WHERE email = 'shannonworks75@gmail.com'
ON CONFLICT (email) DO UPDATE
SET
    sequence_day = 0,
    active = true,
    enrolled_at = now(),
    last_sent_at = now();


-- ── Step 4: Verify ────────────────────────────────────────────
SELECT 'leads' AS source, first_name, email, purchased::text
FROM leads WHERE email = 'shannonworks75@gmail.com'
UNION ALL
SELECT 'waitlist', first_name, email, purchased::text
FROM waitlist WHERE email = 'shannonworks75@gmail.com'
UNION ALL
SELECT 'purchased_subscribers', first_name, email, active::text
FROM purchased_subscribers WHERE email = 'shannonworks75@gmail.com';
