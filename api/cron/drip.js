// ============================================================
// CRON: /api/cron/drip
// Schedule: Daily at 9:00 AM UTC (see vercel.json)
//
// PURPOSE: Send the correct drip email to every active subscriber.
//   - Segment A (waitlist table): 11 emails, 2-day cadence
//   - Segment B (leads table, not on waitlist): 11 emails, 2-day cadence
//     (3 unique B emails, then merges into Segment A from email 4)
//
// CADENCE LOGIC:
//   sequence_day = -1  → not yet enrolled (blast pending)
//   sequence_day = 0   → Email 1 sent (enrolled). Next email at Day 2.
//   last_sent_at + 2 days <= NOW() → send next email, increment sequence_day
//
// PURCHASE SUPPRESSION:
//   purchased = true → skip all further drip emails for that subscriber
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const tpl = require('../../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

// ── SEGMENT A DRIP MAP ───────────────────────────────────────
// sequence_day 0 = Email 1 already sent (blast enrolled them).
// Cron sends Email 2 when sequence_day = 0 + 2 days have passed.
// Maps current sequence_day → next template to send.
const SEG_A_MAP = {
    0:  tpl.segAEmail2,   // Day 2
    1:  tpl.segAEmail3,   // Day 4
    2:  tpl.segAEmail4,   // Day 6
    3:  tpl.segAEmail5,   // Day 8
    4:  tpl.segAEmail6,   // Day 10
    5:  tpl.segAEmail7,   // Day 12
    6:  tpl.segAEmail8,   // Day 14 — LAUNCH DAY
    7:  tpl.segAEmail9,   // Launch Day 3 (Day 17 overall)
    8:  tpl.segAEmail10,  // Launch Day 5 (Day 19 overall)
    9:  tpl.segAEmail11,  // Launch Day 6 (Day 21 overall) — FINAL
};
const SEG_A_LAST_DAY = 9; // after this, deactivate

// ── SEGMENT B DRIP MAP ───────────────────────────────────────
// sequence_day 0 = Email B1 already sent.
// Emails B4-B11 reuse Segment A templates.
const SEG_B_MAP = {
    0:  tpl.segBEmail2,   // Day 2
    1:  tpl.segBEmail3,   // Day 4
    2:  tpl.segAEmail4,   // Day 6 — merge into A from here
    3:  tpl.segAEmail5,   // Day 8
    4:  tpl.segAEmail6,   // Day 10
    5:  tpl.segAEmail7,   // Day 12
    6:  tpl.segAEmail8,   // Day 14 — LAUNCH DAY
    7:  tpl.segAEmail9,   // Launch Day 3
    8:  tpl.segAEmail10,  // Launch Day 5
    9:  tpl.segAEmail11,  // Launch Day 6 — FINAL
};
const SEG_B_LAST_DAY = 9;

// ── 2-DAY CADENCE CHECK ──────────────────────────────────────
// Returns true if at least 44 hours have elapsed since last_sent_at.
// Uses 44h (not 48h) so the cron window doesn't cause a day slip.
function isDue(lastSentAt) {
    if (!lastSentAt) return true; // never sent — always due
    const elapsed = Date.now() - new Date(lastSentAt).getTime();
    return elapsed >= 44 * 60 * 60 * 1000; // 44 hours
}

// ── SEND HELPER ──────────────────────────────────────────────
async function sendEmail(to, templateFn, firstName, email, tag) {
    const { subject, html } = templateFn(firstName, email);
    const result = await resend.emails.send({
        from: `Adams X <${SENDER}>`,
        to,
        subject,
        html,
        reply_to: REPLY_TO,
        tags: [{ name: 'sequence', value: tag }]
    });
    if (result.error) throw new Error(result.error.message || 'Resend error');
    return subject;
}

// ── MAIN HANDLER ─────────────────────────────────────────────
async function handler(req, res) {
    // Auth
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

    console.log('[drip-cron] Starting drip run...');
    const results = { segA: { sent: 0, skipped: 0, errors: [] }, segB: { sent: 0, skipped: 0, errors: [] } };

    // ── PROCESS SEGMENT A (waitlist table) ───────────────────
    const { data: waitlistLeads, error: wErr } = await supabase
        .from('waitlist')
        .select('id, first_name, email, sequence_day, last_sent_at, purchased, active')
        .eq('active', true)
        .eq('purchased', false)
        .gte('sequence_day', 0); // -1 = not yet enrolled by blast

    if (wErr) {
        console.error('[drip-cron] Waitlist fetch error:', wErr);
        return res.status(500).json({ error: 'Failed to fetch waitlist.', details: wErr.message });
    }

    console.log(`[drip-cron] Segment A: ${waitlistLeads.length} active subscriber(s)`);

    for (const lead of waitlistLeads) {
        const templateFn = SEG_A_MAP[lead.sequence_day];

        if (!templateFn) {
            // Past the last email — deactivate
            if (lead.sequence_day >= SEG_A_LAST_DAY) {
                await supabase.from('waitlist').update({ active: false }).eq('id', lead.id);
            }
            results.segA.skipped++;
            continue;
        }

        if (!isDue(lead.last_sent_at)) {
            results.segA.skipped++;
            continue;
        }

        try {
            const subject = await sendEmail(lead.email, templateFn, lead.first_name, lead.email, 'seg-a-launch');
            const nextDay = lead.sequence_day + 1;
            const shouldDeactivate = nextDay > SEG_A_LAST_DAY;
            await supabase.from('waitlist')
                .update({
                    sequence_day: nextDay,
                    last_sent_at: new Date().toISOString(),
                    active: !shouldDeactivate
                })
                .eq('id', lead.id);
            console.log(`[drip-cron] ✅ Seg A | Day ${lead.sequence_day} → "${subject}" → ${lead.email}`);
            results.segA.sent++;
        } catch (err) {
            console.error(`[drip-cron] ❌ Seg A | ${lead.email}:`, err.message);
            results.segA.errors.push({ email: lead.email, error: err.message });
        }

        // Small delay to stay within Resend rate limits
        await new Promise(r => setTimeout(r, 250));
    }

    // ── PROCESS SEGMENT B (leads table, not on waitlist) ─────
    // Excludes anyone in the waitlist table (purchased cross-reference
    // is handled by the purchased column on leads).
    const { data: freeKitLeads, error: lErr } = await supabase
        .from('leads')
        .select('id, first_name, email, sequence_day, last_sent_at, purchased, active, segment, drip_day, created_at')
        .eq('active', true)
        .eq('purchased', false)
        .eq('segment', 'B')
        .gte('sequence_day', 0);

    if (lErr) {
        console.error('[drip-cron] Leads fetch error:', lErr);
        return res.status(500).json({ error: 'Failed to fetch leads.', details: lErr.message });
    }

    console.log(`[drip-cron] Segment B: ${freeKitLeads.length} active subscriber(s)`);

    for (const lead of freeKitLeads) {
        // Buffer check: if lead is on drip_day === 1, ensure created_at is at least 12 hours ago
        if (lead.drip_day === 1 && lead.created_at) {
            const elapsed = Date.now() - new Date(lead.created_at).getTime();
            if (elapsed < 12 * 60 * 60 * 1000) {
                console.log(`[drip-cron] Skipping Segment B lead ${lead.email} — subscribed less than 12 hours ago.`);
                results.segB.skipped++;
                continue;
            }
        }

        const templateFn = SEG_B_MAP[lead.sequence_day];

        if (!templateFn) {
            if (lead.sequence_day >= SEG_B_LAST_DAY) {
                await supabase.from('leads').update({ active: false }).eq('id', lead.id);
            }
            results.segB.skipped++;
            continue;
        }

        if (!isDue(lead.last_sent_at)) {
            results.segB.skipped++;
            continue;
        }

        try {
            const subject = await sendEmail(lead.email, templateFn, lead.first_name, lead.email, 'seg-b-launch');
            const nextDay = lead.sequence_day + 1;
            const shouldDeactivate = nextDay > SEG_B_LAST_DAY;
            await supabase.from('leads')
                .update({
                    sequence_day: nextDay,
                    last_sent_at: new Date().toISOString(),
                    active: !shouldDeactivate
                })
                .eq('id', lead.id);
            console.log(`[drip-cron] ✅ Seg B | Day ${lead.sequence_day} → "${subject}" → ${lead.email}`);
            results.segB.sent++;
        } catch (err) {
            console.error(`[drip-cron] ❌ Seg B | ${lead.email}:`, err.message);
            results.segB.errors.push({ email: lead.email, error: err.message });
        }

        await new Promise(r => setTimeout(r, 250));
    }

    console.log('[drip-cron] Run complete:', results);
    return res.status(200).json({ success: true, ...results });
}

module.exports = handler;