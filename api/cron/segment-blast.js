// ============================================================
// POST /api/admin/segment-blast
// Trigger: Manual HTTP POST (protected by CRON_SECRET)
//
// PURPOSE: One-time launch blast to kick off both sequences.
//
//   Segment A — everyone in the `waitlist` table:
//     → Sends segAEmail1 ("you made it to the list")
//     → Sets segment='A', sequence_day=0, enrolled_at=NOW(), last_sent_at=NOW()
//
//   Segment B — everyone in `leads` NOT already in `waitlist`:
//     → Sends segBEmail1 ("you've got the starter kit")
//     → Sets segment='B', sequence_day=0, enrolled_at=NOW(), last_sent_at=NOW()
//
// SAFETY:
//   - Only blasts leads where sequence_day = -1 (not yet enrolled).
//   - Idempotent: re-running will skip already-enrolled subscribers.
//   - Protected by CRON_SECRET header.
//
// USAGE:
//   POST /api/admin/segment-blast
//   Headers: x-cron-secret: YOUR_SECRET
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const { segAEmail1, segBEmail1 } = require('../../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER  = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

async function handler(req, res) {
    // POST only — protect against accidental browser GET
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    // Auth check
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

    const now = new Date().toISOString();
    const results = {
        segA: { sent: 0, skipped: 0, errors: [] },
        segB: { sent: 0, skipped: 0, errors: [] },
    };

    console.log('[segment-blast] 🚀 Starting two-segment blast...');

    // ── SEGMENT A: blast all waitlist entries not yet enrolled ──
    const { data: waitlistRows, error: wErr } = await supabase
        .from('waitlist')
        .select('id, first_name, email, sequence_day')
        .eq('active', true)
        .lt('sequence_day', 0); // sequence_day = -1 means not yet enrolled

    if (wErr) {
        console.error('[segment-blast] Waitlist fetch error:', wErr);
        return res.status(500).json({ error: 'Failed to fetch waitlist.', details: wErr.message });
    }

    console.log(`[segment-blast] Segment A: ${waitlistRows.length} unenrolled waitlist subscriber(s)`);

    for (const entry of waitlistRows) {
        try {
            const { subject, html } = segAEmail1(entry.first_name, entry.email);
            const result = await resend.emails.send({
                from: `Adams X <${SENDER}>`,
                to: entry.email,
                subject,
                html,
                reply_to: REPLY_TO,
                tags: [{ name: 'sequence', value: 'seg-a-launch' }],
            });

            if (result.error) throw new Error(result.error.message || 'Resend error');

            // Mark enrolled
            await supabase.from('waitlist').update({
                segment: 'A',
                sequence_day: 0,
                enrolled_at: now,
                last_sent_at: now,
            }).eq('id', entry.id);

            console.log(`[segment-blast] ✅ Seg A → ${entry.email}`);
            results.segA.sent++;
        } catch (err) {
            console.error(`[segment-blast] ❌ Seg A | ${entry.email}:`, err.message);
            results.segA.errors.push({ email: entry.email, error: err.message });
        }

        // Respect Resend rate limits
        await new Promise(r => setTimeout(r, 300));
    }

    // ── SEGMENT B: blast leads NOT in waitlist, not yet enrolled ──
    // We fetch leads with segment='B' and sequence_day=-1 (un-enrolled).
    // The /api/subscribe route already sets segment='B' for new signups;
    // for old leads that predate the migration, the DB default sets segment='B'.
    const { data: leadRows, error: lErr } = await supabase
        .from('leads')
        .select('id, first_name, email, sequence_day, segment')
        .eq('active', true)
        .eq('segment', 'B')
        .lt('sequence_day', 0); // not yet enrolled

    if (lErr) {
        console.error('[segment-blast] Leads fetch error:', lErr);
        return res.status(500).json({ error: 'Failed to fetch leads.', details: lErr.message });
    }

    // Filter out anyone who is also on the waitlist (double-safety)
    const { data: waitlistEmails } = await supabase
        .from('waitlist')
        .select('email');
    const waitlistSet = new Set((waitlistEmails || []).map(w => w.email.toLowerCase()));

    const segBLeads = leadRows.filter(l => !waitlistSet.has(l.email.toLowerCase()));
    console.log(`[segment-blast] Segment B: ${segBLeads.length} unenrolled non-waitlist lead(s)`);

    for (const entry of segBLeads) {
        try {
            const { subject, html } = segBEmail1(entry.first_name, entry.email);
            const result = await resend.emails.send({
                from: `Adams X <${SENDER}>`,
                to: entry.email,
                subject,
                html,
                reply_to: REPLY_TO,
                tags: [{ name: 'sequence', value: 'seg-b-launch' }],
            });

            if (result.error) throw new Error(result.error.message || 'Resend error');

            // Mark enrolled
            await supabase.from('leads').update({
                segment: 'B',
                sequence_day: 0,
                enrolled_at: now,
                last_sent_at: now,
            }).eq('id', entry.id);

            console.log(`[segment-blast] ✅ Seg B → ${entry.email}`);
            results.segB.sent++;
        } catch (err) {
            console.error(`[segment-blast] ❌ Seg B | ${entry.email}:`, err.message);
            results.segB.errors.push({ email: entry.email, error: err.message });
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log('[segment-blast] Blast complete:', results);
    return res.status(200).json({ success: true, ...results });
}

module.exports = handler;
