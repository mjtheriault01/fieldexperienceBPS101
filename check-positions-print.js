// node check-positions-print.js
//
// Verifies the one-page-per-job-description guarantee on positions.html.
// Every position card must fit inside a single Letter page in print mode; run this
// after adding or editing a position, because a longer task list is what would
// eventually push a card onto a second sheet.
//
// Exits non-zero if any card overflows, so it can gate a deploy.
//
// Usage:
//   node check-positions-print.js                      (uses the live site)
//   POSITIONS_URL=http://localhost:8000/positions.html node check-positions-print.js

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.env.POSITIONS_URL || 'https://fieldexperiencebps101.net/positions.html';

// positions.html sets @page margin 0.35in on Letter (816 x 1056 px at 96dpi).
const MARGIN_PX = Math.round(0.35 * 96);
const PAGE_W = 816 - MARGIN_PX * 2;   // 748
const PAGE_H = 1056 - MARGIN_PX * 2;  // 988

async function main() {
  if (!fs.existsSync(CHROME_PATH)) throw new Error('Chrome not found at ' + CHROME_PATH);

  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: PAGE_W, height: PAGE_H });
  // Not networkidle0: the live page keeps a Supabase connection open and never
  // reaches it. Wait for the cards themselves, then let fonts settle.
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('.position-card', { timeout: 20000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await new Promise((r) => setTimeout(r, 600));
  await page.emulateMediaType('print');

  const cards = await page.evaluate(() => Array.from(document.querySelectorAll('.position-card')).map((el, i) => {
    const h2 = el.querySelector('h2');
    return {
      i,
      h: Math.round(el.getBoundingClientRect().height),
      name: h2 ? h2.textContent.trim() : `card ${i}`,
      breakAfter: getComputedStyle(el).breakAfter,
    };
  }));

  // Every card but the last must force a page break after itself, or the next card
  // shares its page. A total page count does NOT catch this — cards doubling up and
  // stray blank pages cancel out — so check the rule on each card directly.
  const noBreak = cards.filter((c, i) => i < cards.length - 1 && c.breakAfter !== 'page');
  const lastCard = cards[cards.length - 1];
  const trailingBreak = lastCard && lastCard.breakAfter === 'page' ? lastCard : null;

  // Also confirm print-all renders exactly one PDF page per card.
  const tmpPdf = path.join(require('os').tmpdir(), 'positions-print-check.pdf');
  await page.pdf({
    path: tmpPdf, printBackground: true, format: 'Letter',
    margin: { top: '0.35in', right: '0.35in', bottom: '0.35in', left: '0.35in' },
  });
  const pdfPages = (fs.readFileSync(tmpPdf).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  fs.unlinkSync(tmpPdf);

  await browser.close();

  console.log(`Checking ${cards.length} position cards against one Letter page (${PAGE_W}x${PAGE_H}px)\n`);
  const over = cards.filter((c) => c.h > PAGE_H);
  cards.sort((a, b) => b.h - a.h).forEach((c) => {
    const pct = Math.round((c.h / PAGE_H) * 100);
    const flag = c.h > PAGE_H ? `  OVERFLOWS by ${c.h - PAGE_H}px` : (pct > 90 ? '  (tight)' : '');
    console.log(`  ${String(c.h).padStart(4)}px  ${String(pct).padStart(3)}%  ${c.name}${flag}`);
  });

  const tallest = cards[0];
  console.log(`\nTallest: ${tallest.name} at ${tallest.h}px (${Math.round((tallest.h / PAGE_H) * 100)}% of a page)`);
  console.log(`Page breaks: ${cards.length - 1 - noBreak.length}/${cards.length - 1} cards force the next onto a new page` +
    (noBreak.length ? ' — MISSING BREAKS' : ' — correct'));
  console.log(`Print-all output: ${pdfPages} PDF pages for ${cards.length} cards ` +
    (pdfPages === cards.length ? '— 1:1, correct' : '— MISMATCH'));

  if (over.length || noBreak.length || trailingBreak || pdfPages !== cards.length) {
    console.error('\nFAIL:');
    if (over.length) {
      console.error(`  ${over.length} card(s) exceed one page:`);
      over.forEach((c) => console.error(`    - ${c.name}`));
      console.error('  Fix by shortening the position\'s task list/description, or by tightening the\n' +
        '  "Compress each card to fit one page" block in positions.html\'s @media print rules.');
    }
    if (noBreak.length) {
      console.error(`  ${noBreak.length} card(s) do not start a new page — the card after each shares its sheet:`);
      noBreak.forEach((c) => console.error(`    - ${c.name} (break-after: ${c.breakAfter})`));
      console.error('  Only .position-card.print-last may skip its break. Check markLastCard()\n' +
        '  in positions.html is tagging exactly one card.');
    }
    if (trailingBreak) {
      console.error(`  The last card (${trailingBreak.name}) still forces a break — that emits a blank final page.`);
    }
    if (pdfPages !== cards.length) {
      console.error(`  Print-all produced ${pdfPages} pages for ${cards.length} cards.`);
    }
    process.exit(1);
  }
  console.log('\nPASS: every job description fits on exactly one page, and starts its own page.');
}

main().catch((e) => { console.error(e); process.exit(1); });
