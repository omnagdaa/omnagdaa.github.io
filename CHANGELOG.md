# Changelog

Notable changes to the site. Newest first.

## 2026-09-16 — Navbar on-palette, GitHub icon removed

### Changed

- **The navbar follows the design tokens.** Hextra styles the bar's contents
  with its own grey ramp — `hx:text-gray-600` on links, `hx:bg-black/[.05]` on
  the search field — so it kept the theme's palette while everything around it
  moved. Links, the active state, the search input, its placeholder, the
  shortcut chip and the results panel are all repainted.

  The current page is marked by Hextra with `hx:font-medium` and no colour
  class, and there is no `aria-current`, so that is the only hook for an active
  link. It now reads as accent plus an underline.

- **GitHub icon removed from the navbar.** It pointed at the same URL as the
  hero's contact rail, one row below it on the landing page.

## 2026-09-16 — Boxed listings on the section index pages

### Changed

- **Projects, Notes and Writeups now use the boxed treatment** their homepage
  sections got, so the language is the same wherever a listing appears.

  - **Writeups** gets one box per year, with the year as its legend. The year
    is already the grouping the archive is built on, so it is the most useful
    thing the legend can carry — no label or count needed.
  - **Projects** and **Notes** each box their listing with a count as the
    legend (`1 PROJECT`, `2 NOTES`). The `<h1>` already names the page, so
    repeating it in the legend would say nothing; the count is the thing the
    heading does not tell you.

- **Cards flatten inside a box.** A bordered, rounded card inside a ruled box
  is a box inside a box, and it is exactly the "everything is a card" habit
  this design language avoids. Inside a box the card keeps its content and
  loses its container: one column, ruled entries, hover moving the title and
  the accent rule rather than a fill. This affects the homepage WORK section
  as well as the projects index.

- **Rows inside a box run flush.** `.p-rows` draws its own rule top and bottom,
  which doubled against the box edge.

## 2026-09-16 — Boxed sections, red highlight, and the real scroll-to-top bug

### Fixed

- **The black band on the right when scrolling — found properly this time.**
  It is Hextra's sticky rail footer, the block carrying the scroll-to-top
  link at the bottom of the table of contents. It is painted with literals
  rather than variables (`hx:bg-white` / `hx:dark:bg-dark`, and a shadow of
  `0 -12px 16px #111`), so it appears bottom-right as a pale or near-black
  band that ignores the theme. Project pages show it because
  `content/projects/_index.md` cascades `type: docs`, which gives them a TOC.

  Both the TOC and the sidebar footers are now repainted from the tokens.

  The earlier `color-scheme` / `<html>` background work was a real fix for the
  overscroll canvas and the scrollbar, but it was **not** this bug.

- **Dark box shadow was pure black** on a near-black ground, so the offset was
  invisible. It is lighter than the page in dark now, not darker.

### Changed

- **Boxed sections.** Each landing-page section is a ruled box with its title
  straddling the top border like a fieldset legend, over a flat offset shadow
  with zero blur. `--p-box-border` and `--p-box-shadow` are kept separate from
  `--p-border` so ordinary hairlines stay hairlines.

- **Accent is red.** `#b32218` light (6.20:1 on paper), `#ff7b72` dark
  (7.18:1). Links, active states, the primary button, the caret and text
  selection.

- **The ASCII field is neutral, not the accent.** Red at the same alpha is
  dark enough to push faint text under the contrast floor, and a field of red
  glyphs reads as an alarm. It has its own `--p-art` token.

- **`--p-text-faint` recalibrated** in both themes. The paper ground costs the
  contrast headroom pure white gave for free: light `#626c77` → `#5b646d`,
  dark `#7b8b99` → `#8695a2`.

- **Typography** is Google Sans Flex and Google Sans Code. `--p-mono-art` stays
  pinned to JetBrains Mono — `tools/ascii-bg.py` bakes `CHAR_ASPECT = 0.5` into
  the art, so a face with a different advance ratio shears it.

- **Page narrowed to 52rem** from 72rem, with the navbar at 60rem. 72rem was
  sized for a full-bleed card grid; the boxed sections are a reading layout,
  and at that width the prose sat in a 42rem measure inside a 72rem box.

## 2026-09-15 — About becomes the landing page

### Changed

- **The About page is now the home page.** Its content moved to
  `content/_index.md` and renders directly under the hero, above Projects.
  `/about/` is a Hugo alias redirecting to `/`, so existing links and
  bookmarks still resolve, and the navbar's About entry is the `/#about`
  anchor rather than a page reference.

  The hero stays on top so name, role and the contact rail still resolve in a
  30-second scan, and Projects, Writeups and Notes still follow the bio — the
  work is further down the page than it was, but it is still on it.

- **The duplicate bio is gone.** `params.hero.lede` and the opening paragraph
  of About said the same thing in different words. With the bio now sitting a
  few pixels under the hero, that read as an oversight rather than a summary,
  so the lede was removed and the hero partial now only renders one if a
  `lede` is explicitly set.

- **Empty Experience and Certifications headings deleted** rather than carried
  over. They held a single `_Not yet written up._` line each, which is
  tolerable one click away and not tolerable as the first thing a visitor
  reads. `content/_index.md` carries a commented-out template for both — adding
  them back is ordinary markdown, with no template change.

## 2026-09-15 — Paper ground, and the black band on long pages

### Fixed

- **A black band on the right and below the content of any long page**, which
  did not change when the theme did. Two causes, one symptom:

  Hextra paints the page background on `<body>` and nothing painted `<html>`,
  so the scrollbar gutter and the overscroll area past the end of a page fell
  through to the browser's own canvas. Nothing declared `color-scheme` either,
  so that canvas and the scrollbar rendered at the UA default instead of
  following the theme. Projects and writeups hit it first because they are the
  pages long enough to scroll.

  `<html>` now paints the page colour and declares `color-scheme`, which fixes
  the band, the scrollbar, and every native control together.

- **`<body>` is now explicitly transparent**, and that is load-bearing rather
  than cosmetic. CSS propagates the canvas background from `<html>` and only
  falls back to `<body>` when the root is transparent — which is the fallback
  Hextra was relying on. Giving `<html>` a background turned body's into an
  ordinary background box that paints above negative z-index children, which
  hid the ASCII field completely until body was cleared.

### Changed

- **Paper ground.** `--p-bg` moves off pure white to `#f7f8f6` — cool and
  faintly green so it sits with the teal, deliberately not a warm cream. Cards
  were white on white, separated only by a shadow; on paper they separate by
  being a lighter sheet, so the shadow has nothing left to do.

- **The navbar is no longer frosted glass.** Hextra applies `backdrop-filter:
  blur()` over a background mixed to 85% transparent. Both are overridden to an
  opaque surface with a hairline. Frosted glass is the one material paper is
  not, and a translucent bar smears whatever scrolls under it.

- **Both decorative gradients removed**, along with the script that drove them.
  The cursor spotlight and the per-card radial glow were `radial-gradient`
  washes fed by per-frame custom-property writes from `assets/js/pointer-fx.js`.
  A gradient chasing the pointer is the opposite of a flat sheet, and dropping
  them takes a script and two listeners off every page. `--p-spot-*`,
  `--p-glow-*`, `--p-shadow` and `--p-shadow-lift` went with them, as did
  `docs/pointer-effects.md`.

- **Card hover** loses the 2px lift and the drop shadow; it moves edge and tone
  instead.

## 2026-09-15 — Design pass: concentrate the backdrop, retire the template chrome

### Changed

- **The ASCII field is a hero element now, not sitewide texture.** It loaded
  on every page at a flat 10%, which put moving art behind body prose on every
  writeup and note. It now loads on the landing page only, masked off the text
  column and faded out before the sections below — so it stops competing with
  reading, and where it *is* the only thing on screen it no longer has to
  whisper (0.26 on wide screens against the old 0.10).

  Gated by `{{ if .IsHome }}` around the script rather than hidden in CSS: the
  script creates both the element and the navbar pause button, so a CSS-only
  hide would have left every other page with a control and nothing to control.
  Reading pages also stop fetching `frames.json` entirely.

- **Monospace now means one thing: machine output.** It was doing seven jobs —
  prompt, role, section eyebrows, tags, dates, counts, "read more" links —
  which is monospace as a generic small-label face. It keeps commands, counts,
  timestamps and tool names, and loses the decorative labels. Setting a
  human-authored heading in the machine's voice is a category error.

- **Section eyebrows (`// projects`) removed.** A tracked-out all-caps mono
  label above every heading is template chrome; the hairline above each
  section already marks the boundary it was pretending to mark.

- **Stack group labels** lose the mono face and the caps for the same reason.
  The tag pills under them stay mono — those are tool names.

- **The `→` glued to "All projects" is gone**, replaced by an underline. The
  arrow was doing a link's job, and it survives being read aloud badly.

- **"All projects" moved below its content.** Pinned to the far right of a
  72rem section header, it sat opposite content occupying only the left third
  and read as belonging to nothing.

### Fixed

- **Contrast regression caught before it shipped.** Raising the backdrop
  opacity put light-theme faint text at 4.48:1, under AA and under the 4.67
  the notes recorded. Narrow-screen values are now capped at 0.11 (light) and
  0.10 (dark), verified at 4.61 and 4.65.
- **Cascade bug in the same block** — the reduced-motion rule sat after the
  narrow-screen rule, so a phone with reduced motion would have inherited the
  desktop opacity and failed that check. Order is now load-bearing and
  documented.

## 2026-09-15 — Writeup reading experience, tag browsing, docs split

### Fixed

- **Local builds were broken.** `_partials/portfolio/stack.html` used
  `hugo.Data.stack`, which exists in the Hugo version CI pins (0.165.0) but not
  in the version installed locally (0.154.5), so `./site build` failed with
  `can't evaluate field Data in type interface {}`. Now `site.Data.stack`,
  which works on both. Deploys were unaffected; only local preview was.
- **Sidebar link styling had never applied.** `custom.css` targeted
  `a.hextra-sidebar-item` / `button.hextra-sidebar-item`, but Hextra puts that
  class on a wrapping `<div>` and the `<a>` sits inside it, so both rules
  matched nothing and the rail kept the theme's default greys. Repointed at
  `.hextra-sidebar-item > a`.
- **Active sidebar markers were bracket-shaped.** The 2px accent bar is an
  inset box-shadow, which `border-radius` clips, bowing it at both ends. The
  leading corners are now squared.
- **A lone project card sat stranded in a three-column grid.** `.p-grid` used
  `repeat(auto-fill, …)`, which keeps empty tracks alive. Switched to
  `auto-fit` with a 26rem cap so one card neither strands nor stretches to the
  full 72rem.
- **Tag pills were underlined inside writeups** — `.content a` out-specified
  `.p-tag-link`. A pill is a control, not prose, so it now opts out explicitly.
- **Tag pages rendered the tag `ctf` as "Ctf"** — Hugo title-cases term
  titles. They use `.Data.Term` now, agreeing with the pills.
- **The mobile menu button did nothing on `/tags` and `/categories`.** The
  drawer the hamburger opens *is* `sidebar.html`, and the new taxonomy layouts
  omitted it. Caught by `./site check`.

### Added

- **GitBook-style chrome for writeups.** Writeups previously rendered in
  Hextra's flat blog layout — no rail, no contents, no pager. They now get the
  same navigation as notes, plus a byline the docs layout has no concept of.
- **Year-grouped writeup rail** (`_partials/portfolio/writeup-nav.html`).
  Hextra's sidebar orders `ByWeight`, which is meaningless for dated posts.
- **Writeups archive** replacing the paginated list. Grouped by year, with
  summaries, reading time, and a tag filter bar.
- **Byline on every writeup** — date, reading time, tags. Separated by a
  hairline rather than middots so nothing is stranded when the tags wrap.
- **Tag browsing.** `/tags` indexes every tag with a count; each tag gets a
  page. Both built before but shipped with no styling at all.
- **Notes on the landing page.** The section was in the navbar with published
  pages, but nothing on the home page pointed at it.
- **Writeup skeleton in the archetype.** `./site new blog` now scaffolds the
  headings that become the on-page contents rail.

### Changed

- **`CLAUDE.md` cut from ~2,600 words to ~520**, with the deep rationale moved
  to `docs/` and referenced on demand. That file loads into context on every
  session; the reasoning behind the ASCII backdrop only matters when touching
  the ASCII backdrop. Nothing was discarded — all four `docs/` files are the
  original text, and the reasoning behind the new layouts was added to
  `docs/hextra-overrides.md`.
- **Added `README.md`** — build, authoring, and a one-line description of
  every implemented feature with the file that provides it.
- **Content stubs given real structure.** `about.md` and both notes were
  title-and-TODO pages; they now have a working outline with explicit
  `TODO(om)` markers for the facts only Om can supply. No experience,
  certifications, or findings were invented.
- **`content/blog/ctf-writeup-1.md` converted to a page bundle**, matching the
  documented convention that every page is a folder. Still `draft: true`.
