# omnagdaa.github.io

Om Nagda's portfolio. Hugo static site using Hextra (a Hugo Module) with a
custom portfolio layer on top.

- `main` — source. Pushing here triggers the Actions build.
- `gh-pages` — build output. Never edit by hand; it is overwritten on deploy.

Hextra is a Hugo Module, so **Go is required** to build, alongside Hugo
extended.

## Authoring

Every page is a *page bundle*: a folder containing `index.md` plus its
attachments, referenced by bare filename — no paths, no config.

```
./site new blog my-ctf-writeup      # or: notes, project
# drop screenshots/videos in content/blog/my-ctf-writeup/
./site publish blog/my-ctf-writeup  # flips draft: true -> false
```

```markdown
![Alt text](screenshot.png "Optional caption")
{{< video src="demo.mp4" poster="screenshot.png" caption="Demo" >}}
```

`layouts/_markup/render-image.html` adds intrinsic `width`/`height` and
`loading="lazy"`, so images never cause layout shift.

Other commands: `./site preview` (localhost:1313, drafts visible),
`./site drafts`, `./site build`, `./site check`, `./site ascii`, `./site ogcard`.

**Run `./site check` before committing.** It builds, scans for broken internal
links, and verifies every layout that shows a hamburger also renders the
sidebar partial that the hamburger opens.

## Structure

- `layouts/index.html` + `_partials/portfolio/` — custom landing page
- `layouts/blog/` — writeup archive and reading view (GitBook-style chrome)
- `layouts/projects/list.html` — project card grid
- `layouts/docs/list.html` — Hextra's docs list plus auto child listing
- `layouts/taxonomy.html`, `layouts/term.html` — tag browsing
- `assets/css/custom.css` — design system, all classes `p-` prefixed
- `data/stack.yaml` — homepage skills section
- `params.hero` in `hugo.yaml` — landing intro. Keep `role` in step with
  `params.author.jobTitle`, which feeds the JSON-LD and the social card.
- `i18n/en.yaml` — footer copyright (an i18n string in Hextra, not a param)

## Two Hugo traps already hit here

1. **Type beats section** in template lookup. A `cascade: type: docs` on a
   section's `_index.md` applies to that page too, silently routing it to the
   wrong layout. `content/projects/_index.md` sets an explicit `type` for this.
2. Hextra v0.12+ uses `layouts/_partials/`, not `layouts/partials/`. Overrides
   in the old path fail silently.

Prefer `site.Data` over `hugo.Data`: local Hugo and the CI pin are different
versions, and only `site.Data` works on both.

## Deeper notes — read on demand, not by default

| Touching… | Read |
| --- | --- |
| Hextra overrides, layouts, `_partials/`, a theme upgrade | `docs/hextra-overrides.md` |
| `tools/ascii-bg.py`, `assets/js/ascii-bg.js`, motion toggle | `docs/ascii-background.md` |
| `assets/js/pointer-fx.js`, `--p-spot-*` / `--p-glow-*` | `docs/pointer-effects.md` |
| `params.author`, `head-end.html`, `tools/og-card.py` | `docs/seo-and-social.md` |

These carry the *why* behind decisions that look arbitrary and are expensive
to rediscover. Read the relevant one before changing that subsystem; skip them
otherwise.

## UI work

Follow the Vercel Web Interface Guidelines in
`.claude/commands/web-interface-guidelines.md` when writing or changing any
template, layout, CSS, or JS — not only when reviewing. `.claude/` is
gitignored, so on a fresh clone re-fetch it from
<https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md>.

## Deploy

Push to `main`; `.github/workflows/deploy.yml` publishes to `gh-pages`.

`.github/workflows/`, `.gitignore`, `go.mod`, and `go.sum` must stay **tracked
on `main`** — GitHub reads workflows from the branch being pushed, so
gitignoring that directory silently disables deploys. The custom domain comes
from the `CNAME` repo variable (Settings → Secrets and variables → Actions →
Variables); unset, the site builds against `https://omnagdaa.github.io/`.
