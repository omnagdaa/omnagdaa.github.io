# omnagdaa.github.io

Source for [omnagdaa.github.io](https://omnagdaa.github.io/) — Om Nagda's
portfolio. Hugo + [Hextra](https://github.com/imfing/hextra), with a custom
portfolio layer on top.

`main` holds the source; CI builds it to `gh-pages` on every push. Never edit
`gh-pages` by hand.

## Build it

Hextra ships as a Hugo Module, so you need **Go** as well as **Hugo extended**.

```bash
./site preview   # localhost:1313, drafts visible, live reload
./site build     # production build into public/
./site check     # build + broken-link scan + mobile-menu wiring check
```

## Write something

```bash
./site new blog my-ctf-writeup      # or: notes, project
./site publish blog/my-ctf-writeup  # flips draft: true -> false
```

Every page is a folder holding `index.md` and its own images and video.
Reference attachments by bare filename; sizing and lazy-loading are automatic.

## What's implemented

Each line is one feature and where it lives.

### Reading and navigation

- **GitBook-style writeup chrome** — writeups get a left rail, breadcrumbs, an on-page contents rail, and prev/next links (`layouts/blog/single.html`).
- **Year-grouped writeup rail** — every writeup indexed by year, newest first, with the current page marked (`layouts/_partials/portfolio/writeup-nav.html`).
- **Grouped writeup archive** — `/blog` is a scannable archive by year, not a ten-per-page paginator (`layouts/blog/list.html`).
- **Writeup byline** — publication date, reading time, and tags under every title (`layouts/_partials/portfolio/post-meta.html`).
- **Tag browsing** — every tag is a page, and `/tags` indexes them all with counts (`layouts/taxonomy.html`, `layouts/term.html`).
- **Notes with a docs sidebar** — long-form reference material under `/docs`, with Hextra's docs chrome restyled to match (`layouts/docs/list.html`).
- **Full-text search** — Hextra's built-in index, reachable from the navbar or `Ctrl-K`.

### Landing page

- **Terminal-framed hero** — name, role, one-paragraph bio, and a contact rail that puts email, GitHub, and LinkedIn on the first page a recruiter sees (`layouts/_partials/portfolio/hero.html`).
- **Project cards** — title, summary, status, and tech tags per project (`layouts/_partials/portfolio/project-card.html`).
- **Skills grid** — driven entirely by `data/stack.yaml`; edit the YAML, not the template.
- **Latest writeups and notes** — both sections link through to their full index, and each hides itself rather than rendering empty (`writeups.html`, `notes.html`).

### Look and feel

- **Design-token system** — every colour, font, radius, and shadow is a `--p-*` custom property, so light and dark are one definition apart (`assets/css/custom.css`).
- **One-click light/dark** — replaces Hextra's three-item dropdown, sharing its storage key so the two can't desync (`assets/js/theme-switch.js`).
- **ASCII hero field** — an animated field derived from a screen recording at build time, shipped as ~2 KB of JSON rather than video. Landing page only; reading pages stay clean (`tools/ascii-bg.py`, `assets/js/ascii-bg.js`).
- **Motion pause control** — the backdrop autoplays, so WCAG 2.2.2 requires a way to stop it; the navbar button is it, and the choice persists.
- **Reduced-motion support** — nothing autoplays under `prefers-reduced-motion`, but the control stays, because common desktop settings report it by default.

### Publishing

- **Page-bundle authoring** — content and its attachments live together in one folder; no asset paths to maintain.
- **Automatic image sizing** — intrinsic `width`/`height` and `loading="lazy"` injected at render, so images never shift the layout (`layouts/_markup/render-image.html`).
- **Social share card** — a generated 1200×630 preview every page falls back to, so no link shares as a blank card (`tools/og-card.py`).
- **Structured data** — a JSON-LD `Person` block on the home page tying the site to the GitHub and LinkedIn accounts as one identity.
- **Sitemap, RSS, and robots.txt** — emitted on every build, with the sitemap advertised to crawlers.
- **Pre-commit checks** — `./site check` catches broken internal links and layouts whose mobile menu button would do nothing.
- **Deploy on push** — GitHub Actions builds `main` and publishes to `gh-pages` (`.github/workflows/deploy.yml`).

## Repository documentation

`CLAUDE.md` is the short orientation file. The `docs/` folder holds the
reasoning behind the parts that look arbitrary — read the relevant one before
changing that subsystem:

| File | Covers |
| --- | --- |
| `docs/hextra-overrides.md` | Every theme override and what breaks on upgrade |
| `docs/ascii-background.md` | Backdrop generation, playback, and accessibility |
| `docs/seo-and-social.md` | Identity, JSON-LD, and the share card |

`docs/` is repository documentation. The site's own Notes section is
`content/docs/` — different thing, similar name.
