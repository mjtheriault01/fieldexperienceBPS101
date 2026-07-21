// node inject-hero-urls.js
const fs = require('fs');

const urls = JSON.parse(fs.readFileSync('partner-hero-urls.json', 'utf8'));

const OLD = `  const BUSINESS_HEROES = {
    'bps101 business office':       '',
    'bps101 athletics':             '',
    'bps101 superintendent office': '',
    'bps101 athletic training':     '',
    'bps101 nursing':               '',
    'batavia public library':       '',
    'organic life':                 '',
    'bps101 building & grounds':    '',
    'bps101 technology dept.':      '',
  };`;

const NEW = `  const BUSINESS_HEROES = {
    'bps101 business office':       '${urls['bps-business-office']}',
    'bps101 athletics':             '${urls['bps-athletics']}',
    'bps101 superintendent office': '${urls['bps-superintendent']}',
    'bps101 athletic training':     '${urls['bps-athletic-training']}',
    'bps101 nursing':               '${urls['bps-nursing']}',
    'batavia public library':       '${urls['batavia-library']}',
    'organic life':                 '${urls['organic-life']}',
    'bps101 building & grounds':    '${urls['bps-building-grounds']}',
    'bps101 technology dept.':      '${urls['bps-technology']}',
  };`;

const FILES = [
  'cluster-agriculture.html',
  'cluster-arts.html',
  'cluster-finance.html',
  'cluster-health.html',
  'cluster-human.html',
  'cluster-it.html',
  'cluster-manufacturing.html',
];

for (const file of FILES) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes(OLD)) {
    console.log(`  SKIP ${file} (already updated or not found)`);
    continue;
  }
  html = html.replace(OLD, NEW);
  fs.writeFileSync(file, html, 'utf8');
  console.log(`  ✓ ${file}`);
}
console.log('Done.');
