// ============================================================
// CRON: /api/cron/segment-c-drip
// Schedule: Daily at 9:00 AM UTC (see vercel.json)
//
// PURPOSE: Send 7-email price-increase urgency sequence ($17 → $68)
// to unpurchased leads in `segment_c_urgency` table.
//
// CADENCE LOGIC:
//   Day 0: Email 1 (Sent on enrollment or initial run)
//   Day 1: Email 2 (24h after Email 1)
//   Day 2: Email 3 (24h after Email 2)
//   Day 3: Email 4 (24h after Email 3)
//   Day 4: Email 5 (24h after Email 4)
//   Day 5: Email 6 (24h after Email 5)
//   Day 6: Email 7 (24h after Email 6 — Final Notice, deactivates row)
//
// PURCHASE SUPPRESSION:
//   If buyer exists in `purchased_subscribers` or `purchased = true`,
//   mark `active = false, purchased = true` and skip immediately.
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const tpl = require('../../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

const SEG_C_MAP = {
    0: tpl.segCEmail1, // Day 0
    1: tpl.segCEmail2, // Day 1 (Video)
    2: tpl.segCEmail3, // Day 2 (Part 1 Features)
    3: tpl.segCEmail4, // Day 3 (Part 2 Features)
    4: tpl.segCEmail5, // Day 4 (AI + Support)
    5: tpl.segCEmail6, // Day 5 (48 Hours Left)
    6: tpl.segCEmail7, // Day 6 (Closing Tonight — Final)
};

const LAST_DAY = 6;

// 22-hour minimum gap so daily cron window doesn't miss days
function isDue(lastSentAt) {
    if (!lastSentAt) return true; // never sent — due now
    const elapsed = Date.now() - new Date(lastSentAt).getTime();
    return elapsed >= 22 * 60 * 60 * 1000;
}

// Calculate remaining days until price increase
function getDaysRemaining(priceIncreaseDate) {
    if (!priceIncreaseDate) return 3;
    const diff = new Date(priceIncreaseDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
}

async function handler(req, res) {
    const authHeader = req.headers.authorization;
    const secret = req.headers['x-cron-secret']
        || req.query.secret
        || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured.' });
    }

    console.log('[segment-c-drip] Starting Segment C Urgency drip run...');
    const results = { sent: 0, skipped: 0, suppressed_buyers: 0, errors: [] };

    // Fetch active Segment C leads
    const { data: leads, error } = await supabase
        .from('segment_c_urgency')
        .select('id, first_name, email, sequence_day, last_sent_at, enrolled_at, purchased, active, price_increase_date')
        .eq('active', true)
        .eq('purchased', false)
        .lte('sequence_day', LAST_DAY);

    if (error) {
        console.error('[segment-c-drip] DB fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch segment_c_urgency.', details: error.message });
    }

    console.log(`[segment-c-drip] Found ${leads.length} active lead(s) in Segment C.`);

    // Fetch all current buyers for suppression cross-check
    const { data: buyers } = await supabase
        .from('purchased_subscribers')
        .select('email');
    const buyerSet = new Set((buyers || []).map(b => b.email.toLowerCase().trim()));

    for (const lead of leads) {
        const leadEmail = lead.email.toLowerCase().trim();

        // 1. Suppression check: Has this person purchased?
        if (buyerSet.has(leadEmail)) {
            console.log(`[segment-c-drip] 💳 Suppressing ${lead.email} — already a purchased buyer.`);
            await supabase
                .from('segment_c_urgency')
                .update({ purchased: true, active: false })
                .eq('id', lead.id);
            results.suppressed_buyers++;
            continue;
        }

        // 2. Cadence check: Is it time for the next email?
        if (!isDue(lead.last_sent_at)) {
            results.skipped++;
            continue;
        }

        const templateFn = SEG_C_MAP[lead.sequence_day];
        if (!templateFn) {
            if (lead.sequence_day > LAST_DAY) {
                await supabase.from('segment_c_urgency').update({ active: false }).eq('id', lead.id);
            }
            results.skipped++;
            continue;
        }

        try {
            // Email 5 takes dynamic days remaining parameter
            const daysLeft = getDaysRemaining(lead.price_increase_date);
            const { subject, html } = lead.sequence_day === 4
                ? templateFn(lead.first_name, lead.email, daysLeft)
                : templateFn(lead.first_name, lead.email);

            const emailResult = await resend.emails.send({
                from: `Adams X <${SENDER}>`,
                to: lead.email,
                subject,
                html,
                reply_to: REPLY_TO,
                tags: [
                    { name: 'sequence', value: 'segment-c-urgency' },
                    { name: 'day', value: String(lead.sequence_day) }
                ]
            });

            if (emailResult.error) {
                throw new Error(emailResult.error.message || 'Resend error on Segment C drip');
            }

            const nextDay = lead.sequence_day + 1;
            const shouldDeactivate = nextDay > LAST_DAY;

            await supabase
                .from('segment_c_urgency')
                .update({
                    sequence_day: nextDay,
                    last_sent_at: new Date().toISOString(),
                    active: !shouldDeactivate
                })
                .eq('id', lead.id);

            console.log(`[segment-c-drip] ✅ Seg C | Day ${lead.sequence_day} → "${subject}" → ${lead.email}`);
            results.sent++;

        } catch (err) {
            console.error(`[segment-c-drip] ❌ Seg C | ${lead.email}:`, err.message);
            results.errors.push({ email: lead.email, error: err.message });
        }

        // Delay to respect Resend rate limits
        await new Promise(r => setTimeout(r, 250));
    }

    console.log('[segment-c-drip] Run complete:', results);
    return res.status(200).json({ success: true, ...results });
}

module.exports = handler;
