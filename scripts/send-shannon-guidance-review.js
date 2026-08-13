// ============================================================
// Script: Send Shannon the Guidance & Review Request Email NOW
// Usage:  node scripts/send-shannon-guidance-review.js
//
// This script:
//   1. Finds Shannon in the leads/waitlist tables
//   2. Marks her as purchased = true
//   3. Enrolls her in purchased_subscribers (if not already)
//   4. Sends the postPurchaseEmailReview email immediately via Resend
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Resend } = require('resend');
const { supabase } = require('../lib/supabase');
const { postPurchaseEmailReview } = require('../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

async function main() {
    if (!supabase) {
        console.error('❌ Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
        process.exit(1);
    }

    // ── 1. Find Shannon ──
    const SHANNON_EMAIL = 'shannonworks75@gmail.com';
    const SHANNON_NAME = 'Shannon';

    console.log(`[shannon] 🔍 Searching for ${SHANNON_EMAIL} in leads table...`);
    const { data: leadsMatch, error: leadsErr } = await supabase
        .from('leads')
        .select('id, first_name, email, purchased')
        .eq('email', SHANNON_EMAIL);

    if (leadsErr) {
        console.error('[shannon] DB error searching leads:', leadsErr.message);
    }

    const { data: waitlistMatch, error: waitlistErr } = await supabase
        .from('waitlist')
        .select('id, first_name, email, purchased')
        .eq('email', SHANNON_EMAIL);

    if (waitlistErr) {
        console.error('[shannon] DB error searching waitlist:', waitlistErr.message);
    }

    const allMatches = [...(leadsMatch || []), ...(waitlistMatch || [])];
    
    let firstName = SHANNON_NAME;
    let email = SHANNON_EMAIL;

    if (allMatches.length === 0) {
        console.log(`[shannon] ⚠️  No existing record found for ${SHANNON_EMAIL}. Will create her in purchased_subscribers directly.`);
    } else {
        console.log(`[shannon] Found ${allMatches.length} match(es):`);
        allMatches.forEach(m => console.log(`  → ${m.first_name} (${m.email}) | purchased: ${m.purchased}`));
        firstName = allMatches[0].first_name || SHANNON_NAME;
    }

    // ── 2. Mark as purchased ──
    console.log(`\n[shannon] 📝 Marking ${firstName} (${email}) as purchased...`);

    if (leadsMatch && leadsMatch.length > 0) {
        const { error } = await supabase
            .from('leads')
            .update({ purchased: true })
            .eq('email', email);
        if (error) console.error('[shannon] Error updating leads:', error.message);
        else console.log('[shannon] ✅ leads.purchased = true');
    }

    if (waitlistMatch && waitlistMatch.length > 0) {
        const { error } = await supabase
            .from('waitlist')
            .update({ purchased: true })
            .eq('email', email);
        if (error) console.error('[shannon] Error updating waitlist:', error.message);
        else console.log('[shannon] ✅ waitlist.purchased = true');
    }

    // ── 3. Enroll in purchased_subscribers ──
    console.log(`[shannon] 📝 Enrolling in purchased_subscribers...`);
    const { error: enrollErr } = await supabase
        .from('purchased_subscribers')
        .upsert({
            first_name: firstName,
            email: email,
            sequence_day: 0,
            last_sent_at: new Date().toISOString(),
            enrolled_at: new Date().toISOString(),
            active: true
        }, { onConflict: 'email' });

    if (enrollErr) {
        console.error('[shannon] Error enrolling in purchased_subscribers:', enrollErr.message);
    } else {
        console.log('[shannon] ✅ Enrolled in purchased_subscribers');
    }

    // ── 4. Send guidance & review email NOW ──
    if (!process.env.RESEND_API_KEY) {
        console.error('\n❌ RESEND_API_KEY not set. Cannot send email. Set it in .env and retry.');
        process.exit(1);
    }

    console.log(`\n[shannon] 📧 Sending guidance & review request email to ${email}...`);
    const { subject, html } = postPurchaseEmailReview(firstName, email);

    try {
        const result = await resend.emails.send({
            from: `Adams X <${SENDER}>`,
            to: email,
            subject,
            html,
            reply_to: REPLY_TO,
            tags: [{ name: 'sequence', value: 'post-purchase-review' }]
        });

        if (result.error) {
            throw new Error(result.error.message || 'Resend API error');
        }

        console.log(`[shannon] ✅ Email sent successfully!`);
        console.log(`  Subject: "${subject}"`);
        console.log(`  To: ${email}`);
        console.log(`  Resend ID: ${result.data?.id || 'N/A'}`);
    } catch (err) {
        console.error(`[shannon] ❌ Failed to send email:`, err.message);
        process.exit(1);
    }

    console.log('\n🎉 Done! Shannon has been marked as paid and received the guidance & review email.');
}

main().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
