// ============================================================
// SCRIPT: scripts/send-customer-checkin.js
//
// PURPOSE: Send a personalized member re-engagement & check-in email
// to paying customers who haven't been active recently (e.g. Shannon).
//
// USAGE:
//   node scripts/send-customer-checkin.js --email=shannonworks75@gmail.com --name="Shannon"
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Resend } = require('resend');
const { supabase } = require('../lib/supabase');
const { customerReactivationEmail } = require('../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

async function sendCheckIn(name = 'Shannon', email = 'shannonworks75@gmail.com') {
    const firstName = name.trim().split(' ')[0];
    console.log(`\n============================================================`);
    console.log(`💬 SENDING MEMBER CHECK-IN: ${firstName} <${email}>`);
    console.log(`============================================================\n`);

    try {
        const { subject, html } = customerReactivationEmail(firstName, email);
        const emailResult = await resend.emails.send({
            from: `Adams X <${SENDER}>`,
            to: email,
            subject,
            html,
            reply_to: REPLY_TO,
            tags: [
                { name: 'sequence', value: 'customer-checkin' },
                { name: 'type', value: 'member-reactivation' }
            ]
        });

        if (emailResult.error) {
            throw new Error(emailResult.error.message || 'Resend delivery failed');
        }

        console.log(`✅ Member Check-In Email sent successfully to ${email} (ID: ${emailResult.data?.id})`);

        if (supabase) {
            await supabase
                .from('purchased_subscribers')
                .update({ last_sent_at: new Date().toISOString() })
                .eq('email', email);
            console.log(`✅ Updated last_sent_at in purchased_subscribers table.`);
        }

    } catch (err) {
        console.error(`❌ Error sending check-in email:`, err.message);
    }
}

const args = process.argv.slice(2);
const emailArg = args.find(a => a.startsWith('--email='))?.split('=')[1] || 'shannonworks75@gmail.com';
const nameArg = args.find(a => a.startsWith('--name='))?.split('=')[1] || 'Shannon';

sendCheckIn(nameArg, emailArg);
