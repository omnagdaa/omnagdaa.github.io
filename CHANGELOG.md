# Changelog

Notable changes to the site. Newest first.

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
