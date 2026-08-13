// ============================================================
// POST /api/webhooks/whop
//
// PURPOSE: Receive Whop purchase webhook and:
//   1. Verify HMAC-SHA256 signature (x-whop-signature header)
//   2. On purchase.completed event:
//      a. Mark subscriber as purchased=true in `leads` and `waitlist`
//      b. Enroll buyer in `purchased_subscribers` table
//      c. Send Post-Purchase Email 1 immediately
//      d. Notify Adams via admin email
//
// SETUP:
//   - Add WHOP_WEBHOOK_SECRET to your .env
//   - In Whop dashboard → Product → Developer → Webhooks:
//     URL: https://adamsxproject.com.ng/api/webhooks/whop
//     Events: purchase.completed (minimum)
//
// SECURITY:
//   - Signature verified before any DB writes
//   - Raw body required for HMAC — uses express.raw() middleware
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const crypto = require('crypto');
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const { postPurchaseEmail1 } = require('../../lib/email-templates');

const resend   = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER   = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

// ── Signature verification ────────────────────────────────────
// Whop signs the raw request body with HMAC-SHA256.
// Header: x-whop-signature  (format: "sha256=<hex_digest>")
function verifyWhopSignature(rawBody, signatureHeader) {
    const secret = process.env.WHOP_WEBHOOK_SECRET;
    if (!secret) {
        console.warn('[whop-webhook] WHOP_WEBHOOK_SECRET not set — skipping signature check');
        return true; // allow through in dev if secret not configured
    }
    if (!signatureHeader) return false;

    const expected = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

    // Constant-time comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signatureHeader),
            Buffer.from(expected)
        );
    } catch {
        return false;
    }
}

// ── Enroll buyer in post-purchase sequence ────────────────────
async function enrollBuyer(firstName, email) {
    if (!supabase) throw new Error('Supabase not configured');

    const now = new Date().toISOString();

    // Upsert into purchased_subscribers (idempotent)
    const { error: enrollErr } = await supabase
        .from('purchased_subscribers')
        .upsert(
            {
                first_name: firstName,
                email,
                sequence_day: 0,
                enrolled_at: now,
                last_sent_at: now,
                active: true,
            },
            { onConflict: 'email', ignoreDuplicates: false }
        );

    if (enrollErr) {
        console.error('[whop-webhook] purchased_subscribers upsert error:', enrollErr);
        throw new Error(enrollErr.message);
    }
}

// ── Suppress from active drip sequences ──────────────────────
async function suppressFromDrips(email) {
    if (!supabase) return;

    // Mark purchased in leads table (stops drip cron from sending)
    await supabase.from('leads')
        .update({ purchased: true, active: false })
        .eq('email', email);

    // Mark purchased in waitlist table
    await supabase.from('waitlist')
        .update({ purchased: true, active: false })
        .eq('email', email);
}

// ── Main handler ─────────────────────────────────────────────
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    // Raw body for signature verification
    // NOTE: This handler must be mounted BEFORE express.json() parses the body.
    // In server.js we register this route with express.raw() middleware.
    const rawBody = req.rawBody || req.body;
    const signature = req.headers['x-whop-signature'];

    if (!verifyWhopSignature(rawBody, signature)) {
        console.warn('[whop-webhook] ❌ Invalid signature — rejected');
        return res.status(401).json({ error: 'Invalid webhook signature.' });
    }

    // Parse the body
    let payload;
    try {
        const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
        payload = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr;
    } catch (parseErr) {
        console.error('[whop-webhook] Body parse error:', parseErr.message);
        return res.status(400).json({ error: 'Invalid JSON body.' });
    }

    const event = payload?.event || payload?.action;
    console.log(`[whop-webhook] Received event: ${event}`);

    // ── Only process purchase events ──────────────────────────
    const isPurchaseEvent = [
        'purchase.completed',
        'membership.went_valid',   // Whop also fires this on new memberships
        'payment.succeeded',
    ].includes(event);

    if (!isPurchaseEvent) {
        // Acknowledge non-purchase events silently
        return res.status(200).json({ received: true, processed: false, event });
    }

    // ── Extract buyer details from payload ────────────────────
    // Whop payload structure varies slightly by event type.
    // Common paths: data.user, data.membership.user, data.customer
    const data = payload.data || payload;
    const user = data.user || data.membership?.user || data.customer || payload.user || {};

    const email = user.email || data.email || data.buyer_email || data.payment?.email || payload.email;
    const rawName = user.name || user.first_name || data.name || data.first_name || payload.name;
    const firstName = rawName && String(rawName).trim() ? String(rawName).trim().split(' ')[0] : 'Friend';

    if (!email) {
        console.error('[whop-webhook] No email found in payload:', JSON.stringify(payload, null, 2));
        return res.status(422).json({ error: 'No email address in webhook payload.' });
    }

    console.log(`[whop-webhook] Processing purchase for: ${firstName} <${email}>`);

    try {
        // 1. Suppress from drip sequences
        await suppressFromDrips(email);
        console.log(`[whop-webhook] ✅ Suppressed ${email} from drip sequences`);

        // 2. Enroll in post-purchase sequence
        await enrollBuyer(firstName, email);
        console.log(`[whop-webhook] ✅ Enrolled ${email} in post-purchase sequence`);

        // 3. Send Post-Purchase Email 1 immediately
        const { subject, html } = postPurchaseEmail1(firstName, email);
        const emailResult = await resend.emails.send({
            from: `Adams X <${SENDER}>`,
            to: email,
            subject,
            html,
            reply_to: REPLY_TO,
            tags: [{ name: 'sequence', value: 'post-purchase' }],
        });

        if (emailResult.error) {
            throw new Error(emailResult.error.message || 'Resend error on PP Email 1');
        }
        console.log(`[whop-webhook] ✅ Post-Purchase Email 1 sent to ${email}`);

        // 4. Admin notification
        if (process.env.NOTIFICATION_EMAIL) {
            await resend.emails.send({
                from: `Adams X Lead Alerts <${SENDER}>`,
                to: process.env.NOTIFICATION_EMAIL,
                subject: `💳 NEW BUYER: ${firstName} just purchased (${email})`,
                reply_to: REPLY_TO,
                html: `
                    <div style="font-family:sans-serif;padding:24px;max-width:500px;">
                        <h3 style="margin:0 0 16px;">💳 New Whop Purchase</h3>
                        <p><strong>Name:</strong> ${firstName}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Event:</strong> ${event}</p>
                        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                        <p><strong>Actions taken:</strong><br>
                            ✅ Suppressed from drip sequences<br>
                            ✅ Enrolled in post-purchase sequence<br>
                            ✅ PP Email 1 sent
                        </p>
                    </div>`
            }).catch(e => console.error('[whop-webhook] Admin notify failed:', e.message));
        }

        return res.status(200).json({ success: true, email, event });

    } catch (err) {
        console.error('[whop-webhook] ❌ Processing error:', err.message);
        // Return 200 to prevent Whop from retrying endlessly
        // Log the error but don't let it cause retry storms
        return res.status(200).json({ received: true, error: err.message });
    }
}

module.exports = handler;
