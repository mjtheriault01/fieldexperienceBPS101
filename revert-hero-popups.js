// node revert-hero-popups.js
// Removes BUSINESS_HEROES, partner-hero CSS, and new openJobModal,
// while keeping button shadow improvements and card onclick.
const fs = require('fs');

const FILES = [
  'cluster-agriculture.html',
  'cluster-arts.html',
  'cluster-finance.html',
  'cluster-health.html',
  'cluster-human.html',
  'cluster-it.html',
  'cluster-manufacturing.html',
];

// The partner-hero CSS block to remove (added after @keyframes spin)
const HERO_CSS_PATTERN = /\n    \.job-card\{cursor:pointer;\}\n    \/\* Partner hero in modal \*\/[\s\S]*?\.partner-hero-info\{position:absolute;bottom:0;left:0;right:0;padding:1\.5rem;z-index:2;\}\n/;

// Replace with just the cursor rule
const CURSOR_ONLY = '\n    .job-card{cursor:pointer;}\n';

// BUSINESS_HEROES block to remove
const HEROES_PATTERN = /\n\n  const BUSINESS_HEROES = \{[\s\S]*?\};\n/;

// New openJobModal to replace with the original
const NEW_MODAL_PATTERN = /  \/\/ ── JOB MODAL ─+\n  function openJobModal\(idx\) \{[\s\S]*?modal\.classList\.add\('active'\);\n  \}/;

function buildOriginalOpenModal(clusterColor) {
  return `  // ── JOB MODAL ─────────────────────────────────────────────────────────
  function openJobModal(idx) {
    const b = allBusinesses[idx];
    if (!b) return;
    const logoUrl = getLogoUrl(b);
    const isBpsModal = (b.name || '').toLowerCase().includes('bps');
    const modalLogoBg = isBpsModal ? '${clusterColor}' : '#ffffff';
    const logoHtml = logoUrl
      ? \`<img src="\${logoUrl}" alt="\${esc(b.name)}" class="h-10 max-w-[100px] object-contain" onerror="this.style.display='none'">\`
      : \`<span class="text-xl font-heading font-bold" style="color:${clusterColor}">\${initials(b.name)}</span>\`;

    const appMethods = b.appInstructions.split(',').map(s=>s.trim()).filter(Boolean);
    const appHtml = appMethods.length
      ? appMethods.map(m=>\`<li class="flex items-start gap-2 text-sm text-gray-600"><span class="font-bold mt-0.5 flex-shrink-0" style="color:${clusterColor}">→</span><span>\${esc(m)}</span></li>\`).join('')
      : '<li class="text-sm text-gray-600">Contact the mentor listed below.</li>';

    document.getElementById('job-modal-inner').innerHTML = \`
      <div class="text-white px-6 py-5 flex items-start justify-between gap-4" style="background:${clusterColor}">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 p-2" style="background:\${modalLogoBg}">\${logoHtml}</div>
          <div>
            <p class="text-xs uppercase tracking-widest font-semibold opacity-75 mb-0.5">\${esc(b.sector)}</p>
            <h2 class="font-heading text-xl font-bold leading-tight">\${esc(b.name)}</h2>
            <p class="text-sm opacity-85 mt-0.5">\${esc(b.role)}</p>
          </div>
        </div>
        <button onclick="closeJobModal()" class="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors mt-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="p-6 space-y-5 overflow-y-auto" style="max-height:calc(92vh - 110px)">

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          \${badge('💰','Pay', b.compensation)}
          \${badge('⏱','Hours/Wk', b.hours)}
          \${badge('🏢','Setting', b.environment)}
          \${badge('👥','Openings', b.numStudents)}
        </div>

        \${b.mission ? \`<div class="border-l-4 pl-4" style="border-color:${clusterColor}">
          <h3 class="font-heading font-bold text-sm uppercase tracking-wide text-navy-900 mb-1">About \${esc(b.name)}</h3>
          <p class="text-gray-600 text-sm leading-relaxed">\${esc(b.mission)}</p>
        </div>\` : ''}

        \${b.tasks ? \`<div>
          <h3 class="font-heading font-bold text-navy-900 mb-2 flex items-center gap-2">
            <span class="w-5 h-5 rounded text-white flex items-center justify-center text-xs font-bold" style="background:${clusterColor}">✓</span>
            What You'll Do
          </h3>
          <ul class="space-y-1.5">\${bulletLines(b.tasks)}</ul>
        </div>\` : ''}

        \${b.skills ? \`<div>
          <h3 class="font-heading font-bold text-navy-900 mb-2 flex items-center gap-2">
            <span class="w-5 h-5 rounded text-white flex items-center justify-center text-xs font-bold" style="background:${clusterColor}">★</span>
            Skills You'll Develop
          </h3>
          <ul class="space-y-1.5">\${bulletLines(b.skills)}</ul>
        </div>\` : ''}

        \${b.idealCandidate ? \`<div class="rounded-xl p-4" style="background:${clusterColor}12">
          <h3 class="font-heading font-bold text-sm text-navy-900 mb-1">Ideal Candidate</h3>
          <p class="text-sm text-gray-600 leading-relaxed">\${esc(b.idealCandidate)}</p>
        </div>\` : ''}

        \${b.specificReqs ? \`<div>
          <h3 class="font-heading font-bold text-navy-900 mb-2 flex items-center gap-2">
            <span class="w-5 h-5 rounded text-white flex items-center justify-center text-xs font-bold" style="background:${clusterColor}">!</span>
            Requirements
          </h3>
          <p class="text-sm text-gray-600">\${esc(b.specificReqs)}</p>
        </div>\` : ''}

        <div>
          <h3 class="font-heading font-bold text-navy-900 mb-2 flex items-center gap-2">
            <span class="w-5 h-5 rounded text-white flex items-center justify-center text-xs font-bold" style="background:${clusterColor}">→</span>
            How to Apply
          </h3>
          <ul class="space-y-1.5">\${appHtml}</ul>
        </div>

        \${b.appLink ? \`<a href="\${esc(b.appLink)}" target="_blank" rel="noopener"
          class="block w-full text-center py-3.5 rounded-xl font-heading font-bold text-sm tracking-wide text-white transition-all hover:opacity-90"
          style="background:${clusterColor}">Apply Now →</a>\` : ''}

        <div class="border-t border-gray-100 pt-4">
          <p class="text-xs text-gray-400 font-heading font-semibold uppercase tracking-wide mb-1">Primary Mentor</p>
          <p class="font-heading font-bold text-navy-900 text-sm">\${esc(b.mentorName)}</p>
          <a href="mailto:\${esc(b.mentorEmail)}" class="text-sm hover:underline" style="color:${clusterColor}">\${esc(b.mentorEmail)}</a>
        </div>

        \${b.website ? \`<a href="\${esc(b.website)}" target="_blank" rel="noopener" class="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          Visit \${esc(b.name)} Website
        </a>\` : ''}
      </div>\`;

    const modal = document.getElementById('modal-job');
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
    modal.offsetHeight;
    modal.classList.add('active');
  }`;
}

// Cluster colors
const COLORS = {
  'cluster-agriculture.html': '#2d6a4f',
  'cluster-arts.html':         '#7b2d8b',
  'cluster-finance.html':      '#1a3a5c',
  'cluster-health.html':       '#AC161D',
  'cluster-human.html':        '#c47a15',
  'cluster-it.html':           '#0f4c75',
  'cluster-manufacturing.html':'#5a3e1b',
};

for (const file of FILES) {
  let html = fs.readFileSync(file, 'utf8');

  // 1. Strip BUSINESS_HEROES
  html = html.replace(HEROES_PATTERN, '\n');

  // 2. Strip partner-hero CSS but keep cursor rule
  html = html.replace(HERO_CSS_PATTERN, CURSOR_ONLY);

  // 3. Replace new openJobModal with original
  const original = buildOriginalOpenModal(COLORS[file]);
  html = html.replace(NEW_MODAL_PATTERN, original);

  fs.writeFileSync(file, html, 'utf8');
  console.log(`✓ reverted popup from ${file}`);
}
console.log('Done.');
