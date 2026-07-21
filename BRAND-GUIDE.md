# Field Experience BHS — Brand Guide

Reference for anyone (human or AI) building or editing pages on this site. Written from what's actually live across the codebase as of 2026-07-21, plus the iconography rules Michael provided (`iconography-rules.md`).

## Logo

**File:** `field-study-logo-trans_kewube.png` (Cloudinary account `dsbllwpbh`) — the full-color "Field Experience — Batavia Bulldogs — BPS101" badge (gold bulldog, crimson circle, gold ring, black linework, transparent background).

- **Always use this file for real branding moments** — nav bars, login screens, footers. It's high-contrast enough (black outline, saturated fill) to read on light *or* dark backgrounds without any filter.
- **Never apply `brightness-0 invert`** or similar filters to flatten it to white. That was a recurring bug on this site (index.html password screen, several footers, login.html) — it destroys all the color/detail and reads as a blurry white blob. If you see this filter combo anywhere, it's a bug, not a style choice.
- A second file, `bps101.png` (Cloudinary account `dikkdclum`) — a flat white silhouette shield with no internal color — still exists and is used as a small nav badge on **dark-background** teacher pages (teacher-status, teacher-directory, teacher-rubric, teacher-emails) and inside dark modals (bootcamp Launch Card). That's fine *only* on dark surfaces where it reads as a minimalist icon. Don't introduce new uses of it — prefer the full-color logo everywhere going forward.

## Color Palette

| Role | Hex | Notes |
|---|---|---|
| Crimson (primary) | `#AC161D` | CTAs, active states, primary accents, links. Works as text on both light and dark. |
| Crimson hover | `#8f1218` | Darken ~15% on hover/active press states. |
| Gold (secondary) | `#FBCD07` | High-energy accent. **Text-on-light rule below.** |
| Navy/charcoal (dark surfaces) | `#0e1520` – `#1a2540` | Hero bands, modals, celebratory moments — see "When to go dark" below. |
| Body text (light bg) | `#1c1f2e` | Primary text color on white/light surfaces. |
| Muted text (light bg) | `#6b7280` | Secondary text, descriptions, labels. |
| Faint text (light bg) | `#9ca3af` | Placeholders, timestamps, disabled states. |
| Body background | `#f7f7f9` | Default page background — soft off-white, not stark `#fff`. |
| Card/surface | `#fff` | Cards sit one step lighter than the page background, with a `#e5e7eb` border and a soft shadow (`0 1px 3px rgba(16,24,40,.04)`), not a heavier drop shadow. |

**Gold text-on-light rule:** `#FBCD07` fails contrast as small text on a light/white background — it's been a recurring issue (deliverables labels, skill tags, teacher-hub badges all had this bug). Two fixes, pick based on context:
- As a **background fill** (badge, pill, button): gold stays gold, use dark text on top (`#1c1f2e` or `#92400e`).
- As **text itself** on a light surface: use `#92400e` (a readable dark amber) instead — it still reads as "part of the gold family," just legible.
- On a genuinely **dark** surface (hero, modal), pure `#FBCD07` text is fine as-is — that's what it was designed for.

**Status colors** (green/red/blue), same rule applies — the bright shade (`#4ade80`, `#f87171`, `#60a5fa`) is for dark surfaces; the darkened variant is for light surfaces:

| Status | Dark-surface text | Light-surface text | Tint background (either surface) |
|---|---|---|---|
| Success/done | `#4ade80` | `#15803d` | `rgba(34,197,94,.12-.15)` |
| Error/alert | `#f87171` | `#dc2626` | `rgba(239,68,68,.06-.1)` |
| Info/blue | `#60a5fa` | `#1d4ed8` | `rgba(59,130,246,.1-.2)` |

Translucent color *backgrounds* (not white ones) generally look fine unchanged on either a light or dark page — a `rgba(251,205,7,.1)` gold tint just renders as pale gold-on-white or gold-glow-on-navy respectively. It's specifically bright *text* and translucent *white* surfaces (`rgba(255,255,255,.03–.09)`, meant to read as "frosted card on dark") that need to flip when the base page goes light.

## When to go dark vs. light

Don't flatten the whole site to one mode — the existing pattern (skill pages, and now bootcamp.html + teacher-hub.html) is a deliberate **split**:

- **Light** for anything a student or teacher spends real time reading/working in: body content, activity cards, forms, checklists, resource grids. Easier to read for long stretches, matches the marketing pages (index, cluster pages).
- **Dark** reserved for *moments*, not surfaces you scroll through: hero bands at the top of a page, the Launch Card modal, the bootcamp completion screen, password/login screens. These are meant to feel like an event, not a workspace — keep them dark and dramatic, don't lighten them just for consistency.

If a page doesn't have an obvious "moment" (e.g. a simple resource index), it's fine to be light top-to-bottom with a colored — not necessarily dark — header band, as long as text stays legible.

## Typography

- **Headings:** Montserrat, weight 700–900. Tight letter-spacing (`-0.01em` to `-0.03em`) at large sizes, generous positive letter-spacing (`0.06em`–`0.2em`) for small uppercase eyebrows/labels.
- **Body:** Open Sans, weight 400–600.
- Both loaded via Google Fonts `<link>` — already on every page, no build step needed.

## Iconography

(From `iconography-rules.md`, already the standard across this codebase.)

- Flat, minimalist SVG icons only. No gradients, drop shadows, or 3D effects.
- Inline `<svg>` in the HTML — don't use `<img>` tags for icons.
- Color via `currentColor` or an explicit `stroke`/`fill` hex so it can be recolored per-context (e.g. a blue icon in a blue-tinted chip).
- Default size 24×24 (`w-6 h-6` in Tailwind), scale down to 20×20 or 14×14 for inline/small contexts.
- Icons that sit inside a colored "chip" (rounded square/circle background) can stay at their bright/saturated shade even on a light page — the chip provides the contrast, not the page background.

## Component patterns

- **Cards:** white surface, `1px solid #e5e7eb` border, `10–20px` border-radius depending on size, soft shadow. On hover: border darkens slightly (`#d1d5db` or a crimson tint `rgba(172,22,29,.3)`), optional `translateY(-2px)`.
- **Pills/badges:** `999px` border-radius, translucent color background + matching-family text color (see gold rule above), `700–800` weight, small uppercase, letter-spacing `0.06–0.12em`.
- **Primary buttons:** solid crimson `#AC161D`, white text, `8–10px` radius, darken on hover.
- **Checklists:** each item is its own bordered row (not a bare `<input>` + label) so it reads as a real component — light gray background, green tint + border when checked.
- **Status/gate messaging:** small muted text below a form explaining what's blocking submission ("Complete all N items above ... (x/N)"), updates live as the user interacts.

## Voice

Direct, practical, treats students like near-professionals rather than kids. Short sentences. Concrete examples over abstract advice ("not X — Y" phrasing shows up a lot, e.g. "not 'get better at communication' but 'learn how to run a client meeting from start to finish'"). Humor is dry, not jokey. Never condescending.
