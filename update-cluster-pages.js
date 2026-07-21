// node update-cluster-pages.js
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

const PARTNER_HERO_CSS = `
    /* Partner hero in modal */
    .partner-hero{position:relative;height:230px;overflow:hidden;flex-shrink:0;}
    .partner-hero-inner{position:absolute;inset:-8%;width:116%;height:116%;background-size:cover;background-position:center;will-change:transform;}
    .partner-hero-gradient{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.06) 0%,rgba(0,0,0,0.72) 100%);z-index:1;}
    .partner-hero-close{position:absolute;top:14px;right:14px;z-index:10;width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,0.38);backdrop-filter:blur(6px);border:1.5px solid rgba(255,255,255,0.22);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;}
    .partner-hero-close:hover{background:rgba(0,0,0,0.62);}
    .partner-hero-info{position:absolute;bottom:0;left:0;right:0;padding:1.5rem;z-index:2;}
`;

const BUSINESS_HEROES_JS = `
  const BUSINESS_HEROES = {
    'bps101 business office':       '',
    'bps101 athletics':             '',
    'bps101 superintendent office': '',
    'bps101 athletic training':     '',
    'bps101 nursing':               '',
    'batavia public library':       '',
    'organic life':                 '',
    'bps101 building & grounds':    '',
    'bps101 technology dept.':      '',
  };
`;

// Updated openJobModal function body (inserted wholesale)
const NEW_OPEN_JOB_MODAL = `  function openJobModal(idx) {
    const b = allBusinesses[idx];
    if (!b) return;
    const logoUrl = getLogoUrl(b);
    const isBpsModal = (b.name || '').toLowerCase().includes('bps');
    const modalLogoBg = isBpsModal ? CLUSTER_COLOR : '#ffffff';
    const logoHtml = logoUrl
      ? \`<img src="\${logoUrl}" alt="\${esc(b.name)}" class="h-10 max-w-[100px] object-contain" onerror="this.style.display='none'">\`
      : \`<span class="text-xl font-heading font-bold" style="color:\${CLUSTER_COLOR}">\${initials(b.name)}</span>\`;

    const heroUrl = BUSINESS_HEROES[(b.name||'').toLowerCase().trim()] || '';
    const appMethods = b.appInstructions.split(',').map(s=>s.trim()).filter(Boolean);
    const appHtml = appMethods.length
      ? appMethods.map(m=>\`<li class="flex items-start gap-2 text-sm text-gray-600"><span class="font-bold mt-0.5 flex-shrink-0" style="color:\${CLUSTER_COLOR}">→</span><span>\${esc(m)}</span></li>\`).join('')
      : '<li class="text-sm text-gray-600">Contact the mentor listed below.</li>';

    const heroSection = heroUrl
      ? \`<div class="partner-hero">
          <div class="partner-hero-inner" style="background-image:url('\${heroUrl}');animation:kb-zoom-in 14s ease-in-out infinite alternate;"></div>
          <div class="partner-hero-gradient"></div>
          <button onclick="closeJobModal()" class="partner-hero-close" aria-label="Close">
            <svg class="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <div class="partner-hero-info">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 p-1.5 shadow-lg" style="background:\${modalLogoBg}">\${logoHtml}</div>
              <div>
                <span class="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider mb-1.5 font-heading" style="background:rgba(255,255,255,0.18);color:rgba(255,255,255,0.92)">\${esc(b.sector)}</span>
                <h2 class="font-heading text-xl font-black text-white leading-tight" style="text-shadow:0 1px 12px rgba(0,0,0,0.5)">\${esc(b.name)}</h2>
                <p class="text-sm font-semibold mt-0.5" style="color:rgba(255,255,255,0.85);text-shadow:0 1px 6px rgba(0,0,0,0.4)">\${esc(b.role)}</p>
              </div>
            </div>
          </div>
        </div>\`
      : \`<div class="text-white px-6 py-5 flex items-start justify-between gap-4" style="background:\${CLUSTER_COLOR}">
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
        </div>\`;

    const bodyMaxH = heroUrl ? 'calc(92vh - 240px)' : 'calc(92vh - 110px)';

    document.getElementById('job-modal-inner').innerHTML = \`
      \${heroSection}
      <div class="p-6 space-y-5 overflow-y-auto" style="max-height:\${bodyMaxH}">

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          \${badge('💰','Pay', b.compensation)}
          \${badge('⏱','Hours/Wk', b.hours)}
          \${badge('🏢','Setting', b.environment)}
          \${badge('👥','Openings', b.numStudents)}
        </div>

        \${b.mission ? \`<div class="border-l-4 pl-4" style="border-color:\${CLUSTER_COLOR}">
          <h3 class="font-heading font-bold text-sm uppercase tracking-wide text-navy-900 mb-1">About \${esc(b.name)}</h3>
          <p class="text-gray-600 text-sm leading-relaxed">\${esc(b.mission)}</p>
        </div>\` : ''}

        \${b.tasks ? \`<div>
          <h3 class="font-heading font-bold text-navy-900 mb-2 flex items-center gap-2">
            <span class="w-5 h-5 rounded text-white flex items-center justify-center text-xs font-bold" style="background:\${CLUSTER_COLOR}">✓</span>
            What You'll Do
          </h3>
          <ul class="space-y-1.5">\${bulletLines(b.tasks)}</ul>
        </div>\` : ''}

        \${b.skills ? \`<div>
          <h3 class="font-heading font-bold text-navy-900 mb-2 flex items-center gap-2">
            <span class="w-5 h-5 rounded text-white flex items-center justify-center text-xs font-bold" style="background:\${CLUSTER_COLOR}">★</span>
            Skills You'll Develop
          </h3>
          <ul class="space-y-1.5">\${bulletLines(b.skills)}</ul>
        </div>\` : ''}

        \${b.idealCandidate ? \`<div class="rounded-xl p-4" style="background:\${CLUSTER_COLOR}12">
          <h3 class="font-heading font-bold text-sm text-navy-900 mb-1">Ideal Candidate</h3>
          <p class="text-sm text-gray-600 leading-relaxed">\${esc(b.idealCandidate)}</p>
        </div>\` : ''}

        \${b.specificReqs ? \`<div>
          <h3 class="font-heading font-bold text-navy-900 mb-2 flex items-center gap-2">
            <span class="w-5 h-5 rounded text-white flex items-center justify-center text-xs font-bold" style="background:\${CLUSTER_COLOR}">!</span>
            Requirements
          </h3>
          <p class="text-sm text-gray-600">\${esc(b.specificReqs)}</p>
        </div>\` : ''}

        <div>
          <h3 class="font-heading font-bold text-navy-900 mb-2 flex items-center gap-2">
            <span class="w-5 h-5 rounded text-white flex items-center justify-center text-xs font-bold" style="background:\${CLUSTER_COLOR}">→</span>
            How to Apply
          </h3>
          <ul class="space-y-1.5">\${appHtml}</ul>
        </div>

        \${b.appLink ? \`<a href="\${esc(b.appLink)}" target="_blank" rel="noopener"
          class="block w-full text-center py-3.5 rounded-xl font-heading font-bold text-sm tracking-wide text-white transition-all hover:opacity-90"
          style="background:\${CLUSTER_COLOR}">Apply Now →</a>\` : ''}

        <div class="border-t border-gray-100 pt-4">
          <p class="text-xs text-gray-400 font-heading font-semibold uppercase tracking-wide mb-1">Primary Mentor</p>
          <p class="font-heading font-bold text-navy-900 text-sm">\${esc(b.mentorName)}</p>
          <a href="mailto:\${esc(b.mentorEmail)}" class="text-sm hover:underline" style="color:\${CLUSTER_COLOR}">\${esc(b.mentorEmail)}</a>
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

for (const file of FILES) {
  let html = fs.readFileSync(file, 'utf8');
  let changed = 0;

  // 1. Add box-shadow to .apply-btn base (insert before the closing }) of .apply-btn
  // The base rule ends with: transition:all .2s ease;margin-top:auto;\n    }
  if (!html.includes('box-shadow:0 4px 14px')) {
    html = html.replace(
      /\.apply-btn\{([^}]+)transition:all \.2s ease;margin-top:auto;\n    \}/,
      (m, inner) => `.apply-btn{${inner}box-shadow:0 4px 14px rgba(0,0,0,0.22);transition:all .2s ease;margin-top:auto;\n    }`
    );
    changed++;
  }

  // 2. Replace .apply-btn:hover (the whole line)
  html = html.replace(
    '    .apply-btn:hover{opacity:.88;transform:translateY(-1px);}',
    `    .apply-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,0.30);filter:brightness(1.08);}
    .apply-btn:active{transform:translateY(0) scale(0.98);box-shadow:0 2px 8px rgba(0,0,0,0.18);transition-duration:.08s;}`
  );
  changed++;

  // 3. Add partner hero CSS + make job-card cursor pointer, after @keyframes spin
  if (!html.includes('partner-hero')) {
    html = html.replace(
      '    @keyframes spin{to{transform:rotate(360deg)}}',
      '    @keyframes spin{to{transform:rotate(360deg)}}\n    .job-card{cursor:pointer;}' + PARTNER_HERO_CSS
    );
    changed++;
  }

  // 4. Add BUSINESS_HEROES after sheetLoaded
  if (!html.includes('BUSINESS_HEROES')) {
    html = html.replace(
      '  let allBusinesses = STATIC_BUSINESSES;\n  let sheetLoaded = false;',
      '  let allBusinesses = STATIC_BUSINESSES;\n  let sheetLoaded = false;\n' + BUSINESS_HEROES_JS
    );
    changed++;
  }

  // 5. Make job card clickable: add onclick to the card div
  html = html.replace(
    '        <div class="job-card">',
    '        <div class="job-card" onclick="openJobModal(${b.idx})">'
  );
  changed++;

  // 6. Remove onclick from the inner button (card handles it now), change to div
  html = html.replace(
    '          <button class="apply-btn" onclick="openJobModal(${b.idx})">View Full Position →</button>',
    '          <div class="apply-btn">View Full Position →</div>'
  );
  changed++;

  // 7. Replace openJobModal function
  html = html.replace(
    /  \/\/ ── JOB MODAL ─+\n  function openJobModal\(idx\) \{[\s\S]*?modal\.classList\.add\('active'\);\n  \}/,
    '  // ── JOB MODAL ─────────────────────────────────────────────────────────\n' + NEW_OPEN_JOB_MODAL
  );
  changed++;

  fs.writeFileSync(file, html, 'utf8');
  console.log(`✓ ${file} (${changed} changes)`);
}
console.log('\nAll done. Run: node generate-partner-heroes.js next.');
