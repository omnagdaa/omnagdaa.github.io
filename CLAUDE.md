# omnagdaa.github.io

Om Nagda's portfolio. Hugo static site using Hextra (a Hugo Module) with a
custom portfolio layer on top.

- `main` — source. Pushing here triggers the Actions build.
- `gh-pages` — build output. Never edit by hand; it is overwritten on deploy.

## Requirements

Hextra is a Hugo Module, so **Go is required** to build (`sudo pacman -S go`),
alongside Hugo extended.

## Authoring workflow

Every page is a *page bundle*: a folder containing `index.md` plus its
attachments. Reference attachments by bare filename — no paths, no config.

```
./site new blog my-ctf-writeup      # or: notes, project
# put screenshots/videos in content/blog/my-ctf-writeup/
./site publish blog/my-ctf-writeup  # flips draft: true -> false
```

In markdown:

```markdown
![Alt text](screenshot.png "Optional caption")
{{< video src="demo.mp4" poster="screenshot.png" caption="Demo" >}}
```

`layouts/_markup/render-image.html` adds intrinsic `width`/`height` and
`loading="lazy"` automatically, so images never cause layout shift and no
manual HTML is needed.

Other commands: `./site preview` (localhost:1313, drafts visible),
`./site drafts`, `./site build`, `./site check` (build + broken-link scan).

## ASCII background

The ambient backdrop is derived from a video, but no video is shipped. At
build time `tools/ascii-bg.py` extracts frames, runs edge detection, and
writes text frames to `assets/ascii/frames.json` (~2 KB gzipped). Regenerate
with `./site ascii [video]` and commit the JSON.

Edge detection rather than a brightness ramp: screen recordings are mostly
flat regions and turn to featureless mush under plain luminance, whereas edges
keep window outlines and UI structure legible.

The sequence loops continuously at 10% opacity. Because that is autoplay
motion lasting over five seconds, WCAG 2.2.2 requires a pause mechanism: the
navbar pause button is it, and it is load-bearing — if no control is found on
the page the script leaves playback stopped rather than shipping motion nobody
can turn off. The choice persists in localStorage; prefers-reduced-motion
overrides a stored "playing" preference and hides the control.

Text colours are tuned against the *blended* background, not the flat one:
`--p-text-faint` sits at 4.67:1 (light) and 4.65:1 (dark) worst case, with a
dense glyph directly behind it. Raising the opacity again means re-checking
those two values.

## Navbar controls

`layouts/_partials/navbar.html` overrides Hextra's to add two menu types,
wired from `menu.main` in hugo.yaml:

- `theme-switch` — one-click light/dark. Hextra's own control is a three-item
  dropdown; `params.theme.displayToggle` is false so there is only one.
- `motion-toggle` — pause/play for the background.

Both reuse Hextra's `color-theme` localStorage key and its `light`/`dark`
class on `<html>`, so nothing can desync. Re-check the override on upgrades.

## Structure

- `layouts/index.html` + `layouts/_partials/portfolio/` — custom landing page
- `layouts/projects/list.html` — project card grid
- `layouts/docs/list.html` — Hextra's docs list plus auto child listing
- `assets/css/custom.css` — design system, all classes `p-` prefixed
- `data/stack.yaml` — drives the homepage skills section
- `assets/js/ascii-bg.js` + `assets/ascii/frames.json` — background (generated)
- `i18n/en.yaml` — footer copyright (it is an i18n string in Hextra, not a param)

Two Hugo gotchas already hit here, worth remembering:

1. **Type beats section** in template lookup. A `cascade: type: docs` on a
   section's `_index.md` applies to that page too, silently routing it to the
   wrong layout. `content/projects/_index.md` sets an explicit `type` for this
   reason.
2. Hextra v0.12+ uses `layouts/_partials/`, not `layouts/partials/`. Overrides
   in the old path fail silently.

## UI work

Follow the Vercel Web Interface Guidelines in
`.claude/commands/web-interface-guidelines.md` when writing or changing any
templates, partials, layouts, CSS, or JS — not only when reviewing. The same
file is invokable as `/web-interface-guidelines <file-or-pattern>` to audit
existing files.

## Deploy

Push to `main`. `.github/workflows/deploy.yml` builds and publishes to
`gh-pages`. The custom domain comes from the `CNAME` repo variable (Settings →
Secrets and variables → Actions → Variables); unset, the site builds against
`https://omnagdaa.github.io/`.
