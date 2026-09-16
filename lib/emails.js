// ============================================================
// ALL EMAIL TEMPLATES — Adams X Project
// Used by: server.js (subscribe/waitlist) and cron jobs (drip/blast/digest)
// ============================================================

const BRAND_NAME = 'ADAMS X PROJECT';
const SITE_URL   = 'https://adamsxproject.com.ng';

// ── PAID EBOOK CONFIG ────────────────────────────────────────
// TODO: When "Comeback: Unrecognizable" is ready, set this URL.
// Options:
//   Self-hosted:  'https://adamsxproject.com.ng/ebooks/comeback-unrecognizable.pdf'
//   Whop:         'https://whop.com/comeback-unrecognizable/' (recommended for paid)
// Leave as null until the product is live — emails will skip CTA gracefully.
const PAID_EBOOK_URL = null; // <-- PLUG YOUR URL IN HERE WHEN READY


function emailWrapper(kicker, bodyHtml, email) {
    const unsubUrl = email
        ? `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`
        : `${SITE_URL}/unsubscribe`;

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="x-apple-disable-message-reformatting">
<title>Adams X Project</title>
<style>
body{margin:0;padding:0}
table{mso-table-lspace:0;mso-table-rspace:0}
p,span,h1,h2,h3,h4,h5,h6{margin:0;padding:0}
p{line-height:inherit}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}
#MessageViewBody a{color:inherit;text-decoration:none}
img+div{display:none}
@media (max-width:599px){.ecw{width:100%!important;min-width:0!important}}
</style>
<!--[if mso]>
<div>
  <noscript>
    <xml>
      <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
        <w:DontUseAdvancedTypographyReadingMail/>
      </w:WordDocument>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
</div>
<![endif]-->
</head>
<body style="width:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;background-color:#f0f1f5;margin:0;padding:0;font-family:Arial, Helvetica, sans-serif;">
<table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f0f1f5" style="background-color:#f0f1f5">
<tbody><tr><td style="background-color:#f0f1f5;padding:24px 12px 48px;">
<!--[if mso]>
<center>
<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
<tbody><tr><td>
<![endif]-->
<table align="center" width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" class="ecw" style="max-width:600px;min-height:600px;margin:0 auto;background-color:#060710;width:600px;min-width:600px;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.7);">
<tbody>
  <!-- Top Branding Header Bar -->
  <tr>
    <td style="vertical-align:top;padding:22px 28px 18px;border-bottom:1px solid rgba(255,255,255,0.08);background-color:#060710;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td align="left" style="vertical-align:middle;">
            <a href="${SITE_URL}" target="_blank" style="text-decoration:none;display:inline-block;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:8px;">
                    <img src="${SITE_URL}/favicon-32x32.png" width="20" height="20" alt="Logo" style="display:block;border-radius:4px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:800;letter-spacing:0.14em;color:#ffffff;text-transform:uppercase;">// ADAMS X PROJECT</span>
                  </td>
                </tr>
              </table>
            </a>
          </td>
          <td align="right" style="vertical-align:middle;">
            <span style="background:#131838;border:1px solid #282e5e;color:#bdc3ff;font-family:Arial,Helvetica,sans-serif;font-size:9.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:4px 12px;border-radius:100px;display:inline-block;">${kicker}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Main Content Body -->
  <tr>
    <td style="vertical-align:top;padding:28px 28px 20px;background-color:#060710;color:#CBD5E1;font-size:15px;line-height:1.72;font-family:Arial, Helvetica, sans-serif;">
${bodyHtml}
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="vertical-align:top">
      <table border="0" cellpadding="0" cellspacing="0" align="center" style="display:table;border-spacing:0px;border-collapse:separate;width:100%;max-width:100%;table-layout:fixed;margin:0 auto;background-color:#000000;background:linear-gradient(180deg, #060710 0%, #000000 35%, #0a238a 80%, #bfccfc 100%);">
        <tbody><tr>
          <td style="text-align:center;padding:50px 24px 34px">
            <table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;max-width:600px;table-layout:fixed;margin:0 auto">
              <tbody><tr>
                <td width="100.00%" style="width:100.00%;box-sizing:border-box;vertical-align:middle;text-align:center;">
                  <p style="margin:0 0 14px;line-height:1.4;">
                    <a href="${SITE_URL}" target="_blank" rel="noopener" style="color:#ffffff;font-size:14.5px;text-decoration:underline;letter-spacing:-0.01em;font-family:Arial,Helvetica,sans-serif;">View email in browser</a>
                  </p>
                  <p style="margin:0 0 16px;line-height:1.4;font-family:Arial,Helvetica,sans-serif;font-size:13.5px;color:#CBD5E1;">
                    <a href="${unsubUrl}" target="_blank" rel="noopener" style="color:#bdc3ff;text-decoration:underline;">Update your preferences</a> or <a href="${unsubUrl}" target="_blank" rel="noopener" style="color:#bdc3ff;text-decoration:underline;">unsubscribe</a>.
                  </p>
                  <div style="height:1px;width:120px;background:rgba(255,255,255,0.12);margin:16px auto;"></div>
                  <p style="margin:0 0 6px;line-height:1.4;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94A3B8;letter-spacing:-0.01em;">
                    Adams X Project &middot; Comeback: Unrecognizable Protocol &middot; Lagos, NG
                  </p>
                  <p style="margin:0;line-height:1.4;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#64748B;letter-spacing:-0.01em;">
                    &copy; 2026 Adams X Project. All rights reserved.
                  </p>
                </td>
              </tr></tbody>
            </table>
          </td>
        </tr></tbody>
      </table>
    </td>
  </tr>
</tbody>
</table>
<!--[if mso]>
</td></tr></tbody></table>
</center>
<![endif]-->
</td></tr></tbody>
</table>
</body>
</html>`;
}

// Helper — Bento Box (dark indigo styled list card)
function goldBox(title, items) {
    const listItems = items.map(i =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(82,97,179,0.15);font-size:14px;line-height:1.65;color:#E2E8F0;font-family:Arial,Helvetica,sans-serif;">${i}</td></tr>`
    ).join('');
    return `      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0d122b;border:1px solid rgba(82,97,179,0.35);border-radius:10px;margin:20px 0;overflow:hidden;">
        <tr>
          <td style="padding:20px 22px;">
            <p style="margin:0 0 14px;font-size:12px;font-weight:800;letter-spacing:0.14em;color:#bdc3ff;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">${title}</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              ${listItems}
            </table>
          </td>
        </tr>
      </table>\n`;
}

// Helper — Dual-Engine Pill CTA Button (VML Outlook + CSS gradient)
// Supports both ctaButton(label, url) and ctaButton(url, label)
function ctaButton(arg1, arg2, isOutline = false) {
    let url, label;
    if (arg1 && arg1.startsWith('http')) {
        url = arg1;
        label = arg2 || 'Get Access';
    } else {
        label = arg1 || 'Get Access';
        url = arg2 || '#';
    }

    if (isOutline) {
        return `      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td align="center" style="background:#131838;border:2px solid #5261b3;border-radius:25px;padding:13px 36px;">
                  <a href="${url}" target="_blank" rel="noopener" style="color:#bdc3ff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.03em;text-decoration:none;display:inline-block;">${label}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>\n`;
    }

    return `      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
        <tr>
          <td align="center">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="66%" strokecolor="#5261b3" fillcolor="#282e5e">
              <w:anchorlock/>
              <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">${label}</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td align="center" style="background:linear-gradient(90deg, #282e5e, #5261b3);border-radius:25px;padding:13px 36px;">
                  <a href="${url}" target="_blank" rel="noopener" style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.03em;text-decoration:none;display:inline-block;">${label}</a>
                </td>
              </tr>
            </table>
            <!--<![endif]-->
          </td>
        </tr>
      </table>\n`;
}

function p(text) {
    return `      <p style="margin:0 0 16px;font-size:15px;line-height:1.72;color:#CBD5E1;font-family:Arial,Helvetica,sans-serif;letter-spacing:-0.01em;">${text}</p>\n`;
}

// ── DAY 0: Welcome + Starter Kit ────────────────────────────
function day0(firstName) {
    return {
        subject: '🎯 Your 7-Day Monk Mode Starter Kit',
        html: emailWrapper('Monk Mode Protocol — Day 0', `
            ${p(`Welcome to the cohort, <strong>${firstName}</strong>.`)}
            ${p(`You have taken the first step. Monk Mode is a period of deliberate isolation, deep work, and physical sovereignty — the framework I use as a developer to eliminate noise, build digital products, and accelerate life goals.`)}
            ${goldBox('Your Starter Kit Includes:', [
                '<strong>The Cognitive Audit Sheet</strong> — locate and patch your attention leaks.',
                '<strong>4-Hour Time-Blocking Template</strong> — developer-optimised calendar layouts.',
                '<strong>Local Blocker Script</strong> — restrict distracting sites at the host level.',
                '<strong>Monk Mode Weekly Log</strong> — minimalist daily habit tracker.',
            ])}
            ${ctaButton('Download Your Starter Kit', 'https://www.adamsxproject.com.ng/monk-mode-starter-kit.pdf')}
            ${p(`Over the next 7 days you will receive one focused email per day walking you through each phase of the protocol. Follow it exactly. — <em>Adams</em>`)}
        `)
    };
}

// ── DAY 1 ────────────────────────────────────────────────────
function day1(firstName) {
    return {
        subject: 'Day 1 — The Cognitive Audit',
        html: emailWrapper('Monk Mode Protocol — Day 1', `
            ${p(`Hey <strong>${firstName}</strong> — Day 1.`)}
            ${p(`Before you can protect your focus, you need to know where it's bleeding out.`)}
            ${goldBox('Today\'s Protocol: The Cognitive Audit', [
                'Open your phone screen time report. Write down the top 3 apps.',
                'List every notification that fired in the last 24 hours.',
                'Identify the one habit that kills your flow most — social, news, or chat.',
            ])}
            ${p(`Most people are shocked when they see the numbers. The average developer loses 3.5 hours per day to reactive browsing.`)}
            ${p(`Write your audit results in your Monk Mode Weekly Log. That's all for today. — <em>Adams</em>`)}
        `)
    };
}

// ── DAY 2 ────────────────────────────────────────────────────
function day2(firstName) {
    return {
        subject: 'Day 2 — Your Environment IS the Protocol',
        html: emailWrapper('Monk Mode Protocol — Day 2', `
            ${p(`<strong>${firstName}</strong> — your environment is not separate from your discipline. It <em>is</em> your discipline.`)}
            ${p(`If your phone is on your desk, your brain is never fully in your code. If your desk is messy, your thinking is messy.`)}
            ${goldBox('Today\'s Protocol: Build the Environment', [
                'Phone goes in a drawer or another room during work blocks.',
                'Use the Local Blocker Script from your kit to block your top 3 distractions.',
                'Clear your desk to a blank surface — only what you need for the next session.',
                'Set a single browser homepage: a blank page or your current project\'s repo.',
            ])}
            ${p(`Environment design is not optional. Your brain takes cues from its surroundings. Make the surroundings demand focus. — <em>Adams</em>`)}
        `)
    };
}

// ── DAY 3 ────────────────────────────────────────────────────
function day3(firstName) {
    return {
        subject: 'Day 3 — The 4-Hour Deep Work Block',
        html: emailWrapper('Monk Mode Protocol — Day 3', `
            ${p(`<strong>${firstName}</strong> — today you implement the most powerful productivity structure for developers: the 4-hour deep work block.`)}
            ${p(`Not 4 hours of trying to work. 4 hours of <em>zero interruptions, zero switches</em>.`)}
            ${goldBox('Today\'s Protocol: Block Your Calendar', [
                'Open your 4-Hour Time-Blocking Template from the kit.',
                'Pick your best 4-hour window (most people: 6AM–10AM or 9PM–1AM).',
                'Block it in your calendar. Label it DEEP WORK — DO NOT MOVE.',
                'During that block: one task, one browser tab, phone in drawer.',
            ])}
            ${p(`You don't need more hours. You need undivided hours. — <em>Adams</em>`)}
        `)
    };
}

// ── DAY 4 ────────────────────────────────────────────────────
function day4(firstName) {
    return {
        subject: 'Day 4 — Input Fasting',
        html: emailWrapper('Monk Mode Protocol — Day 4', `
            ${p(`<strong>${firstName}</strong> — today we cut the feed.`)}
            ${p(`Information is addictive. Every time you check Twitter, Reddit, or the news, your brain gets a micro-dose of stimulation that makes real thinking feel boring by comparison.`)}
            ${goldBox('Today\'s Protocol: 24-Hour Input Fast', [
                'No social media until after your deep work block.',
                'No news in the morning — news is a highlight reel of crisis, not reality.',
                'No podcasts during work hours — save audio for walks and gym.',
                'Read one chapter of a book instead. Build, don\'t consume.',
            ])}
            ${p(`Creators who consume less, build more. It is not complicated. — <em>Adams</em>`)}
        `)
    };
}

// ── DAY 5 ────────────────────────────────────────────────────
function day5(firstName) {
    return {
        subject: 'Day 5 — The Output Measurement',
        html: emailWrapper('Monk Mode Protocol — Day 5', `
            ${p(`<strong>${firstName}</strong> — what gets measured gets shipped.`)}
            ${p(`Most developers stay busy but build nothing. The difference between a busy developer and a productive one is output tracking.`)}
            ${goldBox('Today\'s Protocol: Count What You Ship', [
                'Open your Monk Mode Weekly Log.',
                'Write down exactly what you shipped this week so far (commits, features, words, pages).',
                'If the list is short — that\'s data, not failure. Now you know what to fix.',
                'Set a single output goal for tomorrow\'s deep work block. Write it down tonight.',
            ])}
            ${p(`Clarity on output is the fastest path to more of it. — <em>Adams</em>`)}
        `)
    };
}

// ── DAY 6 ────────────────────────────────────────────────────
function day6(firstName) {
    return {
        subject: 'Day 6 — Physical Sovereignty',
        html: emailWrapper('Monk Mode Protocol — Day 6', `
            ${p(`<strong>${firstName}</strong> — the body is not separate from the work. It is the engine the work runs on.`)}
            ${p(`Sleep-deprived developers write 50% more bugs. Sedentary developers hit walls twice as fast. Physical discipline directly extends your cognitive bandwidth.`)}
            ${goldBox('Today\'s Protocol: Claim Your Physical Stack', [
                'Sleep: 7–8 hours minimum. Non-negotiable. This is when your brain consolidates code.',
                'Training: 30–45 minutes of resistance or cardio — 4× per week minimum.',
                'Cold: 60-second cold shower every morning. Builds mental hardness cheaply.',
                'No alcohol during Monk Mode. It destroys deep sleep architecture.',
            ])}
            ${p(`Your physical stack is your unfair advantage. Most of your competition skips it. — <em>Adams</em>`)}
        `)
    };
}

// ── DAY 7: The Pitch ─────────────────────────────────────────
function day7(firstName) {
    return {
        subject: '🏁 Day 7 — You Finished. Here\'s What\'s Next.',
        html: emailWrapper('Monk Mode Protocol — Day 7 Complete', `
            ${p(`<strong>${firstName}</strong> — you made it through all 7 days.`)}
            ${p(`That puts you in a small percentage of people who don't just download things — they actually show up.`)}
            ${p(`The Starter Kit was the foundation. But a foundation is not a building.`)}
            <div style="background:#0d122b;border:1px solid rgba(82,97,179,0.35);border-radius:12px;padding:28px 24px;margin:24px 0;text-align:center;">
                <h2 style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;margin:0 0 6px;">Comeback: Unrecognizable</h2>
                <p style="color:#bdc3ff;font-size:12px;text-transform:uppercase;letter-spacing:0.14em;font-weight:700;margin:0 0 14px;">7 Rules to Change Your Life</p>
                <p style="color:#CBD5E1;font-size:14.5px;line-height:1.7;margin:0 0 20px;">The full 90-day protocol. The exact step-by-step system to build a $10k/month income from zero. No guesswork. No fluff. Just the system.</p>
                <p style="font-family:Arial,Helvetica,sans-serif;margin:0 0 20px;line-height:1.2;text-align:center;">
                    <span style="font-family:Arial,sans-serif;font-size:16px;color:#7b8296;text-decoration:line-through;margin-right:8px;vertical-align:middle;">$67</span>
                    <span style="font-family:Arial,sans-serif;font-size:14px;color:#7b8296;margin-right:8px;vertical-align:middle;">&rarr;</span>
                    <span style="font-family:Arial,sans-serif;font-size:26px;font-weight:700;color:#bdc3ff;vertical-align:middle;">$17</span>
                    <span style="display:inline-block;background:#131838;border:1px solid #282e5e;color:#bdc3ff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:100px;margin-left:8px;vertical-align:middle;">Launch Offer</span>
                </p>
                ${ctaButton("I'm Ready — Get Access ($17 Launch Offer)", "https://adamsxproject.com.ng/comeback")}
            </div>
            ${p(`This is the system I am using right now in real-time. Every rule has been tested. Every result has been documented. If you are serious about the next 90 days, this is the move. — <em>Adams</em>`)}
        `)
    };
}

// ── WAITLIST CONFIRMATION ─────────────────────────────────────
function waitlistConfirmation(firstName) {
    return {
        subject: "You're on the list — Comeback: Unrecognizable",
        html: emailWrapper('Comeback: Unrecognizable', `
            ${p(`Hey <strong>${firstName}</strong>, you're early — and that means something.`)}
            ${p(`I'm putting the final pieces of the system together. When it drops, you'll be the first to know — and you'll get it at the launch price.`)}
            ${p(`Stay focused until then. — <em>Adams</em>`)}
        `)
    };
}

// ── WAITLIST LAUNCH BLAST ─────────────────────────────────────
function waitlistBlast(firstName) {
    return {
        subject: "🚀 It's Live — Comeback: Unrecognizable is Ready",
        html: emailWrapper('Comeback: Unrecognizable — Now Live', `
            ${p(`<strong>${firstName}</strong> — you signed up for this moment.`)}
            ${p(`Comeback: Unrecognizable is now live. This is the full 90-day protocol I promised you — the exact rules, tools, and sequences to go from zero to $10k/month.`)}
            <div style="background:#0d122b;border:1px solid rgba(82,97,179,0.35);border-radius:12px;padding:28px 24px;margin:24px 0;text-align:center;">
                <h2 style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;margin:0 0 6px;">Comeback: Unrecognizable</h2>
                <p style="color:#CBD5E1;font-size:14.5px;line-height:1.7;margin:0 0 16px;">90-day system. 7 rules. $10k/month from zero.</p>
                <p style="font-family:Arial,Helvetica,sans-serif;margin:0 0 20px;line-height:1.2;text-align:center;">
                    <span style="font-family:Arial,sans-serif;font-size:16px;color:#7b8296;text-decoration:line-through;margin-right:8px;vertical-align:middle;">$67</span>
                    <span style="font-family:Arial,sans-serif;font-size:14px;color:#7b8296;margin-right:8px;vertical-align:middle;">&rarr;</span>
                    <span style="font-family:Arial,sans-serif;font-size:26px;font-weight:700;color:#bdc3ff;vertical-align:middle;">$17</span>
                    <span style="display:inline-block;background:#131838;border:1px solid #282e5e;color:#bdc3ff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:100px;margin-left:8px;vertical-align:middle;">Launch Offer</span>
                </p>
                ${ctaButton("Get Access Now — $17 Launch Offer", "https://adamsxproject.com.ng/comeback")}
            </div>
            ${p(`This price will not last. Go now. — <em>Adams</em>`)}
        `)
    };
}

// ── DAILY DIGEST (to Adams X) ─────────────────────────────────
function dailyDigest(newLeads, newWaitlist, totalLeads, totalWaitlist) {
    const leadRows = newLeads.length
        ? newLeads.map(l => `<tr><td style="padding:10px 12px;border-bottom:1px solid rgba(82,97,179,0.15);color:#CBD5E1;">${l.first_name}</td><td style="padding:10px 12px;border-bottom:1px solid rgba(82,97,179,0.15);color:#CBD5E1;">${l.email}</td><td style="padding:10px 12px;border-bottom:1px solid rgba(82,97,179,0.15);color:#7b8296;">${new Date(l.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</td></tr>`).join('')
        : `<tr><td colspan="3" style="padding:12px;color:#7b8296;text-align:center;">No new leads yesterday</td></tr>`;

    const waitRows = newWaitlist.length
        ? newWaitlist.map(w => `<tr><td style="padding:10px 12px;border-bottom:1px solid rgba(82,97,179,0.15);color:#CBD5E1;">${w.first_name}</td><td style="padding:10px 12px;border-bottom:1px solid rgba(82,97,179,0.15);color:#CBD5E1;">${w.email}</td><td style="padding:10px 12px;border-bottom:1px solid rgba(82,97,179,0.15);color:#7b8296;">${new Date(w.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</td></tr>`).join('')
        : `<tr><td colspan="3" style="padding:12px;color:#7b8296;text-align:center;">No new waitlist signups yesterday</td></tr>`;

    return {
        subject: `📊 Daily Report — ${newLeads.length} leads, ${newWaitlist.length} waitlist (${new Date().toLocaleDateString('en-GB')})`,
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#050505;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:620px;margin:0 auto;background-color:#060710;padding:32px 24px;">
    <div style="text-align:center;border-bottom:1px solid rgba(82,97,179,0.3);padding-bottom:20px;margin-bottom:28px;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:16px;letter-spacing:0.2em;color:#bdc3ff;font-weight:700;">ADAMS X PROJECT</span>
        <br><span style="font-size:11px;color:#7b8296;text-transform:uppercase;letter-spacing:0.15em;">Daily Report &mdash; ${new Date().toDateString()}</span>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
            <td width="25%" style="padding:4px;"><div style="background:#0d122b;border:1px solid rgba(82,97,179,0.3);border-radius:8px;padding:16px;text-align:center;"><p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7b8296;margin:0 0 6px;">New Leads</p><p style="font-size:28px;font-weight:700;color:#bdc3ff;margin:0;">${newLeads.length}</p></div></td>
            <td width="25%" style="padding:4px;"><div style="background:#0d122b;border:1px solid rgba(82,97,179,0.3);border-radius:8px;padding:16px;text-align:center;"><p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7b8296;margin:0 0 6px;">New Waitlist</p><p style="font-size:28px;font-weight:700;color:#bdc3ff;margin:0;">${newWaitlist.length}</p></div></td>
            <td width="25%" style="padding:4px;"><div style="background:#0d122b;border:1px solid rgba(82,97,179,0.3);border-radius:8px;padding:16px;text-align:center;"><p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7b8296;margin:0 0 6px;">Total Leads</p><p style="font-size:28px;font-weight:700;color:#e6e8f2;margin:0;">${totalLeads}</p></div></td>
            <td width="25%" style="padding:4px;"><div style="background:#0d122b;border:1px solid rgba(82,97,179,0.3);border-radius:8px;padding:16px;text-align:center;"><p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7b8296;margin:0 0 6px;">Total Waitlist</p><p style="font-size:28px;font-weight:700;color:#e6e8f2;margin:0;">${totalWaitlist}</p></div></td>
        </tr>
    </table>
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#bdc3ff;font-weight:700;margin:0 0 12px;">New Starter Kit Leads</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <thead><tr style="background:#0d122b;"><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#7b8296;text-transform:uppercase;letter-spacing:0.08em;">Name</th><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#7b8296;text-transform:uppercase;letter-spacing:0.08em;">Email</th><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#7b8296;text-transform:uppercase;letter-spacing:0.08em;">Time</th></tr></thead>
        <tbody>${leadRows}</tbody>
    </table>
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#bdc3ff;font-weight:700;margin:0 0 12px;">New Waitlist Signups</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <thead><tr style="background:#0d122b;"><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#7b8296;text-transform:uppercase;letter-spacing:0.08em;">Name</th><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#7b8296;text-transform:uppercase;letter-spacing:0.08em;">Email</th><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#7b8296;text-transform:uppercase;letter-spacing:0.08em;">Time</th></tr></thead>
        <tbody>${waitRows}</tbody>
    </table>
    <p style="font-size:11px;color:#7b8296;text-align:center;margin:0;">Adams X Project Automated Report &copy; 2026</p>
</div>
</body></html>`
    };
}

// ── PAID EBOOK ACCESS (Comeback: Unrecognizable) ─────────────
// Sent to customers AFTER they purchase the paid ebook.
// Triggered by: a future /api/paid-access endpoint or Whop webhook.
// TODO: Activate when the ebook is live — set PAID_EBOOK_URL above.
function paidEbookAccess(firstName) {
    const downloadUrl = PAID_EBOOK_URL || '#';
    return {
        subject: '🏆 You\'re In — Comeback: Unrecognizable Access Confirmed',
        html: emailWrapper('Comeback: Unrecognizable — Access Granted', `
            ${p(`<strong>${firstName}</strong> — your access is confirmed.`)}
            ${p(`You just made the move most people only think about. Comeback: Unrecognizable is the full 90-day system — 7 rules, real sequences, zero fluff.`)}
            ${goldBox('What You Now Have Access To:', [
                '<strong>The 7 Core Rules</strong> — the exact framework Adams used to build income from zero.',
                '<strong>90-Day Protocol</strong> — step-by-step daily actions broken into phases.',
                '<strong>The Builder\'s Stack</strong> — tools, systems, and workflows for shipping fast.',
                '<strong>Monk Mode Integration</strong> — how to combine focus protocols with income building.',
            ])}
            ${
                PAID_EBOOK_URL
                    ? ctaButton('Download Comeback: Unrecognizable', downloadUrl)
                    : `<p style="text-align:center;font-size:13px;color:#9e9b95;font-style:italic;">Your download link is being prepared. You will receive a follow-up email shortly.</p>`
            }
            ${p(`This is the work. Show up every day. — <em>Adams</em>`)}
        `)
    };
}

module.exports = { day0, day1, day2, day3, day4, day5, day6, day7, waitlistConfirmation, waitlistBlast, dailyDigest, paidEbookAccess };

