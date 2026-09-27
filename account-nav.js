/* ============================================================
   MENÚ DE CUENTA — todas las páginas
   Sin sesión: botón "Ingresar". Con sesión: inicial + nombre y un
   menú con perfil, pedidos, cotizaciones y cerrar sesión.
   Lee la sesión que guarda Supabase en el navegador; la validación
   real la hace mi-cuenta.html.
   ============================================================ */
(function () {
  "use strict";
  var slot = document.getElementById("navAccount");
  if (!slot) return;

  function readUser() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) {
          var t = JSON.parse(localStorage.getItem(k));
          return (t && t.user) || (t && t.currentSession && t.currentSession.user) || null;
        }
      }
    } catch (e) {}
    return null;
  }
  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  var user = readUser();
  if (!user) {
    if (/login\.html$/.test(location.pathname)) slot.classList.add("is-current");
    return;
  }
  var meta = user.user_metadata || {};
  var first = (meta.full_name || "").trim().split(/\s+/)[0] || (user.email || "").split("@")[0];
  var dd = document.createElement("details");
  dd.className = "nav-services rd-account-menu";
  dd.innerHTML =
    '<summary><span class="nav-user-dot">' + esc(first.charAt(0).toUpperCase()) + '</span><span class="rd-account-name">' + esc(first) + '</span></summary>' +
    '<div class="nav-services-menu"><div class="nav-services-group">' +
      '<span class="nav-services-group-label">' + esc(user.email || "") + '</span>' +
      '<a href="mi-cuenta.html#perfil"><strong>Mi perfil</strong><small>Mis datos y contacto</small></a>' +
      '<a href="mi-cuenta.html"><strong>Mis pedidos</strong><small>Seguimiento de importación</small></a>' +
      '<a href="mi-cuenta.html#cotizaciones"><strong>Mis cotizaciones</strong><small>Historial y estado</small></a>' +
      '<a href="mi-cuenta.html?logout=1"><strong>Cerrar sesión</strong><small>Salir de mi cuenta</small></a>' +
    '</div></div>';
  slot.replaceWith(dd);

  dd.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { dd.open = false; }); });
  var closeTimer = null;
  dd.addEventListener("mouseenter", function () { if (window.innerWidth <= 850) return; clearTimeout(closeTimer); dd.open = true; });
  dd.addEventListener("mouseleave", function () { if (window.innerWidth <= 850) return; closeTimer = setTimeout(function () { dd.open = false; }, 150); });
})();
