# ASCII background

How the ambient backdrop is generated and why playback works the way it does. Read this before touching `tools/ascii-bg.py`, `assets/js/ascii-bg.js`, or the motion toggle.

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
