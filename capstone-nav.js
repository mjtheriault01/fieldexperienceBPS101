// Shared Capstone tab bar: one row of links across every capstone page, current page highlighted.
// Include with <script src="capstone-nav.js" defer></script>; it inserts itself right after the page's <nav>.
(function () {
  var TABS = [
    { href: "capstone.html", label: "Overview" },
    { href: "showcase-planner.html", label: "Showcase Table Planner", group: "Showcase" },
    { href: "skills-board.html", label: "Skills Evidence Board", group: "Showcase" },
    { href: "pitch-prompts.html", label: "Spotlight Prep Sheet", group: "Spotlight" },
    { href: "portfolio-guide.html", label: "Portfolio Guide", group: "Portfolio" },
    { href: "capstone-rubric.html", label: "Rubric" }
  ];
  var here = (location.pathname.split("/").pop() || "").toLowerCase();

  var css = document.createElement("style");
  css.textContent =
    ".cap-tabs{position:sticky;top:56px;z-index:49;background:#111;border-bottom:3px solid #FBCD07;overflow-x:auto;-webkit-overflow-scrolling:touch}" +
    ".cap-tabs-in{display:flex;align-items:center;gap:.35rem;padding:.5rem 1.25rem;max-width:1100px;margin:0 auto;white-space:nowrap}" +
    ".cap-tabs .cap-lbl{font-family:Montserrat,system-ui,sans-serif;font-size:.62rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#FBCD07;margin-right:.5rem}" +
    ".cap-tabs a{font-family:Montserrat,system-ui,sans-serif;font-size:.72rem;font-weight:700;color:#e5e7eb;text-decoration:none;padding:.42rem .8rem;border-radius:999px;border:1px solid rgba(255,255,255,.14)}" +
    ".cap-tabs a:hover{background:rgba(255,255,255,.08);color:#fff}" +
    ".cap-tabs a.on{background:#AC161D;border-color:#AC161D;color:#fff}" +
    ".cap-tabs .cap-sep{width:1px;height:18px;background:rgba(255,255,255,.18);margin:0 .2rem}" +
    "@media print{.cap-tabs{display:none!important}}";
  document.head.appendChild(css);

  var bar = document.createElement("div");
  bar.className = "cap-tabs";
  var html = '<div class="cap-tabs-in"><span class="cap-lbl">Capstone</span>';
  var lastGroup = null;
  TABS.forEach(function (t, i) {
    if (i > 0 && t.group !== lastGroup) html += '<span class="cap-sep"></span>';
    lastGroup = t.group;
    html += '<a href="' + t.href + '"' + (t.href === here ? ' class="on" aria-current="page"' : "") + ">" + t.label + "</a>";
  });
  bar.innerHTML = html + "</div>";

  var nav = document.querySelector("body > nav");
  if (nav) nav.insertAdjacentElement("afterend", bar);
  else document.body.insertAdjacentElement("afterbegin", bar);
})();
