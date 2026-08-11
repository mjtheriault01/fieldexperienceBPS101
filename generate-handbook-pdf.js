// node generate-handbook-pdf.js
//
// Renders the student-facing print documents to PDF with headless Chrome, using
// each page's own @media print CSS. These are the day-one packet handouts.
//
// Requires: puppeteer-core + local Chrome (same setup as generate-positions-pdf.js)

const fs = require('fs');
const path = require('path');
const os = require('os');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REPO = __dirname;
const OUT_DIR = path.join(os.homedir(), 'Downloads', 'Field Experience Bootcamp');

const DOCS = [
  { file: 'handbook.html',        pdf: 'Field Experience Handbook.pdf',        footer: false },
  { file: 'capstone-rubric.html', pdf: 'Capstone Rubric.pdf',                  footer: true  },
  { file: 'portfolio-guide.html', pdf: 'Portfolio Guide.pdf',                  footer: true  },
  { file: 'syllabus.html',        pdf: 'Course Syllabus.pdf',                  footer: true  },
  { file: 'teacher-grading.html', pdf: 'Grading Policy (Teacher).pdf',         footer: true  },
];

async function main() {
  if (!fs.existsSync(CHROME_PATH)) throw new Error('Chrome not found at ' + CHROME_PATH);
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 816, height: 500 });

  for (const d of DOCS) {
    const src = path.join(REPO, d.file);
    if (!fs.existsSync(src)) { console.log(`skip (missing): ${d.file}`); continue; }

    await page.goto('file:///' + src.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 30000 });
    await page.emulateMediaType('print');

    const opts = {
      path: path.join(OUT_DIR, d.pdf),
      printBackground: true,
      format: 'Letter',
      margin: { top: '0.55in', right: '0.55in', bottom: '0.55in', left: '0.55in' },
    };
    // The handbook carries its own per-page footers, so skip Chrome's.
    if (d.footer) {
      opts.displayHeaderFooter = true;
      opts.headerTemplate = '<div></div>';
      opts.footerTemplate = `<div style="width:100%;font-family:Montserrat,Arial,sans-serif;font-size:7pt;color:#9ca3af;padding:0 .55in;display:flex;justify-content:space-between">
        <span>Field Experience · ${d.pdf.replace(/\.pdf$/, '')}</span><span class="pageNumber"></span></div>`;
    }

    await page.pdf(opts);
    const kb = (fs.statSync(opts.path).size / 1024).toFixed(0);
    console.log(`Wrote ${d.pdf}  (${kb} KB)`);
  }

  await browser.close();
  console.log(`\nDone. PDFs in: ${OUT_DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
