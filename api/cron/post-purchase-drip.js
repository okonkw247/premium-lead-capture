// ============================================================
// CRON: /api/cron/post-purchase-drip
// Schedule: Daily at 9:00 AM UTC (see vercel.json)
//
// PURPOSE: Send post-purchase onboarding sequence to buyers.
//   Email 1: Sent immediately by the Whop webhook on purchase.
//   Email 2: 2 days after purchase (sequence_day 1)
//   Email 3: 7 days after purchase (sequence_day 2)
//
// TRIGGER: Whop purchase webhook enrolls subscriber in
//          purchased_subscribers table with sequence_day = 0.
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const tpl = require('../../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

// Maps sequence_day → { templateFn, minHours }
// Email 1 (day 0) is sent by the webhook — not handled here.
const POST_PURCHASE_MAP = {
    // sequence_day 0 = Email 1 already sent. Next email in 2 days.
    0: { fn: tpl.postPurchaseEmail2, minHours: 44  }, // ~2 days
    1: { fn: tpl.postPurchaseEmail3, minHours: 140 }, // ~7 days (5 more days after email 2)
};
const LAST_DAY = 1; // after sequence_day 1 is processed, deactivate

function isDue(lastSentAt, minHours) {
    if (!lastSentAt) return true;
    const elapsed = Date.now() - new Date(lastSentAt).getTime();
    return elapsed >= minHours * 60 * 60 * 1000;
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

    console.log('[post-purchase-drip] Starting run...');

    const { data: buyers, error } = await supabase
        .from('purchased_subscribers')
        .select('id, first_name, email, sequence_day, last_sent_at')
        .eq('active', true)
        .gte('sequence_day', 0);

    if (error) {
        console.error('[post-purchase-drip] DB error:', error);
        return res.status(500).json({ error: 'Failed to fetch purchased_subscribers.', details: error.message });
    }

    console.log(`[post-purchase-drip] Found ${buyers.length} active buyer(s).`);

    const results = { sent: 0, skipped: 0, errors: [] };

    for (const buyer of buyers) {
        const entry = POST_PURCHASE_MAP[buyer.sequence_day];

        if (!entry) {
            if (buyer.sequence_day > LAST_DAY) {
                await supabase.from('purchased_subscribers').update({ active: false }).eq('id', buyer.id);
            }
            results.skipped++;
            continue;
        }

        if (!isDue(buyer.last_sent_at, entry.minHours)) {
            results.skipped++;
            continue;
        }

        try {
            const { subject, html } = entry.fn(buyer.first_name, buyer.email);
            const emailResult = await resend.emails.send({
                from: `Adams X <${SENDER}>`,
                to: buyer.email,
                subject,
                html,
                reply_to: REPLY_TO,
                tags: [{ name: 'sequence', value: 'post-purchase' }]
            });
            if (emailResult.error) throw new Error(emailResult.error.message || 'Resend error');

            const nextDay = buyer.sequence_day + 1;
            const shouldDeactivate = nextDay > LAST_DAY;
            await supabase.from('purchased_subscribers')
                .update({
                    sequence_day: nextDay,
                    last_sent_at: new Date().toISOString(),
                    active: !shouldDeactivate
                })
                .eq('id', buyer.id);

            console.log(`[post-purchase-drip] ✅ Day ${buyer.sequence_day} → "${subject}" → ${buyer.email}`);
            results.sent++;
        } catch (err) {
            console.error(`[post-purchase-drip] ❌ ${buyer.email}:`, err.message);
            results.errors.push({ email: buyer.email, error: err.message });
        }

        await new Promise(r => setTimeout(r, 250));
    }

    console.log('[post-purchase-drip] Run complete:', results);
    return res.status(200).json({ success: true, ...results });
}

module.exports = handler;
