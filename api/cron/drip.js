// ============================================================
// CRON: /api/cron/drip
// Schedule: Daily at 9:00 AM UTC (see vercel.json)
// Purpose: Send the correct day's email to every active lead
// ============================================================
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const emails = require('../../lib/emails');

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

// Map drip_day number → email template function
const DRIP_MAP = {
    0: emails.day0,
    1: emails.day1,
    2: emails.day2,
    3: emails.day3,
    4: emails.day4,
    5: emails.day5,
    6: emails.day6,
    7: emails.day7,
};

async function handler(req, res) {
    // Protect the endpoint — only Vercel cron or requests with CRON_SECRET can trigger
    const secret = req.headers['x-cron-secret'] || req.query.secret;
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured.' });
    }

    console.log('[drip-cron] Starting daily drip run...');

    // Fetch all active leads that still have pending drip days (0–7)
    const { data: leads, error } = await supabase
        .from('leads')
        .select('id, first_name, email, drip_day')
        .eq('active', true)
        .lte('drip_day', 7);

    if (error) {
        console.error('[drip-cron] Supabase fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch leads.', details: error.message });
    }

    console.log(`[drip-cron] Found ${leads.length} lead(s) to process.`);

    const results = { sent: 0, skipped: 0, errors: [] };

    for (const lead of leads) {
        const templateFn = DRIP_MAP[lead.drip_day];
        if (!templateFn) {
            // drip_day > 7, deactivate them
            await supabase.from('leads').update({ active: false }).eq('id', lead.id);
            results.skipped++;
            continue;
        }

        const { subject, html } = templateFn(lead.first_name);

        try {
            await resend.emails.send({
                from: `Adams X Project <${SENDER}>`,
                to: lead.email,
                subject,
                html,
                tags: [{ name: 'sequence', value: 'monk-mode-drip' }]
            });

            // Increment drip_day. If this was day 7, also mark inactive.
            const nextDay = lead.drip_day + 1;
            await supabase
                .from('leads')
                .update({ drip_day: nextDay, active: nextDay <= 7 })
                .eq('id', lead.id);

            console.log(`[drip-cron] ✅ Day ${lead.drip_day} sent to ${lead.email}`);
            results.sent++;
        } catch (emailError) {
            console.error(`[drip-cron] ❌ Failed for ${lead.email}:`, emailError.message);
            results.errors.push({ email: lead.email, error: emailError.message });
        }
    }

    console.log('[drip-cron] Run complete:', results);
    return res.status(200).json({ success: true, ...results });
}

module.exports = handler;
