// ============================================================
// CRON: /api/cron/blast
// Trigger: Manual HTTP POST (protected by CRON_SECRET)
// Purpose: One-time waitlist launch blast when Comeback: Unrecognizable goes live
// Usage:   POST /api/cron/blast?secret=YOUR_CRON_SECRET
// ============================================================
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const { waitlistBlast } = require('../../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';

async function handler(req, res) {
    // This endpoint is POST only — prevent accidental browser GET triggers
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    // Require secret — this is a one-way door, protect it
    const authHeader = req.headers.authorization;
    const secret = req.headers['x-cron-secret'] || req.query.secret || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized. Provide your CRON_SECRET.' });
    }

    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured.' });
    }

    console.log('[blast-cron] 🚀 Launch blast triggered. Fetching unnotified waitlist...');

    // Fetch everyone on the waitlist who hasn't been notified yet
    const { data: waitlist, error } = await supabase
        .from('waitlist')
        .select('id, first_name, email')
        .eq('notified', false);

    if (error) {
        console.error('[blast-cron] DB fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch waitlist.', details: error.message });
    }

    if (!waitlist || waitlist.length === 0) {
        console.log('[blast-cron] No unnotified waitlist entries found.');
        return res.status(200).json({ success: true, sent: 0, message: 'No unnotified entries.' });
    }

    console.log(`[blast-cron] Blasting ${waitlist.length} waitlist member(s)...`);

    const results = { sent: 0, errors: [] };

    for (const entry of waitlist) {
        const { subject, html } = waitlistBlast(entry.first_name, entry.email);

        try {
            const emailResponse = await resend.emails.send({
                from: `Adams X Project <${SENDER}>`,
                to: entry.email,
                subject,
                html,
                reply_to: 'adams@adamsxproject.com.ng',
                tags: [{ name: 'campaign', value: 'comeback-launch' }]
            });

            if (emailResponse.error) {
                throw new Error(emailResponse.error.message || 'Resend error');
            }

            // Mark as notified so they don't get blasted twice
            await supabase.from('waitlist').update({ notified: true }).eq('id', entry.id);

            console.log(`[blast-cron] ✅ Blasted ${entry.email}`);
            results.sent++;
        } catch (emailErr) {
            console.error(`[blast-cron] ❌ Failed for ${entry.email}:`, emailErr.message);
            results.errors.push({ email: entry.email, error: emailErr.message });
        }
    }

    console.log('[blast-cron] Launch blast complete:', results);
    return res.status(200).json({ success: true, ...results });
}

module.exports = handler;
