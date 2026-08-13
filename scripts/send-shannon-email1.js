require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Resend } = require('resend');
const { supabase } = require('../lib/supabase');
const { postPurchaseEmail1 } = require('../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const SHANNON_EMAIL = 'shannonworks75@gmail.com';
const SHANNON_NAME = 'Shannon';

async function main() {
    console.log(`[send-shannon] Preparing to send Post-Purchase Email 1 to ${SHANNON_EMAIL}...`);

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ Error: RESEND_API_KEY is missing in .env');
        process.exit(1);
    }

    // 1. Generate email template
    const { subject, html } = postPurchaseEmail1(SHANNON_NAME, SHANNON_EMAIL);

    // 2. Send via Resend
    try {
        const response = await resend.emails.send({
            from: `Adams X <${SENDER}>`,
            to: SHANNON_EMAIL,
            subject: subject,
            html: html,
            reply_to: 'adams@adamsxproject.com.ng',
            tags: [{ name: 'sequence', value: 'post-purchase-email1' }]
        });

        if (response.error) {
            console.error('❌ Resend API Error:', response.error);
            process.exit(1);
        }

        console.log(`✅ Post-Purchase Email 1 sent successfully to ${SHANNON_EMAIL}!`);
        console.log(`   Message ID: ${response.data.id}`);

        // 3. Update Supabase if client exists
        if (supabase) {
            const now = new Date().toISOString();

            // Upsert into purchased_subscribers with sequence_day = 0
            const { error: dbError } = await supabase
                .from('purchased_subscribers')
                .upsert(
                    {
                        first_name: SHANNON_NAME,
                        email: SHANNON_EMAIL,
                        sequence_day: 0,
                        last_sent_at: now,
                        enrolled_at: now,
                        active: true
                    },
                    { onConflict: 'email' }
                );

            if (dbError) {
                console.warn('⚠️ Supabase sync warning:', dbError.message);
            } else {
                console.log(`✅ Supabase purchased_subscribers updated for ${SHANNON_EMAIL}.`);
            }
        }
    } catch (err) {
        console.error('❌ Unexpected error sending email:', err.message);
        process.exit(1);
    }
}

main();
