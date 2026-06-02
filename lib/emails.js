// ============================================================
// ALL EMAIL TEMPLATES — Adams X Project
// Used by: server.js (subscribe/waitlist) and cron jobs (drip/blast/digest)
// ============================================================

const BRAND = `ADAMS X <span style="color:#d4af37;">PROJECT</span>`;

function emailWrapper(kicker, bodyHtml) {
    return `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1c1a17;background-color:#fcfbfa;border:1px solid #e8e4dc;">
        <div style="text-align:center;margin-bottom:30px;border-bottom:1px solid #e8e4dc;padding-bottom:20px;">
            <h2 style="font-family:Georgia,serif;font-size:26px;margin:0 0 8px;letter-spacing:0.05em;color:#0b0a09;font-weight:500;">${BRAND}</h2>
            <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#9e9b95;font-weight:600;">${kicker}</span>
        </div>
        ${bodyHtml}
        <div style="border-top:1px solid #e8e4dc;padding-top:20px;margin-top:35px;font-size:12px;color:#9e9b95;text-align:center;line-height:1.5;">
            <p style="margin:0 0 4px;">Currently living the journey and building in public.</p>
            <p style="margin:0;"><strong>Adams X Project</strong> &copy; 2026. All rights reserved.</p>
        </div>
    </div>`;
}

function goldBox(title, items) {
    const listItems = items.map(i => `<li style="margin-bottom:8px;">${i}</li>`).join('');
    return `
    <div style="background-color:#f5f3ef;border-left:3px solid #d4af37;padding:20px;margin-bottom:28px;">
        <h3 style="font-family:Georgia,serif;margin:0 0 10px;font-size:15px;color:#0b0a09;">${title}</h3>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;color:#555;">${listItems}</ul>
    </div>`;
}

function ctaButton(label, url) {
    return `
    <div style="text-align:center;margin:28px 0;">
        <a href="${url}" style="background-color:#0b0a09;color:#f5f3ef;text-decoration:none;padding:14px 32px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;display:inline-block;">${label}</a>
    </div>`;
}

function p(text) {
    return `<p style="font-size:15px;line-height:1.7;color:#333;margin-bottom:20px;">${text}</p>`;
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
            ${ctaButton('Download Your Starter Kit', 'https://github.com/adamsxproject')}
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
            <div style="background-color:#0b0a09;padding:28px;margin-bottom:28px;text-align:center;">
                <h2 style="font-family:Georgia,serif;color:#d4af37;font-size:22px;margin:0 0 8px;font-weight:500;">Comeback: Unrecognizable</h2>
                <p style="color:#9e9b95;font-size:13px;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">7 Rules to Change Your Life</p>
                <p style="color:#f5f3ef;font-size:14px;line-height:1.7;margin:0 0 20px;">The full 90-day protocol. The exact step-by-step system to build a $10k/month income from zero. No guesswork. No fluff. Just the system.</p>
                <p style="font-family:Arial,Helvetica,sans-serif;margin:0 0 20px;line-height:1.2;text-align:center;">
                    <span style="font-family:Georgia,serif;font-size:18px;color:#9e9b95;text-decoration:line-through;text-decoration-color:rgba(212,175,55,0.5);margin-right:8px;vertical-align:middle;">$67</span>
                    <span style="font-family:Arial,sans-serif;font-size:14px;color:#9e9b95;margin-right:8px;vertical-align:middle;opacity:0.5;">&rarr;</span>
                    <span style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#d4af37;vertical-align:middle;">$17</span>
                    <span style="display:inline-block;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.25);color:#d4af37;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:100px;margin-left:8px;vertical-align:middle;">Launch Offer</span>
                </p>
                <a href="https://adamsxproject.com/comeback" style="background-color:#d4af37;color:#0b0a09;text-decoration:none;padding:14px 32px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;display:inline-block;">I'm Ready — Get Access ($17 Launch Offer)</a>
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
            <div style="background-color:#0b0a09;padding:28px;margin-bottom:28px;text-align:center;">
                <h2 style="font-family:Georgia,serif;color:#d4af37;font-size:22px;margin:0 0 8px;font-weight:500;">Comeback: Unrecognizable</h2>
                <p style="color:#f5f3ef;font-size:14px;line-height:1.7;margin:0 0 16px;">90-day system. 7 rules. $10k/month from zero.</p>
                <p style="font-family:Arial,Helvetica,sans-serif;margin:0 0 20px;line-height:1.2;text-align:center;">
                    <span style="font-family:Georgia,serif;font-size:18px;color:#9e9b95;text-decoration:line-through;text-decoration-color:rgba(212,175,55,0.5);margin-right:8px;vertical-align:middle;">$67</span>
                    <span style="font-family:Arial,sans-serif;font-size:14px;color:#9e9b95;margin-right:8px;vertical-align:middle;opacity:0.5;">&rarr;</span>
                    <span style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#d4af37;vertical-align:middle;">$17</span>
                    <span style="display:inline-block;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.25);color:#d4af37;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:100px;margin-left:8px;vertical-align:middle;">Launch Offer</span>
                </p>
                <a href="https://adamsxproject.com/comeback" style="background-color:#d4af37;color:#0b0a09;text-decoration:none;padding:16px 36px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;display:inline-block;">Get Access Now — $17 Launch Offer</a>
            </div>
            ${p(`This price will not last. Go now. — <em>Adams</em>`)}
        `)
    };
}

// ── DAILY DIGEST (to Adams X) ─────────────────────────────────
function dailyDigest(newLeads, newWaitlist, totalLeads, totalWaitlist) {
    const leadRows = newLeads.length
        ? newLeads.map(l => `<tr><td style="padding:8px;border-bottom:1px solid #e8e4dc;">${l.first_name}</td><td style="padding:8px;border-bottom:1px solid #e8e4dc;">${l.email}</td><td style="padding:8px;border-bottom:1px solid #e8e4dc;">${new Date(l.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</td></tr>`).join('')
        : `<tr><td colspan="3" style="padding:8px;color:#9e9b95;text-align:center;">No new leads yesterday</td></tr>`;

    const waitRows = newWaitlist.length
        ? newWaitlist.map(w => `<tr><td style="padding:8px;border-bottom:1px solid #e8e4dc;">${w.first_name}</td><td style="padding:8px;border-bottom:1px solid #e8e4dc;">${w.email}</td><td style="padding:8px;border-bottom:1px solid #e8e4dc;">${new Date(w.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</td></tr>`).join('')
        : `<tr><td colspan="3" style="padding:8px;color:#9e9b95;text-align:center;">No new waitlist signups yesterday</td></tr>`;

    return {
        subject: `📊 Daily Report — ${newLeads.length} leads, ${newWaitlist.length} waitlist (${new Date().toLocaleDateString('en-GB')})`,
        html: `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:620px;margin:0 auto;padding:32px 20px;color:#1c1a17;background:#fcfbfa;border:1px solid #e8e4dc;">
            <h2 style="font-family:Georgia,serif;font-size:22px;margin:0 0 4px;color:#0b0a09;">Adams X Project — Daily Report</h2>
            <p style="color:#9e9b95;font-size:12px;margin:0 0 28px;">${new Date().toDateString()}</p>

            <div style="display:flex;gap:16px;margin-bottom:28px;">
                <div style="flex:1;background:#0b0a09;padding:20px;text-align:center;">
                    <p style="color:#9e9b95;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">New Leads (24h)</p>
                    <p style="color:#d4af37;font-size:32px;font-weight:700;margin:0;">${newLeads.length}</p>
                </div>
                <div style="flex:1;background:#0b0a09;padding:20px;text-align:center;">
                    <p style="color:#9e9b95;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">New Waitlist (24h)</p>
                    <p style="color:#d4af37;font-size:32px;font-weight:700;margin:0;">${newWaitlist.length}</p>
                </div>
                <div style="flex:1;background:#0b0a09;padding:20px;text-align:center;">
                    <p style="color:#9e9b95;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">Total Leads</p>
                    <p style="color:#f5f3ef;font-size:32px;font-weight:700;margin:0;">${totalLeads}</p>
                </div>
                <div style="flex:1;background:#0b0a09;padding:20px;text-align:center;">
                    <p style="color:#9e9b95;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">Total Waitlist</p>
                    <p style="color:#f5f3ef;font-size:32px;font-weight:700;margin:0;">${totalWaitlist}</p>
                </div>
            </div>

            <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#0b0a09;margin:0 0 12px;">New Starter Kit Leads</h3>
            <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:28px;">
                <thead><tr style="background:#f5f3ef;">
                    <th style="padding:8px;text-align:left;font-weight:600;">Name</th>
                    <th style="padding:8px;text-align:left;font-weight:600;">Email</th>
                    <th style="padding:8px;text-align:left;font-weight:600;">Time</th>
                </tr></thead>
                <tbody>${leadRows}</tbody>
            </table>

            <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#0b0a09;margin:0 0 12px;">New Waitlist Signups</h3>
            <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:28px;">
                <thead><tr style="background:#f5f3ef;">
                    <th style="padding:8px;text-align:left;font-weight:600;">Name</th>
                    <th style="padding:8px;text-align:left;font-weight:600;">Email</th>
                    <th style="padding:8px;text-align:left;font-weight:600;">Time</th>
                </tr></thead>
                <tbody>${waitRows}</tbody>
            </table>

            <p style="font-size:12px;color:#9e9b95;text-align:center;margin:0;">Adams X Project Automated Report &copy; 2026</p>
        </div>`
    };
}

module.exports = { day0, day1, day2, day3, day4, day5, day6, day7, waitlistConfirmation, waitlistBlast, dailyDigest };
