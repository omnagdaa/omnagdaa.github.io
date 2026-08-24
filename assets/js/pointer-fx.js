/* Pointer effects: a page-wide spotlight and a per-card glow.
 *
 * Both work by writing CSS custom properties; all painting is CSS. Two rules
 * keep it cheap:
 *
 *   1. pointermove only stores coordinates. Writes happen once per frame in a
 *      requestAnimationFrame callback, so a burst of events cannot cause more
 *      than one style write per frame.
 *   2. getBoundingClientRect is read on pointerenter and cached, never during
 *      movement — reading layout on every move is the classic thrash.
 *
 * Skipped entirely when there is no fine pointer to follow (touch) or when
 * the visitor asked for reduced motion. Nothing is inserted in those cases.
 */
(function () {
  "use strict";

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!fine.matches || reduce.matches) return;

  var root = document.documentElement;
  var layer = null;
  var card = null;      // currently hovered card
  var rect = null;      // its cached bounds
  var px = 0, py = 0;   // latest pointer position (viewport)
  var queued = false;
  var seen = false;

  function frame() {
    queued = false;

    root.style.setProperty("--p-mx", px + "px");
    root.style.setProperty("--p-my", py + "px");

    if (!seen && layer) {
      seen = true;
      layer.classList.add("is-active");
    }

    if (card && rect) {
      card.style.setProperty("--p-cx", (px - rect.left) + "px");
      card.style.setProperty("--p-cy", (py - rect.top) + "px");
    }
  }

  function onMove(e) {
    px = e.clientX;
    py = e.clientY;
    if (!queued) {
      queued = true;
      requestAnimationFrame(frame);
    }
  }

  function onOver(e) {
    var t = e.target.closest ? e.target.closest("a.p-card") : null;
    if (t === card) return;
    if (card) {
      card.style.removeProperty("--p-cx");
      card.style.removeProperty("--p-cy");
    }
    card = t;
    // Single layout read, only when the hovered card changes.
    rect = card ? card.getBoundingClientRect() : null;
  }

  function invalidate() {
    if (card) rect = card.getBoundingClientRect();
  }

  function init() {
    layer = document.createElement("div");
    layer.className = "p-spotlight";
    layer.setAttribute("aria-hidden", "true");
    document.body.insertBefore(layer, document.body.firstChild);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    // Cached bounds go stale when the page moves under the pointer.
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });

    // Honour the setting changing mid-session.
    var off = function () {
      if (!reduce.matches) return;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      if (layer) layer.remove();
    };
    if (reduce.addEventListener) reduce.addEventListener("change", off);
    else if (reduce.addListener) reduce.addListener(off);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
