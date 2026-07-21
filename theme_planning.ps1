$path = "C:\Users\mjthe\fieldexperienceBPS101\skill-planning.html"
$c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# ── CSS: body ──
$c = $c.Replace("background:#0e1520;color:#fff;overflow-x:hidden}", "background:#f7f8fc;color:#1c1f2e;overflow-x:hidden}")

# ── CSS: activity-card ──
$c = $c.Replace(".activity-card{background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.1);border-radius:20px;padding:1.75rem;margin-bottom:1.5rem;}", ".activity-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:20px;padding:1.75rem;margin-bottom:1.5rem;}")

# ── CSS: choice-btn default ──
$c = $c.Replace("border:1.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.04);color:rgba(255,255,255,.8);font-family", "border:1.5px solid #e5e7eb;background:#fff;color:#374151;font-family")

# ── CSS: choice-btn hover text ──
$c = $c.Replace(".choice-btn:hover{border-color:#0891b2;background:rgba(8,145,178,.1);color:#fff;}", ".choice-btn:hover{border-color:#0891b2;background:rgba(8,145,178,.1);color:#1c1f2e;}")

# ── CSS: chosen-right and chosen-wrong ──
$c = $c.Replace(".choice-btn.chosen-right{border-color:#22c55e!important;background:rgba(34,197,94,.1)!important;color:#fff;}", ".choice-btn.chosen-right{border-color:#22c55e!important;background:rgba(34,197,94,.1)!important;color:#166534;}")
$c = $c.Replace(".choice-btn.chosen-wrong{border-color:rgba(255,255,255,.2)!important;background:rgba(255,255,255,.02)!important;color:rgba(255,255,255,.45);}", ".choice-btn.chosen-wrong{border-color:#e5e7eb!important;background:#f9fafb!important;color:#9ca3af;}")

# ── CSS: rubric-row border ──
$c = $c.Replace("border-bottom:1px solid rgba(255,255,255,.06);}", "border-bottom:1px solid #e5e7eb;}")

# ── CSS: submit-section ──
$c = $c.Replace(".submit-section{background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.12);border-radius:20px;padding:2rem;}", ".submit-section{background:#fff;border:1.5px solid #e5e7eb;border-radius:20px;padding:2rem;}")

# ── CSS: submit-input ──
$c = $c.Replace("background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.15);border-radius:10px;padding:.75rem 1rem;color:#fff;font-family:'Open Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s;}", "background:#fff;border:1.5px solid #d1d5db;border-radius:10px;padding:.75rem 1rem;color:#1c1f2e;font-family:'Open Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s;}")
$c = $c.Replace(".submit-input::placeholder{color:rgba(255,255,255,.35);}", ".submit-input::placeholder{color:#9ca3af;}")

# ── CSS: skill-nav-link ──
$c = $c.Replace("background:rgba(255,255,255,.07);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1);}", "background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;}")
$c = $c.Replace(".skill-nav-link:hover{background:rgba(255,255,255,.12);color:#fff;}", ".skill-nav-link:hover{background:#e5e7eb;color:#1c1f2e;}")

# ── CSS: add section-wide overrides after skill-nav-link:hover ──
$c = $c.Replace(".skill-nav-link:hover{background:#e5e7eb;color:#1c1f2e;}", ".skill-nav-link:hover{background:#e5e7eb;color:#1c1f2e;}`n    section:not(:first-of-type) .text-white{color:#1c1f2e}`n    section:not(:first-of-type) label{color:#1c1f2e}")

# ── Hero gradient ──
$c = $c.Replace("linear-gradient(135deg,#051c20 0%,#092830 50%,#111827 100%)", "linear-gradient(135deg,#1e2d3d 0%,#243447 100%)")

# ── Hero subtitle ──
$c = $c.Replace('<p class="text-lg" style="color:rgba(255,255,255,.6)">Manage time, set priorities', '<p class="text-lg text-gray-300">Manage time, set priorities')

# ── Section backgrounds ──
$c = $c.Replace('<section style="background:#111827;padding:3rem 1.5rem">', '<section style="background:#fff;padding:3rem 1.5rem">')
$c = $c.Replace('<section style="background:#0e1520;padding:3rem 1.5rem">', '<section style="background:#f7f8fc;padding:3rem 1.5rem">')
$c = $c.Replace('<section style="background:#111827;padding:2.5rem 1.5rem">', '<section style="background:#fff;padding:2.5rem 1.5rem">')
$c = $c.Replace('<section style="background:#111827;padding:3rem 1.5rem 4rem">', '<section style="background:#fff;padding:3rem 1.5rem 4rem">')
$c = $c.Replace('style="background:#0e1520;padding:1.5rem;border-top:1px solid rgba(255,255,255,.06)"', 'style="background:#f0f4f8;padding:1.5rem;border-top:1px solid #e5e7eb"')

# ── Footer ──
$c = $c.Replace('style="background:#060d14;padding:1.5rem;text-align:center"', 'style="background:#1e2d3d;padding:1.5rem;text-align:center"')

# ── Scenario section: scenario box bg and text ──
$c = $c.Replace('style="background:rgba(14,116,144,.1);border:1.5px solid rgba(14,116,144,.3);border-radius:16px;padding:1.75rem 2rem"', 'style="background:#e8f7f9;border:1.5px solid #a5d8e0;border-radius:16px;padding:1.75rem 2rem"')
$c = $c.Replace('style="color:rgba(255,255,255,.8)">Update the inventory', 'style="color:#374151">Update the inventory')
$c = $c.Replace('style="color:rgba(255,255,255,.8)">Go through the general', 'style="color:#374151">Go through the general')
$c = $c.Replace('style="color:rgba(255,255,255,.8)">Print and organize', 'style="color:#374151">Print and organize')
$c = $c.Replace('style="color:rgba(255,255,255,.65)">You have five hours', 'style="color:#4b5563">You have five hours')

# ── Priority tag colors (keep bg/border but change text to dark-on-light) ──
$c = $c.Replace('style="background:rgba(239,68,68,.15);color:#fca5a5;border:1px solid rgba(239,68,68,.3)"', 'style="background:rgba(239,68,68,.12);color:#991b1b;border:1px solid rgba(239,68,68,.3)"')
$c = $c.Replace('style="background:rgba(251,191,36,.1);color:#fde68a;border:1px solid rgba(251,191,36,.25)"', 'style="background:rgba(251,191,36,.12);color:#92400e;border:1px solid rgba(251,191,36,.4)"')
$c = $c.Replace('style="background:rgba(59,130,246,.12);color:#93c5fd;border:1px solid rgba(59,130,246,.25)"', 'style="background:rgba(59,130,246,.1);color:#1d4ed8;border:1px solid rgba(59,130,246,.3)"')

# ── Framework section: teal boxes → light ──
$c = $c.Replace('style="background:rgba(14,116,144,.08);border:1.5px solid rgba(14,116,144,.2);border-radius:16px;padding:1.5rem"', 'style="background:#e8f7f9;border:1.5px solid #a5d8e0;border-radius:16px;padding:1.5rem"')

# ── Framework circle numbers: add inline white text (CSS override would make them dark) ──
$c = $c.Replace('"w-10 h-10 rounded-full flex items-center justify-center mb-3 font-heading font-black text-white text-lg" style="background:#0e7490"', '"w-10 h-10 rounded-full flex items-center justify-center mb-3 font-heading font-black text-lg" style="background:#0e7490;color:#fff"')

# ── Framework card inline text colors ──
$c = $c.Replace('style="color:rgba(255,255,255,.55)">If you miss this', 'style="color:#4b5563">If you miss this')
$c = $c.Replace('style="color:rgba(255,255,255,.55)">Even with no stated', 'style="color:#4b5563">Even with no stated')
$c = $c.Replace('style="color:rgba(255,255,255,.55)">This isn', 'style="color:#4b5563">This isn')

# ── Framework "Why not" box ──
$c = $c.Replace('style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:1.25rem 1.5rem"', 'style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1.25rem 1.5rem"')
$c = $c.Replace('style="color:rgba(255,255,255,.6)">It feels productive', 'style="color:#4b5563">It feels productive')

# ── Stats section: teal boxes ──
$c = $c.Replace('style="background:rgba(14,116,144,.08);border:1px solid rgba(14,116,144,.2);border-radius:14px"', 'style="background:#e8f7f9;border:1px solid #a5d8e0;border-radius:14px"')
$c = $c.Replace('style="color:rgba(255,255,255,.5)">of managers say', 'style="color:#4b5563">of managers say')
$c = $c.Replace('style="color:rgba(255,255,255,.5)">skill gap ranked', 'style="color:#4b5563">skill gap ranked')
$c = $c.Replace('style="color:rgba(255,255,255,.5)">more likely to be', 'style="color:#4b5563">more likely to be')

# ── Activity 1 section ──
$c = $c.Replace('style="color:rgba(255,255,255,.6)">Back to the scenario', 'style="color:#4b5563">Back to the scenario')

# ── Activity 1 feedback inline colors (in onclick JS strings) ──
$c = $c.Replace("style=\'color:rgba(255,255,255,.5)\'", "style=\'color:#4b5563\'")

# ── Activity 2 section ──
$c = $c.Replace('style="color:rgba(255,255,255,.6)">Good planning isn', 'style="color:#4b5563">Good planning isn')
$c = $c.Replace('style="color:rgba(255,255,255,.5)">Think through: What time', 'style="color:#4b5563">Think through: What time')

# ── Activity 2 prompts box ──
$c = $c.Replace('style="background:rgba(14,116,144,.08);border:1px solid rgba(14,116,144,.2);border-radius:12px;padding:1.25rem 1.5rem;margin-bottom:1.25rem"', 'style="background:#e8f7f9;border:1px solid #a5d8e0;border-radius:12px;padding:1.25rem 1.5rem;margin-bottom:1.25rem"')
$c = $c.Replace('style="color:rgba(255,255,255,.65)">', 'style="color:#4b5563">')
$c = $c.Replace('style="color:rgba(255,255,255,.4)">Your first Monday', 'style="color:#9ca3af">Your first Monday')

# ── Rubric section ──
$c = $c.Replace('style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:1.5rem"', 'style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;padding:1.5rem"')
# Rubric num 1 (dark gray bg with pale text)
$c = $c.Replace('style="background:#1c1c1c;color:rgba(255,255,255,.4)">1</div>', 'style="background:#e5e7eb;color:#6b7280">1</div>')
# Rubric num 2 (red-tinted)
$c = $c.Replace('style="background:rgba(239,68,68,.15);color:#fca5a5">', 'style="background:rgba(239,68,68,.12);color:#991b1b">')
# Rubric num 3 (gold-tinted)
$c = $c.Replace('style="background:rgba(251,205,7,.15);color:#fde68a">', 'style="background:rgba(251,205,7,.12);color:#92400e">')
# Rubric num 4 (green-tinted)
$c = $c.Replace('style="background:rgba(34,197,94,.15);color:#86efac">', 'style="background:rgba(34,197,94,.12);color:#166534">')
# Rubric row text
$c = $c.Replace('style="color:rgba(255,255,255,.5)">Tasks are completed', 'style="color:#4b5563">Tasks are completed')
$c = $c.Replace('style="color:rgba(255,255,255,.5)">Shows awareness', 'style="color:#4b5563">Shows awareness')
$c = $c.Replace('style="color:rgba(255,255,255,.5)">Consistently prioritizes', 'style="color:#4b5563">Consistently prioritizes')
$c = $c.Replace('style="color:rgba(255,255,255,.5)">Plans ahead for', 'style="color:#4b5563">Plans ahead for')

# ── Completion section ──
$c = $c.Replace('style="color:rgba(255,255,255,.6)">Answer the reflection', 'style="color:#4b5563">Answer the reflection')
$c = $c.Replace('style="color:rgba(255,255,255,.4)">Describe a time', 'style="color:#6b7280">Describe a time')
$c = $c.Replace('style="color:rgba(255,255,255,.3)">A Google Form will open', 'style="color:#9ca3af">A Google Form will open')

# ── Skill nav "All 10 Skills" link: teal on light bg needs darker text ──
$c = $c.Replace('style="background:rgba(14,116,144,.15);border-color:rgba(14,116,144,.3);color:#67e8f9"', 'style="background:rgba(14,116,144,.12);border-color:rgba(14,116,144,.4);color:#0e7490"')

# ── Footer text ──
# Footer color stays (it's on dark bg)

[System.IO.File]::WriteAllText($path, $c, [System.Text.Encoding]::UTF8)
Write-Host "skill-planning.html updated."
