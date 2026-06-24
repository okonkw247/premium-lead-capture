// ============================================================
// POST /api/webhooks/resend
//
// PURPOSE: Receive Resend inbound email / reply-tracking events.
//   - When a subscriber replies to any sequence email, Resend fires
//     an inbound webhook to this endpoint.
//   - We update `replied = true` on the matching lead/waitlist row
//     so Adams can see who's engaged.
//   - We notify Adams via email when a reply arrives.
//
// SETUP:
//   In Resend Dashboard → Inbound → Create Inbound Address
//   Point the "Webhook URL" to:
//     https://adamsxproject.com.ng/api/webhooks/resend
//
//   Resend inbound webhook reference:
//   https://resend.com/docs/api-reference/webhooks/inbound-email
//
// PAYLOAD (Resend inbound email event):
//   {
//     "type": "email.delivered" | "inbound_email",
//     "data": {
//       "from": "subscriber@example.com",
//       "to": ["adams@adamsxproject.com.ng"],
//       "subject": "Re: you made it to the list",
//       "html": "...",
//       "text": "..."
//     }
//   }
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Resend } = require('resend');
const { supabase } = require('../../lib/supabase');

const resend   = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER   = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    let payload;
    try {
        payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch {
        return res.status(400).json({ error: 'Invalid JSON.' });
    }

    // Resend inbound events use type="inbound_email" or type="email.inbound"
    const eventType = payload?.type || '';
    const data      = payload?.data || payload || {};

    // Extract sender email from the inbound message
    // Resend format: data.from = "Name <email@example.com>" or just "email@example.com"
    const rawFrom   = data.from || data.sender || '';
    const emailMatch = rawFrom.match(/<([^>]+)>/) || [null, rawFrom.trim()];
    const replyEmail = emailMatch[1]?.toLowerCase();

    if (!replyEmail) {
        console.log(`[resend-webhook] No sender email in payload — skipping. Event: ${eventType}`);
        return res.status(200).json({ received: true, processed: false });
    }

    const replySubject = data.subject || '(no subject)';
    const replyText    = data.text || data.plain || '';
    const firstName    = data.from_name || rawFrom.split('<')[0].trim() || 'Subscriber';

    console.log(`[resend-webhook] 📩 Inbound reply from ${replyEmail}: "${replySubject}"`);

    // ── Mark replied in both tables (fire-and-forget DB updates) ──
    if (supabase) {
        const updateReplied = { replied: true };
        const [leadUpdate, waitlistUpdate] = await Promise.allSettled([
            supabase.from('leads').update(updateReplied).eq('email', replyEmail),
            supabase.from('waitlist').update(updateReplied).eq('email', replyEmail),
        ]);
        if (leadUpdate.status === 'rejected') {
            console.error('[resend-webhook] Leads update failed:', leadUpdate.reason);
        }
        if (waitlistUpdate.status === 'rejected') {
            console.error('[resend-webhook] Waitlist update failed:', waitlistUpdate.reason);
        }
        console.log(`[resend-webhook] ✅ Marked replied=true for ${replyEmail}`);
    }

    // ── Forward reply notification to Adams ──────────────────
    if (process.env.NOTIFICATION_EMAIL) {
        const previewText = replyText.slice(0, 300).replace(/\n/g, '<br>') || '(no text preview)';
        const notifyResult = await resend.emails.send({
            from: `Adams X Replies <${SENDER}>`,
            to: process.env.NOTIFICATION_EMAIL,
            subject: `💬 Reply from ${firstName || replyEmail}: "${replySubject}"`,
            reply_to: replyEmail, // so Adams can reply directly to the subscriber
            html: `
                <div style="font-family:sans-serif;padding:24px;max-width:560px;">
                    <h3 style="margin:0 0 12px;">💬 Subscriber Reply</h3>
                    <p><strong>From:</strong> ${rawFrom}</p>
                    <p><strong>Subject:</strong> ${replySubject}</p>
                    <p><strong>Preview:</strong></p>
                    <blockquote style="margin:12px 0;padding:12px;background:#f5f5f5;border-left:3px solid #ccc;">
                        ${previewText}
                    </blockquote>
                    <p style="font-size:12px;color:#999;">
                        Hit reply to respond directly to this subscriber.
                    </p>
                </div>`
        }).catch(e => {
            console.error('[resend-webhook] Admin notify failed:', e.message);
            return null;
        });

        if (notifyResult?.error) {
            console.error('[resend-webhook] Notify send error:', notifyResult.error);
        } else {
            console.log(`[resend-webhook] ✅ Admin notified of reply from ${replyEmail}`);
        }
    }

    return res.status(200).json({ received: true, processed: true, from: replyEmail });
}

module.exports = handler;
