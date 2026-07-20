// ============================================================
// POST /api/admin/launch-blast
// Trigger: Manual HTTP POST/GET (protected by CRON_SECRET)
//
// PURPOSE: One-time unified launch blast when Comeback: Unrecognizable goes live.
//   1. Fetches active, unpaid waitlist signups who haven't been notified.
//   2. Fetches active, unpaid leads who haven't been notified.
//   3. Merges and de-duplicates them by email address.
//   4. Sends the launch blast email (featuring client story, pain points, and beta reviews).
//   5. Updates their notified status in their respective database tables.
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const { launchBlastEmail } = require('../../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

async function handler(req, res) {
    // Accept both POST and GET
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use POST or GET.' });
    }

    // Auth check
    const authHeader = req.headers.authorization;
    const secret = req.headers['x-cron-secret']
        || req.query.secret
        || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized. Provide your CRON_SECRET.' });
    }

    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured.' });
    }

    const force = req.query.force === 'true' || req.body?.force === true;

    console.log(`[launch-blast] 🚀 Starting unified launch blast... (forceMode: ${force})`);

    let waitlistRows = [];
    let leadsRows = [];

    // 1. Fetch unpaid waitlist signups
    let wQuery = supabase
        .from('waitlist')
        .select('id, first_name, email, notified, active, sequence_day')
        .eq('purchased', false);

    if (!force) {
        wQuery = wQuery.eq('notified', false);
    }

    const { data: wData, error: wErr } = await wQuery;

    if (wErr) {
        console.error('[launch-blast] Waitlist fetch error:', wErr);
        return res.status(500).json({ error: 'Failed to fetch waitlist.', details: wErr.message });
    }
    if (wData) {
        // Include currently active OR naturally completed waitlist signups (excludes unsubscribed)
        const filteredWaitlist = wData.filter(r => 
            r.active === true || (r.active === false && r.sequence_day >= 9)
        );
        waitlistRows = filteredWaitlist.map(r => ({ ...r, source: 'waitlist' }));
    }

    // 2. Fetch unpaid leads
    // Catch error gracefully if "notified" column has not been added to leads table yet
    let lQuery = supabase
        .from('leads')
        .select('id, first_name, email, notified, active, sequence_day, drip_day')
        .eq('purchased', false);

    if (!force) {
        lQuery = lQuery.eq('notified', false);
    }

    let { data: lData, error: lErr } = await lQuery;

    if (lErr) {
        if (lErr.message.includes('column "notified" does not exist') || lErr.code === 'P0002') {
            console.warn('[launch-blast] WARNING: "notified" column does not exist on leads table. Please run the SQL migration. Fetching all unpaid leads without notified filter...');
            const { data: lFallback, error: lFallbackErr } = await supabase
                .from('leads')
                .select('id, first_name, email, active, sequence_day, drip_day')
                .eq('purchased', false);
            
            if (lFallbackErr) {
                console.error('[launch-blast] Leads fallback fetch error:', lFallbackErr);
                return res.status(500).json({ error: 'Failed to fetch fallback leads.', details: lFallbackErr.message });
            }
            lData = lFallback;
        } else {
            console.error('[launch-blast] Leads fetch error:', lErr);
            return res.status(500).json({ error: 'Failed to fetch leads.', details: lErr.message });
        }
    }
    if (lData) {
        // Include currently active OR naturally completed leads (excludes unsubscribed)
        const filteredLeads = lData.filter(r => 
            r.active === true || (r.active === false && (r.sequence_day >= 9 || r.drip_day >= 7))
        );
        leadsRows = filteredLeads.map(r => ({ ...r, source: 'leads' }));
    }

    console.log(`[launch-blast] Retrieved waitlist rows: ${waitlistRows.length}, leads rows: ${leadsRows.length}`);

    // 3. Merge and de-duplicate by email address (case-insensitive)
    const uniqueMap = new Map();
    const allRecipients = [...waitlistRows, ...leadsRows];

    for (const rec of allRecipients) {
        const emailKey = rec.email.toLowerCase().trim();
        if (!uniqueMap.has(emailKey)) {
            uniqueMap.set(emailKey, rec);
        } else {
            // Keep track of matched rows in both tables so we can mark both as notified
            const existing = uniqueMap.get(emailKey);
            if (!existing.additionalIds) {
                existing.additionalIds = [];
            }
            existing.additionalIds.push({ id: rec.id, source: rec.source });
        }
    }

    const uniqueRecipients = Array.from(uniqueMap.values());
    console.log(`[launch-blast] De-duplicated down to ${uniqueRecipients.length} unique recipient(s).`);

    if (uniqueRecipients.length === 0) {
        return res.status(200).json({ success: true, sent: 0, message: 'No unnotified recipients found.' });
    }

    const results = { sent: 0, errors: [] };

    // 4. Send blast to each unique recipient
    for (const rec of uniqueRecipients) {
        try {
            const { subject, html } = launchBlastEmail(rec.first_name, rec.email);
            const emailResponse = await resend.emails.send({
                from: `Adams X <${SENDER}>`,
                to: rec.email,
                subject,
                html,
                reply_to: REPLY_TO,
                tags: [{ name: 'campaign', value: 'comeback-launch-blast' }]
            });

            if (emailResponse.error) {
                throw new Error(emailResponse.error.message || 'Resend error');
            }

            // 5. Mark primary recipient as notified
            if (rec.source === 'waitlist') {
                await supabase.from('waitlist').update({ notified: true }).eq('id', rec.id);
            } else if (rec.source === 'leads') {
                try {
                    await supabase.from('leads').update({ notified: true }).eq('id', rec.id);
                } catch (updateErr) {
                    console.error(`[launch-blast] Could not update notified for lead: ${rec.email}`, updateErr.message);
                }
            }

            // Mark matched rows from other source as notified
            if (rec.additionalIds) {
                for (const add of rec.additionalIds) {
                    if (add.source === 'waitlist') {
                        await supabase.from('waitlist').update({ notified: true }).eq('id', add.id);
                    } else if (add.source === 'leads') {
                        try {
                            await supabase.from('leads').update({ notified: true }).eq('id', add.id);
                        } catch (updateErr) {
                            console.error(`[launch-blast] Could not update matched notified for lead: ${rec.email}`, updateErr.message);
                        }
                    }
                }
            }

            console.log(`[launch-blast] ✅ Emailed ${rec.email} (${rec.source})`);
            results.sent++;

        } catch (err) {
            console.error(`[launch-blast] ❌ Failed for ${rec.email}:`, err.message);
            results.errors.push({ email: rec.email, error: err.message });
        }

        // Rate limit: 300ms delay to keep within Resend rate limits
        await new Promise(r => setTimeout(r, 300));
    }

    console.log('[launch-blast] Unified launch blast finished.', results);
    return res.status(200).json({ success: true, ...results });
}

module.exports = handler;
