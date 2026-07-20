// ============================================================
// EMAIL TEMPLATES — Adams X Project
// ============================================================
//
// TWO-SEGMENT LAUNCH SYSTEM
//   Segment A: Waitlist subscribers (11 emails, 2-day cadence)
//   Segment B: Monk Mode free kit users not on waitlist
//              (3 unique emails, then merges into Segment A from email 4)
//
// POST-PURCHASE SEQUENCE: 3 emails triggered by Whop purchase
//
// LEGACY MONK MODE DRIP: Preserved at bottom for reference.
//
// Format: Plain-text style HTML.
//   - White background, Arial/Georgia, 15px body
//   - No logo, no header bar, no images
//   - Raw personal-email feel
//   - Standard footer + unsubscribe on every email
//
// From name:   Adams X
// Reply-to:    adams@adamsxproject.com.ng
// ============================================================

const BRAND_EMAIL    = 'adams@adamsxproject.com.ng';
const SITE_URL       = 'https://adamsxproject.com.ng';
const BRAND_NAME_OLD = 'ADAMS X PROJECT'; // used in legacy layout only

// ── WHOP product URL — set WHOP_PRODUCT_URL in .env before launch ──
function whopLink() {
    return process.env.WHOP_PRODUCT_URL || 'https://whop.com/adams-x/comeback-unrecognized/?a=adamsproject';
}

// ============================================================
// PLAIN-TEXT STYLE LAYOUT
// Used for all new Segment A, B and Post-Purchase emails.
// Looks like a real person's email — no branding chrome.
// ============================================================
function plainLayout({ body, email }) {
    const unsubUrl = email
        ? `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`
        : `${SITE_URL}/unsubscribe`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Adams X</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px 32px;">

    <!-- BODY -->
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:#1a1a1a;">
${body}
    </div>

    <!-- FOOTER -->
    <div style="margin-top:48px;padding-top:20px;border-top:1px solid #e5e5e5;">
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#999999;margin:0 0 6px;">
        Adams X Project &middot; Lagos, NG &middot; adamsxproject.com.ng
      </p>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#999999;margin:0;">
        <a href="${unsubUrl}" style="color:#999999;text-decoration:underline;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

// Helper — paragraph block
function ln(text) {
    return `      <p style="margin:0 0 18px;">${text}</p>\n`;
}

// Helper — sign-off line
function signOff(name = '— Adams X') {
    return `      <p style="margin:18px 0 0;">${name}</p>\n`;
}

// Helper — PS line
function ps(text) {
    return `      <p style="margin:16px 0 0;color:#555555;font-size:14px;">P.S. ${text}</p>\n`;
}

// Helper — link
function link(url, label) {
    return `<a href="${url}" style="color:#1a1a1a;text-decoration:underline;">${label || url}</a>`;
}


// ============================================================
// ═══════════════════════════════════════════════════════════
//  SEGMENT A — SALES SEQUENCE (product is live)
// ═══════════════════════════════════════════════════════════
// ============================================================

// ── SEGMENT A · EMAIL 1 ──────────────────────────────────────
// Subject: comeback: unrecognizable is open
// Send: Immediately (auto-trigger for new signups)
function segAEmail1(firstName, email) {
    const shopUrl = whopLink();
    const body =
        ln(`Hey ${firstName},`) +
        ln(`<strong>Comeback: Unrecognizable</strong> is live. You can grab it right now at the $17 launch price before it moves to $67.`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:14px 32px;text-decoration:none;border-radius:2px;">Get Access Now — $17</a></p>\n` +
        ln(`Over the next few days I'm going to show you exactly what's inside and who it's for. Not marketing language — straight talk.`) +
        ln(`If you have questions before you decide — just reply. I read everything.`) +
        signOff() +
        ps(`$17 is the launch price. It moves to $67. No countdown gimmicks — just the actual deadline.`);

    return {
        subject: `comeback: unrecognizable is open`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT A · EMAIL 2 ──────────────────────────────────────
// Subject: you're not lazy. you have a proof problem.
// Send: Day 2
function segAEmail2(firstName, email) {
    const shopUrl = whopLink();
    const body =
        ln(`Hey ${firstName},`) +
        ln(`I get DMs that sound like this: <em>"Adams, I need to help my parents. Can you help me earn money?"</em>`) +
        ln(`Every time, when I ask what they've tried — same list. YouTube videos. Looking for "the right skill." Jumping between methods. Tutorials on how to be productive while being unproductive.`) +
        ln(`These people don't have a discipline problem. <strong>They have a proof problem.</strong>`) +
        ln(`Every new video is a way to postpone the moment where they find out whether they'd actually follow through. It feels like effort — but it asks nothing of you. Nobody can watch you fail at watching a video.`) +
        ln(`Building is different. The 90-day protocol puts you in that seat — every single day.`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:14px 32px;text-decoration:none;border-radius:2px;">Join the Protocol — $17</a></p>\n` +
        signOff();

    return {
        subject: `you're not lazy. you have a proof problem.`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT A · EMAIL 3 ──────────────────────────────────────
// Subject: 18 months ago I was ambitious on paper
// Send: Day 4
function segAEmail3(firstName, email) {
    const shopUrl = whopLink();
    const body =
        ln(`Hey ${firstName},`) +
        ln(`18 months ago I was ambitious on paper. Inconsistent in action.`) +
        ln(`I wasn't looking for motivation — I'd had enough of that. I was looking for a <strong>system</strong>. Not a routine. A full operating system that built the person first, then the income.`) +
        ln(`I couldn't find one. Every program assumed I was already capable of following through. I wasn't that person yet.`) +
        ln(`So I built it myself. Tested it on my own life. Documented everything.`) +
        ln(`<strong>Comeback: Unrecognizable</strong> is that system. The exact protocol I built, used, and proved. 90 days. 7 rules. 4 phases. The income model. All of it — available right now at the $17 launch price.`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:14px 32px;text-decoration:none;border-radius:2px;">Get Access — $17</a></p>\n` +
        signOff() +
        ps(`Next email: what's actually inside. Plain English, no fluff.`);

    return {
        subject: `18 months ago I was ambitious on paper`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT A · EMAIL 4 ──────────────────────────────────────
// Subject: what you're actually getting (no fluff)
// Send: Day 6
function segAEmail4(firstName, email) {
    const shopUrl = whopLink();
    const body =
        ln(`Hey ${firstName},`) +
        ln(`Here's what's inside <strong>Comeback: Unrecognizable</strong>. Plain English.`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:14px 32px;text-decoration:none;border-radius:2px;">Get Access — $17</a></p>\n` +
        ln(`<strong>📋 Your Day-by-Day Rebuild Plan</strong> — 12 modules across 4 phases. You never wake up wondering what to do. Every day of the 90 tells you exactly what to focus on.`) +
        ln(`<strong>📵 Focus Firewall PDF</strong> — Every app, habit, and setting quietly draining your attention — and how to remove each one.`) +
        ln(`<strong>👥 The Group That Won't Let You Quit</strong> — Private Whop community. Real people running the same 90 days alongside you. They notice when you go quiet.`) +
        ln(`<strong>📊 Daily Scoreboard</strong> — Notion template tracking focus hours and habits in numbers. Every week, you either have the data or you don't.`) +
        ln(`<strong>⚡ 12 Weekly Challenges</strong> — One real challenge per week. Not a worksheet. An actual task with a real deadline.`) +
        ln(`That's what $17 gets you. Any questions — just reply.`) +
        signOff();

    return {
        subject: `what you're actually getting (no fluff)`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT A · EMAIL 5 ──────────────────────────────────────
// Subject: this is not a get-rich-quick scheme
// Send: Day 8
function segAEmail5(firstName, email) {
    const shopUrl = whopLink();
    const body =
        ln(`Hey ${firstName},`) +
        ln(`This program is not going to make you money in 7 days.`) +
        ln(`What it does: it fixes <strong>the actual reason</strong> most people never build anything. Not lack of ideas. Not the economy. The fact that they can't stay committed to one thing long enough for it to produce anything.`) +
        ln(`Once focus, discipline, and daily execution are locked in — Phase 4 introduces a lean Agency 3.0 model. No startup capital. No office. No team. You charge clients on Day 1, pay contractors on Day 30. The math works with 12 clients at $2k/month.`) +
        ln(`But you don't get to Phase 4 by skipping Phases 1, 2, and 3.`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:14px 32px;text-decoration:none;border-radius:2px;">Start the 90 Days — $17</a></p>\n` +
        signOff();

    return {
        subject: `this is not a get-rich-quick scheme`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT A · EMAIL 6 ──────────────────────────────────────
// Subject: the day 8 question
// Send: Day 10
function segAEmail6(firstName, email) {
    const shopUrl = whopLink();
    const body =
        ln(`Hey ${firstName},`) +
        ln(`The blueprint has a line I keep coming back to:`) +
        ln(`<em>"On day eight, you will not feel the way you feel right now. The clarity will be quieter. The routine will feel mechanical. That is the day that decides everything."</em>`) +
        ln(`Most programs help you get started. Almost none prepare you for day 8.`) +
        ln(`<strong>That's what the community inside Comeback is for.</strong> Not the wins — day 8. The exact moment when you're about to quit something that hasn't produced anything visible yet. Having people on day 8 at the same time — who keep going — changes everything.`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:14px 32px;text-decoration:none;border-radius:2px;">Join the Community — $17</a></p>\n` +
        signOff();

    return {
        subject: `the day 8 question`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT A · EMAIL 7 ──────────────────────────────────────
// Subject: the $17 window is closing
// Send: Day 12
function segAEmail7(firstName, email) {
    const shopUrl = whopLink();
    const body =
        ln(`Hey ${firstName},`) +
        ln(`The $17 launch price is closing soon. After that, the program moves to $67 permanently.`) +
        ln(`You've had my emails. You know what's inside. You know I'm not selling a shortcut.`) +
        ln(`$17 is a decision about whether you believe 90 days of structure — done properly — can change where you are. <strong>You have the money. The question is whether you believe it's worth committing to.</strong>`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:14px 32px;text-decoration:none;border-radius:2px;">Claim the $17 Price Now</a></p>\n` +
        ln(`If you have one question holding you back — reply right now. I'll answer personally.`) +
        signOff() +
        ps(`Price goes to $67 soon. No gimmick — just the actual deadline.`);

    return {
        subject: `the $17 window is closing`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT A · EMAIL 8 (LAUNCH DAY) ────────────────────────
// Subject: it's live — your $17 link is inside
// Send: Day 14 (Launch Day)
function segAEmail8(firstName, email) {
    const shopUrl = whopLink();
    const heroBanner = `<div style="margin:0 0 24px;"><img src="https://adamsxproject.com.ng/images/comeback-hero.png" alt="Comeback: Unrecognizable" width="100%" style="display:block;max-width:100%;border-radius:4px;" /></div>`;
    const body =
        heroBanner +
        ln(`Hey ${firstName},`) +
        ln(`<strong>Comeback: Unrecognizable is live.</strong> Your $17 launch price is ready.`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:16px 40px;text-decoration:none;border-radius:2px;">Get Instant Access — $17 →</a></p>\n` +
        ln(`I'm giving you 6 days at this price — not 48 hours. Because I know some of you need a couple of days to move money around, and I'm not going to punish you for that. After 6 days it moves to $67. Permanently.`) +
        ln(`What you're getting today:<br>
&nbsp;&nbsp;📋 <strong>12-Module Day-by-Day Rebuild Plan</strong> (4 phases)<br>
&nbsp;&nbsp;📵 <strong>Focus Firewall PDF</strong> (stop losing 4 hrs/day to your phone)<br>
&nbsp;&nbsp;👥 <strong>Private Community</strong> (people running the same 90 days)<br>
&nbsp;&nbsp;📊 <strong>Daily Scoreboard</strong> (Notion tracker — numbers don't lie)<br>
&nbsp;&nbsp;⚡ <strong>12 Weekly Challenges</strong> (real tasks, real deadlines)`) +
        ln(`Your 90 days starts the moment you join.`) +
        ln(`Hesitating about something? Reply right now. I'll answer personally before the price changes.`) +
        signOff();

    return {
        subject: `it's live — your $17 link is inside`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT A · EMAIL 9 ──────────────────────────────────────
// Subject: still here if you're still thinking
// Send: Launch Day 3 — SUPPRESS if purchased
function segAEmail9(firstName, email) {
    const shopUrl = whopLink();
    const body =
        ln(`Hey ${firstName},`) +
        ln(`You haven't joined yet. That's fine. Let me answer the questions I know are in your head:`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:14px 32px;text-decoration:none;border-radius:2px;">Get Access — $17 (3 Days Left)</a></p>\n` +
        ln(`<strong>"Is this worth $17?"</strong> — Yes. The community alone is worth more than $17/month. You're getting the full 90-day system.`) +
        ln(`<strong>"What if I fall off?"</strong> — The program is built for this. Module 9 is literally called <em>"What To Do When You Want To Quit."</em> The community exists for exactly that moment.`) +
        ln(`<strong>"I don't have $17 right now"</strong> — reply to this email. Let's talk.`) +
        signOff();

    return {
        subject: `still here if you're still thinking`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT A · EMAIL 10 ─────────────────────────────────────
// Subject: last 24 hours at $17
// Send: Launch Day 5 — SUPPRESS if purchased
function segAEmail10(firstName, email) {
    const shopUrl = whopLink();
    const body =
        ln(`Hey ${firstName},`) +
        ln(`<strong>Tomorrow the price moves to $67.</strong>`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:16px 40px;text-decoration:none;border-radius:2px;">Lock In $17 Before Midnight →</a></p>\n` +
        ln(`I've kept it at $17 for 6 days because I said I would. Tomorrow I move it and I won't bring it back down.`) +
        ln(`If you have one specific question that's been stopping you — reply right now. I'll answer personally before the price goes up.`) +
        signOff() +
        ps(`Midnight tonight. Not a countdown timer trick. The actual deadline.`);

    return {
        subject: `last 24 hours at $17`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT A · EMAIL 11 (FINAL) ─────────────────────────────
// Subject: tonight's the last night
// Send: Launch Day 6 (midnight deadline) — SUPPRESS if purchased
// ACTION REQUIRED AFTER SEND: Change Whop price to $67
function segAEmail11(firstName, email) {
    const shopUrl = whopLink();
    const body =
        ln(`Hey ${firstName},`) +
        ln(`Tonight at midnight the $17 price closes. <strong>This is the last email.</strong>`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:16px 40px;text-decoration:none;border-radius:2px;">Join Now Before Midnight — $17</a></p>\n` +
        ln(`If you've been reading every email and still haven't joined — ask yourself honestly: what are you waiting for? More information? You have all of it. The right time? There isn't one.`) +
        ln(`The system is built. The community is active. The 90 days is ready. <strong>After tonight — $67. No exceptions.</strong>`) +
        ln(`See you inside.`) +
        signOff();

    return {
        subject: `tonight's the last night`,
        html: plainLayout({ body, email })
    };
}


// ============================================================
// ═══════════════════════════════════════════════════════════
//  SEGMENT B — MONK MODE FREE KIT USERS (3 unique emails)
//  Emails 4–11 reuse Segment A templates (see drip.js)
// ═══════════════════════════════════════════════════════════
// ============================================================

// ── SEGMENT B · EMAIL 1 ──────────────────────────────────────
// Subject: you've got the starter kit. here's what comes next.
// Send: Immediately (blast + auto-trigger for new free kit signups)
function segBEmail1(firstName, email) {
    const body =
        ln(`Hey ${firstName},`) +
        ln(`You downloaded the Monk Mode Starter Kit a while back.`) +
        ln(`I hope you actually used it — and if you haven't yet, that's okay. That's kind of why I'm writing.`) +
        ln(`Most people who download it tell me the same thing: it makes sense, they feel the shift when they read it, and then life continues exactly the same way it was before.`) +
        ln(`That's not a failure. That's what happens when a starter kit meets a life that doesn't have a system behind it yet.`) +
        ln(`The starter kit is the warm-up. It was always designed to be the warm-up.`) +
        ln(`What I've been building — the thing I'm about to launch — is the full 90-day protocol. The complete operating system that the starter kit points toward.`) +
        ln(`I'm going to be emailing you every couple of days over the next few weeks to show you exactly what's inside it and why it's different from everything else you've seen.`) +
        ln(`If at any point you have questions, or you just want to talk about where you're at right now — reply to this. I actually read them.`) +
        signOff() +
        ps(`The launch price is $17. Waitlist only. More on that soon.`);

    return {
        subject: `you've got the starter kit. here's what comes next.`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT B · EMAIL 2 ──────────────────────────────────────
// Subject: the starter kit told you what. this tells you how.
// Send: Day 2
function segBEmail2(firstName, email) {
    const body =
        ln(`Hey ${firstName},`) +
        ln(`The Monk Mode Starter Kit explains the philosophy. Disappear to reappear. Sharpen the ax before you cut the tree. Focus on one thing.`) +
        ln(`You read it. You felt something.`) +
        ln(`And then — if you're like most people — you went back to the same tabs, the same scroll, the same "I'll start properly on Monday."`) +
        ln(`Here's what the starter kit can't do: it can't tell you what to do on Day 3 when the clarity fades. It can't tell you what to do on Day 8 when nothing has produced anything visible yet. It can't put people around you who are in the same fight.`) +
        ln(`That's the full program.`) +
        ln(`12 modules. 4 phases. Day by day. 90 days. You won't have to figure out what comes next — it's already built.`) +
        ln(`Reply and tell me — when you read the starter kit, what was the one thing that hit you hardest?`) +
        signOff();

    return {
        subject: `the starter kit told you what. this tells you how.`,
        html: plainLayout({ body, email })
    };
}

// ── SEGMENT B · EMAIL 3 ──────────────────────────────────────
// Subject: 18 months ago I was ambitious on paper
// Send: Day 4
function segBEmail3(firstName, email) {
    const body =
        ln(`Hey ${firstName},`) +
        ln(`18 months ago I was ambitious on paper. Inconsistent in action.`) +
        ln(`I wasn't looking for motivation. I'd had enough of that. Every YouTube video, every late-night promise I made to myself. I'd felt the shift a hundred times. Nothing changed.`) +
        ln(`I was looking for a system.`) +
        ln(`Not a routine. Not a morning checklist. A full operating system — something that built the person first, then the income.`) +
        ln(`I couldn't find one that told the truth about what actually makes people change. Every program I looked at assumed I was already the person capable of following through. That I just needed the right steps.`) +
        ln(`I wasn't that person yet.`) +
        ln(`So I built the system myself. Tested it on my own life. Documented it.`) +
        ln(`That's what Comeback: Unrecognizable is. The exact protocol I built, used, and proved — not something I wrote from theory.`) +
        ln(`The 90-day structure. The 7 rules. The 4 phases. The income model. All of it.`) +
        ln(`It's coming. The launch price is $17 and it won't stay there.`) +
        signOff();

    return {
        subject: `18 months ago I was ambitious on paper`,
        html: plainLayout({ body, email })
    };
}


// ============================================================
// ═══════════════════════════════════════════════════════════
//  POST-PURCHASE SEQUENCE (3 emails)
//  Triggered by Whop purchase webhook
// ═══════════════════════════════════════════════════════════
// ============================================================

// ── POST-PURCHASE · EMAIL 1 ───────────────────────────────────
// Subject: you're in. here's your first move.
// Send: Immediately after purchase confirmed
function postPurchaseEmail1(firstName, email) {
    const body =
        ln(`Hey ${firstName},`) +
        ln(`Welcome to Comeback: Unrecognizable.`) +
        ln(`You just made the most important decision of the last few years of your life. Not because of what you bought — because you actually committed to something instead of just thinking about it.`) +
        ln(`Here's exactly where to find everything inside your Whop dashboard:`) +
        ln(`<strong>Start here first:</strong><br>
→ The Unrecognizable Blueprint PDF — read it cover to cover before doing anything else. It sets the context for everything.`) +
        ln(`<strong>Then find:</strong><br>
→ Your Day-by-Day Rebuild Plan — your 12 modules. Open Module 1 today.<br>
→ The Group That Won't Let You Quit — introduce yourself in the community. First name, where you're from, one sentence on why you joined.<br>
→ Your Daily Scoreboard — duplicate the Notion template and set your Day 1 date.`) +
        ln(`Don't try to do all of this tonight. Do one thing: read the ebook. Then come back tomorrow.`) +
        ln(`Your 90 days starts now.`) +
        ln(`Any problems accessing anything — reply to this email immediately.`) +
        signOff();

    return {
        subject: `you're in. here's your first move.`,
        html: plainLayout({ body, email })
    };
}

// ── POST-PURCHASE · EMAIL 2 ───────────────────────────────────
// Subject: your only job today
// Send: Day 2 after purchase
function postPurchaseEmail2(firstName, email) {
    const body =
        ln(`Hey ${firstName},`) +
        ln(`You've had 48 hours.`) +
        ln(`One thing today: open Module 1 and answer the 5 questions at the end. In your notes app, the Notion tracker, on paper — wherever. Just answer them.`) +
        ln(`Don't skip to Module 2. Don't read ahead. Don't browse the community before you've done the work.`) +
        ln(`One module. Five questions.`) +
        ln(`Reply when you've done it. I mean that — actually reply. I want to know you did it.`) +
        signOff();

    return {
        subject: `your only job today`,
        html: plainLayout({ body, email })
    };
}

// ── POST-PURCHASE · EMAIL 3 ───────────────────────────────────
// Subject: one week in — real talk
// Send: Day 7 after purchase
function postPurchaseEmail3(firstName, email) {
    const body =
        ln(`Hey ${firstName},`) +
        ln(`You've been inside the program for 7 days.`) +
        ln(`One of two things is true right now:`) +
        ln(`<strong>You've been executing</strong> — you've done the modules, you're in the community, your scoreboard has 7 days of data. If that's you, you already feel different. That's real. Keep going. The hard part is day 8, not day 1.`) +
        ln(`<strong>You haven't started yet</strong> — you bought, you got the welcome email, and then life happened and the tabs are still open. If that's you: this is your restart. Not your failure. Open Module 1 today. Not tomorrow. Today.`) +
        ln(`I'm not judging either situation. I'm just being honest because I know what happens when people wait until "the right time" — and so do you. That's why you're here.`) +
        ln(`Reply and tell me where you're at. One sentence is enough.`) +
        signOff();

    return {
        subject: `one week in — real talk`,
        html: plainLayout({ body, email })
    };
}


// ============================================================
// ═══════════════════════════════════════════════════════════
//  WAITLIST CONFIRMATION
//  Sent immediately when someone signs up at /waitlist
// ═══════════════════════════════════════════════════════════
// ============================================================
function waitlistConfirmation(firstName, email) {
    const shopUrl = whopLink();
    const body =
        ln(`Hey ${firstName},`) +
        ln(`<strong>Comeback: Unrecognizable</strong> is live and your access is a click away.`) +
        ln(`The full 90-day protocol. 7 rules. 4 phases. The exact system. $17 at launch — moving to $67 when this window closes.`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:14px 32px;text-decoration:none;border-radius:2px;">Get Access Now — $17</a></p>\n` +
        ln(`Over the next few days I'll be in your inbox with everything you need to decide. Just reply to any email if you have questions.`) +
        signOff();

    return {
        subject: `you're in — here's what's next`,
        html: plainLayout({ body, email })
    };
}


// ============================================================
// ═══════════════════════════════════════════════════════════
//  LEGACY — MONK MODE DRIP (Day 0–7, Day 10, 14, 21)
//  Preserved for reference. Not used by new drip engine.
//  Used only by: legacy /api/cron/drip-legacy if needed.
// ═══════════════════════════════════════════════════════════
// ============================================================

const WAITLIST_URL = process.env.WHOP_PRODUCT_URL || 'https://whop.com/adams-x/comeback-unrecognized/?a=adamsproject';

function emailLayout({ dayLabel, headline, bodyHtml, footerExtra, email }) {
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
    <title>${BRAND_NAME_OLD}</title>
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background-color:#0A0A0A;">

        <!-- HEADER -->
        <div style="text-align:center;padding:40px 20px 32px;">
            <div style="display:inline-block;border-bottom:2px solid #C9A84C;padding-bottom:12px;">
                <img src="https://adamsxproject.com.ng/apple-touch-icon.png" alt="Adams X Project" style="width:60px;height:60px;display:block;margin:0 auto 12px;border-radius:12px;">
                <span style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:400;letter-spacing:0.25em;color:#C9A84C;">ADAMS X PROJECT</span>
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
                <a href="${email ? `https://adamsxproject.com.ng/unsubscribe?email=${encodeURIComponent(email)}` : 'https://adamsxproject.com.ng/unsubscribe'}" style="color:#555555;text-decoration:underline;">Unsubscribe</a>
            </p>
        </div>

    </div>
</body>
</html>`;
}

function p(text) {
    return `<p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#E8E8E8;margin:0 0 20px;">${text}</p>`;
}

function pMuted(text) {
    return `<p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#888888;margin:0 0 20px;font-style:italic;">${text}</p>`;
}

function legacySignOff() {
    return `
        <div style="margin-top:36px;padding-top:24px;border-top:1px solid #1A1A1A;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#C9A84C;margin:0 0 4px;">&mdash; Adams</p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#555555;margin:0;">Adams X Project</p>
        </div>`;
}

function legacySignOffFull() {
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

function day0(firstName, email) {
    const downloadUrl = 'https://adamsxproject.com.ng/ebooks/the-7-day-starter-kit.pdf';
    return {
        subject: `Your 7-Day Monk Mode Kit is here, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 0 OF 7',
            headline: `Welcome to the Protocol, ${firstName}.`,
            email,
            bodyHtml: `
                ${p(`I&rsquo;m glad you&rsquo;re here. The fact that you signed up tells me something about you &mdash; you&rsquo;re not comfortable standing still. Good. Neither am I.`)}
                ${p(`<strong>Monk Mode</strong> is a deliberate period of isolation, deep focus, and radical self-discipline. It&rsquo;s not about grinding harder &mdash; it&rsquo;s about cutting everything that doesn&rsquo;t serve the person you&rsquo;re becoming.`)}
                ${p(`Your 7-Day Monk Mode Starter Kit is ready. It contains everything you need to begin.`)}
                ${ctaButton('Download Your Starter Kit', downloadUrl)}
                ${divider()}
                ${p(`Over the next <strong>7 days</strong>, I&rsquo;ll be sending you one email per day. No fluff. No motivation speeches. Just one thing to do each day.`)}
                ${p(`Day 1 arrives tomorrow. Read it. Do it. Don&rsquo;t overthink it.`)}
                ${legacySignOff()}
            `
        })
    };
}

function day1(firstName, email) {
    return {
        subject: `Day 1: Before you do anything — read this, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 1 OF 7', headline: 'The Reset.', email,
            bodyHtml: `
                ${p(`${firstName}, let me be honest with you.`)}
                ${p(`Most people who say they want to change their life will fail before they even begin. Not because they&rsquo;re lazy. Not because they lack motivation. But because <strong>they never change the environment that made them this way</strong>.`)}
                ${p(`The problem was never motivation. It was always environment.`)}
                ${actionBox(`Today&rsquo;s Action`, `Write down the <strong>3 biggest things</strong> stealing your focus right now. Be specific. Name them. Write them on paper — not in your notes app.`)}
                ${legacySignOff()}
            `
        })
    };
}

function day2(firstName, email) {
    return {
        subject: `Day 2: Your brain is working against you, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 2 OF 7', headline: 'Dopamine Detox.', email,
            bodyHtml: `
                ${p(`${firstName}, here&rsquo;s something nobody tells you:`)}
                ${p(`Your brain has been reprogrammed &mdash; and not by you.`)}
                ${p(`Every time you pick up your phone and scroll, your brain releases a small hit of <strong>dopamine</strong>. Social media, short-form content — they&rsquo;ve all trained your brain to <strong>crave distraction</strong> over depth.`)}
                ${actionBox(`Today&rsquo;s Action`, `Give yourself <strong>45 minutes of zero screen time</strong>. No phone. No laptop. No music. Just silence and your own thoughts. That discomfort is your brain recalibrating.`)}
                ${pMuted(`The person who can sit in silence can do anything.`)}
                ${legacySignOff()}
            `
        })
    };
}

function day3(firstName, email) {
    return {
        subject: `Day 3: This is where most people quit, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 3 OF 7', headline: 'Deep Work.', email,
            bodyHtml: `
                ${p(`${firstName}, I won&rsquo;t sugarcoat it. Day 3 is the hardest day.`)}
                ${p(`This is the exact moment where <strong>discipline separates from motivation</strong>.`)}
                ${actionBox(`Today&rsquo;s Action`, `Pick the <strong>most important task</strong> on your plate. Set a timer for <strong>90 minutes</strong>. Put your phone in another room. Work on that one thing and nothing else.`)}
                ${legacySignOff()}
            `
        })
    };
}

function day4(firstName, email) {
    return {
        subject: `Day 4: Who are you becoming, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 4 OF 7', headline: 'Identity.', email,
            bodyHtml: `
                ${p(`${firstName}, Monk Mode is not just about habits. What we&rsquo;re really doing is <strong>rewriting your identity</strong>.`)}
                ${actionBox(`Today&rsquo;s Action`, `Write <strong>one sentence</strong> describing who you are becoming. Example: <strong>&ldquo;I am someone who finishes what I start.&rdquo;</strong> Write it down. Put it where you&rsquo;ll see it every morning.`)}
                ${legacySignOff()}
            `
        })
    };
}

function day5(firstName, email) {
    return {
        subject: `Day 5: The people around you matter more than you think, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 5 OF 7', headline: 'Circle &amp; Solitude.', email,
            bodyHtml: `
                ${p(`${firstName}, there&rsquo;s one part of your environment that&rsquo;s harder to audit: <strong>the people in it</strong>.`)}
                ${actionBox(`Today&rsquo;s Action`, `Identify one person who drains your energy. Identify one who adds to it. <strong>Spend more time with the second one this week.</strong>`)}
                ${legacySignOff()}
            `
        })
    };
}

function day6(firstName, email) {
    return {
        subject: `Day 6: You are one day away, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 6 OF 7', headline: 'Momentum.', email,
            bodyHtml: `
                ${p(`${firstName} &mdash; do you realise what you&rsquo;ve done? Six days. Six days of showing up when nobody was watching.`)}
                ${p(`<strong>You are here.</strong>`)}
                ${p(`Tomorrow is the final day. It&rsquo;s the most important email in this entire sequence. I need you to open it.`)}
                ${legacySignOff()}
            `
        })
    };
}

function day7(firstName, email) {
    return {
        subject: `Day 7: You just proved something, ${firstName}`,
        html: emailLayout({
            dayLabel: 'DAY 7 OF 7', headline: 'You Proved Something.', email,
            bodyHtml: `
                ${p(`${firstName}, congratulations. Seven days.`)}
                ${p(`But I want to be straight with you: <strong>7 days is just the warm-up.</strong>`)}
                <div style="background:#111111;border:1px solid #1A1A1A;padding:36px 28px;margin:28px 0;text-align:center;">
                    <p style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#C9A84C;margin:0 0 8px;font-weight:400;">Comeback: Unrecognizable</p>
                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 20px;">7 Rules to Change Your Life</p>
                    <a href="${WAITLIST_URL}" style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;padding:16px 36px;text-decoration:none;border-radius:2px;">Join the Waitlist &mdash; $17 Launch Offer</a>
                </div>
                ${legacySignOffFull()}
            `
        })
    };
}

function day10(firstName, email) {
    return {
        subject: `Still thinking about it, ${firstName}?`,
        html: emailLayout({
            dayLabel: 'FOLLOW UP', headline: 'You Felt the Shift.', email,
            bodyHtml: `
                ${p(`${firstName}, you finished the 7 days.`)}
                ${p(`The full blueprint is still waiting for you. <strong>Comeback: Unrecognizable</strong> — the complete 90-day protocol. Only <span style="text-decoration:line-through;color:#888888;">$67</span> &rarr; <span style="color:#C9A84C;font-weight:700;font-size:16px;">$17 Launch Offer</span>.`)}
                ${ctaButton('Get the Full Blueprint — $17 Launch Offer', WAITLIST_URL)}
                ${legacySignOff()}
            `
        })
    };
}

function day14(firstName, email) {
    return {
        subject: `This is not another course, ${firstName}`,
        html: emailLayout({
            dayLabel: 'FOLLOW UP', headline: 'An Operating System.', email,
            bodyHtml: `
                ${p(`${firstName}, <strong>Comeback: Unrecognizable</strong> gives you an operating system. 90 days. 7 rules. <span style="text-decoration:line-through;color:#888888;">$67</span> &rarr; <span style="color:#C9A84C;font-weight:700;font-size:16px;">$17 Launch Offer</span>.`)}
                ${ctaButton('Get the Full Blueprint — $17 Launch Offer', WAITLIST_URL)}
                ${legacySignOff()}
            `
        })
    };
}

function day21(firstName, email) {
    return {
        subject: `Last time I'll mention this, ${firstName}`,
        html: emailLayout({
            dayLabel: 'FINAL FOLLOW UP', headline: 'Last Call.', email,
            bodyHtml: `
                ${p(`${firstName}, I am not going to keep pushing this.`)}
                ${p(`You know what it is. You know what it costs. And deep down you know what staying exactly the same is costing you — every single day.`)}
                ${p(`<strong>Comeback: Unrecognizable — <span style="text-decoration:line-through;color:#888888;font-weight:400;">$67</span> &rarr; <span style="color:#C9A84C;">$17 Launch Offer</span>.</strong>`)}
                ${ctaButton('Get It Now — $17 Launch Offer', WAITLIST_URL)}
                ${legacySignOffFull()}
            `
        })
    };
}

function apologyResend(firstName, email) {
    const downloadUrl = email
        ? `https://adamsxproject.com.ng/api/download/tracker?email=${encodeURIComponent(email)}`
        : 'https://adamsxproject.com.ng/ebooks/the-7-day-starter-kit.pdf';
    return {
        subject: `📥 Quick update — your Starter Kit download link`,
        html: emailLayout({
            dayLabel: 'IMPORTANT UPDATE', headline: 'Your Download Link Has Been Updated.', email,
            bodyHtml: `
                ${p(`Hey <strong>${firstName}</strong> — sorry about this.`)}
                ${p(`When you first signed up, the download link in your welcome email wasn't working correctly. I've fixed it.`)}
                ${ctaButton('Download Your Starter Kit', downloadUrl)}
                ${p(`— <em>Adams</em>`)}
            `
        })
    };
}

function paidEbookAccess(firstName, downloadUrl, email) {
    const accessUrl = downloadUrl || '#';
    return {
        subject: `🏆 You're In — Comeback: Unrecognizable Access Confirmed`,
        html: emailLayout({
            dayLabel: 'PRODUCT DELIVERY', headline: `Access Granted, ${firstName}.`, email,
            bodyHtml: `
                ${p(`You just made the move most people only think about. <strong>Comeback: Unrecognizable</strong> is your new operating system.`)}
                ${ctaButton('Access Your Product', accessUrl)}
                ${p(`This is the work. Show up every single day.`)}
                ${legacySignOffFull()}
            `
        })
    };
}

function bonusDelivery(firstName, email) {
    const bonusLink = 'https://www.adamsxproject.com.ng/monk-mode-starter-kit.pdf';
    return {
        subject: `🎁 Secret Bonus Gift Unlocked, ${firstName}`,
        html: emailLayout({
            dayLabel: 'BONUS UNLOCKED', headline: `You Finished the Kit, ${firstName}.`, email,
            bodyHtml: `
                ${p(`Congratulations. You actually read the 7-Day Monk Mode Starter Kit and found the secret link.`)}
                ${ctaButton('Access Your Bonus Gift', bonusLink)}
                ${p(`Keep building. — <em>Adams</em>`)}
            `
        })
    };
}

function dailyDigest(newLeads, newWaitlist, totalLeads, totalWaitlist) {
    const leadRows = newLeads.length
        ? newLeads.map(l => `<tr><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#E8E8E8;font-size:13px;">${l.first_name}</td><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#E8E8E8;font-size:13px;">${l.email}</td><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#888888;font-size:13px;">${new Date(l.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</td></tr>`).join('')
        : `<tr><td colspan="3" style="padding:14px;color:#555555;text-align:center;font-size:13px;">No new leads yesterday</td></tr>`;

    const waitRows = newWaitlist.length
        ? newWaitlist.map(w => `<tr><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#E8E8E8;font-size:13px;">${w.first_name}</td><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#E8E8E8;font-size:13px;">${w.email}</td><td style="padding:10px 12px;border-bottom:1px solid #1A1A1A;color:#888888;font-size:13px;">${new Date(w.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</td></tr>`).join('')
        : `<tr><td colspan="3" style="padding:14px;color:#555555;text-align:center;font-size:13px;">No new waitlist signups yesterday</td></tr>`;

    return {
        subject: `Daily Report: ${newLeads.length} leads, ${newWaitlist.length} waitlist (${new Date().toLocaleDateString('en-GB')})`,
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#050505;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:620px;margin:0 auto;background-color:#0A0A0A;padding:32px 24px;">
    <div style="text-align:center;border-bottom:1px solid #1A1A1A;padding-bottom:20px;margin-bottom:28px;">
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:16px;letter-spacing:0.2em;color:#C9A84C;">ADAMS X PROJECT</span>
        <br><span style="font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:0.15em;">Daily Report &mdash; ${new Date().toDateString()}</span>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
            <td width="25%" style="padding:4px;"><div style="background:#111111;border:1px solid #1A1A1A;padding:16px;text-align:center;"><p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#888888;margin:0 0 6px;">New Leads</p><p style="font-size:28px;font-weight:700;color:#C9A84C;margin:0;">${newLeads.length}</p></div></td>
            <td width="25%" style="padding:4px;"><div style="background:#111111;border:1px solid #1A1A1A;padding:16px;text-align:center;"><p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#888888;margin:0 0 6px;">New Waitlist</p><p style="font-size:28px;font-weight:700;color:#C9A84C;margin:0;">${newWaitlist.length}</p></div></td>
            <td width="25%" style="padding:4px;"><div style="background:#111111;border:1px solid #1A1A1A;padding:16px;text-align:center;"><p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#888888;margin:0 0 6px;">Total Leads</p><p style="font-size:28px;font-weight:700;color:#E8E8E8;margin:0;">${totalLeads}</p></div></td>
            <td width="25%" style="padding:4px;"><div style="background:#111111;border:1px solid #1A1A1A;padding:16px;text-align:center;"><p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#888888;margin:0 0 6px;">Total Waitlist</p><p style="font-size:28px;font-weight:700;color:#E8E8E8;margin:0;">${totalWaitlist}</p></div></td>
        </tr>
    </table>
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#C9A84C;font-weight:700;margin:0 0 12px;">New Starter Kit Leads</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <thead><tr style="background:#111111;"><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Name</th><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Email</th><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Time</th></tr></thead>
        <tbody>${leadRows}</tbody>
    </table>
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#C9A84C;font-weight:700;margin:0 0 12px;">New Waitlist Signups</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <thead><tr style="background:#111111;"><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Name</th><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Email</th><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Time</th></tr></thead>
        <tbody>${waitRows}</tbody>
    </table>
    <p style="font-size:11px;color:#555555;text-align:center;margin:0;">Adams X Project Automated Report &copy; 2026</p>
</div>
</body></html>`
    };
}

function waitlistBlast(firstName, email) {
    const heroBanner = `<div style="margin:0 0 24px;"><img src="https://adamsxproject.com.ng/images/comeback-hero.png" alt="Comeback: Unrecognizable" width="100%" style="display:block;max-width:100%;border-radius:4px;" /></div>`;
    return {
        subject: `It's Live — Comeback: Unrecognizable is Ready`,
        html: emailLayout({
            dayLabel: null, headline: `The Wait is Over, ${firstName}.`, email,
            bodyHtml: `
                ${heroBanner}
                ${ctaButton('Get Access Now — $17 Launch Offer', WAITLIST_URL)}
                ${p(`<strong>Comeback: Unrecognizable</strong> is now live. 90 days. 7 rules. 4 phases. The complete operating system.`)}
                ${p(`This is the launch price window. It won't last.`)}
                ${ctaButton('Claim Your Spot — $17', WAITLIST_URL)}
                ${legacySignOffFull()}
            `
        })
    };
}

function launchBlastEmail(firstName, email) {
    const shopUrl = whopLink();
    const heroBanner = `<div style="margin:0 0 24px;"><img src="https://adamsxproject.com.ng/images/comeback-hero.png" alt="Comeback: Unrecognizable" width="100%" style="display:block;max-width:100%;border-radius:4px;" /></div>`;
    const testimonialBox = (quote, name) =>
        `<div style="background:#f9f6ef;border-left:4px solid #C9A84C;padding:18px 20px;margin:0 0 16px;border-radius:2px;">` +
        `<p style="font-family:Georgia,serif;font-size:15px;color:#1a1a1a;margin:0 0 10px;line-height:1.65;">&#8220;${quote}&#8221;</p>` +
        `<p style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#C9A84C;margin:0;">&#9733;&#9733;&#9733;&#9733;&#9733; &nbsp;— <strong>${name}</strong></p>` +
        `</div>`;
    const body =
        heroBanner +
        ln(`Hey ${firstName},`) +
        ln(`<strong>Comeback: Unrecognizable is officially live.</strong> Here's your direct link at the $17 launch price:`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:16px 40px;text-decoration:none;border-radius:2px;">Get Instant Access — $17 →</a></p>\n` +
        ln(`You signed up because you're tired of knowing what to do and still not doing it. This is the system that fixes that.`) +
        ln(`<strong>What's inside:</strong><br>
&nbsp;&nbsp;📋 <strong>12-Module Day-by-Day Rebuild Plan</strong> (4 phases, 90 days)<br>
&nbsp;&nbsp;📊 <strong>Daily Scoreboard</strong> — Notion tracker that holds you accountable in numbers<br>
&nbsp;&nbsp;👥 <strong>Private Community</strong> — real people running the same 90 days as you<br>
&nbsp;&nbsp;📵 <strong>Focus Firewall PDF</strong> — stop losing 4 hours a day to your phone<br>
&nbsp;&nbsp;⚡ <strong>12 Weekly Challenges</strong> — real tasks, real deadlines`) +
        ln(`Here's what people who went through the early modules are saying:`) +
        testimonialBox(`I've been in the program for 3 weeks and my focus hours went from 1.5h to 5h a day. The scoreboard doesn't let me lie to myself.`, `Marcus K.`) +
        testimonialBox(`Adams' agency model in Phase 4 is so practical. Closed my first $1,500 retainer client on day 35.`, `Sarah M.`) +
        ln(`The public Whop price is $67. <strong>Because you're on this list, you get it today for $17.</strong> This price closes in 6 days — no extensions.`) +
        `      <p style="margin:0 0 18px;text-align:center;"><a href="${shopUrl}" style="display:inline-block;background:#C9A84C;color:#000;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:16px 40px;text-decoration:none;border-radius:2px;">Claim Your Spot — $17 →</a></p>\n` +
        ln(`See you on the inside.`) +
        signOff();

    return {
        subject: `It's Live — Comeback: Unrecognizable is Ready`,
        html: plainLayout({ body, email })
    };
}

module.exports = {
    // ── New Segment A ──────────────────────────
    segAEmail1, segAEmail2, segAEmail3, segAEmail4,
    segAEmail5, segAEmail6, segAEmail7, segAEmail8,
    segAEmail9, segAEmail10, segAEmail11,

    // ── New Segment B ──────────────────────────
    segBEmail1, segBEmail2, segBEmail3,

    // ── Post-Purchase ──────────────────────────
    postPurchaseEmail1, postPurchaseEmail2, postPurchaseEmail3,

    // ── Transactional ──────────────────────────
    waitlistConfirmation, launchBlastEmail,

    // ── Legacy (still used by old flows) ───────
    day0, day1, day2, day3, day4, day5, day6, day7,
    day10, day14, day21,
    waitlistConfirmation, waitlistBlast, dailyDigest,
    apologyResend, paidEbookAccess, bonusDelivery,
};
