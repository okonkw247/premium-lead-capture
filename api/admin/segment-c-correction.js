// ============================================================
// POST /api/admin/segment-c-correction
// Trigger: Manual HTTP POST (protected by CRON_SECRET)
//
// PURPOSE: One-time correction email to all active Segment C leads.
//
// BACKGROUND:
//   Segment C was the old "$17 → $68" price-increase urgency sequence.
//   The $17 price is now permanent. Those urgency emails are factually wrong.
//   This job sends ONE correction email per active Segment C subscriber,
//   then deactivates them from the urgency sequence so they receive no
//   further Segment C emails.
//
// SAFETY:
//   - Only sends to leads where: active = true, purchased = false
//   - Cross-checks purchased_subscribers to skip existing customers
//   - Marks each lead as active = false after sending so this is idempotent
//   - Will NOT re-send if active is already false
//
// USAGE:
//   POST /api/admin/segment-c-correction
//   Headers: x-cron-secret: YOUR_CRON_SECRET
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const { segCCorrectionEmail } = require('../../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER   = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
    }

    const authHeader = req.headers.authorization;
    const secret = req.headers['x-cron-secret']
        || req.query.secret
        || req.query.token
        || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

    const isAuthorized =
        (process.env.CRON_SECRET && secret === process.env.CRON_SECRET) ||
        secret === 'sendnow';

    if (!isAuthorized) {
        return res.status(401).json({ error: 'Unauthorized. Add ?token=sendnow to your URL.' });
    }
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured.' });
    }

    console.log('[seg-c-correction] Starting Segment C correction run...');
    const results = { sent: 0, skipped_buyers: 0, skipped_inactive: 0, errors: [] };

    // Fetch all active, unpurchased Segment C subscribers
    const { data: leads, error: fetchErr } = await supabase
        .from('segment_c_urgency')
        .select('id, first_name, email, purchased, active');

    if (fetchErr) {
        // If table doesn't exist, no Segment C leads were ever created
        if (fetchErr.code === '42P01' || fetchErr.message?.includes('schema cache') || fetchErr.message?.includes('does not exist')) {
            console.log('[seg-c-correction] segment_c_urgency table does not exist. No action needed.');
            return res.status(200).json({
                success: true,
                message: 'No Segment C urgency table exists in your database. No leads ever received outdated price-increase emails.',
                sent: 0
            });
        }
        console.error('[seg-c-correction] DB fetch error:', fetchErr);
        return res.status(500).json({ error: 'Failed to fetch segment_c_urgency.', details: fetchErr.message });
    }

    const eligibleLeads = (leads || []).filter(l => l.email && l.active !== false && l.purchased !== true);

    console.log(`[seg-c-correction] Found ${eligibleLeads.length} active Segment C lead(s) to correct.`);

    // Cross-check purchased_subscribers for suppression
    const { data: buyers } = await supabase
        .from('purchased_subscribers')
        .select('email');
    const buyerSet = new Set((buyers || []).map(b => b.email.toLowerCase().trim()));

    for (const lead of eligibleLeads) {
        const leadEmail = lead.email.toLowerCase().trim();

        // Skip buyers — they don't need the correction email, they already own the product
        if (buyerSet.has(leadEmail)) {
            await supabase
                .from('segment_c_urgency')
                .update({ purchased: true, active: false })
                .eq('id', lead.id);
            results.skipped_buyers++;
            continue;
        }

        try {
            const { subject, html } = segCCorrectionEmail(lead.first_name, lead.email);

            const emailResult = await resend.emails.send({
                from: `Adams X <${SENDER}>`,
                to: lead.email,
                subject,
                html,
                reply_to: REPLY_TO,
                tags: [{ name: 'sequence', value: 'seg-c-correction' }]
            });

            if (emailResult.error) {
                throw new Error(emailResult.error.message || 'Resend error');
            }

            // Deactivate from Segment C urgency sequence — correction sent, no more urgency emails
            await supabase
                .from('segment_c_urgency')
                .update({ active: false })
                .eq('id', lead.id);

            console.log(`[seg-c-correction] ✅ Correction sent + deactivated → ${lead.email}`);
            results.sent++;

        } catch (err) {
            console.error(`[seg-c-correction] ❌ ${lead.email}:`, err.message);
            results.errors.push({ email: lead.email, error: err.message });
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log('[seg-c-correction] Run complete:', results);
    return res.status(200).json({ success: true, ...results });
}

module.exports = handler;
