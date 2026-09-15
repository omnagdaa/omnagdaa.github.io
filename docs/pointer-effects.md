# Pointer effects

The cursor spotlight and per-card glow. Read this before touching `assets/js/pointer-fx.js` or the `--p-spot-*` / `--p-glow-*` tokens.

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
