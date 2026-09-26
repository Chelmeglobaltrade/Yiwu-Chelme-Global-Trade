/* ============================================================
   SITE CHROME — header/footer compartido para páginas internas
   (asesoría, viajes, cursos, cómo funciona, legales).
   No depende de script.js (que solo corre en index.html).
   ============================================================ */
(function () {
  "use strict";
  var CONFIG = window.CHELME_CONFIG || {};
  function $(id) { return document.getElementById(id); }

  if (CONFIG.business) {
    document.querySelectorAll("[data-whatsapp-message]").forEach(function (a) {
      var msg = a.dataset.whatsappMessage || "";
      a.href = "https://wa.me/" + CONFIG.business.whatsapp + "?text=" + encodeURIComponent(msg);
    });
    document.querySelectorAll("[data-instagram-link]").forEach(function (a) { a.href = CONFIG.business.instagram; });
    document.querySelectorAll("[data-tiktok-link]").forEach(function (a) { a.href = CONFIG.business.tiktok; });
    document.querySelectorAll("[data-email-link]").forEach(function (a) {
      a.href = "mailto:" + CONFIG.business.email;
      if (!a.textContent.trim()) a.textContent = CONFIG.business.email;
    });
    document.querySelectorAll("[data-business-city]").forEach(function (e) { e.textContent = CONFIG.business.city; });
  }


  // Menú "Mi cuenta": si hay sesión guardada, muestra el nombre y accesos directos
  // (solo lectura del token local; la sesión real la valida mi-cuenta.html).
  (function accountMenu() {
    var raw = null;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) { raw = localStorage.getItem(k); break; }
      }
    } catch (e) { return; }
    if (!raw) return;
    var user = null;
    try { var t = JSON.parse(raw); user = (t && t.user) || (t && t.currentSession && t.currentSession.user); } catch (e) { return; }
    if (!user) return;
    var dd = null;
    document.querySelectorAll(".nav-services > summary").forEach(function (sm) {
      if (sm.textContent.trim() === "Mi cuenta") dd = sm.parentNode;
    });
    if (!dd) return;
    var meta = user.user_metadata || {};
    var name = (meta.full_name || "").trim().split(/\s+/)[0] || (user.email || "").split("@")[0];
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    dd.querySelector("summary").innerHTML = "<span class=\"nav-user-dot\">" + esc(name.charAt(0).toUpperCase()) + "</span> " + esc(name);
    dd.querySelector(".nav-services-group").innerHTML =
      "<a href=\"mi-cuenta.html#perfil\"><strong>Mi perfil</strong><small>Mis datos y contacto</small></a>" +
      "<a href=\"mi-cuenta.html\"><strong>Mis pedidos</strong><small>Seguimiento de importación</small></a>" +
      "<a href=\"mi-cuenta.html#cotizaciones\"><strong>Mis cotizaciones</strong><small>Historial y estado</small></a>" +
      "<a href=\"mi-cuenta.html?logout=1\"><strong>Cerrar sesión</strong><small>Salir de mi cuenta</small></a>";
  })();

  var toggle = $("menuToggle"), nav = $("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () { nav.classList.toggle("open"); });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }
  document.querySelectorAll(".nav-services").forEach(function (dd) {
    dd.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { dd.open = false; });
    });
    var closeTimer = null;
    dd.addEventListener("mouseenter", function () {
      if (window.innerWidth <= 850) return;
      clearTimeout(closeTimer);
      dd.open = true;
    });
    dd.addEventListener("mouseleave", function () {
      if (window.innerWidth <= 850) return;
      closeTimer = setTimeout(function () { dd.open = false; }, 150);
    });
  });
})();
