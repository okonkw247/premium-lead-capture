// ============================================================
// POST /api/webhooks/whop
//
// PURPOSE: Receive Whop lifecycle webhooks and handle:
//   1. PAID ("purchase.completed", "payment.succeeded"):
//      - Suppress from drip sequences
//      - Enroll in `purchased_subscribers` table
//      - Send Post-Purchase Email 1 immediately
//      - Admin alert
//   2. INCOMPLETE PAYMENT ("payment.failed", "checkout.incomplete", etc.):
//      - Check if not already paid
//      - Send direct single recovery email with working web checkout link
//      - Admin alert
//   3. JOINED ("user.created", "membership.created", "company.joined", etc.):
//      - Check if not already paid
//      - Enroll into Segment A (waitlist table) with sequence_day = 0
//      - Send Segment A Email 1 immediately (drip cron continues every 2 days)
//      - Admin alert
//   4. LEFT ("membership.went_invalid", "membership.deleted", "membership.cancelled"):
//      - Mark inactive in DB
//      - Scaffolding / flag for future re-engagement copy (auto-send disabled)
//      - Admin alert
//
// SECURITY:
//   - HMAC-SHA256 signature verified with WHOP_WEBHOOK_SECRET
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const crypto = require('crypto');
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');
const { postPurchaseEmail1, incompletePaymentEmail, segAEmail1 } = require('../../lib/email-templates');

const resend   = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER   = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

// Feature flag for Left / Churned members (leave false until copy is ready)
const ENABLE_LEFT_REENGAGEMENT = false;

// ── Signature verification ────────────────────────────────────
function verifyWhopSignature(rawBody, signatureHeader) {
    const secret = process.env.WHOP_WEBHOOK_SECRET;
    if (!secret) {
        console.warn('[whop-webhook] WHOP_WEBHOOK_SECRET not set — skipping signature check');
        return true;
    }
    if (!signatureHeader) return false;

    const expected = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

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

    await supabase.from('leads')
        .update({ purchased: true, active: false })
        .eq('email', email);

    await supabase.from('waitlist')
        .update({ purchased: true, active: false })
        .eq('email', email);
}

// ── Main handler ─────────────────────────────────────────────
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const rawBody = req.rawBody || req.body;
    const signature = req.headers['x-whop-signature'];

    if (!verifyWhopSignature(rawBody, signature)) {
        console.warn('[whop-webhook] ❌ Invalid signature — rejected');
        return res.status(401).json({ error: 'Invalid webhook signature.' });
    }

    let payload;
    try {
        const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
        payload = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr;
    } catch (parseErr) {
        console.error('[whop-webhook] Body parse error:', parseErr.message);
        return res.status(400).json({ error: 'Invalid JSON body.' });
    }

    const event = payload?.event || payload?.action || 'unknown';
    console.log(`[whop-webhook] Received event: ${event}`);

    // Extract user details
    const data = payload.data || payload;
    const user = data.user || data.membership?.user || data.customer || payload.user || {};

    const email = user.email || data.email || data.buyer_email || data.payment?.email || payload.email;
    const rawName = user.name || user.first_name || data.name || data.first_name || payload.name;
    const firstName = rawName && String(rawName).trim() ? String(rawName).trim().split(' ')[0] : 'Friend';

    if (!email) {
        console.warn('[whop-webhook] No email in payload, event acknowledged:', event);
        return res.status(200).json({ received: true, processed: false, reason: 'no_email' });
    }

    // ── EVENT CLASSIFICATION ─────────────────────────────────
    const isPurchaseEvent = [
        'purchase.completed',
        'payment.succeeded',
        'membership.went_valid'
    ].includes(event);

    const isIncompletePaymentEvent = [
        'payment.failed',
        'checkout.incomplete',
        'checkout.abandoned',
        'payment.requires_action',
        'payment.action_required',
        'subscription.payment_failed'
    ].includes(event);

    const isJoinedEvent = [
        'user.created',
        'membership.created',
        'company.joined',
        'waitlist.joined',
        'member.joined',
        'membership.state_changed'
    ].includes(event);

    const isLeftEvent = [
        'membership.went_invalid',
        'membership.deleted',
        'membership.terminated',
        'membership.cancelled',
        'member.left'
    ].includes(event);

    try {
        // ========================================================
        // 1. STATUS = PAID (EXISTING & UNTOUCHED LOGIC)
        // ========================================================
        if (isPurchaseEvent) {
            console.log(`[whop-webhook] Processing purchase for: ${firstName} <${email}>`);

            // Suppress from drip sequences
            await suppressFromDrips(email);

            // Enroll in post-purchase sequence
            await enrollBuyer(firstName, email);

            // Send Post-Purchase Email 1 immediately
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

            // Admin notification
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

            return res.status(200).json({ success: true, email, status: 'paid', event });
        }

        // ========================================================
        // 2. STATUS = INCOMPLETE PAYMENT (Apple IAP failure / checkout abandoned)
        // ========================================================
        if (isIncompletePaymentEvent) {
            console.log(`[whop-webhook] Processing incomplete payment for: ${firstName} <${email}>`);

            // If already purchased, don't send recovery
            if (supabase) {
                const { data: alreadyBuyer } = await supabase
                    .from('purchased_subscribers')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();

                if (alreadyBuyer) {
                    console.log(`[whop-webhook] Skipping incomplete payment email for ${email} — already purchased.`);
                    return res.status(200).json({ received: true, processed: false, reason: 'already_paid' });
                }

                // Record in waitlist/leads with active status
                await supabase.from('waitlist').upsert(
                    {
                        first_name: firstName,
                        email,
                        segment: 'A',
                        last_sent_at: new Date().toISOString(),
                        active: true,
                        purchased: false,
                    },
                    { onConflict: 'email', ignoreDuplicates: false }
                );
            }

            // Send single re-engagement email with working direct web checkout link
            const { subject, html } = incompletePaymentEmail(firstName, email);
            const emailResult = await resend.emails.send({
                from: `Adams X <${SENDER}>`,
                to: email,
                subject,
                html,
                reply_to: REPLY_TO,
                tags: [{ name: 'sequence', value: 'recovery-incomplete-payment' }],
            });

            if (emailResult.error) {
                throw new Error(emailResult.error.message || 'Resend error on incomplete payment email');
            }
            console.log(`[whop-webhook] ✅ Incomplete payment recovery email sent to ${email}`);

            // Admin notification
            if (process.env.NOTIFICATION_EMAIL) {
                await resend.emails.send({
                    from: `Adams X Lead Alerts <${SENDER}>`,
                    to: process.env.NOTIFICATION_EMAIL,
                    subject: `⚠️ INCOMPLETE PAYMENT: ${firstName} (${email})`,
                    reply_to: REPLY_TO,
                    html: `
                        <div style="font-family:sans-serif;padding:24px;max-width:500px;">
                            <h3 style="margin:0 0 16px;color:#d97706;">⚠️ Incomplete Checkout / Payment Failed</h3>
                            <p><strong>Name:</strong> ${firstName}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Event:</strong> ${event}</p>
                            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                            <p><strong>Action taken:</strong><br>
                                ✅ Dispatched recovery email with direct web checkout link
                            </p>
                        </div>`
                }).catch(e => console.error('[whop-webhook] Admin notify failed:', e.message));
            }

            return res.status(200).json({ success: true, email, status: 'incomplete_payment', event });
        }

        // ========================================================
        // 3. STATUS = JOINED (Signed up on Whop / free member, not yet purchased)
        // ========================================================
        if (isJoinedEvent) {
            console.log(`[whop-webhook] Processing joined lead: ${firstName} <${email}>`);

            // If already purchased, skip nurture
            if (supabase) {
                const { data: alreadyBuyer } = await supabase
                    .from('purchased_subscribers')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();

                if (alreadyBuyer) {
                    console.log(`[whop-webhook] Skipping nurture email for ${email} — already purchased.`);
                    return res.status(200).json({ received: true, processed: false, reason: 'already_paid' });
                }

                // Enroll into Segment A (waitlist table) with sequence_day = 0
                const now = new Date().toISOString();
                await supabase.from('waitlist').upsert(
                    {
                        first_name: firstName,
                        email,
                        segment: 'A',
                        sequence_day: 0,
                        enrolled_at: now,
                        last_sent_at: now,
                        active: true,
                        purchased: false,
                    },
                    { onConflict: 'email', ignoreDuplicates: false }
                );
            }

            // Send Segment A Email 1 immediately (welcome to nurture sequence)
            const { subject, html } = segAEmail1(firstName, email);
            const emailResult = await resend.emails.send({
                from: `Adams X <${SENDER}>`,
                to: email,
                subject,
                html,
                reply_to: REPLY_TO,
                tags: [{ name: 'sequence', value: 'seg-a-launch' }],
            });

            if (emailResult.error) {
                throw new Error(emailResult.error.message || 'Resend error on Seg A Email 1');
            }
            console.log(`[whop-webhook] ✅ Joined nurture Email 1 sent to ${email} (Daily cron will send subsequent emails)`);

            // Admin notification
            if (process.env.NOTIFICATION_EMAIL) {
                await resend.emails.send({
                    from: `Adams X Lead Alerts <${SENDER}>`,
                    to: process.env.NOTIFICATION_EMAIL,
                    subject: `🚀 NEW MEMBER JOINED: ${firstName} (${email})`,
                    reply_to: REPLY_TO,
                    html: `
                        <div style="font-family:sans-serif;padding:24px;max-width:500px;">
                            <h3 style="margin:0 0 16px;">🚀 New Member Joined Whop (Free)</h3>
                            <p><strong>Name:</strong> ${firstName}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Event:</strong> ${event}</p>
                            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                            <p><strong>Action taken:</strong><br>
                                ✅ Enrolled into Segment A nurture sequence (Email 1 sent now, daily cron will send follow-ups every 2 days)
                            </p>
                        </div>`
                }).catch(e => console.error('[whop-webhook] Admin notify failed:', e.message));
            }

            return res.status(200).json({ success: true, email, status: 'joined', event });
        }

        // ========================================================
        // 4. STATUS = LEFT (User left or churned before buying)
        // ========================================================
        if (isLeftEvent) {
            console.log(`[whop-webhook] Processing member left: ${firstName} <${email}>`);

            // Deactivate in DB
            if (supabase) {
                await supabase.from('waitlist').update({ active: false }).eq('email', email);
                await supabase.from('leads').update({ active: false }).eq('email', email);
            }

            // Scaffolding for re-engagement copy (guarded by flag)
            if (ENABLE_LEFT_REENGAGEMENT) {
                // When you are ready with re-engagement copy:
                // 1. Create leftReengagementEmail(firstName, email) in lib/email-templates.js
                // 2. Uncomment and send here
                /*
                const { subject, html } = leftReengagementEmail(firstName, email);
                await resend.emails.send({
                    from: `Adams X <${SENDER}>`,
                    to: email,
                    subject,
                    html,
                    reply_to: REPLY_TO,
                    tags: [{ name: 'sequence', value: 'left-reengagement' }],
                });
                */
            }
            console.log(`[whop-webhook] ✅ Left event recorded for ${email} (auto-send disabled behind flag)`);

            // Admin notification
            if (process.env.NOTIFICATION_EMAIL) {
                await resend.emails.send({
                    from: `Adams X Lead Alerts <${SENDER}>`,
                    to: process.env.NOTIFICATION_EMAIL,
                    subject: `👋 MEMBER LEFT: ${firstName} (${email})`,
                    reply_to: REPLY_TO,
                    html: `
                        <div style="font-family:sans-serif;padding:24px;max-width:500px;">
                            <h3 style="margin:0 0 16px;color:#6b7280;">👋 Member Left / Churned</h3>
                            <p><strong>Name:</strong> ${firstName}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Event:</strong> ${event}</p>
                            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                            <p><strong>Action taken:</strong> Marked inactive in database. Automated re-engagement email is staged behind a feature flag.</p>
                        </div>`
                }).catch(e => console.error('[whop-webhook] Admin notify failed:', e.message));
            }

            return res.status(200).json({ success: true, email, status: 'left', event });
        }

        // Unhandled event acknowledgment
        return res.status(200).json({ received: true, processed: false, event });

    } catch (err) {
        console.error('[whop-webhook] ❌ Processing error:', err.message);
        return res.status(200).json({ received: true, error: err.message });
    }
}

module.exports = handler;

