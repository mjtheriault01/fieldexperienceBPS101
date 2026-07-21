$dir = "C:\Users\mjthe\fieldexperienceBPS101"

# Files needing the CSS override injection and nav-link hover fix
$skillFiles = @(
  "skill-communication.html","skill-problemsolving.html","skill-decisionmaking.html",
  "skill-criticalthinking.html","skill-adaptability.html","skill-initiative.html",
  "skill-reliability.html","skill-cultural.html"
)

foreach ($f in $skillFiles) {
  $path = Join-Path $dir $f
  $c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

  # Fix skill-nav-link:hover background (rgba was left because order-of-ops issue)
  $c = $c.Replace(".skill-nav-link:hover{background:rgba(255,255,255,.12);color:#1c1f2e;}", ".skill-nav-link:hover{background:#e5e7eb;color:#1c1f2e;}")

  # Inject CSS overrides before </style> — add after .email-example if present, else after skill-nav-link:hover
  if (-not $c.Contains(".max-w-3xl.px-5 h2")) {
    $inject = "`n    .max-w-3xl.px-5 h2,.max-w-3xl.px-5 h3{color:#1c1f2e}`n    .max-w-3xl.px-5 .text-white{color:#1c1f2e}`n    .max-w-3xl.px-5 label{color:#1c1f2e}"
    $c = $c.Replace(".skill-nav-link:hover{background:#e5e7eb;color:#1c1f2e;}", ".skill-nav-link:hover{background:#e5e7eb;color:#1c1f2e;}" + $inject)
  }

  [System.IO.File]::WriteAllText($path, $c, [System.Text.Encoding]::UTF8)
  Write-Host "Fixed: $f"
}

# Extra fix for skill-communication.html: email example box + email label
$cPath = Join-Path $dir "skill-communication.html"
$c = [System.IO.File]::ReadAllText($cPath, [System.Text.Encoding]::UTF8)

# Email section red-tinted box
$c = $c.Replace('style="background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2)"', 'style="background:#fff5f5;border:1px solid #fca5a5"')
# Email label class (red-400 on white = poor contrast)
$c = $c.Replace('<p class="font-heading font-bold text-red-400 text-xs mb-1">THE EMAIL', '<p class="font-heading font-bold text-xs mb-1" style="color:#AC161D">THE EMAIL')
# Email body div inline color
$c = $c.Replace('style="background:rgba(255,255,255,.04);border-radius:8px;color:rgba(255,255,255,.75)"', 'style="background:#f8fafc;border-radius:8px;color:#374151"')

[System.IO.File]::WriteAllText($cPath, $c, [System.Text.Encoding]::UTF8)
Write-Host "Email box fixed: skill-communication.html"

# Extra fix for skill-criticalthinking.html: Activity 2 question boxes
$ctPath = Join-Path $dir "skill-criticalthinking.html"
$c = [System.IO.File]::ReadAllText($ctPath, [System.Text.Encoding]::UTF8)
$c = $c.Replace('style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)"', 'style="background:#f9fafb;border:1px solid #e5e7eb"')
[System.IO.File]::WriteAllText($ctPath, $c, [System.Text.Encoding]::UTF8)
Write-Host "Activity 2 boxes fixed: skill-criticalthinking.html"

Write-Host "All fixes applied."
