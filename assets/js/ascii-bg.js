/* Ambient ASCII background.
 *
 * Frames are pre-rendered at build time (tools/ascii-bg.py), so this only
 * swaps text — no video download, no canvas, no per-frame image decoding.
 *
 * Motion policy: the sequence plays ONE pass (~5s) on load and then holds a
 * still frame. An indefinite loop would be "autoplay motion > 5 seconds
 * alongside other content", which WCAG 2.2.2 requires a pause/stop/hide
 * control for — and a persistent control is the wrong trade for decoration.
 * Playing once keeps it compliant, costs no ongoing CPU or battery, and reads
 * as the page settling rather than as a distraction.
 *
 * Decorative only: the layer is aria-hidden and non-interactive. Under
 * prefers-reduced-motion nothing animates at all.
 */
(function () {
  "use strict";

  var src = document.currentScript && document.currentScript.dataset.frames;
  if (!src || !window.fetch) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

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

        var settled = frames[typeof data.rest === "number" ? data.rest : frames.length - 1];

        // No motion wanted: paint the resting frame and stop here.
        if (reduce.matches) {
          el.textContent = settled;
          return;
        }

        el.textContent = frames[0];

        var i = 0;
        var interval = Math.max(60, 1000 / (data.fps || 8));
        var timer = setInterval(function () {
          i += 1;
          if (i >= frames.length) {
            clearInterval(timer);
            timer = null;
            el.textContent = settled;
            return;
          }
          el.textContent = frames[i];
        }, interval);

        // If the tab is hidden mid-pass, skip to the end rather than
        // animating where nobody can see it.
        document.addEventListener("visibilitychange", function () {
          if (document.hidden && timer !== null) {
            clearInterval(timer);
            timer = null;
            el.textContent = settled;
          }
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
