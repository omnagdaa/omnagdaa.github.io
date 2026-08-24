/* Ambient ASCII background — continuous playback.
 *
 * Frames are pre-rendered at build time (tools/ascii-bg.py), so this only
 * swaps text: no video download, no canvas, no per-frame image decoding.
 *
 * Motion policy. The sequence loops indefinitely, which is "autoplay motion
 * lasting more than five seconds alongside other content" — WCAG 2.2.2
 * requires a pause/stop/hide mechanism for that. The navbar pause button is
 * that mechanism, so it is a hard requirement, not a nicety: if it cannot be
 * wired up, playback stays stopped rather than shipping uncontrollable
 * motion. The choice persists across pages. Under prefers-reduced-motion
 * nothing ever autoplays, but the control stays visible so the animation can
 * still be started deliberately — that opt-in is stored separately
 * ("playing-reduced") so it can never be inherited by a visitor who did not
 * ask for it.
 */
(function () {
  "use strict";

  var script = document.currentScript;
  var src = script && script.dataset.frames;
  if (!src || !window.fetch) return;

  var KEY = "ascii-bg-motion";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function stored() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function remember(v) {
    try {
      localStorage.setItem(KEY, v);
    } catch (e) {
      /* Blocked storage: the choice simply won't survive navigation. */
    }
  }

  function start() {
    var el = document.createElement("pre");
    el.className = "p-ascii-bg";
    el.setAttribute("aria-hidden", "true");

    /* Two stacked layers so frames cross-dissolve instead of hard-cutting.
       A hard swap at 8fps reads as strobing, because consecutive
       edge-detected frames differ a lot; fading between them turns the same
       source frames into apparent motion blur. Only opacity is animated, so
       the tween stays on the compositor and never touches layout. */
    var a = document.createElement("span");
    var b = document.createElement("span");
    a.className = b.className = "p-ascii-layer";
    el.appendChild(a);
    el.appendChild(b);
    document.body.insertBefore(el, document.body.firstChild);

    fetch(src)
      .then(function (r) {
        if (!r.ok) throw new Error("ascii frames " + r.status);
        return r.json();
      })
      .then(function (data) {
        var frames = data && data.frames;
        if (!frames || !frames.length) return;

        var restIdx = typeof data.rest === "number" ? data.rest : 0;
        var interval = Math.max(60, 1000 / (data.fps || 8));
        var raf = null;
        var last = 0;
        var acc = 0;

        /* Ping-pong rather than wrapping. The clip is a short loop whose last
           and first frames are unrelated, so wrapping produces one visible
           jump per cycle; reversing at the ends removes that seam entirely. */
        var i = restIdx;
        var dir = 1;

        var front = a; // currently fully visible
        var back = b;  // fading in

        front.textContent = frames[i];
        front.style.opacity = "1";
        back.style.opacity = "0";

        // Pure: returns the step that follows [idx, d] without mutating
        // anything, so it is safe to call more than once per transition.
        function step(idx, d) {
          if (frames.length < 2) return { i: 0, dir: d };
          var nd = idx + d >= frames.length || idx + d < 0 ? -d : d;
          return { i: idx + nd, dir: nd };
        }

        var nxt = step(i, dir);
        back.textContent = frames[nxt.i];

        function playing() {
          return raf !== null;
        }

        function stop() {
          if (raf !== null) {
            cancelAnimationFrame(raf);
            raf = null;
          }
          // Settle on a whole frame so a pause never freezes mid-dissolve,
          // and clear the accumulator so resuming does not jump.
          acc = 0;
          front.style.opacity = "1";
          back.style.opacity = "0";
        }

        /* rAF with a time accumulator, not setInterval. setInterval fires on
           its own schedule and drifts against the display refresh, so frames
           land at arbitrary points in the compositor cycle and jitter; rAF is
           vsync-aligned, and the accumulator keeps playback speed correct
           even when the browser throttles or drops frames. */
        function tick(now) {
          raf = requestAnimationFrame(tick);
          if (!last) last = now;
          var dt = now - last;
          last = now;
          // Clamp: after a background tab or a long task, advance one frame
          // rather than replaying the whole gap at once.
          acc += Math.min(dt, interval);

          var t = acc / interval;
          if (t >= 1) {
            acc -= interval;
            i = nxt.i;
            dir = nxt.dir;
            var tmp = front;
            front = back;
            back = tmp;
            front.style.opacity = "1";
            back.style.opacity = "0";
            nxt = step(i, dir);
            back.textContent = frames[nxt.i];
            return;
          }

          // smoothstep: linear spends too long at 50/50, where both glyph
          // sets are equally visible and the art reads as doubled.
          var e = t * t * (3 - 2 * t);
          front.style.opacity = String(1 - e);
          back.style.opacity = String(e);
        }

        /* `explicit` = the visitor pressed the button. Reduced motion blocks
           autoplay, which is the WCAG requirement, but it must not block an
           informed opt-in: hiding the control entirely left anyone with the
           OS setting on with no way to ever see the animation. */
        function play(explicit) {
          if (raf !== null || document.hidden) return;
          if (reduce.matches && !explicit) return;
          last = 0;
          raf = requestAnimationFrame(tick);
        }

        var btns = document.querySelectorAll("[data-motion-toggle]");

        // No control on the page means no way to pause: stay stopped.
        if (!btns.length) return;

        function sync() {
          var on = playing();
          // Lets CSS tell a deliberate opt-in apart from a dimmed still frame.
          el.classList.toggle("is-playing", on);
          Array.prototype.forEach.call(btns, function (b2) {
            b2.hidden = false;
            b2.setAttribute("aria-pressed", on ? "false" : "true");
            var label = on
              ? "Pause background animation"
              : "Play background animation";
            b2.setAttribute("aria-label", label);
            b2.setAttribute("title", label);
            b2.classList.toggle("is-paused", !on);
          });
        }

        Array.prototype.forEach.call(btns, function (b2) {
          b2.addEventListener("click", function () {
            if (playing()) {
              stop();
              remember("paused");
            } else {
              // Distinct value: an opt-in made *while* reduced motion is on is
              // a deliberate override, and only that may autoplay later.
              remember(reduce.matches ? "playing-reduced" : "playing");
              play(true);
            }
            sync();
          });
        });

        // Reduced motion never autoplays. It no longer hides the control:
        // the still frame stays on screen and the button offers motion to
        // anyone who wants it, rather than silently removing the feature.
        if (reduce.matches) {
          if (stored() === "playing-reduced") play(true);
        } else if (stored() !== "paused") {
          play();
        }
        sync();

        document.addEventListener("visibilitychange", function () {
          if (document.hidden) {
            stop();
          } else if (reduce.matches) {
            if (stored() === "playing-reduced") play(true);
          } else if (stored() !== "paused") {
            play();
          }
          sync();
        });
      })
      .catch(function () {
        /* Decorative — a failure here must never affect the page. */
        el.remove();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
