// node generate-positions-pdf.js
// Generates real PDFs from positions.html's live data — one combined packet
// (all positions, one per page) and one individual PDF per company — using
// headless Chrome's native print-to-PDF instead of relying on a user's
// browser print dialog. Reuses positions.html's own @media print CSS as-is.
//
// Requires: npm install puppeteer-core --no-save   (already run once)
// Requires: local Chrome install at the CHROME_PATH below

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SITE_URL = process.env.POSITIONS_PDF_SOURCE || 'https://fieldexperiencebps101.net/positions.html';
const OUT_DIR = path.join(require('os').homedir(), 'Downloads', 'Job Description PDFs');

function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '').trim();
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const page = await browser.newPage();
  // Width matches the already-tuned print CSS's reflow target. Height is kept
  // short on purpose: Chrome's root <html> element always fills at least the
  // viewport height by default, and combined with preferCSSPageSize that
  // phantom empty space was spilling onto a blank trailing page. Using an
  // explicit format+margin below (instead of preferCSSPageSize) avoids that
  // Chromium quirk entirely.
  await page.setViewport({ width: 816, height: 400 });
  await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('.position-card', { timeout: 15000 });
  await page.emulateMediaType('print');

  const PDF_OPTS = {
    printBackground: true,
    format: 'Letter',
    margin: { top: '0.35in', right: '0.35in', bottom: '0.35in', left: '0.35in' },
  };

  const positions = await page.evaluate(() =>
    allPositions.map((b, idx) => ({ idx, name: b.name }))
  );
  console.log(`Found ${positions.length} positions.`);

  // ── Combined packet: all positions, one per page (matches "Print All Positions") ──
  const packetPath = path.join(OUT_DIR, 'All Field Experience Positions.pdf');
  await page.pdf({ path: packetPath, ...PDF_OPTS });
  console.log('Wrote: ' + packetPath);

  // ── Individual PDFs: one per company (matches each card's "Print / Save as PDF") ──
  for (const { idx, name } of positions) {
    await page.evaluate((i) => {
      const card = document.getElementById(`card-${i}`);
      card.id = 'card-print-target';
      document.body.classList.add('print-one');
    }, idx);

    const filePath = path.join(OUT_DIR, `${sanitize(name)}.pdf`);
    await page.pdf({ path: filePath, ...PDF_OPTS });
    console.log('Wrote: ' + filePath);

    await page.evaluate((i) => {
      document.getElementById('card-print-target').id = `card-${i}`;
      document.body.classList.remove('print-one');
    }, idx);
  }

  await browser.close();
  console.log(`\nDone. ${positions.length + 1} PDFs in: ${OUT_DIR}`);
}

main().catch(err => { console.error(err); process.exit(1); });
