// ============================================================
// SCRIPT: scripts/process-lead-status.js
//
// PURPOSE: Process and trigger emails for specific leads by status
// (e.g. Incomplete payment recovery for Anya Elashry, Nurture for TYR, etc.)
//
// USAGE:
//   node scripts/process-lead-status.js --email=anyaelashry2003@gmail.com --status=incomplete_payment --name="Anya"
//   node scripts/process-lead-status.js --email=talha2007s@gmail.com --status=joined --name="TYR"
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Resend } = require('resend');
const { supabase } = require('../lib/supabase');
const { incompletePaymentEmail, segAEmail1 } = require('../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

async function processLead({ name, email, status }) {
    if (!email || !status) {
        console.error('❌ Missing email or status.');
        process.exit(1);
    }

    const firstName = name && String(name).trim() ? String(name).trim().split(' ')[0] : 'Friend';
    console.log(`\n🚀 Processing: ${firstName} <${email}> [Status: ${status}]`);

    if (status === 'incomplete_payment') {
        // Send recovery email
        const { subject, html } = incompletePaymentEmail(firstName, email);
        const result = await resend.emails.send({
            from: `Adams X <${SENDER}>`,
            to: email,
            subject,
            html,
            reply_to: REPLY_TO,
            tags: [{ name: 'sequence', value: 'recovery-incomplete-payment' }]
        });

        if (result.error) {
            console.error('❌ Resend error:', result.error);
        } else {
            console.log(`✅ Recovery email sent to ${email} (ID: ${result.data?.id})`);
        }

        if (supabase) {
            await supabase.from('waitlist').upsert({
                first_name: firstName,
                email,
                segment: 'A',
                last_sent_at: new Date().toISOString(),
                active: true,
                purchased: false
            }, { onConflict: 'email' });
            console.log(`✅ DB updated for ${email}`);
        }
    } else if (status === 'joined') {
        const { subject, html } = segAEmail1(firstName, email);
        const result = await resend.emails.send({
            from: `Adams X <${SENDER}>`,
            to: email,
            subject,
            html,
            reply_to: REPLY_TO,
            tags: [{ name: 'sequence', value: 'seg-a-launch' }]
        });

        if (result.error) {
            console.error('❌ Resend error:', result.error);
        } else {
            console.log(`✅ Nurture Email 1 sent to ${email} (ID: ${result.data?.id})`);
        }

        if (supabase) {
            const now = new Date().toISOString();
            await supabase.from('waitlist').upsert({
                first_name: firstName,
                email,
                segment: 'A',
                sequence_day: 0,
                enrolled_at: now,
                last_sent_at: now,
                active: true,
                purchased: false
            }, { onConflict: 'email' });
            console.log(`✅ DB enrolled into Segment A for ${email}`);
        }
    } else {
        console.log(`ℹ️ Status ${status} requires no automated email dispatch.`);
    }
}

// Parse CLI args
const args = process.argv.slice(2);
const emailArg = args.find(a => a.startsWith('--email='))?.split('=')[1];
const statusArg = args.find(a => a.startsWith('--status='))?.split('=')[1];
const nameArg = args.find(a => a.startsWith('--name='))?.split('=')[1] || 'Friend';
const isSegmentC = args.includes('--segment-c') || args.includes('--enroll-segment-c');

if (isSegmentC || args.includes('--dry-run')) {
    require('./enroll-segment-c');
} else if (emailArg && statusArg) {
    processLead({ name: nameArg, email: emailArg, status: statusArg });
} else {
    console.log('Script loaded.');
    console.log('Usage:');
    console.log('  node scripts/process-lead-status.js --email=... --status=... --name=...');
    console.log('  node scripts/process-lead-status.js --segment-c --dry-run');
    console.log('  node scripts/process-lead-status.js --segment-c --execute');
}
