// ============================================================
// CRON: /api/cron/drip
// Schedule: Daily at 9:00 AM UTC (see vercel.json)
// Purpose: Send the correct day's email to every active lead
// ============================================================
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const emails = require('../../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';

const DRIP_MAP = {
    0:  emails.day0,
    1:  emails.day1,
    2:  emails.day2,
    3:  emails.day3,
    4:  emails.day4,
    5:  emails.day5,
    6:  emails.day6,
    7:  emails.day7,
    10: emails.day10,
    14: emails.day14,
    21: emails.day21,
};

async function handler(req, res) {
    const authHeader = req.headers.authorization;
    const secret = req.headers['x-cron-secret'] || req.query.secret || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured.' });
    }

    console.log('[drip-cron] Starting daily drip run...');

    const { data: leads, error } = await supabase
        .from('leads')
        .select('id, first_name, email, drip_day, purchased')
        .eq('active', true);

    if (error) {
        console.error('[drip-cron] Supabase fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch leads.', details: error.message });
    }

    console.log(`[drip-cron] Found ${leads.length} lead(s) to process.`);

    const results = { sent: 0, skipped: 0, errors: [] };

    for (const lead of leads) {
        const templateFn = DRIP_MAP[lead.drip_day];

        // No template for this day — figure out next step
        if (!templateFn) {
            // Between day 7 and day 10 — just increment and wait
            if (lead.drip_day > 7 && lead.drip_day < 10) {
                await supabase.from('leads').update({ drip_day: lead.drip_day + 1 }).eq('id', lead.id);
                results.skipped++;
                continue;
            }
            // Between day 10 and day 14 — just increment and wait
            if (lead.drip_day > 10 && lead.drip_day < 14) {
                await supabase.from('leads').update({ drip_day: lead.drip_day + 1 }).eq('id', lead.id);
                results.skipped++;
                continue;
            }
            // Between day 14 and day 21 — just increment and wait
            if (lead.drip_day > 14 && lead.drip_day < 21) {
                await supabase.from('leads').update({ drip_day: lead.drip_day + 1 }).eq('id', lead.id);
                results.skipped++;
                continue;
            }
            // After day 21 — deactivate
            if (lead.drip_day > 21) {
                await supabase.from('leads').update({ active: false }).eq('id', lead.id);
                results.skipped++;
                continue;
            }
            results.skipped++;
            continue;
        }

        // If they already purchased — skip follow up emails
        if (lead.purchased && lead.drip_day > 7) {
            await supabase.from('leads').update({ active: false }).eq('id', lead.id);
            results.skipped++;
            continue;
        }

        const { subject, html } = templateFn(lead.first_name, lead.email);

        try {
            const emailResponse = await resend.emails.send({
                from: `Adams X Project <${SENDER}>`,
                to: lead.email,
                subject,
                html,
                reply_to: 'adams@adamsxproject.com.ng',
                tags: [{ name: 'sequence', value: 'monk-mode-drip' }]
            });

            if (emailResponse.error) {
                throw new Error(emailResponse.error.message || 'Resend error');
            }

            // After day 7 — keep active for follow up sequence
            // After day 21 — deactivate
            const nextDay = lead.drip_day + 1;
            const shouldDeactivate = lead.drip_day === 21;

            await supabase
                .from('leads')
                .update({
                    drip_day: nextDay,
                    active: !shouldDeactivate
                })
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