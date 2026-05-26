// ============================================================
// CRON: /api/cron/digest
// Schedule: Daily at 8:00 AM UTC (see vercel.json)
// Purpose: Email Adams X a morning summary of leads from last 24h
// ============================================================
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const { dailyDigest } = require('../../lib/emails');

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

async function handler(req, res) {
    const authHeader = req.headers.authorization;
    const secret = req.headers['x-cron-secret'] || req.query.secret || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!process.env.NOTIFICATION_EMAIL) {
        return res.status(200).json({ skipped: true, reason: 'NOTIFICATION_EMAIL not set.' });
    }

    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured.' });
    }

    console.log('[digest-cron] Building daily digest...');

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Fetch new leads and waitlist in the last 24 hours
    const [{ data: newLeads, error: e1 }, { data: newWaitlist, error: e2 }] = await Promise.all([
        supabase.from('leads').select('first_name, email, created_at').gte('created_at', since).order('created_at', { ascending: false }),
        supabase.from('waitlist').select('first_name, email, created_at').gte('created_at', since).order('created_at', { ascending: false }),
    ]);

    if (e1 || e2) {
        console.error('[digest-cron] DB error:', e1 || e2);
        return res.status(500).json({ error: 'DB fetch failed.' });
    }

    // Total counts
    const [{ count: totalLeads }, { count: totalWaitlist }] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('waitlist').select('*', { count: 'exact', head: true }),
    ]);

    const { subject, html } = dailyDigest(
        newLeads || [],
        newWaitlist || [],
        totalLeads || 0,
        totalWaitlist || 0
    );

    const emailResponse = await resend.emails.send({
        from: `Adams X Project <${SENDER}>`,
        to: process.env.NOTIFICATION_EMAIL,
        subject,
        html,
    });

    if (emailResponse.error) {
        console.error('[digest-cron] Failed to send digest email:', emailResponse.error);
        return res.status(500).json({ error: 'Failed to send digest email.', details: emailResponse.error.message });
    }

    console.log(`[digest-cron] ✅ Digest sent: ${newLeads?.length} leads, ${newWaitlist?.length} waitlist signups.`);
    return res.status(200).json({
        success: true,
        newLeads: newLeads?.length,
        newWaitlist: newWaitlist?.length,
        totalLeads,
        totalWaitlist
    });
}

module.exports = handler;
