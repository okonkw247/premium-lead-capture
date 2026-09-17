// ============================================================
// CRON: /api/cron/blueprint-drip
// Schedule: Daily at 9:00 AM UTC (see vercel.json)
//
// PURPOSE: Segment D — Comeback Blueprint Funnel
//   Sends Education Emails 2–8 to blueprint_leads who registered
//   for the free Comeback: Unrecognizable Blueprint.
//
// SEQUENCE STATE LOGIC:
//   sequence_day = 0  → Email 1 (Blueprint delivery) already sent at registration.
//                        Cron picks up from here.
//   sequence_day = 1  → Email 2 sent (Day 2)
//   sequence_day = 2  → Email 3 sent (Day 4)
//   ...
//   sequence_day = 7  → Email 8 sent (Day 14) → deactivate
//
// CADENCE:
//   Each email is due approximately 2 days (44h) after the previous one.
//   We use enrolled_at + (sequence_day * 2 days) as the reference time
//   so that a delayed cron does NOT cause emails to bunch up.
//   The 44h gap check is an ADDITIONAL safety guard — both must pass.
//
// PURCHASE SUPPRESSION (CRITICAL):
//   Before sending ANY email, cross-check purchased_subscribers.
//   If found → set purchased = true, active = false on blueprint_leads.
//   STOP sending sales/education emails to this person.
//
// IDEMPOTENCY:
//   Email 1 is sent at registration time only (server.js).
//   The cron never sends Email 1. sequence_day 0 means "ready for Email 2".
//   Each increment is written to DB before the next cron run.
//   Safe to run repeatedly — will not double-send.
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const tpl = require('../../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER   = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

// ── SEQUENCE MAP ─────────────────────────────────────────────
// Maps current sequence_day → next email template to send.
// sequence_day 0 = Email 1 already sent. Cron sends Email 2 when 44h elapsed.
const BLUEPRINT_MAP = {
    0: { fn: tpl.blueprintEmail2, daysOffset: 2  }, // Email 2 — Day 2
    1: { fn: tpl.blueprintEmail3, daysOffset: 4  }, // Email 3 — Day 4
    2: { fn: tpl.blueprintEmail4, daysOffset: 6  }, // Email 4 — Day 6
    3: { fn: tpl.blueprintEmail5, daysOffset: 8  }, // Email 5 — Day 8
    4: { fn: tpl.blueprintEmail6, daysOffset: 10 }, // Email 6 — Day 10
    5: { fn: tpl.blueprintEmail7, daysOffset: 12 }, // Email 7 — Day 12
    6: { fn: tpl.blueprintEmail8, daysOffset: 14 }, // Email 8 — Day 14 (Direct Offer)
};
const LAST_DAY = 6; // after processing sequence_day 6, deactivate

// ── CADENCE GUARD ─────────────────────────────────────────────
// Returns true if BOTH conditions pass:
//  1. At least 44 hours have elapsed since last_sent_at (prevents doubling)
//  2. The absolute day offset from enrolled_at is >= the expected offset
//     (prevents bunching when a cron was delayed)
function isDue(lead, daysOffset) {
    const now = Date.now();

    // Check 1: 44-hour minimum gap since last send
    if (lead.last_sent_at) {
        const sinceLastSend = now - new Date(lead.last_sent_at).getTime();
        if (sinceLastSend < 44 * 60 * 60 * 1000) return false;
    }

    // Check 2: Enrolled_at + expected offset has passed
    if (lead.enrolled_at) {
        const expectedSendTime = new Date(lead.enrolled_at).getTime() + (daysOffset * 24 * 60 * 60 * 1000);
        if (now < expectedSendTime) return false;
    }

    return true;
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

    console.log('[blueprint-drip] Starting Segment D drip run...');
    const results = { sent: 0, skipped: 0, suppressed_buyers: 0, errors: [] };

    // ── Fetch active Blueprint leads not yet at the end ─────
    const { data: leads, error: fetchErr } = await supabase
        .from('blueprint_leads')
        .select('id, first_name, email, sequence_day, last_sent_at, enrolled_at, purchased, active')
        .eq('active', true)
        .eq('purchased', false)
        .lte('sequence_day', LAST_DAY);

    if (fetchErr) {
        console.error('[blueprint-drip] DB fetch error:', fetchErr);
        return res.status(500).json({ error: 'Failed to fetch blueprint_leads.', details: fetchErr.message });
    }

    console.log(`[blueprint-drip] Found ${leads.length} active Blueprint lead(s).`);

    // ── Fetch all current buyers for purchase suppression ───
    const { data: buyers } = await supabase
        .from('purchased_subscribers')
        .select('email');
    const buyerSet = new Set((buyers || []).map(b => b.email.toLowerCase().trim()));

    // ── Process each lead ───────────────────────────────────
    for (const lead of leads) {
        const leadEmail = lead.email.toLowerCase().trim();

        // 1. PURCHASE SUPPRESSION: Cross-check purchased_subscribers
        if (buyerSet.has(leadEmail)) {
            console.log(`[blueprint-drip] 💳 Suppressing ${lead.email} — already purchased.`);
            await supabase
                .from('blueprint_leads')
                .update({ purchased: true, active: false })
                .eq('id', lead.id);
            results.suppressed_buyers++;
            continue;
        }

        // 2. Get the email entry for this sequence day
        const entry = BLUEPRINT_MAP[lead.sequence_day];

        if (!entry) {
            // Past the last email — deactivate
            if (lead.sequence_day > LAST_DAY) {
                await supabase.from('blueprint_leads').update({ active: false }).eq('id', lead.id);
            }
            results.skipped++;
            continue;
        }

        // 3. Cadence check: both 44h gap AND absolute offset must pass
        if (!isDue(lead, entry.daysOffset)) {
            results.skipped++;
            continue;
        }

        // 4. Send the email
        try {
            const { subject, html } = entry.fn(lead.first_name, lead.email);

            const emailResult = await resend.emails.send({
                from: `Adams X <${SENDER}>`,
                to: lead.email,
                subject,
                html,
                reply_to: REPLY_TO,
                tags: [
                    { name: 'sequence', value: 'blueprint-funnel' },
                    { name: 'day', value: String(lead.sequence_day + 1) }
                ]
            });

            if (emailResult.error) {
                throw new Error(emailResult.error.message || 'Resend error');
            }

            const nextDay = lead.sequence_day + 1;
            const shouldDeactivate = nextDay > LAST_DAY;

            await supabase
                .from('blueprint_leads')
                .update({
                    sequence_day: nextDay,
                    last_sent_at: new Date().toISOString(),
                    active: !shouldDeactivate,
                })
                .eq('id', lead.id);

            console.log(`[blueprint-drip] ✅ Day ${lead.sequence_day} → Email ${lead.sequence_day + 2} | "${subject}" → ${lead.email}`);
            results.sent++;

        } catch (err) {
            console.error(`[blueprint-drip] ❌ ${lead.email}:`, err.message);
            results.errors.push({ email: lead.email, error: err.message });
        }

        // Respect Resend rate limits
        await new Promise(r => setTimeout(r, 250));
    }

    console.log('[blueprint-drip] Run complete:', results);
    return res.status(200).json({ success: true, ...results });
}

module.exports = handler;
