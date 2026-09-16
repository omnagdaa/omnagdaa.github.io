# Hextra overrides

Every place this site overrides the Hextra theme, and what breaks on a theme upgrade. Read this before upgrading Hextra or editing anything under `layouts/_partials/`.

`layouts/_partials/navbar.html` overrides Hextra's to add two menu types,
wired from `menu.main` in hugo.yaml:

- `theme-switch` — one-click light/dark. Hextra's own control is a three-item
  dropdown; `params.theme.displayToggle` is false so there is only one.
- `motion-toggle` — pause/play for the background.

The bar is a floating rounded pill. The radius lives on
`.hextra-nav-container-blur` — the absolutely-positioned child that paints the
background — *not* on the container with `overflow: hidden`, which would clip
the search results panel.

`navbar.displayTitle` is false: the name is dropped from the bar, but
`displayLogo` stays true so the click-to-home affordance survives.

Both reuse Hextra's `color-theme` localStorage key and its `light`/`dark`
class on `<html>`, so nothing can desync. Re-check the override on upgrades.

## Footer

The footer is slimmed in `custom.css` from Hextra's tall grey band (`py-12`
plus `mt-6`, ~136px) to a hairline-topped single line (~44px). Those overrides
depend on the theme's footer structure — `footer > [custom slot] > [width
wrapper] > [flex col] > [copyright]` — so re-check them on a Hextra upgrade.

Two Hugo gotchas already hit here, worth remembering:

1. **Type beats section** in template lookup. A `cascade: type: docs` on a
   section's `_index.md` applies to that page too, silently routing it to the
   wrong layout. `content/projects/_index.md` sets an explicit `type` for this
   reason.
2. Hextra v0.12+ uses `layouts/_partials/`, not `layouts/partials/`. Overrides
   in the old path fail silently.

## Writeups (`layouts/blog/`)

Hextra's `blog/single.html` disables the sidebar and renders a bare column.
Both files here restore the docs-style chrome so a writeup is as navigable as
a note:

- `blog/single.html` — rail, breadcrumb, TOC, prev/next pager, plus a byline
  (`_partials/portfolio/post-meta.html`) the docs layout has no concept of.
- `blog/list.html` — a grouped archive rather than Hextra's 10-per-page
  paginator. Someone here is either browsing the whole body of work or hunting
  one writeup; a paginator serves neither.
- `_partials/portfolio/writeup-nav.html` — the rail itself. Hextra's own
  sidebar walks the page tree `ByWeight`, which is meaningless for dated posts,
  so this groups by year instead.

The rail deliberately mirrors Hextra's `sidebar.html` shell — the container
classes, the mobile/desktop split, the drawer transform. `navbar.js` finds the
mobile drawer *by that class name*, so the markup is load-bearing, not
cosmetic. It also calls Hextra's own `sidebar-main` / `sidebar-footer` define
blocks for the mobile list, which works because Hugo's template namespace is
global. Re-check all of it on a Hextra upgrade.

## Tag pages (`layouts/taxonomy.html`, `layouts/term.html`)

Two traps, both already hit:

- `.Data.Terms.ByCount`, never `.Pages.ByCount`. On a taxonomy page `.Pages`
  is a plain `page.Pages` with no ordering helpers; the counts hang off
  `.Data.Terms`.
- `.Data.Term`, not `.Title`, for the heading. Hugo title-cases term titles,
  which renders the tag `ctf` as "Ctf" and disagrees with the pills.

Both layouts call `sidebar.html` with `disableSidebar` purely to render the
mobile drawer — see the hamburger rule below.

## The hamburger rule

The navbar always shows a hamburger on mobile, and the drawer it opens *is*
`sidebar.html`. Any layout that omits that partial ships a button that does
nothing. `./site check` tests for exactly this pairing; it caught the
taxonomy layouts.

## Sidebar CSS selectors

`hextra-sidebar-item` sits on a wrapping `<div>`; the `<a>` is *inside* it. So
`a.hextra-sidebar-item` matches nothing — `custom.css` targets
`.hextra-sidebar-item > a`. The active-state class is the exception: Hextra
appends `hextra-sidebar-active-item` to the `<a>` itself.

Inset box-shadows are clipped by `border-radius`, so the 2px accent bar on an
active item bows into a bracket unless the leading corners are squared.

## Sticky rail footers

The table of contents and the sidebar each end in a `position: sticky` block
pinned to the bottom of the rail, carrying the scroll-to-top link. Hextra
paints it with literal colours rather than variables:

```
hx:bg-white                     hx:dark:bg-dark
hx:shadow-[0_-12px_16px_white]  hx:dark:shadow-[0_-12px_16px_#111]
```

On any page long enough to scroll it therefore appears bottom-right as a pale
or near-black band with a 16px bleed of the same literal above it, and it does
not change when the theme does. Project pages show it because
`content/projects/_index.md` cascades `type: docs`, which gives them a TOC.

`custom.css` repaints both from the tokens. The shadow keeps Hextra's geometry
— it exists to fade the list out under the sticky block — but in the page
colour. Tailwind's dark variant compiles to `:where(.dark, .dark *)`, which
contributes no specificity, so a two-class selector wins in both themes.

Re-check this on a Hextra upgrade: it depends on the `hx:sticky` class staying
on that element.

## Design tokens and the theme

The palette, typography and the boxed-section treatment all live in
`assets/css/custom.css` as `--p-*` tokens. Two constraints that are not
obvious:

- `--p-box-border` and `--p-box-shadow` are deliberately separate from
  `--p-border`. The boxes use a heavy 2px rule in the text colour; ordinary
  hairlines (table rules, the sidebar rail, row separators) must stay
  hairlines, and would all turn near-black if they shared a token.
- `--p-art` paints the ASCII field and is a neutral, never the accent. Red is
  dark enough at the same alpha to push faint text under the contrast floor,
  and a field of red glyphs reads as an alarm. See `docs/ascii-background.md`
  for the numbers.

## Navbar colour scheme

Hextra styles the bar's contents with its own grey ramp — `hx:text-gray-600`
on menu links, `hx:bg-black/[.05]` on the search field — so the bar kept the
theme's palette while everything around it moved to the tokens. `custom.css`
repaints the links, the search input, its placeholder, the shortcut chip and
the results panel.

Two hooks worth knowing, both of which can move on a theme upgrade:

- The **current page** link is marked only by `hx:font-medium`, with the colour
  class simply omitted. There is no `aria-current`, so that class is the only
  selector available for an active state.
- The search field is `.hextra-search-input` inside `.hextra-search-wrapper`.

Tailwind's dark variant compiles to `:where(.dark, .dark *)` and contributes no
specificity, so a two-class selector wins in both themes without `!important`.

The GitHub icon was removed from `menu.main`. It pointed at the same URL as the
hero's contact rail, which is where a visitor actually looks for it.
