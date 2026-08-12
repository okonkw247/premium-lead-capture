require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend');
const { supabase } = require('./lib/supabase');
const { day0, waitlistConfirmation, apologyResend, paidEbookAccess, bonusDelivery, segAEmail1, segBEmail1 } = require('./lib/email-templates');

// Cron handlers
const dripHandler          = require('./api/cron/drip');
const digestHandler        = require('./api/cron/digest');
const blastHandler         = require('./api/cron/blast');
const segmentBlastHandler  = require('./api/cron/segment-blast');
const postPurchaseDrip     = require('./api/cron/post-purchase-drip');

// Webhook handlers
const whopWebhook          = require('./api/webhooks/whop');
const resendWebhook        = require('./api/webhooks/resend');

// Launch Blast handler
const launchBlastHandler   = require('./api/admin/launch-blast');

const app = express();
const PORT = process.env.PORT || 8000;
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';

// ── Middleware ──────────────────────────────────────────────
app.use(cors());

// Raw body capture for Whop HMAC signature verification.
// Must be set BEFORE express.json() parses the body.
// We attach the raw buffer as req.rawBody on all requests.
app.use((req, res, next) => {
    let data = [];
    req.on('data', chunk => data.push(chunk));
    req.on('end', () => {
        req.rawBody = Buffer.concat(data);
        // Now let express parse the JSON body too (for all other routes)
        try {
            if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
                req.body = JSON.parse(req.rawBody.toString('utf8'));
            } else if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
                const qs = new URLSearchParams(req.rawBody.toString('utf8'));
                req.body = Object.fromEntries(qs.entries());
            }
        } catch (e) {
            // leave body unparsed — express middleware will handle it
        }
        next();
    });
});
// NOTE: express.urlencoded() removed — the raw body middleware above
// already parses URL-encoded bodies (lines 40-42). Adding urlencoded()
// here causes a "stream is not readable" crash on Vercel serverless.

// ── Serve PDF as forced download ────────────────────────────
// This ensures the browser downloads the file instead of opening it inline
app.get('/ebooks/the-7-day-starter-kit.pdf', (req, res) => {
    res.setHeader('Content-Disposition', 'attachment; filename="Monk-Mode-Starter-Kit.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(path.join(__dirname, 'ebooks', 'monk-mode-starter-kit.pdf'));
});

// Serve monk-mode-starter-kit.pdf directly (local testing)
app.get('/monk-mode-starter-kit.pdf', (req, res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(path.join(__dirname, 'ebooks', 'monk-mode-starter-kit.pdf'));
});

// Serve remaining ebooks directory (future PDFs)
app.use('/ebooks', express.static(path.join(__dirname, 'ebooks')));

// Serve Privacy Policy
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy.html'));
});

app.use(express.static(path.join(__dirname)));

// ── GET /survey & /survery — Serve feedback survey ────────────
app.get(['/survey', '/survery', '/survey.html', '/survery.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'survey.html'));
});

// ── GET /waitlist — redirect to Whop now that product is live ───────────────
// The ebook PDF has a button linking to /waitlist. Since Comeback: Unrecognizable
// is live, any visitor (including PDF readers) is sent straight to the purchase page.
app.get('/waitlist', (req, res) => {
    const whopUrl = process.env.WHOP_PRODUCT_URL || 'https://whop.com/adams-x/comeback-unrecognized/?a=adamsproject';
    return res.redirect(302, whopUrl);
});

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        supabase: !!supabase,
        resend: !!process.env.RESEND_API_KEY,
        timestamp: new Date().toISOString()
    });
});

// ── POST /api/survey — Save survey response ─────────────────
app.post('/api/survey', async (req, res) => {
    const { status, reason, spend_recency, open_response } = req.body || {};

    if (!status || !reason || !spend_recency || !open_response) {
        return res.status(400).json({ error: 'All 4 questions must be answered before submitting.' });
    }

    try {
        if (supabase) {
            const { data, error: dbError } = await supabase
                .from('survey_responses')
                .insert([{
                    status: String(status).trim(),
                    reason: String(reason).trim(),
                    spend_recency: String(spend_recency).trim(),
                    open_response: String(open_response).trim()
                }])
                .select();

            if (dbError) {
                console.error('[survey] Supabase error:', dbError);
                let userError = dbError.message || 'Failed to save survey response to database.';
                if (dbError.code === '42P01' || (dbError.message && dbError.message.toLowerCase().includes('relation') && dbError.message.toLowerCase().includes('does not exist'))) {
                    userError = 'Database setup required: Please run supabase-survey.sql in your Supabase Dashboard SQL Editor.';
                }
                return res.status(500).json({ error: userError });
            }

            console.log(`[survey] ✅ Response saved to DB`);
            return res.json({ success: true, data });
        } else {
            return res.status(500).json({ error: 'Supabase client not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel environment variables.' });
        }
    } catch (err) {
        console.error('[survey] Exception:', err);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// ── POST /api/subscribe ─────────────────────────────────────
// Saves lead to Supabase, sends Day 0 welcome email with PDF download link
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
            const now = new Date().toISOString();
            const { error: dbError } = await supabase
                .from('leads')
                .upsert(
                    {
                        first_name: firstName,
                        email,
                        drip_day: 1,
                        active: true,
                        segment: 'B',
                        sequence_day: 0,      // day0 welcome is about to be sent; drip picks up from day 1
                        enrolled_at: now,
                        last_sent_at: now,
                    },
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

        // ── 2. Send Day 0 welcome email with PDF download link ──
        // day0 contains the "Download Your Starter Kit" button.
        // segBEmail1 is a RE-ENGAGEMENT email for old users — NOT for new signups.
        const { subject, html } = day0(firstName, email);
        const emailResponse = await resend.emails.send({
            from: `Adams X <${SENDER}>`,
            to: email,
            subject,
            html,
            reply_to: 'adams@adamsxproject.com.ng',
            tags: [{ name: 'sequence', value: 'welcome-day0' }]
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
                reply_to: 'adams@adamsxproject.com.ng',
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

        console.log(`[subscribe] ✅ Welcome email (with download link) sent to ${email}`);
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
            const now = new Date().toISOString();
            const { error: dbError } = await supabase
                .from('waitlist')
                .upsert(
                    {
                        first_name: firstName,
                        email,
                        notified: false,
                        segment: 'A',
                        sequence_day: 0,      // Email 1 (A-E1) is about to be sent
                        enrolled_at: now,
                        last_sent_at: now,
                        active: true,
                    },
                    { onConflict: 'email', ignoreDuplicates: false }
                );

            if (dbError) {
                console.error('[waitlist] Supabase error:', dbError);
                throw new Error(dbError.message || 'Database save failed.');
            } else {
                console.log(`[waitlist] ✅ Waitlist entry saved/updated: ${email}`);
            }
        }

        // ── 2. Send Segment A Email 1 immediately (replaces old waitlist confirmation) ──
        const { subject, html } = segAEmail1(firstName, email);
        const emailResponse = await resend.emails.send({
            from: `Adams X <${SENDER}>`,
            to: email,
            subject,
            html,
            reply_to: 'adams@adamsxproject.com.ng',
            tags: [{ name: 'sequence', value: 'seg-a-launch' }]
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
                reply_to: 'adams@adamsxproject.com.ng',
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
        const whopUrl = process.env.WHOP_PRODUCT_URL || 'https://whop.com/adams-x/comeback-unrecognized/?a=adamsproject';
        return res.status(200).json({ success: true, message: 'Added to waitlist.', redirectUrl: whopUrl });

    } catch (err) {
        console.error('[waitlist] Error:', err);
        return res.status(500).json({ error: 'Waitlist signup failed.', details: err.message });
    }
});

// ── Cron Routes ─────────────────────────────────────────────
app.get('/api/cron/drip',            dripHandler);          // Vercel cron: daily 9AM UTC
app.get('/api/cron/digest',          digestHandler);         // Vercel cron: daily 8AM UTC
app.get('/api/cron/post-purchase-drip', postPurchaseDrip);  // Vercel cron: daily 9AM UTC
app.post('/api/cron/blast',          blastHandler);          // Legacy blast (waitlist-only)

// ── Admin Routes ──────────────────────────────────────────────
app.post('/api/admin/segment-blast', segmentBlastHandler);  // One-time two-segment blast
app.get('/api/admin/segment-blast',  segmentBlastHandler);  // Vercel cron GET trigger
app.post('/api/admin/launch-blast',  launchBlastHandler);   // Unified launch blast (POST)
app.get('/api/admin/launch-blast',   launchBlastHandler);   // Unified launch blast (GET/Cron)

// ── Webhook Routes ────────────────────────────────────────────
app.post('/api/webhooks/whop',   whopWebhook);   // Whop purchase webhook
app.post('/api/webhooks/resend', resendWebhook); // Resend reply tracking

// ── POST /api/admin/resend-welcome ───────────────────────────
// One-time tool: resend Day 0 welcome email to ALL existing leads
// Requires CRON_SECRET header for protection
app.post('/api/admin/resend-welcome', async (req, res) => {
    const secret = req.headers['x-cron-secret'] || req.body?.secret;
    if (!secret || secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured.' });
    }

    try {
        const { data: leads, error } = await supabase
            .from('leads')
            .select('first_name, email')
            .eq('active', true);

        if (error) throw new Error(error.message);
        if (!leads || leads.length === 0) {
            return res.json({ success: true, sent: 0, message: 'No active leads found.' });
        }

        let sent = 0;
        let failed = [];

        for (const lead of leads) {
            try {
                const { subject, html } = day0(lead.first_name, lead.email);
                const result = await resend.emails.send({
                    from: `Adams X Project <${SENDER}>`,
                    to: lead.email,
                    subject: `📥 Your Starter Kit — Updated Download Link`,
                    html,
                    reply_to: 'adams@adamsxproject.com.ng',
                    tags: [{ name: 'sequence', value: 'resend-welcome' }]
                });
                if (result.error) throw new Error(result.error.message);
                sent++;
                // Small delay to respect Resend rate limits
                await new Promise(r => setTimeout(r, 300));
            } catch (e) {
                console.error(`[resend-welcome] Failed for ${lead.email}:`, e.message);
                failed.push(lead.email);
            }
        }

        console.log(`[resend-welcome] ✅ Sent: ${sent}, Failed: ${failed.length}`);
        return res.json({ success: true, sent, failed });

    } catch (err) {
        console.error('[resend-welcome] Error:', err);
        return res.status(500).json({ error: err.message });
    }
});

// ── GET /api/admin/send-apology?token=sendnow ───────────────
// Browser-triggerable one-time apology blast to all leads
// Visit: https://adamsxproject.com.ng/api/admin/send-apology?token=sendnow
app.get('/api/admin/send-apology', async (req, res) => {
    if (req.query.token !== 'sendnow') {
        return res.status(401).send('Unauthorized.');
    }
    if (!supabase) {
        return res.status(500).send('Supabase not configured.');
    }

    try {
        const { data: leads, error } = await supabase
            .from('leads')
            .select('first_name, email')
            .eq('active', true);

        if (error) throw new Error(error.message);
        if (!leads || leads.length === 0) {
            return res.send('No active leads found.');
        }

        let sent = 0;
        let failed = [];

        for (const lead of leads) {
            try {
                const { subject, html } = apologyResend(lead.first_name, lead.email);
                const result = await resend.emails.send({
                    from: `Adams X Project <${SENDER}>`,
                    to: lead.email,
                    subject,
                    html,
                    reply_to: 'adams@adamsxproject.com.ng',
                    tags: [{ name: 'sequence', value: 'apology-resend' }]
                });
                if (result.error) throw new Error(result.error.message);
                sent++;
                await new Promise(r => setTimeout(r, 300));
            } catch (e) {
                console.error(`[send-apology] Failed for ${lead.email}:`, e.message);
                failed.push(lead.email);
            }
        }

        console.log(`[send-apology] ✅ Sent: ${sent}, Failed: ${failed.length}`);
        return res.send(`✅ Done! Sent: ${sent} | Failed: ${failed.length}${failed.length ? ' | ' + failed.join(', ') : ''}`);

    } catch (err) {
        console.error('[send-apology] Error:', err);
        return res.status(500).send(`Error: ${err.message}`);
    }
});

// ── PAID EBOOK CONFIGURATION ────────────────────────────────
// When your Whop product is live, place the URL here (or define in .env: PAID_EBOOK_URL)
const PAID_EBOOK_URL = process.env.PAID_EBOOK_URL || 'https://whop.com/adams-x/comeback-unrecognized/?a=adamsproject';

// ── GET /api/admin/send-paid-access ─────────────────────────
// Admin tool: Trigger sending the Paid Ebook Access email to a buyer.
// Browser URL: https://adamsxproject.com.ng/api/admin/send-paid-access?email=buyer@example.com&name=John&token=send
app.get('/api/admin/send-paid-access', async (req, res) => {
    const { email, name, token } = req.query;

    if (token !== 'send') {
        return res.status(401).send('Unauthorized. Set query param ?token=send');
    }
    if (!email || !name) {
        return res.status(400).send('Missing email or name query parameter. E.g., ?email=test@test.com&name=Alex');
    }

    try {
        const { subject, html } = paidEbookAccess(name, PAID_EBOOK_URL, email);
        const emailResponse = await resend.emails.send({
            from: `Adams X Project <${SENDER}>`,
            to: email,
            subject,
            html,
            reply_to: 'adams@adamsxproject.com.ng',
            tags: [{ name: 'sequence', value: 'paid-product-delivery' }]
        });

        if (emailResponse.error) {
            throw new Error(emailResponse.error.message || 'Resend failed to send product delivery email.');
        }

        // Update purchased flag in leads table in Supabase if the user is a registered lead
        if (supabase) {
            const { error: dbError } = await supabase
                .from('leads')
                .update({ purchased: true })
                .eq('email', email);
            if (dbError) {
                console.error('[send-paid-access] Supabase update error:', dbError);
            } else {
                console.log(`[send-paid-access] Updated purchased status in Supabase for: ${email}`);
            }
        }

        console.log(`[send-paid-access] ✅ Paid ebook access email sent to ${email}`);
        return res.send(`✅ Success! Paid ebook delivery email sent to ${name} (${email}).`);

    } catch (err) {
        console.error('[send-paid-access] Error:', err);
        return res.status(500).send(`Error: ${err.message}`);
    }
});

// ── GET /api/download/tracker ───────────────────────────────
// Tracks when a subscriber clicks the download link in the welcome/apology email.
// Redirects/streams the file to prompt download.
app.get('/api/download/tracker', async (req, res) => {
    const { email } = req.query;

    if (email) {
        try {
            if (supabase) {
                const { error: dbError } = await supabase
                    .from('leads')
                    .update({
                        downloaded: true,
                        downloaded_at: new Date().toISOString()
                    })
                    .eq('email', email);
                
                if (dbError) {
                    console.error('[tracker] Supabase error:', dbError);
                } else {
                    console.log(`[tracker] Download logged for: ${email}`);
                }
            }
        } catch (err) {
            console.error('[tracker] Error updating lead:', err.message);
        }
    }

    // Force the browser to download the file instead of opening it inline
    res.setHeader('Content-Disposition', 'attachment; filename="Monk-Mode-Starter-Kit.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(path.join(__dirname, 'ebooks', 'monk-mode-starter-kit.pdf'));
});

// ── Serve bonus.html for /bonus ─────────────────────────────
app.get('/bonus', (req, res) => {
    res.sendFile(path.join(__dirname, 'bonus.html'));
});

// ── Serve unsubscribe.html for /unsubscribe ─────────────────
app.get('/unsubscribe', (req, res) => {
    res.sendFile(path.join(__dirname, 'unsubscribe.html'));
});

// ── POST /api/claim-bonus ────────────────────────────────────
// Validates email, updates status, and delivers the bonus gift email
app.post('/api/claim-bonus', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
    }
    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Missing RESEND_API_KEY.' });
    }

    try {
        let firstName = 'Creator';

        // 1. Verify they exist in the leads table first (must have signed up for the kit)
        if (supabase) {
            const { data: lead, error: dbError } = await supabase
                .from('leads')
                .select('first_name, active')
                .eq('email', email)
                .single();

            if (dbError || !lead) {
                console.warn(`[claim-bonus] Email not found in leads: ${email}`);
                return res.status(404).json({ error: 'Please subscribe to the 7-Day Monk Mode Starter Kit first before claiming your bonus gift.' });
            }
            firstName = lead.first_name;

            // 2. Mark bonus as claimed in DB
            const { error: updateError } = await supabase
                .from('leads')
                .update({
                    bonus_claimed: true,
                    bonus_claimed_at: new Date().toISOString()
                })
                .eq('email', email);

            if (updateError) {
                console.error('[claim-bonus] Supabase update error:', updateError);
            }
        }

        // 3. Send bonus delivery email
        const { subject, html } = bonusDelivery(firstName, email);
        const emailResponse = await resend.emails.send({
            from: `Adams X Project <${SENDER}>`,
            to: email,
            subject,
            html,
            reply_to: 'adams@adamsxproject.com.ng',
            tags: [{ name: 'sequence', value: 'bonus-gift-delivery' }]
        });

        if (emailResponse.error) {
            throw new Error(emailResponse.error.message || 'Resend failed to send bonus email.');
        }

        console.log(`[claim-bonus] ✅ Bonus email sent to ${email}`);
        return res.status(200).json({ success: true, message: 'Bonus gift dispatched. Check your inbox.' });

    } catch (err) {
        console.error('[claim-bonus] Error:', err);
        return res.status(500).json({ error: 'Failed to claim bonus.', details: err.message });
    }
});

// ── POST /api/unsubscribe ────────────────────────────────────
// Deactivates lead and deletes from waitlist to opt-out of all communications
app.post('/api/unsubscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
    }

    try {
        if (supabase) {
            // 1. Deactivate in leads
            const { error: leadsErr } = await supabase
                .from('leads')
                .update({ active: false })
                .eq('email', email);
            
            if (leadsErr) {
                console.error('[unsubscribe] Supabase leads error:', leadsErr);
            }

            // 2. Deactivate in waitlist
            const { error: waitlistErr } = await supabase
                .from('waitlist')
                .update({ active: false })
                .eq('email', email);

            if (waitlistErr) {
                console.error('[unsubscribe] Supabase waitlist error:', waitlistErr);
            }

            // 3. Deactivate post-purchase sequence if active
            const { error: ppErr } = await supabase
                .from('purchased_subscribers')
                .update({ active: false })
                .eq('email', email);

            if (ppErr) {
                console.error('[unsubscribe] Supabase purchased_subscribers error:', ppErr);
            }
        }

        console.log(`[unsubscribe] ✅ Unsubscribed email: ${email}`);
        return res.status(200).json({ success: true, message: 'Successfully unsubscribed.' });

    } catch (err) {
        console.error('[unsubscribe] Error:', err);
        return res.status(500).json({ error: 'Failed to unsubscribe.', details: err.message });
    }
});

// ── POST /api/audit-log ─────────────────────────────────────
// Logs anonymous slider values from the Dopamine Audit tool for analytics.
app.post('/api/audit-log', async (req, res) => {
    const { workHours, screenTime, exerciseDays, score } = req.body;

    const parsedWork = parseInt(workHours, 10);
    const parsedScreen = parseInt(screenTime, 10);
    const parsedExercise = parseInt(exerciseDays, 10);
    const parsedScore = parseInt(score, 10);

    if (isNaN(parsedWork) || isNaN(parsedScreen) || isNaN(parsedExercise) || isNaN(parsedScore)) {
        return res.status(400).json({ error: 'All fields must be valid numbers.' });
    }

    try {
        if (supabase) {
            const { error: dbError } = await supabase
                .from('audit_logs')
                .insert({
                    work_hours: parsedWork,
                    screen_time: parsedScreen,
                    exercise_days: parsedExercise,
                    calculated_score: parsedScore
                });

            if (dbError) {
                console.error('[audit-log] Supabase logging error:', dbError);
                return res.status(200).json({ success: false, warning: 'Failed to write log to database.' });
            }
            console.log(`[audit-log] ✅ Logged dopamine audit: Work=${parsedWork}h, Screen=${parsedScreen}h, Exercise=${parsedExercise}d, Score=${parsedScore}`);
        } else {
            console.log(`[audit-log] (Dev) Supabase not configured. Simulated log: Work=${parsedWork}h, Screen=${parsedScreen}h, Exercise=${parsedExercise}d, Score=${parsedScore}`);
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('[audit-log] Fatal error:', err);
        return res.status(200).json({ success: false, error: err.message });
    }
});

// ── Survey Response API ─────────────────────────────────────
app.post('/api/survey', async (req, res) => {
    try {
        const { name, whatsapp, email, country, status, reason, spend_recency, open_response } = req.body || {};

        // Server-side validation — all required fields
        if (
            !name          || typeof name          !== 'string' || !name.trim()          ||
            !whatsapp      || typeof whatsapp      !== 'string' || !whatsapp.trim()      ||
            !country       || typeof country       !== 'string' || !country.trim()       ||
            !status        || typeof status        !== 'string' || !status.trim()        ||
            !reason        || typeof reason        !== 'string' || !reason.trim()        ||
            !spend_recency || typeof spend_recency !== 'string' || !spend_recency.trim() ||
            !open_response || typeof open_response !== 'string' || !open_response.trim()
        ) {
            return res.status(400).json({ error: 'All required questions must be answered before submitting.' });
        }

        if (!supabase) {
            console.error('[survey] Supabase client not initialized.');
            return res.status(500).json({ error: 'Server configuration error: database not connected.' });
        }

        const { data, error } = await supabase
            .from('survey_responses')
            .insert([{
                name:          name.trim(),
                whatsapp:      whatsapp.trim(),
                email:         (email || '').trim() || null,
                country:       country.trim(),
                status:        status.trim(),
                reason:        reason.trim(),
                spend_recency: spend_recency.trim(),
                open_response: open_response.trim(),
            }])
            .select();

        if (error) {
            console.error('[survey] Supabase insert error:', error);
            let userError = error.message || 'Failed to record response. Please try again.';
            if (error.code === '42P01' || (error.message && error.message.toLowerCase().includes('does not exist'))) {
                userError = 'Database setup required: Please run supabase-survey.sql in your Supabase Dashboard SQL Editor.';
            }
            return res.status(500).json({ error: userError });
        }

        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('[survey] Fatal error:', err);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

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
