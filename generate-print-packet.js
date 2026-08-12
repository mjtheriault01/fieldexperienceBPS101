// node generate-print-packet.js
//
// Builds bootcamp-worksheets.html — a paper version of every bootcamp activity —
// then renders it to PDF. Needed because students submit on paper until the course
// website is live.
//
// Everything is read out of the real pages so the worksheets cannot drift:
//   bootcamp.html       -> all 16 activities: what we do in class, checklists, and
//                          the exact questions each activity asks (field labels +
//                          textarea/input placeholders, in document order)
//   self-assessment.html -> the 10 employability skills, their descriptions, and the
//                          1-4 level words, for the pre/post rating grids
//
// Requires: puppeteer-core + local Chrome (same setup as generate-positions-pdf.js)

const fs = require('fs');
const path = require('path');
const os = require('os');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REPO = __dirname;
const OUT_PDF_DIR = path.join(os.homedir(), 'Downloads', 'Field Experience Bootcamp');
const OUT_HTML = 'bootcamp-worksheets.html';

// Activities whose real work happens on a separate tool page; the worksheet says so.
const TOOL_NOTE = {
  'course-launch.html': 'This activity is a guided walkthrough. Your teacher will lead it — use this page for the discussion question and notes.',
  'self-assessment.html?type=pre': 'Use the Employability Skills Pre-Assessment worksheet at the front of this packet.',
  'self-assessment.html?type=post': 'Use the Employability Skills Post-Assessment worksheet at the back of this packet.',
};

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&(?!(amp|lt|gt|quot|#\d+|[a-z]+);)/gi, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── ruled writing space ──────────────────────────────────────────────────────
function lines(n) {
  let out = '';
  for (let i = 0; i < n; i++) out += '<div class="rule"></div>';
  return out;
}

// Reads the 10 skills + level words straight out of self-assessment.html's source.
function readSkills() {
  const src = fs.readFileSync(path.join(REPO, 'self-assessment.html'), 'utf8');

  const skillsBlock = src.match(/const SKILLS = \[([\s\S]*?)\];/);
  if (!skillsBlock) throw new Error('Could not find SKILLS in self-assessment.html');
  const skills = [...skillsBlock[1].matchAll(/name:'([^']+)',\s*desc:'([^']+)'/g)]
    .map((m) => ({ name: m[1], desc: m[2] }));

  const levelsBlock = src.match(/const LEVELS = \[([\s\S]*?)\];/);
  if (!levelsBlock) throw new Error('Could not find LEVELS in self-assessment.html');
  const levels = [...levelsBlock[1].matchAll(/val:(\d+),\s*word:'([^']+)'/g)]
    .map((m) => ({ val: +m[1], word: m[2] }));

  if (skills.length !== 10) throw new Error(`Expected 10 skills, found ${skills.length}`);
  return { skills, levels };
}

// Reads every activity out of bootcamp.html, including the questions it asks.
async function readActivities(browser) {
  const page = await browser.newPage();
  // bootcamp.html redirects to login without a session; the markup is static.
  await page.setJavaScriptEnabled(false);
  await page.goto('file:///' + path.join(REPO, 'bootcamp.html').replace(/\\/g, '/'),
    { waitUntil: 'domcontentloaded', timeout: 30000 });

  const acts = await page.evaluate(() => {
    const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
    const out = [];
    let phase = null;

    document.querySelectorAll('.phase-title, .activity-card').forEach((node) => {
      if (node.classList.contains('phase-title')) { phase = txt(node); return; }

      // Teaching content: labelled sections of bullets and checkboxes.
      const sections = [];
      const body = node.querySelector('.activity-body');
      if (body) {
        let cur = null;
        Array.from(body.children).forEach((child) => {
          if (child.classList.contains('activity-section-label')) {
            cur = { label: txt(child), bullets: [], checks: [] };
            sections.push(cur);
            return;
          }
          if (!cur) return;
          if (child.classList.contains('activity-bullets')) {
            child.querySelectorAll('li').forEach((li) => cur.bullets.push(txt(li)));
          }
          if (child.classList.contains('check-item')) cur.checks.push(txt(child));
        });
      }

      // The questions the student actually answers, in document order.
      const questions = [];
      const cz = node.querySelector('.completion-zone');
      if (cz) {
        cz.querySelectorAll('.field-label, textarea, input[type="text"], input:not([type])').forEach((el) => {
          if (el.classList && el.classList.contains('field-label')) {
            questions.push({ kind: 'label', text: txt(el) });
          } else if (el.tagName === 'TEXTAREA') {
            questions.push({ kind: 'textarea', text: el.getAttribute('placeholder') || '',
                             rows: parseInt(el.getAttribute('rows') || '3', 10) });
          } else {
            questions.push({ kind: 'input', text: el.getAttribute('placeholder') || '' });
          }
        });
      }

      out.push({
        phase,
        id: node.id.replace(/^card-/, ''),
        num: txt(node.querySelector('.activity-num')),
        title: txt(node.querySelector('.activity-title')),
        subtitle: txt(node.querySelector('.activity-subtitle')),
        time: txt(node.querySelector('.time-est')),
        sections,
        questions,
        toolLink: cz && cz.querySelector('a[href]') ? cz.querySelector('a[href]').getAttribute('href') : null,
        czLabel: txt(cz && cz.querySelector('.completion-zone-label')),
      });
    });
    return out;
  });

  await page.close();
  return acts;
}

// ── page chrome ──────────────────────────────────────────────────────────────
const STYLE = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Open Sans',system-ui,sans-serif;background:#f7f7f9;color:#1c1f2e}
    .font-heading{font-family:'Montserrat',system-ui,sans-serif}
    a{color:#AC161D}

    nav{background:rgba(255,255,255,.97);border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:50;
        display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;height:56px}
    .back-btn{display:flex;align-items:center;gap:.4rem;font-family:'Montserrat',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;text-decoration:none}
    .back-btn:hover{color:#1c1f2e}
    .nav-title{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.85rem;letter-spacing:.04em;text-transform:uppercase;color:#1c1f2e}
    .print-btn{background:#1c1f2e;color:#fff;border:none;border-radius:8px;font-family:'Montserrat',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:.5rem .9rem;cursor:pointer}
    .print-btn:hover{background:#0e1520}

    main{max-width:820px;margin:0 auto;padding:2rem 1.5rem 4rem}

    /* one .sheet == one printed worksheet */
    .sheet{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:2rem 2.25rem;margin-bottom:1.25rem}
    .sheet.cover{background:#fff;border-color:#e5e7eb;color:#1c1f2e;text-align:center;padding:2.25rem 2.25rem 1.75rem;border-top:6px solid #FBCD07}

    /* worksheet header */
    .wh{display:flex;align-items:flex-start;gap:.9rem;padding-bottom:.75rem;border-bottom:2px solid #1c1f2e;margin-bottom:1rem}
    .wh-num{width:2.1rem;height:2.1rem;border-radius:8px;background:#AC161D;color:#fff;display:flex;align-items:center;justify-content:center;
            font-family:'Montserrat',sans-serif;font-weight:900;font-size:.85rem;flex-shrink:0}
    .wh-t{flex:1;min-width:0}
    .wh-title{font-family:'Montserrat',sans-serif;font-weight:900;font-size:1.2rem;color:#1c1f2e;line-height:1.2}
    .wh-sub{font-size:.74rem;color:#6b7280;margin-top:.2rem;line-height:1.45}
    .wh-meta{text-align:right;flex-shrink:0}
    .wh-phase{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.58rem;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;line-height:1.3}
    .wh-time{font-family:'Montserrat',sans-serif;font-weight:700;font-size:.66rem;color:#6b7280;margin-top:.15rem;white-space:nowrap}

    /* name strip */
    .name-strip{display:flex;gap:1.1rem;flex-wrap:wrap;margin-bottom:1rem;padding-bottom:.85rem;border-bottom:1px dashed #d8dbe0}
    .ns{display:flex;align-items:baseline;gap:.4rem;flex:1;min-width:10rem}
    .ns-l{font-family:'Montserrat',sans-serif;font-size:.58rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#9ca3af;white-space:nowrap}
    .ns-line{flex:1;border-bottom:1px solid #cfd3d9;height:1rem}

    h3{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.82rem;color:#1c1f2e;margin:1.15rem 0 .45rem}
    .lbl{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.58rem;letter-spacing:.09em;text-transform:uppercase;color:#9ca3af;margin:1rem 0 .4rem}
    p{font-size:.82rem;color:#374151;line-height:1.7}

    ul.bul{list-style:none;margin:0 0 .5rem}
    ul.bul li{position:relative;padding-left:1.05rem;font-size:.79rem;color:#4b5563;line-height:1.6;margin-bottom:.24rem}
    ul.bul li:before{content:'';position:absolute;left:.28rem;top:.55rem;width:.26rem;height:.26rem;border-radius:50%;background:#AC161D}

    ul.chk{list-style:none;margin:0 0 .5rem}
    ul.chk li{position:relative;padding-left:1.35rem;font-size:.79rem;color:#374151;line-height:1.55;margin-bottom:.34rem}
    ul.chk li:before{content:'';position:absolute;left:0;top:.1rem;width:.85rem;height:.85rem;border:1.5px solid #6b7280;border-radius:3px}

    /* question block */
    .q{margin-bottom:.9rem;break-inside:avoid;page-break-inside:avoid}
    .q-t{font-family:'Montserrat',sans-serif;font-weight:700;font-size:.81rem;color:#1c1f2e;margin-bottom:.4rem;line-height:1.45}
    .rule{border-bottom:1px solid #cfd3d9;height:1.55rem}

    /* skills rating grid */
    .grid-wrap{border:1.5px solid #1c1f2e;border-radius:8px;overflow:hidden;margin:.85rem 0;break-inside:avoid}
    table{width:100%;border-collapse:collapse}
    th{font-family:'Montserrat',sans-serif;font-size:.58rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#1c1f2e;background:#f1f2f4;border-bottom:1.5px solid #1c1f2e;padding:.45rem .4rem;text-align:center;line-height:1.3}
    th.sk{text-align:left;padding-left:.7rem}
    td{border-bottom:1px solid #eef0f2;padding:.42rem .4rem;font-size:.76rem;color:#374151;vertical-align:middle}
    tr:last-child td{border-bottom:none}
    td.sk{padding-left:.7rem;line-height:1.35}
    td.sk b{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.78rem;color:#1c1f2e;display:block}
    td.sk span{font-size:.67rem;color:#6b7280;line-height:1.35}
    td.lv{text-align:center;width:2.9rem;padding:.42rem .2rem}
    th.lv{width:2.9rem}
    .circ{width:1.3rem;height:1.3rem;border:1.5px solid #9ca3af;border-radius:50%;display:inline-block;vertical-align:middle}

    .box{border-radius:9px;padding:.85rem 1.05rem;margin:.9rem 0;font-size:.8rem;line-height:1.7;color:#374151}
    .box strong{color:#1c1f2e}
    .box-t{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.8rem;margin-bottom:.3rem}
    .b-gold{background:rgba(251,205,7,.1);border:1px solid rgba(251,205,7,.4)}
    .b-gold .box-t{color:#92400e}
    .b-blue{background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.3)}
    .b-blue .box-t{color:#1d4ed8}
    .b-red{background:rgba(172,22,29,.05);border:1px solid rgba(172,22,29,.3)}
    .b-red .box-t{color:#AC161D}

    .tool-note{background:#f8f9fa;border-left:3px solid #9ca3af;padding:.6rem .85rem;margin:.85rem 0;font-size:.78rem;color:#4b5563;line-height:1.6}

    .foot{display:flex;justify-content:space-between;gap:1rem;margin-top:1.4rem;padding-top:.6rem;border-top:1px solid #eef0f2;
          font-family:'Montserrat',sans-serif;font-size:.58rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#c4c8ce}

    /* cover */
    .cover img{height:2.9rem;margin-bottom:.9rem}
    .cover-eyebrow{font-family:'Montserrat',sans-serif;font-size:.64rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#AC161D;margin-bottom:.55rem}
    .cover h1{font-family:'Montserrat',sans-serif;font-weight:900;font-size:2rem;line-height:1.06;letter-spacing:-.02em;margin-bottom:.35rem;color:#0e1520}
    .cover-sub{font-size:.84rem;color:#6b7280;margin-bottom:1.1rem}
    .cover-rule{height:3px;width:3.5rem;background:#AC161D;margin:0 auto 1.1rem}
    .cover-np{border:1.5px solid #d8dbe0;border-radius:10px;padding:.85rem 1.1rem;margin:0 auto 1.15rem;max-width:20rem;text-align:left}
    .cover-np .ns-l{color:#AC161D}
    .cover-np .ns-line{border-bottom-color:#cfd3d9}
    .cover-np .ns{margin-bottom:.7rem}
    .cover-np .ns:last-child{margin-bottom:0}
    .cover-note{font-size:.75rem;color:#4b5563;line-height:1.7;max-width:25rem;margin:0 auto}
    .cover-note strong{color:#1c1f2e}

    /* contents */
    .toc-row{display:flex;align-items:baseline;gap:.5rem;padding:.4rem 0;border-bottom:1px solid #f1f2f4;font-size:.82rem}
    .toc-row:last-child{border-bottom:none}
    .toc-n{font-family:'Montserrat',sans-serif;font-weight:900;font-size:.72rem;color:#AC161D;width:1.5rem;flex-shrink:0}
    .toc-t{font-family:'Montserrat',sans-serif;font-weight:700;color:#1c1f2e}
    .toc-dots{flex:1;border-bottom:1px dotted #d1d5db;margin:0 .3rem;min-width:.8rem}
    .toc-ph{font-size:.72rem;color:#9ca3af;white-space:nowrap}

    @media(max-width:640px){.sheet{padding:1.35rem 1.15rem}}

    @media print{
      nav,.print-btn,.screen-only{display:none!important}
      body{background:#fff}
      main{max-width:100%;padding:0}
      *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .sheet{border:none;border-radius:0;padding:0;margin:0;page-break-after:always;break-after:page}
      .sheet:last-child{page-break-after:auto;break-after:auto}
      .sheet.cover{padding:.9in .55in .5in;border-top:6px solid #FBCD07}
      h3,.lbl,.q-t{page-break-after:avoid;break-after:avoid}
      .grid-wrap,.box,.q,.tool-note,.name-strip{break-inside:avoid;page-break-inside:avoid}
      tr{break-inside:avoid}
    }
    @page{margin:.5in}
`;

function head(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="icon" type="image/png" href="https://res.cloudinary.com/dsbllwpbh/image/upload/v1771966521/fieldexperience-favicon_jgdotp.png">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>${STYLE}</style>
</head>
<body>
<nav>
  <div style="display:flex;align-items:center;gap:1rem">
    <a href="teacher-hub.html" class="back-btn font-heading">
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>Teacher Hub
    </a>
    <span style="color:#e5e7eb">|</span>
    <span class="nav-title font-heading">Bootcamp Worksheets</span>
  </div>
  <button class="print-btn font-heading" onclick="window.print()">Print Packet</button>
</nav>
<main>`;
}

const NAME_STRIP = `
    <div class="name-strip">
      <div class="ns"><span class="ns-l font-heading">Name</span><span class="ns-line"></span></div>
      <div class="ns"><span class="ns-l font-heading">Date</span><span class="ns-line"></span></div>
    </div>`;

function sheetFoot(label) {
  return `
    <div class="foot"><span>Field Experience &middot; Bootcamp Worksheet</span><span>${esc(label)}</span></div>`;
}

// ── the 10-skill rating grid, used by both pre and post ──────────────────────
function skillsGrid(skills, levels) {
  return `
    <div class="grid-wrap">
      <table>
        <thead><tr><th class="sk">Employability Skill</th>${levels.map((l) => `<th class="lv">${l.val}<br><span style="font-weight:600;text-transform:none;letter-spacing:0;font-size:.55rem">${esc(l.word)}</span></th>`).join('')}</tr></thead>
        <tbody>
          ${skills.map((s, i) => `<tr><td class="sk"><b>${i + 1}. ${esc(s.name)}</b><span>${esc(s.desc)}</span></td>${levels.map(() => '<td class="lv"><span class="circ"></span></td>').join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function assessmentSheet(kind, skills, levels) {
  const isPre = kind === 'pre';
  return `
  <div class="sheet">
    <div class="wh">
      <div class="wh-num font-heading">${isPre ? '2' : '12'}</div>
      <div class="wh-t">
        <div class="wh-title font-heading">Employability Skills ${isPre ? 'Pre' : 'Post'}-Assessment</div>
        <div class="wh-sub">${isPre
          ? 'Rate yourself honestly. This is your baseline — nobody is graded on where they start.'
          : 'Rate yourself again. Then compare against your pre-assessment and see what moved.'}</div>
      </div>
      <div class="wh-meta">
        <div class="wh-phase font-heading">${isPre ? 'Phase 1' : 'Phase 3'}</div>
        <div class="wh-time font-heading">~30&ndash;45 min</div>
      </div>
    </div>
    ${NAME_STRIP}

    <p><strong>Circle one number for each skill.</strong> ${isPre
      ? 'Be honest rather than generous — the whole point is to have a real starting line to measure against in December.'
      : 'Do not look at your pre-assessment until you have finished rating yourself here.'}</p>

    ${skillsGrid(skills, levels)}

    ${isPre ? `
    <h3 class="font-heading">Career Interests</h3>
    <div class="q"><div class="q-t font-heading">What fields or industries interest you?</div>${lines(2)}</div>
    <div class="q"><div class="q-t font-heading">What do you want to explore or learn more about?</div>${lines(2)}</div>
    <div class="q"><div class="q-t font-heading">What are you already good at? <span style="font-weight:400;color:#6b7280">Skills, subjects, or things people already come to you for.</span></div>${lines(2)}</div>

    <h3 class="font-heading">Your Professional Goal for the Semester</h3>
    <div class="q"><div class="q-t font-heading">What I want to do <span style="font-weight:400;color:#6b7280">&mdash; a specific outcome, not "get better at communication"</span></div>${lines(2)}</div>
    <div class="q"><div class="q-t font-heading">Why it matters to me <span style="font-weight:400;color:#6b7280">&mdash; your real reason, not what sounds good</span></div>${lines(2)}</div>
    <div class="q"><div class="q-t font-heading">How I'll know I got there <span style="font-weight:400;color:#6b7280">&mdash; one thing you'll be able to show or do</span></div>${lines(2)}</div>

    <div class="box b-gold">
      <div class="box-t font-heading">Keep this</div>
      Your teacher collects this sheet, and you get it back at the end of the semester. The gap between what you write today and what you write in December <em>is</em> the evidence for your capstone pitch.
    </div>`
    : `
    <h3 class="font-heading">Your Growth</h3>
    <div class="q"><div class="q-t font-heading">Which skills moved the most since Phase 1, and what specifically caused it?</div>${lines(3)}</div>
    <div class="q"><div class="q-t font-heading">What surprised you about your own growth?</div>${lines(3)}</div>
    <div class="q"><div class="q-t font-heading">What do you most want to develop during the rest of your hours?</div>${lines(3)}</div>

    <div class="box b-blue">
      <div class="box-t font-heading">Where this goes next</div>
      Put your pre- and post-assessment side by side in your capstone portfolio. It is the cleanest piece of evidence you will have that this semester changed something.
    </div>`}
    ${sheetFoot(isPre ? 'Pre-Assessment' : 'Post-Assessment')}
  </div>`;
}

// ── one worksheet per activity ───────────────────────────────────────────────
function activitySheet(a, seq) {
  const toolNote = a.toolLink ? TOOL_NOTE[a.toolLink] : null;

  // Teaching content: keep "What we do in class" as context, render checklists as boxes.
  let context = '';
  a.sections.forEach((s) => {
    if (s.bullets.length) {
      context += `<div class="lbl font-heading">${esc(s.label)}</div><ul class="bul">`
        + s.bullets.map((b) => `<li>${esc(b)}</li>`).join('') + '</ul>';
    }
    if (s.checks.length) {
      context += `<div class="lbl font-heading">${esc(s.label)} &mdash; check each one off</div><ul class="chk">`
        + s.checks.map((c) => `<li>${esc(c)}</li>`).join('') + '</ul>';
    }
  });

  // Questions, in order. A .field-label followed by an input pairs into one question.
  let qs = '';
  const Q = a.questions;
  for (let i = 0; i < Q.length; i++) {
    const cur = Q[i];
    if (cur.kind === 'label') {
      const next = Q[i + 1];
      if (next && next.kind !== 'label') {
        const hint = next.text ? ` <span style="font-weight:400;color:#6b7280">&mdash; ${esc(next.text)}</span>` : '';
        qs += `<div class="q"><div class="q-t font-heading">${esc(cur.text)}${hint}</div>`
            + lines(next.kind === 'textarea' ? Math.max(2, next.rows + 1) : 1) + '</div>';
        i++;
      } else {
        qs += `<div class="q"><div class="q-t font-heading">${esc(cur.text)}</div>${lines(2)}</div>`;
      }
    } else if (cur.text) {
      qs += `<div class="q"><div class="q-t font-heading">${esc(cur.text)}</div>`
          + lines(cur.kind === 'textarea' ? Math.max(2, cur.rows + 1) : 1) + '</div>';
    }
  }
  if (!qs) {
    qs = `<div class="q"><div class="q-t font-heading">Notes</div>${lines(4)}</div>`;
  }

  return `
  <div class="sheet">
    <div class="wh">
      <div class="wh-num font-heading">${seq}</div>
      <div class="wh-t">
        <div class="wh-title font-heading">${esc(a.title)}</div>
        <div class="wh-sub">${esc(a.subtitle || '')}</div>
      </div>
      <div class="wh-meta">
        <div class="wh-phase font-heading">${esc(a.phase || '')}</div>
        <div class="wh-time font-heading">${esc(a.time || '')}</div>
      </div>
    </div>
    ${NAME_STRIP}
    ${context}
    ${toolNote ? `<div class="tool-note">${esc(toolNote)}</div>` : ''}
    <div class="lbl font-heading">${esc(a.czLabel || 'Your answers')} &mdash; turn this in</div>
    ${qs}
    ${sheetFoot(`Activity ${seq}`)}
  </div>`;
}

// ── build ────────────────────────────────────────────────────────────────────
function build(acts, skills, levels) {
  let h = head('Bootcamp Worksheets — Field Experience BHS');

  // Cover
  h += `
  <div class="sheet cover">
    <img src="https://res.cloudinary.com/dsbllwpbh/image/upload/v1770990807/field-study-logo-trans_kewube.png" alt="Field Experience">
    <div class="cover-eyebrow font-heading">Batavia High School</div>
    <h1 class="font-heading">Bootcamp<br>Worksheets</h1>
    <div class="cover-sub">Field Experience &middot; every activity, on paper</div>
    <div class="cover-rule"></div>
    <div class="cover-np">
      <div class="ns"><span class="ns-l font-heading">Name</span><span class="ns-line"></span></div>
      <div class="ns"><span class="ns-l font-heading">Class Period</span><span class="ns-line"></span></div>
    </div>
    <div class="cover-note">
      Keep this packet together &mdash; you will use it every day of bootcamp. Each worksheet is one activity, and the section at the bottom marked <strong>&ldquo;turn this in&rdquo;</strong> is what your teacher collects and scores.<br><br>
      <strong>Michael Theriault</strong> &middot; michael.theriault@bps101.net<br>
      <strong>Austun Savitski</strong> &middot; austun.savitski@bps101.net
    </div>
  </div>`;

  // Contents — sequence includes the two assessment worksheets in place.
  const seqTitles = [];
  acts.forEach((a, i) => {
    seqTitles.push({ n: i + 1, title: a.title, phase: a.phase });
  });

  h += `
  <div class="sheet">
    <div class="wh" style="border-bottom-width:2px">
      <div class="wh-t">
        <div class="wh-title font-heading">What's In This Packet</div>
        <div class="wh-sub">Sixteen worksheets, in the order you'll do them.</div>
      </div>
    </div>
    ${seqTitles.map((t) => `<div class="toc-row"><span class="toc-n font-heading">${t.n}</span><span class="toc-t font-heading">${esc(t.title)}</span><span class="toc-dots"></span><span class="toc-ph">${esc(t.phase)}</span></div>`).join('')}

    <div class="box b-red">
      <div class="box-t font-heading">Two rules for this packet</div>
      <strong>1. Don't lose it.</strong> Replacing a worksheet is easy; replacing your written answers is not.<br>
      <strong>2. Write in pen, in full sentences, on the lines.</strong> A one-word answer where a sentence was asked for scores a 2 &mdash; not because the handwriting matters, but because it shows you didn't engage with the question.
    </div>

    <div class="box b-gold">
      <div class="box-t font-heading">How each worksheet is scored</div>
      <strong>4</strong> &mdash; turned in on time and genuinely strong; went past the prompt.<br>
      <strong>3</strong> &mdash; turned in on time and complete. You did what was asked, properly. <em>This is the target.</em><br>
      <strong>2</strong> &mdash; late, or incomplete: missing sections, one-line answers, boxes unchecked.<br>
      <strong>1</strong> &mdash; barely attempted.<br>
      <strong>INC</strong> &mdash; nothing turned in. Recoverable until the quarter closes.
    </div>
    ${sheetFoot('Contents')}
  </div>`;

  // Worksheets — swap in the purpose-built assessment sheets where they belong.
  acts.forEach((a, i) => {
    if (a.toolLink === 'self-assessment.html?type=pre') {
      h += assessmentSheet('pre', skills, levels);
    } else if (a.toolLink === 'self-assessment.html?type=post') {
      h += assessmentSheet('post', skills, levels);
    } else {
      h += activitySheet(a, i + 1);
    }
  });

  return h + `
</main>
</body>
</html>
`;
}

async function main() {
  if (!fs.existsSync(CHROME_PATH)) throw new Error('Chrome not found at ' + CHROME_PATH);

  const { skills, levels } = readSkills();
  console.log(`Read ${skills.length} skills and ${levels.length} levels from self-assessment.html`);

  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const acts = await readActivities(browser);
  if (acts.length !== 16) {
    await browser.close();
    throw new Error(`Expected 16 activities from bootcamp.html, got ${acts.length}`);
  }
  const qTotal = acts.reduce((n, a) => n + a.questions.filter((q) => q.kind !== 'label').length, 0);
  console.log(`Read ${acts.length} activities and ${qTotal} answer fields from bootcamp.html`);

  const html = build(acts, skills, levels);
  fs.writeFileSync(path.join(REPO, OUT_HTML), html);
  console.log(`Wrote ${OUT_HTML}  (${(html.length / 1024).toFixed(1)} KB)`);

  if (!fs.existsSync(OUT_PDF_DIR)) fs.mkdirSync(OUT_PDF_DIR, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 816, height: 500 });
  await page.goto('file:///' + path.join(REPO, OUT_HTML).replace(/\\/g, '/'),
    { waitUntil: 'networkidle0', timeout: 30000 });
  await page.emulateMediaType('print');

  const outPath = path.join(OUT_PDF_DIR, 'Bootcamp Worksheets (student packet).pdf');
  await page.pdf({
    path: outPath, printBackground: true, format: 'Letter',
    margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
  });
  console.log(`Wrote ${outPath}  (${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`);

  await browser.close();
  console.log(`\nDone. PDF in: ${OUT_PDF_DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
