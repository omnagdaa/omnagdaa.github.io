/* One-click light/dark switch for the navbar.
 *
 * Hextra resolves the theme to an explicit `light` or `dark` class on <html>
 * in a blocking head script, and persists the choice under the `color-theme`
 * localStorage key. This reuses both so the two never disagree — it reads the
 * live class rather than the stored value, which matters when the stored
 * value is "system" or absent.
 */
(function () {
  "use strict";

  var KEY = "color-theme";

  function current() {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }

  function apply(theme) {
    var root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {
      /* Private mode or blocked storage: the switch still works this session. */
    }
  }

  function init() {
    var buttons = document.querySelectorAll("[data-theme-switch]");
    if (!buttons.length) return;

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function () {
        apply(current() === "dark" ? "light" : "dark");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
