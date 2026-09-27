/* Página "Importar paso a paso": cambia entre "Ya tengo proveedor" y "Necesito proveedor". */
(function () {
  "use strict";
  var tabs = document.querySelectorAll(".pp-tab");
  if (!tabs.length) return;
  function select(key, focus) {
    tabs.forEach(function (t) {
      var on = t.dataset.pp === key;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      if (on) { panel.classList.remove("is-in"); void panel.offsetWidth; panel.classList.add("is-in"); if (focus) t.focus(); }
    });
    try { history.replaceState(null, "", key === "b" ? "#necesito-proveedor" : "#ya-tengo-proveedor"); } catch (e) {}
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t.dataset.pp); });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      select(next.dataset.pp, true);
    });
  });
  if (/necesito-proveedor/.test(location.hash)) select("b");
})();
