require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend');
const { supabase } = require('./lib/supabase');
const { day0, waitlistConfirmation } = require('./lib/email-templates');

// Cron handlers
const dripHandler   = require('./api/cron/drip');
const digestHandler = require('./api/cron/digest');
const blastHandler  = require('./api/cron/blast');

const app = express();
const PORT = process.env.PORT || 8000;
const resend = new Resend(process.env.RESEND_API_KEY || '');
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        supabase: !!supabase,
        resend: !!process.env.RESEND_API_KEY,
        timestamp: new Date().toISOString()
    });
});

// ── POST /api/subscribe ─────────────────────────────────────
// Saves lead to Supabase, sends Day 0 welcome email via Resend
app.post('/api/subscribe', async (req, res) => {
    const { firstName, email } = req.body;

    if (!firstName || !email) {
        return res.status(400).json({ error: 'First name and email are required.' });
    }
    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Missing RESEND_API_KEY.' });
    }

    try {
        // ── 1. Save to Supabase ──
        if (supabase) {
            const { error: dbError } = await supabase
                .from('leads')
                .upsert(
                    { first_name: firstName, email, drip_day: 0, active: true },
                    { onConflict: 'email', ignoreDuplicates: false }
                );

            if (dbError) {
                // Unique violation — already subscribed
                if (dbError.code === '23505') {
                    return res.status(409).json({ error: 'This email is already subscribed.' });
                }
                console.error('[subscribe] Supabase error:', dbError);
                // Non-fatal — continue and still send email
            } else {
                console.log(`[subscribe] ✅ Lead saved to DB: ${email}`);
            }
        }

        // ── 2. Send Day 0 welcome email ──
        const { subject, html } = day0(firstName);
        const emailResponse = await resend.emails.send({
            from: `Adams X Project <${SENDER}>`,
            to: email,
            subject,
            html,
            tags: [{ name: 'sequence', value: 'monk-mode-drip' }]
        });

        if (emailResponse.error) {
            throw new Error(emailResponse.error.message || 'Resend failed to send welcome email.');
        }

        // ── 3. Notify Adams X ──
        if (process.env.NOTIFICATION_EMAIL) {
            const adminNotifyResponse = await resend.emails.send({
                from: `Adams X Lead Alerts <${SENDER}>`,
                to: process.env.NOTIFICATION_EMAIL,
                subject: `🔥 New Lead: ${firstName} just claimed the Starter Kit`,
                html: `
                    <div style="font-family:sans-serif;padding:24px;max-width:500px;">
                        <h3 style="margin:0 0 16px;">🔥 New Monk Mode Lead</h3>
                        <p><strong>Name:</strong> ${firstName}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Drip starts:</strong> Day 0 sent now → Day 7 in 7 days</p>
                        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                    </div>`
            });
            if (adminNotifyResponse.error) {
                console.error('[subscribe] Admin alert email failed:', adminNotifyResponse.error);
            }
        }

        console.log(`[subscribe] ✅ Welcome email sent to ${email}`);
        return res.status(200).json({ success: true, message: 'Enrolled. Day 0 email dispatched.' });

    } catch (err) {
        console.error('[subscribe] Error:', err);
        return res.status(500).json({ error: 'Subscription failed.', details: err.message });
    }
});

// ── POST /api/waitlist ──────────────────────────────────────
// Saves to waitlist table in Supabase, sends confirmation email
app.post('/api/waitlist', async (req, res) => {
    const { firstName, email } = req.body;

    if (!firstName || !email) {
        return res.status(400).json({ error: 'First name and email are required.' });
    }
    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Missing RESEND_API_KEY.' });
    }

    try {
        // ── 1. Save to Supabase ──
        if (supabase) {
            const { error: dbError } = await supabase
                .from('waitlist')
                .upsert(
                    { first_name: firstName, email, notified: false },
                    { onConflict: 'email', ignoreDuplicates: false }
                );

            if (dbError) {
                console.error('[waitlist] Supabase error:', dbError);
                throw new Error(dbError.message || 'Database save failed.');
            } else {
                console.log(`[waitlist] ✅ Waitlist entry saved/updated: ${email}`);
            }
        }

        // ── 2. Send confirmation email ──
        const { subject, html } = waitlistConfirmation(firstName);
        const emailResponse = await resend.emails.send({
            from: `Adams X Project <${SENDER}>`,
            to: email,
            subject,
            html,
            tags: [{ name: 'list', value: 'unrecognizable-waitlist' }]
        });

        if (emailResponse.error) {
            throw new Error(emailResponse.error.message || 'Resend failed to send waitlist confirmation.');
        }

        // ── 3. Notify Adams X ──
        if (process.env.NOTIFICATION_EMAIL) {
            const adminNotifyResponse = await resend.emails.send({
                from: `Adams X Lead Alerts <${SENDER}>`,
                to: process.env.NOTIFICATION_EMAIL,
                subject: `🚀 Waitlist: ${firstName} joined Comeback: Unrecognizable`,
                html: `
                    <div style="font-family:sans-serif;padding:24px;max-width:500px;">
                        <h3 style="margin:0 0 16px;">🚀 New Waitlist Signup</h3>
                        <p><strong>Name:</strong> ${firstName}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>List:</strong> unrecognizable-waitlist</p>
                        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                    </div>`
            });
            if (adminNotifyResponse.error) {
                console.error('[waitlist] Admin alert email failed:', adminNotifyResponse.error);
            }
        }

        console.log(`[waitlist] ✅ Confirmation sent to ${email}`);
        return res.status(200).json({ success: true, message: 'Added to waitlist.' });

    } catch (err) {
        console.error('[waitlist] Error:', err);
        return res.status(500).json({ error: 'Waitlist signup failed.', details: err.message });
    }
});

// ── Cron Routes ─────────────────────────────────────────────
app.get('/api/cron/drip',   dripHandler);   // Vercel cron: daily 9AM UTC
app.get('/api/cron/digest', digestHandler); // Vercel cron: daily 8AM UTC
app.post('/api/cron/blast', blastHandler);  // Manual: POST with CRON_SECRET

// ── Serve waitlist.html for /waitlist ───────────────────────
app.get('/waitlist', (req, res) => {
    res.sendFile(path.join(__dirname, 'waitlist.html'));
});

// ── Serve index.html for all other routes ───────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start server ────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  Adams X Project — Full Stack Server`);
    console.log(`  Local URL:  http://localhost:${PORT}`);
    console.log(`  Supabase:   ${supabase ? '✅ Connected' : '⚠️  Not configured'}`);
    console.log(`  Resend:     ${process.env.RESEND_API_KEY ? '✅ Configured' : '⚠️  Not configured'}`);
    console.log(`====================================================`);
});
