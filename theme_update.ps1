$dir = "C:\Users\mjthe\fieldexperienceBPS101"

$files = @(
  @{ f="skill-communication.html";  heroGrad="linear-gradient(135deg,#0a1628 0%,#0f2347 50%,#111827 100%)";  heroSub="Speak clearly, listen actively"; scLabel="color:#93c5fd";  fwBox="background:rgba(29,78,216,.08);border:1px solid rgba(29,78,216,.3)";    fwBoxNew="background:#eff6ff;border:1px solid #bfdbfe";    fwLbl='class="text-sm font-heading font-bold text-blue-300 mb-1"';       fwLblNew='class="text-sm font-heading font-bold mb-1" style="color:#1e40af"';  fwTxt="color:rgba(255,255,255,.65)"; hoverTxt="color:#fff;" },
  @{ f="skill-problemsolving.html"; heroGrad="linear-gradient(135deg,#0a1a12 0%,#122a1c 50%,#111827 100%)";  heroSub="Identify the real issue";     scLabel="color:#86efac"; fwBox="background:rgba(45,106,79,.08);border:1px solid rgba(45,106,79,.3)";    fwBoxNew="background:#f0fdf4;border:1px solid #bbf7d0";    fwLbl='class="text-sm font-heading font-bold mb-1" style="color:#86efac"'; fwLblNew='class="text-sm font-heading font-bold mb-1" style="color:#166534"'; fwTxt="color:rgba(255,255,255,.65)"; hoverTxt="color:#fff;" },
  @{ f="skill-decisionmaking.html"; heroGrad="linear-gradient(135deg,#1c1000 0%,#2d1a00 50%,#111827 100%)";  heroSub="Evaluate your options";       scLabel="color:#fcd34d"; fwBox="background:rgba(146,64,14,.08);border:1px solid rgba(146,64,14,.3)";   fwBoxNew="background:#fef3e2;border:1px solid #fed7aa";    fwLbl='class="text-sm font-heading font-bold text-yellow-400 mb-1"';      fwLblNew='class="text-sm font-heading font-bold mb-1" style="color:#92400e"'; fwTxt="color:rgba(255,255,255,.65)"; hoverTxt="color:#fff;" },
  @{ f="skill-criticalthinking.html";heroGrad="linear-gradient(135deg,#130820 0%,#1e0d35 50%,#111827 100%)"; heroSub="Question assumptions";        scLabel="color:#c4b5fd"; fwBox="background:rgba(91,33,182,.08);border:1px solid rgba(91,33,182,.3)";   fwBoxNew="background:#faf5ff;border:1px solid #ddd6fe";    fwLbl='class="text-sm font-heading font-bold text-purple-300 mb-1"';      fwLblNew='class="text-sm font-heading font-bold mb-1" style="color:#5b21b6"'; fwTxt="color:rgba(255,255,255,.65)"; hoverTxt="color:#fff;" },
  @{ f="skill-adaptability.html";   heroGrad="linear-gradient(135deg,#1a0508 0%,#2a0d12 50%,#111827 100%)";  heroSub="Adjust your approach";        scLabel="color:#f56d6f"; fwBox="background:rgba(172,22,29,.07);border:1px solid rgba(172,22,29,.25)";  fwBoxNew="background:#fff5f5;border:1px solid #fca5a5";    fwLbl='class="text-sm font-heading font-bold text-red-400 mb-1"';         fwLblNew='class="text-sm font-heading font-bold mb-1" style="color:#AC161D"'; fwTxt="color:rgba(255,255,255,.65)"; hoverTxt="color:#fff;" },
  @{ f="skill-initiative.html";     heroGrad="linear-gradient(135deg,#040d1a 0%,#0a1628 50%,#111827 100%)";  heroSub="Identify what needs to be";   scLabel="color:#93c5fd"; fwBox="background:rgba(26,58,92,.1);border:1px solid rgba(26,58,92,.4)";     fwBoxNew="background:#eff6ff;border:1px solid #bfdbfe";    fwLbl='class="text-sm font-heading font-bold text-blue-300 mb-1"';        fwLblNew='class="text-sm font-heading font-bold mb-1" style="color:#1a3a5c"'; fwTxt="color:rgba(255,255,255,.65)"; hoverTxt="color:#fff;" },
  @{ f="skill-reliability.html";    heroGrad="linear-gradient(135deg,#0a1a10 0%,#102415 50%,#111827 100%)";  heroSub="Show up, follow through";     scLabel="color:#86efac"; fwBox="background:rgba(45,106,79,.08);border:1px solid rgba(45,106,79,.3)";   fwBoxNew="background:#f0fdf4;border:1px solid #bbf7d0";    fwLbl='class="text-sm font-heading font-bold mb-1" style="color:#86efac"'; fwLblNew='class="text-sm font-heading font-bold mb-1" style="color:#166534"'; fwTxt="color:rgba(255,255,255,.65)"; hoverTxt="color:#fff;" },
  @{ f="skill-cultural.html";       heroGrad="linear-gradient(135deg,#161002 0%,#261a04 50%,#111827 100%)";  heroSub="Work effectively across";     scLabel="color:#fcd34d"; fwBox="background:rgba(146,64,14,.08);border:1px solid rgba(146,64,14,.3)";   fwBoxNew="background:#fef3e2;border:1px solid #fed7aa";    fwLbl='class="text-sm font-heading font-bold text-yellow-400 mb-1"';      fwLblNew='class="text-sm font-heading font-bold mb-1" style="color:#92400e"'; fwTxt="color:rgba(255,255,255,.65)"; hoverTxt="color:#fff;" }
)

foreach ($p in $files) {
  $path = Join-Path $dir $p.f
  $c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

  # ── CSS: body ──
  $c = $c.Replace("background:#0e1520;color:#fff;overflow-x:hidden}", "background:#f7f8fc;color:#1c1f2e;overflow-x:hidden}")

  # ── CSS: activity-card ──
  $c = $c.Replace(".activity-card{background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.1);border-radius:20px;padding:1.75rem;margin-bottom:1.5rem;}", ".activity-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:20px;padding:1.75rem;margin-bottom:1.5rem;}")

  # ── CSS: choice-btn default ──
  $c = $c.Replace("border:1.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.04);color:rgba(255,255,255,.8);font-family", "border:1.5px solid #e5e7eb;background:#fff;color:#374151;font-family")

  # ── CSS: choice-btn:hover text color ──
  $c = $c.Replace($p.hoverTxt + "}", "color:#1c1f2e;}")

  # ── CSS: choice-btn.chosen-right ──
  $c = $c.Replace(".choice-btn.chosen-right{border-color:#22c55e!important;background:rgba(34,197,94,.1)!important;color:#fff;}", ".choice-btn.chosen-right{border-color:#22c55e!important;background:rgba(34,197,94,.1)!important;color:#166534;}")

  # ── CSS: choice-btn.chosen-wrong ──
  $c = $c.Replace(".choice-btn.chosen-wrong{border-color:rgba(255,255,255,.2)!important;background:rgba(255,255,255,.02)!important;color:rgba(255,255,255,.45);}", ".choice-btn.chosen-wrong{border-color:#e5e7eb!important;background:#f9fafb!important;color:#9ca3af;}")

  # ── CSS: rubric-row border ──
  $c = $c.Replace("border-bottom:1px solid rgba(255,255,255,.06);}", "border-bottom:1px solid #e5e7eb;}")

  # ── CSS: submit-section ──
  $c = $c.Replace(".submit-section{background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.12);border-radius:20px;padding:2rem;}", ".submit-section{background:#fff;border:1.5px solid #e5e7eb;border-radius:20px;padding:2rem;}")

  # ── CSS: submit-input ──
  $c = $c.Replace("background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.15);border-radius:10px;padding:.75rem 1rem;color:#fff;font-family:'Open Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s;}", "background:#fff;border:1.5px solid #d1d5db;border-radius:10px;padding:.75rem 1rem;color:#1c1f2e;font-family:'Open Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s;}")

  # ── CSS: submit-input placeholder ──
  $c = $c.Replace(".submit-input::placeholder{color:rgba(255,255,255,.35);}", ".submit-input::placeholder{color:#9ca3af;}")

  # ── CSS: skill-nav-link ──
  $c = $c.Replace("background:rgba(255,255,255,.07);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1);}", "background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;}")
  $c = $c.Replace(".skill-nav-link:hover{background:rgba(255,255,255,.12);color:#fff;}", ".skill-nav-link:hover{background:#e5e7eb;color:#1c1f2e;}")

  # ── CSS: add overrides before </style> ──
  $c = $c.Replace("    .skill-nav-link:hover{background:#e5e7eb;color:#1c1f2e;}", "    .skill-nav-link:hover{background:#e5e7eb;color:#1c1f2e;}`n    .max-w-3xl.px-5 h2,.max-w-3xl.px-5 h3{color:#1c1f2e}`n    .max-w-3xl.px-5 .text-white{color:#1c1f2e}`n    .max-w-3xl.px-5 label{color:#1c1f2e}")

  # ── Hero gradient ──
  $c = $c.Replace($p.heroGrad, "linear-gradient(135deg,#1e2d3d 0%,#243447 100%)")

  # ── Hero subtitle: swap inline color for tailwind class so .6 global replace is safe ──
  # The hero subtitle always contains the heroSub fragment; find the p tag and change its color
  $c = $c.Replace('<p class="text-lg" style="color:rgba(255,255,255,.6)">' + $p.heroSub, '<p class="text-lg text-gray-300">' + $p.heroSub)

  # ── Scenario box background ──
  $c = $c.Replace('style="background:rgba(255,255,255,.05);border-left:4px solid', 'style="background:#f8fafc;border-left:4px solid')

  # ── Scenario label color (per-file accent → crimson) ──
  $c = $c.Replace('style="' + $p.scLabel + '"', 'style="color:#AC161D"')

  # ── Stat boxes ──
  $c = $c.Replace('style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)"', 'style="background:#f9fafb;border:1px solid #e5e7eb"')

  # ── Definition box ──
  $c = $c.Replace('style="background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.1)"', 'style="background:#fff;border:1.5px solid #e5e7eb"')

  # ── Framework quote box ──
  $c = $c.Replace($p.fwBox, $p.fwBoxNew)

  # ── Framework label class ──
  $c = $c.Replace($p.fwLbl, $p.fwLblNew)

  # ── Framework text color ──
  $c = $c.Replace($p.fwTxt, "color:#4b5563")

  # ── Inline rgba text colors (body) ──
  $c = $c.Replace('style="color:rgba(255,255,255,.8)"', 'style="color:#374151"')
  $c = $c.Replace('style="color:rgba(255,255,255,.75)"', 'style="color:#374151"')
  $c = $c.Replace('style="color:rgba(255,255,255,.7)"', 'style="color:#374151"')
  $c = $c.Replace('style="color:rgba(255,255,255,.6)"', 'style="color:#6b7280"')   # now safe - hero subtitle changed
  $c = $c.Replace('style="color:rgba(255,255,255,.55)"', 'style="color:#6b7280"')
  $c = $c.Replace('style="color:rgba(255,255,255,.4)"', 'style="color:#9ca3af"')   # footer .4 has extra props, won't match
  $c = $c.Replace('style="color:rgba(255,255,255,.35)"', 'style="color:#9ca3af"')
  $c = $c.Replace('style="color:rgba(255,255,255,.3)"', 'style="color:#9ca3af"')

  # ── Rubric container ──
  $c = $c.Replace('style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;"', 'style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;"')

  # ── Skill nav divider ──
  $c = $c.Replace('style="border-top:1px solid rgba(255,255,255,.08)"', 'style="border-top:1px solid #e5e7eb"')

  # ── Footer ──
  $c = $c.Replace('background:#111827;border-top:1px solid rgba(255,255,255,.08)', 'background:#1e2d3d;border-top:1px solid rgba(255,255,255,.1)')

  [System.IO.File]::WriteAllText($path, $c, [System.Text.Encoding]::UTF8)
  Write-Host "Done: $($p.f)"
}

Write-Host "All 8 skill pages updated."
