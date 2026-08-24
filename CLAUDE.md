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

The source video (`video.mp4`) is **gitignored** — it is a build input, not a
deliverable. Keep a local copy; regenerating needs it, serving the site does
not. `./site ascii` defaults to it and now hard-fails if it is missing: the
default once pointed at `content/projects/dumpscope/demo.mp4`, which silently
regenerated the backdrop from the wrong clip.

The generator **crops rows blank in every frame**. The source is framed with
empty space at the top, which survives edge detection as dead rows; since the
backdrop is centred, those rows shoved the art below centre (ink centred at
65% down the box, versus 49% after cropping). The crop is computed across the
whole sequence, never per frame, so nothing jitters.

Edge detection rather than a brightness ramp: screen recordings are mostly
flat regions and turn to featureless mush under plain luminance, whereas edges
keep window outlines and UI structure legible.

Playback is a **cross-dissolve driven by requestAnimationFrame**, not a hard
frame swap on a timer. Three things this fixes, all of which caused visible
choppiness:

- Hard `textContent` swaps at 8 fps strobe, because consecutive edge-detected
  frames differ a lot. Two stacked `.p-ascii-layer` spans fade between frames
  instead, which reads as motion blur. Only opacity animates, so the tween
  stays on the compositor.
- `setInterval` drifts against the display refresh, landing frames at
  arbitrary points in the compositor cycle. rAF is vsync-aligned; a time
  accumulator keeps playback speed correct when frames are dropped.
- The clip **ping-pongs** rather than wrapping. Its last and first frames are
  unrelated, so wrapping produced one visible jump per cycle.

Easing is smoothstep, not linear: linear lingers at 50/50 opacity where both
glyph sets are equally visible and the art reads as doubled. `step()` is pure
— it must stay that way, since it is called twice per transition.

The sequence loops continuously at 10% opacity. Because that is autoplay
motion lasting over five seconds, WCAG 2.2.2 requires a pause mechanism: the
navbar pause button is it, and it is load-bearing — if no control is found on
the page the script leaves playback stopped rather than shipping motion nobody
can turn off. The choice persists in localStorage.

Under `prefers-reduced-motion` nothing autoplays, but the control is **not**
hidden and the art is **not** removed — a still frame stays on screen, dimmed
to 0.07, and the button offers motion to anyone who wants it. Hiding the
control was worse than useless: KDE's `AnimationDurationFactor=0` and GNOME's
`enable-animations=false` both report reduced motion, so ordinary desktop
setups silently lost the feature with no way to get it back. A deliberate
opt-in is stored as `playing-reduced`, distinct from `playing`, so it can
never be inherited by a visitor who did not ask for it; `.is-playing` on the
container is what tells CSS the difference.

Text colours are tuned against the *blended* background, not the flat one:
`--p-text-faint` sits at 4.67:1 (light) and 4.65:1 (dark) worst case, with a
dense glyph directly behind it. Raising the opacity again means re-checking
those two values.

## SEO / social

`params.author` in `hugo.yaml` is the single source of truth for identity: it
feeds the JSON-LD `Person` block in `_partials/custom/head-end.html` (home page
only — repeating it site-wide adds no signal and risks conflicting entities).
`sameAs` is the load-bearing field; it ties this site to the GitHub and
LinkedIn accounts as one identity. Adding `locality:`/`country:` there emits a
`PostalAddress` automatically.

The JSON-LD **must** be piped through `safeJS`. Inside `<script>`, Go's
html/template treats `jsonify` output as a JS string and re-escapes it,
emitting a quoted blob that validators silently reject.

`static/og-card.png` (1200x630) is the social preview, generated by
`tools/og-card.py` from the same ASCII frames and palette as the site.
`params.images` points every page at it, so no link ever shares as a blank
card. Regenerate with `./site ogcard` after changing the name or headline.

`layouts/robots.txt` overrides Hugo's default purely to add the `Sitemap:`
line — that is how search engines find the sitemap without manual submission.

## Pointer effects

`assets/js/pointer-fx.js` drives two layers by writing CSS custom properties;
all painting is CSS:

- `.p-spotlight` — page-wide glow following the cursor (fixed, `z-index: -1`)
- `a.p-card::before` — local glow tracking the pointer inside a hovered card

Tuned via `--p-spot-size` / `--p-spot-alpha` / `--p-glow-size` /
`--p-glow-alpha`, with stronger values in dark where surfaces swallow light.

Two performance rules the code depends on: `pointermove` only stores
coordinates and all writes happen in one `requestAnimationFrame` tick; and
`getBoundingClientRect` is read on hover-change and cached, never during
movement. Reading layout per move is the classic thrash.

Skipped entirely without a fine pointer (touch) or under reduced motion —
nothing is inserted at all.

Background layers are explicitly `z-index: -2` (ASCII) and `-1` (spotlight)
rather than relying on which script inserts its element first.

## Navbar controls

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

## Structure

- `layouts/index.html` + `layouts/_partials/portfolio/` — custom landing page
- `layouts/projects/list.html` — project card grid
- `layouts/docs/list.html` — Hextra's docs list plus auto child listing
- `assets/css/custom.css` — design system, all classes `p-` prefixed
- `data/stack.yaml` — drives the homepage skills section
- `params.hero` in `hugo.yaml` — the landing intro: `role` under the name and
  a `contact` rail (labels are visible text, never icon-only). Keep `role` in
  step with `params.author.jobTitle`, which feeds the JSON-LD and social card.
- `assets/js/ascii-bg.js` + `assets/ascii/frames.json` — background (generated)
- `i18n/en.yaml` — footer copyright (it is an i18n string in Hextra, not a param)

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

## UI work

Follow the Vercel Web Interface Guidelines in
`.claude/commands/web-interface-guidelines.md` when writing or changing any
templates, partials, layouts, CSS, or JS — not only when reviewing. The same
file is invokable as `/web-interface-guidelines <file-or-pattern>` to audit
existing files.

`.claude/` is gitignored (local agent config, not project source), so on a
fresh clone re-fetch it from
<https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md>.

## Deploy

Push to `main`. `.github/workflows/deploy.yml` builds and publishes to
`gh-pages`.

`.github/workflows/` must stay **tracked on `main`** — GitHub reads workflows
from the branch being pushed, so gitignoring it silently disables deploys. It
is the thing that implements the main-source / gh-pages-output split, not a
stray config file. Same for `.gitignore`, `go.mod`, and `go.sum`. The custom domain comes from the `CNAME` repo variable (Settings →
Secrets and variables → Actions → Variables); unset, the site builds against
`https://omnagdaa.github.io/`.
