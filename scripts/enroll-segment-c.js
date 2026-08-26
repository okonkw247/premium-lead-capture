// ============================================================
// SCRIPT: scripts/enroll-segment-c.js
//
// PURPOSE: Enroll unpurchased leads & waitlist into Segment C Urgency ($17 → $68)
//
// SAFETY FEATURES:
//   - Dry-run mode by default (shows full preview without DB writes)
//   - Strict exclusion list (Shannon, admin accounts, purchased_subscribers)
//   - Conflict check: Pauses Segment A (active=false) to prevent duplicate drips
//
// USAGE:
//   node scripts/enroll-segment-c.js --dry-run
//   node scripts/enroll-segment-c.js --execute
//   node scripts/enroll-segment-c.js --execute --send-day0
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Resend } = require('resend');
const { supabase } = require('../lib/supabase');
const { segCEmail1 } = require('../lib/email-templates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const SENDER = process.env.SENDER_EMAIL || 'adams@adamsxproject.com.ng';
const REPLY_TO = 'adams@adamsxproject.com.ng';

// 1. Explicit Named Leads
const NAMED_LEADS = [
    { first_name: 'Anya', email: 'anyaelashry2003@gmail.com' },
    { first_name: 'TYR', email: 'talha2007s@gmail.com' },
    { first_name: 'Madhu', email: 'shiwamvisuals@gmail.com' },
    { first_name: 'Adams', email: 'emeldaokonkwo2@gmail.com' },
    { first_name: 'Muiz', email: 'muizmakinde4@gmail.com' }
];

// 2. Strict Exclusions
const EXCLUDED_EMAILS = new Set([
    'shannonworks75@gmail.com', // Active paying customer
    'adamsproject91@gmail.com', // Admin / test account
]);

async function runEnrollment(isExecute = false, sendDay0 = false) {
    console.log('\n============================================================');
    console.log(`🚀 SEGMENT C ENROLLMENT: ${isExecute ? '⚡ LIVE EXECUTION' : '🔍 DRY-RUN PREVIEW'}`);
    console.log('============================================================\n');

    if (!supabase) {
        console.error('❌ Supabase not initialized. Check your environment variables.');
        process.exit(1);
    }

    // 1. Fetch all existing buyers from purchased_subscribers
    const { data: buyers, error: bErr } = await supabase
        .from('purchased_subscribers')
        .select('email');

    if (bErr) {
        console.error('❌ Error fetching purchased_subscribers:', bErr.message);
    }

    const allBuyerEmails = new Set([
        ...EXCLUDED_EMAILS,
        ...(buyers || []).map(b => b.email.toLowerCase().trim())
    ]);

    // 2. Fetch all leads in waitlist where purchased = false
    const { data: waitlistLeads, error: wErr } = await supabase
        .from('waitlist')
        .select('id, first_name, email, segment, sequence_day, active, purchased');

    if (wErr) {
        console.error('❌ Error fetching waitlist:', wErr.message);
    }

    // 3. Combine Candidates (Named Leads + Waitlist)
    const candidateMap = new Map();

    // Add named leads
    for (const lead of NAMED_LEADS) {
        const cleanEmail = lead.email.toLowerCase().trim();
        candidateMap.set(cleanEmail, {
            first_name: lead.first_name,
            email: cleanEmail,
            source: 'Explicit Named Lead'
        });
    }

    // Add waitlist leads where purchased is not true
    for (const w of (waitlistLeads || [])) {
        if (!w.email) continue;
        const cleanEmail = w.email.toLowerCase().trim();
        if (!w.purchased) {
            if (!candidateMap.has(cleanEmail)) {
                candidateMap.set(cleanEmail, {
                    first_name: w.first_name || 'Friend',
                    email: cleanEmail,
                    source: 'Waitlist Table',
                    waitlist_id: w.id,
                    is_seg_a_active: w.active && w.segment === 'A'
                });
            } else {
                // Merge active status from waitlist table
                const existing = candidateMap.get(cleanEmail);
                existing.waitlist_id = w.id;
                existing.is_seg_a_active = w.active && w.segment === 'A';
            }
        }
    }

    const toEnroll = [];
    const excludedList = [];
    const segAPauses = [];

    const now = new Date();
    const priceIncreaseDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    for (const [email, candidate] of candidateMap.entries()) {
        if (allBuyerEmails.has(email)) {
            excludedList.push({
                email,
                name: candidate.first_name,
                reason: email === 'shannonworks75@gmail.com'
                    ? 'Active Customer (Shannon)'
                    : email === 'adamsproject91@gmail.com'
                    ? 'Admin / Test Account'
                    : 'Found in purchased_subscribers'
            });
            continue;
        }

        if (candidate.is_seg_a_active) {
            segAPauses.push({
                email,
                name: candidate.first_name,
                waitlist_id: candidate.waitlist_id
            });
        }

        toEnroll.push({
            first_name: candidate.first_name,
            email: candidate.email,
            sequence_day: 0,
            enrolled_at: now.toISOString(),
            last_sent_at: null,
            purchased: false,
            active: true,
            price_increase_date: priceIncreaseDate,
            source: candidate.source
        });
    }

    // ── DISPLAY DRY-RUN REPORT ────────────────────────────────
    console.log(`📋 CANDIDATES ELIGIBLE FOR SEGMENT C (${toEnroll.length}):`);
    console.table(toEnroll.map((c, i) => ({
        '#': i + 1,
        'Name': c.first_name,
        'Email': c.email,
        'Source': c.source,
        'Price Increase Date': c.price_increase_date.split('T')[0]
    })));

    console.log(`\n🛡️ EXCLUDED CONTACTS (${excludedList.length}):`);
    console.table(excludedList);

    console.log(`\n⚠️ CONFLICT CHECKS — SEGMENT A NURTURE TO PAUSE (${segAPauses.length}):`);
    if (segAPauses.length > 0) {
        console.table(segAPauses);
    } else {
        console.log('  None active in Segment A.');
    }

    if (!isExecute) {
        console.log('\n🔒 DRY-RUN COMPLETE. No database records were modified and no emails were sent.');
        console.log('To execute this enrollment in Supabase, re-run with:');
        console.log('  node scripts/enroll-segment-c.js --execute\n');
        return;
    }

    // ── LIVE EXECUTION ────────────────────────────────────────
    console.log('\n⚡ PROCEEDING WITH DATABASE ENROLLMENT...');

    // 1. Pause active Segment A leads
    for (const p of segAPauses) {
        const { error } = await supabase
            .from('waitlist')
            .update({ active: false })
            .eq('email', p.email);

        if (error) {
            console.error(`❌ Failed to pause Segment A for ${p.email}:`, error.message);
        } else {
            console.log(`[CONFLICT PAUSE] ✅ Paused Segment A nurture for ${p.email}`);
        }
    }

    // 2. Upsert into segment_c_urgency
    let enrolledCount = 0;
    for (const lead of toEnroll) {
        const { error: insErr } = await supabase
            .from('segment_c_urgency')
            .upsert({
                first_name: lead.first_name,
                email: lead.email,
                sequence_day: 0,
                enrolled_at: lead.enrolled_at,
                last_sent_at: null,
                purchased: false,
                active: true,
                price_increase_date: lead.price_increase_date
            }, { onConflict: 'email' });

        if (insErr) {
            console.error(`❌ Error enrolling ${lead.email}:`, insErr.message);
        } else {
            console.log(`✅ Enrolled ${lead.first_name} <${lead.email}> into segment_c_urgency`);
            enrolledCount++;

            if (sendDay0) {
                try {
                    const { subject, html } = segCEmail1(lead.first_name, lead.email);
                    await resend.emails.send({
                        from: `Adams X <${SENDER}>`,
                        to: lead.email,
                        subject,
                        html,
                        reply_to: REPLY_TO,
                        tags: [
                            { name: 'sequence', value: 'segment-c-urgency' },
                            { name: 'day', value: '0' }
                        ]
                    });

                    await supabase
                        .from('segment_c_urgency')
                        .update({
                            sequence_day: 1,
                            last_sent_at: new Date().toISOString()
                        })
                        .eq('email', lead.email);

                    console.log(`   ✉️ Dispatched Email 1 (Day 0) to ${lead.email}`);
                } catch (e) {
                    console.error(`   ❌ Failed to send Email 1 to ${lead.email}:`, e.message);
                }
            }
        }
    }

    console.log(`\n🎉 EXECUTION COMPLETE: ${enrolledCount} leads enrolled successfully.`);
}

// Parse arguments
const args = process.argv.slice(2);
const isExecute = args.includes('--execute');
const sendDay0 = args.includes('--send-day0');

runEnrollment(isExecute, sendDay0);
