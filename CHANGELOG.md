# Changelog

Notable changes to the site. Newest first.

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
