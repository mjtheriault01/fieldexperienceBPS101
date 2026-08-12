// node generate-activity-onepagers.js
//
// Builds a printable ONE-PAGE worksheet for every bootcamp activity, plus an index
// page, plus a PDF each. These are the hard copies handed out in class.
//
// The guarantee is the point: each sheet is measured against a single Letter page
// and, if it is over, a tighter density tier is applied until it fits. The build
// fails loudly if any sheet still cannot fit, rather than quietly emitting 2 pages.
//
// Content comes from bootcamp.html (bullets, checklists, and the exact questions
// each activity asks) so the sheets cannot drift. The editorial layer below — the
// "why this matters" line and the occasional custom worksheet block — is the only
// hand-maintained part.
//
// Requires: puppeteer-core + local Chrome.

const fs = require('fs');
const path = require('path');
const os = require('os');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REPO = __dirname;
const OUT_PDF_DIR = path.join(os.homedir(), 'Downloads', 'Field Experience Bootcamp', 'Activity One-Pagers');

const MARGIN_IN = 0.45;
const M = Math.round(MARGIN_IN * 96);
const PAGE_W = 816 - M * 2;   // 730
const PAGE_H = 1056 - M * 2;  // 970

// ─────────────────────────────────────────────────────────────────────────────
// EDITORIAL LAYER — hand-maintained.
//   slug   file/PDF name
//   why    the box at the top: why this activity matters, in the teacher's voice
//   custom optional worksheet block (tables/grids) rendered before the questions
//   lean   true = drop the "what we do in class" bullets to make room
// ─────────────────────────────────────────────────────────────────────────────
const ruled = (n) => Array.from({ length: n }, () => '<div class="rule"></div>').join('');

const EDIT = {
  p1_course_overview: {
    slug: '01-begin-with-the-end-in-mind',
    why: { t: 'Start at the end', p: 'Everything in this course builds toward one afternoon in December. Seeing the finish line today is what makes the next fifteen weeks make sense.' },
    custom: `
    <h3 class="font-heading">The question to answer first</h3>
    <p class="q-lead">What do you want to be able to say about yourself in May that you can't say today?</p>
    ${ruled(3)}
    <div class="tip"><strong>Keep this.</strong> Your teacher collects it today and hands it back to you at the capstone. Be specific enough that future-you can tell whether you got there.</div>

    <h3 class="font-heading">Two things to write down before you leave</h3>
    <div class="two">
      <div><div class="pl font-heading">My 60 hours &mdash; when will I realistically work?</div>${ruled(2)}</div>
      <div><div class="pl font-heading">The gate, in my own words</div>${ruled(2)}</div>
    </div>`,
  },

  p1_career_reflection: {
    slug: '02-career-and-self-assessment',
    why: { t: 'This is your starting line', p: 'You rate yourself on all 10 employability skills today and again at the end. Nobody is graded on where they start &mdash; but the gap between the two is the single best piece of evidence you will have at your capstone. Be honest, not generous.' },
    lean: true,
    custom: `
    <div class="tip"><strong>The 10-skill rating grid is a separate sheet</strong> &mdash; use the Employability Skills Pre-Assessment worksheet. This page is for the written half.</div>

    <h3 class="font-heading">Career interests</h3>
    <div class="pl font-heading">What fields or industries interest you?</div>${ruled(2)}
    <div class="pl font-heading">What do you want to explore or learn more about?</div>${ruled(2)}
    <div class="pl font-heading">What are you already good at? <span class="hint">Skills, subjects, or things people come to you for.</span></div>${ruled(2)}

    <h3 class="font-heading">Your professional goal for the semester</h3>
    <div class="pl font-heading">What I want to do <span class="hint">&mdash; a specific outcome, not "get better at communication"</span></div>${ruled(2)}
    <div class="pl font-heading">Why it matters to me <span class="hint">&mdash; your real reason, not what sounds good</span></div>${ruled(1)}
    <div class="pl font-heading">How I'll know I got there <span class="hint">&mdash; one thing you'll be able to show or do</span></div>${ruled(1)}`,
  },

  p1_digital_footprint: {
    slug: '03-your-professional-brand',
    why: { t: 'Employers look. All of them.', p: 'Your digital footprint is already working for you or against you, whether you manage it or not. Today you find out which, and fix it in class rather than assigning it as homework.' },
  },

  p1_resume_complete: {
    slug: '04-resume-workshop',
    why: { t: 'A 20-second argument', p: 'A resume is not a life summary &mdash; it is a short argument that you are worth a conversation. It has to be finished today, because tomorrow you apply with it.' },
    custom: `
    <h3 class="font-heading">Peer review &mdash; trade with a partner and answer in writing</h3>
    <div class="pl font-heading">Partner's name</div>${ruled(1)}
    <div class="pl font-heading">1. Is there a typo or formatting problem anywhere? Where?</div>${ruled(1)}
    <div class="pl font-heading">2. Is every bullet a <em>result</em> rather than a duty? Which one is weakest?</div>${ruled(2)}
    <div class="pl font-heading">3. Would you call this person in for an interview? Why or why not?</div>${ruled(2)}

    <h3 class="font-heading">What I'm changing based on that feedback</h3>
    ${ruled(2)}`,
  },

  p1_application_submitted: {
    slug: '05-explore-and-apply',
    why: { t: "This is the one that can't wait", p: 'Applying today <strong>starts the clock on employer paperwork.</strong> Every day this slips is a day your start date slips with it. Absent today? Make it up within 48 hours &mdash; not "sometime."' },
    lean: true,
    custom: `
    <h3 class="font-heading">Rank your top 3 &mdash; and do the research before you apply</h3>
    <table class="ws">
      <thead><tr>
        <th style="width:1.6rem"></th>
        <th style="width:28%">Placement</th>
        <th>What do they actually do? Anything recent &mdash; expanded, hired, new location?</th>
        <th style="width:25%">Why you fit <span class="hint">(from your resume)</span></th>
      </tr></thead>
      <tbody>
        <tr><td class="rank">1</td><td></td><td></td><td></td></tr>
        <tr><td class="rank">2</td><td></td><td></td><td></td></tr>
        <tr><td class="rank">3</td><td></td><td></td><td></td></tr>
      </tbody>
    </table>
    <div class="tip"><strong>Why the research column matters:</strong> the goal is to walk into your interview able to say <em>"I noticed you just opened a second location"</em> &mdash; not <em>"so what do you guys do again?"</em> Check their website, LinkedIn, and Google reviews.</div>

    <h3 class="font-heading">After you apply</h3>
    <ul class="steps">
      <li><span class="n font-heading">&rarr;</span><strong>Follow-up email</strong> 5&ndash;7 business days after applying if you haven't heard back. Brief, professional, confirms interest.</li>
      <li><span class="n font-heading">&rarr;</span><strong>Thank-you email</strong> within 24 hours of any interview. One paragraph, reference something specific.</li>
      <li><span class="n font-heading">&rarr;</span>Save both &mdash; they go in your portfolio as evidence of professional communication.</li>
    </ul>`,
  },

  p2_elevator_pitch: {
    slug: '06-elevator-pitch',
    why: { t: '30 seconds, structured', p: 'The difference between a strong pitch and a rambling one is structure, not charisma &mdash; which is good news for everyone who hates this. Build it in four pieces, then say it out loud until it stops feeling like reciting.' },
    lean: true,
    custom: `
    <h3 class="font-heading">Draft it in four pieces</h3>
    <div class="pl font-heading">1. Who I am <span class="hint">&mdash; start from your brand statement</span></div>${ruled(1)}
    <div class="pl font-heading">2. What I'm pursuing</div>${ruled(1)}
    <div class="pl font-heading">3. What I bring <span class="hint">&mdash; a specific strength, with proof</span></div>${ruled(2)}
    <div class="pl font-heading">4. What I'm asking for</div>${ruled(1)}

    <h3 class="font-heading">Rehearsal log &mdash; three different partners, feedback each round</h3>
    <table class="ws">
      <thead><tr><th style="width:26%">Partner</th><th style="width:14%">Time</th><th>One thing to fix</th></tr></thead>
      <tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody>
    </table>
    <div class="tip"><strong>Record it before you submit.</strong> Students who hear themselves back fix more than students a teacher corrects.</div>`,
  },

  p2_star_practice: {
    slug: '07-interview-skills',
    why: { t: 'Learn STAR once, use it all year', p: 'Situation, Task, Action, Result. This is how you answer an interview question &mdash; and it is also the format of every weekly reflection you will write this semester. Get it now and you save yourself fifteen weeks of vague writing.' },
    custom: `
    <h3 class="font-heading">STAR practice &mdash; pick a real example and break it down</h3>
    <table class="ws">
      <thead><tr><th style="width:6.5rem">Question you're answering</th><th></th></tr></thead>
      <tbody>
        <tr><td class="lbl-cell">Situation</td><td></td></tr>
        <tr><td class="lbl-cell">Task</td><td></td></tr>
        <tr><td class="lbl-cell">Action</td><td></td></tr>
        <tr><td class="lbl-cell">Result</td><td></td></tr>
      </tbody>
    </table>`,
  },

  p2_mock_interview: {
    slug: '08-mock-interview',
    why: { t: 'A real adult, a real interview', p: 'Community partners give up their morning for this, so treat it like the real thing &mdash; dress the part, arrive early, phone away. The feedback you get today is what Activity 9 is built on.' },
    lean: true,
    custom: `
    <h3 class="font-heading">While you wait &mdash; observation notes</h3>
    <p class="q-lead">Watching is worth nearly as much as doing. Note one thing a classmate did well and one thing you would do differently.</p>
    ${ruled(2)}

    <h3 class="font-heading">Right after your interview, while it's fresh</h3>
    <div class="pl font-heading">Who interviewed you? <span class="hint">Name and organization</span></div>${ruled(1)}
    <div class="pl font-heading">What is one piece of feedback you received?</div>${ruled(2)}
    <div class="pl font-heading">What question caught you off guard, and what will you say next time?</div>${ruled(2)}
    <div class="pl font-heading">What went better than you expected?</div>${ruled(1)}
    <div class="tip"><strong>Thank-you email within 24 hours.</strong> One paragraph, reference something specific from the conversation. It goes in your portfolio.</div>`,
  },

  p2_interview_plan: {
    slug: '09-interview-improvement-plan',
    why: { t: 'Feedback you do nothing with is just a compliment or a bruise', p: 'Read what your interviewer wrote, pick the two things worth fixing, and name how you will actually practice them. Vague plans are how this activity gets wasted.' },
  },

  p3_ethics_scenarios: {
    slug: '10-workplace-dilemma-stations',
    why: { t: 'No clean answers, on purpose', p: 'Fifteen real workplace situations, none with an obvious right answer. What is being graded is whether your reasoning is defensible &mdash; not whether you picked what the teacher would pick.' },
    lean: true,
    custom: `
    <h3 class="font-heading">Station notes</h3>
    <p class="q-lead">You will not have time to write much at each station. One line per station is enough &mdash; what you would do, and why.</p>
    <table class="ws small">
      <thead><tr><th style="width:2.6rem">Station</th><th>What would you do, and why?</th></tr></thead>
      <tbody>${Array.from({ length: 8 }, (_, i) => `<tr><td class="rank">${i + 1}</td><td></td></tr>`).join('')}</tbody>
    </table>
    <div class="tip"><strong>The thread running through almost all of these:</strong> most workplace problems get solved by telling someone early, not by handling it alone.</div>`,
  },

  p3_skills_simulation: {
    slug: '11-meet-your-10-employability-skills',
    why: { t: 'These are what you are actually graded on', p: 'Ten skills, all semester, on every employer evaluation. One sentence each in your own words &mdash; because you cannot demonstrate something you cannot describe.' },
    lean: true,
    custom: `
    <h3 class="font-heading">One sentence each &mdash; in your own words, not the definition</h3>
    <table class="ws small">
      <thead><tr><th style="width:9.5rem">Skill</th><th>What it looks like when I do it well</th></tr></thead>
      <tbody>
        ${['Communication', 'Critical Thinking', 'Teamwork', 'Problem Solving', 'Adaptability',
           'Initiative', 'Decision Making', 'Cultural Awareness', 'Reliability', 'Planning &amp; Organizing']
          .map((s, i) => `<tr><td class="lbl-cell">${i + 1}. ${s}</td><td></td></tr>`).join('')}
      </tbody>
    </table>

    <h3 class="font-heading">My two focus skills this semester</h3>
    ${ruled(1)}`,
  },

  p3_self_assessment: {
    slug: '12-post-assessment',
    why: { t: 'Now measure the difference', p: 'Same 10 skills, same scale, months of real work in between. Do not look at your pre-assessment until you have finished rating yourself here.' },
    lean: true,
    custom: `
    <div class="tip"><strong>The 10-skill rating grid is a separate sheet</strong> &mdash; use the Employability Skills Post-Assessment worksheet. This page is for the reflection.</div>

    <h3 class="font-heading">Your growth</h3>
    <div class="pl font-heading">Which skills moved the most, and what specifically caused it?</div>${ruled(3)}
    <div class="pl font-heading">What surprised you about your own growth?</div>${ruled(3)}
    <div class="pl font-heading">What do you most want to develop in the rest of your hours?</div>${ruled(2)}
    <div class="tip"><strong>Put both assessments in your portfolio, side by side.</strong> It is the cleanest evidence you will have that this semester changed something.</div>`,
  },

  p3_placement_confirmed: {
    slug: '13-placement-confirmed',
    why: { t: 'Write your own details down', p: "Do not let the only copy of your start information be a paper someone handed you. Transportation problems surface here, or they surface on day one as a no-show." },
    lean: true,
    custom: `
    <h3 class="font-heading">Your placement &mdash; fill this in completely</h3>
    <table class="ws">
      <tbody>
        <tr><td class="lbl-cell">Employer</td><td></td><td class="lbl-cell">Start date</td><td></td></tr>
        <tr><td class="lbl-cell">Supervisor</td><td></td><td class="lbl-cell">Their phone</td><td></td></tr>
        <tr><td class="lbl-cell">Address</td><td colspan="3"></td></tr>
        <tr><td class="lbl-cell">Days &amp; times</td><td></td><td class="lbl-cell">Report to</td><td></td></tr>
        <tr><td class="lbl-cell">Dress code</td><td colspan="3"></td></tr>
      </tbody>
    </table>

    <h3 class="font-heading">The logistics gauntlet &mdash; answer all four</h3>
    <div class="pl font-heading">How are you getting there, and what time do you leave?</div>${ruled(1)}
    <div class="pl font-heading">What is your backup if that falls through?</div>${ruled(1)}
    <div class="pl font-heading">Who do you contact if you are sick, and how far in advance?</div>${ruled(1)}
    <div class="pl font-heading">What is the first thing you will do when you walk in on day one?</div>${ruled(1)}`,
  },

  p4_goal_conference: {
    slug: '14-goal-conference',
    why: { t: 'Come prepared, not blank', p: "Your teacher should not be the one prompting you to come up with goals. Arrive with answers already written and the conference becomes useful instead of awkward." },
    custom: `
    <h3 class="font-heading">Draft before your conference</h3>
    <div class="pl font-heading">Goal 1</div>${ruled(1)}
    <div class="pl font-heading">Goal 2</div>${ruled(1)}
    <div class="pl font-heading">Goal 3 <span class="hint">(optional)</span></div>${ruled(1)}
    <div class="pl font-heading">Questions or concerns I want to raise</div>${ruled(2)}

    <h3 class="font-heading">Notes from the conference</h3>
    ${ruled(3)}`,
  },

  p4_internship_plan: {
    slug: '15-internship-plan-of-success',
    why: { t: 'Your roadmap for the semester', p: 'This is the document your teacher hands back to you at the capstone. Write it specifically enough that it can be judged against what actually happened.' },
    custom: `
    <h3 class="font-heading">Professional intro email to your supervisor &mdash; draft it here first</h3>
    <p class="q-lead">Short. Who you are, when you start, that you are looking forward to it, one question you have.</p>
    ${ruled(4)}`,
  },

  p4_commitment: {
    slug: '16-launch-day',
    why: { t: 'From Monday, you represent the school', p: 'Everything in bootcamp was preparation for this. From your first shift you represent yourself, this program, and the next student who wants that placement.' },
    custom: `
    <h3 class="font-heading">Your #1 goal this semester</h3>
    <p class="q-lead">One sentence. Specific and honest. What do you most want to accomplish or learn during your 60 hours?</p>
    ${ruled(2)}

    <h3 class="font-heading">The weekly rhythm &mdash; write it where you'll see it</h3>
    <div class="two">
      <div><div class="pl font-heading">Timesheet + reflection due</div><p class="big font-heading">Sunday, 11:59 PM</p>
        <div class="tip" style="margin-top:.2rem">Not in? You don't go to your placement that week until it is.</div></div>
      <div><div class="pl font-heading">My plan for hitting 60 hours</div>${ruled(2)}</div>
    </div>

    <h3 class="font-heading">One thing I'm nervous about &mdash; and what I'll do about it</h3>
    ${ruled(2)}`,
  },
};

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&(?!(amp|lt|gt|quot|#\d+|[a-z]+);)/gi, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Read every activity out of bootcamp.html ─────────────────────────────────
async function readActivities(browser) {
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(false); // page redirects to login otherwise
  await page.goto('file:///' + path.join(REPO, 'bootcamp.html').replace(/\\/g, '/'),
    { waitUntil: 'domcontentloaded', timeout: 30000 });

  const acts = await page.evaluate(() => {
    const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
    const out = [];
    let phase = null;
    document.querySelectorAll('.phase-title, .activity-card').forEach((node) => {
      if (node.classList.contains('phase-title')) { phase = txt(node); return; }
      const sections = [];
      const body = node.querySelector('.activity-body');
      if (body) {
        let cur = null;
        Array.from(body.children).forEach((child) => {
          if (child.classList.contains('activity-section-label')) {
            cur = { label: txt(child), bullets: [], checks: [] };
            sections.push(cur); return;
          }
          if (!cur) return;
          if (child.classList.contains('activity-bullets')) {
            child.querySelectorAll('li').forEach((li) => cur.bullets.push(txt(li)));
          }
          if (child.classList.contains('check-item')) cur.checks.push(txt(child));
        });
      }
      const questions = [];
      const cz = node.querySelector('.completion-zone');
      if (cz) {
        cz.querySelectorAll('.field-label, textarea, input[type="text"], input:not([type])').forEach((el) => {
          if (el.classList && el.classList.contains('field-label')) questions.push({ kind: 'label', text: txt(el) });
          else if (el.tagName === 'TEXTAREA') questions.push({ kind: 'textarea', text: el.getAttribute('placeholder') || '', rows: parseInt(el.getAttribute('rows') || '3', 10) });
          else questions.push({ kind: 'input', text: el.getAttribute('placeholder') || '' });
        });
      }
      out.push({
        phase, id: node.id.replace(/^card-/, ''),
        title: txt(node.querySelector('.activity-title')),
        subtitle: txt(node.querySelector('.activity-subtitle')),
        time: txt(node.querySelector('.time-est')),
        sections, questions,
        czLabel: txt(cz && cz.querySelector('.completion-zone-label')),
      });
    });
    return out;
  });
  await page.close();
  return acts;
}

// ── Page template ────────────────────────────────────────────────────────────
const STYLE = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Open Sans',system-ui,sans-serif;background:#f7f7f9;color:#1c1f2e}
    .font-heading{font-family:'Montserrat',system-ui,sans-serif}
    a{color:#AC161D}
    nav{background:rgba(255,255,255,.97);border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:50;
        display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;height:56px}
    .back-btn{display:flex;align-items:center;gap:.4rem;font-family:'Montserrat',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;text-decoration:none}
    .nav-title{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.85rem;letter-spacing:.04em;text-transform:uppercase;color:#1c1f2e}
    .print-btn{background:#1c1f2e;color:#fff;border:none;border-radius:8px;font-family:'Montserrat',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:.5rem .9rem;cursor:pointer}
    .print-btn:hover{background:#0e1520}
    main{max-width:800px;margin:0 auto;padding:1.75rem 1.5rem 3rem}
    .sheet{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:1.6rem 1.8rem}

    .wh{display:flex;align-items:flex-start;gap:.8rem;padding-bottom:.5rem;border-bottom:2px solid #1c1f2e;margin-bottom:.55rem}
    .wh-num{width:1.9rem;height:1.9rem;border-radius:7px;background:#AC161D;color:#fff;display:flex;align-items:center;justify-content:center;
            font-family:'Montserrat',sans-serif;font-weight:900;font-size:.8rem;flex-shrink:0}
    .wh-t{flex:1;min-width:0}
    .wh-title{font-family:'Montserrat',sans-serif;font-weight:900;font-size:1.12rem;color:#1c1f2e;line-height:1.15}
    .wh-sub{font-size:.67rem;color:#6b7280;margin-top:.1rem;line-height:1.4}
    .wh-meta{text-align:right;flex-shrink:0}
    .wh-phase{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.54rem;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;line-height:1.3}
    .wh-time{font-family:'Montserrat',sans-serif;font-weight:700;font-size:.61rem;color:#6b7280;margin-top:.1rem;white-space:nowrap}

    .ns-row{display:flex;gap:1rem;margin-bottom:.55rem}
    .ns{display:flex;align-items:baseline;gap:.35rem;flex:1}
    .ns-l{font-family:'Montserrat',sans-serif;font-size:.54rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#9ca3af;white-space:nowrap}
    .ns-line{flex:1;border-bottom:1px solid #cfd3d9;height:.9rem}

    .urg{background:rgba(172,22,29,.055);border:1px solid rgba(172,22,29,.28);border-radius:7px;padding:.48rem .68rem;margin-bottom:.6rem}
    .urg-t{font-family:'Montserrat',sans-serif;font-weight:900;font-size:.7rem;color:#AC161D;margin-bottom:.12rem}
    .urg p{font-size:.69rem;color:#374151;line-height:1.5}
    .urg strong{color:#1c1f2e}

    h3{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.71rem;color:#1c1f2e;margin:.62rem 0 .26rem;
       padding-bottom:.13rem;border-bottom:1px solid #e5e7eb}
    .q-lead{font-size:.69rem;color:#4b5563;line-height:1.5;margin-bottom:.24rem}
    .pl{font-family:'Montserrat',sans-serif;font-weight:700;font-size:.665rem;color:#1c1f2e;margin:.34rem 0 .16rem;line-height:1.4}
    .hint{font-weight:400;color:#6b7280}
    .big{font-size:.9rem;font-weight:900;color:#AC161D;margin-top:.1rem}

    ul.steps{list-style:none;margin:0}
    ul.steps li{position:relative;padding-left:1.3rem;font-size:.685rem;color:#374151;line-height:1.48;margin-bottom:.12rem}
    ul.steps li .n{position:absolute;left:0;top:0;font-family:'Montserrat',sans-serif;font-weight:900;font-size:.61rem;color:#AC161D}
    ul.steps li strong{color:#1c1f2e}

    ul.chk{list-style:none;margin:.08rem 0 0}
    ul.chk li{position:relative;padding-left:1.22rem;font-size:.685rem;color:#374151;line-height:1.42;margin-bottom:.19rem}
    ul.chk li:before{content:'';position:absolute;left:0;top:.04rem;width:.78rem;height:.78rem;border:1.5px solid #6b7280;border-radius:3px}

    table.ws{width:100%;border-collapse:collapse;margin-top:.13rem}
    table.ws th{font-family:'Montserrat',sans-serif;font-size:.52rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#1c1f2e;
       background:#f1f2f4;border:1px solid #cfd3d9;padding:.22rem .33rem;text-align:left;line-height:1.3}
    table.ws td{border:1px solid #cfd3d9;padding:.28rem .33rem;height:2.2rem;vertical-align:top}
    table.ws.small td{height:1.5rem}
    table.ws td.rank{font-family:'Montserrat',sans-serif;font-weight:900;font-size:.7rem;color:#AC161D;text-align:center;width:1.6rem;background:#fafafa}
    table.ws td.lbl-cell{font-family:'Montserrat',sans-serif;font-weight:700;font-size:.63rem;color:#1c1f2e;background:#fafafa;white-space:nowrap}

    .rule{border-bottom:1px solid #cfd3d9;height:1.22rem}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:.85rem}
    .tip{background:#f8f9fa;border-left:3px solid #9ca3af;padding:.4rem .58rem;font-size:.645rem;color:#4b5563;line-height:1.48;margin-top:.22rem}
    .tip strong{color:#1c1f2e}

    .foot{display:flex;justify-content:space-between;gap:1rem;margin-top:.7rem;padding-top:.35rem;border-top:1px solid #eef0f2;
          font-family:'Montserrat',sans-serif;font-size:.52rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#c4c8ce}

    /* Expansion tiers: a sheet with room to spare grows its writing space so the
       whole page is usable, rather than leaving the bottom third empty. */
    .e2 .rule{height:1.75rem} .e2 table.ws td{height:3rem} .e2 table.ws.small td{height:2.1rem}
    .e2 h3{margin-top:.85rem} .e2 .pl{margin-top:.5rem}
    .e1 .rule{height:1.45rem} .e1 table.ws td{height:2.55rem} .e1 table.ws.small td{height:1.8rem}
    .e1 h3{margin-top:.72rem} .e1 .pl{margin-top:.42rem}

    /* density tiers applied only if a sheet would overflow one page */
    .d1 .rule{height:1.1rem} .d1 h3{margin-top:.5rem} .d1 table.ws td{height:2rem} .d1 table.ws.small td{height:1.35rem}
    .d2 .rule{height:1rem} .d2 h3{margin-top:.42rem;font-size:.68rem} .d2 table.ws td{height:1.8rem} .d2 table.ws.small td{height:1.22rem}
    .d2 ul.steps li,.d2 ul.chk li,.d2 .q-lead,.d2 .urg p{font-size:.655rem;line-height:1.42}
    .d3 .rule{height:.9rem} .d3 h3{margin-top:.35rem;font-size:.66rem} .d3 table.ws td{height:1.6rem} .d3 table.ws.small td{height:1.1rem}
    .d3 ul.steps li,.d3 ul.chk li,.d3 .q-lead,.d3 .urg p{font-size:.63rem;line-height:1.38}
    .d3 .pl{font-size:.64rem} .d3 .wh-title{font-size:1.02rem}

    @media(max-width:640px){.two{grid-template-columns:1fr}.sheet{padding:1.15rem 1rem}}
    @media print{
      nav,.print-btn{display:none!important}
      body{background:#fff}
      main{max-width:100%;padding:0}
      .sheet{border:none;border-radius:0;padding:0}
      *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      h3,.urg-t,.pl{break-after:avoid;page-break-after:avoid}
      table.ws,.urg,.tip,ul.chk{break-inside:avoid;page-break-inside:avoid}
    }
    @page{margin:${MARGIN_IN}in}
`;

function renderSheet(a, seq, e, density) {
  // Context bullets, unless the sheet is lean on space.
  let context = '';
  if (!e.lean) {
    a.sections.forEach((s) => {
      if (!s.bullets.length) return;
      context += `<h3 class="font-heading">${esc(s.label)}</h3><ul class="steps">`
        + s.bullets.map((b, i) => `<li><span class="n font-heading">${i + 1}</span>${esc(b)}</li>`).join('')
        + '</ul>';
    });
  }
  // Checklists always survive — they are the thing students tick off.
  let checks = '';
  a.sections.forEach((s) => {
    if (!s.checks.length) return;
    checks += `<h3 class="font-heading">${esc(s.label)}</h3><ul class="chk">`
      + s.checks.map((c) => `<li>${esc(c)}</li>`).join('') + '</ul>';
  });

  // Extracted questions, paired label+field, as ruled space.
  let qs = '';
  const Q = a.questions;
  for (let i = 0; i < Q.length; i++) {
    const cur = Q[i];
    if (cur.kind === 'label') {
      const nx = Q[i + 1];
      if (nx && nx.kind !== 'label') {
        const hint = nx.text ? ` <span class="hint">&mdash; ${esc(nx.text)}</span>` : '';
        qs += `<div class="pl font-heading">${esc(cur.text)}${hint}</div>`
            + ruled(nx.kind === 'textarea' ? Math.max(1, nx.rows) : 1);
        i++;
      } else {
        qs += `<div class="pl font-heading">${esc(cur.text)}</div>${ruled(1)}`;
      }
    } else if (cur.text) {
      qs += `<div class="pl font-heading">${esc(cur.text)}</div>`
          + ruled(cur.kind === 'textarea' ? Math.max(1, cur.rows) : 1);
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(a.title)} — One-Pager — Field Experience BHS</title>
  <link rel="icon" type="image/png" href="https://res.cloudinary.com/dsbllwpbh/image/upload/v1771966521/fieldexperience-favicon_jgdotp.png">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>${STYLE}</style>
</head>
<body>
<nav>
  <div style="display:flex;align-items:center;gap:1rem">
    <a href="bootcamp-onepagers.html" class="back-btn font-heading">
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>One-Pagers
    </a>
    <span style="color:#e5e7eb">|</span>
    <span class="nav-title font-heading">${esc(a.title)}</span>
  </div>
  <button class="print-btn font-heading" onclick="window.print()">Print</button>
</nav>
<main>
  <div class="sheet${density ? ' ' + density : ''}">
    <div class="wh">
      <div class="wh-num font-heading">${seq}</div>
      <div class="wh-t">
        <div class="wh-title font-heading">${esc(a.title)}</div>
        <div class="wh-sub">${esc(a.subtitle || '')}</div>
      </div>
      <div class="wh-meta">
        <div class="wh-phase font-heading">${esc(a.phase || '')} &middot; Activity ${seq}</div>
        <div class="wh-time font-heading">${esc(a.time || '')}</div>
      </div>
    </div>
    <div class="ns-row">
      <div class="ns"><span class="ns-l font-heading">Name</span><span class="ns-line"></span></div>
      <div class="ns"><span class="ns-l font-heading">Date</span><span class="ns-line"></span></div>
    </div>
    <div class="urg">
      <div class="urg-t font-heading">${e.why.t}</div>
      <p>${e.why.p}</p>
    </div>
    ${context}
    ${e.custom || ''}
    ${checks}
    ${qs ? `<h3 class="font-heading">${esc(a.czLabel || 'Your answers')} &mdash; turn this in</h3>${qs}` : ''}
    <div class="foot">
      <span>Field Experience &middot; ${esc(a.phase || '')}</span>
      <span>Activity ${seq} &middot; ${esc(a.title)}</span>
    </div>
  </div>
</main>
</body>
</html>
`;
}

function indexPage(items) {
  const byPhase = {};
  items.forEach((it) => { (byPhase[it.phase] = byPhase[it.phase] || []).push(it); });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bootcamp One-Pagers — Field Experience BHS</title>
  <link rel="icon" type="image/png" href="https://res.cloudinary.com/dsbllwpbh/image/upload/v1771966521/fieldexperience-favicon_jgdotp.png">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Open Sans',system-ui,sans-serif;background:#f7f7f9;color:#1c1f2e}
    .font-heading{font-family:'Montserrat',system-ui,sans-serif}
    nav{background:rgba(255,255,255,.97);border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:50;
        display:flex;align-items:center;gap:1rem;padding:0 1.5rem;height:56px}
    .back-btn{display:flex;align-items:center;gap:.4rem;font-family:'Montserrat',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;text-decoration:none}
    .nav-title{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.85rem;letter-spacing:.04em;text-transform:uppercase;color:#1c1f2e}
    main{max-width:880px;margin:0 auto;padding:2.25rem 1.5rem 4rem}
    h1{font-family:'Montserrat',sans-serif;font-weight:900;font-size:1.7rem;letter-spacing:-.02em;margin-bottom:.3rem}
    .sub{font-size:.85rem;color:#6b7280;margin-bottom:1rem}
    .lede{font-size:.86rem;color:#4b5563;line-height:1.75;margin-bottom:1.5rem}
    h2{font-family:'Montserrat',sans-serif;font-weight:900;font-size:1rem;margin:1.9rem 0 .6rem;color:#AC161D}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:.7rem}
    .card{display:flex;flex-direction:column;background:#fff;border:1px solid #d8dbe0;border-radius:11px;padding:.9rem 1rem;text-decoration:none;color:inherit;transition:border-color .15s}
    .card:hover{border-color:#AC161D}
    .card-n{font-family:'Montserrat',sans-serif;font-weight:900;font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;color:#AC161D;margin-bottom:.2rem}
    .card-t{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.86rem;color:#1c1f2e;line-height:1.25;margin-bottom:.3rem}
    .card-s{font-size:.71rem;color:#6b7280;line-height:1.45;flex:1}
    .card-go{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.63rem;color:#AC161D;margin-top:.55rem}
    .box{background:rgba(251,205,7,.1);border:1px solid rgba(251,205,7,.4);border-radius:10px;padding:1rem 1.2rem;font-size:.83rem;color:#374151;line-height:1.7;margin-bottom:1.5rem}
    .box strong{color:#1c1f2e}
  </style>
</head>
<body>
<nav>
  <a href="teacher-hub.html" class="back-btn font-heading">
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>Teacher Hub
  </a>
  <span style="color:#e5e7eb">|</span>
  <span class="nav-title font-heading">Bootcamp One-Pagers</span>
</nav>
<main>
  <h1 class="font-heading">Bootcamp One-Pagers</h1>
  <p class="sub">All 16 activities &middot; one printable page each</p>
  <p class="lede">Every bootcamp activity as a single sheet you can run off and hand out. Each has a Print button, and each is verified to fit exactly one page &mdash; so a class set is one sheet per student per activity, nothing more.</p>
  <div class="box">
    <strong>These are hard copies, not the packet.</strong> The <a href="bootcamp-worksheets.html" style="color:#AC161D;font-weight:700">Bootcamp Worksheets</a> packet is all 16 stapled together for a student to keep. These one-pagers are for handing out an activity at a time as you get to it. Same questions, same source &mdash; pick whichever fits how you're running the day.
  </div>
  ${Object.entries(byPhase).map(([phase, list]) => `
  <h2 class="font-heading">${esc(phase)}</h2>
  <div class="grid">
    ${list.map((it) => `<a href="${it.file}" class="card">
      <div class="card-n font-heading">Activity ${it.seq}</div>
      <div class="card-t font-heading">${esc(it.title)}</div>
      <div class="card-s">${esc(it.subtitle || '')}</div>
      <div class="card-go font-heading">Open &amp; print &rarr;</div>
    </a>`).join('')}
  </div>`).join('')}
</main>
</body>
</html>
`;
}

// ── Build with a fit guarantee ───────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(CHROME_PATH)) throw new Error('Chrome not found at ' + CHROME_PATH);
  if (!fs.existsSync(OUT_PDF_DIR)) fs.mkdirSync(OUT_PDF_DIR, { recursive: true });

  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const acts = await readActivities(browser);
  if (acts.length !== 16) { await browser.close(); throw new Error(`Expected 16 activities, got ${acts.length}`); }

  const missing = acts.filter((a) => !EDIT[a.id]);
  if (missing.length) { await browser.close(); throw new Error('No editorial entry for: ' + missing.map((m) => m.id).join(', ')); }

  const measure = await browser.newPage();
  await measure.setViewport({ width: PAGE_W, height: PAGE_H });

  // Most generous first: pick the largest writing space that still fits one page.
  const TIERS = ['e2', 'e1', '', 'd1', 'd2', 'd3'];
  const items = [];
  const failures = [];

  for (let i = 0; i < acts.length; i++) {
    const a = acts[i];
    const e = EDIT[a.id];
    const seq = i + 1;
    const file = `onepager-${e.slug}.html`;
    const fp = path.join(REPO, file);

    let used = null, height = 0;
    for (const tier of TIERS) {
      fs.writeFileSync(fp, renderSheet(a, seq, e, tier));
      await measure.goto('file:///' + fp.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
      await measure.emulateMediaType('print');
      height = await measure.evaluate(() => Math.round(document.querySelector('.sheet').getBoundingClientRect().height));
      if (height <= PAGE_H) { used = tier; break; }
    }
    if (used === null) {
      failures.push({ title: a.title, height });
      console.log(`  !! ${String(seq).padStart(2)}  ${a.title} — ${height}px, still over ${PAGE_H}px at tightest tier`);
      continue;
    }
    const pct = Math.round((height / PAGE_H) * 100);
    console.log(`  ok ${String(seq).padStart(2)}  ${String(height).padStart(3)}px ${String(pct).padStart(3)}%  ${used ? '[' + used + '] ' : '      '}${a.title}`);

    items.push({ seq, title: a.title, subtitle: a.subtitle, phase: a.phase, file, slug: e.slug });
  }

  // Index page
  fs.writeFileSync(path.join(REPO, 'bootcamp-onepagers.html'), indexPage(items));
  console.log(`\nWrote bootcamp-onepagers.html (index of ${items.length})`);

  // PDFs — verify each is exactly one page.
  const pdfPage = await browser.newPage();
  await pdfPage.setViewport({ width: 816, height: 400 });
  let badPdf = 0;
  for (const it of items) {
    await pdfPage.goto('file:///' + path.join(REPO, it.file).replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await pdfPage.emulateMediaType('print');
    const out = path.join(OUT_PDF_DIR, `Activity ${String(it.seq).padStart(2, '0')} - ${it.title.replace(/[\\/:*?"<>|]/g, '')}.pdf`);
    await pdfPage.pdf({ path: out, printBackground: true, format: 'Letter',
      margin: { top: `${MARGIN_IN}in`, right: `${MARGIN_IN}in`, bottom: `${MARGIN_IN}in`, left: `${MARGIN_IN}in` } });
    const pages = (fs.readFileSync(out).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    if (pages !== 1) { badPdf++; console.log(`  !! ${it.title} PDF is ${pages} pages`); }
  }

  await browser.close();

  console.log(`\n${items.length} one-pagers -> ${OUT_PDF_DIR}`);
  if (failures.length || badPdf) {
    console.error(`\nFAIL: ${failures.length} sheet(s) could not be fit, ${badPdf} PDF(s) not 1 page.`);
    process.exit(1);
  }
  console.log('PASS: every one-pager fits exactly one page.');
}

main().catch((e) => { console.error(e); process.exit(1); });
