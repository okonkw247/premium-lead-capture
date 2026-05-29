// ============================================================
// EMAIL TEMPLATES — Adams X Project
// Complete 7-Day Monk Mode Drip Sequence + Waitlist + Digest
//
// Brand Colors:
//   Background: #0A0A0A
//   Gold Accent: #C9A84C
//   Body Text:   #E8E8E8
//   Muted Text:  #888888
//
// Used by: server.js (subscribe/waitlist) and cron jobs (drip/blast/digest)
// ============================================================

const BRAND_NAME = 'ADAMS X PROJECT';
const BRAND_EMAIL = 'adams@adamsxproject.com.ng';
const WAITLIST_URL = 'https://adamsxproject.com.ng/waitlist';

// ── SHARED LAYOUT ───────────────────────────────────────────
function emailLayout({ dayLabel, headline, bodyHtml, footerExtra }) {
    const dayBadge = dayLabel
        ? `<div style="text-align:center;margin-bottom:28px;">
               <span style="display:inline-block;background:#1A1A1A;color:#C9A84C;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:6px 18px;border:1px solid #2A2A2A;border-radius:20px;">${dayLabel}</span>
           </div>`
        : '';

    const headlineBlock = headline
        ? `<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#FFFFFF;margin:0 0 28px;line-height:1.35;text-align:center;">${headline}</h1>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${BRAND_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background-color:#0A0A0A;">

        <!-- HEADER -->
        <div style="text-align:center;padding:40px 20px 32px;">
            <div style="display:inline-block;border-bottom:2px solid #C9A84C;padding-bottom:12px;">
                <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:400;letter-spacing:0.25em;color:#C9A84C;">${BRAND_NAME}</span>
            </div>
        </div>

        <!-- BODY -->
        <div style="padding:0 32px 40px;">
            ${dayBadge}
            ${headlineBlock}
            ${bodyHtml}
        </div>

        <!-- FOOTER -->
        <div style="border-top:1px solid #1A1A1A;padding:32px;text-align:center;">
            ${footerExtra || ''}
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#555555;margin:0 0 8px;line-height:1.5;">
                You&rsquo;re receiving this because you signed up at Adams X Project.
            </p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#555555;margin:0 0 8px;">
                <a href="mailto:${BRAND_EMAIL}" style="color:#C9A84C;text-decoration:none;">${BRAND_EMAIL}</a>
            </p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:0;">
                <!-- UNSUBSCRIBE_LINK_PLACEHOLDER: Replace with your unsubscribe URL -->
                <a href="#unsubscribe" style="color:#555555;text-decoration:underline;">Unsubscribe</a>
            </p>
        </div>

    </div>
</body>
</html>`;
}

// ── REUSABLE COMPONENTS ─────────────────────────────────────

function p(text) {
    return `<p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#E8E8E8;margin:0 0 20px;">${text}</p>`;
}

function pMuted(text) {
    return `<p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#888888;margin:0 0 20px;font-style:italic;">${text}</p>`;
}

function signOff() {
    return `
        <div style="margin-top:36px;padding-top:24px;border-top:1px solid #1A1A1A;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#C9A84C;margin:0 0 4px;">&mdash; Adams</p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#555555;margin:0;">Adams X Project</p>
        </div>`;
}

function signOffFull() {
    return `
        <div style="margin-top:36px;padding-top:24px;border-top:1px solid #1A1A1A;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#C9A84C;margin:0 0 4px;">&mdash; Adams</p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;margin:0 0 12px;">Adams X Project</p>
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#555555;margin:0;font-style:italic;">I am watching from afar and I am rooting for you.</p>
        </div>`;
}

function actionBox(title, text) {
    return `
        <div style="background:#111111;border-left:3px solid #C9A84C;padding:20px 24px;margin:24px 0 28px;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;">${title}</p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#E8E8E8;margin:0;">${text}</p>
        </div>`;
}

function ctaButton(label, url) {
    return `
        <div style="text-align:center;margin:32px 0;">
            <a href="${url}" style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;padding:16px 36px;text-decoration:none;border-radius:2px;">${label}</a>
        </div>`;
}

function divider() {
    return `<div style="height:1px;background:linear-gradient(to right,transparent,#2A2A2A,transparent);margin:28px 0;"></div>`;
}


// ============================================================
// DAY 0 — Welcome (sends immediately on signup)
// ============================================================
function day0(firstName) {
    return {
        subject: `Your 7-Day Monk Mode Kit is here, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 0 OF 7',
            headline: `Welcome to the Protocol, ${firstName}.`,
            bodyHtml: `
                ${p(`I&rsquo;m glad you&rsquo;re here. The fact that you signed up tells me something about you &mdash; you&rsquo;re not comfortable standing still. Good. Neither am I.`)}

                ${p(`<strong>Monk Mode</strong> is a deliberate period of isolation, deep focus, and radical self-discipline. It&rsquo;s not about grinding harder &mdash; it&rsquo;s about cutting everything that doesn&rsquo;t serve the person you&rsquo;re becoming. No distractions. No excuses. Just the work.`)}

                ${p(`Your 7-Day Monk Mode Starter Kit is ready. It contains everything you need to begin &mdash; the cognitive audit, time-blocking templates, distraction blockers, and the daily tracker.`)}

                <!-- EBOOK_DOWNLOAD_URL: Replace the URL below with your actual ebook/starter kit download link -->
                ${ctaButton('Download Your Starter Kit', 'https://eu.docworkspace.com/d/sbRaddRMS482BEiK_mr4pqf8xmv0lubk92v')}

                ${divider()}

                ${p(`Over the next <strong>7 days</strong>, I&rsquo;ll be sending you one email per day. Each one is short, focused, and actionable. No fluff. No motivation speeches. Just one thing to do each day that will shift the way you operate.`)}

                ${p(`Day 1 arrives tomorrow. Read it. Do it. Don&rsquo;t overthink it.`)}

                ${signOff()}
            `
        })
    };
}

// ============================================================
// DAY 1 — The Reset
// ============================================================
function day1(firstName) {
    return {
        subject: `Day 1: Before you do anything — read this, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 1 OF 7',
            headline: 'The Reset.',
            bodyHtml: `
                ${p(`${firstName}, let me be honest with you.`)}

                ${p(`Most people who say they want to change their life will fail before they even begin. Not because they&rsquo;re lazy. Not because they lack motivation. But because <strong>they never change the environment that made them this way</strong>.`)}

                ${p(`You can&rsquo;t build discipline in the same room where you scroll for 3 hours. You can&rsquo;t think clearly with 47 notifications fighting for your attention. You can&rsquo;t do deep work while your phone sits face-up on your desk.`)}

                ${p(`The problem was never motivation. It was always environment.`)}

                ${p(`Day 1 is not about doing more. It&rsquo;s about seeing clearly.`)}

                ${actionBox(`Today&rsquo;s Action`, `Write down the <strong>3 biggest things</strong> stealing your focus right now. Be specific. Is it your phone? A group chat? A toxic scroll habit? Netflix before bed? Name them. Write them down on paper &mdash; not in your notes app. On paper. That list is your enemy map. Tomorrow, we start eliminating.`)}

                ${pMuted(`You can&rsquo;t fight what you can&rsquo;t see.`)}

                ${signOff()}
            `
        })
    };
}

// ============================================================
// DAY 2 — Dopamine Detox
// ============================================================
function day2(firstName) {
    return {
        subject: `Day 2: Your brain is working against you, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 2 OF 7',
            headline: 'Dopamine Detox.',
            bodyHtml: `
                ${p(`${firstName}, here&rsquo;s something nobody tells you:`)}

                ${p(`Your brain has been reprogrammed &mdash; and not by you.`)}

                ${p(`Every time you pick up your phone and scroll, your brain releases a small hit of <strong>dopamine</strong> &mdash; the same chemical that fires when you eat junk food, gamble, or get a like on a post. Social media, short-form content, constant notifications &mdash; they&rsquo;ve all trained your brain to <strong>crave distraction</strong> over depth.`)}

                ${p(`That&rsquo;s why sitting with a blank page feels unbearable. That&rsquo;s why 10 minutes of silence feels like an hour. Your brain&rsquo;s reward system has been hijacked by things designed to keep you consuming &mdash; not creating.`)}

                ${p(`Today, you reset it.`)}

                ${actionBox(`Today&rsquo;s Action`, `Give yourself <strong>45 minutes of zero screen time</strong>. No phone. No laptop. No tablet. No music. No podcasts. Just silence &mdash; and your own thoughts. Sit with it. Walk with it. Let it be uncomfortable. That discomfort is your brain recalibrating. <strong>That is exactly the point.</strong>`)}

                ${pMuted(`The person who can sit in silence can do anything.`)}

                ${signOff()}
            `
        })
    };
}

// ============================================================
// DAY 3 — Deep Work
// ============================================================
function day3(firstName) {
    return {
        subject: `Day 3: This is where most people quit, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 3 OF 7',
            headline: 'Deep Work.',
            bodyHtml: `
                ${p(`${firstName}, I won&rsquo;t sugarcoat it.`)}

                ${p(`Day 3 is the hardest day.`)}

                ${p(`The excitement of starting something new has worn off. The &ldquo;new thing energy&rdquo; is gone. What&rsquo;s left is just you and the decision to keep going &mdash; or to quietly quit like most people do.`)}

                ${p(`This is the exact moment where <strong>discipline separates from motivation</strong>. Motivation got you here. Discipline is what keeps you moving when motivation disappears.`)}

                ${p(`Today is about <strong>deep work</strong> &mdash; the ability to focus on one single task with full, undivided attention for an extended period. No switching tabs. No checking messages. No &ldquo;just quickly looking at&rdquo; anything. One task. Full focus. 90 minutes.`)}

                ${actionBox(`Today&rsquo;s Action`, `Pick the <strong>most important task</strong> on your plate today &mdash; the one you&rsquo;ve been putting off. Set a timer for <strong>90 minutes</strong>. Turn off all notifications. Put your phone in another room. Work on that one thing and nothing else until the timer goes off. <strong>Do this before touching anything else today.</strong>`)}

                ${pMuted(`You don&rsquo;t need more time. You need undivided time.`)}

                ${signOff()}
            `
        })
    };
}

// ============================================================
// DAY 4 — Identity
// ============================================================
function day4(firstName) {
    return {
        subject: `Day 4: Who are you becoming, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 4 OF 7',
            headline: 'Identity.',
            bodyHtml: `
                ${p(`${firstName}, I want you to think about something today.`)}

                ${p(`Monk Mode is not just about building habits. Habits are surface level. What we&rsquo;re really doing here is <strong>rewriting your identity</strong>.`)}

                ${p(`The person reading this email right now is already different from the person who downloaded the Starter Kit four days ago. You&rsquo;ve audited your distractions. You&rsquo;ve sat in silence when your brain was screaming for stimulation. You&rsquo;ve done 90 minutes of deep work when everything in your environment tried to pull you away.`)}

                ${p(`That person &mdash; the person who did those things &mdash; is <strong>not the same person</strong> who started this. And the question isn&rsquo;t whether you can keep doing hard things. The question is: <em>who are you deciding to become?</em>`)}

                ${actionBox(`Today&rsquo;s Action`, `Write <strong>one sentence</strong> that describes who you are becoming. Not who you were. Not who you want to be someday. Who you are <em>becoming</em> &mdash; right now, through your actions.<br><br>Example: <strong>&ldquo;I am someone who finishes what I start.&rdquo;</strong><br><br>Write it down. Put it where you&rsquo;ll see it every morning.`)}

                ${pMuted(`Your habits follow your identity. Change the identity &mdash; the habits have no choice but to follow.`)}

                ${signOff()}
            `
        })
    };
}

// ============================================================
// DAY 5 — Circle and Solitude
// ============================================================
function day5(firstName) {
    return {
        subject: `Day 5: The people around you matter more than you think, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 5 OF 7',
            headline: 'Circle &amp; Solitude.',
            bodyHtml: `
                ${p(`${firstName}, we&rsquo;ve talked about your environment &mdash; your phone, your desk, your time.`)}

                ${p(`But there&rsquo;s one part of your environment that&rsquo;s harder to audit: <strong>the people in it</strong>.`)}

                ${p(`You don&rsquo;t need to cut people off. That&rsquo;s not what this is about. But you need to be brutally honest about who gives you energy and who takes it. Some people leave you feeling focused and sharp after a conversation. Others leave you drained, distracted, and doubting yourself.`)}

                ${p(`Monk Mode requires you to be intentional about your energy &mdash; not just your time. The two are not the same.`)}

                ${actionBox(`Today&rsquo;s Action`, `Identify <strong>one person</strong> in your life who drains your energy &mdash; someone who consistently leaves you feeling worse after an interaction.<br><br>Now identify <strong>one person</strong> who adds to it &mdash; someone who challenges you, supports your growth, or simply makes you feel sharper.<br><br><strong>Spend more time with the second one this week.</strong> You don&rsquo;t owe anyone an explanation. Just redirect your energy quietly.`)}

                ${pMuted(`You are the average of the energy you tolerate.`)}

                ${signOff()}
            `
        })
    };
}

// ============================================================
// DAY 6 — Momentum
// ============================================================
function day6(firstName) {
    return {
        subject: `Day 6: You are one day away, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 6 OF 7',
            headline: 'Momentum.',
            bodyHtml: `
                ${p(`${firstName} &mdash; do you realise what you&rsquo;ve done?`)}

                ${p(`Six days. <strong>Six days</strong> of showing up when nobody was watching. Nobody gave you a trophy. Nobody cheered. You just did it because you decided to.`)}

                ${p(`Most people who download free stuff never open it. Of the ones who open it, most never finish Day 1. Of the ones who start, almost none make it to Day 6.`)}

                ${p(`<strong>You are here.</strong>`)}

                ${p(`And here&rsquo;s what I want you to understand about momentum: the hardest part was starting. But now that you&rsquo;ve started, the hardest part is <em>stopping</em>. You&rsquo;ve built something over these past six days &mdash; a rhythm, a standard, a version of yourself that didn&rsquo;t exist a week ago. That version doesn&rsquo;t want to go backwards.`)}

                ${divider()}

                ${p(`Tomorrow is the final day. It&rsquo;s the most important email in this entire sequence. I need you to open it.`)}

                ${pMuted(`The compound effect is real. You&rsquo;re living proof of it right now.`)}

                ${signOff()}
            `
        })
    };
}

// ============================================================
// DAY 7 — The Pitch
// ============================================================
function day7(firstName) {
    return {
        subject: `Day 7: You just proved something, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 7 OF 7',
            headline: 'You Proved Something.',
            bodyHtml: `
                ${p(`${firstName}, congratulations.`)}

                ${p(`Seven days. You showed up every single one of them. You audited your distractions. You sat in uncomfortable silence. You did deep work when your brain wanted to switch tabs. You rewrote your identity. You assessed your circle. You built momentum that most people never even start.`)}

                ${p(`That takes something. And I see it.`)}

                ${divider()}

                ${p(`But I want to be straight with you: <strong>7 days is just the warm-up.</strong>`)}

                ${p(`The Starter Kit was the foundation. It proved you can change. But a foundation is not a building. The real transformation &mdash; the one that makes people look at you and ask <em>&ldquo;what happened to you?&rdquo;</em> &mdash; that takes a complete system.`)}

                <div style="background:#111111;border:1px solid #1A1A1A;padding:36px 28px;margin:28px 0;text-align:center;">
                    <p style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#C9A84C;margin:0 0 8px;font-weight:400;">Comeback: Unrecognizable</p>
                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 20px;">7 Rules to Change Your Life</p>
                    <div style="height:1px;background:linear-gradient(to right,transparent,#2A2A2A,transparent);margin:0 0 20px;"></div>
                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#E8E8E8;margin:0 0 20px;text-align:left;">The complete <strong>90-day protocol</strong>. The 7 rules that will make people ask what changed about you. The exact step-by-step system to build a <strong>$10k/month income from zero</strong>. No guesswork. No fluff. Just the system.</p>
                    <p style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#C9A84C;font-weight:400;margin:0 0 24px;">$17 at launch</p>
                    <a href="${WAITLIST_URL}" style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;padding:16px 36px;text-decoration:none;border-radius:2px;">Join the Waitlist &mdash; $17 at Launch</a>
                </div>

                ${p(`This is the system I am building and using in real-time. Every rule has been tested. Every result has been documented. If you are serious about the next 90 days, this is the move.`)}

                ${signOffFull()}
            `
        })
    };
}


// ============================================================
// WAITLIST CONFIRMATION (sends on waitlist signup)
// ============================================================
function waitlistConfirmation(firstName) {
    return {
        subject: `You're on the list — Comeback: Unrecognizable`,
        html: emailLayout({
            dayLabel: null,
            headline: `You&rsquo;re Early, ${firstName}.`,
            bodyHtml: `
                ${p(`I&rsquo;m putting the final pieces of the system together. When it drops, you&rsquo;ll be the first to know &mdash; and you&rsquo;ll get it at the launch price.`)}

                ${p(`The full 90-day protocol. The 7 rules. The exact system. Everything I&rsquo;ve learned building from zero &mdash; compressed into one blueprint.`)}

                ${p(`Stay focused until then. The work you put in now is the foundation the system builds on.`)}

                ${signOff()}
            `
        })
    };
}

// ============================================================
// WAITLIST LAUNCH BLAST (one-time launch email)
// ============================================================
function waitlistBlast(firstName) {
    return {
        subject: `It&rsquo;s Live — Comeback: Unrecognizable is Ready`,
        html: emailLayout({
            dayLabel: null,
            headline: `The Wait is Over, ${firstName}.`,
            bodyHtml: `
                ${p(`You signed up for this moment.`)}

                ${p(`<strong>Comeback: Unrecognizable</strong> is now live. This is the full 90-day protocol I promised you &mdash; the 7 rules, the daily system, the exact playbook to go from zero to $10k/month.`)}

                <div style="background:#111111;border:1px solid #1A1A1A;padding:36px 28px;margin:28px 0;text-align:center;">
                    <p style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#C9A84C;margin:0 0 8px;font-weight:400;">Comeback: Unrecognizable</p>
                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#E8E8E8;margin:0 0 16px;">90-day system. 7 rules. $10k/month from zero.</p>
                    <p style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#C9A84C;font-weight:400;margin:0 0 24px;">$17</p>
                    <a href="${WAITLIST_URL}" style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;padding:16px 36px;text-decoration:none;border-radius:2px;">Get Access Now &mdash; $17</a>
                </div>

                ${p(`This price will not last. If you&rsquo;re serious, now is the time.`)}

                ${signOffFull()}
            `
        })
    };
}

// ============================================================
// DAILY DIGEST (admin summary email to Adams X)
// ============================================================
function dailyDigest(newLeads, newWaitlist, totalLeads, totalWaitlist) {
    const leadRows = newLeads.length
        ? newLeads.map(l => `<tr><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#E8E8E8;font-size:13px;">${l.first_name}</td><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#E8E8E8;font-size:13px;">${l.email}</td><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#888888;font-size:13px;">${new Date(l.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</td></tr>`).join('')
        : `<tr><td colspan="3" style="padding:14px;color:#555555;text-align:center;font-size:13px;">No new leads yesterday</td></tr>`;

    const waitRows = newWaitlist.length
        ? newWaitlist.map(w => `<tr><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#E8E8E8;font-size:13px;">${w.first_name}</td><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#E8E8E8;font-size:13px;">${w.email}</td><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#888888;font-size:13px;">${new Date(w.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</td></tr>`).join('')
        : `<tr><td colspan="3" style="padding:14px;color:#555555;text-align:center;font-size:13px;">No new waitlist signups yesterday</td></tr>`;

    return {
        subject: `Daily Report: ${newLeads.length} leads, ${newWaitlist.length} waitlist (${new Date().toLocaleDateString('en-GB')})`,
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#050505;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:620px;margin:0 auto;background-color:#0A0A0A;padding:32px 24px;">

    <div style="text-align:center;border-bottom:1px solid #1A1A1A;padding-bottom:20px;margin-bottom:28px;">
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:16px;letter-spacing:0.2em;color:#C9A84C;">ADAMS X PROJECT</span>
        <br><span style="font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:0.15em;">Daily Report &mdash; ${new Date().toDateString()}</span>
    </div>

    <!-- Stats Grid -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
            <td width="25%" style="padding:4px;">
                <div style="background:#111111;border:1px solid #1A1A1A;padding:16px;text-align:center;">
                    <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#888888;margin:0 0 6px;">New Leads</p>
                    <p style="font-size:28px;font-weight:700;color:#C9A84C;margin:0;">${newLeads.length}</p>
                </div>
            </td>
            <td width="25%" style="padding:4px;">
                <div style="background:#111111;border:1px solid #1A1A1A;padding:16px;text-align:center;">
                    <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#888888;margin:0 0 6px;">New Waitlist</p>
                    <p style="font-size:28px;font-weight:700;color:#C9A84C;margin:0;">${newWaitlist.length}</p>
                </div>
            </td>
            <td width="25%" style="padding:4px;">
                <div style="background:#111111;border:1px solid #1A1A1A;padding:16px;text-align:center;">
                    <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#888888;margin:0 0 6px;">Total Leads</p>
                    <p style="font-size:28px;font-weight:700;color:#E8E8E8;margin:0;">${totalLeads}</p>
                </div>
            </td>
            <td width="25%" style="padding:4px;">
                <div style="background:#111111;border:1px solid #1A1A1A;padding:16px;text-align:center;">
                    <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#888888;margin:0 0 6px;">Total Waitlist</p>
                    <p style="font-size:28px;font-weight:700;color:#E8E8E8;margin:0;">${totalWaitlist}</p>
                </div>
            </td>
        </tr>
    </table>

    <!-- New Leads Table -->
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#C9A84C;font-weight:700;margin:0 0 12px;">New Starter Kit Leads</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <thead><tr style="background:#111111;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Name</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Email</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Time</th>
        </tr></thead>
        <tbody>${leadRows}</tbody>
    </table>

    <!-- Waitlist Table -->
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#C9A84C;font-weight:700;margin:0 0 12px;">New Waitlist Signups</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <thead><tr style="background:#111111;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Name</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Email</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Time</th>
        </tr></thead>
        <tbody>${waitRows}</tbody>
    </table>

    <p style="font-size:11px;color:#555555;text-align:center;margin:0;">Adams X Project Automated Report &copy; 2026</p>
</div>
</body>
</html>`
    };
}


module.exports = {
    day0, day1, day2, day3, day4, day5, day6, day7,
    waitlistConfirmation, waitlistBlast, dailyDigest
};
