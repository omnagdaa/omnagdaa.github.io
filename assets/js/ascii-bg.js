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
 * motion. The choice persists across pages, and prefers-reduced-motion wins
 * over a stored "playing" preference.
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
        var i = restIdx;
        var timer = null;

        el.textContent = frames[restIdx];

        function playing() {
          return timer !== null;
        }

        function stop() {
          if (timer !== null) {
            clearInterval(timer);
            timer = null;
          }
        }

        function play() {
          if (timer !== null || reduce.matches || document.hidden) return;
          timer = setInterval(function () {
            i = (i + 1) % frames.length;
            el.textContent = frames[i];
          }, interval);
        }

        var btns = document.querySelectorAll("[data-motion-toggle]");

        // No control on the page means no way to pause: stay stopped.
        if (!btns.length) return;

        function sync() {
          var on = playing();
          Array.prototype.forEach.call(btns, function (b) {
            b.hidden = false;
            b.setAttribute("aria-pressed", on ? "false" : "true");
            var label = on
              ? "Pause background animation"
              : "Play background animation";
            b.setAttribute("aria-label", label);
            b.setAttribute("title", label);
            b.classList.toggle("is-paused", !on);
          });
        }

        Array.prototype.forEach.call(btns, function (b) {
          b.addEventListener("click", function () {
            if (playing()) {
              stop();
              remember("paused");
            } else {
              remember("playing");
              play();
            }
            sync();
          });
        });

        // Reduced motion overrides a stored preference; it is a stated need,
        // not a default.
        if (reduce.matches) {
          Array.prototype.forEach.call(btns, function (b) {
            b.hidden = true;
          });
          return;
        }

        if (stored() !== "paused") play();
        sync();

        document.addEventListener("visibilitychange", function () {
          if (document.hidden) {
            stop();
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
