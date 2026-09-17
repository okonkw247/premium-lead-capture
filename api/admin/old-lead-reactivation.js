// ============================================================
// POST /api/admin/old-lead-reactivation
// Trigger: Manual HTTP POST (protected by CRON_SECRET)
//
// PURPOSE: One-time reactivation email to ~68 old waitlist leads.
//
// BACKGROUND:
//   Old waitlist leads (Segment A) received an urgency-based launch.
//   The approach has changed. These leads should NOT be auto-enrolled
//   into the new Segment D Blueprint funnel without their consent.
//
//   Instead, we send them ONE reactivation email:
//     Subject: "I changed the way I'm doing this"
//   This email explains the change and invites them to /blueprint.
//
//   When they visit /blueprint and register, they enter Segment D
//   through the standard /api/blueprint-register endpoint — with full
//   duplicate-detection and purchase-suppression logic applied normally.
//
// WHO IS TARGETED:
//   waitlist table leads where active = true AND purchased = false.
//   We skip anyone already in purchased_subscribers (they're customers).
//
// SAFETY:
//   - POST-only — prevents accidental GET trigger
//   - CRON_SECRET protected
//   - Skips purchasers
//   - Does NOT modify their existing sequence_day or historical data
//   - Does NOT enroll them in Segment D — that requires their own opt-in
//   - Idempotent within a run (each email is individual, skippable)
//
// USAGE:
//   POST /api/admin/old-lead-reactivation
//   Headers: x-cron-secret: YOUR_CRON_SECRET
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const { oldLeadReactivationEmail } = require('../../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER   = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const authHeader = req.headers.authorization;
    const secret = req.headers['x-cron-secret']
        || req.query.secret
        || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized. Provide your CRON_SECRET.' });
    }
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured.' });
    }

    console.log('[old-lead-reactivation] Starting old-lead reactivation run...');
    const results = { sent: 0, skipped_buyers: 0, errors: [] };

    // Fetch active waitlist leads who have NOT purchased
    const { data: waitlistLeads, error: fetchErr } = await supabase
        .from('waitlist')
        .select('id, first_name, email, purchased, active')
        .eq('active', true)
        .eq('purchased', false);

    if (fetchErr) {
        console.error('[old-lead-reactivation] DB fetch error:', fetchErr);
        return res.status(500).json({ error: 'Failed to fetch waitlist.', details: fetchErr.message });
    }

    console.log(`[old-lead-reactivation] Found ${waitlistLeads.length} active waitlist lead(s).`);

    // Cross-check purchased_subscribers for suppression
    const { data: buyers } = await supabase
        .from('purchased_subscribers')
        .select('email');
    const buyerSet = new Set((buyers || []).map(b => b.email.toLowerCase().trim()));

    for (const lead of waitlistLeads) {
        const leadEmail = lead.email.toLowerCase().trim();

        // Skip existing customers — they don't need a reactivation email
        if (buyerSet.has(leadEmail)) {
            console.log(`[old-lead-reactivation] Skipping buyer: ${lead.email}`);
            results.skipped_buyers++;
            continue;
        }

        try {
            const { subject, html } = oldLeadReactivationEmail(lead.first_name, lead.email);

            const emailResult = await resend.emails.send({
                from: `Adams X <${SENDER}>`,
                to: lead.email,
                subject,
                html,
                reply_to: REPLY_TO,
                tags: [{ name: 'sequence', value: 'old-lead-reactivation' }]
            });

            if (emailResult.error) {
                throw new Error(emailResult.error.message || 'Resend error');
            }

            // NOTE: We do NOT modify their sequence_day or historical data.
            //       Their waitlist record stays intact for record-keeping.
            //       Enrollment into Segment D only happens if they visit /blueprint.
            console.log(`[old-lead-reactivation] ✅ Reactivation email sent → ${lead.email}`);
            results.sent++;

        } catch (err) {
            console.error(`[old-lead-reactivation] ❌ ${lead.email}:`, err.message);
            results.errors.push({ email: lead.email, error: err.message });
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log('[old-lead-reactivation] Run complete:', results);
    return res.status(200).json({ success: true, ...results });
}

module.exports = handler;
